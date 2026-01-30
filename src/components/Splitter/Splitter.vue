<template>
  <div
    class="splitter"
    :class="additionalClasses"
    :style="containerStyle"
  >
    <slot></slot>
  </div>
</template>

<style src="./Splitter.scss"></style>

<script setup lang="ts">
import type { SplitterProps, SplitterEmits } from '../../types';
import { computed, provide, ref, onMounted, onUnmounted } from "vue";

defineOptions({ name: 'FtpSplitter' });

const props = withDefaults(defineProps<SplitterProps>(), {
  layout: "horizontal",
  gutterSize: 10,
  stateKey: null,
  stateStorage: "session",
});

const emit = defineEmits(["resizestart", "resize", "resizeend"]);

// Panel management
const panels = ref<any[]>([]);
const panelSizes = ref<(number | null)[]>([]);
const isResizing = ref(false);
const currentGutterIndex = ref<number | null>(null);
const startPos = ref(0);
const startSizes = ref<number[]>([]);

const registerPanel = (panel: any) => {
  const index = panels.value.length;
  panels.value.push(panel);

  // Initialize sizes
  if (panel.size !== undefined) {
    panelSizes.value.push(panel.size);
  } else {
    // Distribute remaining space
    panelSizes.value.push(null);
  }

  return index;
};

const unregisterPanel = (index: any) => {
  panels.value.splice(index, 1);
  panelSizes.value.splice(index, 1);
};

const getPanelSize = (index: any) => {
  return panelSizes.value[index];
};

// Resize logic
const onGutterMouseDown = (event: MouseEvent, index: any) => {
  isResizing.value = true;
  currentGutterIndex.value = index;
  startPos.value = props.layout === "horizontal" ? event.pageX : event.pageY;
  startSizes.value = [...panelSizes.value] as number[];

  emit("resizestart", { originalEvent: event, sizes: panelSizes.value });

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
  document.body.style.cursor = props.layout === "horizontal" ? "col-resize" : "row-resize";
  document.body.style.userSelect = "none";
};

const onMouseMove = (event: MouseEvent) => {
  if (!isResizing.value) return;

  const splitterElement = (event.target as HTMLElement).closest(".splitter") || document.querySelector(".splitter");
  if (!splitterElement) return;

  const rect = splitterElement.getBoundingClientRect();
  const totalSize = props.layout === "horizontal" ? rect.width : rect.height;
  const gutterCount = panels.value.length - 1;
  const availableSize = totalSize - (gutterCount * props.gutterSize);

  const currentPos = props.layout === "horizontal" ? event.pageX : event.pageY;
  const delta = currentPos - startPos.value;
  const deltaPercent = (delta / availableSize) * 100;

  const prevIndex = currentGutterIndex.value!;
  const nextIndex = currentGutterIndex.value! + 1;

  let newPrevSize = startSizes.value[prevIndex] + deltaPercent;
  let newNextSize = startSizes.value[nextIndex] - deltaPercent;

  // Apply min constraints
  const minSize = 5; // 5% minimum
  if (newPrevSize < minSize) {
    newNextSize += (newPrevSize - minSize);
    newPrevSize = minSize;
  }
  if (newNextSize < minSize) {
    newPrevSize += (newNextSize - minSize);
    newNextSize = minSize;
  }

  (panelSizes.value as number[])[prevIndex] = newPrevSize;
  (panelSizes.value as number[])[nextIndex] = newNextSize;

  emit("resize", { originalEvent: event, sizes: [...panelSizes.value] });
};

const onMouseUp = (event: MouseEvent) => {
  isResizing.value = false;
  currentGutterIndex.value = null;

  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
  document.body.style.cursor = "";
  document.body.style.userSelect = "";

  emit("resizeend", { originalEvent: event, sizes: [...panelSizes.value] });

  // Save state if stateKey is provided
  if (props.stateKey) {
    saveState();
  }
};

const saveState = () => {
  const storage = props.stateStorage === "local" ? localStorage : sessionStorage;
  storage.setItem(props.stateKey!, JSON.stringify(panelSizes.value));
};

const restoreState = () => {
  if (!props.stateKey) return;

  const storage = props.stateStorage === "local" ? localStorage : sessionStorage;
  const savedState = storage.getItem(props.stateKey);

  if (savedState) {
    try {
      panelSizes.value = JSON.parse(savedState);
    } catch (e) {
      // Invalid state, ignore
    }
  }
};

// Initialize default sizes once all panels are registered
const initializeSizes = () => {
  const nullCount = panelSizes.value.filter((s) => s === null).length;
  const usedPercent = panelSizes.value.reduce((sum, s) => (sum ?? 0) + (s || 0), 0)!;
  const remainingPercent = 100 - usedPercent;
  const defaultSize = nullCount > 0 ? remainingPercent / nullCount : 0;

  panelSizes.value = panelSizes.value.map((s) => (s === null ? defaultSize : s));
};

// Provide context to child panels
provide("splitter", {
  layout: computed(() => props.layout),
  gutterSize: computed(() => props.gutterSize),
  registerPanel,
  unregisterPanel,
  getPanelSize,
  panelSizes,
  onGutterMouseDown,
  isResizing,
  currentGutterIndex,
  initializeSizes,
});

onMounted(() => {
  restoreState();
});

onUnmounted(() => {
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
});

const additionalClasses = computed(() => [
  `splitter--${props.layout}`,
  isResizing.value && "splitter--resizing",
].filter(Boolean).join(" "));

const containerStyle = computed(() => ({
  "--splitter-gutter-size": `${props.gutterSize}px`,
}));
</script>
