<template>
  <tr class="row" :class="additionalClasses">
    <slot />
  </tr>
</template>

<style src="./Row.scss"></style>

<script setup lang="ts">
import type { RowProps } from '../../types';
import { computed } from "vue";

defineOptions({ name: 'Row' });

const props = withDefaults(defineProps<RowProps>(), {
  isSelected: false,
  isStriped: false,
  isHoverable: true,
});

const additionalClasses = computed(() =>
  [
    props.isSelected && "row--selected",
    props.isStriped && "row--striped",
    props.isHoverable && "row--hoverable",
  ]
    .filter(Boolean)
    .join(" ")
);
</script>
