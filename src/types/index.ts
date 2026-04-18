// Wireframe Design System — TypeScript Interfaces
// Auto-generated component prop, emit, and slot interfaces

// ============================================================
// Common Types
// ============================================================

export type Size = 'sm' | 'md' | 'lg'
export type Severity = 'success' | 'info' | 'warn' | 'error'
export type Position = 'top' | 'bottom' | 'left' | 'right'
export type Orientation = 'horizontal' | 'vertical'
export type SelectionMode = 'single' | 'multiple' | 'checkbox'

export interface MenuItem {
  key?: string | number
  label?: string
  icon?: string
  url?: string
  target?: string
  command?: (event: { originalEvent: Event; item: MenuItem }) => void
  items?: MenuItem[]
  disabled?: boolean
  separator?: boolean
  active?: boolean
  badge?: string | number
  description?: string
  [key: string]: unknown
}

export interface TreeNode {
  key?: string
  label?: string
  children?: TreeNode[]
  [key: string]: unknown
}

// ============================================================
// Alert
// ============================================================

export interface AlertProps {
  severity?: Severity
  title?: string
  closable?: boolean
  icon?: string
}

export interface AlertEmits {
  (e: 'close'): void
}

// ============================================================
// AppBar
// ============================================================

export interface AppBarProps {
  fixed?: boolean
  elevated?: boolean
  transparent?: boolean
  color?: string
}

// ============================================================
// CommandPalette
// ============================================================

export interface CommandPaletteCommand {
  id: string
  label: string
  icon?: string
  shortcut?: string
  group?: string
  action?: () => void
}

export interface CommandPaletteProps {
  commands: CommandPaletteCommand[]
  placeholder?: string
  open?: boolean
}

export interface CommandPaletteEmits {
  (e: 'select', command: CommandPaletteCommand): void
  (e: 'close'): void
  (e: 'update:open', value: boolean): void
}

// ============================================================
// DatePicker
// ============================================================

export interface DatePickerProps {
  modelValue?: Date | null
  placeholder?: string
  format?: string
  minDate?: Date | null
  maxDate?: Date | null
  disabled?: boolean
  locale?: string
}

export interface DatePickerEmits {
  (e: 'update:modelValue', value: Date | null): void
}

// ============================================================
// Form
// ============================================================

export interface FormProps {
  layout?: 'vertical' | 'horizontal'
  labelWidth?: string
}

export interface FormFieldProps {
  label?: string
  labelFor?: string         // id of input for accessibility
  htmlFor?: string          // alias for labelFor (deprecated)
  required?: boolean        // shows * indicator
  error?: string            // error message (shown in red below input)
  hint?: string             // helper text (shown below input, grey)
  disabled?: boolean        // grey out entire field
}

export interface FormEmits {
  (e: 'submit', event: Event): void
}

// ============================================================
// Accordion
// ============================================================

export interface AccordionProps {
  activeIndex?: number | number[] | null
  multiple?: boolean
}

export interface AccordionEmits {
  (e: 'update:activeIndex', value: number | number[] | null): void
  (e: 'tab-open', payload: { index: number }): void
  (e: 'tab-close', payload: { index: number }): void
}

export interface AccordionTabProps {
  header?: string
  isDisabled?: boolean
}

// AtmosphericBackground removed in wireframe transform (v2). No replacement.

// ============================================================
// AutoComplete
// ============================================================

export interface AutoCompleteProps {
  ariaDescribedby?: string
  modelValue?: string | number | object | unknown[] | null
  suggestions?: unknown[]
  optionLabel?: string
  optionValue?: string
  placeholder?: string
  multiple?: boolean
  minLength?: number
  delay?: number
  size?: Size
  isDisabled?: boolean
  isInvalid?: boolean
  isLoading?: boolean
  dropdown?: boolean
  completeOnFocus?: boolean
}

export interface AutoCompleteEmits {
  (e: 'update:modelValue', value: unknown): void
  (e: 'complete', payload: { query: string }): void
  (e: 'select', payload: { value: unknown }): void
  (e: 'unselect', payload: { value: unknown }): void
  (e: 'focus', payload: { originalEvent: FocusEvent }): void
  (e: 'blur', payload: { originalEvent: FocusEvent }): void
  (e: 'clear'): void
}

// ============================================================
// Avatar
// ============================================================

export interface AvatarProps {
  label?: string
  icon?: string
  image?: string
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  shape?: 'square' | 'circle'
  ariaLabel?: string
}

export interface AvatarEmits {
  (e: 'error', event: Event): void
}

// ============================================================
// Badge
// ============================================================

export interface BadgeProps {
  ariaLabel?: string
  value?: string | number | null
  size?: Size
  severity?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

// ============================================================
// BlockUI
// ============================================================

export interface BlockUIProps {
  blocked?: boolean
  fullScreen?: boolean
  showSpinner?: boolean
  autoZIndex?: boolean
  baseZIndex?: number
}

export interface BlockUIEmits {
  (e: 'block'): void
  (e: 'unblock'): void
}

// ============================================================
// Breadcrumb
// ============================================================

export interface BreadcrumbItem {
  label?: string
  icon?: string
  url?: string
  command?: (event: { originalEvent: Event; item: BreadcrumbItem }) => void
}

export interface BreadcrumbProps {
  model?: BreadcrumbItem[]
  home?: BreadcrumbItem
}

// ============================================================
// Button
// ============================================================

export interface ButtonProps {
  label?: string
  icon?: string
  iconPos?: 'left' | 'right'
  size?: Size
  variant?: 'primary' | 'secondary' | 'outlined' | 'text'
  pill?: boolean
  isDisabled?: boolean
  isLoading?: boolean
}

// ============================================================
// Calendar
// ============================================================

export interface CalendarProps {
  modelValue?: Date | Date[] | null
  placeholder?: string
  dateFormat?: string
  selectionMode?: 'single' | 'range'
  minDate?: Date | null
  maxDate?: Date | null
  inline?: boolean
  showTodayButton?: boolean
  size?: Size
  isDisabled?: boolean
  isInvalid?: boolean
}

export interface CalendarEmits {
  (e: 'update:modelValue', value: Date | Date[] | null): void
  (e: 'select', payload: { value: Date }): void
  (e: 'show'): void
  (e: 'hide'): void
}

// ============================================================
// Card
// ============================================================

export interface CardProps {
  variant?: 'default' | 'highlighted'
}

// ============================================================
// Carousel
// ============================================================

export interface CarouselProps {
  ariaLabel?: string
  items?: unknown[]
  numVisible?: number
  numScroll?: number
  circular?: boolean
  autoplay?: boolean
  autoplayInterval?: number
  showNavigators?: boolean
  showIndicators?: boolean
  orientation?: Orientation
}

export interface CarouselEmits {
  (e: 'update:page', value: number): void
}

// ============================================================
// Chart
// ============================================================

export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'scatter' | 'bubble'

export interface ChartProps {
  type?: ChartType
  data?: object | null
  options?: object | null
  plugins?: unknown[]
  title?: string | null
  isLoading?: boolean
  width?: number | string | null
  height?: number | string | null
}

export interface ChartEmits {
  (e: 'select', payload: { originalEvent: Event; element: unknown; dataset: unknown; datasetIndex: number; index: number; value: unknown }): void
  (e: 'loaded', chart: unknown): void
}

// ============================================================
// Checkbox
// ============================================================

export interface CheckboxProps {
  modelValue?: boolean
  label?: string
  name?: string
  value?: string | number | boolean | object
  size?: Size
  isDisabled?: boolean
  isInvalid?: boolean
  indeterminate?: boolean
}

export interface CheckboxEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', payload: { checked: boolean; originalEvent: Event }): void
}

// ============================================================
// Chip
// ============================================================

export interface ChipProps {
  label?: string
  icon?: string
  image?: string
  removable?: boolean
}

export interface ChipEmits {
  (e: 'remove', event: Event): void
}

// ============================================================
// ColorPicker
// ============================================================

export interface ColorPickerProps {
  modelValue?: string
  presetColors?: string[]
  inline?: boolean
  size?: Size
  isDisabled?: boolean
}

export interface ColorPickerEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', payload: { value: string }): void
}

// ============================================================
// Column
// ============================================================

export interface ColumnProps {
  field?: string | null
  header?: string | null
  footer?: string | null
  sortable?: boolean
  sortField?: string | null
  filterField?: string | null
  filterable?: boolean
  width?: string | null
  minWidth?: string | null
  maxWidth?: string | null
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right' | null
  footerAlign?: 'left' | 'center' | 'right' | null
  frozen?: boolean
  hidden?: boolean
  expander?: boolean
  selectionMode?: 'single' | 'multiple' | null
  rowspan?: number
  colspan?: number
}

// ============================================================
// ColumnGroup
// ============================================================

export interface ColumnGroupProps {
  type?: 'header' | 'footer'
}

// ============================================================
// ConfirmDialog
// ============================================================

export interface ConfirmDialogProps {
  visible?: boolean
  header?: string
  message?: string
  icon?: 'warning' | 'danger' | 'info' | ''
  acceptLabel?: string
  rejectLabel?: string
  dismissableMask?: boolean
  closeOnEscape?: boolean
}

export interface ConfirmDialogEmits {
  (e: 'update:visible', value: boolean): void
  (e: 'accept'): void
  (e: 'reject'): void
}

// ============================================================
// ConfirmPopup
// ============================================================

export interface ConfirmPopupProps {
  target?: HTMLElement | string | null
  message?: string
  acceptLabel?: string
  rejectLabel?: string
  showIcon?: boolean
  position?: Position
}

export interface ConfirmPopupEmits {
  (e: 'accept'): void
  (e: 'reject'): void
}

// ============================================================
// ContextMenu
// ============================================================

export interface ContextMenuProps {
  model?: MenuItem[]
  global?: boolean
  popup?: boolean
  showArrow?: boolean
  highlightTrigger?: boolean
  appendTo?: string
}

export interface ContextMenuEmits {
  (e: 'show', event: Event): void
  (e: 'hide'): void
  (e: 'item-click', payload: { originalEvent: Event; item: MenuItem }): void
}

// ============================================================
// DataTable
// ============================================================

export interface DataTableColumn {
  field: string
  header: string
  sortable?: boolean
  width?: string
  [key: string]: unknown
}

export interface DataTableProps {
  value?: unknown[]
  columns?: DataTableColumn[]
  striped?: boolean
  hoverable?: boolean
  paginator?: boolean
  rows?: number
  sortField?: string | null
  sortOrder?: 1 | -1
}

export interface DataTableEmits {
  (e: 'sort', payload: { sortField: string; sortOrder: number }): void
  (e: 'page', payload: { page: number }): void
}

// ============================================================
// DataView
// ============================================================

export interface DataViewProps {
  value?: unknown[]
  layout?: 'list' | 'grid'
  gridColumns?: number
  paginator?: boolean
  rows?: number
  showLayoutSwitcher?: boolean
}

export interface DataViewEmits {
  (e: 'update:layout', value: 'list' | 'grid'): void
  (e: 'page', payload: { page: number }): void
}

// ============================================================
// Dialog
// ============================================================

export interface DialogProps {
  visible?: boolean
  header?: string
  closable?: boolean
  modal?: boolean
  draggable?: boolean
  dismissableMask?: boolean
  closeOnEscape?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export interface DialogEmits {
  (e: 'update:visible', value: boolean): void
  (e: 'show'): void
  (e: 'hide'): void
}

// ============================================================
// Divider
// ============================================================

export interface DividerProps {
  layout?: Orientation
  type?: 'solid' | 'dashed' | 'dotted'
  align?: 'left' | 'center' | 'right' | 'top' | 'bottom'
}

// ============================================================
// Dock
// ============================================================

export interface DockItem {
  key?: string | number
  label?: string
  icon?: string
  command?: (event: { originalEvent: Event; item: DockItem }) => void
  disabled?: boolean
  active?: boolean
  [key: string]: unknown
}

export interface DockProps {
  model?: DockItem[]
  position?: Position
  magnification?: boolean
  magnificationScale?: number
  showTooltips?: boolean
}

export interface DockEmits {
  (e: 'item-click', payload: { originalEvent: Event; item: DockItem }): void
}

// ============================================================
// Drawer
// ============================================================

export interface DrawerProps {
  visible?: boolean
  header?: string
  position?: Position
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
  dismissable?: boolean
  closeOnEscape?: boolean
  blockScroll?: boolean
}

export interface DrawerEmits {
  (e: 'update:visible', value: boolean): void
  (e: 'show'): void
  (e: 'hide'): void
}

// ============================================================
// Dropdown
// ============================================================

export interface DropdownProps {
  ariaDescribedby?: string
  modelValue?: string | number | object | null
  options?: unknown[]
  optionLabel?: string
  optionValue?: string
  filter?: boolean
  placeholder?: string
  size?: Size
  isDisabled?: boolean
  isInvalid?: boolean
}

export interface DropdownEmits {
  (e: 'update:modelValue', value: unknown): void
  (e: 'change', payload: { value: unknown; originalEvent?: Event }): void
  (e: 'show'): void
  (e: 'hide'): void
  (e: 'filter', payload: { value: string; originalEvent: Event }): void
}

// ============================================================
// Editor
// ============================================================

export interface EditorProps {
  modelValue?: string
  placeholder?: string
  isDisabled?: boolean
  isInvalid?: boolean
}

export interface EditorEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'focus', payload: { originalEvent: FocusEvent }): void
  (e: 'blur', payload: { originalEvent: FocusEvent }): void
  (e: 'change', payload: { value: string }): void
}

// ============================================================
// FieldSet
// ============================================================

export interface FieldSetProps {
  legend?: string
  toggleable?: boolean
  collapsed?: boolean
}

export interface FieldSetEmits {
  (e: 'update:collapsed', value: boolean): void
  (e: 'toggle', payload: { collapsed: boolean }): void
}

// ============================================================
// FileUpload
// ============================================================

export interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxFileSize?: number | null
  maxFiles?: number | null
  isDisabled?: boolean
}

export interface FileUploadEmits {
  (e: 'select', files: File[]): void
  (e: 'remove', file: File): void
  (e: 'error', payload: { type: 'size' | 'limit'; file: File; maxSize?: number; maxFiles?: number }): void
}

// ============================================================
// Galleria
// ============================================================

export interface GalleriaItem {
  src?: string
  thumbnail?: string
  alt?: string
  title?: string
  description?: string
  [key: string]: unknown
}

export interface GalleriaProps {
  items?: any[]
  activeIndex?: number
  fullscreen?: boolean
  showThumbnails?: boolean
  showItemNavigators?: boolean
  showIndicators?: boolean
  showCounter?: boolean
  showFullscreenThumbnails?: boolean
  enableZoom?: boolean
  circular?: boolean
  autoplay?: boolean
  autoplayInterval?: number
  thumbnailsPosition?: Position
  transition?: 'fade' | 'slide' | 'none'
}

export interface GalleriaEmits {
  (e: 'update:activeIndex', value: number): void
  (e: 'show'): void
  (e: 'hide'): void
}

// ============================================================
// Image
// ============================================================

export interface ImageProps {
  src: string
  alt?: string
  width?: number | string
  height?: number | string
  preview?: boolean
}

export interface ImageEmits {
  (e: 'show'): void
  (e: 'hide'): void
  (e: 'error', event: Event): void
  (e: 'load', event: Event): void
}

// ============================================================
// ImageCompare
// ============================================================

export interface ImageCompareProps {
  initialPosition?: number
  ariaLabel?: string
  ariaLabelledBy?: string
}

export interface ImageCompareEmits {
  (e: 'change', value: number): void
}

// ============================================================
// InPlace
// ============================================================

export interface InPlaceProps {
  active?: boolean
  disabled?: boolean
  closable?: boolean
}

export interface InPlaceEmits {
  (e: 'update:active', value: boolean): void
  (e: 'open'): void
  (e: 'close'): void
}

// ============================================================
// InlineMessage
// ============================================================

export interface InlineMessageProps {
  severity?: Severity
  icon?: boolean
}

// ============================================================
// InputChips
// ============================================================

export interface InputChipsProps {
  modelValue?: string[]
  separator?: string | RegExp | null
  allowDuplicate?: boolean
  max?: number | null
  placeholder?: string
  size?: Size
  isDisabled?: boolean
  isInvalid?: boolean
}

export interface InputChipsEmits {
  (e: 'update:modelValue', value: string[]): void
  (e: 'add', payload: { value: string; chips: string[] }): void
  (e: 'remove', payload: { value: string; chips: string[] }): void
  (e: 'focus', payload: { originalEvent: FocusEvent }): void
  (e: 'blur', payload: { originalEvent: FocusEvent }): void
}

// ============================================================
// InputGroup
// ============================================================

export interface InputGroupProps {
  fluid?: boolean
}

// ============================================================
// InputGroupAddon
// ============================================================

export interface InputGroupAddonProps {
  size?: Size
}

// ============================================================
// IconField
// ============================================================

export interface IconFieldProps {}

// ============================================================
// InputIcon
// ============================================================

export interface InputIconProps {
  size?: Size
  position?: 'left' | 'right'
}

// ============================================================
// InputMask
// ============================================================

export interface InputMaskProps {
  modelValue?: string
  mask: string
  slotChar?: string
  autoClear?: boolean
  placeholder?: string
  name?: string
  size?: Size
  isDisabled?: boolean
  isInvalid?: boolean
}

export interface InputMaskEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'complete', payload: { value: string; maskedValue: string }): void
  (e: 'focus', payload: { originalEvent: FocusEvent }): void
  (e: 'blur', payload: { originalEvent: FocusEvent }): void
}

// ============================================================
// InputNumber
// ============================================================

export interface InputNumberProps {
  modelValue?: number | null
  min?: number | null
  max?: number | null
  step?: number
  placeholder?: string
  name?: string
  size?: Size
  showButtons?: boolean
  isDisabled?: boolean
  isInvalid?: boolean
  locale?: string
  minFractionDigits?: number
  maxFractionDigits?: number
}

export interface InputNumberEmits {
  (e: 'update:modelValue', value: number | null): void
  (e: 'change', payload: { value: number | null }): void
}

// ============================================================
// InputOtp
// ============================================================

export interface InputOtpProps {
  modelValue?: string
  length?: number
  mask?: boolean
  maskChar?: string
  integerOnly?: boolean
  separator?: number
  isDisabled?: boolean
  isInvalid?: boolean
  autoFocus?: boolean
}

export interface InputOtpEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', payload: { value: string }): void
  (e: 'complete', payload: { value: string }): void
}

// ============================================================
// InputSwitch
// ============================================================

export interface InputSwitchProps {
  modelValue?: boolean
  label?: string
  name?: string
  size?: Size
  isDisabled?: boolean
}

export interface InputSwitchEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', payload: { value: boolean; originalEvent: Event }): void
}

// ============================================================
// InputText
// ============================================================

export interface InputTextProps {
  ariaDescribedby?: string
  modelValue?: string | number
  type?: 'text' | 'password' | 'email' | 'tel' | 'url' | 'search' | 'number'
  placeholder?: string
  name?: string
  size?: Size
  isDisabled?: boolean
  isInvalid?: boolean
}

export interface InputTextEmits {
  (e: 'update:modelValue', value: string | number): void
  (e: 'input', payload: { value: string; originalEvent: Event }): void
  (e: 'change', payload: { value: string; originalEvent: Event }): void
  (e: 'focus', payload: { originalEvent: FocusEvent }): void
  (e: 'blur', payload: { originalEvent: FocusEvent }): void
}

// ============================================================
// Knob
// ============================================================

export interface KnobProps {
  modelValue?: number
  min?: number
  max?: number
  step?: number
  size?: Size
  strokeWidth?: number
  showValue?: boolean
  valueTemplate?: string
  isDisabled?: boolean
}

export interface KnobEmits {
  (e: 'update:modelValue', value: number): void
  (e: 'change', payload: { value: number }): void
}

// ============================================================
// LiveTile
// ============================================================

/**
 * Badge value for LiveTile
 * - 'dot': Shows a small dot indicator
 * - 'check': Shows a checkmark icon
 * - string/number: Shows the value as text
 */
export type LiveTileBadge = 'dot' | 'check' | string | number | null;

export interface LiveTileProps {
  /**
   * URL to navigate to when clicked. If not provided, component renders as a button.
   */
  href?: string;
  /**
   * Title shown in the branding footer
   */
  title?: string;
  /**
   * Icon class for the branding footer (e.g., 'pi pi-chart-line')
   */
  icon?: string;
  /**
   * Badge content - 'dot', 'check', or custom text/number
   */
  badge?: LiveTileBadge;
  /**
   * Additional CSS class for the badge (e.g., 'warning', 'success')
   */
  badgeClass?: string;
  /**
   * When true, stops auto-rotation and shows loading state
   */
  loading?: boolean;
  /**
   * Number of faces/slides in the tile
   * @default 2
   */
  faceCount?: number;
  /**
   * Hide the branding footer
   * @default false
   */
  hideBranding?: boolean;
}

export interface LiveTileEmits {
  /**
   * Emitted when tile is clicked (only when no href is provided)
   */
  (e: 'click'): void;
}

// ============================================================
// Lightbox
// ============================================================

export interface LightboxImage {
  src: string
  thumbnail?: string
  alt?: string
  [key: string]: unknown
}

export interface LightboxProps {
  images?: (string | LightboxImage)[]
  visible?: boolean
  activeIndex?: number
  showThumbnails?: boolean
  showCounter?: boolean
  closeOnClickOutside?: boolean
  zoom?: boolean
}

export interface LightboxEmits {
  (e: 'update:visible', value: boolean): void
  (e: 'update:activeIndex', value: number): void
  (e: 'show'): void
  (e: 'hide'): void
}

// ============================================================
// ListBox
// ============================================================

export interface ListBoxProps {
  modelValue?: string | number | object | unknown[] | null
  options?: unknown[]
  optionLabel?: string
  optionValue?: string
  multiple?: boolean
  filter?: boolean
  isDisabled?: boolean
}

export interface ListBoxEmits {
  (e: 'update:modelValue', value: unknown): void
  (e: 'change', payload: { value: unknown; originalEvent?: Event }): void
  (e: 'filter', payload: { value: string; originalEvent: Event }): void
}

// ============================================================
// MegaMenu
// ============================================================

export interface MegaMenuProps {
  model?: MenuItem[]
  orientation?: Orientation
}

export interface MegaMenuEmits {
  (e: 'item-click', payload: { originalEvent: Event; item: MenuItem }): void
}

// ============================================================
// Menu
// ============================================================

export interface MenuProps {
  model?: MenuItem[]
  popup?: boolean
}

export interface MenuEmits {
  (e: 'item-click', payload: { originalEvent: Event; item: MenuItem }): void
  (e: 'show'): void
  (e: 'hide'): void
}

// ============================================================
// MenuBar
// ============================================================

export interface MenuBarProps {
  model?: MenuItem[]
}

export interface MenuBarEmits {
  (e: 'item-click', payload: { originalEvent: Event; item: MenuItem }): void
}

// ============================================================
// Message
// ============================================================

export interface MessageProps {
  severity?: Severity
  closable?: boolean
  icon?: boolean
  life?: number | null
}

export interface MessageEmits {
  (e: 'close'): void
  (e: 'life-end'): void
}

// ============================================================
// MeterGroup
// ============================================================

export interface MeterGroupValue {
  value: number
  label?: string
  color?: 'primary' | 'success' | 'warning' | 'danger' | string
}

export interface MeterGroupProps {
  values: MeterGroupValue[]
  max?: number
  orientation?: Orientation
  showLabels?: boolean
}

// ============================================================
// MultiSelect
// ============================================================

export interface MultiSelectProps {
  modelValue?: unknown[]
  options?: unknown[]
  optionLabel?: string
  optionValue?: string
  placeholder?: string
  filter?: boolean
  display?: 'comma' | 'chip'
  size?: Size
  isDisabled?: boolean
  isInvalid?: boolean
}

export interface MultiSelectEmits {
  (e: 'update:modelValue', value: unknown[]): void
  (e: 'change', payload: { value: unknown[] }): void
}

// ============================================================
// OrderList
// ============================================================

export interface OrderListProps {
  modelValue?: any[]
  header?: string
  dataKey?: string | null
  itemKey?: string | null
  multiple?: boolean
}

export interface OrderListEmits {
  (e: 'update:modelValue', value: unknown[]): void
  (e: 'reorder', payload: { value: unknown[] }): void
  (e: 'selection-change', payload: { selection: unknown[] }): void
}

// ============================================================
// OrganizationChart
// ============================================================

export interface OrganizationChartProps {
  value?: object | null
  selectionMode?: 'single' | 'multiple'
  selectedKeys?: Record<string, boolean>
  expandedKeys?: Record<string, boolean>
  collapsible?: boolean
}

export interface OrganizationChartEmits {
  (e: 'update:selectedKeys', value: Record<string, boolean>): void
  (e: 'update:expandedKeys', value: Record<string, boolean>): void
  (e: 'node-select', payload: { node: object }): void
  (e: 'node-unselect', payload: { node: object }): void
  (e: 'node-expand', payload: { node: object }): void
  (e: 'node-collapse', payload: { node: object }): void
}

// ============================================================
// OverlayPanel
// ============================================================

export interface OverlayPanelProps {
  visible?: boolean
  appendTo?: string
  dismissable?: boolean
  showCloseIcon?: boolean
}

export interface OverlayPanelEmits {
  (e: 'update:visible', value: boolean): void
  (e: 'show'): void
  (e: 'hide'): void
}

// ============================================================
// Paginator
// ============================================================

export interface PaginatorProps {
  totalRecords: number
  rows?: number
  first?: number
  rowsPerPageOptions?: number[]
  pageLinkSize?: number
  showFirstLast?: boolean
  showInfo?: boolean
}

export interface PaginatorEmits {
  (e: 'update:first', value: number): void
  (e: 'update:rows', value: number): void
  (e: 'page', payload: { page: number; first: number; rows: number; pageCount: number }): void
}

// ============================================================
// Panel
// ============================================================

export interface PanelProps {
  header?: string
  toggleable?: boolean
  collapsed?: boolean
}

export interface PanelEmits {
  (e: 'update:collapsed', value: boolean): void
  (e: 'toggle', payload: { collapsed: boolean }): void
}

// ============================================================
// PanelMenu
// ============================================================

export interface PanelMenuProps {
  model?: MenuItem[]
  expandedKeys?: Record<number, boolean>
  multiple?: boolean
}

export interface PanelMenuEmits {
  (e: 'update:expandedKeys', value: Record<number, boolean>): void
  (e: 'panel-open', payload: { index: number; panel: MenuItem }): void
  (e: 'panel-close', payload: { index: number; panel: MenuItem }): void
  (e: 'item-click', payload: { originalEvent: Event; item: MenuItem }): void
}

// ParticleBackground removed in wireframe transform (v2). No replacement.

// ============================================================
// PickList
// ============================================================

export interface PickListProps {
  source?: unknown[]
  target?: unknown[]
  sourceHeader?: string
  targetHeader?: string
  dataKey?: string | null
  labelKey?: string
  isDisabled?: boolean
}

export interface PickListEmits {
  (e: 'update:source', value: unknown[]): void
  (e: 'update:target', value: unknown[]): void
  (e: 'move-to-target', payload: { items: unknown[] }): void
  (e: 'move-to-source', payload: { items: unknown[] }): void
}

// ============================================================
// PopOver
// ============================================================

export interface PopOverProps {
  visible?: boolean
  trigger?: 'hover' | 'click'
  position?: Position
  showDelay?: number
  hideDelay?: number
  disabled?: boolean
}

export interface PopOverEmits {
  (e: 'update:visible', value: boolean): void
  (e: 'show'): void
  (e: 'hide'): void
}

// ============================================================
// ProgressBar
// ============================================================

export interface ProgressBarProps {
  value?: number
  showValue?: boolean
  mode?: 'determinate' | 'indeterminate'
}

// ============================================================
// ProgressSpinner
// ============================================================

export interface ProgressSpinnerProps {
  strokeWidth?: number | string
  fill?: string
  animationDuration?: string
}

// ============================================================
// RadioButton
// ============================================================

export interface RadioButtonProps {
  modelValue?: string | number | boolean | object | null
  value: string | number | boolean | object
  label?: string
  name?: string
  size?: Size
  isDisabled?: boolean
  isInvalid?: boolean
}

export interface RadioButtonEmits {
  (e: 'update:modelValue', value: string | number | boolean | object): void
  (e: 'change', payload: { value: string | number | boolean | object; originalEvent: Event }): void
}

// ============================================================
// Rating
// ============================================================

export interface RatingProps {
  ariaLabel?: string
  modelValue?: number | null
  stars?: number
  readonly?: boolean
  isDisabled?: boolean
  cancel?: boolean
}

export interface RatingEmits {
  (e: 'update:modelValue', value: number | null): void
  (e: 'change', payload: { value: number | null }): void
}

// ============================================================
// Row
// ============================================================

export interface RowProps {
  isSelected?: boolean
  isStriped?: boolean
  isHoverable?: boolean
}

// ============================================================
// ScrollPanel
// ============================================================

export interface ScrollPanelProps {
  style?: Record<string, string | number> | string
  step?: number
}

// ============================================================
// ScrollTop
// ============================================================

export interface ScrollTopProps {
  threshold?: number
  behavior?: 'smooth' | 'auto' | 'instant'
  target?: string
}

export interface ScrollTopEmits {
  (e: 'click'): void
}

// ============================================================
// Select
// ============================================================

export interface SelectProps {
  ariaDescribedby?: string
  modelValue?: string | number | boolean | object | null
  options?: unknown[]
  optionLabel?: string
  optionValue?: string
  placeholder?: string
  name?: string
  size?: Size
  isDisabled?: boolean
  isInvalid?: boolean
}

export interface SelectEmits {
  (e: 'update:modelValue', value: unknown): void
  (e: 'change', payload: { value: unknown; originalEvent: Event }): void
}

// ============================================================
// SelectButton
// ============================================================

export interface SelectButtonProps {
  modelValue?: string | number | object | unknown[] | null
  options: unknown[]
  optionLabel?: string | ((option: unknown) => string) | null
  optionValue?: string | ((option: unknown) => unknown) | null
  optionDisabled?: string | ((option: unknown) => boolean) | null
  multiple?: boolean
  allowEmpty?: boolean
  isDisabled?: boolean
  ariaLabel?: string
}

export interface SelectButtonEmits {
  (e: 'update:modelValue', value: unknown): void
  (e: 'change', payload: { originalEvent: Event; value: unknown }): void
}

// ============================================================
// Sidebar
// ============================================================

export interface SidebarProps {
  visible?: boolean
  header?: string
  position?: 'left' | 'right'
  fullScreen?: boolean
  closable?: boolean
  dismissable?: boolean
  closeOnEscape?: boolean
  blockScroll?: boolean
}

export interface SidebarEmits {
  (e: 'update:visible', value: boolean): void
  (e: 'show'): void
  (e: 'hide'): void
}

// ============================================================
// Skeleton
// ============================================================

export interface SkeletonProps {
  shape?: 'rectangle' | 'circle'
  width?: string | null
  height?: string | null
  borderRadius?: string | null
  animation?: 'wave' | 'none'
}

// ============================================================
// Slider
// ============================================================

export interface SliderProps {
  ariaLabel?: string
  ariaDescribedby?: string
  modelValue?: number
  min?: number
  max?: number
  step?: number
  name?: string
  isDisabled?: boolean
}

export interface SliderEmits {
  (e: 'update:modelValue', value: number): void
  (e: 'change', payload: { value: number; originalEvent: Event }): void
}

// ============================================================
// SpeedDial
// ============================================================

export interface SpeedDialItem {
  label?: string
  icon?: string
  command?: (event: { originalEvent: Event; item: SpeedDialItem }) => void
  [key: string]: unknown
}

export interface SpeedDialProps {
  model?: SpeedDialItem[]
  direction?: 'up' | 'down' | 'left' | 'right'
  type?: 'linear' | 'circle' | 'semi-circle' | 'quarter-circle'
  radius?: number
  showLabels?: boolean
  openOnHover?: boolean
}

export interface SpeedDialEmits {
  (e: 'click', item: SpeedDialItem): void
  (e: 'show'): void
  (e: 'hide'): void
}

// ============================================================
// SplitButton
// ============================================================

export interface SplitButtonProps {
  label?: string
  icon?: string
  model?: MenuItem[]
  severity?: 'primary' | 'secondary' | 'outlined'
  size?: Size
  isDisabled?: boolean
}

export interface SplitButtonEmits {
  (e: 'click', event: Event): void
}

// ============================================================
// Splitter
// ============================================================

export interface SplitterProps {
  layout?: Orientation
  gutterSize?: number
  stateKey?: string | null
  stateStorage?: 'local' | 'session'
}

export interface SplitterEmits {
  (e: 'resizestart', payload: { originalEvent: Event; sizes: number[] }): void
  (e: 'resize', payload: { originalEvent: Event; sizes: number[] }): void
  (e: 'resizeend', payload: { originalEvent: Event; sizes: number[] }): void
}

// ============================================================
// SplitterPanel
// ============================================================

export interface SplitterPanelProps {
  size?: number
  minSize?: number
}

// ============================================================
// Steps
// ============================================================

export interface StepItem {
  label: string
  disabled?: boolean
  [key: string]: unknown
}

export interface StepsProps {
  model?: StepItem[]
  activeIndex?: number
  isReadonly?: boolean
}

export interface StepsEmits {
  (e: 'update:activeIndex', value: number): void
  (e: 'step-click', payload: { originalEvent: Event; item: StepItem; index: number }): void
}

// ============================================================
// TabMenu
// ============================================================

export interface TabMenuProps {
  model?: MenuItem[]
  activeIndex?: number
}

export interface TabMenuEmits {
  (e: 'update:activeIndex', value: number): void
  (e: 'tab-change', payload: { originalEvent: Event; item: MenuItem; index: number }): void
}

// ============================================================
// Tabs
// ============================================================

export interface TabsProps {
  activeIndex?: number
  ariaLabel?: string
}

export interface TabsEmits {
  (e: 'update:activeIndex', value: number): void
  (e: 'tabChange', payload: { originalEvent: Event; index: number }): void
  (e: 'tabClick', payload: { originalEvent: Event; index: number }): void
}

// ============================================================
// TabPanel
// ============================================================

export interface TabPanelProps {
  header: string
  disabled?: boolean
}

// ============================================================
// Tag
// ============================================================

export interface TagProps {
  value?: string | null
  color?: 'brand' | 'accent' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'
  icon?: string | null
  rounded?: boolean
}

// ============================================================
// Terminal
// ============================================================

export interface TerminalProps {
  prompt?: string
  welcomeMessage?: string | null
  ariaLabel?: string
}

export interface TerminalEmits {
  (e: 'command', text: string, callback: (response: string) => void): void
}

// ============================================================
// Textarea
// ============================================================

export interface TextareaProps {
  ariaDescribedby?: string
  modelValue?: string
  rows?: number | string
  cols?: number | string
  placeholder?: string
  isDisabled?: boolean
  isInvalid?: boolean
  autoResize?: boolean
}

export interface TextareaEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'input', payload: { value: string; originalEvent: Event }): void
}

// ============================================================
// TieredMenu
// ============================================================

export interface TieredMenuProps {
  model?: MenuItem[]
  popup?: boolean
}

export interface TieredMenuEmits {
  (e: 'item-click', payload: { originalEvent: Event; item: MenuItem }): void
  (e: 'show', event: Event): void
  (e: 'hide'): void
}

// ============================================================
// TieredMenuSub
// ============================================================

export interface TieredMenuSubProps {
  items?: MenuItem[]
}

export interface TieredMenuSubEmits {
  (e: 'item-click', payload: { originalEvent: Event; item: MenuItem }): void
}

// ============================================================
// Timeline
// ============================================================

export interface TimelineEvent {
  color?: 'primary' | 'success' | 'warning' | 'danger' | string
  [key: string]: unknown
}

export interface TimelineProps {
  value: TimelineEvent[]
  align?: 'left' | 'right' | 'alternate'
  layout?: Orientation
}

// ============================================================
// Toast
// ============================================================

export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center'

export interface ToastMessage {
  severity?: 'default' | Severity
  summary?: string
  detail?: string
  closable?: boolean
  life?: number
  group?: string | null
  [key: string]: unknown
}

export interface ToastProps {
  position?: ToastPosition
  group?: string | null
  showIcon?: boolean
  showProgress?: boolean
}

// ============================================================
// ToggleButton
// ============================================================

export interface ToggleButtonProps {
  modelValue?: boolean
  onLabel?: string
  offLabel?: string
  onIcon?: string
  offIcon?: string
  size?: Size
  isDisabled?: boolean
}

export interface ToggleButtonEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', payload: { value: boolean; originalEvent: Event }): void
}

// ============================================================
// ToggleSwitch
// ============================================================

export interface ToggleSwitchProps {
  modelValue?: boolean
  name?: string
  isDisabled?: boolean
}

export interface ToggleSwitchEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', payload: { value: boolean; originalEvent: Event }): void
}

// ============================================================
// Toolbar
// ============================================================

// Toolbar has no props — it's a slot-only layout component
export interface ToolbarProps {}

// ============================================================
// Tooltip
// ============================================================

export interface TooltipProps {
  content: string
  position?: Position
  showDelay?: number
  hideDelay?: number
  disabled?: boolean
}

// ============================================================
// Tree
// ============================================================

export interface TreeProps {
  modelValue?: string | number | (string | number)[] | null
  nodes?: TreeNode[]
  expandedKeys?: (string | number)[]
  selectionMode?: 'single' | 'multiple' | 'checkbox' | null
  filter?: boolean
  labelField?: string
  keyField?: string
  childrenField?: string
  isDisabled?: boolean
}

export interface TreeEmits {
  (e: 'update:modelValue', value: unknown): void
  (e: 'update:expandedKeys', value: (string | number)[]): void
  (e: 'node-select', payload: { node: TreeNode; key: string | number; selectedKeys?: (string | number)[] }): void
  (e: 'node-expand', payload: { node: TreeNode; key: string | number }): void
  (e: 'node-collapse', payload: { node: TreeNode; key: string | number }): void
  (e: 'filter', payload: { value: string }): void
}

// ============================================================
// TreeSelect
// ============================================================

export interface TreeSelectProps {
  modelValue?: string | number | (string | number)[] | object | null
  options?: TreeNode[]
  selectionMode?: 'single' | 'checkbox'
  placeholder?: string
  filter?: boolean
  labelField?: string
  keyField?: string
  childrenField?: string
  size?: Size
  isDisabled?: boolean
  isInvalid?: boolean
}

export interface TreeSelectEmits {
  (e: 'update:modelValue', value: unknown): void
  (e: 'change', payload: { value: unknown; node?: TreeNode }): void
}

// ============================================================
// TreeTable
// ============================================================

export interface TreeTableColumn {
  field: string
  header: string
  style?: Record<string, string>
  [key: string]: unknown
}

export interface TreeTableProps {
  modelValue?: string | number | (string | number)[] | null
  nodes?: TreeNode[]
  columns?: TreeTableColumn[]
  expandedKeys?: (string | number)[]
  selectionMode?: 'single' | 'multiple' | 'checkbox' | null
  keyField?: string
  childrenField?: string
  striped?: boolean
  isDisabled?: boolean
}

export interface TreeTableEmits {
  (e: 'update:modelValue', value: unknown): void
  (e: 'update:expandedKeys', value: (string | number)[]): void
  (e: 'node-select', payload: { node: TreeNode; key: string | number; selectedKeys?: (string | number)[] }): void
  (e: 'node-expand', payload: { node: TreeNode; key: string | number }): void
  (e: 'node-collapse', payload: { node: TreeNode; key: string | number }): void
}

// ============================================================
// VirtualScroller
// ============================================================

export interface VirtualScrollerProps {
  items?: unknown[]
  itemSize?: number
  scrollHeight?: string
  orientation?: Orientation
  numToleratedItems?: number
  loading?: boolean
  striped?: boolean
  showBorder?: boolean
  dataKey?: string | null
}

export interface VirtualScrollerEmits {
  (e: 'scroll', payload: { originalEvent: Event; scrollPosition: number }): void
  (e: 'scroll-index-change', payload: { first: number; last: number }): void
}

// ============================================================
// Website Components
// ============================================================

// Hero
export interface HeroProps {
  title?: string
  subtitle?: string
  alignment?: 'left' | 'center' | 'right'
  backgroundImage?: string
  overlay?: boolean
  fullHeight?: boolean
}

// FeatureGrid
export interface FeatureItem {
  icon?: string
  title: string
  description: string
}

export interface FeatureGridProps {
  columns?: 2 | 3 | 4
  features?: FeatureItem[]
  variant?: 'card' | 'minimal' | 'icon-top'
}

// PricingTable
export interface PricingCardProps {
  name: string
  price: string | number
  currency?: string
  interval?: 'month' | 'year'
  features?: string[]
  highlighted?: boolean
  ctaLabel?: string
  ctaAction?: () => void
}

export interface PricingTableProps {
  plans?: PricingCardProps[]
  columns?: 2 | 3 | 4
}

// Testimonial
export interface TestimonialProps {
  quote: string
  author: string
  role?: string
  company?: string
  avatar?: string
  rating?: number
  variant?: 'card' | 'minimal'
}

// Footer
export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  title: string
  links: FooterLink[]
}

export interface FooterSocialLink {
  label: string
  href: string
  icon: string
}

export interface FooterProps {
  columns?: FooterColumn[]
  logo?: string
  copyright?: string
  socialLinks?: FooterSocialLink[]
}

// Section
export interface SectionProps {
  title?: string
  subtitle?: string
  variant?: 'default' | 'muted' | 'accent' | 'dark'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  id?: string
}

// CTA
export interface CTAProps {
  title?: string
  description?: string
  variant?: 'banner' | 'card' | 'inline'
  alignment?: 'left' | 'center' | 'right'
}

// LogoCloud
export interface LogoItem {
  src: string
  alt: string
  href?: string
}

export interface LogoCloudProps {
  logos?: LogoItem[]
  title?: string
  grayscale?: boolean
  columns?: number
}

// Stats
export interface StatItem {
  value: string | number
  label: string
  prefix?: string
  suffix?: string
  icon?: string
}

export interface StatsProps {
  stats?: StatItem[]
  columns?: 2 | 3 | 4
}

// FAQ
export interface FAQItem {
  question: string
  answer: string
}

export interface FAQProps {
  items?: FAQItem[]
  variant?: 'default' | 'separated' | 'bordered'
}

// ============================================================
// PasswordInput
// ============================================================

export type PasswordStrength = 'weak' | 'fair' | 'strong' | 'very-strong';
export type RequireStrength = 'none' | 'weak' | 'fair' | 'strong';

export interface PasswordInputProps {
  modelValue?: string
  showStrength?: boolean
  showCriteria?: boolean
  minLength?: number
  confirmValue?: string
  placeholder?: string
  confirmPlaceholder?: string
  isDisabled?: boolean
  isInvalid?: boolean
  label?: string
  size?: Size
  /** Require password to meet minimum strength level for validation */
  requireStrength?: RequireStrength
  /** Custom error message when strength requirement not met (also available as slot) */
  errorMessage?: string
}

export interface PasswordInputEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'update:confirmValue', value: string): void
  (e: 'strength-change', level: PasswordStrength): void
  /** Emitted when overall validity changes (strength + confirm match) */
  (e: 'valid', isValid: boolean): void
  (e: 'focus', payload: { originalEvent: FocusEvent }): void
  (e: 'blur', payload: { originalEvent: FocusEvent }): void
}

// ============================================================
// Device Frames (PhoneFrame, TabletFrame, DesktopFrame)
// ============================================================

export type DeviceFrameSize = 'sm' | 'md' | 'lg'

export interface PhoneFrameProps {
  /** Device size preset. Defaults to 'md' (390x800 portrait). */
  size?: DeviceFrameSize
  /** Override bezel (device body) color. Defaults to #141414. */
  bezelColor?: string
  /** Override screen (viewport) background color. Defaults to #fdfbf5. */
  screenColor?: string
}

export interface TabletFrameProps {
  /** Device size preset. Defaults to 'md' (720x1000 portrait). */
  size?: DeviceFrameSize
  /** Override bezel (device body) color. Defaults to #141414. */
  bezelColor?: string
  /** Override screen (viewport) background color. Defaults to #fdfbf5. */
  screenColor?: string
}

export interface DesktopFrameProps {
  /** Window size preset. Defaults to 'md' (1280x800). */
  size?: DeviceFrameSize
  /** Override bezel (window body) color. Defaults to #141414. */
  bezelColor?: string
  /** Override screen (viewport) background color. Defaults to #fdfbf5. */
  screenColor?: string
}
