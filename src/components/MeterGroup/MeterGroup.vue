<template>
  <div class="meter-group" :class="additionalClasses">
    <div v-if="showLabels" class="meter-group__header">
      <div class="meter-group__labels">
        <span
          v-for="(item, index) in values"
          :key="index"
          class="meter-group__label-item"
        >
          <span
            class="meter-group__marker"
            :style="{ backgroundColor: getColor(item.color) }"
          />
          <span class="meter-group__label-text">{{ item.label }}</span>
          <span class="meter-group__label-value">{{ formatValue(item.value) }}</span>
        </span>
      </div>
    </div>
    <div class="meter-group__track" role="meter" :aria-valuemax="max">
      <div
        v-for="(item, index) in values"
        :key="index"
        class="meter-group__meter"
        :style="getMeterStyle(item)"
        :aria-label="item.label"
        :aria-valuenow="item.value"
      />
    </div>
  </div>
</template>

<style src="./MeterGroup.scss"></style>

<script setup lang="ts">
import type { MeterGroupProps } from '../../types';
import { computed } from "vue";

defineOptions({ name: 'MeterGroup' });

const props = withDefaults(defineProps<MeterGroupProps>(), {
  max: 100,
  orientation: "horizontal",
  showLabels: true,
});

const colorMap: Record<string, string> = {
  primary: "var(--meter-group-colors-primary)",
  success: "var(--meter-group-colors-success)",
  warning: "var(--meter-group-colors-warning)",
  danger: "var(--meter-group-colors-danger)",
};

function getColor(color: any) {
  return colorMap[color] || color || colorMap.primary;
}

function getMeterStyle(item: any) {
  const percentage = (item.value / props.max) * 100;
  return {
    width: props.orientation === "horizontal" ? `${percentage}%` : "100%",
    height: props.orientation === "vertical" ? `${percentage}%` : "100%",
    backgroundColor: getColor(item.color),
  };
}

function formatValue(value: any) {
  return `${Math.round((value / props.max) * 100)}%`;
}

const additionalClasses = computed(() =>
  [`meter-group--${props.orientation}`].filter(Boolean).join(" ")
);
</script>
