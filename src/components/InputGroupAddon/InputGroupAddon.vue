<template>
  <span v-rough class="input-group-addon" :class="additionalClasses">
    <slot />
  </span>
</template>

<style src="./InputGroupAddon.scss"></style>

<script setup lang="ts">
import type { InputGroupAddonProps } from '../../types';
import { computed } from "vue";

defineOptions({ name: 'FtpInputGroupAddon' });

const props = withDefaults(defineProps<InputGroupAddonProps>(), {
  size: "md",
});

const additionalClasses = computed(() =>
  [`input-group-addon--size-${props.size}`].filter(Boolean).join(" ")
);
</script>
