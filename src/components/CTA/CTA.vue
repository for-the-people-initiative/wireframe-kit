<template>
  <div v-rough class="cta" :class="additionalClasses">
    <div class="cta__content">
      <h2 v-if="title" class="cta__title">{{ title }}</h2>
      <p v-if="description" class="cta__description">{{ description }}</p>
      <slot />
    </div>
    <div v-if="$slots.actions" class="cta__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style src="./CTA.scss"></style>

<script setup lang="ts">
import type { CTAProps } from '../../types';
import { computed } from 'vue';

defineOptions({ name: 'FtpCTA' });

const props = withDefaults(defineProps<CTAProps>(), {
  variant: 'banner',
  alignment: 'center',
});

const additionalClasses = computed(() =>
  [
    `cta--${props.variant}`,
    `cta--align-${props.alignment}`,
  ].join(' ')
);
</script>
