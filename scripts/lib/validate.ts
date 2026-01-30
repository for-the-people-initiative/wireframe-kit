import { TokenGroup, TokenValue, isTokenValue, isTokenGroup } from './load.js';
import { flattenTokens } from './resolve.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate the token system
 */
export function validateTokens(
  contract: TokenGroup,
  themes: Map<string, TokenGroup>,
  primitives: TokenGroup
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Get all contract token paths
  const contractTokens = flattenTokens(contract);

  // 1. Check for unresolved references in contract
  for (const [path, token] of contractTokens) {
    if (token.value.includes('{')) {
      errors.push(`Unresolved reference in contract token: ${path} = ${token.value}`);
    }
  }

  // 2. Check theme completeness
  for (const [themeName, themeTokens] of themes) {
    const flatTheme = flattenTokens(themeTokens);

    // Check that theme tokens resolve properly
    for (const [path, token] of flatTheme) {
      if (token.value.includes('{')) {
        errors.push(`Unresolved reference in theme "${themeName}": ${path} = ${token.value}`);
      }
    }
  }

  // 3. Check for cycles (basic check)
  const cycleCheck = detectCycles(contract, primitives);
  if (cycleCheck.length > 0) {
    errors.push(...cycleCheck.map(c => `Circular reference detected: ${c}`));
  }

  // 4. Naming convention warnings
  const badNames = checkNamingConventions(contract);
  warnings.push(...badNames);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Basic cycle detection in references
 */
function detectCycles(tokens: TokenGroup, primitives: TokenGroup): string[] {
  const cycles: string[] = [];
  const flat = flattenTokens(tokens);

  for (const [path, token] of flat) {
    const visited = new Set<string>();
    let current = token.value;

    while (current.includes('{')) {
      const match = current.match(/\{([^}]+)\}/);
      if (!match) break;

      const refPath = match[1];
      if (visited.has(refPath)) {
        cycles.push(`${path} -> ${refPath}`);
        break;
      }
      visited.add(refPath);

      // Try to resolve next step
      const refToken = flat.get(refPath);
      if (refToken) {
        current = refToken.value;
      } else {
        break;
      }
    }
  }

  return cycles;
}

/**
 * Check naming conventions and warn about non-semantic names
 */
function checkNamingConventions(tokens: TokenGroup): string[] {
  const warnings: string[] = [];

  // Patterns that suggest non-semantic naming at the semantic layer
  const badPatterns = ['primary', 'secondary', 'tertiary'];

  // Known component token prefixes (these have their own naming conventions)
  const componentPrefixes = ['avatar', 'button', 'input', 'card', 'modal', 'tooltip'];

  const flat = flattenTokens(tokens);

  for (const [path] of flat) {
    // Skip component tokens - they have valid component-specific naming
    const isComponentToken = componentPrefixes.some(prefix => path.startsWith(prefix + '.'));
    if (isComponentToken) continue;

    for (const pattern of badPatterns) {
      // Only warn if used at top level (not nested under intent/action)
      if (path.startsWith(pattern) || (path.includes(`.${pattern}.`) && !path.includes('intent.'))) {
        warnings.push(`Non-semantic token name detected: "${path}" - consider using intent-based naming`);
      }
    }
  }

  return warnings;
}

/**
 * Check that no primitive tokens leak into the public contract
 */
export function checkNoPrimitiveLeakage(
  contract: TokenGroup,
  primitiveKeys: Set<string>
): string[] {
  const errors: string[] = [];
  const flat = flattenTokens(contract);

  for (const [path] of flat) {
    const topLevel = path.split('.')[0];
    if (primitiveKeys.has(topLevel)) {
      errors.push(`Primitive token in public contract: ${path}`);
    }
  }

  return errors;
}
