<template>
  <div class="avatar" :class="additionalClasses" role="img" :aria-label="ariaLabel || label || 'Avatar'">
    <img
      v-if="image && !imageError"
      :src="image"
      :alt="ariaLabel || label || 'avatar'"
      class="avatar__image"
      @error="onImageError"
    />
    <span v-else-if="label" class="avatar__label">{{ label }}</span>
    <i v-else-if="icon" :class="icon" class="avatar__icon"></i>
    <slot v-else />
  </div>
</template>

<style src="./Avatar.scss"></style>

<script setup lang="ts">
import type { AvatarProps, AvatarEmits } from '../../types';
import { computed, ref } from "vue";

defineOptions({ name: 'FtpAvatar' });

const props = withDefaults(defineProps<AvatarProps>(), {
  size: "medium",
  shape: "square",
});

const emit = defineEmits(["error"]);

const imageError = ref(false);

const onImageError = (event: Event) => {
  imageError.value = true;
  emit("error", event);
};

const additionalClasses = computed(() =>
  [
    `avatar--size-${props.size}`,
    `avatar--shape-${props.shape}`,
  ].join(" ")
);
</script>
