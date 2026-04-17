<template>
  <span class="input-icon" :class="additionalClasses" aria-hidden="true">
    <slot />
  </span>
</template>

<style src="./InputIcon.scss"></style>

<script setup lang="ts">
import type { InputIconProps } from '../../types';
import { computed } from "vue";

defineOptions({ name: 'InputIcon' });

const props = withDefaults(defineProps<InputIconProps>(), {
  size: "md",
  position: "left",
});

const additionalClasses = computed(() =>
  [
    `input-icon--size-${props.size}`,
    `input-icon--position-${props.position}`,
  ]
    .filter(Boolean)
    .join(" ")
);
</script>
