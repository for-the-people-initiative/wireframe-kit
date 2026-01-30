const fs = require('fs');
const path = require('path');

const errors = fs.readFileSync('/tmp/ts-errors4.txt', 'utf8').trim().split('\n');
const BASE = '/home/claude/clawd/design-system';

// Group by file
const byFile = {};
for (const line of errors) {
  const match = line.match(/^(.+?\.vue)\((\d+),(\d+)\): error (TS\d+): (.+)/);
  if (!match) continue;
  const [, file, lineNo, col, code, msg] = match;
  if (!byFile[file]) byFile[file] = [];
  byFile[file].push({ line: parseInt(lineNo), col: parseInt(col), code, msg });
}

for (const [file, fileErrors] of Object.entries(byFile)) {
  const fullPath = path.join(BASE, file);
  let content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  let changed = false;

  // Sort errors by line desc, col desc so we replace from end to start
  const sortedErrors = [...fileErrors].sort((a, b) => b.line - a.line || b.col - a.col);

  for (const err of sortedErrors) {
    const lineIdx = err.line - 1;
    let line = lines[lineIdx];
    if (!line) continue;

    // TS7006: Parameter implicitly has 'any' type
    if (err.code === 'TS7006' || err.code === 'TS7031') {
      const paramMatch = err.msg.match(/(Parameter|Binding element) '(\w+)' implicitly has an 'any' type/);
      if (paramMatch) {
        const param = paramMatch[2];
        const col = err.col - 1;
        const before = line.substring(0, col);
        const after = line.substring(col);
        
        if (after.startsWith(param)) {
          const afterParam = after.substring(param.length);
          if (!afterParam.match(/^\s*:/)) {
            lines[lineIdx] = before + param + ': any' + afterParam;
            changed = true;
          }
        }
      }
    }

    // TS7034: Variable implicitly has type 'any' / 'any[]'
    if (err.code === 'TS7034') {
      const varMatch = err.msg.match(/Variable '(\w+)' implicitly has type '(any\[\]|any)'/);
      if (varMatch) {
        const varName = varMatch[1];
        const varType = varMatch[2];
        // Find declaration: let varName; or let varName =
        const declRegex = new RegExp(`(let\\s+${varName})\\s*;`);
        const m = line.match(declRegex);
        if (m) {
          if (varType === 'any[]') {
            lines[lineIdx] = line.replace(declRegex, `$1: any[] = [];`);
          } else {
            lines[lineIdx] = line.replace(declRegex, `$1: any = null;`);
          }
          changed = true;
        }
      }
    }

    // TS18047: possibly null - add non-null assertion or optional chaining
    // Skip these for now - they need case-by-case handling

    // TS18046: is of type 'unknown' - need type assertion
    // Skip for now
  }

  if (changed) {
    fs.writeFileSync(fullPath, lines.join('\n'));
    console.log(`Fixed ${file}`);
  }
}
