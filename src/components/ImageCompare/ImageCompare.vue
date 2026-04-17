<template>
  <div
    v-rough
    class="image-compare"
    :class="additionalClasses"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledBy"
  >
    <div class="image-compare__before" :style="beforeStyle">
      <slot name="before" />
    </div>
    <div class="image-compare__after">
      <slot name="after" />
    </div>
    <div class="image-compare__handle" :style="handleStyle">
      <div class="image-compare__handle-line"></div>
      <div class="image-compare__handle-icon">
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" transform="rotate(180 12 12)"/>
        </svg>
      </div>
    </div>
    <input
      type="range"
      class="image-compare__slider"
      min="0"
      max="100"
      :value="position"
      @input="onSlide"
    />
  </div>
</template>

<style src="./ImageCompare.scss"></style>

<script setup lang="ts">
import type { ImageCompareProps, ImageCompareEmits } from '../../types';
import { ref, computed } from "vue";

defineOptions({ name: 'FtpImageCompare' });

const props = withDefaults(defineProps<ImageCompareProps>(), {
  initialPosition: 50,
  ariaLabel: "Image comparison slider",
  ariaLabelledBy: undefined,
});

const emit = defineEmits(["change"]);

const position = ref(props.initialPosition);

const onSlide = (event: Event) => {
  position.value = Number((event.target as HTMLInputElement).value);
  emit("change", position.value);
};

const beforeStyle = computed(() => ({
  clipPath: `inset(0 ${100 - position.value}% 0 0)`
}));

const handleStyle = computed(() => ({
  left: `${position.value}%`
}));

const additionalClasses = computed(() => [].filter(Boolean).join(" "));
</script>
