<template>
  <div v-rough class="data-table" :class="additionalClasses">
    <div v-if="$slots.header" class="data-table__header">
      <slot name="header" />
    </div>

    <div class="data-table__wrapper">
      <table class="data-table__table">
        <thead class="data-table__thead">
          <tr>
            <th
              v-for="col in columns"
              :key="col.field"
              v-rough="{ edges: ['bottom'], severity: 3 }"
              class="data-table__th"
              :class="{ 'data-table__th--sortable': col.sortable }"
              :style="col.width ? { width: col.width } : {}"
              scope="col"
              :aria-sort="col.sortable && sortField === col.field ? (sortOrder === 1 ? 'ascending' : 'descending') : (col.sortable ? 'none' : undefined)"
              @click="col.sortable ? onSort(col.field) : null"
            >
              <span class="data-table__th-content">
                {{ col.header }}
                <span v-if="col.sortable" class="data-table__sort-icon">
                  <svg
                    v-if="sortField === col.field"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    :class="{ 'data-table__sort-icon--desc': sortOrder === -1 }"
                  >
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                  <svg
                    v-else
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="data-table__sort-icon--neutral"
                  >
                    <polyline points="7 10 12 5 17 10" />
                    <polyline points="7 14 12 19 17 14" />
                  </svg>
                </span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody class="data-table__tbody">
          <tr
            v-for="(row, rowIndex) in paginatedData"
            :key="rowIndex"
            class="data-table__row"
            :class="{ 'data-table__row--striped': striped && rowIndex % 2 === 1 }"
          >
            <td
              v-for="col in columns"
              :key="col.field"
              v-rough="{ edges: rowIndex < paginatedData.length - 1 ? ['bottom'] : [], severity: 1 }"
              class="data-table__td"
            >
              <slot :name="`column-${col.field}`" :data="row" :field="col.field">
                {{ getFieldValue(row, col.field) }}
              </slot>
            </td>
          </tr>
          <tr v-if="paginatedData.length === 0" class="data-table__empty-row">
            <td :colspan="columns.length" class="data-table__empty">
              <slot name="empty">
                No records found
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="paginator && totalPages > 1" class="data-table__pagination">
      <button
        type="button"
        class="data-table__page-btn"
        :disabled="currentPage === 1"
        aria-label="First page"
        @click="goToPage(1)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="11 17 6 12 11 7" />
          <polyline points="18 17 13 12 18 7" />
        </svg>
      </button>
      <button
        type="button"
        class="data-table__page-btn"
        :disabled="currentPage === 1"
        aria-label="Previous page"
        @click="goToPage(currentPage - 1)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <span class="data-table__page-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button
        type="button"
        class="data-table__page-btn"
        :disabled="currentPage === totalPages"
        aria-label="Next page"
        @click="goToPage(currentPage + 1)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
      <button
        type="button"
        class="data-table__page-btn"
        :disabled="currentPage === totalPages"
        aria-label="Last page"
        @click="goToPage(totalPages)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="13 17 18 12 13 7" />
          <polyline points="6 17 11 12 6 7" />
        </svg>
      </button>
    </div>

    <div v-if="$slots.footer" class="data-table__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style src="./DataTable.scss"></style>

<script setup lang="ts">
import type { DataTableProps, DataTableEmits } from '../../types';
import { ref, computed, watch } from "vue";

const props = withDefaults(defineProps<DataTableProps>(), {
  value: () => [],
  columns: () => [],
  striped: false,
  hoverable: true,
  paginator: false,
  rows: 10,
  sortField: null,
  sortOrder: 1,
});

const emit = defineEmits(["sort", "page"]);

defineOptions({
  name: "DataTable",
});

const currentPage = ref(1);
const internalSortField = ref(props.sortField);
const internalSortOrder = ref(props.sortOrder);

watch(
  () => props.sortField,
  (val) => {
    internalSortField.value = val;
  }
);

watch(
  () => props.sortOrder,
  (val) => {
    internalSortOrder.value = val;
  }
);

const sortField = computed(() => internalSortField.value);
const sortOrder = computed(() => internalSortOrder.value);

const sortedData = computed(() => {
  if (!internalSortField.value) return props.value;
  return [...props.value].sort((a, b) => {
    const aVal = getFieldValue(a, internalSortField.value);
    const bVal = getFieldValue(b, internalSortField.value);
    if (aVal < bVal) return -1 * internalSortOrder.value;
    if (aVal > bVal) return 1 * internalSortOrder.value;
    return 0;
  });
});

const totalPages = computed(() => {
  if (!props.paginator || props.rows <= 0) return 1;
  return Math.ceil(sortedData.value.length / props.rows);
});

const paginatedData = computed(() => {
  if (!props.paginator) return sortedData.value;
  const start = (currentPage.value - 1) * props.rows;
  return sortedData.value.slice(start, start + props.rows);
});

const additionalClasses = computed(() =>
  [props.hoverable && "data-table--hoverable"].filter(Boolean).join(" ")
);

const getFieldValue = (obj: any, field: any) => {
  return field.split(".").reduce((o: any, k: any) => (o ? o[k] : undefined), obj);
};

const onSort = (field: any) => {
  if (internalSortField.value === field) {
    internalSortOrder.value = (internalSortOrder.value * -1) as 1 | -1;
  } else {
    internalSortField.value = field;
    internalSortOrder.value = 1;
  }
  emit("sort", { sortField: internalSortField.value, sortOrder: internalSortOrder.value });
};

const goToPage = (page: any) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  emit("page", { page: currentPage.value });
};
</script>
