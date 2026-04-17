<template>
  <div class="pricing-table" :class="`pricing-table--cols-${columns}`">
    <PricingCard
      v-for="(plan, index) in plans"
      :key="index"
      v-bind="plan"
    />
  </div>
</template>

<script setup lang="ts">
import type { PricingTableProps } from '../../types';
import PricingCard from './PricingCard.vue';

defineOptions({ name: 'PricingTable' });

withDefaults(defineProps<PricingTableProps>(), {
  columns: 3,
  plans: () => [],
});
</script>
