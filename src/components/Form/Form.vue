<template>
  <form
    class="form"
    :class="additionalClasses"
    @submit.prevent="$emit('submit', $event)"
  >
    <slot />
  </form>
</template>

<style src="./Form.scss"></style>

<script setup lang="ts">
import type { FormProps } from '../../types';
import { computed } from 'vue';

defineOptions({ name: 'Form' });

const props = withDefaults(defineProps<FormProps>(), {
  layout: 'vertical',
});

defineEmits<{
  (e: 'submit', event: Event): void
}>();

const additionalClasses = computed(() =>
  [`form--${props.layout}`].filter(Boolean).join(' ')
);
</script>
