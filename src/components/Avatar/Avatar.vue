<template>
  <div
    class="avatar"
    :class="additionalClasses"
    role="img"
    :aria-label="ariaLabel || label || 'Avatar'"
  >
    <span class="avatar__label">{{ initials }}</span>
  </div>
</template>

<style src="./Avatar.scss"></style>

<script setup lang="ts">
import type { AvatarProps } from '../../types';
import { computed } from 'vue';

defineOptions({ name: 'Avatar' });

const props = withDefaults(defineProps<AvatarProps>(), {
  size: 'medium',
  shape: 'square',
});

defineEmits(['error']);

const initials = computed(() => {
  const source = (props.label ?? props.ariaLabel ?? '').trim();
  if (!source) return '?';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
});

const additionalClasses = computed(() =>
  [
    `avatar--size-${props.size}`,
    `avatar--shape-${props.shape}`,
  ].join(' ')
);
</script>
