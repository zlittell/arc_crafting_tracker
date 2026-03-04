# Arc Craft Tracker

A crafting loadout planner for **Arc Raiders**. Select the gear you want (weapons, armor), choose a target upgrade rank, pick mods — and the app aggregates all required materials into a single shopping list so you know exactly what to farm.

## Running

```bash
bun install
bun run dev       # dev server at http://localhost:5173
bun run build     # production build → dist/
bun run preview   # preview the production build locally
```

> Requires [Bun](https://bun.sh). Install with `curl -fsSL https://bun.sh/install | bash`.

## How It Works

Select blueprints in the left panel, set target rank and desired mods, then read off your shopping list on the right. Toggle **Craftable / Raw Materials** in the header to control whether intermediate craftable materials are shown as-is or expanded to their base ingredients.

Collection tracking (the `−`/`+` counters) persists across page refreshes via `localStorage`.

## Architecture

```
src/
├── types/              # TypeScript interfaces
│   ├── material.ts     # Material, Ingredient, CraftRecipe
│   ├── blueprint.ts    # Blueprint, Rank
│   ├── mod.ts          # Mod
│   └── resolver.ts     # LoadoutSelection, ResolvedMaterial, ShoppingList
├── data/               # YAML game data (bundled at build time)
│   ├── weapons/        # One .yaml file per weapon blueprint
│   ├── armor/          # One .yaml file per armor blueprint
│   ├── mods/           # One .yaml file per mod (shared across blueprints)
│   └── materials/      # List files: mechanical.yaml, electronics.yaml, raw.yaml
├── lib/
│   ├── loader.ts       # import.meta.glob → typed registries (Map<id, T>)
│   ├── resolver.ts     # Aggregates ingredients for a loadout selection
│   └── utils.ts        # Rarity colors, groupBy, rank labels
└── components/
    ├── layout/         # Header (mode toggle), Layout (two-column shell)
    ├── selector/       # LoadoutSelector, CategorySection, BlueprintCard,
    │                   # RankSelector, ModSelector
    └── shopping/       # ShoppingList, MaterialGroup, MaterialRow
```

### Data flow

1. **Load**: `loader.ts` uses `import.meta.glob` to bundle all YAML files as raw strings at build time, then parses them with `js-yaml` into three registries: `BLUEPRINT_REGISTRY`, `MOD_REGISTRY`, `MATERIAL_REGISTRY`.
2. **Select**: User picks blueprints, target ranks (I–IV), and mods in the left panel. State is `LoadoutSelection[]` in `App.tsx`.
3. **Resolve**: `resolveShoppingList(selections, mode)` sums ingredient deltas for ranks 1..N plus all mod ingredients, optionally recursing into `craft_recipe` sub-ingredients for `raw` mode.
4. **Display**: `ShoppingList` groups results by rarity, `MaterialRow` shows totals with per-item collection counters.

### Adding blueprints / mods / materials

- **New blueprint**: add `src/data/weapons/<id>.yaml` or `src/data/armor/<id>.yaml` following the schema below. Ranks are **incremental delta costs** — each rank lists only the *new* ingredients needed on top of the previous rank.
- **New mod**: add `src/data/mods/<id>.yaml`.
- **New material**: append to the appropriate `src/data/materials/<category>.yaml` list.

No code changes required — the glob loaders pick up new files automatically.

#### Blueprint schema

```yaml
id: bobcat
name: Bobcat
category: weapon        # weapon | armor | tool
rarity: epic            # common | uncommon | rare | epic | legendary

ranks:
  - rank: 1
    label: "Bobcat I"
    ingredients:
      - material_id: light_gun_parts
        quantity: 3

compatible_mods:
  - extended_light_mag_i
```

#### Mod schema

```yaml
id: extended_light_mag_i
name: "Extended Light Mag I"
slot: light_mag
ingredients:
  - material_id: light_gun_parts
    quantity: 2
```

#### Material schema

```yaml
materials:
  - id: advanced_mechanical_components
    name: Advanced Mechanical Components
    rarity: rare
    category: mechanical
    craft_recipe:           # optional — enables craftable→raw expansion
      station: workbench
      ingredients:
        - material_id: light_gun_parts
          quantity: 3
```

## Deployment

A `vercel.json` is included for single-page app routing on Vercel. Deploy by pushing to a repo connected to Vercel, or run `vercel --prod` in the project root.
