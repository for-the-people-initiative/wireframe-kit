<template>
  <div v-rough class="color-picker color-picker--stub" :class="{ 'color-picker--disabled': isDisabled }">
    <span class="color-picker__swatch" aria-hidden="true" />
    <span class="color-picker__label">[ Color Picker ]</span>
  </div>
</template>

<style src="./ColorPicker.scss"></style>

<script setup lang="ts">
import type { ColorPickerProps } from '../../types';
import { onMounted } from 'vue';

defineOptions({ name: 'FtpColorPicker' });

const props = withDefaults(defineProps<ColorPickerProps>(), {
  modelValue: '#000000',
  presetColors: () => [],
  inline: false,
  size: 'md',
  isDisabled: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', payload: { value: string }): void
}>();

// Wireframe mode: color has no meaning. Emit a single neutral ink value so
// existing v-model bindings settle deterministically.
onMounted(() => {
  if (props.modelValue !== '#000000') {
    emit('update:modelValue', '#000000');
    emit('change', { value: '#000000' });
  }
});
</script>
