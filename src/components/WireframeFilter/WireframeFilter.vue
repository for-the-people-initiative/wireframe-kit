<template>
  <svg
    class="wireframe-filter"
    aria-hidden="true"
    focusable="false"
    width="0"
    height="0"
  >
    <defs>
      <filter id="wireframe-sketchy" x="-2%" y="-2%" width="104%" height="104%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.025"
          numOctaves="2"
          seed="4"
          result="noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="2.2"
        />
      </filter>
    </defs>
  </svg>
</template>

<style>
.wireframe-filter {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}
</style>

<script setup lang="ts">
defineOptions({ name: 'WireframeFilter' });
</script>
