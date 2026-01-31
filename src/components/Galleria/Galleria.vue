<template>
  <div class="galleria" :class="additionalClasses">
    <div class="galleria__main">
      <!-- Preview area -->
      <div
        class="galleria__preview"
        @click="onPreviewClick"
        @touchstart.passive="onTouchStart"
        @touchmove.passive="onTouchMove"
        @touchend="onTouchEnd"
      >
        <!-- Loading spinner -->
        <div v-if="imageLoading" class="galleria__loader">
          <svg class="galleria__spinner" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="80" stroke-linecap="round" />
          </svg>
        </div>

        <Transition :name="transitionName" mode="out-in">
          <img
            v-if="activeItem"
            :key="activeIndex"
            :src="activeItem.src || activeItem"
            :alt="activeItem.alt || `Image ${activeIndex + 1}`"
            class="galleria__preview-image"
            @load="onImageLoad"
            @error="onImageLoad"
          />
        </Transition>

        <!-- Navigation buttons -->
        <button
          v-if="showItemNavigators && items.length > 1"
          type="button"
          class="galleria__nav galleria__nav--prev"
          :disabled="!circular && activeIndex === 0"
          aria-label="Previous image"
          @click.stop="prev"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          v-if="showItemNavigators && items.length > 1"
          type="button"
          class="galleria__nav galleria__nav--next"
          :disabled="!circular && activeIndex === items.length - 1"
          aria-label="Next image"
          @click.stop="next"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <!-- Indicators (inside preview) -->
        <div v-if="showIndicators && items.length > 1" class="galleria__indicators">
          <button
            v-for="(_, index) in items"
            :key="index"
            type="button"
            class="galleria__indicator"
            :class="{ 'galleria__indicator--active': index === activeIndex }"
            :aria-label="`View image ${index + 1}`"
            @click.stop="goTo(index)"
          />
        </div>

        <!-- Caption -->
        <div v-if="activeItem && (activeItem.title || activeItem.description)" class="galleria__caption">
          <h4 v-if="activeItem.title" class="galleria__caption-title">{{ activeItem.title }}</h4>
          <p v-if="activeItem.description" class="galleria__caption-description">{{ activeItem.description }}</p>
        </div>
      </div>
    </div>

    <!-- Thumbnails -->
    <div v-if="showThumbnails" class="galleria__thumbnails">
      <div class="galleria__thumbnail-container">
        <button
          v-for="(item, index) in items"
          :key="index"
          type="button"
          class="galleria__thumbnail"
          :class="{ 'galleria__thumbnail--active': index === activeIndex }"
          :aria-label="`View image ${index + 1}`"
          @click="goTo(index)"
        >
          <img
            :src="item.thumbnail || item.src || item"
            :alt="item.alt || `Thumbnail ${index + 1}`"
          />
        </button>
      </div>
    </div>

    <!-- Fullscreen overlay -->
    <Teleport to="body">
      <Transition name="galleria-fullscreen">
        <div
          v-if="fullscreenVisible"
          ref="fullscreenRef"
          class="galleria__fullscreen"
          :class="{ 'galleria__fullscreen--zoomed': isZoomed }"
          tabindex="0"
          @click="onFullscreenClick"
          @keydown.escape="closeFullscreen"
          @keydown.left="prev"
          @keydown.right="next"
          @touchstart.passive="onTouchStart"
          @touchmove.passive="onTouchMove"
          @touchend="onTouchEnd"
        >
          <button
            type="button"
            class="galleria__fullscreen-close"
            aria-label="Close fullscreen"
            @click.stop="closeFullscreen"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <button
            v-if="items.length > 1"
            type="button"
            class="galleria__fullscreen-nav galleria__fullscreen-nav--prev"
            aria-label="Previous image"
            @click.stop="prev"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <!-- Loading spinner in fullscreen -->
          <div v-if="imageLoading" class="galleria__loader galleria__loader--fullscreen">
            <svg class="galleria__spinner" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="80" stroke-linecap="round" />
            </svg>
          </div>

          <Transition :name="transitionName" mode="out-in">
            <img
              v-if="activeItem"
              :key="activeIndex"
              :src="activeItem.src || activeItem"
              :alt="activeItem.alt || `Image ${activeIndex + 1}`"
              class="galleria__fullscreen-image"
              :class="{ 'galleria__fullscreen-image--zoomed': isZoomed }"
              :style="zoomStyle"
              @click.stop="onImageClick"
              @dblclick.stop="toggleZoom"
              @load="onImageLoad"
              @error="onImageLoad"
            />
          </Transition>

          <button
            v-if="items.length > 1"
            type="button"
            class="galleria__fullscreen-nav galleria__fullscreen-nav--next"
            aria-label="Next image"
            @click.stop="next"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <!-- Counter -->
          <div v-if="showCounter && items.length > 1" class="galleria__counter">
            {{ activeIndex + 1 }} / {{ items.length }}
          </div>

          <!-- Fullscreen thumbnails -->
          <div v-if="showFullscreenThumbnails && items.length > 1" class="galleria__fullscreen-thumbnails">
            <div class="galleria__thumbnail-container">
              <button
                v-for="(item, index) in items"
                :key="index"
                type="button"
                class="galleria__thumbnail galleria__thumbnail--fullscreen"
                :class="{ 'galleria__thumbnail--active': index === activeIndex }"
                :aria-label="`View image ${index + 1}`"
                @click.stop="goTo(index)"
              >
                <img
                  :src="item.thumbnail || item.src || item"
                  :alt="item.alt || `Thumbnail ${index + 1}`"
                />
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style src="./Galleria.scss"></style>

<script setup lang="ts">
import type { GalleriaProps, GalleriaEmits } from '../../types';
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from "vue";

defineOptions({ name: 'FtpGalleria' });

const props = withDefaults(defineProps<GalleriaProps>(), {
  items: () => [],
  activeIndex: 0,
  fullscreen: false,
  showThumbnails: true,
  showItemNavigators: true,
  showIndicators: false,
  showCounter: true,
  showFullscreenThumbnails: true,
  enableZoom: true,
  circular: false,
  autoplay: false,
  autoplayInterval: 4000,
  thumbnailsPosition: "bottom",
  transition: "fade",
});

const emit = defineEmits(["update:activeIndex", "show", "hide"]);

const internalIndex = ref(props.activeIndex);
const fullscreenVisible = ref(false);
const fullscreenRef = ref<HTMLElement | null>(null);
const autoplayTimer = ref<ReturnType<typeof setInterval> | null>(null);
const imageLoading = ref(false);
const isZoomed = ref(false);
const zoomScale = ref(1);
const zoomOrigin = ref({ x: 50, y: 50 });
const slideDirection = ref<'left' | 'right'>('left');

// Touch tracking
const touchStartX = ref(0);
const touchStartY = ref(0);
const touchDeltaX = ref(0);
// Pinch zoom
const initialPinchDistance = ref(0);

const activeIndex = computed({
  get: () => internalIndex.value,
  set: (val) => {
    internalIndex.value = val;
    emit("update:activeIndex", val);
  },
});

const activeItem = computed(() => props.items[activeIndex.value]);

const transitionName = computed(() => {
  if (props.transition === 'none') return '';
  if (props.transition === 'slide') return slideDirection.value === 'left' ? 'galleria-slide-left' : 'galleria-slide-right';
  return 'galleria-fade';
});

const additionalClasses = computed(() =>
  [
    `galleria--thumbnails-${props.thumbnailsPosition}`,
    props.fullscreen && "galleria--fullscreen-enabled",
  ]
    .filter(Boolean)
    .join(" ")
);

const zoomStyle = computed(() => {
  if (!isZoomed.value) return {};
  return {
    transform: `scale(${zoomScale.value})`,
    transformOrigin: `${zoomOrigin.value.x}% ${zoomOrigin.value.y}%`,
    cursor: 'zoom-out',
  };
});

watch(() => props.activeIndex, (newValue) => {
  internalIndex.value = newValue;
});

// Reset zoom on image change
watch(() => activeIndex.value, () => {
  isZoomed.value = false;
  zoomScale.value = 1;
  imageLoading.value = true;
});

// Preload adjacent images
watch(() => activeIndex.value, () => {
  preloadAdjacent();
}, { immediate: true });

const preloadAdjacent = () => {
  const preloadIndex = (i: number) => {
    const item = props.items[i];
    if (!item) return;
    const img = new Image();
    img.src = item.src || item;
  };
  if (activeIndex.value > 0) preloadIndex(activeIndex.value - 1);
  if (activeIndex.value < props.items.length - 1) preloadIndex(activeIndex.value + 1);
  // Also preload circular edges
  if (props.circular && props.items.length > 1) {
    if (activeIndex.value === 0) preloadIndex(props.items.length - 1);
    if (activeIndex.value === props.items.length - 1) preloadIndex(0);
  }
};

const onImageLoad = () => {
  imageLoading.value = false;
};

const prev = () => {
  slideDirection.value = 'right';
  if (activeIndex.value > 0) {
    activeIndex.value--;
  } else if (props.circular && props.items.length > 0) {
    activeIndex.value = props.items.length - 1;
  }
};

const next = () => {
  slideDirection.value = 'left';
  if (activeIndex.value < props.items.length - 1) {
    activeIndex.value++;
  } else if (props.circular) {
    activeIndex.value = 0;
  }
};

const goTo = (index: any) => {
  slideDirection.value = index > activeIndex.value ? 'left' : 'right';
  activeIndex.value = index;
};

const onPreviewClick = () => {
  if (props.fullscreen) {
    openFullscreen();
  }
};

const openFullscreen = () => {
  fullscreenVisible.value = true;
  document.body.style.overflow = "hidden";
  nextTick(() => fullscreenRef.value?.focus());
  emit("show");
};

const closeFullscreen = () => {
  fullscreenVisible.value = false;
  isZoomed.value = false;
  zoomScale.value = 1;
  document.body.style.overflow = "";
  emit("hide");
};

const onFullscreenClick = (e: MouseEvent) => {
  // Only close if clicking the backdrop itself
  if (e.target === fullscreenRef.value) {
    closeFullscreen();
  }
};

const onImageClick = () => {
  // Single click on image in fullscreen — do nothing (dblclick handles zoom)
};

// Zoom
const toggleZoom = (e?: MouseEvent) => {
  if (!props.enableZoom || !fullscreenVisible.value) return;
  if (isZoomed.value) {
    isZoomed.value = false;
    zoomScale.value = 1;
  } else {
    isZoomed.value = true;
    zoomScale.value = 2.5;
    if (e) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      zoomOrigin.value = {
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      };
    }
  }
};

// Touch/swipe
const onTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 2 && fullscreenVisible.value && props.enableZoom) {
    // Pinch start
    initialPinchDistance.value = getPinchDistance(e);
    return;
  }
  touchStartX.value = e.touches[0].clientX;
  touchStartY.value = e.touches[0].clientY;
  touchDeltaX.value = 0;
};

const onTouchMove = (e: TouchEvent) => {
  if (e.touches.length === 2 && fullscreenVisible.value && props.enableZoom) {
    // Pinch zoom
    const dist = getPinchDistance(e);
    const ratio = dist / initialPinchDistance.value;
    if (ratio > 1.3 && !isZoomed.value) {
      isZoomed.value = true;
      zoomScale.value = 2.5;
      zoomOrigin.value = { x: 50, y: 50 };
    } else if (ratio < 0.7 && isZoomed.value) {
      isZoomed.value = false;
      zoomScale.value = 1;
    }
    return;
  }
  touchDeltaX.value = e.touches[0].clientX - touchStartX.value;
};

const onTouchEnd = () => {
  if (isZoomed.value) return; // Don't swipe when zoomed
  if (Math.abs(touchDeltaX.value) > 50) {
    if (touchDeltaX.value > 0) {
      prev();
    } else {
      next();
    }
  }
  touchDeltaX.value = 0;
};

const getPinchDistance = (e: TouchEvent): number => {
  const dx = e.touches[0].clientX - e.touches[1].clientX;
  const dy = e.touches[0].clientY - e.touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

const startAutoplay = () => {
  if (typeof window === 'undefined') return;
  if (props.autoplay && props.items.length > 1) {
    autoplayTimer.value = setInterval(() => {
      next();
    }, props.autoplayInterval);
  }
};

const stopAutoplay = () => {
  if (autoplayTimer.value) {
    clearInterval(autoplayTimer.value);
    autoplayTimer.value = null;
  }
};

onMounted(() => {
  if (props.autoplay) {
    startAutoplay();
  }
});

watch(() => props.autoplay, (newValue) => {
  if (typeof window === 'undefined') return;
  if (newValue) {
    startAutoplay();
  } else {
    stopAutoplay();
  }
});

onUnmounted(() => {
  stopAutoplay();
  if (fullscreenVisible.value) {
    document.body.style.overflow = "";
  }
});

defineExpose({
  prev,
  next,
  goTo,
  openFullscreen,
  closeFullscreen,
});
</script>
