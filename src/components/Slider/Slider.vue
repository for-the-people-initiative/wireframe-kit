<template>
  <div class="slider" :class="additionalClasses">
    <input
      ref="inputRef"
      type="range"
      class="slider__input"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="isDisabled"
      :name="name"
      :aria-label="ariaLabel || 'Slider'"
      :aria-describedby="ariaDescribedby || undefined"
      :style="trackStyle"
      @input="onInput"
      @change="onChange"
    />
  </div>
</template>

<style src="./Slider.scss"></style>

<script setup lang="ts">
import type { SliderProps, SliderEmits } from '../../types';
import { computed, ref } from "vue";

defineOptions({ name: 'FtpSlider' });

const props = withDefaults(defineProps<SliderProps>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  isDisabled: false,
});

const emit = defineEmits(["update:modelValue", "change"]);

const inputRef = ref(null);

const percentage = computed(() => {
  const range = props.max - props.min;
  if (range === 0) return 0;
  return ((props.modelValue - props.min) / range) * 100;
});

const trackStyle = computed(() => ({
  "--slider-fill-percentage": `${percentage.value}%`,
}));

const onInput = (event: Event) => {
  const value = parseFloat((event.target as HTMLInputElement).value);
  emit("update:modelValue", value);
};

const onChange = (event: Event) => {
  const value = parseFloat((event.target as HTMLInputElement).value);
  emit("change", { value, originalEvent: event });
};

const additionalClasses = computed(() => [
  props.isDisabled && "slider--disabled",
].filter(Boolean).join(" "));
</script>
