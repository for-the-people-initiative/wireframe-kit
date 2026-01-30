const fs = require('fs');
const path = require('path');

// Read all errors
const errors = fs.readFileSync('/tmp/ts-errors2.txt', 'utf8').trim().split('\n');

// Group by file
const byFile = {};
for (const line of errors) {
  const match = line.match(/^(.+?\.vue)\((\d+),(\d+)\): error (TS\d+): (.+)/);
  if (!match) continue;
  const [, file, lineNo, col, code, msg] = match;
  if (!byFile[file]) byFile[file] = [];
  byFile[file].push({ line: parseInt(lineNo), col: parseInt(col), code, msg });
}

// For each file, find ref() declarations that need typing
for (const [file, fileErrors] of Object.entries(byFile)) {
  const fullPath = path.join('/home/claude/clawd/design-system', file);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Find all ref() with 'never' type issues - these need ref<Type>(value) 
  // Strategy: find lines with `ref(null)` or `ref([])` or `ref({})` and add generic types
  
  // For refs that are used with DOM properties (focus, blur, getBoundingClientRect, etc.)
  // they need ref<HTMLElement | null>(null)
  
  // For refs used with arrays, need ref<any[]>([])
  
  // Let's identify which refs have 'never' issues by looking at the error properties
  const neverRefs = new Set();
  const refProperties = {};
  
  for (const err of fileErrors) {
    if (err.code === 'TS2339' && err.msg.includes("type 'never'")) {
      // Find which ref variable this refers to
      const lines = content.split('\n');
      const errLine = lines[err.line - 1];
      // Try to extract the ref variable name (e.g., "inputRef.value.focus" -> "inputRef")
      const refMatch = errLine.match(/(\w+)\.value\./);
      if (refMatch) {
        neverRefs.add(refMatch[1]);
        if (!refProperties[refMatch[1]]) refProperties[refMatch[1]] = [];
        const propMatch = err.msg.match(/Property '(\w+)'/);
        if (propMatch) refProperties[refMatch[1]].push(propMatch[1]);
      }
    }
  }
  
  if (neverRefs.size === 0) continue;
  
  let changed = false;
  const lines = content.split('\n');
  
  for (const refName of neverRefs) {
    const props = refProperties[refName] || [];
    const isDom = props.some(p => ['focus', 'blur', 'click', 'select', 'getBoundingClientRect', 'contains', 
      'classList', 'style', 'innerHTML', 'scrollTop', 'scrollLeft', 'scrollHeight', 'scrollWidth',
      'clientHeight', 'clientWidth', 'offsetWidth', 'offsetLeft', 'querySelectorAll', 'querySelector',
      'setAttribute', 'setSelectionRange', 'selectionStart', 'getContext', 'width', 'height',
      'scrollTo'].includes(p));
    const isArray = props.some(p => ['push', 'filter', 'map', 'forEach', 'some', 'find', 'length',
      'id', 'severity', 'closable', 'summary', 'detail', 'life', 'group', 'text', 'response',
      'disabled', 'header', 'name', 'size', 'items'].includes(p));
    
    // Find the ref declaration line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Match patterns like: const refName = ref(null) or const refName = ref([]) or const refName = ref({})
      const refDeclRegex = new RegExp(`(const\\s+${refName}\\s*=\\s*ref)\\(([^)]*?)\\)`);
      const m = line.match(refDeclRegex);
      if (m) {
        const initValue = m[2].trim();
        let type;
        
        if (initValue === 'null') {
          if (isDom) {
            // Check if it's a canvas
            if (props.includes('getContext') || props.includes('width') || props.includes('height')) {
              type = 'HTMLCanvasElement | null';
            } else if (props.includes('innerHTML')) {
              type = 'HTMLElement | null';
            } else if (props.includes('selectionStart') || props.includes('setSelectionRange')) {
              type = 'HTMLInputElement | null';
            } else {
              type = 'HTMLElement | null';
            }
          } else {
            type = 'any';
          }
        } else if (initValue === '[]') {
          type = 'any[]';
        } else if (initValue === '{}') {
          type = 'Record<string, any>';
        } else {
          continue; // Skip complex init values
        }
        
        lines[i] = line.replace(refDeclRegex, `$1<${type}>($2)`);
        changed = true;
        break;
      }
    }
  }
  
  if (changed) {
    fs.writeFileSync(fullPath, lines.join('\n'));
    console.log(`Fixed ref types in ${file}: ${[...neverRefs].join(', ')}`);
  }
}
