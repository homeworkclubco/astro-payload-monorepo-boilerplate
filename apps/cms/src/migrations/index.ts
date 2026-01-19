import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260118_164230_create_pages from './20260118_164230_create_pages';
import * as migration_20260119_095205_add_api_keys from './20260119_095205_add_api_keys';
import * as migration_20260119_123634_add_seo_plugin from './20260119_123634_add_seo_plugin';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260118_164230_create_pages.up,
    down: migration_20260118_164230_create_pages.down,
    name: '20260118_164230_create_pages',
  },
  {
    up: migration_20260119_095205_add_api_keys.up,
    down: migration_20260119_095205_add_api_keys.down,
    name: '20260119_095205_add_api_keys',
  },
  {
    up: migration_20260119_123634_add_seo_plugin.up,
    down: migration_20260119_123634_add_seo_plugin.down,
    name: '20260119_123634_add_seo_plugin'
  },
];
