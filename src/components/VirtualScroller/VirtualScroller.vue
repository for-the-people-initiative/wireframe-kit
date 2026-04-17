<template>
  <div
    v-rough
    ref="containerRef"
    class="virtualscroller"
    :class="additionalClasses"
    :style="containerStyle"
    @scroll="onScroll"
  >
    <div class="virtualscroller__spacer" :style="spacerStyle">
      <div
        class="virtualscroller__content"
        :style="contentStyle"
      >
        <div
          v-for="(item, index) in visibleItems"
          :key="getItemKey(item, startIndex + index)"
          class="virtualscroller__item"
          :class="{
            'virtualscroller__item--stripe': striped && (startIndex + index) % 2 === 1
          }"
          :style="itemStyle"
        >
          <slot :item="item" :index="startIndex + index">
            {{ item }}
          </slot>
        </div>
      </div>
    </div>
    <div v-if="loading" class="virtualscroller__loader">
      <slot name="loader">Loading...</slot>
    </div>
  </div>
</template>

<style src="./VirtualScroller.scss"></style>

<script setup lang="ts">
import type { VirtualScrollerProps, VirtualScrollerEmits } from '../../types';
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";

defineOptions({ name: 'VirtualScroller' });

const props = withDefaults(defineProps<VirtualScrollerProps>(), {
  items: () => [],
  itemSize: 40,
  scrollHeight: "400px",
  orientation: "vertical",
  numToleratedItems: 5,
  loading: false,
  striped: false,
  showBorder: true,
  dataKey: null,
});

const emit = defineEmits(["scroll", "scroll-index-change"]);

const containerRef = ref<HTMLElement | null>(null);
const scrollPosition = ref(0);

const isVertical = computed(() => props.orientation === "vertical");

const totalSize = computed(() => props.items.length * props.itemSize);

const viewportSize = computed(() => {
  if (!containerRef.value) return 0;
  return isVertical.value
    ? containerRef.value!.clientHeight
    : containerRef.value!.clientWidth;
});

const visibleCount = computed(() => {
  if (viewportSize.value === 0) return 10; // Default during initial render
  return Math.ceil(viewportSize.value / props.itemSize) + props.numToleratedItems * 2;
});

const startIndex = computed(() => {
  const index = Math.floor(scrollPosition.value / props.itemSize) - props.numToleratedItems;
  return Math.max(0, index);
});

const endIndex = computed(() => {
  return Math.min(startIndex.value + visibleCount.value, props.items.length);
});

const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value);
});

const getItemKey = (item: any, index: any) => {
  if (props.dataKey && typeof item === "object") {
    return item[props.dataKey];
  }
  return index;
};

const containerStyle = computed(() => ({
  height: isVertical.value ? props.scrollHeight : "auto",
  width: isVertical.value ? "100%" : props.scrollHeight,
  overflowY: isVertical.value ? 'auto' as const : 'hidden' as const,
  overflowX: isVertical.value ? 'hidden' as const : 'auto' as const,
}));

const spacerStyle = computed(() => ({
  position: 'relative' as const,
  height: isVertical.value ? `${totalSize.value}px` : "100%",
  width: isVertical.value ? "100%" : `${totalSize.value}px`,
}));

const contentStyle = computed(() => ({
  position: 'absolute' as const,
  top: isVertical.value ? `${startIndex.value * props.itemSize}px` : "0",
  left: isVertical.value ? "0" : `${startIndex.value * props.itemSize}px`,
  width: isVertical.value ? "100%" : "auto",
  height: isVertical.value ? "auto" : "100%",
}));

const itemStyle = computed(() => ({
  height: isVertical.value ? `${props.itemSize}px` : "100%",
  width: isVertical.value ? "100%" : `${props.itemSize}px`,
}));

const onScroll = (event: Event) => {
  const target = event.target;
  const newPosition = isVertical.value ? (target as HTMLElement).scrollTop : (target as HTMLElement).scrollLeft;
  const oldStartIndex = startIndex.value;

  scrollPosition.value = newPosition;

  emit("scroll", {
    originalEvent: event,
    scrollPosition: newPosition,
  });

  if (startIndex.value !== oldStartIndex) {
    emit("scroll-index-change", {
      first: startIndex.value,
      last: endIndex.value,
    });
  }
};

const scrollToIndex = (index: any, behavior: ScrollBehavior = "auto") => {
  if (!containerRef.value) return;

  const position = index * props.itemSize;

  if (isVertical.value) {
    containerRef.value!.scrollTo({ top: position, behavior });
  } else {
    containerRef.value!.scrollTo({ left: position, behavior });
  }
};

const scrollIntoView = (index: any, behavior: ScrollBehavior = "auto", align = "start") => {
  if (!containerRef.value) return;

  const itemPosition = index * props.itemSize;
  const currentScroll = scrollPosition.value;
  const viewport = viewportSize.value;

  let targetScroll;

  if (align === "start") {
    targetScroll = itemPosition;
  } else if (align === "center") {
    targetScroll = itemPosition - (viewport - props.itemSize) / 2;
  } else if (align === "end") {
    targetScroll = itemPosition - viewport + props.itemSize;
  } else {
    // Auto - only scroll if needed
    if (itemPosition < currentScroll) {
      targetScroll = itemPosition;
    } else if (itemPosition + props.itemSize > currentScroll + viewport) {
      targetScroll = itemPosition - viewport + props.itemSize;
    } else {
      return; // Already visible
    }
  }

  targetScroll = Math.max(0, Math.min(targetScroll, totalSize.value - viewport));

  if (isVertical.value) {
    containerRef.value!.scrollTo({ top: targetScroll, behavior });
  } else {
    containerRef.value!.scrollTo({ left: targetScroll, behavior });
  }
};

// Recalculate on mount and resize
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (containerRef.value && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => {
      // Force reactivity update
      scrollPosition.value = isVertical.value
        ? containerRef.value!.scrollTop
        : containerRef.value!.scrollLeft;
    });
    resizeObserver.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

// Watch for items change
watch(() => props.items, () => {
  nextTick(() => {
    if (containerRef.value) {
      scrollPosition.value = isVertical.value
        ? containerRef.value!.scrollTop
        : containerRef.value!.scrollLeft;
    }
  });
}, { deep: true });

// Expose methods
defineExpose({
  scrollToIndex,
  scrollIntoView,
});

const additionalClasses = computed(() =>
  [
    `virtualscroller--${props.orientation}`,
    props.showBorder && "virtualscroller--bordered",
    props.loading && "virtualscroller--loading",
  ].filter(Boolean).join(" ")
);
</script>
