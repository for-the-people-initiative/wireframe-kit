<template>
  <div class="feature-grid" :class="additionalClasses">
    <slot>
      <div
        v-for="(feature, index) in features"
        :key="index"
        v-rough="{ disabled: variant !== 'card' }"
        class="feature-grid__item"
      >
        <div v-if="feature.icon" class="feature-grid__icon">
          <i :class="feature.icon" aria-hidden="true" />
        </div>
        <h3 class="feature-grid__title">{{ feature.title }}</h3>
        <p class="feature-grid__description">{{ feature.description }}</p>
      </div>
    </slot>
  </div>
</template>

<style src="./FeatureGrid.scss"></style>

<script setup lang="ts">
import type { FeatureGridProps } from '../../types';
import { computed } from 'vue';

defineOptions({ name: 'FtpFeatureGrid' });

const props = withDefaults(defineProps<FeatureGridProps>(), {
  columns: 3,
  variant: 'card',
  features: () => [],
});

const additionalClasses = computed(() =>
  [
    `feature-grid--cols-${props.columns}`,
    `feature-grid--${props.variant}`,
  ].join(' ')
);
</script>
