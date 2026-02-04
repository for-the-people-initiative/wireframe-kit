# For the People Design System — Deep Analysis

**Package:** `for-the-people-design-system` v1.1.1  
**Origin:** Provincie Zuid-Holland (PZH) style library  
**Stack:** Vue 3 + SCSS + Design Tokens (JSON → CSS/SCSS/TS)  
**License:** MIT  
**Analysis date:** 2025-07-17

---

## 1. Architecture Analysis

### 1.1 Token System: Primitives → Semantics → Components

The token architecture follows a clean 3-tier hierarchy:

**Tier 1 — Primitives** (`tokens/primitives/`)
- `color.json`: 12 color scales (neutral, navy, blue, purple, orange, amber, yellow, green, teal, cyan, red, pink) each with 50-950 steps
- `spacing.json`: Fibonacci-like scale (0→178px in 11 steps: 0, 2, 4, 6, 10, 16, 26, 42, 68, 110, 178)
- `radius.json`: 8 values (0→9999px), also Fibonacci-influenced (0, 2, 3, 5, 8, 13, 21, 9999)
- `shadow.json`: 5 elevation levels with dual-shadow pattern (ambient + direct)

**Tier 2 — Semantics** (`tokens/semantics/`)
- `color.json`: Maps primitives to purpose-driven names (surface.*, text.*, border.*, feedback.*, accent.*, intent.*, focus.*, brand.*)
- `spacing.json`: Named scales (inset.*, stack.*, inline.*) mapping to primitive spacing values
- `radius.json`: Named scales (none, subtle, default, rounded, large, pill)
- `shadow.json`: Named scales (xs through xl)

References use `{primitive.step}` syntax, e.g. `{navy.900}` → `#0a0e1f`

**Tier 3 — Components** (`tokens/components/`)
- 96 component token files, each defining component-specific design decisions
- Example: `button.json` defines background, text, border for each variant × state, plus size tokens (sm/md/lg), focus ring, transitions
- References semantic tokens: `{intent.action.default}`, `{focus.ring}`, `{radius.default}`

### 1.2 Token Build Pipeline

Build script: `scripts/build-tokens.ts` (run via `tsx`)

**Outputs:**
| Output | Path | Purpose |
|--------|------|---------|
| CSS Custom Properties | `dist/css/tokens.css` | Runtime theming via `:root` vars |
| Dark theme overrides | `dist/css/theme-dark.css` | `[data-theme="dark"]` override layer |
| SCSS variables | `dist/scss/_tokens.scss` | SCSS `$var` → `var(--token)` bridge |
| TypeScript exports | `dist/ts/tokens.ts` | Token names array + type-safe token map |

**Key design decision:** SCSS variables wrap CSS custom properties (`$surface-canvas: var(--surface-canvas)`). This enables:
- SCSS compile-time usage in mixins
- Runtime theming via CSS custom property overrides
- Fallback values in component SCSS: `var(--button-bg, $button-bg)`

### 1.3 Component Structure Pattern

Every component follows this consistent pattern:
```
ComponentName/
├── ComponentName.vue    # SFC with <template>, <style src="./X.scss">, <script setup>
└── ComponentName.scss   # External SCSS file (BEM naming)
```

**Exceptions:**
- `AtmosphericBackground.vue` — inline `<style lang="scss">` (no separate .scss)
- `ParticleBackground.vue` — inline `<style lang="scss">`
- Sub-components: `AccordionTab.vue`, `ColumnGroupRow.vue`, `SplitterPanel.vue`, `TabPanel.vue`, `TieredMenuSub.vue`

**Vue pattern:** All components use `<script setup>` (Composition API). No Options API found.

**Props pattern:**
```js
defineProps({
  propName: {
    type: String,
    default: "value",
    validator: (v) => [...].includes(v),
  },
});
```

### 1.4 SCSS Organization

**Mixins** (`src/scss/mixins/`): 10 mixin files
| Mixin | Purpose |
|-------|---------|
| `accent-gradient` | Consistent gradient backgrounds (default/hover states) |
| `border` | 4-tier border system (subtle/default/strong/vibrant) |
| `breakpoint` | Responsive breakpoints (phone→wide-screen, NL StatCounter-based) |
| `container` | Container padding with responsive scaling |
| `grid` | Responsive grid (1→4→6 columns) |
| `levitation` | Shadow/elevation system (xs→xl) |
| `list` | List reset helper |
| `surface-atmospheric` | Rich layered background gradients with ambient glow + noise |
| `surface` | Simple surface background helper |
| `typography` | Responsive typography with 2 font families (Manrope headings, DM Sans body) |

**Utility Classes** (`src/scss/utility-classes/`):
- `utility-classes-spacing.scss` — PZH-prefixed spacing classes (`.pzh-m-1`, `.pzh-pt-2`, etc.)
- `utility-classes-typography.scss` — PZH-prefixed typography classes (`.pzh-heading-xl`, `.pzh-text-s`)

**SCSS in components:** BEM naming via `$c: component-name` variable pattern:
```scss
$c: button;
.#{$c} { ... }
.#{$c}__label { ... }
.#{$c}--variant-primary { ... }
```

Every component SCSS imports tokens with `@use "../../../dist/scss/tokens" as *`.

---

## 2. Component Inventory

### 93 Component Directories, ~98 Vue Files

#### Simple Components (props-only, minimal logic)
| Component | Props | Slots | Events | SCSS | A11y |
|-----------|-------|-------|--------|------|------|
| Avatar | image, label, size, shape | default | - | ✅ | - |
| Badge | value, size, severity | default | - | ✅ | - |
| BlockUI | blocked | default | - | ✅ | aria-busy |
| Breadcrumb | model, home | item | - | ✅ | nav, aria-label |
| Card | variant | header, title, subtitle, content, footer, default | - | ✅ | - |
| Chip | label, icon, image, removable | default | remove | ✅ | - |
| Column | field, header, sortable, width | body, header, footer | - | ✅ | - |
| ColumnGroup | type | default | - | ✅ | - |
| Divider | layout, type, align | default | - | ✅ | role=separator |
| Image | src, alt, width, preview | - | - | ✅ | alt text |
| InlineMessage | severity | default | - | ✅ | role=alert |
| InputGroup | - | default | - | ✅ | - |
| InputGroupAddon | - | default | - | ✅ | - |
| InputIcon | class | default | - | ✅ | - |
| Message | severity, closable | default | close | ✅ | role=alert |
| Panel | header, toggleable, collapsed | header, default | toggle | ✅ | - |
| ProgressBar | value, mode | - | - | ✅ | role=progressbar, aria-valuenow |
| ProgressSpinner | strokeWidth, fill | - | - | ✅ | role=progressbar |
| Row | - | default | - | ✅ | - |
| Skeleton | width, height, shape, animation | - | - | ✅ | aria-hidden |
| Tag | value, severity, rounded, icon | default | - | ✅ | - |
| Toolbar | - | start, center, end | - | ✅ | role=toolbar |

#### Medium Components (state management, v-model, events)
| Component | Lines | Key Features |
|-----------|-------|-------------|
| Accordion | ~90 | provide/inject for tabs, multi-open support |
| AccordionTab | sub | Consumes accordion context |
| AutoComplete | ~150 | Search, dropdown, keyboard nav |
| Button | ~70 | 4 variants, 3 sizes, loading state, icon positioning |
| Checkbox | ~80 | v-model, indeterminate, validation |
| Dropdown | ~110 | v-model, options, filter, keyboard |
| FieldSet | ~50 | Toggleable legend |
| InputChips | ~100 | Tag input with add/remove |
| InputMask | ~80 | Masked input |
| InputNumber | ~90 | Spinner, min/max, step |
| InputOtp | ~80 | OTP code input |
| InputSwitch | ~50 | Toggle switch |
| InputText | ~70 | v-model, validation, sizes, expose focus/blur/select |
| ListBox | ~80 | Single/multi select list |
| RadioButton | ~60 | v-model group |
| Rating | ~60 | Star rating, readonly |
| Select | ~112 | Dropdown select with filter |
| SelectButton | ~70 | Button group selection |
| Slider | ~90 | Range slider |
| Steps | ~60 | Step indicator |
| TabMenu | ~60 | Tab navigation |
| Tabs/TabPanel | ~80 | Tab content panels |
| Textarea | ~50 | Auto-resize textarea |
| ToggleButton | ~50 | Toggle button |
| ToggleSwitch | ~50 | Switch toggle |

#### Complex Components (compound behavior, teleport, animation)
| Component | Lines | Key Features |
|-----------|-------|-------------|
| Calendar | ~478 | Date picker, range, inline, locale, keyboard nav |
| Carousel | ~150 | Auto-play, navigation, responsive |
| ColorPicker | ~120 | HSV picker |
| ConfirmDialog | ~80 | Teleport, imperative API |
| ConfirmPopup | ~80 | Positioned confirm |
| ContextMenu | ~100 | Right-click positioned menu |
| DataTable | ~263 | Sort, paginate, striped, column slots |
| DataView | ~80 | List/grid data display |
| Dialog | ~150 | Modal, teleport, drag, escape, a11y (role=dialog, aria-modal, aria-labelledby) |
| Dock | ~80 | macOS-style dock |
| Drawer | ~100 | Slide-out panel |
| Editor | ~80 | Rich text editor wrapper |
| FileUpload | ~120 | Drag & drop upload |
| Galleria | ~120 | Image gallery |
| ImageCompare | ~80 | Before/after slider |
| MegaMenu | ~100 | Multi-column menu |
| Menu | ~60 | Popup/inline menu |
| MenuBar | ~80 | Top navigation bar |
| MeterGroup | ~60 | Multi-value meter |
| MultiSelect | ~130 | Multi-select dropdown |
| OrderList | ~80 | Drag-reorder list |
| OrganizationChart | ~80 | Org chart tree |
| OverlayPanel | ~80 | Floating panel |
| Paginator | ~80 | Page navigation |
| PanelMenu | ~80 | Collapsible menu tree |
| ParticleBackground | ~347 | Canvas-based particle/star system with parallax |
| AtmosphericBackground | ~120 | Cosmic gradient backgrounds + particles |
| PickList | ~100 | Dual-list transfer |
| PopOver | ~80 | Popover tooltip |
| ScrollPanel | ~60 | Custom scrollbar |
| ScrollTop | ~50 | Back to top button |
| Sidebar | ~80 | Side overlay |
| SpeedDial | ~80 | Floating action menu |
| SplitButton | ~70 | Button + dropdown |
| Splitter/SplitterPanel | ~80 | Resizable panels |
| Terminal | ~60 | Terminal emulator |
| TieredMenu/Sub | ~90 | Multi-level menu |
| Timeline | ~60 | Vertical timeline |
| Toast | ~120 | Notification system with auto-dismiss, progress bar |
| Tooltip | ~60 | Directive tooltip |
| Tree | ~80 | Tree view |
| TreeSelect | ~80 | Tree dropdown |
| TreeTable | ~100 | Tree + table hybrid |
| VirtualScroller | ~80 | Virtualized list |

---

## 3. Code Quality Audit

### 3.1 TypeScript Usage: ⚠️ WEAK

- **Props are NOT typed with TypeScript interfaces.** All components use plain JS `defineProps({})` with runtime validators, not `defineProps<Interface>()`.
- `dist/ts/tokens.ts` exports a string array + type union of token names — this is good.
- No `.ts` files in component source. No interfaces, no type exports for props/events.
- **Rating: 3/10** — Functional but misses TypeScript's main value.

### 3.2 Vue 3 Patterns: ✅ GOOD

- **All components use `<script setup>`** — modern, concise.
- Composition API throughout (ref, computed, watch, provide/inject).
- `defineEmits`, `defineProps`, `defineExpose`, `defineOptions` used correctly.
- `v-model` support via `modelValue` + `update:modelValue` emit pattern.
- Teleport used for Dialog, Toast, ConfirmDialog (correct pattern).
- TransitionGroup used for Toast animations.

### 3.3 SCSS Quality: ✅ GOOD with caveats

**Strengths:**
- Consistent BEM naming via `$c` variable pattern
- No `darken()` / `lighten()` / `adjust-hue()` calls found (no SCSS color function deprecation issues)
- Token-driven: all values reference CSS custom properties with SCSS fallbacks
- Double-value pattern: `var(--token, $scss-fallback)` enables both runtime and compile-time usage

**Concerns:**
- Utility classes still use old `pzh-` prefix and reference `../variables/spacers.scss` (legacy path, may break)
- `surface-atmospheric` mixin references `$navy-950` / `$navy-900` which are NOT in the token SCSS output (those are primitive-tier, only semantics are exported)
- `container.scss` references `../../dist/scss/tokens` with a relative path that goes outside `src/` — fragile

### 3.4 Accessibility: ⚠️ INCONSISTENT

**Good examples:**
- Dialog: `role="dialog"`, `aria-modal`, `aria-labelledby`, escape key handling, focus trap consideration
- Toast: `role="alert"`, `aria-live="assertive"`
- Button: `aria-disabled`, `aria-busy` for loading
- Checkbox: `aria-invalid` for validation
- InputText: `aria-invalid`
- ProgressBar: `role="progressbar"`, `aria-valuenow`

**Missing/Weak:**
- Many components lack ARIA attributes entirely (Card, Avatar, Badge, Chip, Tabs, etc.)
- No visible `aria-label` on icon-only buttons
- No focus trap implementation in Dialog (escape works, but focus isn't trapped in the modal)
- No `aria-describedby` for form validation messages
- No skip navigation or live regions beyond Toast
- Keyboard navigation is absent in: Carousel, Rating, Slider, ColorPicker, Calendar (unknown without reading all)

### 3.5 Bundle Size Considerations

- **No tree-shaking setup.** Package exports individual component paths (`./components/*`) which is good for manual imports.
- No barrel `index.ts` that would force bundling everything.
- Components import `ParticleBackground` from relative path (AtmosphericBackground depends on ParticleBackground).
- SCSS is external per-component — good for splitting.
- No `sideEffects: false` in package.json.

---

## 4. Issues & Improvements

### 4.1 Bugs & Anti-patterns

1. **Missing focus trap in Dialog** — Modal dialogs should trap focus. Currently only handles escape key. Users can Tab out of the modal.

2. **`headerId` generation uses `Math.random()`** (Dialog.vue ~L67) — Not SSR-safe. Should use `useId()` (Vue 3.5+) or a counter.

3. **`body.style.overflow = "hidden"` in Dialog** — Direct DOM manipulation. If multiple dialogs open, they'll fight over this. Should use a counter.

4. **Drag event listeners not cleaned up on Dialog hide** — `onDragEnd` removes listeners, but if the dialog closes while dragging, listeners leak. The `onUnmounted` cleanup helps but doesn't cover all cases.

5. **Toast auto-dismiss uses `setTimeout` without cleanup** — If the component unmounts before timeout fires, the callback will error. Should store timeout IDs and clear in `onUnmounted`.

6. **Legacy utility classes reference `../variables/spacers.scss`** — This path doesn't exist in the current structure. The utility classes are likely broken or point to a legacy file not included in the package.

7. **No `type="button"` on non-submit buttons** — Button component defaults to `type="button"` (good), but other components with `<button>` elements (Dialog close, Toast close) should verify this.

### 4.2 Missing Features for a Mature Design System

- **No form validation integration** (no `FormField` wrapper, no error message component)
- **No theme switching mechanism** (dark theme CSS exists but no JS toggle/provider)
- **No i18n support** (hardcoded strings: "No records found" in DataTable, "Close" aria-labels)
- **No RTL support**
- **No motion/animation tokens** (transitions are hardcoded per component)
- **No z-index scale token**
- **No opacity tokens**
- **No CSS container queries**

### 4.3 SCSS Deprecations

✅ **No deprecated SCSS functions found.** The codebase avoids `darken()`, `lighten()`, `saturate()`, and other deprecated color functions. All color manipulation is done at the token level.

⚠️ `@use` is correctly used everywhere (no `@import`). However, the `surface-atmospheric` mixin references `$navy-950` / `$navy-900` variables that don't exist in the generated `_tokens.scss` (only semantic tokens are exported, not primitives).

### 4.4 Inconsistencies

1. **Naming:** Some components use `isDisabled` (Button, Checkbox, InputText) while the HTML standard is `disabled`. This is intentional (avoids native attribute conflict) but should be documented.

2. **Event payload format:** Some emit raw values, others emit `{ value, originalEvent }` objects. No consistent pattern.

3. **Size prop values:** Consistently `sm/md/lg` across components ✅

4. **Variant naming:** Button uses `primary/secondary/outlined/text`. Card uses `default/highlighted`. No consistent severity system.

5. **`defineOptions({ name })` inconsistent:** Card has it, Button doesn't. DataTable has it. Most don't.

### 4.5 Missing Tests

**Zero test files found.** No `*.test.*`, `*.spec.*`, or `__tests__/` directories exist anywhere in the project. No test framework configured in `package.json`.

### 4.6 Missing Documentation

- No per-component documentation files
- No JSDoc on most props (DataTable has `/** */` comments, most others don't)
- README is in Dutch and describes old PZH Storybook workflow
- No changelog
- No migration guide

### 4.7 Missing Storybook

README mentions Storybook but no Storybook configuration exists in the package. The `dev` script runs `npm --prefix server run dev` suggesting a separate dev server, but no `server/` directory is included in the package.

---

## 5. Recommendations

### Priority 1: Critical Fixes
1. **Add focus trap to Dialog** — Use `@vueuse/core` `useFocusTrap` or implement manually
2. **Fix SSR-unsafe ID generation** — Replace `Math.random()` with `useId()` or atomic counter
3. **Fix body scroll locking** — Use counter-based approach or `@vueuse/core` `useScrollLock`
4. **Clean up setTimeout in Toast** — Store IDs, clear on unmount
5. **Fix/remove legacy utility class imports** — `../variables/spacers.scss` doesn't exist
6. **Export primitive tokens** — `$navy-950` etc. used in mixins but not exported; either export them or inline the values

### Priority 2: Quality Improvements
1. **Add TypeScript interfaces for all component props** — Move to `defineProps<ButtonProps>()` pattern, export interfaces
2. **Add unit tests** — Start with Vitest for logic-heavy components (DataTable, Accordion, Dialog, Toast, Calendar)
3. **Standardize event payloads** — Decide on `{ value, event }` object pattern and apply consistently
4. **Add `defineOptions({ name })` to all components** — Helps with DevTools
5. **Add `aria-label` to icon-only buttons** throughout
6. **Add keyboard navigation** to interactive components (Rating, Slider, ColorPicker, Carousel)
7. **Add `sideEffects: false`** to package.json for better tree-shaking

### Priority 3: New Components
1. **FormField** — Wrapper with label, error message, hint text, accessibility bindings
2. **ThemeProvider** — Vue provide/inject for theme switching with CSS class management
3. **Notification/Alert** — Persistent page-level notification (vs Toast which is temporary)
4. **DatePicker** — Modern alternative to Calendar (simpler API)
5. **Command/CommandPalette** — Keyboard-driven command menu
6. **Drawer** component improvements (already exists but could use composition with Dialog)

### Priority 4: Tooling
1. **Storybook 8** — Component playground with auto-docs from props
2. **Vitest + Vue Test Utils** — Unit testing
3. **Playwright Component Testing** — Visual regression
4. **Changesets** — Automated versioning and changelog
5. **Stylelint** — SCSS linting (BEM validation, token usage enforcement)
6. **ESLint + vue/essential** — Enforce Vue best practices
7. **Bundle analyzer** — Track component sizes

---

## 6. Roadmap Suggestion

### Phase 1: Stabilize (4-6 weeks)
- [ ] Fix critical bugs (focus trap, ID gen, scroll lock, timeout cleanup)
- [ ] Fix broken utility class imports
- [ ] Add TypeScript prop interfaces to all components
- [ ] Add `defineOptions({ name })` to all components
- [ ] Set up Vitest, write tests for 15 most-used components
- [ ] Standardize event payload format
- [ ] Update README (English, accurate setup instructions)
- [ ] Add `sideEffects` field to package.json

### Phase 2: Optimize (4-6 weeks)
- [ ] Audit and improve accessibility across all components (WCAG 2.1 AA)
- [ ] Add keyboard navigation to all interactive components
- [ ] Add CSS container query support where applicable
- [ ] Add motion tokens (duration, easing curves)
- [ ] Add z-index token scale
- [ ] Bundle size optimization (lazy-load heavy components like Calendar, DataTable)
- [ ] Add Stylelint + ESLint configuration
- [ ] Performance audit (ParticleBackground canvas rendering)

### Phase 3: Extend (6-8 weeks)
- [ ] Set up Storybook 8 with auto-docs
- [ ] Add FormField wrapper component
- [ ] Add ThemeProvider with dark mode toggle
- [ ] Add i18n support (externalize strings)
- [ ] Build documentation site (Storybook or VitePress)
- [ ] Add Playwright visual regression tests
- [ ] Add Changesets for automated versioning
- [ ] Publish type declarations (`*.d.ts`) for consuming TypeScript projects
- [ ] Consider RTL support

---

## Architecture Diagram

```
tokens/primitives/*.json     (raw values: colors, spacing, radius, shadow)
        ↓ {reference}
tokens/semantics/*.json      (purpose: surface.*, text.*, border.*, etc.)
        ↓ {reference}
tokens/components/*.json     (component-specific: button.*, card.*, etc.)
        ↓ build-tokens.ts
    ┌───┼───────────┐
    ↓   ↓           ↓
  CSS  SCSS         TS
  :root  $var:      tokenNames[]
  vars   var(--)    tokenValues{}
    ↓       ↓
    ↓   Component.scss (@use tokens)
    ↓       ↓
    └───→ Runtime CSS Custom Properties
          (theming via [data-theme="dark"])
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `package.json` | Package config, exports map |
| `tokens/primitives/color.json` | 12 color scales, foundation |
| `tokens/semantics/color.json` | 70+ semantic color tokens |
| `tokens/components/button.json` | Most detailed component token example |
| `dist/css/tokens.css` | Generated CSS custom properties |
| `dist/scss/_tokens.scss` | SCSS vars wrapping CSS vars |
| `dist/ts/tokens.ts` | TypeScript token names + values |
| `dist/css/theme-dark.css` | Dark theme overrides |
| `src/components/Button/Button.vue` | Best example of component pattern |
| `src/components/Dialog/Dialog.vue` | Most complex a11y example |
| `src/components/DataTable/DataTable.vue` | Most complex data component |
| `src/components/Toast/Toast.vue` | Imperative API pattern |
| `src/scss/mixins/typography.scss` | Responsive typography system |
| `src/scss/mixins/breakpoint.scss` | Responsive breakpoint system |
| `src/scss/mixins/accent-gradient.scss` | Brand gradient system |
| `src/scss/mixins/surface-atmospheric.scss` | Unique atmospheric backgrounds |
