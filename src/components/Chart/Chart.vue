<template>
  <div v-rough class="chart" :class="additionalClasses">
    <div v-if="title" class="chart__title">{{ title }}</div>

    <div class="chart__wrapper" :style="wrapperStyle">
      <div v-if="isLoading" class="chart__loading">Loading…</div>

      <div v-else-if="!hasData" class="chart__empty">
        <span class="chart__empty-text">
          <slot name="empty">No data available</slot>
        </span>
      </div>

      <svg
        v-else
        class="chart__stub"
        viewBox="0 0 200 120"
        preserveAspectRatio="none"
        role="img"
        :aria-label="`${type} chart placeholder`"
      >
        <!-- Axes -->
        <polyline
          class="chart__stub-axis"
          points="20,10 20,100 190,100"
          fill="none"
        />

        <!-- Content per type -->
        <template v-if="type === 'line' || type === 'area'">
          <polyline
            class="chart__stub-line"
            points="20,80 50,55 80,65 110,30 140,45 170,20 190,35"
            fill="none"
          />
        </template>
        <template v-else-if="type === 'pie' || type === 'doughnut'">
          <circle class="chart__stub-pie" cx="105" cy="55" r="38" fill="none" />
          <line class="chart__stub-pie" x1="105" y1="55" x2="143" y2="55" />
          <line class="chart__stub-pie" x1="105" y1="55" x2="85" y2="20" />
          <line class="chart__stub-pie" x1="105" y1="55" x2="75" y2="85" />
        </template>
        <template v-else>
          <rect class="chart__stub-bar" x="35" y="60" width="18" height="40" />
          <rect class="chart__stub-bar" x="65" y="40" width="18" height="60" />
          <rect class="chart__stub-bar" x="95" y="25" width="18" height="75" />
          <rect class="chart__stub-bar" x="125" y="55" width="18" height="45" />
          <rect class="chart__stub-bar" x="155" y="35" width="18" height="65" />
        </template>

        <text x="105" y="116" class="chart__stub-label" text-anchor="middle">
          [ {{ type }} chart ]
        </text>
      </svg>
    </div>
  </div>
</template>

<style src="./Chart.scss"></style>

<script setup lang="ts">
import type { ChartProps } from '../../types';
import { computed } from 'vue';

defineOptions({ name: 'Chart' });

const emit = defineEmits(['select', 'loaded']);

const props = withDefaults(defineProps<ChartProps>(), {
  type: 'bar',
  data: null,
  options: null,
  plugins: () => [],
  title: null,
  isLoading: false,
  width: null,
  height: null,
});

const additionalClasses = computed(() =>
  [
    `chart--type-${props.type}`,
    props.isLoading && 'chart--loading',
  ]
    .filter(Boolean)
    .join(' ')
);

const hasData = computed(() => {
  if (!props.data) return false;
  if ((props.data as any).datasets) {
    return (props.data as any).datasets.some((ds: any) => ds.data && ds.data.length > 0);
  }
  return Object.keys(props.data).length > 0;
});

const wrapperStyle = computed(() => {
  const style: Record<string, string> = {};
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }
  return style;
});

// Wireframe mode: Chart.js is not used. The stub emits no select events, and
// loaded fires once on mount for API compatibility.
const refresh = () => {};
const reinit = () => {};
const getChart = () => null;
const getBase64Image = () => null;

defineExpose({
  refresh,
  reinit,
  getChart,
  getBase64Image,
});
</script>
