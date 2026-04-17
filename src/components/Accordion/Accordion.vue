<template>
  <div class="accordion" :class="additionalClasses">
    <slot></slot>
  </div>
</template>

<style src="./Accordion.scss"></style>

<script setup lang="ts">
import type { AccordionProps, AccordionEmits } from '../../types';
import { computed, provide, ref, watch } from "vue";

defineOptions({ name: 'Accordion' });

const props = withDefaults(defineProps<AccordionProps>(), {
  activeIndex: null,
  multiple: false,
});

const emit = defineEmits(["update:activeIndex", "tab-open", "tab-close"]);

// Internal state for active tabs
const activeIndices = ref(
  props.multiple
    ? Array.isArray(props.activeIndex)
      ? [...props.activeIndex]
      : props.activeIndex !== null
        ? [props.activeIndex]
        : []
    : props.activeIndex !== null
      ? [props.activeIndex]
      : []
);

// Watch for external changes to activeIndex
watch(
  () => props.activeIndex,
  (newVal) => {
    if (props.multiple) {
      activeIndices.value = Array.isArray(newVal)
        ? [...newVal]
        : newVal !== null
          ? [newVal]
          : [];
    } else {
      activeIndices.value = newVal !== null ? [newVal] : [];
    }
  }
);

// Tab registration
let tabCount = ref(0);

const registerTab = () => {
  const index = tabCount.value;
  tabCount.value++;
  return index;
};

const isTabActive = (index: number) => {
  return activeIndices.value.includes(index);
};

const toggleTab = (index: any, disabled: any) => {
  if (disabled) return;

  const isActive = activeIndices.value.includes(index);

  if (props.multiple) {
    if (isActive) {
      activeIndices.value = activeIndices.value.filter((i) => i !== index);
      emit("tab-close", { index });
    } else {
      activeIndices.value = [...activeIndices.value, index];
      emit("tab-open", { index });
    }
    emit("update:activeIndex", [...activeIndices.value]);
  } else {
    if (isActive) {
      activeIndices.value = [];
      emit("tab-close", { index });
      emit("update:activeIndex", null);
    } else {
      const previousIndex = activeIndices.value[0];
      if (previousIndex !== undefined) {
        emit("tab-close", { index: previousIndex });
      }
      activeIndices.value = [index];
      emit("tab-open", { index });
      emit("update:activeIndex", index);
    }
  }
};

// Provide context to child AccordionTab components
provide("accordion", {
  registerTab,
  isTabActive,
  toggleTab,
});

const additionalClasses = computed(() =>
  [props.multiple && "accordion--multiple"].filter(Boolean).join(" ")
);
</script>
