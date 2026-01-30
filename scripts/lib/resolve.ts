import { TokenGroup, TokenValue, isTokenValue, isTokenGroup } from './load.js';

/**
 * Resolve all token references in a token dictionary
 * References are in format: {path.to.token}
 */
export function resolveReferences(
  tokens: TokenGroup,
  allTokens: TokenGroup
): TokenGroup {
  const result: TokenGroup = {};

  for (const key of Object.keys(tokens)) {
    const value = tokens[key];

    if (isTokenValue(value)) {
      result[key] = {
        ...value,
        value: resolveValue(value.value, allTokens),
      };
    } else if (isTokenGroup(value)) {
      result[key] = resolveReferences(value, allTokens);
    }
  }

  return result;
}

/**
 * Resolve a single value string, replacing references
 */
function resolveValue(value: string, allTokens: TokenGroup): string {
  // Handle non-string values (convert to string)
  if (typeof value !== 'string') {
    return String(value);
  }

  // Match {token.path} references
  const refPattern = /\{([^}]+)\}/g;

  return value.replace(refPattern, (match, path) => {
    const resolved = getTokenValue(path, allTokens);
    if (resolved === undefined) {
      console.warn(`Unresolved reference: ${match}`);
      return match;
    }
    // Recursively resolve if the resolved value also contains references
    if (resolved.includes('{')) {
      return resolveValue(resolved, allTokens);
    }
    return resolved;
  });
}

/**
 * Get a token value by dot-path (e.g., "neutral.500")
 */
function getTokenValue(path: string, tokens: TokenGroup): string | undefined {
  const parts = path.split('.');
  let current: TokenGroup | TokenValue = tokens;

  for (const part of parts) {
    if (isTokenValue(current)) {
      return undefined;
    }
    if (!(part in current)) {
      return undefined;
    }
    current = current[part] as TokenGroup | TokenValue;
  }

  if (isTokenValue(current)) {
    return current.value;
  }

  return undefined;
}

/**
 * Flatten a nested token structure into dot-path keys
 * Returns only leaf tokens (those with 'value')
 */
export function flattenTokens(
  tokens: TokenGroup,
  prefix = ''
): Map<string, TokenValue> {
  const result = new Map<string, TokenValue>();

  for (const key of Object.keys(tokens)) {
    // Skip metadata keys
    if (key.startsWith('$')) continue;

    const value = tokens[key];
    const path = prefix ? `${prefix}.${key}` : key;

    if (isTokenValue(value)) {
      result.set(path, value);
    } else if (isTokenGroup(value)) {
      const nested = flattenTokens(value, path);
      for (const [k, v] of nested) {
        result.set(k, v);
      }
    }
  }

  return result;
}

/**
 * Convert a token path to CSS variable name
 * e.g., "surface.canvas" -> "surface-canvas"
 */
export function tokenPathToCssVar(path: string): string {
  return path.replace(/\./g, '-');
}
