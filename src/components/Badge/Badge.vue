<template>
  <span v-if="!isEmpty" class="badge" :class="additionalClasses" :aria-label="ariaLabel || (value !== null ? `${value}` : undefined)">
    <slot>{{ value }}</slot>
  </span>
</template>

<style src="./Badge.scss"></style>

<script setup lang="ts">
import type { BadgeProps } from '../../types';
import { computed } from "vue";

defineOptions({ name: 'Badge' });

const props = withDefaults(defineProps<BadgeProps>(), {
  value: null,
  size: "md",
  severity: "primary",
});

const slots = defineSlots();

const isEmpty = computed(() => {
  return props.value === null && !slots.default;
});

const isSingleChar = computed(() => {
  const val = String(props.value ?? "");
  return val.length === 1;
});

const additionalClasses = computed(() =>
  [
    `badge--size-${props.size}`,
    `badge--severity-${props.severity}`,
    isSingleChar.value ? "badge--circle" : "",
  ]
    .filter(Boolean)
    .join(" ")
);
</script>
