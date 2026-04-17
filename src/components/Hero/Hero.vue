<template>
  <section
    v-rough="{ strokeWidth: 2 }"
    class="hero"
    :class="additionalClasses"
    :style="backgroundStyles"
    :aria-labelledby="title ? heroTitleId : undefined"
  >
    <div v-if="overlay" class="hero__overlay" />
    <div class="hero__container">
      <div class="hero__content">
        <h1 v-if="title" :id="heroTitleId" class="hero__title">{{ title }}</h1>
        <p v-if="subtitle" class="hero__subtitle">{{ subtitle }}</p>
        <div v-if="$slots.default" class="hero__body">
          <slot />
        </div>
        <div v-if="$slots.actions" class="hero__actions">
          <slot name="actions" />
        </div>
      </div>
      <div v-if="$slots.media" class="hero__media">
        <slot name="media" />
      </div>
    </div>
  </section>
</template>

<style src="./Hero.scss"></style>

<script setup lang="ts">
import type { HeroProps } from '../../types';
import { computed } from 'vue';

defineOptions({ name: 'FtpHero' });

const heroTitleId = `hero-title-${Math.random().toString(36).substring(2, 9)}`;

const props = withDefaults(defineProps<HeroProps>(), {
  alignment: 'center',
  overlay: false,
  fullHeight: false,
});

const additionalClasses = computed(() =>
  [
    `hero--align-${props.alignment}`,
    props.fullHeight && 'hero--full-height',
    props.backgroundImage && 'hero--has-bg',
  ]
    .filter(Boolean)
    .join(' ')
);

// Wireframe mode: never render real images. If a backgroundImage is supplied,
// a hatched placeholder fill is used instead (see Hero.scss .hero--has-bg).
const backgroundStyles = computed(() => ({}));
</script>
