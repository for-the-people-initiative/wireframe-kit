<template>
  <div
    v-rough
    class="block-ui"
    :class="additionalClasses"
  >
    <slot></slot>
    <Transition name="block-ui-fade">
      <div
        v-if="blocked"
        class="block-ui__overlay"
        :class="{ 'block-ui__overlay--fullscreen': fullScreen }"
        aria-busy="true"
        aria-live="polite"
      >
        <slot name="spinner">
          <div v-if="showSpinner" class="block-ui__spinner" aria-label="Loading">
            <svg class="block-ui__spinner-icon" viewBox="0 0 50 50">
              <circle
                class="block-ui__spinner-circle"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke-width="4"
              />
            </svg>
          </div>
        </slot>
      </div>
    </Transition>
  </div>
</template>

<style src="./BlockUI.scss"></style>

<script setup lang="ts">
import type { BlockUIProps, BlockUIEmits } from '../../types';
import { computed, watch, onMounted, onUnmounted } from "vue";

defineOptions({ name: 'BlockUI' });

const props = withDefaults(defineProps<BlockUIProps>(), {
  blocked: false,
  fullScreen: false,
  showSpinner: true,
  autoZIndex: true,
  baseZIndex: 1000,
});

const emit = defineEmits(["block", "unblock"]);

const additionalClasses = computed(() => [
  props.blocked && "block-ui--blocked",
  props.fullScreen && "block-ui--fullscreen",
].filter(Boolean).join(" "));

// Block body scroll when fullscreen
watch(
  () => props.blocked,
  (newValue, oldValue) => {
    if (newValue && !oldValue) {
      emit("block");
      if (props.fullScreen) {
        document.body.style.overflow = "hidden";
        // Blur active element
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    } else if (!newValue && oldValue) {
      emit("unblock");
      if (props.fullScreen) {
        document.body.style.overflow = "";
      }
    }
  }
);

onMounted(() => {
  if (props.blocked && props.fullScreen) {
    document.body.style.overflow = "hidden";
  }
});

onUnmounted(() => {
  if (props.fullScreen) {
    document.body.style.overflow = "";
  }
});
</script>
