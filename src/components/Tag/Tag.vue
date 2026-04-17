<template>
  <span v-rough="{ disabled: rounded, strokeWidth: 1.4, roughness: 1.3 }" class="tag" :class="additionalClasses">
    <slot name="icon">
      <i v-if="icon" :class="icon" class="tag__icon"></i>
    </slot>
    <span v-if="value || $slots.default" class="tag__value">
      <slot>{{ value }}</slot>
    </span>
  </span>
</template>

<style src="./Tag.scss"></style>

<script setup lang="ts">
import type { TagProps } from '../../types';
import { computed, useSlots } from "vue";

defineOptions({ name: 'FtpTag' });

const props = withDefaults(defineProps<TagProps>(), {
  value: null,
  color: "neutral",
  icon: null,
  rounded: false,
});

const $slots = useSlots();

const additionalClasses = computed(() =>
  [
    `tag--color-${props.color}`,
    props.rounded ? "tag--rounded" : "",
  ]
    .filter(Boolean)
    .join(" ")
);
</script>
