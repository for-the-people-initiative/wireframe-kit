<template>
  <div class="order-list">
    <div class="order-list__controls">
      <button
        class="order-list__btn"
        :disabled="!hasSelection || isFirstSelected"
        type="button"
        aria-label="Move to top"
        @click="moveToTop"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="17 11 12 6 7 11" />
          <polyline points="17 18 12 13 7 18" />
        </svg>
      </button>
      <button
        class="order-list__btn"
        :disabled="!hasSelection || isFirstSelected"
        type="button"
        aria-label="Move up"
        @click="moveUp"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
      <button
        class="order-list__btn"
        :disabled="!hasSelection || isLastSelected"
        type="button"
        aria-label="Move down"
        @click="moveDown"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <button
        class="order-list__btn"
        :disabled="!hasSelection || isLastSelected"
        type="button"
        aria-label="Move to bottom"
        @click="moveToBottom"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="7 13 12 18 17 13" />
          <polyline points="7 6 12 11 17 6" />
        </svg>
      </button>
    </div>

    <div v-rough class="order-list__container">
      <div v-if="$slots.header || header" class="order-list__header">
        <slot name="header">
          {{ header }}
        </slot>
      </div>

      <div class="order-list__list">
        <div
          v-for="(item, index) in internalValue"
          :key="getItemKey(item, index)"
          class="order-list__item"
          :class="{
            'order-list__item--selected': isSelected(item),
            'order-list__item--dragging': draggingIndex === index
          }"
          draggable="true"
          @click="onItemClick(item, $event)"
          @dragstart="onDragStart(index, $event)"
          @dragover="onDragOver(index, $event)"
          @dragend="onDragEnd"
          @drop="onDrop(index, $event)"
        >
          <span class="order-list__drag-handle">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="6" r="1.5" />
              <circle cx="15" cy="6" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="18" r="1.5" />
              <circle cx="15" cy="18" r="1.5" />
            </svg>
          </span>
          <div class="order-list__item-content">
            <slot name="item" :item="item" :index="index">
              {{ dataKey ? item[dataKey] : item }}
            </slot>
          </div>
        </div>
        <div v-if="internalValue.length === 0" class="order-list__empty">
          <slot name="empty">
            No items
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="./OrderList.scss"></style>

<script setup lang="ts">
import type { OrderListProps, OrderListEmits } from '../../types';
import { ref, computed, watch } from "vue";

const props = withDefaults(defineProps<OrderListProps>(), {
  modelValue: () => [],
  header: "",
  dataKey: null,
  itemKey: null,
  multiple: false,
});

const emit = defineEmits(["update:modelValue", "reorder", "selection-change"]);

defineOptions({
  name: "FtpOrderList",
});

const internalValue = ref([...props.modelValue]);
const selection = ref<any[]>([]);
const draggingIndex = ref(null);

watch(
  () => props.modelValue,
  (val) => {
    internalValue.value = [...val];
  },
  { deep: true }
);

const hasSelection = computed(() => selection.value.length > 0);

const selectedIndices = computed(() => {
  return selection.value.map((item) => internalValue.value.indexOf(item));
});

const isFirstSelected = computed(() => {
  if (!hasSelection.value) return false;
  return Math.min(...selectedIndices.value) === 0;
});

const isLastSelected = computed(() => {
  if (!hasSelection.value) return false;
  return Math.max(...selectedIndices.value) === internalValue.value.length - 1;
});

const getItemKey = (item: any, index: any) => {
  if (props.itemKey && typeof item === "object") {
    return item[props.itemKey];
  }
  return index;
};

const isSelected = (item: any) => {
  return selection.value.includes(item);
};

const onItemClick = (item: any, event: any) => {
  if (props.multiple && (event.ctrlKey || event.metaKey)) {
    const index = selection.value.indexOf(item);
    if (index > -1) {
      selection.value.splice(index, 1);
    } else {
      selection.value.push(item);
    }
  } else {
    selection.value = [item];
  }
  emit("selection-change", { selection: [...selection.value] });
};

const emitUpdate = () => {
  emit("update:modelValue", [...internalValue.value]);
  emit("reorder", { value: [...internalValue.value] });
};

const moveUp = () => {
  if (!hasSelection.value || isFirstSelected.value) return;

  const indices = selectedIndices.value.sort((a, b) => a - b);
  for (const index of indices) {
    if (index > 0) {
      const temp = internalValue.value[index];
      internalValue.value[index] = internalValue.value[index - 1];
      internalValue.value[index - 1] = temp;
    }
  }
  emitUpdate();
};

const moveDown = () => {
  if (!hasSelection.value || isLastSelected.value) return;

  const indices = selectedIndices.value.sort((a, b) => b - a);
  for (const index of indices) {
    if (index < internalValue.value.length - 1) {
      const temp = internalValue.value[index];
      internalValue.value[index] = internalValue.value[index + 1];
      internalValue.value[index + 1] = temp;
    }
  }
  emitUpdate();
};

const moveToTop = () => {
  if (!hasSelection.value || isFirstSelected.value) return;

  const indices = selectedIndices.value.sort((a, b) => a - b);
  const items = indices.map((i) => internalValue.value[i]);

  // Remove selected items
  for (let i = indices.length - 1; i >= 0; i--) {
    internalValue.value.splice(indices[i], 1);
  }

  // Add them at the top
  internalValue.value.unshift(...items);
  emitUpdate();
};

const moveToBottom = () => {
  if (!hasSelection.value || isLastSelected.value) return;

  const indices = selectedIndices.value.sort((a, b) => b - a);
  const items = indices.map((i) => internalValue.value[i]);

  // Remove selected items
  for (const index of indices) {
    internalValue.value.splice(index, 1);
  }

  // Add them at the bottom
  internalValue.value.push(...items.reverse());
  emitUpdate();
};

const onDragStart = (index: any, event: any) => {
  draggingIndex.value = index;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", index);
};

const onDragOver = (index: any, event: any) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
};

const onDragEnd = () => {
  draggingIndex.value = null;
};

const onDrop = (targetIndex: any, event: any) => {
  event.preventDefault();
  const sourceIndex = draggingIndex.value;

  if (sourceIndex === null || sourceIndex === targetIndex) return;

  const item = internalValue.value[sourceIndex];
  internalValue.value.splice(sourceIndex, 1);
  internalValue.value.splice(targetIndex, 0, item);

  draggingIndex.value = null;
  emitUpdate();
};
</script>
