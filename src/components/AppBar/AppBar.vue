<template>
  <header
    v-rough="{ edges: ['bottom'], severity: 3 }"
    class="app-bar"
    :class="additionalClasses"
    :style="colorStyle"
    role="banner"
  >
    <div class="app-bar__container">
      <div v-if="$slots.start" class="app-bar__start">
        <slot name="start" />
      </div>

      <div class="app-bar__center">
        <slot />
      </div>

      <div v-if="$slots.end" class="app-bar__end">
        <slot name="end" />
      </div>
    </div>
  </header>
</template>

<style src="./AppBar.scss"></style>

<script setup lang="ts">
import type { AppBarProps } from '../../types';
import { computed } from 'vue';

defineOptions({ name: 'AppBar' });

const props = withDefaults(defineProps<AppBarProps>(), {
  fixed: false,
  elevated: true,
  transparent: false,
});

const additionalClasses = computed(() =>
  [
    props.fixed && 'app-bar--fixed',
    props.elevated && 'app-bar--elevated',
    props.transparent && 'app-bar--transparent',
  ].filter(Boolean).join(' ')
);

const colorStyle = computed(() =>
  props.color ? { backgroundColor: props.color } : undefined
);
</script>
