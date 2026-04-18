<template>
  <div class="tablet-frame" :class="sizeClass" :style="frameStyle">
    <div class="tablet-frame__shell">
      <div class="tablet-frame__camera" />
      <div class="tablet-frame__screen">
        <slot />
      </div>
    </div>
  </div>
</template>

<style src="./TabletFrame.scss"></style>

<script setup lang="ts">
import type { TabletFrameProps } from '../../types';
import { computed } from 'vue';

defineOptions({ name: 'TabletFrame' });

const props = withDefaults(defineProps<TabletFrameProps>(), {
  size: 'md',
});

const sizeClass = computed(() => `tablet-frame--${props.size}`);

const frameStyle = computed(() => {
  const styles: Record<string, string> = {};
  if (props.bezelColor) styles['--tablet-frame-bezel'] = props.bezelColor;
  if (props.screenColor) styles['--tablet-frame-screen'] = props.screenColor;
  return styles;
});
</script>
