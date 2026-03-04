# Arc Crafting Tracker — Architecture

## Purpose

A browser-based supply list tool for Arc Raiders. The user picks which items they want to craft or upgrade, sets quantities and target levels, and gets a consolidated shopping list of raw materials to gather. It is not a progression manager — it does not track blueprints, station levels, or unlock status. That responsibility is on the player.

## Tech Stack

| Layer | Tool |
|---|---|
| UI framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Data format | YAML (parsed at build time via `js-yaml` + Vite glob import) |
| Schema validation | JSON Schema draft-07 (VS Code YAML extension) |
| Persistence | `localStorage` (collected material counts only) |

## Data Model

Everything in the game is represented as a single `Item` type (see [`src/types/item.ts`](../src/types/item.ts)). Items are discriminated by field presence:

- Items with `upgrades[]` — weapons; selectable with a target level picker
- Items with `craft_recipe` — directly craftable (mods, augments, ammo, quick use, refined materials)
- Items with both — not currently present in Arc Raiders data but the schema supports it
- Items with neither — gathered-only materials or keys

```typescript
interface Item {
  id: string;           // snake_case, matches the data file identifier
  name: string;         // display name shown in the UI
  category: ItemCategory;
  subcategory?: string; // optional finer grouping (e.g. "smg", "grenade")
  ammo_type?: string;   // for weapons: "light" | "medium" | "heavy" | "shotgun" | "launcher" | "energy_clip"
  slot?: string;        // for weapon_mods: the slot they occupy
  craft_recipe?: { ingredients: Ingredient[] };
  upgrades?: UpgradeLevel[];  // level 1 = craft cost, level 2+ = upgrade cost to reach that level
}
```

### Categories

```
weapon | shield | augment | ammunition | weapon_mod | quick_use | key | crafting_material | misc
```

### Upgrade levels

Weapons have 4 upgrade levels (I–IV). The `upgrades` array entries map as:
- `level: 1` — cost to **craft** the weapon at rank I
- `level: 2` — cost to **upgrade** from I to II
- `level: 3` — cost to **upgrade** from II to III
- `level: 4` — cost to **upgrade** from III to IV

The resolver accumulates all level costs up to and including the selected target level. Setting target level to 3 costs Level 1 craft + Level 2 upgrade + Level 3 upgrade.

## Data Files

All game data lives in [`src/data/`](../src/data/). Two file formats are supported:

### Single-item files
One YAML file per item. Used for individual weapons.
```yaml
# yaml-language-server: $schema=../schemas/item.schema.json
id: bobcat
name: Bobcat
category: weapon
upgrades:
  - level: 1
    ingredients: [...]
```

### List files
One YAML file per category containing all items of that type. Used for mods, augments, ammo, quick use, keys, and materials.
```yaml
# yaml-language-server: $schema=../schemas/item-list.schema.json
category: weapon_mod
items:
  - id: compensator_i
    name: Compensator I
    slot: muzzle
    craft_recipe:
      ingredients: [...]
```

The legacy `materials.yaml` uses a `materials:` key instead of `items:` — both are supported by the loader.

## Key Files

| File | Role |
|---|---|
| `src/lib/loader.ts` | Reads all YAML files at build time, populates `ITEM_REGISTRY` |
| `src/lib/resolver.ts` | Computes the shopping list from selections |
| `src/lib/utils.ts` | `LEVEL_LABELS`, `groupBy`, `capitalize` |
| `src/types/item.ts` | Core `Item` type and related interfaces |
| `src/types/resolver.ts` | `LoadoutSelection`, `ShoppingList`, `ResolvedMaterial` |
| `src/App.tsx` | Root state: selections, modQuantities, collected counts |
| `src/components/selector/` | Left panel: item/mod pickers |
| `src/components/shopping/` | Right panel: material shopping list |
| `src/schemas/` | JSON Schema files for YAML validation |

## Shopping List Resolution

`resolveShoppingList(selections, modQuantities, mode)` in `src/lib/resolver.ts`:

1. For each selected weapon: sums ingredient costs for all upgrade levels 1 through `target_level`, multiplied by `quantity`
2. For each selected mod: sums `craft_recipe.ingredients` multiplied by `quantity`
3. Aggregates all materials, tracking which items each material came from (`sources`)
4. Two resolution modes:
   - `'craftable'` — stops at materials that have a `craft_recipe` (shows them as craftable, not expanded)
   - `'raw'` — recursively expands all craft_recipes down to base gather-only materials

The UI currently uses `'craftable'` mode. The `MaterialRow` component lets users expand a craftable material to see its refinery recipe inline.

## Component Tree

```
App
├── Layout
│   ├── Header
│   ├── LoadoutSelector (left panel)
│   │   ├── CategorySection (per upgradeable category)
│   │   │   └── ItemCard (per weapon)
│   │   │       └── RankSelector
│   │   └── ModCard (per weapon mod)
│   └── ShoppingList (right panel)
│       └── MaterialGroup
│           └── MaterialRow
│               └── (inline refinery panel)
```

## Schemas

Three JSON Schema files for VS Code YAML validation:
- `item.schema.json` — validates single-item YAML files
- `item-list.schema.json` — validates category list files (`items:` key)
- `materials-list.schema.json` — legacy schema for `materials.yaml` (`materials:` key)

See [`.vscode/settings.json`](../.vscode/settings.json) for file-to-schema associations.
