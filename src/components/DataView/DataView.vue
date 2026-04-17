<template>
  <div v-rough class="data-view" :class="additionalClasses">
    <div v-if="$slots.header || showLayoutSwitcher" class="data-view__header">
      <div class="data-view__header-content">
        <slot name="header" />
      </div>
      <div v-if="showLayoutSwitcher" class="data-view__layout-switcher">
        <button
          class="data-view__layout-btn"
          :class="{ 'data-view__layout-btn--active': internalLayout === 'list' }"
          type="button"
          aria-label="List view"
          @click="setLayout('list')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </button>
        <button
          class="data-view__layout-btn"
          :class="{ 'data-view__layout-btn--active': internalLayout === 'grid' }"
          type="button"
          aria-label="Grid view"
          @click="setLayout('grid')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </button>
      </div>
    </div>

    <div class="data-view__content" :class="`data-view__content--${internalLayout}`">
      <template v-if="paginatedData.length > 0">
        <div
          v-for="(item, index) in paginatedData"
          :key="index"
          class="data-view__item"
        >
          <slot :name="internalLayout" :data="item" :index="index">
            <slot name="item" :data="item" :index="index">
              {{ item }}
            </slot>
          </slot>
        </div>
      </template>
      <div v-else class="data-view__empty">
        <slot name="empty">
          No records found
        </slot>
      </div>
    </div>

    <div v-if="paginator && totalPages > 1" class="data-view__pagination">
      <button
        type="button"
        class="data-view__page-btn"
        :disabled="currentPage === 1"
        @click="goToPage(1)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="11 17 6 12 11 7" />
          <polyline points="18 17 13 12 18 7" />
        </svg>
      </button>
      <button
        type="button"
        class="data-view__page-btn"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <span class="data-view__page-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button
        type="button"
        class="data-view__page-btn"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
      <button
        type="button"
        class="data-view__page-btn"
        :disabled="currentPage === totalPages"
        @click="goToPage(totalPages)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="13 17 18 12 13 7" />
          <polyline points="6 17 11 12 6 7" />
        </svg>
      </button>
    </div>

    <div v-if="$slots.footer" class="data-view__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style src="./DataView.scss"></style>

<script setup lang="ts">
import type { DataViewProps, DataViewEmits } from '../../types';
import { ref, computed, watch } from "vue";

const props = withDefaults(defineProps<DataViewProps>(), {
  value: () => [],
  layout: "list",
  gridColumns: 3,
  paginator: false,
  rows: 9,
  showLayoutSwitcher: true,
});

const emit = defineEmits(["update:layout", "page"]);

defineOptions({
  name: "DataView",
});

const currentPage = ref(1);
const internalLayout = ref(props.layout);

watch(
  () => props.layout,
  (val) => {
    internalLayout.value = val;
  }
);

const totalPages = computed(() => {
  if (!props.paginator || props.rows <= 0) return 1;
  return Math.ceil(props.value.length / props.rows);
});

const paginatedData = computed(() => {
  if (!props.paginator) return props.value;
  const start = (currentPage.value - 1) * props.rows;
  return props.value.slice(start, start + props.rows);
});

const additionalClasses = computed(() =>
  [`data-view--layout-${internalLayout.value}`].filter(Boolean).join(" ")
);

const setLayout = (layout: any) => {
  internalLayout.value = layout;
  emit("update:layout", layout);
};

const goToPage = (page: any) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  emit("page", { page: currentPage.value });
};
</script>
