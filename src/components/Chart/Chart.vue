<template>
  <div class="chart" :class="additionalClasses">
    <div v-if="title" class="chart__title">{{ title }}</div>

    <div class="chart__wrapper" :style="wrapperStyle">
      <!-- Loading state -->
      <div v-if="isLoading" class="chart__loading">
        <svg class="chart__spinner" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-dasharray="31.4 31.4"
          />
        </svg>
      </div>

      <!-- Empty state -->
      <div v-else-if="!hasData" class="chart__empty">
        <svg class="chart__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 3v18h18" />
          <path d="M18 17V9" />
          <path d="M13 17V5" />
          <path d="M8 17v-3" />
        </svg>
        <span class="chart__empty-text">
          <slot name="empty">No data available</slot>
        </span>
      </div>

      <!-- Chart canvas -->
      <canvas
        v-else
        ref="canvasRef"
        class="chart__canvas"
        @click="onCanvasClick"
      />
    </div>
  </div>
</template>

<style src="./Chart.scss"></style>

<script setup lang="ts">
import type { ChartProps, ChartEmits } from '../../types';
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from "vue";

defineOptions({ name: 'FtpChart' });

const emit = defineEmits(["select", "loaded"]);

const props = withDefaults(defineProps<ChartProps>(), {
  type: "bar",
  data: null,
  options: null,
  plugins: () => [],
  title: null,
  isLoading: false,
  width: null,
  height: null,
});

const canvasRef = ref(null);
let chartInstance: any = null;
let ChartJS: any = null;

const additionalClasses = computed(() =>
  [
    `chart--type-${props.type}`,
    props.isLoading && "chart--loading",
  ]
    .filter(Boolean)
    .join(" ")
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
    style.width = typeof props.width === "number" ? `${props.width}px` : props.width;
  }
  if (props.height) {
    style.height = typeof props.height === "number" ? `${props.height}px` : props.height;
  }
  return style;
});

async function initChart() {
  if (!canvasRef.value || !hasData.value) return;

  // Dynamically import Chart.js
  if (!ChartJS) {
    try {
      const module = await import("chart.js/auto");
      ChartJS = module.default || module.Chart;
    } catch (e) {
      console.error("Chart.js is required. Install it with: npm install chart.js");
      return;
    }
  }

  // Destroy existing chart if any
  destroyChart();

  // Create new chart
  chartInstance = new ChartJS(canvasRef.value, {
    type: props.type,
    data: props.data,
    options: props.options || {},
    plugins: props.plugins,
  });

  emit("loaded", chartInstance);
}

function destroyChart() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}

function onCanvasClick(event: MouseEvent) {
  if (!chartInstance) return;

  const elements = chartInstance.getElementsAtEventForMode(
    event,
    "nearest",
    { intersect: true },
    false
  );

  if (elements.length > 0) {
    const { datasetIndex, index } = elements[0];
    emit("select", {
      originalEvent: event,
      element: elements[0],
      dataset: chartInstance.data.datasets[datasetIndex],
      datasetIndex,
      index,
      value: chartInstance.data.datasets[datasetIndex].data[index],
    });
  }
}

/**
 * Refresh chart data
 */
function refresh() {
  if (chartInstance) {
    chartInstance.update();
  }
}

/**
 * Reinitialize the chart
 */
function reinit() {
  destroyChart();
  nextTick(() => initChart());
}

/**
 * Get the Chart.js instance
 */
function getChart() {
  return chartInstance;
}

/**
 * Get chart as base64 image
 */
function getBase64Image() {
  return chartInstance ? chartInstance.toBase64Image() : null;
}

// Watch for data/type/options changes
watch(() => props.data, () => reinit(), { deep: true });
watch(() => props.type, () => reinit());
watch(() => props.options, () => reinit(), { deep: true });

onMounted(() => {
  if (hasData.value) {
    initChart();
  }
});

onUnmounted(() => {
  destroyChart();
});

// Expose methods
defineExpose({
  refresh,
  reinit,
  getChart,
  getBase64Image,
});
</script>
