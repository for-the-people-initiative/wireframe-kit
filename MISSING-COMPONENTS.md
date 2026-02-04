# FTP Design System — Component Gap Analysis

**Date:** 2026-01-28
**FTP Components:** 93 | **Compared against:** MUI, Vuetify, shadcn/ui, Radix Primitives, Ant Design

---

## A. Our 93 Components

| # | Component | Category |
|---|-----------|----------|
| 1 | Accordion | Layout |
| 2 | AtmosphericBackground | Decorative |
| 3 | AutoComplete | Input |
| 4 | Avatar | Data Display |
| 5 | Badge | Data Display |
| 6 | BlockUI | Utility |
| 7 | Breadcrumb | Navigation |
| 8 | Button | Input |
| 9 | Calendar | Input |
| 10 | Card | Layout |
| 11 | Carousel | Data Display |
| 12 | Chart | Data Display |
| 13 | Checkbox | Input |
| 14 | Chip | Data Display |
| 15 | ColorPicker | Input |
| 16 | Column | Layout |
| 17 | ColumnGroup | Layout |
| 18 | ConfirmDialog | Overlay |
| 19 | ConfirmPopup | Overlay |
| 20 | ContextMenu | Menu |
| 21 | DataTable | Data Display |
| 22 | DataView | Data Display |
| 23 | Dialog | Overlay |
| 24 | Divider | Layout |
| 25 | Dock | Navigation |
| 26 | Drawer | Overlay |
| 27 | Dropdown | Input |
| 28 | Editor | Input |
| 29 | FieldSet | Layout |
| 30 | FileUpload | Input |
| 31 | Galleria | Data Display |
| 32 | Image | Data Display |
| 33 | ImageCompare | Data Display |
| 34 | InPlace | Utility |
| 35 | InlineMessage | Feedback |
| 36 | InputChips | Input |
| 37 | InputGroup | Input |
| 38 | InputGroupAddon | Input |
| 39 | InputIcon | Input |
| 40 | InputMask | Input |
| 41 | InputNumber | Input |
| 42 | InputOtp | Input |
| 43 | InputSwitch | Input |
| 44 | InputText | Input |
| 45 | Knob | Input |
| 46 | ListBox | Input |
| 47 | MegaMenu | Menu |
| 48 | Menu | Menu |
| 49 | MenuBar | Menu |
| 50 | Message | Feedback |
| 51 | MeterGroup | Data Display |
| 52 | MultiSelect | Input |
| 53 | OrderList | Data Display |
| 54 | OrganizationChart | Data Display |
| 55 | OverlayPanel | Overlay |
| 56 | Paginator | Navigation |
| 57 | Panel | Layout |
| 58 | PanelMenu | Menu |
| 59 | ParticleBackground | Decorative |
| 60 | PickList | Data Display |
| 61 | PopOver | Overlay |
| 62 | ProgressBar | Feedback |
| 63 | ProgressSpinner | Feedback |
| 64 | RadioButton | Input |
| 65 | Rating | Input |
| 66 | Row | Layout |
| 67 | ScrollPanel | Layout |
| 68 | ScrollTop | Utility |
| 69 | Select | Input |
| 70 | SelectButton | Input |
| 71 | Sidebar | Navigation |
| 72 | Skeleton | Feedback |
| 73 | Slider | Input |
| 74 | SpeedDial | Navigation |
| 75 | SplitButton | Input |
| 76 | Splitter | Layout |
| 77 | Steps | Navigation |
| 78 | TabMenu | Navigation |
| 79 | Tabs | Navigation |
| 80 | Tag | Data Display |
| 81 | Terminal | Utility |
| 82 | Textarea | Input |
| 83 | TieredMenu | Menu |
| 84 | Timeline | Data Display |
| 85 | Toast | Feedback |
| 86 | ToggleButton | Input |
| 87 | ToggleSwitch | Input |
| 88 | Toolbar | Layout |
| 89 | Tooltip | Overlay |
| 90 | Tree | Data Display |
| 91 | TreeSelect | Input |
| 92 | TreeTable | Data Display |
| 93 | VirtualScroller | Utility |

---

## B. Missing Common Components

Components found in **2+ major design systems** that FTP lacks:

| # | Component | Description | Priority | Present In | Use Case |
|---|-----------|-------------|----------|------------|----------|
| 1 | **Alert** | Prominent feedback banner (differs from Message/Toast — persistent, dismissible) | 🔴 High | MUI, Vuetify, shadcn, Ant | Form errors, system warnings, info banners |
| 2 | **Table (simple)** | Lightweight table without DataTable's sorting/filtering overhead | 🟡 Medium | MUI, shadcn, Ant | Simple data display, pricing tables |
| 3 | **Navigation Drawer / Nav** | Persistent side nav with links, collapsible sections | 🔴 High | MUI, Vuetify, shadcn, Ant | App shell navigation |
| 4 | **App Bar / Top Bar** | Fixed top application bar with title, actions, nav | 🔴 High | MUI, Vuetify, Ant | App shell header |
| 5 | **Bottom Navigation** | Mobile tab bar at bottom of screen | 🟡 Medium | MUI, Vuetify, Ant | Mobile app navigation |
| 6 | **Snackbar** | Brief auto-dismissing message at screen edge (lighter than Toast) | 🟢 Low | MUI, Vuetify | Quick action confirmations |
| 7 | **Stepper** (enhanced) | Vertical + horizontal with content panels (Steps is nav-only) | 🟡 Medium | MUI, Vuetify, Ant | Multi-step forms, onboarding |
| 8 | **Transfer List** | Dual-list with move between (similar to PickList but standard pattern) | 🟢 Low | MUI, Ant | Permission assignment, feature selection |
| 9 | **Collapse / Collapsible** | Standalone animated show/hide panel (not accordion) | 🟡 Medium | MUI, shadcn, Radix, Ant | FAQ, expandable sections |
| 10 | **Date Picker** | Dedicated date input with popup calendar | 🔴 High | MUI, Vuetify, Ant | Date selection in forms |
| 11 | **Time Picker** | Time selection input | 🟡 Medium | MUI, Vuetify, Ant | Scheduling, appointments |
| 12 | **Date Range Picker** | Select start + end date | 🔴 High | Ant, MUI (date-fns) | Booking, reporting, filters |
| 13 | **Floating Action Button (FAB)** | Circular prominent action button | 🟢 Low | MUI, Vuetify | Primary action (mobile) |
| 14 | **Icon Button** | Button variant specifically for icons | 🟡 Medium | MUI, Vuetify, Ant | Toolbars, card actions |
| 15 | **Link** | Styled anchor with router integration | 🟢 Low | MUI, shadcn, Ant | Inline navigation |
| 16 | **Typography** | Text component with variants (h1-h6, body, caption) | 🟡 Medium | MUI, Vuetify, Ant | Consistent text styling |
| 17 | **Grid / Layout** | CSS grid/flexbox layout system | 🔴 High | MUI, Vuetify, Ant | Page layout |
| 18 | **Stack** | Flexbox stack with gap/direction | 🟡 Medium | MUI | Quick layouts |
| 19 | **Container** | Max-width centered wrapper | 🟢 Low | MUI, Vuetify | Page centering |
| 20 | **List** | Structured list with items, icons, actions | 🟡 Medium | MUI, Vuetify, Ant | Settings, menus, contact lists |
| 21 | **Popconfirm** | Inline confirmation bubble on element | 🟢 Low | Ant | Delete confirmations |
| 22 | **Empty State** | Placeholder for no-data scenarios | 🟡 Medium | Ant | Empty tables, search results |
| 23 | **Result** | Success/error/info outcome page | 🟡 Medium | Ant | Form submission, payment result |
| 24 | **Statistic** | Display number with label and optional trend | 🟡 Medium | Ant | Dashboards, KPIs |
| 25 | **Descriptions** | Key-value detail display | 🟢 Low | Ant | Detail pages, profiles |
| 26 | **Segmented Control** | iOS-style toggle between options | 🟡 Medium | Ant, shadcn | View mode switching |
| 27 | **Affix / Sticky** | Pin element on scroll | 🟢 Low | Ant | Sticky headers/sidebars |
| 28 | **BackTop** | Scroll-to-top button (we have ScrollTop, this is more styled) | 🟢 Low | Ant | Long pages |
| 29 | **Watermark** | Background watermark overlay | 🟢 Low | Ant | Document protection |
| 30 | **Form** | Form wrapper with validation, layout, error handling | 🔴 High | MUI, Vuetify, Ant | Every form |

---

## C. Missing Modern/Trending Components (shadcn/Radix ecosystem)

| # | Component | Description | Priority | Present In |
|---|-----------|-------------|----------|------------|
| 1 | **Command (cmdk)** | Command palette / search overlay (⌘K) | 🔴 High | shadcn, Vercel |
| 2 | **Combobox** | Searchable select with autocomplete (differs from AutoComplete — dropdown-first) | 🟡 Medium | shadcn, Radix, Ark |
| 3 | **Sheet** | Slide-in panel from any edge (mobile-first Drawer alternative) | 🟡 Medium | shadcn |
| 4 | **Sonner / Toast (stacked)** | Modern stacked toast with rich content, promises | 🟡 Medium | shadcn (Sonner) |
| 5 | **Data Table (TanStack)** | Column-driven table with sorting, filtering, pagination built on TanStack Table | 🟢 Low | shadcn |
| 6 | **Aspect Ratio** | Maintain element aspect ratio | 🟢 Low | Radix, shadcn |
| 7 | **Scroll Area** | Custom styled scrollbar (different from ScrollPanel — cross-browser consistent) | 🟡 Medium | Radix, shadcn |
| 8 | **Separator** | Semantic divider with orientation (like Divider but with Radix accessibility) | 🟢 Low | Radix, shadcn |
| 9 | **Hover Card** | Content preview on hover | 🟡 Medium | Radix, shadcn |
| 10 | **Navigation Menu** | Accessible desktop nav with dropdowns and mega-menu content | 🟡 Medium | Radix, shadcn |
| 11 | **Toggle Group** | Multi-select toggle buttons | 🟢 Low | Radix, shadcn |
| 12 | **Resizable** | Resizable panels (like Splitter but modern API) | 🟢 Low | shadcn |
| 13 | **Drawer (Vaul)** | Mobile-native bottom drawer with pull gesture | 🟡 Medium | shadcn (Vaul) |
| 14 | **Input OTP (enhanced)** | Animated OTP input with auto-focus (we have InputOtp, this is UX-enhanced) | 🟢 Low | shadcn |
| 15 | **Calendar (range)** | Calendar with range selection support | 🟡 Medium | shadcn |
| 16 | **Carousel (Embla)** | Modern carousel with swipe, snap, loop | 🟢 Low | shadcn (Embla) |
| 17 | **Number Field** | Accessible number input with increment/decrement buttons | 🟢 Low | Ark, React Aria |
| 18 | **Collapsible** | Standalone collapsible without accordion wrapper | 🟡 Medium | Radix, shadcn |
| 19 | **Alert Dialog** | Accessible modal requiring user action (not dismissible by clicking outside) | 🔴 High | Radix, shadcn |
| 20 | **Progress (circular + linear combined)** | Unified progress with both variants | 🟢 Low | shadcn |

---

## D. Unique FTP Components (Not in Major Libraries)

| Component | What Makes It Unique |
|-----------|---------------------|
| **AtmosphericBackground** | Animated atmospheric/weather background effects — no equivalent in any major DS |
| **ParticleBackground** | Particle animation backgrounds — unique decorative component |
| **ImageCompare** | Before/after image slider — rare, usually a separate library |
| **Terminal** | In-app terminal emulator component — very niche |
| **BlockUI** | Overlay blocking interaction on a section — PrimeFaces heritage, uncommon elsewhere |
| **InPlace** | Click-to-edit inline display — unique interaction pattern |
| **Dock** | macOS-style dock navigation — distinctive navigation pattern |
| **MegaMenu** | Full mega menu — others have simple dropdowns, not full mega menus |
| **SpeedDial** | Radial/linear action menu — MUI has FAB but not the full speed dial pattern |
| **OrganizationChart** | Org chart component — typically requires separate charting library |
| **Knob** | Rotary dial input — very rare in web component libraries |
| **MeterGroup** | Grouped meter visualization — unique data display |
| **Galleria** | Full-featured image gallery with thumbnails — not a standard DS component |
| **PickList** | Dual-list reorder component — PrimeFaces heritage |
| **OrderList** | Sortable list with controls — PrimeFaces heritage |

---

## E. Top 10 Prioritized Recommendations

### Must-Have (High Priority)

| # | Component | Rationale |
|---|-----------|-----------|
| **1** | **Command Palette** | Modern UX standard. Every SaaS app (Vercel, Linear, Notion, GitHub) has ⌘K. Differentiator for power users. |
| **2** | **Date Picker / Date Range Picker** | Calendar exists but no dedicated date input. Critical for forms — booking, filtering, reporting. |
| **3** | **Alert / Banner** | Message and Toast aren't enough. Need persistent, page-level alerts for errors, warnings, success. |
| **4** | **Form** | No form wrapper with validation/layout. Every other DS has this. Forms are the #1 use case for component libraries. |
| **5** | **App Bar / Top Bar** | Missing the standard app shell header. Toolbar is generic; need a proper fixed-position app bar. |

### Should-Have (Medium Priority)

| # | Component | Rationale |
|---|-----------|-----------|
| **6** | **Navigation Menu** | Radix-style accessible nav with dropdown panels. Current MenuBar is basic. |
| **7** | **Alert Dialog** | Blocking confirmation modal (distinct from Dialog). Important for destructive actions. |
| **8** | **Hover Card** | Content preview on hover — useful for user profiles, link previews. Growing UX pattern. |
| **9** | **Collapsible** | Standalone expand/collapse without Accordion overhead. FAQ, settings, detail sections. |
| **10** | **Typography** | Text component with semantic variants. Foundation for consistent visual hierarchy. |

---

## Summary

| Category | Count |
|----------|-------|
| FTP Components | 93 |
| Missing Common (found in 2+ DS) | 30 |
| Missing Modern/Trending | 20 |
| Unique to FTP | 15 |
| **Total gap** | **~50 meaningful components** |

FTP's strength: Rich data components (DataTable, Tree, TreeTable, Chart, OrganizationChart) and unique decorative/interaction components (AtmosphericBackground, ParticleBackground, ImageCompare, Terminal).

FTP's gaps: Modern UX patterns (Command palette, Sheet), foundational layout (Grid, Typography, Stack), and form infrastructure (Form wrapper, Date pickers).
