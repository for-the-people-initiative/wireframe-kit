const fs = require('fs');
const path = require('path');

// Read all error lines
const errors = fs.readFileSync('/tmp/ts-errors.txt', 'utf8').trim().split('\n');

// Group errors by file
const byFile = {};
for (const line of errors) {
  const match = line.match(/^(.+?\.vue)\((\d+),(\d+)\): error (TS\d+): (.+)/);
  if (!match) continue;
  const [, file, lineNo, col, code, msg] = match;
  if (!byFile[file]) byFile[file] = [];
  byFile[file].push({ line: parseInt(lineNo), col: parseInt(col), code, msg });
}

console.log(`Files with errors: ${Object.keys(byFile).length}`);
console.log(`Total errors: ${errors.length}`);

// For each file, we need to read it and apply fixes
for (const [file, fileErrors] of Object.entries(byFile)) {
  const fullPath = path.join('/home/claude/clawd/design-system', file);
  let content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  
  // Track what we've changed
  let changed = false;
  
  for (const err of fileErrors) {
    const lineIdx = err.line - 1;
    const line = lines[lineIdx];
    if (!line) continue;
    
    // TS7006: Parameter implicitly has 'any' type
    if (err.code === 'TS7006') {
      const paramMatch = err.msg.match(/Parameter '(\w+)' implicitly has an 'any' type/);
      if (paramMatch) {
        const param = paramMatch[1];
        // Determine type based on parameter name
        let type = 'any';
        if (param === 'event' || param === 'e') {
          // Check context for more specific event type
          if (line.includes('Mouse') || line.includes('click') || line.includes('Click')) type = 'MouseEvent';
          else if (line.includes('Key') || line.includes('key') || line.includes('Keydown') || line.includes('keydown')) type = 'KeyboardEvent';
          else if (line.includes('Focus') || line.includes('focus') || line.includes('onFocus')) type = 'FocusEvent';
          else if (line.includes('Blur') || line.includes('blur') || line.includes('onBlur')) type = 'FocusEvent';
          else type = 'Event';
        }
        
        // Replace the parameter - be careful with word boundaries
        // Match param name that's followed by ) or , or = (no type annotation)
        const col = err.col - 1;
        // Find the parameter at the exact column
        const before = line.substring(0, col);
        const after = line.substring(col);
        
        // Check if this param already has a type annotation
        const afterParam = after.substring(param.length);
        if (!afterParam.match(/^\s*:/)) {
          // No type annotation, add one
          // But check for destructuring pattern
          if (after.startsWith(param)) {
            lines[lineIdx] = before + param + ': ' + type + afterParam;
            changed = true;
          }
        }
      }
    }
    
    // TS7031: Binding element implicitly has 'any' type
    if (err.code === 'TS7031') {
      const paramMatch = err.msg.match(/Binding element '(\w+)' implicitly has an 'any' type/);
      if (paramMatch) {
        const param = paramMatch[1];
        const col = err.col - 1;
        const before = line.substring(0, col);
        const after = line.substring(col);
        const afterParam = after.substring(param.length);
        if (!afterParam.match(/^\s*:/) && after.startsWith(param)) {
          lines[lineIdx] = before + param + ': any' + afterParam;
          changed = true;
        }
      }
    }
  }
  
  if (changed) {
    fs.writeFileSync(fullPath, lines.join('\n'));
    console.log(`Fixed TS7006/TS7031 in ${file}`);
  }
}
