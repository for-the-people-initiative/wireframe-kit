<script setup lang="ts">
import type { ColumnProps } from '../../types';

/**
 * Column component for DataTable
 *
 * This component defines column configuration for a DataTable.
 * It doesn't render anything itself - the parent DataTable reads
 * its props and slots to configure column rendering.
 */

defineOptions({ name: 'Column' });

const props = withDefaults(defineProps<ColumnProps>(), {
  field: null,
  header: null,
  footer: null,
  sortable: false,
  sortField: null,
  filterField: null,
  filterable: false,
  width: null,
  minWidth: null,
  maxWidth: null,
  align: "left",
  headerAlign: null,
  footerAlign: null,
  frozen: false,
  hidden: false,
  expander: false,
  selectionMode: null,
  rowspan: 1,
  colspan: 1,
});

// Expose props for parent DataTable to access
defineExpose({
  props
});
</script>

<template>
  <!-- Column is a configuration component, it doesn't render visible content -->
  <slot />
</template>
