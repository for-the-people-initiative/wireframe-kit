/**
 * Design Token Build Script
 *
 * This script builds the layered design token system:
 * 1. Loads primitives (raw values - never consumed directly)
 * 2. Loads semantics (meaning-driven tokens - consumed by apps)
 * 3. Loads themes (override mappings)
 * 4. Resolves all references
 * 5. Validates completeness and no cycles
 * 6. Emits CSS, SCSS, and TypeScript outputs
 */

import { join } from 'path';
import { readdirSync } from 'fs';
import { loadTokenDirectory, loadTokenFile, deepMerge, TokenGroup } from './lib/load.js';
import { resolveReferences, flattenTokens } from './lib/resolve.js';
import { validateTokens } from './lib/validate.js';
import { emitBaseCss, emitThemeCss } from './lib/emit-css.js';
import { emitScss } from './lib/emit-scss.js';
import { emitTs } from './lib/emit-ts.js';

const ROOT = process.cwd();
const TOKENS_DIR = join(ROOT, 'tokens');
const DIST_DIR = join(ROOT, 'dist');

async function main() {
  console.log('Building design tokens...\n');

  // Step 1: Load primitives
  console.log('Loading primitives...');
  const primitives = loadTokenDirectory(join(TOKENS_DIR, 'primitives'));

  // Step 2: Load semantics
  console.log('Loading semantics...');
  const semantics = loadTokenDirectory(join(TOKENS_DIR, 'semantics'));

  // Step 3: Load components (optional layer)
  console.log('Loading components...');
  const components = loadTokenDirectory(join(TOKENS_DIR, 'components'));

  // Step 4: Build contract (semantics + components)
  // Contract = what apps are allowed to consume
  const contract = deepMerge(semantics, components);

  // Step 5: Load themes
  console.log('Loading themes...');
  const themesDir = join(TOKENS_DIR, 'themes');
  const themeFiles = readdirSync(themesDir).filter(f => f.endsWith('.json'));
  const themes = new Map<string, TokenGroup>();

  for (const file of themeFiles) {
    const themeName = file.replace('.json', '');
    const themeTokens = loadTokenFile(join(themesDir, file));
    themes.set(themeName, themeTokens);
  }

  // Step 6: Resolve references for base (light) theme
  console.log('\nResolving references...');
  const allTokens = deepMerge(primitives, contract);
  const resolvedContract = resolveReferences(contract, allTokens);

  // Step 7: Resolve each theme
  const resolvedThemes = new Map<string, TokenGroup>();
  for (const [themeName, themeOverrides] of themes) {
    // Skip light theme (it's the default)
    if (themeName === 'light') {
      resolvedThemes.set(themeName, resolvedContract);
      continue;
    }

    // Merge theme overrides with contract
    const themedContract = deepMerge(contract, themeOverrides);
    const resolved = resolveReferences(themedContract, allTokens);
    resolvedThemes.set(themeName, resolved);
  }

  // Step 8: Validate
  console.log('\nValidating...');
  const validation = validateTokens(resolvedContract, resolvedThemes, primitives);

  if (validation.warnings.length > 0) {
    console.log('\nWarnings:');
    validation.warnings.forEach(w => console.log(`  ⚠ ${w}`));
  }

  if (!validation.valid) {
    console.error('\nValidation errors:');
    validation.errors.forEach(e => console.error(`  ✗ ${e}`));
    process.exit(1);
  }

  console.log('✓ Validation passed\n');

  // Step 9: Emit outputs
  console.log('Emitting outputs...');

  // Flatten for output
  const flatContract = flattenTokens(resolvedContract);

  // Base CSS (default/light theme)
  emitBaseCss(flatContract, join(DIST_DIR, 'css', 'tokens.css'));

  // Theme CSS files
  for (const [themeName, themeTokens] of resolvedThemes) {
    if (themeName === 'light') continue; // Skip light, it's the base

    const flatTheme = flattenTokens(themeTokens);
    // Only emit tokens that differ from base
    const diffTokens = new Map<string, typeof flatContract extends Map<string, infer V> ? V : never>();
    for (const [path, token] of flatTheme) {
      const baseToken = flatContract.get(path);
      if (!baseToken || baseToken.value !== token.value) {
        diffTokens.set(path, token);
      }
    }

    if (diffTokens.size > 0) {
      emitThemeCss(diffTokens, themeName, join(DIST_DIR, 'css', `theme-${themeName}.css`));
    }
  }

  // SCSS wrappers
  emitScss(flatContract, join(DIST_DIR, 'scss', '_tokens.scss'));

  // TypeScript exports
  emitTs(flatContract, join(DIST_DIR, 'ts', 'tokens.ts'));

  console.log('\n✓ Build complete!');
}

main().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
