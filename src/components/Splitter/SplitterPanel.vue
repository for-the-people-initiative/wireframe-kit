<template>
  <div
    v-rough
    class="splitter__panel"
    :style="panelStyle"
  >
    <slot></slot>
  </div>
  <div
    v-if="showGutter"
    class="splitter__gutter"
    :class="gutterClasses"
    role="separator"
    :aria-orientation="splitterContext.layout.value === 'horizontal' ? 'vertical' : 'horizontal'"
    tabindex="0"
    @mousedown="onGutterMouseDown"
    @keydown="onGutterKeyDown"
  >
    <div class="splitter__gutter-handle"></div>
  </div>
</template>

<script setup lang="ts">
import type { SplitterPanelProps } from '../../types';
import { computed, inject, onMounted, onBeforeUnmount, ref, watch, nextTick } from "vue";

defineOptions({ name: 'SplitterPanel' });

const props = withDefaults(defineProps<SplitterPanelProps>(), {
  minSize: 5,
});

const splitterContext = inject("splitter") as any;
const panelIndex = ref(-1);

onMounted(async () => {
  panelIndex.value = splitterContext.registerPanel({
    size: props.size,
    minSize: props.minSize,
  });

  // Initialize sizes after all panels are registered
  await nextTick();
  splitterContext.initializeSizes();
});

onBeforeUnmount(() => {
  if (panelIndex.value !== -1) {
    splitterContext.unregisterPanel(panelIndex.value);
  }
});

const currentSize = computed(() => {
  return splitterContext.getPanelSize(panelIndex.value);
});

const showGutter = computed(() => {
  // Show gutter after this panel if it's not the last panel
  const totalPanels = splitterContext.panelSizes.value.length;
  return panelIndex.value >= 0 && panelIndex.value < totalPanels - 1;
});

const gutterClasses = computed(() => [
  splitterContext.isResizing.value && splitterContext.currentGutterIndex.value === panelIndex.value && "splitter__gutter--active",
].filter(Boolean).join(" "));

const panelStyle = computed(() => {
  const size = currentSize.value;
  if (size === null || size === undefined) return {};

  const gutterSize = splitterContext.gutterSize.value;
  const gutterCount = splitterContext.panelSizes.value.length - 1;
  const gutterOffset = (gutterSize * gutterCount) / splitterContext.panelSizes.value.length;

  return {
    flexBasis: `calc(${size}% - ${gutterOffset}px)`,
  };
});

const onGutterMouseDown = (event: MouseEvent) => {
  event.preventDefault();
  splitterContext.onGutterMouseDown(event, panelIndex.value);
};

const onGutterKeyDown = (event: KeyboardEvent) => {
  const step = 1; // 1% step
  let handled = false;

  if (splitterContext.layout.value === "horizontal") {
    if (event.key === "ArrowLeft") {
      adjustSize(-step);
      handled = true;
    } else if (event.key === "ArrowRight") {
      adjustSize(step);
      handled = true;
    }
  } else {
    if (event.key === "ArrowUp") {
      adjustSize(-step);
      handled = true;
    } else if (event.key === "ArrowDown") {
      adjustSize(step);
      handled = true;
    }
  }

  if (handled) {
    event.preventDefault();
  }
};

const adjustSize = (delta: any) => {
  const prevIndex = panelIndex.value;
  const nextIndex = panelIndex.value + 1;
  const sizes = splitterContext.panelSizes.value;

  let newPrevSize = sizes[prevIndex] + delta;
  let newNextSize = sizes[nextIndex] - delta;

  const minSize = 5;
  if (newPrevSize >= minSize && newNextSize >= minSize) {
    sizes[prevIndex] = newPrevSize;
    sizes[nextIndex] = newNextSize;
  }
};
</script>
