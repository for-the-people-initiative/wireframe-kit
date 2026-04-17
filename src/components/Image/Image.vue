<template>
  <span
    v-rough
    class="image"
    :class="{ 'image--preview': preview }"
    :style="boxStyle"
    role="img"
    :aria-label="ariaLabel"
    @click="onClick"
  >
    <span class="image__label">{{ labelText }}</span>
  </span>
</template>

<style src="./Image.scss"></style>

<script setup lang="ts">
import type { ImageProps } from '../../types';
import { computed, onMounted } from 'vue';

defineOptions({ name: 'FtpImage' });

const props = withDefaults(defineProps<ImageProps>(), {
  alt: '',
  width: undefined,
  height: undefined,
  preview: false,
});

const emit = defineEmits(['show', 'hide', 'error', 'load']);

const toSize = (v: number | string | undefined, fallback: string) => {
  if (v === undefined || v === null || v === '') return fallback;
  return typeof v === 'number' ? `${v}px` : v;
};

const boxStyle = computed(() => ({
  width: toSize(props.width, '100%'),
  height: toSize(props.height, '160px'),
}));

const labelText = computed(() => {
  const t = props.alt?.trim();
  return t ? `[ ${t} ]` : '[ image ]';
});

const ariaLabel = computed(() =>
  props.alt?.trim() || 'placeholder image'
);

const onClick = () => {
  if (!props.preview) return;
  emit('show');
  // Wireframe mode: preview doesn't open a real lightbox. Emit hide next tick.
  queueMicrotask(() => emit('hide'));
};

onMounted(() => {
  emit('load', new Event('load'));
});
</script>
