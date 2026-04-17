<template>
  <section class="site-section" :class="additionalClasses" :id="id">
    <div class="site-section__container">
      <div v-if="title || subtitle || $slots.header" class="site-section__header">
        <slot name="header">
          <h2 v-if="title" class="site-section__title">{{ title }}</h2>
          <p v-if="subtitle" class="site-section__subtitle">{{ subtitle }}</p>
        </slot>
      </div>
      <div class="site-section__body">
        <slot />
      </div>
      <div v-if="$slots.footer" class="site-section__footer">
        <slot name="footer" />
      </div>
    </div>
  </section>
</template>

<style src="./Section.scss"></style>

<script setup lang="ts">
import type { SectionProps } from '../../types';
import { computed } from 'vue';

defineOptions({ name: 'Section' });

const props = withDefaults(defineProps<SectionProps>(), {
  variant: 'default',
  padding: 'lg',
});

const additionalClasses = computed(() =>
  [
    `site-section--${props.variant}`,
    `site-section--pad-${props.padding}`,
  ].join(' ')
);
</script>
