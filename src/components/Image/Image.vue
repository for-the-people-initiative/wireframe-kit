<template>
  <span class="image" :class="additionalClasses">
    <img
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      class="image__img"
      @click="onImageClick"
      @load="onLoad"
      @error="onError"
    />
    <span v-if="preview" class="image__preview-indicator">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
        <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z" fill="currentColor"/>
      </svg>
    </span>

    <!-- Preview lightbox -->
    <Teleport to="body">
      <Transition name="image-preview">
        <div
          v-if="previewVisible"
          class="image__overlay"
          @click="closePreview"
          @keydown.escape="closePreview"
        >
          <button
            type="button"
            class="image__close"
            aria-label="Close preview"
            @click.stop="closePreview"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <img
            :src="src"
            :alt="alt"
            class="image__preview-img"
            @click.stop
          />
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style src="./Image.scss"></style>

<script setup lang="ts">
import type { ImageProps, ImageEmits } from '../../types';
import { computed, ref, watch, onUnmounted } from "vue";

defineOptions({ name: 'FtpImage' });

const props = withDefaults(defineProps<ImageProps>(), {
  alt: "",
  width: undefined,
  height: undefined,
  preview: false,
});

const emit = defineEmits(["show", "hide", "error", "load"]);

const previewVisible = ref(false);
const hasError = ref(false);
const isLoaded = ref(false);

const additionalClasses = computed(() =>
  [
    props.preview && "image--preview",
    hasError.value && "image--error",
    isLoaded.value && "image--loaded",
  ]
    .filter(Boolean)
    .join(" ")
);

const onImageClick = () => {
  if (props.preview) {
    openPreview();
  }
};

const openPreview = () => {
  previewVisible.value = true;
  document.body.style.overflow = "hidden";
  emit("show");
};

const closePreview = () => {
  previewVisible.value = false;
  document.body.style.overflow = "";
  emit("hide");
};

const onLoad = (event: Event) => {
  isLoaded.value = true;
  emit("load", event);
};

const onError = (event: Event) => {
  hasError.value = true;
  emit("error", event);
};

// Cleanup on unmount
onUnmounted(() => {
  if (previewVisible.value) {
    document.body.style.overflow = "";
  }
});
</script>
