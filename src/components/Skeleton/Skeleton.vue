<template>
  <div
    class="skeleton"
    :class="additionalClasses"
    :style="containerStyle"
    aria-hidden="true"
  />
</template>

<style src="./Skeleton.scss"></style>

<script setup lang="ts">
import type { SkeletonProps } from '../../types';
import { computed } from "vue";

defineOptions({ name: 'FtpSkeleton' });

const props = withDefaults(defineProps<SkeletonProps>(), {
  shape: "rectangle",
  width: null,
  height: null,
  borderRadius: null,
  animation: "wave",
});

const additionalClasses = computed(() => {
  const classes = [];

  if (props.shape === "circle") {
    classes.push("skeleton--circle");
  }

  if (props.animation === "wave") {
    classes.push("skeleton--animated");
  }

  return classes.join(" ");
});

const containerStyle = computed(() => {
  const style: Record<string, string> = {};

  if (props.width) {
    style.width = props.width;
  }

  if (props.height) {
    style.height = props.height;
  }

  if (props.borderRadius) {
    style.borderRadius = props.borderRadius;
  }

  return style;
});
</script>
