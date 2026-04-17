# wireframe-kit

A Vue 3 component library with a hand-drawn, sketchy aesthetic — for building low-fidelity mockups and wireframes of web apps.

Forked from the "For The People" design system and restyled: every component renders with wobbly borders, a handwritten font (Caveat), and a monochrome ink-on-paper palette. Images always become placeholder boxes labelled with their `alt` / intent text.

## Install

```bash
npm install @for-the-people-initiative/wireframe-kit
```

## Setup

Two things need to happen in your app:

1. **Import the tokens + wireframe global styles** (once, typically in your main entry):

   ```ts
   import '@for-the-people-initiative/wireframe-kit/css';
   import '@for-the-people-initiative/wireframe-kit/scss/fonts';
   import '@for-the-people-initiative/wireframe-kit/scss/wireframe';
   ```

2. **Render `<WireframeFilter />` once** at your app root. This injects the SVG filter that provides the sketchy wobble — components reference it via `filter: url(#wireframe-sketchy)`.

   ```vue
   <script setup>
   import WireframeFilter from '@for-the-people-initiative/wireframe-kit/components/WireframeFilter';
   </script>

   <template>
     <WireframeFilter />
     <!-- your app -->
   </template>
   ```

## Usage

```vue
<script setup>
import Button from '@for-the-people-initiative/wireframe-kit/components/Button';
import Card from '@for-the-people-initiative/wireframe-kit/components/Card';
import Image from '@for-the-people-initiative/wireframe-kit/components/Image';
</script>

<template>
  <Card>
    <Image src="anything" alt="Hero banner" width="400" height="200" />
    <Button>Click me</Button>
  </Card>
</template>
```

Regardless of what `src` you pass to `<Image>`, it renders a placeholder box labelled `[ Hero banner ]`. This is the design intent — wireframes should not leak real content.

## Opting out of the wobble locally

For pixel-sensitive elements (icons, focus rings, tight UI) apply `.wf-crisp`:

```html
<span class="wf-crisp"><!-- no displacement filter applied here --></span>
```

## What changed from v1.x

- Single monochrome palette (grayscale ink on paper). No colored themes. No dark mode.
- Single font: Caveat.
- Flat offset "shadow" instead of layered drop shadows.
- `ParticleBackground` and `AtmosphericBackground` removed.
- `Chart` renders an SVG sketchy stub (axes + bars/line/pie outline). `chart.js` is no longer a dependency.
- `ColorPicker` renders a labeled stub and emits `#000000`.
- `Image`, `Avatar`, `Galleria`, `Lightbox`, `LogoCloud`, `Hero` render placeholder content in place of real images.

## Development

```bash
npm install
npm run story:dev   # histoire dev server (components playground)
npm run build       # builds tokens + components + types for publishing
```

## License

MIT
