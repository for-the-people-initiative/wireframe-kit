import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

export interface TokenValue {
  value: string;
  type?: string;
  description?: string;
}

export type TokenGroup = {
  [key: string]: TokenValue | TokenGroup;
};

/**
 * Load a single JSON token file
 */
export function loadTokenFile(filepath: string): TokenGroup {
  if (!existsSync(filepath)) {
    console.warn(`Token file not found: ${filepath}`);
    return {};
  }
  const content = readFileSync(filepath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Load all JSON files from a directory and merge them
 * @param namespace - if true, wrap each file's content under a key matching the filename
 */
export function loadTokenDirectory(dirPath: string, namespace = false): TokenGroup {
  if (!existsSync(dirPath)) {
    console.warn(`Token directory not found: ${dirPath}`);
    return {};
  }

  const files = readdirSync(dirPath).filter(f => f.endsWith('.json'));
  let merged: TokenGroup = {};

  for (const file of files) {
    const tokens = loadTokenFile(join(dirPath, file));

    if (namespace) {
      // Wrap under filename (without .json)
      const name = file.replace('.json', '');
      merged = deepMerge(merged, { [name]: tokens });
    } else {
      merged = deepMerge(merged, tokens);
    }
  }

  return merged;
}

/**
 * Deep merge two token objects
 */
export function deepMerge(target: TokenGroup, source: TokenGroup): TokenGroup {
  const result: TokenGroup = { ...target };

  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = result[key];

    // Skip metadata keys
    if (key.startsWith('$')) continue;

    if (isTokenValue(sourceVal)) {
      result[key] = sourceVal;
    } else if (isTokenGroup(sourceVal)) {
      if (isTokenGroup(targetVal)) {
        result[key] = deepMerge(targetVal, sourceVal);
      } else {
        result[key] = sourceVal;
      }
    }
  }

  return result;
}

/**
 * Check if value is a token leaf node (has 'value' property with a string value)
 */
export function isTokenValue(obj: unknown): obj is TokenValue {
  return typeof obj === 'object' && obj !== null && 'value' in obj && typeof (obj as TokenValue).value === 'string';
}

/**
 * Check if value is a token group (nested object that is not a token leaf)
 */
export function isTokenGroup(obj: unknown): obj is TokenGroup {
  return typeof obj === 'object' && obj !== null && !isTokenValue(obj);
}
