<template>
  <div
    class="progress-spinner"
    :class="additionalClasses"
    role="progressbar"
    aria-label="Loading"
    aria-valuemin="0"
    aria-valuemax="100"
    :style="spinnerStyle"
  >
    <svg class="progress-spinner__svg" viewBox="0 0 50 50">
      <!-- Background track circle -->
      <circle
        class="progress-spinner__track"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        :stroke-width="strokeWidth"
      />
      <!-- Animated spinner circle -->
      <circle
        class="progress-spinner__circle"
        cx="25"
        cy="25"
        r="20"
        :fill="fill"
        :stroke-width="strokeWidth"
      />
    </svg>
  </div>
</template>

<style src="./ProgressSpinner.scss"></style>

<script setup lang="ts">
import type { ProgressSpinnerProps } from '../../types';
import { computed } from "vue";

defineOptions({ name: 'ProgressSpinner' });

const props = withDefaults(defineProps<ProgressSpinnerProps>(), {
  strokeWidth: 4,
  fill: "transparent",
  animationDuration: "2s",
});

const spinnerStyle = computed(() => ({
  "--progress-spinner-animation-duration": props.animationDuration,
}));

const additionalClasses = computed(() => [].filter(Boolean).join(" "));
</script>
