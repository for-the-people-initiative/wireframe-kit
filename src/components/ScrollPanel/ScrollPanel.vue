<template>
  <div
    ref="containerRef"
    class="scroll-panel"
    :style="containerStyle"
  >
    <div
      ref="contentRef"
      class="scroll-panel__content"
      @scroll="onScroll"
    >
      <slot></slot>
    </div>

    <!-- Vertical scrollbar -->
    <div
      v-if="showVerticalScrollbar"
      class="scroll-panel__bar scroll-panel__bar--vertical"
      :class="{ 'scroll-panel__bar--dragging': isDraggingY }"
    >
      <div
        ref="thumbYRef"
        class="scroll-panel__thumb"
        :style="thumbYStyle"
        @mousedown="onThumbYMouseDown"
        role="scrollbar"
        aria-orientation="vertical"
        :aria-valuenow="scrollYPercent"
        aria-valuemin="0"
        aria-valuemax="100"
        tabindex="0"
        @keydown="onThumbYKeyDown"
      ></div>
    </div>

    <!-- Horizontal scrollbar -->
    <div
      v-if="showHorizontalScrollbar"
      class="scroll-panel__bar scroll-panel__bar--horizontal"
      :class="{ 'scroll-panel__bar--dragging': isDraggingX }"
    >
      <div
        ref="thumbXRef"
        class="scroll-panel__thumb"
        :style="thumbXStyle"
        @mousedown="onThumbXMouseDown"
        role="scrollbar"
        aria-orientation="horizontal"
        :aria-valuenow="scrollXPercent"
        aria-valuemin="0"
        aria-valuemax="100"
        tabindex="0"
        @keydown="onThumbXKeyDown"
      ></div>
    </div>
  </div>
</template>

<style src="./ScrollPanel.scss"></style>

<script setup lang="ts">
import type { ScrollPanelProps } from '../../types';
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";

defineOptions({ name: 'FtpScrollPanel' });

const props = withDefaults(defineProps<ScrollPanelProps>(), {
  style: () => ({}),
  step: 40,
});

const containerRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const thumbYRef = ref<HTMLElement | null>(null);
const thumbXRef = ref<HTMLElement | null>(null);

// Scroll state
const scrollYPercent = ref(0);
const scrollXPercent = ref(0);
const thumbYHeight = ref(0);
const thumbXWidth = ref(0);
const showVerticalScrollbar = ref(false);
const showHorizontalScrollbar = ref(false);

// Drag state
const isDraggingY = ref(false);
const isDraggingX = ref(false);
const dragStartY = ref(0);
const dragStartX = ref(0);
const scrollStartY = ref(0);
const scrollStartX = ref(0);

const containerStyle = computed(() => {
  if (typeof props.style === "string") {
    return props.style;
  }
  return props.style;
});

const thumbYStyle = computed(() => ({
  height: `${thumbYHeight.value}%`,
  top: `${scrollYPercent.value}%`,
}));

const thumbXStyle = computed(() => ({
  width: `${thumbXWidth.value}%`,
  left: `${scrollXPercent.value}%`,
}));

const updateScrollbars = () => {
  if (!contentRef.value) return;

  const content = contentRef.value;
  const { scrollHeight, clientHeight, scrollWidth, clientWidth, scrollTop, scrollLeft } = content;

  // Vertical scrollbar
  const hasVerticalScroll = scrollHeight > clientHeight;
  showVerticalScrollbar.value = hasVerticalScroll;

  if (hasVerticalScroll) {
    const viewableRatio = clientHeight / scrollHeight;
    thumbYHeight.value = Math.max(viewableRatio * 100, 10); // Min 10%
    const scrollableHeight = scrollHeight - clientHeight;
    const scrollRatio = scrollableHeight > 0 ? scrollTop / scrollableHeight : 0;
    scrollYPercent.value = scrollRatio * (100 - thumbYHeight.value);
  }

  // Horizontal scrollbar
  const hasHorizontalScroll = scrollWidth > clientWidth;
  showHorizontalScrollbar.value = hasHorizontalScroll;

  if (hasHorizontalScroll) {
    const viewableRatio = clientWidth / scrollWidth;
    thumbXWidth.value = Math.max(viewableRatio * 100, 10); // Min 10%
    const scrollableWidth = scrollWidth - clientWidth;
    const scrollRatio = scrollableWidth > 0 ? scrollLeft / scrollableWidth : 0;
    scrollXPercent.value = scrollRatio * (100 - thumbXWidth.value);
  }
};

const onScroll = () => {
  updateScrollbars();
};

// Vertical thumb dragging
const onThumbYMouseDown = (event: MouseEvent) => {
  event.preventDefault();
  isDraggingY.value = true;
  dragStartY.value = event.pageY;
  scrollStartY.value = contentRef.value!.scrollTop;

  document.addEventListener("mousemove", onThumbYMouseMove);
  document.addEventListener("mouseup", onThumbYMouseUp);
};

const onThumbYMouseMove = (event: MouseEvent) => {
  if (!isDraggingY.value || !contentRef.value || !containerRef.value) return;

  const container = containerRef.value;
  const content = contentRef.value;
  const deltaY = event.pageY - dragStartY.value;
  const trackHeight = container.clientHeight;
  const scrollableHeight = content.scrollHeight - content.clientHeight;
  const thumbHeightPx = (thumbYHeight.value / 100) * trackHeight;
  const scrollRatio = deltaY / (trackHeight - thumbHeightPx);

  content.scrollTop = scrollStartY.value + scrollRatio * scrollableHeight;
};

const onThumbYMouseUp = () => {
  isDraggingY.value = false;
  document.removeEventListener("mousemove", onThumbYMouseMove);
  document.removeEventListener("mouseup", onThumbYMouseUp);
};

const onThumbYKeyDown = (event: KeyboardEvent) => {
  if (!contentRef.value) return;

  if (event.key === "ArrowUp") {
    event.preventDefault();
    contentRef.value!.scrollTop -= props.step;
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    contentRef.value!.scrollTop += props.step;
  }
};

// Horizontal thumb dragging
const onThumbXMouseDown = (event: MouseEvent) => {
  event.preventDefault();
  isDraggingX.value = true;
  dragStartX.value = event.pageX;
  scrollStartX.value = contentRef.value!.scrollLeft;

  document.addEventListener("mousemove", onThumbXMouseMove);
  document.addEventListener("mouseup", onThumbXMouseUp);
};

const onThumbXMouseMove = (event: MouseEvent) => {
  if (!isDraggingX.value || !contentRef.value || !containerRef.value) return;

  const container = containerRef.value;
  const content = contentRef.value;
  const deltaX = event.pageX - dragStartX.value;
  const trackWidth = container.clientWidth;
  const scrollableWidth = content.scrollWidth - content.clientWidth;
  const thumbWidthPx = (thumbXWidth.value / 100) * trackWidth;
  const scrollRatio = deltaX / (trackWidth - thumbWidthPx);

  content.scrollLeft = scrollStartX.value + scrollRatio * scrollableWidth;
};

const onThumbXMouseUp = () => {
  isDraggingX.value = false;
  document.removeEventListener("mousemove", onThumbXMouseMove);
  document.removeEventListener("mouseup", onThumbXMouseUp);
};

const onThumbXKeyDown = (event: KeyboardEvent) => {
  if (!contentRef.value) return;

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    contentRef.value!.scrollLeft -= props.step;
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    contentRef.value!.scrollLeft += props.step;
  }
};

// Public methods
const refresh = () => {
  nextTick(() => {
    updateScrollbars();
  });
};

const scrollTop = (value: any) => {
  if (contentRef.value) {
    contentRef.value!.scrollTop = value;
  }
};

const scrollLeft = (value: any) => {
  if (contentRef.value) {
    contentRef.value!.scrollLeft = value;
  }
};

// Expose public methods
defineExpose({
  refresh,
  scrollTop,
  scrollLeft,
});

// Lifecycle
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  updateScrollbars();

  // Watch for content size changes
  if (contentRef.value && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => {
      updateScrollbars();
    });
    resizeObserver.observe(contentRef.value);
  }

  window.addEventListener("resize", updateScrollbars);
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  window.removeEventListener("resize", updateScrollbars);
  document.removeEventListener("mousemove", onThumbYMouseMove);
  document.removeEventListener("mouseup", onThumbYMouseUp);
  document.removeEventListener("mousemove", onThumbXMouseMove);
  document.removeEventListener("mouseup", onThumbXMouseUp);
});
</script>
