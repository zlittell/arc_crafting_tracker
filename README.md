# Arc Craft Tracker

A crafting loadout planner for **Arc Raiders**. Select the gear you want (weapons, shields, augments, mods), choose a target upgrade rank, and the app aggregates all required materials into a single shopping list so you know exactly what to farm.

## Running

```bash
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview the production build locally
```

## Keeping item data up to date

Item data is sourced from the [arcraiders-data](https://github.com/RaidTheory/arcraiders-data) community dataset, included as a git submodule at `data/arcraiders-data/`. A sync script reads those JSON files and generates `src/data/generated.ts` — the single source of truth for the app.

```bash
# Pull the latest game data
git submodule update --remote data/arcraiders-data

# Regenerate src/data/generated.ts
npm run sync
```

`src/data/generated.ts` is committed to the repo so normal builds never require the submodule or the sync script.

### First-time setup (after cloning)

```bash
git submodule update --init
npm install
npm run sync      # only needed if generated.ts is out of date
npm run dev
```

## How It Works

Select blueprints in the left panel, set a target upgrade rank, pick mods, then read off your shopping list on the right. Each material row shows:

- Total quantity needed across your whole loadout
- A `−`/`+` counter to track what you've collected
- An expand arrow (▶) for craftable materials to reveal the refinery recipe, with per-ingredient collect controls
- Click the material name to see which loadout items require it

**Expand recipes** (top-right of the shopping list) opens all refinery recipes at once.

Collection tracking persists across page refreshes via `localStorage`.

## Architecture

```text
data/
└── arcraiders-data/        # git submodule — RaidTheory/arcraiders-data

scripts/
└── sync-data.ts            # reads submodule JSON → writes src/data/generated.ts

src/
├── types/
│   ├── item.ts             # Item, Ingredient, UpgradeLevel
│   └── resolver.ts         # LoadoutSelection, ResolvedMaterial, ShoppingList
├── data/
│   └── generated.ts        # AUTO-GENERATED — do not edit. Run: npm run sync
├── lib/
│   ├── loader.ts           # imports generated.ts → ITEM_REGISTRY (Map<id, Item>)
│   ├── resolver.ts         # aggregates ingredients for a loadout selection
│   └── utils.ts            # groupBy, capitalize
└── components/
    ├── layout/             # Header, Layout (two-column shell)
    ├── selector/           # LoadoutSelector, CategorySection, ItemCard, ModCard
    └── shopping/           # ShoppingList, MaterialGroup, MaterialRow
```

### Data flow

1. **Sync** (`npm run sync`): `scripts/sync-data.ts` reads all `*.json` files from `data/arcraiders-data/items/`, maps them to `Item[]`, and writes `src/data/generated.ts`.
2. **Load**: `loader.ts` imports `ALL_ITEMS` from `generated.ts` and builds `ITEM_REGISTRY` (a `Map<id, Item>`).
3. **Select**: User picks items and target upgrade levels in the left panel. State is `LoadoutSelection[]` in `App.tsx`, persisted to `localStorage`.
4. **Resolve**: `resolveShoppingList(selections)` sums ingredient costs across all selected upgrade levels and mods.
5. **Display**: `ShoppingList` groups results into Gather / Craft sections; `MaterialRow` shows totals with collection counters and expandable refinery recipes.

## Deployment

A `vercel.json` is included for single-page app routing on Vercel. Deploy by pushing to a repo connected to Vercel, or run `vercel --prod` in the project root.

## Data Attribution

Item data provided by the [arcraiders-data](https://github.com/RaidTheory/arcraiders-data) project, used under the [MIT License](https://github.com/RaidTheory/arcraiders-data/blob/main/LICENSE). Copyright (c) 2025 RaidTheory.

Arc Raiders is developed by [Embark Studios](https://www.embark-studios.com/). This tool is an unofficial fan project and is not affiliated with or endorsed by Embark Studios.
