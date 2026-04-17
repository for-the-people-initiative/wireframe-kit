<template>
  <div class="picklist" :class="additionalClasses">
    <!-- Source List -->
    <div v-rough class="picklist__list picklist__list--source">
      <div v-if="sourceHeader" class="picklist__header">
        <slot name="sourceHeader">{{ sourceHeader }}</slot>
      </div>
      <div class="picklist__items" role="listbox" aria-label="Source list">
        <div
          v-for="(item, index) in sourceItems"
          :key="getItemKey(item, index)"
          class="picklist__item"
          :class="{
            'picklist__item--selected': isSourceSelected(item)
          }"
          role="option"
          :aria-selected="isSourceSelected(item)"
          :tabindex="0"
          @click="toggleSourceSelection(item)"
          @keydown.enter="toggleSourceSelection(item)"
          @keydown.space.prevent="toggleSourceSelection(item)"
        >
          <slot name="item" :item="item">
            {{ getItemLabel(item) }}
          </slot>
        </div>
        <div v-if="sourceItems.length === 0" class="picklist__empty">
          <slot name="sourceEmpty">No items</slot>
        </div>
      </div>
    </div>

    <!-- Transfer Controls -->
    <div class="picklist__controls">
      <button
        type="button"
        class="picklist__button"
        :disabled="sourceSelection.length === 0"
        aria-label="Move to target"
        @click="moveToTarget"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button
        type="button"
        class="picklist__button"
        :disabled="sourceItems.length === 0"
        aria-label="Move all to target"
        @click="moveAllToTarget"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 4L8 8L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 4L12 8L8 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button
        type="button"
        class="picklist__button"
        :disabled="targetSelection.length === 0"
        aria-label="Move to source"
        @click="moveToSource"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button
        type="button"
        class="picklist__button"
        :disabled="targetItems.length === 0"
        aria-label="Move all to source"
        @click="moveAllToSource"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M12 4L8 8L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 4L4 8L8 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- Target List -->
    <div v-rough class="picklist__list picklist__list--target">
      <div v-if="targetHeader" class="picklist__header">
        <slot name="targetHeader">{{ targetHeader }}</slot>
      </div>
      <div class="picklist__items" role="listbox" aria-label="Target list">
        <div
          v-for="(item, index) in targetItems"
          :key="getItemKey(item, index)"
          class="picklist__item"
          :class="{
            'picklist__item--selected': isTargetSelected(item)
          }"
          role="option"
          :aria-selected="isTargetSelected(item)"
          :tabindex="0"
          @click="toggleTargetSelection(item)"
          @keydown.enter="toggleTargetSelection(item)"
          @keydown.space.prevent="toggleTargetSelection(item)"
        >
          <slot name="item" :item="item">
            {{ getItemLabel(item) }}
          </slot>
        </div>
        <div v-if="targetItems.length === 0" class="picklist__empty">
          <slot name="targetEmpty">No items</slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="./PickList.scss"></style>

<script setup lang="ts">
import type { PickListProps, PickListEmits } from '../../types';
import { ref, computed } from "vue";

defineOptions({ name: 'FtpPickList' });

const props = withDefaults(defineProps<PickListProps>(), {
  source: () => [],
  target: () => [],
  sourceHeader: "",
  targetHeader: "",
  dataKey: null,
  labelKey: "label",
  isDisabled: false,
});

const emit = defineEmits(["update:source", "update:target", "move-to-target", "move-to-source"]);

const sourceSelection = ref<any[]>([]);
const targetSelection = ref<any[]>([]);

const sourceItems = computed(() => props.source);
const targetItems = computed(() => props.target);

const getItemKey = (item: any, index: any) => {
  if (props.dataKey && typeof item === "object") {
    return item[props.dataKey];
  }
  return index;
};

const getItemLabel = (item: any) => {
  if (typeof item === "string" || typeof item === "number") {
    return item;
  }
  return item[props.labelKey];
};

const getItemValue = (item: any) => {
  if (props.dataKey && typeof item === "object") {
    return item[props.dataKey];
  }
  return item;
};

const isSourceSelected = (item: any) => {
  const value = getItemValue(item);
  return sourceSelection.value.some((s) => getItemValue(s) === value);
};

const isTargetSelected = (item: any) => {
  const value = getItemValue(item);
  return targetSelection.value.some((s) => getItemValue(s) === value);
};

const toggleSourceSelection = (item: any) => {
  if (props.isDisabled) return;
  const value = getItemValue(item);
  const index = sourceSelection.value.findIndex((s) => getItemValue(s) === value);
  if (index > -1) {
    sourceSelection.value.splice(index, 1);
  } else {
    sourceSelection.value.push(item);
  }
};

const toggleTargetSelection = (item: any) => {
  if (props.isDisabled) return;
  const value = getItemValue(item);
  const index = targetSelection.value.findIndex((s) => getItemValue(s) === value);
  if (index > -1) {
    targetSelection.value.splice(index, 1);
  } else {
    targetSelection.value.push(item);
  }
};

const moveToTarget = () => {
  if (props.isDisabled || sourceSelection.value.length === 0) return;

  const newSource = sourceItems.value.filter(
    (item) => !sourceSelection.value.some((s) => getItemValue(s) === getItemValue(item))
  );
  const newTarget = [...targetItems.value, ...sourceSelection.value];

  emit("update:source", newSource);
  emit("update:target", newTarget);
  emit("move-to-target", { items: sourceSelection.value });
  sourceSelection.value = [];
};

const moveAllToTarget = () => {
  if (props.isDisabled || sourceItems.value.length === 0) return;

  const movedItems = [...sourceItems.value];
  const newTarget = [...targetItems.value, ...movedItems];

  emit("update:source", []);
  emit("update:target", newTarget);
  emit("move-to-target", { items: movedItems });
  sourceSelection.value = [];
};

const moveToSource = () => {
  if (props.isDisabled || targetSelection.value.length === 0) return;

  const newTarget = targetItems.value.filter(
    (item) => !targetSelection.value.some((s) => getItemValue(s) === getItemValue(item))
  );
  const newSource = [...sourceItems.value, ...targetSelection.value];

  emit("update:source", newSource);
  emit("update:target", newTarget);
  emit("move-to-source", { items: targetSelection.value });
  targetSelection.value = [];
};

const moveAllToSource = () => {
  if (props.isDisabled || targetItems.value.length === 0) return;

  const movedItems = [...targetItems.value];
  const newSource = [...sourceItems.value, ...movedItems];

  emit("update:source", newSource);
  emit("update:target", []);
  emit("move-to-source", { items: movedItems });
  targetSelection.value = [];
};

const additionalClasses = computed(() =>
  [props.isDisabled && "picklist--disabled"].filter(Boolean).join(" ")
);
</script>
