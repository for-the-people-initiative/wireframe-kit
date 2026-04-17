<template>
  <div
    v-rough="{ shape: layout === 'vertical' ? 'vline' : 'hline', severity: 1 }"
    class="divider"
    :class="additionalClasses"
    role="separator"
    :aria-orientation="layout"
  >
    <span v-if="$slots.default" class="divider__content">
      <slot />
    </span>
  </div>
</template>

<style src="./Divider.scss"></style>

<script setup lang="ts">
import type { DividerProps } from '../../types';
import { computed, useSlots } from "vue";

defineOptions({ name: 'Divider' });

const props = withDefaults(defineProps<DividerProps>(), {
  layout: "horizontal",
  type: "solid",
  align: "center",
});

const slots = useSlots();

const additionalClasses = computed(() => {
  const classes = [];

  if (props.layout === "vertical") {
    classes.push("divider--vertical");
  }

  if (props.type !== "solid") {
    classes.push(`divider--${props.type}`);
  }

  // Only add alignment classes when there's content
  if (slots.default) {
    classes.push("divider--with-content");
    classes.push(`divider--align-${props.align}`);
  }

  return classes.join(" ");
});
</script>
