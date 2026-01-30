const fs = require('fs');
const path = require('path');

const BASE = '/home/claude/clawd/design-system';

// Helper to read a component file
function readFile(relPath) {
  return fs.readFileSync(path.join(BASE, relPath), 'utf8');
}
function writeFile(relPath, content) {
  fs.writeFileSync(path.join(BASE, relPath), content);
}

// Apply replacements to a file
function fix(relPath, replacements) {
  let content = readFile(relPath);
  for (const [from, to] of replacements) {
    if (!content.includes(from)) {
      console.warn(`  WARNING: pattern not found in ${relPath}: ${from.substring(0, 60)}...`);
      continue;
    }
    content = content.replace(from, to);
  }
  writeFile(relPath, content);
  console.log(`Fixed ${relPath}`);
}

// Now fix all files based on remaining errors

// ---- Accordion ----
fix('src/components/Accordion/Accordion.vue', [
  ['const isTabActive = (index: any)', 'const isTabActive = (index: number)'],
  ['const toggleTab = (index: any, disabled: any)', 'const toggleTab = (index: number, disabled: boolean)'],
]);

// AccordionTab - inject needs typing
fix('src/components/Accordion/AccordionTab.vue', [
  ['const accordion = inject("accordion");',
   'const accordion = inject<{ registerTab: () => number; isTabActive: (index: number) => boolean; toggleTab: (index: number, disabled: boolean) => void }>("accordion");'],
]);

// ---- AutoComplete ----
{
  let c = readFile('src/components/AutoComplete/AutoComplete.vue');
  // TS2339 ariaDescribedby - this is a prop access issue in template, likely needs $attrs
  // TS7034 debounceTimer
  c = c.replace('let debounceTimer;', 'let debounceTimer: ReturnType<typeof setTimeout> | null = null;');
  // Fix remaining ref() with null that still have 'never' - inputRef, overlayRef
  c = c.replace('const inputRef = ref(null)', 'const inputRef = ref<HTMLInputElement | null>(null)');
  c = c.replace('const overlayRef = ref(null)', 'const overlayRef = ref<HTMLElement | null>(null)');
  c = c.replace('const listRef = ref(null)', 'const listRef = ref<HTMLElement | null>(null)');
  // remaining TS7006 params that weren't caught
  writeFile('src/components/AutoComplete/AutoComplete.vue', c);
  console.log('Fixed AutoComplete');
}

// ---- Badge ----
// TS2339: ariaLabel - template issue, likely $attrs access
// Skip - template issues won't be fixed by script changes

// ---- Calendar ----
{
  let c = readFile('src/components/Calendar/Calendar.vue');
  c = c.replace('const inputRef = ref(null)', 'const inputRef = ref<HTMLInputElement | null>(null)');
  writeFile('src/components/Calendar/Calendar.vue', c);
  console.log('Fixed Calendar');
}

// ---- Carousel ----
{
  let c = readFile('src/components/Carousel/Carousel.vue');
  // TS2322: Type 'number' is not assignable to type 'null'
  // Need to find autoplayInterval ref
  c = c.replace('const autoplayInterval = ref(null)', 'const autoplayInterval = ref<ReturnType<typeof setInterval> | null>(null)');
  writeFile('src/components/Carousel/Carousel.vue', c);
  console.log('Fixed Carousel');
}

// ---- Chart ----
{
  let c = readFile('src/components/Chart/Chart.vue');
  c = c.replace('let chartInstance;', 'let chartInstance: any = null;');
  c = c.replace('let ChartJS;', 'let ChartJS: any = null;');
  // TS2339 on 'object' type for data.datasets
  // TS2339 on '{}' for style.width/height
  c = c.replace('const style = {};', 'const style: Record<string, string> = {};');
  writeFile('src/components/Chart/Chart.vue', c);
  console.log('Fixed Chart');
}

// ---- Checkbox ----
{
  let c = readFile('src/components/Checkbox/Checkbox.vue');
  c = c.replace('const onChange = (event: any)', 'const onChange = (event: Event)');
  writeFile('src/components/Checkbox/Checkbox.vue', c);
  console.log('Fixed Checkbox (minor)');
}

// ---- ColorPicker ----
{
  let c = readFile('src/components/ColorPicker/ColorPicker.vue');
  c = c.replace('const pickerRef = ref(null)', 'const pickerRef = ref<HTMLElement | null>(null)');
  writeFile('src/components/ColorPicker/ColorPicker.vue', c);
  console.log('Fixed ColorPicker');
}

// ---- ConfirmPopup ----
{
  let c = readFile('src/components/ConfirmPopup/ConfirmPopup.vue');
  // TS2322: Type 'Element | null' not assignable to 'null', Type 'object' not assignable to 'null'
  // These are assignments to ref that was typed as ref(null) => ref<null>(null)
  // Fix: type the refs properly
  c = c.replace('const targetElement = ref<HTMLElement | null>(null)', 'const targetElement = ref<HTMLElement | null>(null)');
  // Actually need to check what the confirm ref assignments look like
  c = c.replace('const confirmation = ref(null)', 'const confirmation = ref<any>(null)');
  writeFile('src/components/ConfirmPopup/ConfirmPopup.vue', c);
  console.log('Fixed ConfirmPopup');
}

// ---- ContextMenu ----
{
  let c = readFile('src/components/ContextMenu/ContextMenu.vue');
  c = c.replace('let submenuTimeout;', 'let submenuTimeout: ReturnType<typeof setTimeout> | null = null;');
  c = c.replace('const activeItem = ref(null)', 'const activeItem = ref<any>(null)');
  writeFile('src/components/ContextMenu/ContextMenu.vue', c);
  console.log('Fixed ContextMenu');
}

// ---- DataTable ----
{
  let c = readFile('src/components/DataTable/DataTable.vue');
  // TS2322: Type 'number' not assignable to '1 | -1'
  c = c.replace(/sortOrder\.value = sortOrder\.value \* -1/, 'sortOrder.value = (sortOrder.value * -1) as 1 | -1');
  writeFile('src/components/DataTable/DataTable.vue', c);
  console.log('Fixed DataTable');
}

// ---- Dialog ----
// Already fixed dialogRef, check remaining
{
  let c = readFile('src/components/Dialog/Dialog.vue');
  c = c.replace('const maskRef = ref(null)', 'const maskRef = ref<HTMLElement | null>(null)');
  writeFile('src/components/Dialog/Dialog.vue', c);
  console.log('Fixed Dialog');
}

// ---- Dock ----
{
  let c = readFile('src/components/Dock/Dock.vue');
  writeFile('src/components/Dock/Dock.vue', c);
}

// ---- Dropdown ----
{
  let c = readFile('src/components/Dropdown/Dropdown.vue');
  c = c.replace('const containerRef = ref(null)', 'const containerRef = ref<HTMLElement | null>(null)');
  c = c.replace('const panelRef = ref(null)', 'const panelRef = ref<HTMLElement | null>(null)');
  writeFile('src/components/Dropdown/Dropdown.vue', c);
  console.log('Fixed Dropdown');
}

// ---- Editor ----
{
  let c = readFile('src/components/Editor/Editor.vue');
  c = c.replace('const toolbarRef = ref(null)', 'const toolbarRef = ref<HTMLElement | null>(null)');
  writeFile('src/components/Editor/Editor.vue', c);
  console.log('Fixed Editor');
}

// ---- FileUpload ----
{
  let c = readFile('src/components/FileUpload/FileUpload.vue');
  c = c.replace('const fileInputRef = ref(null)', 'const fileInputRef = ref<HTMLInputElement | null>(null)');
  c = c.replace('const files = ref([])', 'const files = ref<File[]>([])');
  writeFile('src/components/FileUpload/FileUpload.vue', c);
  console.log('Fixed FileUpload');
}

// ---- Galleria ----
{
  let c = readFile('src/components/Galleria/Galleria.vue');
  // TS2322: autoplayInterval
  c = c.replace('const autoplayInterval = ref(null)', 'const autoplayInterval = ref<ReturnType<typeof setInterval> | null>(null)');
  writeFile('src/components/Galleria/Galleria.vue', c);
  console.log('Fixed Galleria');
}

// ---- InputChips ----
{
  let c = readFile('src/components/InputChips/InputChips.vue');
  c = c.replace('const inputRef = ref(null)', 'const inputRef = ref<HTMLInputElement | null>(null)');
  writeFile('src/components/InputChips/InputChips.vue', c);
  console.log('Fixed InputChips');
}

// ---- InputMask ----
{
  let c = readFile('src/components/InputMask/InputMask.vue');
  c = c.replace('const inputRef = ref(null)', 'const inputRef = ref<HTMLInputElement | null>(null)');
  // Fix buffer and tests arrays
  c = c.replace('const buffer = ref([])', 'const buffer = ref<string[]>([])');
  c = c.replace('const tests = ref([])', 'const tests = ref<(RegExp | null)[]>([])');
  writeFile('src/components/InputMask/InputMask.vue', c);
  console.log('Fixed InputMask');
}

// ---- InputNumber ----
{
  let c = readFile('src/components/InputNumber/InputNumber.vue');
  c = c.replace('const inputRef = ref(null)', 'const inputRef = ref<HTMLInputElement | null>(null)');
  writeFile('src/components/InputNumber/InputNumber.vue', c);
  console.log('Fixed InputNumber');
}

// ---- InputOtp ----
{
  let c = readFile('src/components/InputOtp/InputOtp.vue');
  c = c.replace('const tokens = ref([])', 'const tokens = ref<string[]>([])');
  c = c.replace('const inputRefs = ref([])', 'const inputRefs = ref<(HTMLInputElement | null)[]>([])');
  writeFile('src/components/InputOtp/InputOtp.vue', c);
  console.log('Fixed InputOtp');
}

// ---- InputText ----
{
  let c = readFile('src/components/InputText/InputText.vue');
  c = c.replace('const inputRef = ref(null)', 'const inputRef = ref<HTMLInputElement | null>(null)');
  writeFile('src/components/InputText/InputText.vue', c);
  console.log('Fixed InputText');
}

// ---- MegaMenu ----
{
  let c = readFile('src/components/MegaMenu/MegaMenu.vue');
  c = c.replace('let closeTimeout;', 'let closeTimeout: ReturnType<typeof setTimeout> | null = null;');
  c = c.replace('const activeItem = ref(null)', 'const activeItem = ref<any>(null)');
  writeFile('src/components/MegaMenu/MegaMenu.vue', c);
  console.log('Fixed MegaMenu');
}

// ---- Message ----
{
  let c = readFile('src/components/Message/Message.vue');
  c = c.replace('let lifeTimeout;', 'let lifeTimeout: ReturnType<typeof setTimeout> | null = null;');
  writeFile('src/components/Message/Message.vue', c);
  console.log('Fixed Message');
}

// ---- MultiSelect ----
{
  let c = readFile('src/components/MultiSelect/MultiSelect.vue');
  c = c.replace('const panelRef = ref(null)', 'const panelRef = ref<HTMLElement | null>(null)');
  c = c.replace('const triggerRef = ref(null)', 'const triggerRef = ref<HTMLElement | null>(null)');
  writeFile('src/components/MultiSelect/MultiSelect.vue', c);
  console.log('Fixed MultiSelect');
}

// ---- OrderList ----
{
  let c = readFile('src/components/OrderList/OrderList.vue');
  c = c.replace('const selection = ref([])', 'const selection = ref<any[]>([])');
  writeFile('src/components/OrderList/OrderList.vue', c);
  console.log('Fixed OrderList');
}

// ---- OverlayPanel ----
{
  let c = readFile('src/components/OverlayPanel/OverlayPanel.vue');
  c = c.replace('let targetElement;', 'let targetElement: HTMLElement | null = null;');
  writeFile('src/components/OverlayPanel/OverlayPanel.vue', c);
  console.log('Fixed OverlayPanel');
}

// ---- ParticleBackground ----
{
  let c = readFile('src/components/ParticleBackground/ParticleBackground.vue');
  c = c.replace('let ctx;', 'let ctx: CanvasRenderingContext2D | null = null;');
  c = c.replace('let particles;', 'let particles: any[] = [];');
  c = c.replace('let staticStars;', 'let staticStars: any[] = [];');
  c = c.replace('let animationId;', 'let animationId: number | null = null;');
  c = c.replace('const canvasRef = ref(null)', 'const canvasRef = ref<HTMLCanvasElement | null>(null)');
  writeFile('src/components/ParticleBackground/ParticleBackground.vue', c);
  console.log('Fixed ParticleBackground');
}

// ---- PickList ----
{
  let c = readFile('src/components/PickList/PickList.vue');
  c = c.replace('const sourceSelection = ref([])', 'const sourceSelection = ref<any[]>([])');
  c = c.replace('const targetSelection = ref([])', 'const targetSelection = ref<any[]>([])');
  writeFile('src/components/PickList/PickList.vue', c);
  console.log('Fixed PickList');
}

// ---- PopOver ----
{
  let c = readFile('src/components/PopOver/PopOver.vue');
  c = c.replace('let showTimeoutId;', 'let showTimeoutId: ReturnType<typeof setTimeout> | null = null;');
  c = c.replace('let hideTimeoutId;', 'let hideTimeoutId: ReturnType<typeof setTimeout> | null = null;');
  c = c.replace('let triggerElement;', 'let triggerElement: HTMLElement | null = null;');
  writeFile('src/components/PopOver/PopOver.vue', c);
  console.log('Fixed PopOver');
}

// ---- ScrollPanel ----
{
  let c = readFile('src/components/ScrollPanel/ScrollPanel.vue');
  c = c.replace('const wrapperRef = ref(null)', 'const wrapperRef = ref<HTMLElement | null>(null)');
  c = c.replace('let resizeObserver;', 'let resizeObserver: ResizeObserver | null = null;');
  writeFile('src/components/ScrollPanel/ScrollPanel.vue', c);
  console.log('Fixed ScrollPanel');
}

// ---- ScrollTop ----
{
  let c = readFile('src/components/ScrollTop/ScrollTop.vue');
  c = c.replace('let scrollTarget;', 'let scrollTarget: HTMLElement | Window | null = null;');
  writeFile('src/components/ScrollTop/ScrollTop.vue', c);
  console.log('Fixed ScrollTop');
}

// ---- Skeleton ----
{
  let c = readFile('src/components/Skeleton/Skeleton.vue');
  c = c.replace('const style = {};', 'const style: Record<string, string> = {};');
  writeFile('src/components/Skeleton/Skeleton.vue', c);
  console.log('Fixed Skeleton');
}

// ---- Splitter ----
{
  let c = readFile('src/components/Splitter/Splitter.vue');
  c = c.replace('const panelRefs = ref([])', 'const panelRefs = ref<(HTMLElement | null)[]>([])');
  c = c.replace('const gutterRefs = ref([])', 'const gutterRefs = ref<(HTMLElement | null)[]>([])');
  c = c.replace('const panelSizes = ref([])', 'const panelSizes = ref<number[]>([])');
  c = c.replace('const currentGutterIndex = ref(null)', 'const currentGutterIndex = ref<number | null>(null)');
  writeFile('src/components/Splitter/Splitter.vue', c);
  console.log('Fixed Splitter');
}

// ---- SplitterPanel ----
{
  let c = readFile('src/components/Splitter/SplitterPanel.vue');
  c = c.replace(
    'const splitterContext = inject(\'splitterContext\')',
    'const splitterContext = inject<any>(\'splitterContext\')'
  );
  writeFile('src/components/Splitter/SplitterPanel.vue', c);
  console.log('Fixed SplitterPanel');
}

// ---- Tabs ----
{
  let c = readFile('src/components/Tabs/Tabs.vue');
  c = c.replace('const tabs = ref([])', 'const tabs = ref<any[]>([])');
  c = c.replace('const tabListRef = ref(null)', 'const tabListRef = ref<HTMLElement | null>(null)');
  writeFile('src/components/Tabs/Tabs.vue', c);
  console.log('Fixed Tabs');
}

// ---- TabPanel ----
{
  let c = readFile('src/components/Tabs/TabPanel.vue');
  c = c.replace(
    'const tabsContext = inject(\'tabsContext\')',
    'const tabsContext = inject<any>(\'tabsContext\')'
  );
  writeFile('src/components/Tabs/TabPanel.vue', c);
  console.log('Fixed TabPanel');
}

// ---- Terminal ----
{
  let c = readFile('src/components/Terminal/Terminal.vue');
  c = c.replace('const inputRef = ref(null)', 'const inputRef = ref<HTMLInputElement | null>(null)');
  c = c.replace('const containerRef = ref(null)', 'const containerRef = ref<HTMLElement | null>(null)');
  writeFile('src/components/Terminal/Terminal.vue', c);
  console.log('Fixed Terminal');
}

// ---- Textarea ----
{
  let c = readFile('src/components/Textarea/Textarea.vue');
  c = c.replace('const textareaRef = ref(null)', 'const textareaRef = ref<HTMLTextAreaElement | null>(null)');
  c = c.replace('let resizeObserver;', 'let resizeObserver: ResizeObserver | null = null;');
  writeFile('src/components/Textarea/Textarea.vue', c);
  console.log('Fixed Textarea');
}

// ---- TieredMenu ----
{
  let c = readFile('src/components/TieredMenu/TieredMenu.vue');
  c = c.replace('const targetRef = ref(null)', 'const targetRef = ref<HTMLElement | null>(null)');
  writeFile('src/components/TieredMenu/TieredMenu.vue', c);
  console.log('Fixed TieredMenu');
}

// ---- Toast ----
// Already fixed toasts ref. Check if it needs more specific type
{
  let c = readFile('src/components/Toast/Toast.vue');
  // toasts is ref<any[]> but used as objects with id, severity, etc
  // Let's define inline
  if (c.includes('ref<any[]>([])')) {
    // Already typed, but check template accesses
  }
  writeFile('src/components/Toast/Toast.vue', c);
}

// ---- Tooltip ----
{
  let c = readFile('src/components/Tooltip/Tooltip.vue');
  c = c.replace('let showTimeoutId;', 'let showTimeoutId: ReturnType<typeof setTimeout> | null = null;');
  c = c.replace('let hideTimeoutId;', 'let hideTimeoutId: ReturnType<typeof setTimeout> | null = null;');
  c = c.replace('let triggerElement;', 'let triggerElement: HTMLElement | null = null;');
  writeFile('src/components/Tooltip/Tooltip.vue', c);
  console.log('Fixed Tooltip');
}

// ---- Tree ----
{
  let c = readFile('src/components/Tree/Tree.vue');
  writeFile('src/components/Tree/Tree.vue', c);
}

// ---- TreeSelect ----
{
  let c = readFile('src/components/TreeSelect/TreeSelect.vue');
  c = c.replace('const selectedLabels = ref([])', 'const selectedLabels = ref<any[]>([])');
  c = c.replace('const panelRef = ref(null)', 'const panelRef = ref<HTMLElement | null>(null)');
  c = c.replace('const triggerRef = ref(null)', 'const triggerRef = ref<HTMLElement | null>(null)');
  writeFile('src/components/TreeSelect/TreeSelect.vue', c);
  console.log('Fixed TreeSelect');
}

// ---- VirtualScroller ----
{
  let c = readFile('src/components/VirtualScroller/VirtualScroller.vue');
  c = c.replace('let resizeObserver;', 'let resizeObserver: ResizeObserver | null = null;');
  writeFile('src/components/VirtualScroller/VirtualScroller.vue', c);
  console.log('Fixed VirtualScroller');
}

// ---- PanelMenu ----
{
  let c = readFile('src/components/PanelMenu/PanelMenu.vue');
  c = c.replace('const expandedState = ref({})', 'const expandedState = ref<Record<string, boolean>>({})');
  writeFile('src/components/PanelMenu/PanelMenu.vue', c);
  console.log('Fixed PanelMenu');
}

console.log('\nDone with pass 3!');
