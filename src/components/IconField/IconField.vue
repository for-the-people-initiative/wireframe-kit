<template>
  <div v-rough class="icon-field" :class="additionalClasses">
    <slot />
  </div>
</template>

<style src="./IconField.scss"></style>

<script setup lang="ts">
import type { IconFieldProps } from '../../types';
import { computed } from "vue";

defineOptions({ name: 'IconField' });

const props = withDefaults(defineProps<IconFieldProps>(), {});

const additionalClasses = computed(() =>
  [].filter(Boolean).join(" ")
);
</script>
