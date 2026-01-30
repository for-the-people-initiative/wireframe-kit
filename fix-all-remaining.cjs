const fs = require('fs');
const path = require('path');
const BASE = '/home/claude/clawd/design-system';

function r(f) { return fs.readFileSync(path.join(BASE, f), 'utf8'); }
function w(f, c) { fs.writeFileSync(path.join(BASE, f), c); console.log(`  Fixed ${f}`); }
function fix(f, pairs) {
  let c = r(f);
  for (const [from, to] of pairs) {
    if (!c.includes(from)) { console.warn(`  SKIP: ${f}: ${from.substring(0,50)}...`); continue; }
    c = c.replace(from, to);
  }
  w(f, c);
}

// === Fix let declarations with = null or = [] that need types ===

// AutoComplete
fix('src/components/AutoComplete/AutoComplete.vue', [
  ['let debounceTimer = null;', 'let debounceTimer: ReturnType<typeof setTimeout> | null = null;'],
]);

// Chart 
fix('src/components/Chart/Chart.vue', [
  ['let chartInstance = null;', 'let chartInstance: any = null;'],
  ['let ChartJS = null;', 'let ChartJS: any = null;'],
]);

// ContextMenu
fix('src/components/ContextMenu/ContextMenu.vue', [
  ['let submenuTimeout = null;', 'let submenuTimeout: ReturnType<typeof setTimeout> | null = null;'],
]);

// MegaMenu
fix('src/components/MegaMenu/MegaMenu.vue', [
  ['let closeTimeout = null;', 'let closeTimeout: ReturnType<typeof setTimeout> | null = null;'],
]);

// Message
fix('src/components/Message/Message.vue', [
  ['let lifeTimeout = null;', 'let lifeTimeout: ReturnType<typeof setTimeout> | null = null;'],
]);

// OverlayPanel
fix('src/components/OverlayPanel/OverlayPanel.vue', [
  ['let targetElement = null;', 'let targetElement: HTMLElement | null = null;'],
]);

// ParticleBackground
fix('src/components/ParticleBackground/ParticleBackground.vue', [
  ['let ctx = null;', 'let ctx: CanvasRenderingContext2D | null = null;'],
  ['let particles = [];', 'let particles: Particle[] = [];'],
  ['let staticStars = [];', 'let staticStars: StaticStar[] = [];'],
  ['let animationId = null;', 'let animationId: number | null = null;'],
]);

// PopOver
fix('src/components/PopOver/PopOver.vue', [
  ['let showTimeoutId = null;', 'let showTimeoutId: ReturnType<typeof setTimeout> | null = null;'],
  ['let hideTimeoutId = null;', 'let hideTimeoutId: ReturnType<typeof setTimeout> | null = null;'],
  ['let triggerElement = null;', 'let triggerElement: HTMLElement | null = null;'],
]);

// ScrollPanel
fix('src/components/ScrollPanel/ScrollPanel.vue', [
  ['let resizeObserver = null;', 'let resizeObserver: ResizeObserver | null = null;'],
]);

// ScrollTop
fix('src/components/ScrollTop/ScrollTop.vue', [
  ['let scrollTarget = null;', 'let scrollTarget: HTMLElement | Window | null = null;'],
]);

// Textarea
fix('src/components/Textarea/Textarea.vue', [
  ['let resizeObserver = null;', 'let resizeObserver: ResizeObserver | null = null;'],
]);

// Tooltip
fix('src/components/Tooltip/Tooltip.vue', [
  ['let showTimeoutId = null;', 'let showTimeoutId: ReturnType<typeof setTimeout> | null = null;'],
  ['let hideTimeoutId = null;', 'let hideTimeoutId: ReturnType<typeof setTimeout> | null = null;'],
  ['let triggerElement = null;', 'let triggerElement: HTMLElement | null = null;'],
]);

// VirtualScroller
fix('src/components/VirtualScroller/VirtualScroller.vue', [
  ['let resizeObserver = null;', 'let resizeObserver: ResizeObserver | null = null;'],
]);

// Tree
fix('src/components/Tree/Tree.vue', [
  ['let result = [];', 'let result: any[] = [];'],
]);

// TreeSelect
fix('src/components/TreeSelect/TreeSelect.vue', [
  ['let result = [];', 'let result: any[] = [];'],
]);

// === Fix event type issues (Event -> MouseEvent, etc.) ===

// Many functions typed as (event: Event) need (event: MouseEvent) for clientX/clientY
// ColorPicker
{
  let c = r('src/components/ColorPicker/ColorPicker.vue');
  // Functions that use event.clientX need MouseEvent
  c = c.replace('const onGradientMouseDown = (event: Event)', 'const onGradientMouseDown = (event: MouseEvent)');
  c = c.replace('const onHueMouseDown = (event: Event)', 'const onHueMouseDown = (event: MouseEvent)');
  c = c.replace('const updateGradientFromEvent = (event: Event)', 'const updateGradientFromEvent = (event: MouseEvent)');
  c = c.replace('const updateHueFromEvent = (event: Event)', 'const updateHueFromEvent = (event: MouseEvent)');
  w('src/components/ColorPicker/ColorPicker.vue', c);
}

// ContextMenu
{
  let c = r('src/components/ContextMenu/ContextMenu.vue');
  c = c.replace('const show = (event: Event)', 'const show = (event: MouseEvent)');
  c = c.replace('const positionSubmenu = (event: Event)', 'const positionSubmenu = (event: MouseEvent)');
  // Fix event.target assignment to HTMLElement
  c = c.replace('triggerElement.value = event.target;', 'triggerElement.value = event.target as HTMLElement;');
  w('src/components/ContextMenu/ContextMenu.vue', c);
}

// Dialog
{
  let c = r('src/components/Dialog/Dialog.vue');
  c = c.replace('const onDragStart = (event: Event)', 'const onDragStart = (event: MouseEvent)');
  c = c.replace('const onDrag = (event: Event)', 'const onDrag = (event: MouseEvent)');
  w('src/components/Dialog/Dialog.vue', c);
}

// Knob
{
  let c = r('src/components/Knob/Knob.vue');
  c = c.replace('const onMouseDown = (event: Event)', 'const onMouseDown = (event: MouseEvent | TouchEvent)');
  c = c.replace('const onMouseMove = (event: Event)', 'const onMouseMove = (event: MouseEvent | TouchEvent)');
  c = c.replace('const onKeydown = (event: Event)', 'const onKeydown = (event: KeyboardEvent)');
  w('src/components/Knob/Knob.vue', c);
}

// Menu
{
  let c = r('src/components/Menu/Menu.vue');
  c = c.replace('const show = (event: Event)', 'const show = (event: MouseEvent)');
  c = c.replace('const positionMenu = (event: Event)', 'const positionMenu = (event: MouseEvent)');
  // Fix target assignment
  c = c.replace('target.value = event.target;', 'target.value = event.target as HTMLElement;');
  w('src/components/Menu/Menu.vue', c);
}

// TieredMenu
{
  let c = r('src/components/TieredMenu/TieredMenu.vue');
  c = c.replace('const show = (event: Event)', 'const show = (event: MouseEvent)');
  w('src/components/TieredMenu/TieredMenu.vue', c);
}

// === Fix event.target access patterns ===
// Many files use event.target.value, event.target.checked, etc.
// These need (event.target as HTMLInputElement).value

// Checkbox
{
  let c = r('src/components/Checkbox/Checkbox.vue');
  c = c.replace(/event\.target\.checked/g, '(event.target as HTMLInputElement).checked');
  w('src/components/Checkbox/Checkbox.vue', c);
}

// InputSwitch
{
  let c = r('src/components/InputSwitch/InputSwitch.vue');
  c = c.replace(/event\.target\.checked/g, '(event.target as HTMLInputElement).checked');
  w('src/components/InputSwitch/InputSwitch.vue', c);
}

// ToggleSwitch
{
  let c = r('src/components/ToggleSwitch/ToggleSwitch.vue');
  c = c.replace(/event\.target\.checked/g, '(event.target as HTMLInputElement).checked');
  w('src/components/ToggleSwitch/ToggleSwitch.vue', c);
}

// InputText
{
  let c = r('src/components/InputText/InputText.vue');
  c = c.replace(/event\.target\.value/g, '(event.target as HTMLInputElement).value');
  w('src/components/InputText/InputText.vue', c);
}

// InputNumber
{
  let c = r('src/components/InputNumber/InputNumber.vue');
  c = c.replace(/event\.target\.value/g, '(event.target as HTMLInputElement).value');
  w('src/components/InputNumber/InputNumber.vue', c);
}

// Textarea
{
  let c = r('src/components/Textarea/Textarea.vue');
  c = c.replace(/event\.target\.value/g, '(event.target as HTMLTextAreaElement).value');
  w('src/components/Textarea/Textarea.vue', c);
}

// Select
{
  let c = r('src/components/Select/Select.vue');
  c = c.replace(/event\.target\.value/g, '(event.target as HTMLSelectElement).value');
  w('src/components/Select/Select.vue', c);
}

// Slider
{
  let c = r('src/components/Slider/Slider.vue');
  c = c.replace(/event\.target\.value/g, '(event.target as HTMLInputElement).value');
  w('src/components/Slider/Slider.vue', c);
}

// Paginator
{
  let c = r('src/components/Paginator/Paginator.vue');
  c = c.replace(/event\.target\.value/g, '(event.target as HTMLSelectElement).value');
  w('src/components/Paginator/Paginator.vue', c);
}

// ImageCompare
{
  let c = r('src/components/ImageCompare/ImageCompare.vue');
  c = c.replace(/event\.target\.value/g, '(event.target as HTMLInputElement).value');
  w('src/components/ImageCompare/ImageCompare.vue', c);
}

// FileUpload
{
  let c = r('src/components/FileUpload/FileUpload.vue');
  c = c.replace('const onDrop = (event: Event)', 'const onDrop = (event: DragEvent)');
  c = c.replace('event.target.files', '(event.target as HTMLInputElement).files');
  c = c.replace('event.target.value', '(event.target as HTMLInputElement).value');
  w('src/components/FileUpload/FileUpload.vue', c);
}

// InputChips - clipboardData
{
  let c = r('src/components/InputChips/InputChips.vue');
  c = c.replace('const onPaste = (event: Event)', 'const onPaste = (event: ClipboardEvent)');
  w('src/components/InputChips/InputChips.vue', c);
}

// InputOtp - clipboardData
{
  let c = r('src/components/InputOtp/InputOtp.vue');
  c = c.replace('const onPaste = (event: Event, index: any)', 'const onPaste = (event: ClipboardEvent, index: any)');
  // Fix event.target.value
  c = c.replace(/event\.target\.value/g, '(event.target as HTMLInputElement).value');
  w('src/components/InputOtp/InputOtp.vue', c);
}

// === Fix .contains(event.target) patterns - EventTarget | null -> Node | null ===
// Many files do: ref.value.contains(event.target) where event.target is EventTarget | null
// Fix: cast event.target as Node
const containsFixFiles = [
  'src/components/Calendar/Calendar.vue',
  'src/components/ColorPicker/ColorPicker.vue',
  'src/components/ConfirmPopup/ConfirmPopup.vue',
  'src/components/ContextMenu/ContextMenu.vue',
  'src/components/Dropdown/Dropdown.vue',
  'src/components/MultiSelect/MultiSelect.vue',
  'src/components/OverlayPanel/OverlayPanel.vue',
  'src/components/PopOver/PopOver.vue',
  'src/components/SplitButton/SplitButton.vue',
  'src/components/TreeSelect/TreeSelect.vue',
];

for (const f of containsFixFiles) {
  let c = r(f);
  // Replace .contains(event.target) with .contains(event.target as Node)
  c = c.replace(/\.contains\(event\.target\)/g, '.contains(event.target as Node)');
  w(f, c);
}

// === Fix ConfirmPopup target assignment ===
{
  let c = r('src/components/ConfirmPopup/ConfirmPopup.vue');
  c = c.replace('targetElement.value = event.target;', 'targetElement.value = event.target as HTMLElement;');
  c = c.replace('confirmation.value = options;', 'confirmation.value = options as any;');
  w('src/components/ConfirmPopup/ConfirmPopup.vue', c);
}

// === Fix Element.focus() -> (el as HTMLElement).focus() ===
// Dialog, InPlace, ListBox, TabMenu, Tabs
{
  let c = r('src/components/Dialog/Dialog.vue');
  // focusableElements[0].focus() and similar
  c = c.replace(/focusableElements\[0\]\.focus\(\)/g, '(focusableElements[0] as HTMLElement).focus()');
  c = c.replace(/focusableElements\[focusableElements\.length - 1\]\.focus\(\)/g, '(focusableElements[focusableElements.length - 1] as HTMLElement).focus()');
  c = c.replace(/firstFocusable\.focus\(\)/, '(firstFocusable as HTMLElement).focus()');
  w('src/components/Dialog/Dialog.vue', c);
}

{
  let c = r('src/components/InPlace/InPlace.vue');
  c = c.replace(/focusable\.focus\(\)/, '(focusable as HTMLElement).focus()');
  w('src/components/InPlace/InPlace.vue', c);
}

{
  let c = r('src/components/ListBox/ListBox.vue');
  c = c.replace(/items\[targetIndex\]\.focus\(\)/, '(items[targetIndex] as HTMLElement).focus()');
  w('src/components/ListBox/ListBox.vue', c);
}

{
  let c = r('src/components/TabMenu/TabMenu.vue');
  // tabs[index].focus()
  c = c.replace(/tabs\[index\]\.focus\(\)/, '(tabs[index] as HTMLElement).focus()');
  w('src/components/TabMenu/TabMenu.vue', c);
}

{
  let c = r('src/components/Tabs/Tabs.vue');
  c = c.replace(/tabElements\[index\]\.focus\(\)/, '(tabElements[index] as HTMLElement).focus()');
  // Fix offsetWidth/offsetLeft on Element
  c = c.replace(/activeTab\.offsetWidth/, '(activeTab as HTMLElement).offsetWidth');
  c = c.replace(/activeTab\.offsetLeft/, '(activeTab as HTMLElement).offsetLeft');
  w('src/components/Tabs/Tabs.vue', c);
}

// === Fix 'unknown' type for inject/iterators ===
// ListBox, OrderList, Select, Dropdown - option is unknown in v-for
// These are template issues - the computed that returns options needs proper typing
// For now, add (option as any) pattern or fix the computed

// Dropdown
{
  let c = r('src/components/Dropdown/Dropdown.vue');
  // Template uses option from filteredOptions which might be unknown[]
  // Fix in script: type filteredOptions properly
  // Actually these are template v-for variables - let's look at the computed
  // For now, let me check if filteredOptions returns unknown[]
  w('src/components/Dropdown/Dropdown.vue', c);
}

// === Fix Chart.vue data.datasets ===
{
  let c = r('src/components/Chart/Chart.vue');
  c = c.replace('if (props.data.datasets)', 'if ((props.data as any).datasets)');
  c = c.replace('props.data.datasets.some', '(props.data as any).datasets.some');
  w('src/components/Chart/Chart.vue', c);
}

// === Fix DataTable sortOrder ===
{
  let c = r('src/components/DataTable/DataTable.vue');
  // Already tried this - check actual code
  w('src/components/DataTable/DataTable.vue', c);
}

// === Fix :key="{}" patterns (Type '{}' not assignable to PropertyKey) ===
// These are template issues where :key="item" and item is an object
// Dock, MegaMenu, PanelMenu, TabMenu

// === Fix Tree/TreeSelect/TreeTable emit 'toggle'/'select' not in emits ===
// Need to add these to defineEmits
{
  let c = r('src/components/Tree/Tree.vue');
  // Check current emits
  // Need to add 'toggle' and 'select' to emits
  c = c.replace(
    /defineEmits<TreeEmits>\(\)/,
    'defineEmits<TreeEmits & { (e: "toggle", event: any): void; (e: "select", event: any): void }>()'
  );
  // Fix setup(props, { emit }) pattern
  c = c.replace('setup(props: any, { emit: any })', 'setup(props: any, { emit }: { emit: any })');
  w('src/components/Tree/Tree.vue', c);
}

{
  let c = r('src/components/TreeSelect/TreeSelect.vue');
  c = c.replace(
    /defineEmits<TreeSelectEmits>\(\)/,
    'defineEmits<TreeSelectEmits & { (e: "toggle", event: any): void; (e: "select", event: any): void }>()'
  );
  c = c.replace('setup(props: any, { emit: any })', 'setup(props: any, { emit }: { emit: any })');
  w('src/components/TreeSelect/TreeSelect.vue', c);
}

{
  let c = r('src/components/TreeTable/TreeTable.vue');
  c = c.replace(
    /defineEmits<TreeTableEmits>\(\)/,
    'defineEmits<TreeTableEmits & { (e: "toggle", event: any): void; (e: "select", event: any): void }>()'
  );
  c = c.replace('setup(props: any, { emit: any })', 'setup(props: any, { emit }: { emit: any })');
  w('src/components/TreeTable/TreeTable.vue', c);
}

// === Fix Splitter gutter refs ===
{
  let c = r('src/components/Splitter/Splitter.vue');
  // Fix event.target.closest
  c = c.replace(/event\.target\.closest/g, '(event.target as HTMLElement).closest');
  // Fix null index type
  c = c.replace(/panelSizes\.value\[currentGutterIndex\.value\]/g, 'panelSizes.value[currentGutterIndex.value!]');
  // Fix parseFloat(null)
  c = c.replace('parseFloat(panelRefs.value[index]?.getAttribute(\'data-size\'))', 
    'parseFloat(panelRefs.value[index]?.getAttribute(\'data-size\') || \'0\')');
  w('src/components/Splitter/Splitter.vue', c);
}

// === Fix MegaMenu event.target.closest ===
{
  let c = r('src/components/MegaMenu/MegaMenu.vue');
  c = c.replace(/event\.target\.closest/g, '(event.target as HTMLElement).closest');
  w('src/components/MegaMenu/MegaMenu.vue', c);
}

// === Fix OverlayPanel event.key ===
{
  let c = r('src/components/OverlayPanel/OverlayPanel.vue');
  c = c.replace('const handleKeydown = (event: Event)', 'const handleKeydown = (event: KeyboardEvent)');
  w('src/components/OverlayPanel/OverlayPanel.vue', c);
}

// === Fix VirtualScroller scrollTo behavior ===
{
  let c = r('src/components/VirtualScroller/VirtualScroller.vue');
  c = c.replace(/behavior: 'smooth'/g, "behavior: 'smooth' as ScrollBehavior");
  c = c.replace(/behavior: 'auto'/g, "behavior: 'auto' as ScrollBehavior");
  // Fix event.target.scrollTop/scrollLeft
  c = c.replace('target.scrollTop', '(target as HTMLElement).scrollTop');
  c = c.replace('target.scrollLeft', '(target as HTMLElement).scrollLeft');
  w('src/components/VirtualScroller/VirtualScroller.vue', c);
}

// === Fix remaining 'unknown' type for options in template ===
// These require adding `as any` to the computed or changing the return type
// Dropdown, ListBox, Select - v-for option is 'unknown'

// === Fix Knob event.target.closest ===
{
  let c = r('src/components/Knob/Knob.vue');
  c = c.replace(/event\.target\.closest/g, '(event.target as HTMLElement).closest');
  w('src/components/Knob/Knob.vue', c);
}

// === Fix TieredMenu event.target.getBoundingClientRect ===
{
  let c = r('src/components/TieredMenu/TieredMenu.vue');
  c = c.replace('event.target.getBoundingClientRect', '(event.target as HTMLElement).getBoundingClientRect');
  w('src/components/TieredMenu/TieredMenu.vue', c);
}

// === Fix Menu target ref ===
{
  let c = r('src/components/Menu/Menu.vue');
  c = c.replace('const target = ref(null)', 'const target = ref<HTMLElement | null>(null)');
  // Fix show/positionMenu that use event.target.getBoundingClientRect
  c = c.replace('event.target.getBoundingClientRect', '(event.target as HTMLElement).getBoundingClientRect');
  w('src/components/Menu/Menu.vue', c);
}

// === Fix ContextMenu triggerElement ref ===
{
  let c = r('src/components/ContextMenu/ContextMenu.vue');
  // Fix event.target.getBoundingClientRect
  c = c.replace('event.target.getBoundingClientRect', '(event.target as HTMLElement).getBoundingClientRect');
  w('src/components/ContextMenu/ContextMenu.vue', c);
}

// === Fix ScrollPanel wrapperRef for clientHeight etc ===
{
  let c = r('src/components/ScrollPanel/ScrollPanel.vue');
  c = c.replace('const xBarRef = ref(null)', 'const xBarRef = ref<HTMLElement | null>(null)');
  c = c.replace('const yBarRef = ref(null)', 'const yBarRef = ref<HTMLElement | null>(null)');
  w('src/components/ScrollPanel/ScrollPanel.vue', c);
}

// === Fix InputMask TS7053 and TS2538 ===
{
  let c = r('src/components/InputMask/InputMask.vue');
  // Fix indexing with string on { "9": RegExp; a: RegExp; "*": RegExp; }
  c = c.replace(
    "const defs = { '9': /[0-9]/, 'a': /[a-zA-Z]/, '*': /[a-zA-Z0-9]/ };",
    "const defs: Record<string, RegExp> = { '9': /[0-9]/, 'a': /[a-zA-Z]/, '*': /[a-zA-Z0-9]/ };"
  );
  w('src/components/InputMask/InputMask.vue', c);
}

// === Fix OrganizationChart event.node/event.selected ===
{
  let c = r('src/components/OrganizationChart/OrganizationChart.vue');
  c = c.replace('const onNodeSelect = (event: Event)', 'const onNodeSelect = (event: any)');
  c = c.replace('const onNodeToggle = (event: Event)', 'const onNodeToggle = (event: any)');
  w('src/components/OrganizationChart/OrganizationChart.vue', c);
}

// === Fix Timeline event.color ===
{
  let c = r('src/components/Timeline/Timeline.vue');
  c = c.replace('const getColor = (event: Event)', 'const getColor = (event: any)');
  w('src/components/Timeline/Timeline.vue', c);
}

// === Fix MeterGroup TS7053 ===
{
  let c = r('src/components/MeterGroup/MeterGroup.vue');
  c = c.replace(
    "const colorMap = {",
    "const colorMap: Record<string, string> = {"
  );
  w('src/components/MeterGroup/MeterGroup.vue', c);
}

// === Fix PanelMenu expandedState ===
// Already changed to Record<string, boolean> but still errors
// The issue is template :key="{}" patterns and unknown types

console.log('\nAll remaining fixes applied!');
