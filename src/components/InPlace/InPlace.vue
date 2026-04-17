<template>
  <div
    v-rough
    class="in-place"
    :class="additionalClasses"
    aria-live="polite"
  >
    <!-- Display mode -->
    <div
      v-if="!isActive"
      class="in-place__display"
      role="button"
      :tabindex="disabled ? -1 : 0"
      :data-disabled="disabled || undefined"
      @click="onDisplayClick"
      @keydown.enter="onDisplayClick"
    >
      <slot name="display">
        <span class="in-place__display-text">Click to edit</span>
      </slot>
    </div>

    <!-- Content mode -->
    <div
      v-else
      class="in-place__content"
    >
      <slot name="content" :close="close">
        <slot></slot>
      </slot>
      <button
        v-if="closable"
        type="button"
        class="in-place__close"
        aria-label="Close"
        @click="close"
      >
        <svg
          class="in-place__close-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style src="./InPlace.scss"></style>

<script setup lang="ts">
import type { InPlaceProps, InPlaceEmits } from '../../types';
import { computed, ref, watch, nextTick } from "vue";

defineOptions({ name: 'InPlace' });

const props = withDefaults(defineProps<InPlaceProps>(), {
  active: false,
  disabled: false,
  closable: true,
});

const emit = defineEmits(["update:active", "open", "close"]);

const displayRef = ref(null);

// Internal active state that syncs with prop
const isActive = computed({
  get: () => props.active,
  set: (value) => emit("update:active", value),
});

const additionalClasses = computed(() => [
  isActive.value && "in-place--active",
  props.disabled && "in-place--disabled",
].filter(Boolean).join(" "));

const onDisplayClick = () => {
  if (props.disabled) return;

  isActive.value = true;
  emit("open");
};

const close = () => {
  isActive.value = false;
  emit("close");

  // Return focus to display element after closing
  nextTick(() => {
    const displayElement = document.querySelector(".in-place__display");
    if (displayElement) {
      (displayElement as HTMLElement).focus();
    }
  });
};

// Expose close method for parent components
defineExpose({
  close,
});
</script>
