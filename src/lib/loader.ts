import yaml from 'js-yaml';
import type { Blueprint } from '../types/blueprint';
import type { Mod } from '../types/mod';
import type { Material } from '../types/material';

const blueprintModules = import.meta.glob('../data/{weapons,armor,tools}/**/*.yaml', { eager: true, query: '?raw', import: 'default' });
const modModules = import.meta.glob('../data/mods/**/*.yaml', { eager: true, query: '?raw', import: 'default' });
const materialModules = import.meta.glob('../data/materials/**/*.yaml', { eager: true, query: '?raw', import: 'default' });

function loadBlueprints(): Map<string, Blueprint> {
  const registry = new Map<string, Blueprint>();
  for (const [, raw] of Object.entries(blueprintModules)) {
    const parsed = yaml.load(raw as string) as Blueprint;
    if (parsed?.id) {
      registry.set(parsed.id, parsed);
    }
  }
  return registry;
}

function loadMods(): Map<string, Mod> {
  const registry = new Map<string, Mod>();
  for (const [, raw] of Object.entries(modModules)) {
    const parsed = yaml.load(raw as string) as Mod;
    if (parsed?.id) {
      registry.set(parsed.id, parsed);
    }
  }
  return registry;
}

interface MaterialFileContent {
  materials: Material[];
}

function loadMaterials(): Map<string, Material> {
  const registry = new Map<string, Material>();
  for (const [, raw] of Object.entries(materialModules)) {
    const parsed = yaml.load(raw as string) as MaterialFileContent;
    if (parsed?.materials) {
      for (const material of parsed.materials) {
        registry.set(material.id, material);
      }
    }
  }
  return registry;
}

export const BLUEPRINT_REGISTRY: Map<string, Blueprint> = loadBlueprints();
export const MOD_REGISTRY: Map<string, Mod> = loadMods();
export const MATERIAL_REGISTRY: Map<string, Material> = loadMaterials();
