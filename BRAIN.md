# For the People Design System — Brain

*Het visuele fundament onder alle For the People producten.*

---

## Status Quo

**Package:** `for-the-people-design-system` v1.1.1 (npm)
**Oorsprong:** PZH (Provincie Zuid-Holland) — geforked/hergebruikt
**Tech:** Vue 3, SCSS, Design Tokens (GEEN Storybook — bewuste keuze, geen zware deps)

### Wat er al is:
- 95 Vue 3 components (Button, Card, Drawer, DataTable, Dialog, etc.)
- Design tokens (SCSS variabelen → CSS custom properties)
- Utility classes (typography, spacing)
- Mixins (breakpoint, typography, grid, surface, levitation, etc.)
- Storybook development omgeving

### Wat er nodig is:
- [ ] Rebranding van PZH naar For the People eigen identiteit
- [ ] Opschonen: welke 95 components zijn relevant, welke niet?
- [ ] Eigen kleurenpalet, typografie, spacing schaal
- [ ] Dark mode als first-class citizen
- [ ] Documentatie
- [ ] Versiebeheer strategie

---

## Visie

Het design system moet:
1. **Consistent** — Alle FTP producten voelen als één familie
2. **Toegankelijk** — WCAG AA minimum, liefst AAA
3. **Flexibel** — Werkt voor web apps, widgets (SupportME), marketing sites
4. **Lichtgewicht** — Tree-shakeable, alleen laden wat je nodig hebt
5. **Themeable** — Dark/light mode, custom themes via tokens
6. **Open source** — Past bij de FTP missie

---

## Producten die het gaan gebruiken

| Product | Type | Specifieke behoeften |
|---|---|---|
| **My Health Journey** | Web app | Forms, data visualisatie, dashboards |
| **SupportME** | Embeddable widget | Ultra lichtgewicht, auto-theming, <10KB |
| **Purpose Tool** | Web app | Reflectie UI, progress tracking, radar charts |
| **FTP Website** | Marketing site | Landing pages, content, CTA's |

---

## Open vragen

- Welke components uit de huidige 95 zijn nodig?
- Eigen font of bestaand (Inter, Plus Jakarta Sans, etc.)?
- Kleurenpalet: wat is de FTP identiteit?
- Moeten we PrimeVue components wrappen of eigen bouwen?
- Hoe verhoudt SupportME's auto-theming zich tot het design system?
- Monorepo (alle producten) of separate packages?

---

## Fase 1: Bewijzen dat het werkt (PRIORITEIT)

**Doel:** Elke component bewijsbaar werkend, getest, gedocumenteerd.

- [ ] Toegang krijgen tot repository
- [ ] Alle 95 components doorlopen en inventariseren
- [ ] Unit tests schrijven per component (Vitest + Vue Test Utils)
- [ ] Visual regression tests opzetten (Chromatic of Percy)
- [ ] Accessibility audit per component (axe-core)
- [ ] Component demo/playground per component (alle states)
- [ ] Quality scorecard: per component een status (✅ werkt, ⚠️ issues, ❌ broken)
- [ ] Bug report met prioritering
- [ ] Browser compatibility check (Chrome, Firefox, Safari, Edge)

**Quality scorecard template:**
| Component | Unit Tests | A11y | Demo | Browser | Status |
|-----------|-----------|------|------|---------|--------|
| Button    | ✅        | ✅   | ✅   | ✅      | ✅ Ready |
| Card      | ⚠️        | ❌   | ✅   | ✅      | ⚠️ Issues |

## Fase 2: Opschonen & rebranden
- [ ] Components categoriseren: houden / aanpassen / verwijderen
- [ ] FTP visuele identiteit definiëren (kleuren, typo, spacing)
- [ ] PZH referenties verwijderen
- [ ] Component roadmap per product

## Fase 3: Volwassen maken
- [ ] Versioning strategie (SemVer, changelog)
- [ ] Contribution guidelines
- [ ] CI/CD pipeline (test, build, publish)
- [ ] Storybook deployment
- [ ] npm publish workflow

---

*Aangemaakt: 27 jan 2026*
