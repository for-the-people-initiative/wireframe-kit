<template>
  <article v-rough class="pricing-card" :class="{ 'pricing-card--highlighted': highlighted }">
    <div class="pricing-card__header">
      <h3 class="pricing-card__name">{{ name }}</h3>
      <div class="pricing-card__price">
        <span v-if="currency" class="pricing-card__currency">{{ currency }}</span>
        <span class="pricing-card__amount">{{ price }}</span>
        <span v-if="interval" class="pricing-card__interval">/{{ interval }}</span>
      </div>
    </div>
    <ul class="pricing-card__features">
      <li v-for="(feature, i) in features" :key="i" class="pricing-card__feature">
        <span class="pricing-card__check" aria-hidden="true">✓</span>
        {{ feature }}
      </li>
    </ul>
    <div class="pricing-card__footer">
      <button class="pricing-card__cta" @click="ctaAction?.()">
        {{ ctaLabel || 'Get started' }}
      </button>
    </div>
  </article>
</template>

<style src="./PricingTable.scss"></style>

<script setup lang="ts">
import type { PricingCardProps } from '../../types';

defineOptions({ name: 'FtpPricingCard' });

defineProps<PricingCardProps>();
</script>
