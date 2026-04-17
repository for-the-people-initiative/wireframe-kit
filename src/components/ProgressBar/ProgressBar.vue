<template>
  <div
    class="progress-bar"
    :class="additionalClasses"
    role="progressbar"
    :aria-valuenow="mode === 'determinate' ? value : undefined"
    :aria-valuemin="mode === 'determinate' ? 0 : undefined"
    :aria-valuemax="mode === 'determinate' ? 100 : undefined"
  >
    <div class="progress-bar__track">
      <div
        v-if="mode === 'determinate'"
        class="progress-bar__fill"
        :style="fillStyle"
      >
        <span v-if="showValue" class="progress-bar__label">
          <slot>{{ value }}%</slot>
        </span>
      </div>
      <div v-else class="progress-bar__fill progress-bar__fill--indeterminate" />
    </div>
  </div>
</template>

<style src="./ProgressBar.scss"></style>

<script setup lang="ts">
import type { ProgressBarProps } from '../../types';
import { computed } from "vue";

defineOptions({ name: 'ProgressBar' });

const props = withDefaults(defineProps<ProgressBarProps>(), {
  value: 0,
  showValue: true,
  mode: "determinate",
});

const fillStyle = computed(() => ({
  width: `${props.value}%`,
}));

const additionalClasses = computed(() =>
  [props.mode === "indeterminate" && "progress-bar--indeterminate"]
    .filter(Boolean)
    .join(" ")
);
</script>
