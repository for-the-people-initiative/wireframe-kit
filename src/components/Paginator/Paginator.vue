<template>
  <nav v-rough class="paginator" :class="additionalClasses" aria-label="Pagination">
    <div v-if="showInfo" class="paginator__info">
      {{ infoText }}
    </div>

    <div class="paginator__controls">
      <!-- First page button -->
      <button
        type="button"
        v-if="showFirstLast"
        class="paginator__nav paginator__nav--first"
        :disabled="isFirstPage"
        :aria-disabled="isFirstPage"
        aria-label="Go to first page"
        @click="goToFirst"
      >
        <svg class="paginator__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="11 17 6 12 11 7" />
          <polyline points="18 17 13 12 18 7" />
        </svg>
      </button>

      <!-- Previous button -->
      <button
        type="button"
        class="paginator__nav paginator__nav--prev"
        :disabled="isFirstPage"
        :aria-disabled="isFirstPage"
        aria-label="Go to previous page"
        @click="goToPrev"
      >
        <svg class="paginator__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <!-- Page numbers -->
      <div class="paginator__pages">
        <button
          type="button"
          v-for="page in visiblePages"
          :key="page.value"
          class="paginator__page"
          :class="{ 'paginator__page--active': page.value === currentPage, 'paginator__page--ellipsis': page.isEllipsis }"
          :disabled="page.isEllipsis"
          :aria-current="page.value === currentPage ? 'page' : undefined"
          :aria-label="page.isEllipsis ? undefined : `Go to page ${page.value}`"
          @click="!page.isEllipsis && goToPage(page.value)"
        >
          {{ page.isEllipsis ? '...' : page.value }}
        </button>
      </div>

      <!-- Next button -->
      <button
        type="button"
        class="paginator__nav paginator__nav--next"
        :disabled="isLastPage"
        :aria-disabled="isLastPage"
        aria-label="Go to next page"
        @click="goToNext"
      >
        <svg class="paginator__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <!-- Last page button -->
      <button
        type="button"
        v-if="showFirstLast"
        class="paginator__nav paginator__nav--last"
        :disabled="isLastPage"
        :aria-disabled="isLastPage"
        aria-label="Go to last page"
        @click="goToLast"
      >
        <svg class="paginator__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="13 17 18 12 13 7" />
          <polyline points="6 17 11 12 6 7" />
        </svg>
      </button>
    </div>

    <!-- Rows per page dropdown -->
    <div v-if="rowsPerPageOptions && rowsPerPageOptions.length > 0" class="paginator__rows-per-page">
      <label class="paginator__rows-label">Rows per page:</label>
      <select
        class="paginator__rows-select"
        :value="rows"
        @change="handleRowsChange"
      >
        <option v-for="option in rowsPerPageOptions" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
    </div>
  </nav>
</template>

<style src="./Paginator.scss"></style>

<script setup lang="ts">
import type { PaginatorProps, PaginatorEmits } from '../../types';
import { computed } from "vue";

defineOptions({ name: 'Paginator' });

const props = withDefaults(defineProps<PaginatorProps>(), {
  rows: 10,
  first: 0,
  rowsPerPageOptions: () => [],
  pageLinkSize: 5,
  showFirstLast: true,
  showInfo: false,
});

const emit = defineEmits(["update:first", "update:rows", "page"]);

const totalPages = computed(() => Math.ceil(props.totalRecords / props.rows));

const currentPage = computed(() => Math.floor(props.first / props.rows) + 1);

const isFirstPage = computed(() => currentPage.value === 1);

const isLastPage = computed(() => currentPage.value === totalPages.value || totalPages.value === 0);

const infoText = computed(() => {
  const start = props.first + 1;
  const end = Math.min(props.first + props.rows, props.totalRecords);
  return `${start}-${end} of ${props.totalRecords}`;
});

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;
  const linkSize = props.pageLinkSize;

  if (total <= linkSize) {
    for (let i = 1; i <= total; i++) {
      pages.push({ value: i, isEllipsis: false });
    }
  } else {
    const half = Math.floor(linkSize / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + linkSize - 1);

    if (end - start < linkSize - 1) {
      start = Math.max(1, end - linkSize + 1);
    }

    if (start > 1) {
      pages.push({ value: 1, isEllipsis: false });
      if (start > 2) {
        pages.push({ value: "ellipsis-start", isEllipsis: true });
      }
    }

    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== total) {
        pages.push({ value: i, isEllipsis: false });
      }
    }

    if (end < total) {
      if (end < total - 1) {
        pages.push({ value: "ellipsis-end", isEllipsis: true });
      }
      pages.push({ value: total, isEllipsis: false });
    }
  }

  return pages;
});

function goToPage(page: any) {
  const newFirst = (page - 1) * props.rows;
  emit("update:first", newFirst);
  emit("page", { page, first: newFirst, rows: props.rows, pageCount: totalPages.value });
}

function goToFirst() {
  goToPage(1);
}

function goToLast() {
  goToPage(totalPages.value);
}

function goToPrev() {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1);
  }
}

function goToNext() {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1);
  }
}

function handleRowsChange(event: Event) {
  const newRows = parseInt((event.target as HTMLSelectElement).value, 10);
  emit("update:rows", newRows);
  emit("update:first", 0);
  emit("page", { page: 1, first: 0, rows: newRows, pageCount: Math.ceil(props.totalRecords / newRows) });
}

const additionalClasses = computed(() => [].filter(Boolean).join(" "));
</script>
