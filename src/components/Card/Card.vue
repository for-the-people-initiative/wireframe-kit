<template>
  <article v-rough class="card" :class="additionalClasses" :aria-labelledby="$slots.title ? cardTitleId : undefined">
    <div v-if="$slots.header" class="card__header">
      <slot name="header" />
    </div>
    <div class="card__body">
      <div v-if="$slots.title || $slots.subtitle" class="card__caption">
        <div v-if="$slots.title" :id="cardTitleId" class="card__title">
          <slot name="title" />
        </div>
        <div v-if="$slots.subtitle" class="card__subtitle">
          <slot name="subtitle" />
        </div>
      </div>
      <div v-if="$slots.content || $slots.default" class="card__content">
        <slot name="content">
          <slot />
        </slot>
      </div>
    </div>
    <div v-if="$slots.footer" class="card__footer">
      <slot name="footer" />
    </div>
  </article>
</template>

<style src="./Card.scss"></style>

<script setup lang="ts">
import type { CardProps } from '../../types';
import { computed } from "vue";

defineOptions({ name: 'Card' });

const cardTitleId = `card-title-${Math.random().toString(36).substring(2, 9)}`;

const props = withDefaults(defineProps<CardProps>(), {
  variant: "default",
});

const additionalClasses = computed(() =>
  [
    props.variant !== "default" && `card--${props.variant}`,
  ]
    .filter(Boolean)
    .join(" ")
);
</script>
