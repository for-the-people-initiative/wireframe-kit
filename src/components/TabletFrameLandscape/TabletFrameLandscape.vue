<template>
  <div class="tablet-frame-landscape" :class="sizeClass" :style="frameStyle">
    <div class="tablet-frame-landscape__shell">
      <div class="tablet-frame-landscape__camera" />
      <div class="tablet-frame-landscape__screen">
        <slot />
      </div>
    </div>
  </div>
</template>

<style src="./TabletFrameLandscape.scss"></style>

<script setup lang="ts">
import type { TabletFrameProps } from '../../types';
import { computed } from 'vue';

defineOptions({ name: 'TabletFrameLandscape' });

const props = withDefaults(defineProps<TabletFrameProps>(), {
  size: 'md',
});

const sizeClass = computed(() => `tablet-frame-landscape--${props.size}`);

const frameStyle = computed(() => {
  const styles: Record<string, string> = {};
  if (props.bezelColor) styles['--tablet-frame-bezel'] = props.bezelColor;
  if (props.screenColor) styles['--tablet-frame-screen'] = props.screenColor;
  return styles;
});
</script>
