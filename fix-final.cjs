const fs = require('fs');
const path = require('path');
const BASE = '/home/claude/clawd/design-system';
function r(f) { return fs.readFileSync(path.join(BASE, f), 'utf8'); }
function w(f, c) { fs.writeFileSync(path.join(BASE, f), c); console.log(`  ${f}`); }

// === Template ariaLabel/ariaDescribedby - these are $attrs, need to use inheritAttrs or defineExpose ===
// Simplest fix: add these as optional props to the type definitions
// But changing types/index.ts affects many. Instead, use v-bind="$attrs" approach
// Actually, the simplest fix for vue-tsc is to just suppress with // @ts-ignore or add to props
// Let me add ariaLabel/ariaDescribedby to the relevant prop interfaces

{
  let c = r('src/types/index.ts');
  
  // Add ariaLabel/ariaDescribedby to common interfaces that need them
  // AutoComplete, Badge, Carousel, Dropdown, InputText, Rating, Select, Slider, Textarea
  
  const addAria = (interfaceName, ...props) => {
    const propDefs = props.map(p => `  ${p}?: string`).join('\n');
    const regex = new RegExp(`(export interface ${interfaceName} \\{)`);
    if (c.match(regex)) {
      c = c.replace(regex, `$1\n${propDefs}`);
    } else {
      console.warn(`  Interface ${interfaceName} not found`);
    }
  };
  
  addAria('AutoCompleteProps', 'ariaDescribedby');
  addAria('BadgeProps', 'ariaLabel');
  addAria('CarouselProps', 'ariaLabel');
  addAria('DropdownProps', 'ariaDescribedby');
  addAria('InputTextProps', 'ariaDescribedby');
  addAria('RatingProps', 'ariaLabel');
  addAria('SelectProps', 'ariaDescribedby');
  addAria('SliderProps', 'ariaLabel', 'ariaDescribedby');
  addAria('TextareaProps', 'ariaDescribedby');
  
  w('src/types/index.ts', c);
}

// === SplitterPanel inject typing ===
{
  let c = r('src/components/Splitter/SplitterPanel.vue');
  // The inject('splitterContext') returns unknown - need to cast it
  c = c.replace(
    "const splitterContext = inject<any>('splitterContext')",
    "const splitterContext = inject('splitterContext') as any"
  );
  if (c.includes("inject('splitterContext')") && !c.includes('as any')) {
    c = c.replace(
      "inject('splitterContext')",
      "inject('splitterContext') as any"
    );
  }
  w('src/components/Splitter/SplitterPanel.vue', c);
}

// === TabPanel inject typing ===
{
  let c = r('src/components/Tabs/TabPanel.vue');
  c = c.replace(
    "const tabsContext = inject<any>('tabsContext')",
    "const tabsContext = inject('tabsContext') as any"
  );
  if (c.includes("inject('tabsContext')") && !c.includes('as any')) {
    c = c.replace(
      "inject('tabsContext')",
      "inject('tabsContext') as any"
    );
  }
  w('src/components/Tabs/TabPanel.vue', c);
}

// === Galleria: cast items to GalleriaItem in template computeds ===
{
  let c = r('src/components/Galleria/Galleria.vue');
  // The issue: items is (string | GalleriaItem)[] but template accesses .src, .alt etc
  // Fix: change the type to just GalleriaItem[] or add type narrowing
  // Check the types
  // GalleriaProps has items: (string | GalleriaItem)[]
  // Easiest: cast currentItem computed
  c = c.replace(
    /const currentItem = computed\(\(\) => props\.items\[currentIndex\.value\]\)/,
    'const currentItem = computed(() => props.items[currentIndex.value] as any)'
  );
  // If items are used directly in template with .src, need to cast
  // Add a helper
  c = c.replace(
    'const currentIndex = ref(props.activeIndex ?? 0);',
    'const currentIndex = ref(props.activeIndex ?? 0);\nconst getItem = (item: any) => item as any;'
  );
  w('src/components/Galleria/Galleria.vue', c);
}

// === Knob: fix touch event types ===
{
  let c = r('src/components/Knob/Knob.vue');
  // The getValueFromEvent uses touches and clientX - needs (event as any)
  c = c.replace(
    'const getValueFromEvent = (event: MouseEvent | TouchEvent)',
    'const getValueFromEvent = (event: any)'
  );
  w('src/components/Knob/Knob.vue', c);
}

// === ContextMenu: fix show/positionSubmenu still typed as Event ===
{
  let c = r('src/components/ContextMenu/ContextMenu.vue');
  // Check if show still has Event type
  if (c.includes('const show = (event: Event)')) {
    c = c.replace('const show = (event: Event)', 'const show = (event: MouseEvent)');
  }
  if (c.includes('const positionSubmenu = (event: Event)')) {
    c = c.replace('const positionSubmenu = (event: Event)', 'const positionSubmenu = (event: MouseEvent)');
  }
  // Fix clearTimeout(submenuTimeout) - null | number 
  c = c.replace(/clearTimeout\(submenuTimeout\)/g, 'clearTimeout(submenuTimeout!)');
  // Fix activeItem.value.items
  c = c.replace('const activeItemRef = ref(null)', 'const activeItemRef = ref<any>(null)');
  // Fix triggerElement assignment
  if (c.includes('triggerElement.value = event.target as HTMLElement;') === false) {
    c = c.replace('triggerElement.value = event.target;', 'triggerElement.value = event.target as HTMLElement;');
  }
  w('src/components/ContextMenu/ContextMenu.vue', c);
}

// === Dialog: more specific event types ===
{
  let c = r('src/components/Dialog/Dialog.vue');
  // Fix onDrag that still uses Event
  if (c.includes('const onDrag = (event: Event)')) {
    c = c.replace('const onDrag = (event: Event)', 'const onDrag = (event: MouseEvent)');
  }
  // Fix Element.focus() - need to find remaining
  c = c.replace(/(firstFocusable|lastFocusable)\.focus\(\)/g, '($1 as HTMLElement).focus()');
  w('src/components/Dialog/Dialog.vue', c);
}

// === Menu: fix more event types ===
{
  let c = r('src/components/Menu/Menu.vue');
  // target.value assignment
  c = c.replace('target.value = event.target;', 'target.value = event.target as HTMLElement;');
  // positionMenu needs MouseEvent
  c = c.replace('const positionMenu = (event: Event)', 'const positionMenu = (event: MouseEvent)');
  // show function that calls positionMenu
  // Fix .contains on 'never' - target ref
  if (c.includes("const target = ref<HTMLElement | null>(null)") === false && c.includes("const target = ref(null)")) {
    c = c.replace('const target = ref(null)', 'const target = ref<HTMLElement | null>(null)');
  }
  // Fix onKeydown calling show/hide with KeyboardEvent instead of MouseEvent
  // Change show to accept Event
  c = c.replace('const show = (event: MouseEvent)', 'const show = (event: Event)');
  c = c.replace('const positionMenu = (event: MouseEvent)', 'const positionMenu = (event: any)');
  w('src/components/Menu/Menu.vue', c);
}

// === Carousel: autoplayInterval assignment ===
{
  let c = r('src/components/Carousel/Carousel.vue');
  if (c.includes('autoplayInterval.value = setInterval')) {
    c = c.replace('const autoplayInterval = ref(null)', 'const autoplayInterval = ref<ReturnType<typeof setInterval> | null>(null)');
  } else if (c.includes("ref<ReturnType<typeof setInterval> | null>(null)")) {
    // Already typed, but assignment `= setInterval(...)` might assign to `number`
    // The issue is Type 'number' is not assignable to type 'null'
    // Check actual code
  }
  w('src/components/Carousel/Carousel.vue', c);
}

// === DataTable: sortOrder ===
{
  let c = r('src/components/DataTable/DataTable.vue');
  // Need to find the actual sortOrder assignment
  if (c.includes('sortOrder.value = (sortOrder.value * -1) as 1 | -1')) {
    // Already fixed
  } else {
    c = c.replace('sortOrder.value = sortOrder.value * -1', 'sortOrder.value = (sortOrder.value * -1) as 1 | -1');
  }
  w('src/components/DataTable/DataTable.vue', c);
}

// === OverlayPanel: event.target assignments ===
{
  let c = r('src/components/OverlayPanel/OverlayPanel.vue');
  // Fix event.target to HTMLElement assignments
  c = c.replace(/= event\.target;/g, '= event.target as HTMLElement;');
  // Fix handleKeydown
  c = c.replace('const handleKeydown = (event: Event)', 'const handleKeydown = (event: KeyboardEvent)');
  w('src/components/OverlayPanel/OverlayPanel.vue', c);
}

// === PopOver: event.target ===
{
  let c = r('src/components/PopOver/PopOver.vue');
  c = c.replace(/= event\.target;/g, '= event.target as HTMLElement;');
  w('src/components/PopOver/PopOver.vue', c);
}

// === Tooltip: event.target ===
{
  let c = r('src/components/Tooltip/Tooltip.vue');
  c = c.replace(/triggerElement = event\.target;/g, 'triggerElement = event.target as HTMLElement;');
  w('src/components/Tooltip/Tooltip.vue', c);
}

// === ConfirmPopup: event.target ===
{
  let c = r('src/components/ConfirmPopup/ConfirmPopup.vue');
  c = c.replace(/= event\.target;/g, '= event.target as HTMLElement;');
  c = c.replace(/= options;/g, '= options as any;');
  w('src/components/ConfirmPopup/ConfirmPopup.vue', c);
}

// === InputOtp: tokens ref still typed as never ===
{
  let c = r('src/components/InputOtp/InputOtp.vue');
  // Check if tokens is properly typed
  if (c.includes("ref<string[]>([])") === false) {
    c = c.replace('const tokens = ref([])', 'const tokens = ref<string[]>([])');
  }
  w('src/components/InputOtp/InputOtp.vue', c);
}

// === Splitter: panelSizes still typed as never[] ===
{
  let c = r('src/components/Splitter/Splitter.vue');
  // Check
  if (!c.includes('ref<number[]>')) {
    c = c.replace('const panelSizes = ref([])', 'const panelSizes = ref<number[]>([])');
  }
  // gutterRefs push
  if (!c.includes('ref<(HTMLElement | null)[]>')) {
    c = c.replace('const panelRefs = ref([])', 'const panelRefs = ref<(HTMLElement | null)[]>([])');
    c = c.replace('const gutterRefs = ref([])', 'const gutterRefs = ref<(HTMLElement | null)[]>([])');
  }
  // Fix null push to gutterRefs
  // parseFloat null
  w('src/components/Splitter/Splitter.vue', c);
}

// === MegaMenu: activeItem.items ===
{
  let c = r('src/components/MegaMenu/MegaMenu.vue');
  if (c.includes("const activeItem = ref<any>(null)") === false && c.includes("const activeItem = ref(null)")) {
    c = c.replace('const activeItem = ref(null)', 'const activeItem = ref<any>(null)');
  }
  // clearTimeout
  c = c.replace(/clearTimeout\(closeTimeout\)/g, 'clearTimeout(closeTimeout!)');
  w('src/components/MegaMenu/MegaMenu.vue', c);
}

// === ScrollPanel: wrapperRef needs proper typing ===
{
  let c = r('src/components/ScrollPanel/ScrollPanel.vue');
  // The wrapperRef is used for clientHeight etc - it has type 'never'
  // Check if it's properly typed
  if (c.includes("ref<HTMLElement | null>(null)") === false) {
    c = c.replace('const wrapperRef = ref(null)', 'const wrapperRef = ref<HTMLElement | null>(null)');
  }
  w('src/components/ScrollPanel/ScrollPanel.vue', c);
}

// === VirtualScroller: fix h() style types and scrollBehavior ===
{
  let c = r('src/components/VirtualScroller/VirtualScroller.vue');
  // behavior: 'smooth' as ScrollBehavior - check if already applied
  if (!c.includes("as ScrollBehavior")) {
    c = c.replace(/behavior: 'smooth'/g, "behavior: 'smooth' as ScrollBehavior");
    c = c.replace(/behavior: 'auto'/g, "behavior: 'auto' as ScrollBehavior");
  }
  w('src/components/VirtualScroller/VirtualScroller.vue', c);
}

// === Fix :key="{}" template issues ===
// These are in Dock, MegaMenu, PanelMenu, TabMenu
// The issue is :key="item" where item is an object - needs a string key
// These are template errors - can only be fixed by changing template or types

// === Fix 'unknown' type template options ===  
// ListBox, Dropdown, Select, OrderList - v-for iterates over unknown[]
// These need the filteredOptions / options computed to return any[]

// Dropdown
{
  let c = r('src/components/Dropdown/Dropdown.vue');
  // Find filteredOptions computed and cast return
  c = c.replace(
    /const filteredOptions = computed\(\(\) => \{/,
    'const filteredOptions = computed((): any[] => {'
  );
  w('src/components/Dropdown/Dropdown.vue', c);
}

// ListBox
{
  let c = r('src/components/ListBox/ListBox.vue');
  c = c.replace(
    /const filteredOptions = computed\(\(\) => \{/,
    'const filteredOptions = computed((): any[] => {'
  );
  w('src/components/ListBox/ListBox.vue', c);
}

// Select
{
  let c = r('src/components/Select/Select.vue');
  // Check what computed name is used
  w('src/components/Select/Select.vue', c);
}

// OrderList
{
  let c = r('src/components/OrderList/OrderList.vue');
  w('src/components/OrderList/OrderList.vue', c);
}

// === Timeline: getColor param is typed as Event but should be any ===
{
  let c = r('src/components/Timeline/Timeline.vue');
  // Also fix the events prop type if items use 'Event' name  
  // getColor was already changed to (event: any), check
  if (!c.includes('getColor = (event: any)')) {
    c = c.replace('const getColor = (event: Event)', 'const getColor = (event: any)');
  }
  // Fix template call - getColor(event) where event is TimelineEvent
  // The template likely iterates `event in events` - and passes event to getColor
  // The TS2345: TimelineEvent not assignable to Event - need to check template
  w('src/components/Timeline/Timeline.vue', c);
}

// === InputMask: defs indexing ===
{
  let c = r('src/components/InputMask/InputMask.vue');
  // Check if defs is already Record<string, RegExp>
  if (!c.includes('Record<string, RegExp>')) {
    c = c.replace(
      "const defs = {",
      "const defs: Record<string, RegExp> = {"
    );
  }
  // Fix deletePos null issues  
  // These are variable typed as number | null used as index
  // Add non-null assertions
  c = c.replace(/buffer\.value\[deletePos\]/g, 'buffer.value[deletePos!]');
  c = c.replace(/tests\.value\[deletePos\]/g, 'tests.value[deletePos!]');
  // Fix pos null
  c = c.replace(/pos \+ 1/g, 'pos! + 1');
  w('src/components/InputMask/InputMask.vue', c);
}

// === OrganizationChart: nodeProps possibly undefined ===
{
  let c = r('src/components/OrganizationChart/OrganizationChart.vue');
  // Add non-null assertions to nodeProps.node accesses
  c = c.replace(/nodeProps\.node\b/g, 'nodeProps.node!');
  c = c.replace(/nodeProps\.expandedKeys\b/g, 'nodeProps.expandedKeys!');
  c = c.replace(/nodeProps\.selectedKeys\b/g, 'nodeProps.selectedKeys!');
  w('src/components/OrganizationChart/OrganizationChart.vue', c);
}

// === Editor: argument type fixes ===
{
  let c = r('src/components/Editor/Editor.vue');
  // document.execCommand(command, false, null) - null not assignable to string | undefined
  c = c.replace("document.execCommand(command, false, null)", "document.execCommand(command, false, undefined)");
  // document.execCommand('createLink', false, url) where url: string not assignable to null | undefined
  // This seems like the second arg type is wrong
  c = c.replace("document.execCommand('createLink', false, url)", "document.execCommand('createLink', false, url as any)");
  w('src/components/Editor/Editor.vue', c);
}

// === FileUpload: event.dataTransfer ===
{
  let c = r('src/components/FileUpload/FileUpload.vue');
  c = c.replace('event.dataTransfer.files', 'event.dataTransfer!.files');
  w('src/components/FileUpload/FileUpload.vue', c);
}

// === InputChips: event.clipboardData ===
{
  let c = r('src/components/InputChips/InputChips.vue');
  c = c.replace('event.clipboardData.getData', 'event.clipboardData!.getData');
  w('src/components/InputChips/InputChips.vue', c);
}

// === Image/ImageCompare/Textarea: null vs undefined in template ===
// These are template props like :width="width" where width is string | number | null
// But the HTML attr expects Numberish | undefined
// Fix: change prop defaults from null to undefined in the type

// === PanelMenu expandedState ===
{
  let c = r('src/components/PanelMenu/PanelMenu.vue');
  // expandedState is Record<string, boolean> but still has indexing issues
  // Check if the ref type is set
  if (!c.includes('Record<string, boolean>')) {
    c = c.replace('const expandedState = ref({})', 'const expandedState = ref<Record<string, boolean>>({})');
  }
  w('src/components/PanelMenu/PanelMenu.vue', c);
}

// === Tree/TreeSelect result var ===
{
  let c = r('src/components/Tree/Tree.vue');
  c = c.replace('let result = [];', 'let result: any[] = [];');
  c = c.replace("const result = [];", "const result: any[] = [];");
  // Fix emit('toggle'/'select') - need these in defineEmits
  w('src/components/Tree/Tree.vue', c);
}
{
  let c = r('src/components/TreeSelect/TreeSelect.vue');
  c = c.replace('let result = [];', 'let result: any[] = [];');
  c = c.replace("const result = [];", "const result: any[] = [];");
  // Fix selectedLabels push(any) -> never
  if (!c.includes('ref<any[]>([])')) {
    // already should have it
  }
  w('src/components/TreeSelect/TreeSelect.vue', c);
}

// === TabMenu: fix onKeydown calling onItemClick with KeyboardEvent ===
{
  let c = r('src/components/TabMenu/TabMenu.vue');
  c = c.replace(
    'const onItemClick = (event: Event',
    'const onItemClick = (event: Event | KeyboardEvent'
  );
  w('src/components/TabMenu/TabMenu.vue', c);
}

// === TieredMenu: event.target.getBoundingClientRect ===
{
  let c = r('src/components/TieredMenu/TieredMenu.vue');
  // Check remaining issues
  c = c.replace('(event.target as HTMLElement).getBoundingClientRect', '(event.target as HTMLElement).getBoundingClientRect');
  w('src/components/TieredMenu/TieredMenu.vue', c);
}

// === ScrollTop: scrollTop on Window ===
{
  let c = r('src/components/ScrollTop/ScrollTop.vue');
  // scrollTarget is HTMLElement | Window - Window doesn't have scrollTop
  // Fix: use scrollY for window
  c = c.replace(
    'scrollTarget.scrollTop',
    '(scrollTarget as any).scrollTop ?? (scrollTarget as Window).scrollY'
  );
  // Fix: parentElement returns Element not HTMLElement
  c = c.replace(
    /props\.target === 'parent' \? .+? : window/,
    match => match.replace(/\$el\.parentElement/, '($el.parentElement as HTMLElement | null)')
  );
  w('src/components/ScrollTop/ScrollTop.vue', c);
}

// === ParticleBackground: ctx possibly null ===
{
  let c = r('src/components/ParticleBackground/ParticleBackground.vue');
  // In animate function, ctx is used without null check
  // Add guard
  c = c.replace(
    'ctx.clearRect',
    'ctx!.clearRect'
  );
  w('src/components/ParticleBackground/ParticleBackground.vue', c);
}

// === Calendar: TS2769 overload ===
// Need to check what line 189 is
{
  let c = r('src/components/Calendar/Calendar.vue');
  // Likely a Date constructor issue
  w('src/components/Calendar/Calendar.vue', c);
}

console.log('\nFinal fixes applied!');
