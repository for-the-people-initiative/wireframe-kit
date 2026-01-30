const fs = require('fs');
const path = require('path');
const BASE = '/home/claude/clawd/design-system';
function r(f) { return fs.readFileSync(path.join(BASE, f), 'utf8'); }
function w(f, c) { fs.writeFileSync(path.join(BASE, f), c); console.log(`  ${f}`); }

// InputOtp: tokens still 'never[]' issue
{
  let c = r('src/components/InputOtp/InputOtp.vue');
  // Check current tokens ref type
  const m = c.match(/const tokens = ref(<[^>]+>)?\(\[\]\)/);
  console.log('InputOtp tokens:', m ? m[0] : 'not found');
  // If it's ref([]) without type, fix it
  if (!c.includes('ref<string[]>([])')) {
    c = c.replace('const tokens = ref([])', 'const tokens = ref<string[]>([])');
  }
  // Also check inputRefs
  if (!c.includes('ref<(HTMLInputElement | null)[]>')) {
    c = c.replace('const inputRefs = ref([])', 'const inputRefs = ref<(HTMLInputElement | null)[]>([])');
  }
  w('src/components/InputOtp/InputOtp.vue', c);
}

// Splitter: panelRefs/gutterRefs/panelSizes still never[]
{
  let c = r('src/components/Splitter/Splitter.vue');
  console.log('Splitter refs:', 
    c.includes('ref<number[]>') ? 'has number[]' : 'missing number[]',
    c.includes('ref<(HTMLElement') ? 'has HTMLElement' : 'missing HTMLElement'
  );
  // Force the types
  c = c.replace(/const panelRefs = ref\([^)]*\)/, 'const panelRefs = ref<(HTMLElement | null)[]>([])');
  c = c.replace(/const gutterRefs = ref\([^)]*\)/, 'const gutterRefs = ref<(HTMLElement | null)[]>([])');
  c = c.replace(/const panelSizes = ref\([^)]*\)/, 'const panelSizes = ref<number[]>([])');
  // Fix null push to gutterRefs
  c = c.replace('gutterRefs.value.push(null)', 'gutterRefs.value.push(null as any)');
  // Fix parseFloat(string | null)
  c = c.replace(
    "parseFloat(panelRefs.value[index]?.getAttribute('data-size') || '0')",
    "parseFloat(panelRefs.value[index]?.getAttribute('data-size') ?? '0')"
  );
  if (c.includes("getAttribute('data-size'))") && !c.includes("|| '0')") && !c.includes("?? '0')")) {
    c = c.replace(
      /parseFloat\(panelRefs\.value\[index\]\?\.getAttribute\('data-size'\)\)/g,
      "parseFloat(panelRefs.value[index]?.getAttribute('data-size') ?? '0')"
    );
  }
  w('src/components/Splitter/Splitter.vue', c);
}

// ContextMenu: triggerElement assignment
{
  let c = r('src/components/ContextMenu/ContextMenu.vue');
  // Check current
  const lines = c.split('\n');
  let found = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('triggerElement.value = event.target') && !lines[i].includes('as HTMLElement')) {
      lines[i] = lines[i].replace('event.target', 'event.target as HTMLElement');
      found = true;
    }
  }
  if (found) { c = lines.join('\n'); }
  w('src/components/ContextMenu/ContextMenu.vue', c);
}

// Menu: fix event type issues
{
  let c = r('src/components/Menu/Menu.vue');
  // show needs Event, not MouseEvent (since it's called with KeyboardEvent too)
  c = c.replace('const show = (event: Event)', 'const show = (event: any)');
  c = c.replace('const show = (event: MouseEvent)', 'const show = (event: any)');
  c = c.replace('const positionMenu = (event: any)', 'const positionMenu = (event: any)');
  // target.value assignment
  const lines = c.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('target.value = event.target') && !lines[i].includes('as HTMLElement') && !lines[i].includes('as any')) {
      lines[i] = lines[i].replace('event.target', 'event.target as any');
    }
  }
  c = lines.join('\n');
  // Fix .contains call
  c = c.replace('.contains(event.target as Node)', '.contains(event.target as Node)');
  w('src/components/Menu/Menu.vue', c);
}

// Tooltip: triggerElement assignment
{
  let c = r('src/components/Tooltip/Tooltip.vue');
  if (!c.includes('event.target as HTMLElement')) {
    c = c.replace('triggerElement = event.target;', 'triggerElement = event.target as HTMLElement;');
  }
  w('src/components/Tooltip/Tooltip.vue', c);
}

// VirtualScroller: h() style types and ScrollBehavior
{
  let c = r('src/components/VirtualScroller/VirtualScroller.vue');
  // The h() function with inline styles has issues with CSSProperties types
  // Fix: cast style objects
  // Actually let me check what the current code looks like
  console.log('VS behavior:', c.includes("as ScrollBehavior") ? 'has cast' : 'missing cast');
  // The issue is that behavior: 'smooth' produces type 'string' not ScrollBehavior
  // My previous fix may not have matched because the actual code might be different
  // Let me check the actual lines
  const lines = c.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("behavior:") && lines[i].includes("'smooth'") && !lines[i].includes('as ScrollBehavior')) {
      lines[i] = lines[i].replace("'smooth'", "'smooth' as ScrollBehavior");
    }
    if (lines[i].includes("behavior:") && lines[i].includes("'auto'") && !lines[i].includes('as ScrollBehavior')) {
      lines[i] = lines[i].replace("'auto'", "'auto' as ScrollBehavior");
    }
  }
  c = lines.join('\n');
  w('src/components/VirtualScroller/VirtualScroller.vue', c);
}

// DataTable: sortOrder
{
  let c = r('src/components/DataTable/DataTable.vue');
  // Check actual line 212
  const lines = c.split('\n');
  console.log('DT line 211:', lines[211]?.trim());
  // Force fix
  c = c.replace(
    /sortOrder\.value = sortOrder\.value \* -1/g,
    'sortOrder.value = (sortOrder.value * -1) as 1 | -1'
  );
  c = c.replace(
    /sortOrder\.value = -sortOrder\.value/,
    'sortOrder.value = (-sortOrder.value) as 1 | -1'
  );
  w('src/components/DataTable/DataTable.vue', c);
}

// Carousel: autoplayInterval number->null
{
  let c = r('src/components/Carousel/Carousel.vue');
  // Find the ref
  console.log('Carousel autoplay:', c.match(/const autoplay\w+ = ref/g));
  // The issue is assigning setInterval result to ref(null) 
  c = c.replace(/const autoplayTimer = ref\(null\)/, 'const autoplayTimer = ref<ReturnType<typeof setInterval> | null>(null)');
  w('src/components/Carousel/Carousel.vue', c);
}

// TieredMenu: event passed as MouseEvent/Event
{
  let c = r('src/components/TieredMenu/TieredMenu.vue');
  // Line 165: Argument of type 'Event' not assignable to 'MouseEvent'
  // Fix: change show to accept any
  c = c.replace('const show = (event: MouseEvent)', 'const show = (event: any)');
  // Line 171: .contains(event.target) - still needs Node
  if (c.includes('.contains(event.target)')) {
    c = c.replace('.contains(event.target)', '.contains(event.target as Node)');
  }
  w('src/components/TieredMenu/TieredMenu.vue', c);
}

// TabMenu: onItemClick needs Event|KeyboardEvent
{
  let c = r('src/components/TabMenu/TabMenu.vue');
  c = c.replace(
    'const onItemClick = (event: Event | KeyboardEvent',
    'const onItemClick = (event: any'
  );
  c = c.replace(
    'const onItemClick = (event: Event',
    'const onItemClick = (event: any'
  );
  w('src/components/TabMenu/TabMenu.vue', c);
}

// ScrollTop: parentElement type  
{
  let c = r('src/components/ScrollTop/ScrollTop.vue');
  // Change $el.parentElement to cast
  c = c.replace('$el.parentElement', '($el.parentElement as HTMLElement)');
  w('src/components/ScrollTop/ScrollTop.vue', c);
}

// TreeSelect: selectedLabels push any -> never
{
  let c = r('src/components/TreeSelect/TreeSelect.vue');
  if (!c.includes('ref<any[]>([])')) {
    c = c.replace('const selectedLabels = ref([])', 'const selectedLabels = ref<any[]>([])');
  }
  w('src/components/TreeSelect/TreeSelect.vue', c);
}

// Timeline: getColor parameter is event:any but template passes TimelineEvent
// The issue is in template, not script. Check:
{
  let c = r('src/components/Timeline/Timeline.vue');
  // The template does @click="$emit('select', event)" where event is loop var
  // And getColor(event) where event is TimelineEvent
  // The types/index.ts probably has TimelineEvent != Event
  // Check if the getConnectorColor uses color property
  console.log('Timeline getColor:', c.match(/getColor.*\{[\s\S]*?\}/m)?.[0]?.substring(0, 200));
  w('src/components/Timeline/Timeline.vue', c);
}

// InputMask: pos null issue
{
  let c = r('src/components/InputMask/InputMask.vue');
  // pos is number | null, needs non-null assertion
  // Line 174: Type 'number | null' not assignable to 'number'
  // Find and add !
  const lines = c.split('\n');
  for (let i = 170; i < 200 && i < lines.length; i++) {
    // Check for `pos` assignments where pos is nullable
    if (lines[i] && lines[i].match(/= pos$/) && !lines[i].includes('pos!')) {
      lines[i] = lines[i].replace(/= pos$/, '= pos!');
    }
  }
  c = lines.join('\n');
  w('src/components/InputMask/InputMask.vue', c);
}

// Template-level issues that are hard to fix without changing templates:
// - :key="{}" issues (Dock, MegaMenu, PanelMenu, TabMenu) - need template changes
// - Style type issues in h() (ScrollPanel, SpeedDial, VirtualScroller) - need type casts in render
// - null vs undefined (Image, ImageCompare, FileUpload, Textarea, OrganizationChart) - need prop type changes
// - 'unknown' type in v-for (MenuBar, PanelMenu, TieredMenu, TieredMenuSub) - template type widening

// For these remaining ~50 template-level errors, let me use @ts-ignore approach
// Actually, better to fix the types

// Fix prop defaults from null to undefined
{
  let c = r('src/types/index.ts');
  // Many props default to null but HTML attrs expect undefined
  // This is a common Vue issue
  w('src/types/index.ts', c);
}

// Editor: execCommand args
{
  let c = r('src/components/Editor/Editor.vue');
  // Check actual lines
  const lines = c.split('\n');
  console.log('Editor 172:', lines[171]?.trim());
  console.log('Editor 181:', lines[180]?.trim());
  // My previous fix may not have matched
  // execCommand(command, false, null) -> undefined
  c = c.replace(/execCommand\(command, false, null\)/g, 'execCommand(command, false, undefined)');
  // execCommand('createLink', false, url) -> url is string, 3rd arg expects string | undefined
  // Wait, the error says string not assignable to null | undefined
  // So the overload might be different. Use as any
  c = c.replace(/execCommand\('createLink', false, url\)/g, "execCommand('createLink', false, url as any)");
  w('src/components/Editor/Editor.vue', c);
}

console.log('\nDone!');
