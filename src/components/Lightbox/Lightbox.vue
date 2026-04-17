<template>
  <Teleport to="body">
    <Transition name="lightbox-fade">
      <div
        v-if="visible"
        class="lightbox__overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Image lightbox"
        tabindex="-1"
        @click="onOverlayClick"
        @keydown.escape="close"
        @keydown.left="prev"
        @keydown.right="next"
      >
        <!-- Close button -->
        <button
          type="button"
          class="lightbox__close"
          aria-label="Close lightbox"
          @click.stop="close"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <!-- Counter -->
        <div v-if="showCounter && images.length > 1" class="lightbox__counter">
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>

        <!-- Previous button -->
        <button
          v-if="images.length > 1"
          type="button"
          class="lightbox__nav lightbox__nav--prev"
          aria-label="Previous image"
          @click.stop="prev"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <!-- Image -->
        <div
          class="lightbox__image-container"
          @click.stop
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <Transition :name="slideDirection">
            <div
              :key="currentIndex"
              class="lightbox__image lightbox__placeholder"
              :class="{ 'lightbox__image--zoomed': isZoomed }"
              :style="zoomStyle"
              role="img"
              :aria-label="currentAlt"
              @click.stop="toggleZoom"
            >
              <span class="lightbox__placeholder-label">[ {{ currentAlt }} ]</span>
            </div>
          </Transition>
        </div>

        <!-- Next button -->
        <button
          v-if="images.length > 1"
          type="button"
          class="lightbox__nav lightbox__nav--next"
          aria-label="Next image"
          @click.stop="next"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <!-- Thumbnails -->
        <div v-if="showThumbnails && images.length > 1" class="lightbox__thumbnails" @click.stop>
          <button
            v-for="(image, index) in images"
            :key="index"
            type="button"
            class="lightbox__thumbnail"
            :class="{ 'lightbox__thumbnail--active': index === currentIndex }"
            :aria-label="`View image ${index + 1}`"
            @click="goTo(index)"
          >
            <span class="lightbox__thumbnail-placeholder">
              {{ (typeof image === 'string' ? `#${index + 1}` : (image.alt || `#${index + 1}`)).slice(0, 10) }}
            </span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style src="./Lightbox.scss"></style>

<script setup lang="ts">
import type { LightboxProps } from '../../types';
import { computed, ref, watch, onUnmounted, nextTick } from "vue";

defineOptions({ name: 'FtpLightbox' });

const props = withDefaults(defineProps<LightboxProps>(), {
  images: () => [],
  visible: false,
  activeIndex: 0,
  showThumbnails: false,
  showCounter: true,
  closeOnClickOutside: true,
  zoom: false,
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'update:activeIndex', value: number): void
  (e: 'show'): void
  (e: 'hide'): void
}>();

const internalIndex = ref(props.activeIndex);
const isZoomed = ref(false);
const slideDirection = ref('lightbox-slide-left');

// Touch/swipe state
const touchStartX = ref(0);
const touchStartY = ref(0);
const touchDeltaX = ref(0);
const isSwiping = ref(false);

const currentIndex = computed({
  get: () => internalIndex.value,
  set: (val) => {
    internalIndex.value = val;
    emit('update:activeIndex', val);
  },
});

const currentImage = computed(() => {
  const img = props.images[currentIndex.value];
  if (!img) return '';
  return typeof img === 'string' ? img : (img as any).src || '';
});

const currentAlt = computed(() => {
  const img = props.images[currentIndex.value];
  if (!img) return `Image ${currentIndex.value + 1}`;
  const alt = typeof img === 'string' ? '' : ((img as any).alt || '');
  return alt || `Image ${currentIndex.value + 1} of ${props.images.length}`;
});

const zoomStyle = computed(() => {
  if (!isZoomed.value) return {};
  return { cursor: 'zoom-out', transform: 'scale(2)' };
});

watch(() => props.activeIndex, (val) => {
  internalIndex.value = val;
});

// Body scroll lock
let didLockScroll = false;

watch(() => props.visible, async (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden';
    didLockScroll = true;
    emit('show');
    await nextTick();
    // Focus the overlay for keyboard events
    const overlay = document.querySelector('.lightbox__overlay') as HTMLElement;
    overlay?.focus();
  } else {
    if (didLockScroll) {
      document.body.style.overflow = '';
      didLockScroll = false;
    }
    isZoomed.value = false;
    emit('hide');
  }
});

const close = () => {
  emit('update:visible', false);
};

const onOverlayClick = () => {
  if (props.closeOnClickOutside) {
    close();
  }
};

const prev = () => {
  if (isZoomed.value) return;
  slideDirection.value = 'lightbox-slide-right';
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = props.images.length - 1;
  }
};

const next = () => {
  if (isZoomed.value) return;
  slideDirection.value = 'lightbox-slide-left';
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0;
  }
};

const goTo = (index: number) => {
  slideDirection.value = index > currentIndex.value ? 'lightbox-slide-left' : 'lightbox-slide-right';
  isZoomed.value = false;
  currentIndex.value = index;
};

const toggleZoom = () => {
  if (!props.zoom) return;
  isZoomed.value = !isZoomed.value;
};

const onImageLoad = () => {
  // Could emit event or handle loading state
};

// Touch/swipe support
const onTouchStart = (e: TouchEvent) => {
  if (isZoomed.value) return;
  touchStartX.value = e.touches[0].clientX;
  touchStartY.value = e.touches[0].clientY;
  touchDeltaX.value = 0;
  isSwiping.value = false;
};

const onTouchMove = (e: TouchEvent) => {
  if (isZoomed.value) return;
  const deltaX = e.touches[0].clientX - touchStartX.value;
  const deltaY = e.touches[0].clientY - touchStartY.value;

  // Only swipe horizontally
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    isSwiping.value = true;
    touchDeltaX.value = deltaX;
    e.preventDefault();
  }
};

const onTouchEnd = () => {
  if (!isSwiping.value || isZoomed.value) return;
  const threshold = 50;
  if (touchDeltaX.value > threshold) {
    prev();
  } else if (touchDeltaX.value < -threshold) {
    next();
  }
  isSwiping.value = false;
  touchDeltaX.value = 0;
};

onUnmounted(() => {
  if (didLockScroll) {
    document.body.style.overflow = '';
    didLockScroll = false;
  }
});

defineExpose({
  prev,
  next,
  goTo,
  close,
});
</script>
