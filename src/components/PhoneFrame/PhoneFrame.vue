<template>
  <div class="phone-frame" :class="sizeClass" :style="frameStyle">
    <div class="phone-frame__shell">
      <div class="phone-frame__notch" />
      <div class="phone-frame__screen">
        <slot />
      </div>
    </div>
  </div>
</template>

<style src="./PhoneFrame.scss"></style>

<script setup lang="ts">
import type { PhoneFrameProps } from '../../types';
import { computed } from 'vue';

defineOptions({ name: 'PhoneFrame' });

const props = withDefaults(defineProps<PhoneFrameProps>(), {
  size: 'md',
});

const sizeClass = computed(() => `phone-frame--${props.size}`);

const frameStyle = computed(() => {
  const styles: Record<string, string> = {};
  if (props.bezelColor) styles['--phone-frame-bezel'] = props.bezelColor;
  if (props.screenColor) styles['--phone-frame-screen'] = props.screenColor;
  return styles;
});
</script>
