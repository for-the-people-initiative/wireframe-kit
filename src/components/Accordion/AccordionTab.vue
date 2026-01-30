<template>
  <div class="accordion__tab" :class="tabClasses">
    <button
      type="button"
      class="accordion__header"
      :disabled="isDisabled"
      :aria-expanded="isActive"
      :aria-controls="contentId"
      @click="handleClick"
    >
      <span class="accordion__header-text">
        <slot name="header">{{ header }}</slot>
      </span>
      <span class="accordion__icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </span>
    </button>
    <div
      :id="contentId"
      class="accordion__content-wrapper"
      :aria-hidden="!isActive"
    >
      <div class="accordion__content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AccordionTabProps } from '../../types';
import { computed, inject, onMounted, ref } from "vue";

defineOptions({ name: 'FtpAccordionTab' });

const props = withDefaults(defineProps<AccordionTabProps>(), {
  header: "",
  isDisabled: false,
});

const accordion = inject<{ registerTab: () => number; isTabActive: (index: number) => boolean; toggleTab: (index: number, disabled: boolean) => void }>("accordion");
const tabIndex = ref(-1);
const contentId = computed(() => `accordion-content-${tabIndex.value}`);

onMounted(() => {
  if (accordion) {
    tabIndex.value = accordion.registerTab();
  }
});

const isActive = computed(() => {
  if (!accordion || tabIndex.value === -1) return false;
  return accordion.isTabActive(tabIndex.value);
});

const handleClick = () => {
  if (accordion && !props.isDisabled) {
    accordion.toggleTab(tabIndex.value, props.isDisabled);
  }
};

const tabClasses = computed(() =>
  [
    isActive.value && "accordion__tab--active",
    props.isDisabled && "accordion__tab--disabled",
  ]
    .filter(Boolean)
    .join(" ")
);
</script>
