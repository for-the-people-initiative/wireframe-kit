<template>
  <div class="galleria" :class="additionalClasses">
    <div class="galleria__main">
      <!-- Preview area -->
      <div class="galleria__preview" @click="onPreviewClick">
        <img
          v-if="activeItem"
          :src="activeItem.src || activeItem"
          :alt="activeItem.alt || `Image ${activeIndex + 1}`"
          class="galleria__preview-image"
        />

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
          tabindex="0"
          @click="closeFullscreen"
          @keydown.escape="closeFullscreen"
          @keydown.left="prev"
          @keydown.right="next"
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

          <img
            v-if="activeItem"
            :src="activeItem.src || activeItem"
            :alt="activeItem.alt || `Image ${activeIndex + 1}`"
            class="galleria__fullscreen-image"
            @click.stop
          />

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
  circular: false,
  autoplay: false,
  autoplayInterval: 4000,
  thumbnailsPosition: "bottom",
});

const emit = defineEmits(["update:activeIndex", "show", "hide"]);

const internalIndex = ref(props.activeIndex);
const fullscreenVisible = ref(false);
const fullscreenRef = ref<HTMLElement | null>(null);
const autoplayTimer = ref<ReturnType<typeof setInterval> | null>(null);

const activeIndex = computed({
  get: () => internalIndex.value,
  set: (val) => {
    internalIndex.value = val;
    emit("update:activeIndex", val);
  },
});

const activeItem = computed(() => props.items[activeIndex.value]);

const additionalClasses = computed(() =>
  [
    `galleria--thumbnails-${props.thumbnailsPosition}`,
    props.fullscreen && "galleria--fullscreen-enabled",
  ]
    .filter(Boolean)
    .join(" ")
);

watch(() => props.activeIndex, (newValue) => {
  internalIndex.value = newValue;
});

const prev = () => {
  if (activeIndex.value > 0) {
    activeIndex.value--;
  } else if (props.circular && props.items.length > 0) {
    activeIndex.value = props.items.length - 1;
  }
};

const next = () => {
  if (activeIndex.value < props.items.length - 1) {
    activeIndex.value++;
  } else if (props.circular) {
    activeIndex.value = 0;
  }
};

const goTo = (index: any) => {
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
  document.body.style.overflow = "";
  emit("hide");
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
