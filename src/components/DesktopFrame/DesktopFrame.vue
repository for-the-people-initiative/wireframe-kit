<template>
  <div class="desktop-frame" :class="sizeClass" :style="frameStyle">
    <div class="desktop-frame__shell">
      <div class="desktop-frame__chrome">
        <div class="desktop-frame__traffic">
          <span class="desktop-frame__traffic-dot desktop-frame__traffic-dot--close" />
          <span class="desktop-frame__traffic-dot desktop-frame__traffic-dot--min" />
          <span class="desktop-frame__traffic-dot desktop-frame__traffic-dot--max" />
        </div>

        <div class="desktop-frame__tab-strip" aria-hidden="true">
          <div class="desktop-frame__tab-placeholder" />
        </div>

        <div class="desktop-frame__urlbar" aria-hidden="true">
          <div class="desktop-frame__nav-buttons">
            <svg class="desktop-frame__nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <svg class="desktop-frame__nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <svg class="desktop-frame__nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M13 3V6H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M13 8A5 5 0 1 1 11.5 4.5L13 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="desktop-frame__url" />
        </div>
      </div>

      <div class="desktop-frame__screen">
        <slot />
      </div>
    </div>
  </div>
</template>

<style src="./DesktopFrame.scss"></style>

<script setup lang="ts">
import type { DesktopFrameProps } from '../../types';
import { computed } from 'vue';

defineOptions({ name: 'DesktopFrame' });

const props = withDefaults(defineProps<DesktopFrameProps>(), {
  size: 'md',
});

const sizeClass = computed(() => `desktop-frame--${props.size}`);

const frameStyle = computed(() => {
  const styles: Record<string, string> = {};
  if (props.bezelColor) styles['--desktop-frame-bezel'] = props.bezelColor;
  if (props.screenColor) styles['--desktop-frame-screen'] = props.screenColor;
  return styles;
});
</script>
