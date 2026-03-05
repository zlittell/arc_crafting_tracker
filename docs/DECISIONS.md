# Arc Crafting Tracker — Design Decisions

## ADR-001: Single unified `Item` type

**Decision:** All game entities (weapons, mods, augments, ammo, shields, materials, keys) are represented by one `Item` interface, discriminated by field presence (`upgrades[]` vs `craft_recipe` vs neither).

**Rejected alternatives:**
- Separate types per entity class (Blueprint, Weapon, Mod, Material) — created unnecessary mapping overhead and made the loader complex with multiple registries
- Discriminated union with a `kind` field — more TypeScript overhead with no practical benefit for this app's needs

**Rationale:** The game's entities differ only in which optional fields they use. A flat type keeps the loader, resolver, and components simple. Field presence naturally communicates semantics:
- Has `upgrades[]` → weapon (shown in selector with level picker)
- Has `craft_recipe` → craftable item (shown in shopping list with ingredient expansion)
- Has neither → gather-only material or key

---

## ADR-002: Game data sourced from community submodule, compiled to TypeScript

**Decision:** Item data lives in `data/arcraiders-data/` as a git submodule ([RaidTheory/arcraiders-data](https://github.com/RaidTheory/arcraiders-data)). A dev-time script (`scripts/sync-data.ts`) reads those JSON files and writes `src/data/generated.ts`, which is committed to the repo. The loader imports the generated file at build time.

**Rejected alternatives:**
- Hand-maintaining item data in `src/data/` — unsustainable as game content grows; community dataset is more accurate and better maintained
- Fetching data at runtime from an API — adds a network dependency, latency, and requires a backend; this app is intentionally static

**Rationale:** Committing `generated.ts` keeps the build fully self-contained (no submodule required at CI/build time) while still letting maintainers pull fresh game data on demand via `npm run sync`. The community dataset handles the accuracy burden.

---

## ADR-003: No blueprint tracking

**Decision:** The tracker does not know or care whether an item is blueprint-locked. There is no `blueprint_required` field.

**Rationale:** This tool is a supply list focuser, not a progression manager. The user is responsible for knowing which items they've unlocked. Adding blueprint state would require tracking unlock status (another persistence concern) for no benefit to the core use case.

---

## ADR-004: No station level requirements

**Decision:** Items do not store which hideout station level is required to craft them.

**Rationale:** Same as ADR-003. The user knows their station level. Surfacing station requirements would add complexity and UI noise without helping the core task of calculating material quantities.

---

## ADR-005: Batch ammo names encode quantity

**Decision:** Ammunition items whose craft recipes yield a batch include the batch size in the display name, e.g. `"Light Ammo (×25)"`.

**Rejected alternatives:**
- `craft_quantity` field on the item + resolver math — more schema complexity for a small gain
- Separate "ammo box" items — unnecessary abstraction

**Rationale:** The shopping list operates in "number of items to craft" units. Including the batch size in the name gives the user the context they need without changing the data model.

---

## ADR-006: Augment Mk3 variants are separate items

**Decision:** `combat_mk3_aggressive` and `combat_mk3_flanking` are two distinct items rather than variants or sub-types of `combat_mk3`.

**Rationale:** They exist as separate craftable items in the game, with independent recipe costs. The user may want to track them independently (craft one variant, not both). The `subcategory` field can group them visually in the UI if needed.

---

## ADR-007: Compatible mods dropped from Item type

**Decision:** The `compatible_mods` field was removed from the `Item` type entirely.

**History:** Earlier iterations had a weapon card UI where mods were selected within the weapon's card, requiring a compatible mods list to know which mods were valid choices.

**Rationale:** The current UI has mods as independent items in the selector panel. Any mod can be selected regardless of weapon. This is more flexible and removes a maintenance burden (keeping compatible lists accurate). If weapon-mod compatibility UI is revisited, the field can be re-added.

---

## ADR-008: `generated.ts` committed to repo, not produced at build time

**Decision:** `src/data/generated.ts` is checked into the repository. The CI build (`npm run build`) does not run the sync script and does not require the submodule.

**Rejected alternatives:**

- Generate at CI build time — requires the submodule to be checked out in CI, adds a step to every build, and means a broken upstream submodule can silently break deploys

**Rationale:** Treating generated data as a committed artifact separates two concerns: keeping data current (a maintainer decision, done locally via `npm run sync`) vs. building and deploying (fully deterministic from committed source). A stale `generated.ts` is a content problem, not a build problem.

---

## ADR-009: `'craftable'` resolution mode as default

**Decision:** The shopping list defaults to `'craftable'` mode — materials that have a `craft_recipe` are shown as end targets rather than expanded to their base ingredients.

**Rationale:** In Arc Raiders, "refined" materials (e.g., Mechanical Components, Advanced Arc Powercell) are station outputs with their own inventory slot. Players track them as items in their stash and often have them on hand. Treating them as stops in the supply chain (rather than expanding them) gives the most actionable shopping list.

The `MaterialRow` component shows a collapsible inline panel with the refinery recipe for any craftable material, giving the user the information without cluttering the main list.
