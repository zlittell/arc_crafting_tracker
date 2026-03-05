# Arc Raiders Crafting Tracker — Architecture

## Purpose

A browser-based supply list tool for Arc Raiders. The user picks which items they want to craft or upgrade, sets quantities and target levels, and gets a consolidated shopping list of raw materials to gather. It is not a progression manager — it does not track blueprints, station levels, or unlock status. That responsibility is on the player.

## Tech Stack

| Layer | Tool |
|---|---|
| UI framework | React 19 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Data | Git submodule (`data/arcraiders-data/`) → generated TypeScript (`src/data/generated.ts`) |
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

## Data Pipeline

Game data lives in [`data/arcraiders-data/`](../data/arcraiders-data/) as a git submodule tracking [RaidTheory/arcraiders-data](https://github.com/RaidTheory/arcraiders-data). The sync script reads those JSON files and emits typed TypeScript:

```text
data/arcraiders-data/items/*.json
        ↓  npm run sync  (scripts/sync-data.ts)
src/data/generated.ts   ← committed to repo, do not hand-edit
        ↓  import at build time
src/lib/loader.ts       → ITEM_REGISTRY (Map<id, Item>)
```

`src/data/generated.ts` is committed so that `npm run build` never requires the submodule. Run `npm run sync` after updating the submodule to regenerate it.

## Key Files

| File | Role |
| --- | --- |
| `scripts/sync-data.ts` | Reads submodule JSON → writes `src/data/generated.ts` |
| `src/data/generated.ts` | AUTO-GENERATED — all items as typed TypeScript exports |
| `src/lib/loader.ts` | Imports `generated.ts`, builds `ITEM_REGISTRY` (`Map<id, Item>`) |
| `src/lib/resolver.ts` | Computes the shopping list from selections |
| `src/lib/utils.ts` | `LEVEL_LABELS`, `groupBy`, `capitalize` |
| `src/types/item.ts` | Core `Item` type and related interfaces |
| `src/types/resolver.ts` | `CraftSelection`, `ShoppingList`, `ResolvedMaterial` |
| `src/App.tsx` | Root state: selections, modQuantities, collected counts |
| `src/components/selector/` | Left panel: item/mod pickers |
| `src/components/shopping/` | Right panel: material shopping list |

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

```text
App
├── Layout
│   ├── Header
│   ├── CraftSelector (left panel)
│   │   ├── CategorySection (per upgradeable category)
│   │   │   └── BlueprintCard (per weapon/item)
│   │   │       └── RankSelector
│   │   └── ModCard (per weapon mod)
│   └── ShoppingList (right panel)
│       └── MaterialGroup
│           └── MaterialRow
│               └── (inline refinery panel)
```

## Release & Deployment

Pushing a `release-v*.*.*` tag triggers `.github/workflows/deploy.yml`, which builds with Bun and deploys `dist/` to GitHub Pages.

```bash
bun run release 0.1.2   # creates tag release-v0.1.2 and pushes it
```

See [`scripts/release.sh`](../scripts/release.sh) for the tagging script.
