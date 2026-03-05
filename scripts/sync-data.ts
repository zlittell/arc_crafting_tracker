/**
 * sync-data.ts
 * Reads all item JSON files from the arcraiders-data git submodule and
 * generates src/data/generated.ts — the single source of truth for the app.
 *
 * Run: npm run sync
 * Requires: data/arcraiders-data submodule to be initialised
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'data/arcraiders-data/items');
const OUTPUT_FILE = path.join(ROOT, 'src/data/generated.ts');

// ---------------------------------------------------------------------------
// Types (mirrors src/types/item.ts — keep in sync if that file changes)
// ---------------------------------------------------------------------------
interface Ingredient { material_id: string; quantity: number; }
interface UpgradeLevel { level: number; label?: string; ingredients: Ingredient[]; }
interface Item {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  ammo_type?: string;
  slot?: string;
  craft_recipe?: { ingredients: Ingredient[] };
  upgrades?: UpgradeLevel[];
}

// ---------------------------------------------------------------------------
// Source data shape
// ---------------------------------------------------------------------------
interface SourceItem {
  id: string;
  name?: Record<string, string>;
  type?: string;
  recipe?: Record<string, number>;
  upgradeCost?: Record<string, number>;
  craftQuantity?: number;
  modSlots?: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const WEAPON_TYPES = new Set([
  'SMG', 'Pistol', 'Hand Cannon', 'Assault Rifle', 'Battle Rifle',
  'LMG', 'Sniper Rifle', 'Shotgun', 'Special',
]);

const WEAPON_SUBCATEGORY: Record<string, string> = {
  'SMG': 'smg',
  'Pistol': 'pistol',
  'Hand Cannon': 'hand_cannon',
  'Assault Rifle': 'assault_rifle',
  'Battle Rifle': 'battle_rifle',
  'LMG': 'lmg',
  'Sniper Rifle': 'sniper_rifle',
  'Shotgun': 'shotgun',
  'Special': 'special',
};

const WEAPON_AMMO: Record<string, string> = {
  'SMG': 'light',
  'Pistol': 'light',
  'Hand Cannon': 'medium',
  'Assault Rifle': 'medium',
  'Battle Rifle': 'medium',
  'LMG': 'medium',
  'Sniper Rifle': 'heavy',
  'Shotgun': 'shotgun',
  'Special': 'launcher',
};

const TIER_SUFFIX = ['_i', '_ii', '_iii', '_iv'] as const;
const TIER_LEVEL: Record<string, number> = { '_i': 1, '_ii': 2, '_iii': 3, '_iv': 4 };

// Items whose type won't map to anything we care about
const SKIP_TYPES = new Set(['Blueprint', 'Trinket', 'Misc']);

// Quick Use items that are medical subcategory
const QUICK_USE_MEDICAL = new Set([
  'herbal_bandage', 'bandage', 'sterilized_bandage', 'adrenaline_shot',
  'vita_shot', 'vita_spray', 'defibrillator', 'shield_recharger', 'surge_shield_recharger',
]);

// Area prefixes for key subcategories
const KEY_AREAS = ['blue_gate', 'buried_city', 'dam', 'spaceport', 'stella_montis'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function nameEn(src: SourceItem): string {
  return src.name?.en ?? src.id;
}

function toIngredients(recipe: Record<string, number>): Ingredient[] {
  return Object.entries(recipe).map(([material_id, quantity]) => ({ material_id, quantity }));
}

function tierSuffix(id: string): string | null {
  for (const s of TIER_SUFFIX) if (id.endsWith(s)) return s;
  return null;
}

function stripTier(id: string): string {
  for (const s of TIER_SUFFIX) if (id.endsWith(s)) return id.slice(0, -s.length);
  return id;
}

function quickUseSubcategory(id: string): string {
  if (id.includes('_grenade') || id.endsWith('_nade')) return 'grenade';
  if (id.includes('_mine')) return 'mine';
  if (id.includes('_trap')) return 'trap';
  if (QUICK_USE_MEDICAL.has(id)) return 'medical';
  return 'utility';
}

function keySubcategory(id: string): string | undefined {
  if (id.includes('security_code')) return 'security_code';
  for (const area of KEY_AREAS) if (id.startsWith(area)) return area;
  return undefined;
}

function augmentSubcategory(displayName: string): string {
  const lower = displayName.toLowerCase();
  if (lower.startsWith('combat')) return 'combat';
  if (lower.startsWith('looting')) return 'looting';
  if (lower.startsWith('tactical')) return 'tactical';
  return lower.split(' ')[0];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Source directory not found: ${SOURCE_DIR}`);
    console.error('Run: git submodule update --init');
    process.exit(1);
  }

  const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.json'));
  const all: SourceItem[] = files.map(f =>
    JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, f), 'utf8')) as SourceItem
  );

  const relevant = all.filter(d => d.type && !SKIP_TYPES.has(d.type));

  // --- Pass 1: build mod slot map by inverting weapon modSlots ---
  const modSlotMap: Record<string, string> = {};
  for (const d of relevant) {
    if (WEAPON_TYPES.has(d.type!) && d.modSlots) {
      for (const [slot, modIds] of Object.entries(d.modSlots)) {
        for (const modId of modIds) modSlotMap[modId] = slot;
      }
    }
  }

  const items: Item[] = [];

  // --- Weapons ---
  const weaponFiles = relevant.filter(d => WEAPON_TYPES.has(d.type!));
  const tieredWeapons = weaponFiles.filter(d => tierSuffix(d.id) !== null);
  const singleTierWeapons = weaponFiles.filter(d => tierSuffix(d.id) === null);

  // Group multi-tier weapons by base ID
  const families: Record<string, SourceItem[]> = {};
  for (const d of tieredWeapons) {
    const base = stripTier(d.id);
    (families[base] ??= []).push(d);
  }

  for (const [baseId, tiers] of Object.entries(families)) {
    tiers.sort((a, b) => TIER_LEVEL[tierSuffix(a.id)!] - TIER_LEVEL[tierSuffix(b.id)!]);

    const t1 = tiers.find(t => tierSuffix(t.id) === '_i');
    const t2 = tiers.find(t => tierSuffix(t.id) === '_ii');
    const t3 = tiers.find(t => tierSuffix(t.id) === '_iii');
    const t4 = tiers.find(t => tierSuffix(t.id) === '_iv');
    if (!t1) continue;

    const upgrades: UpgradeLevel[] = [];

    if (t1.recipe) {
      upgrades.push({ level: 1, label: nameEn(t1), ingredients: toIngredients(t1.recipe) });
    }
    // upgradeCost on _i = cost to reach tier II; label = tier II name
    if (t1.upgradeCost && t2) {
      upgrades.push({ level: 2, label: nameEn(t2), ingredients: toIngredients(t1.upgradeCost) });
    }
    // upgradeCost on _ii = cost to reach tier III; label = tier III name
    if (t2?.upgradeCost && t3) {
      upgrades.push({ level: 3, label: nameEn(t3), ingredients: toIngredients(t2.upgradeCost) });
    }
    // upgradeCost on _iii = cost to reach tier IV; label = tier IV name
    if (t3?.upgradeCost && t4) {
      upgrades.push({ level: 4, label: nameEn(t4), ingredients: toIngredients(t3.upgradeCost) });
    }

    if (upgrades.length === 0) continue;

    items.push({
      id: baseId,
      name: nameEn(t1).replace(/ I$/, ''),
      category: 'weapon',
      subcategory: WEAPON_SUBCATEGORY[t1.type!],
      ammo_type: WEAPON_AMMO[t1.type!],
      upgrades,
    });
  }

  // Single-tier weapons (no upgrade path — legendary/exotic)
  for (const d of singleTierWeapons) {
    if (!d.recipe) continue;
    items.push({
      id: d.id,
      name: nameEn(d),
      category: 'weapon',
      subcategory: WEAPON_SUBCATEGORY[d.type!],
      ammo_type: WEAPON_AMMO[d.type!],
      upgrades: [{ level: 1, label: nameEn(d), ingredients: toIngredients(d.recipe) }],
    });
  }

  // --- Non-weapon items ---
  for (const d of relevant) {
    if (WEAPON_TYPES.has(d.type!)) continue; // already handled

    const n = nameEn(d);
    let item: Item | null = null;

    switch (d.type) {
      case 'Modification':
        item = {
          id: d.id, name: n, category: 'weapon_mod',
          slot: modSlotMap[d.id] ?? 'other',
          ...(d.recipe ? { craft_recipe: { ingredients: toIngredients(d.recipe) } } : {}),
        };
        break;

      case 'Shield':
        item = {
          id: d.id, name: n, category: 'shield',
          ...(d.recipe ? { craft_recipe: { ingredients: toIngredients(d.recipe) } } : {}),
        };
        break;

      case 'Augment':
        item = {
          id: d.id, name: n, category: 'augment',
          subcategory: augmentSubcategory(n),
          ...(d.recipe ? { craft_recipe: { ingredients: toIngredients(d.recipe) } } : {}),
        };
        break;

      case 'Ammunition': {
        const displayName = d.craftQuantity && d.craftQuantity > 1
          ? `${n} (×${d.craftQuantity})` : n;
        item = {
          id: d.id, name: displayName, category: 'ammunition',
          ...(d.recipe ? { craft_recipe: { ingredients: toIngredients(d.recipe) } } : {}),
        };
        break;
      }

      case 'Quick Use':
        item = {
          id: d.id, name: n, category: 'quick_use',
          subcategory: quickUseSubcategory(d.id),
          ...(d.recipe ? { craft_recipe: { ingredients: toIngredients(d.recipe) } } : {}),
        };
        break;

      case 'Key': {
        const sub = keySubcategory(d.id);
        item = {
          id: d.id, name: n, category: 'key',
          ...(sub ? { subcategory: sub } : {}),
        };
        break;
      }

      case 'Refined Material':
        item = {
          id: d.id, name: n, category: 'crafting_material',
          ...(d.recipe ? { craft_recipe: { ingredients: toIngredients(d.recipe) } } : {}),
        };
        break;

      case 'Topside Material':
      case 'Basic Material':
      case 'Nature':
      case 'Recyclable':
        // Gather-only materials — include in registry but no craft_recipe
        item = { id: d.id, name: n, category: 'crafting_material' };
        break;

      // Skip: Blueprint, Trinket, Misc (filtered above)
    }

    if (item) items.push(item);
  }

  // ---------------------------------------------------------------------------
  // Write output
  // ---------------------------------------------------------------------------
  const output = [
    `// AUTO-GENERATED — do not edit manually.`,
    `// Run \`npm run sync\` to regenerate from data/arcraiders-data/`,
    `import type { Item } from '../types/item';`,
    ``,
    `export const ALL_ITEMS: Item[] = ${JSON.stringify(items, null, 2)};`,
  ].join('\n');

  fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
  console.log(`✓ Generated ${items.length} items → src/data/generated.ts`);

  // Summary breakdown
  const counts: Record<string, number> = {};
  for (const item of items) counts[item.category] = (counts[item.category] ?? 0) + 1;
  for (const [cat, n] of Object.entries(counts).sort()) {
    console.log(`  ${cat.padEnd(20)} ${n}`);
  }
}

main();
