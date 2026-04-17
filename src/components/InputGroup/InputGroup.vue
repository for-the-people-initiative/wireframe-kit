<template>
  <div v-rough class="input-group" :class="additionalClasses">
    <slot />
  </div>
</template>

<style src="./InputGroup.scss"></style>

<script setup lang="ts">
import type { InputGroupProps } from '../../types';
import { computed } from "vue";

defineOptions({ name: 'InputGroup' });

const props = withDefaults(defineProps<InputGroupProps>(), {
  fluid: false,
});

const additionalClasses = computed(() =>
  [props.fluid && "input-group--fluid"].filter(Boolean).join(" ")
);
</script>
