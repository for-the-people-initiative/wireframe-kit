<template>
  <div class="stats" :class="`stats--cols-${columns}`">
    <div v-for="(stat, i) in stats" :key="i" class="stats__item">
      <div v-if="stat.icon" class="stats__icon">
        <i :class="stat.icon" aria-hidden="true" />
      </div>
      <div class="stats__value">
        <span v-if="stat.prefix" class="stats__prefix">{{ stat.prefix }}</span>
        {{ stat.value }}
        <span v-if="stat.suffix" class="stats__suffix">{{ stat.suffix }}</span>
      </div>
      <div class="stats__label">{{ stat.label }}</div>
    </div>
  </div>
</template>

<style src="./Stats.scss"></style>

<script setup lang="ts">
import type { StatsProps } from '../../types';

defineOptions({ name: 'Stats' });

withDefaults(defineProps<StatsProps>(), {
  stats: () => [],
  columns: 4,
});
</script>
