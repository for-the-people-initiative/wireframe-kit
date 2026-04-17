<script setup lang="ts">
import type { ColumnGroupProps } from '../../types';

/**
 * ColumnGroup component for DataTable
 *
 * This component groups columns together for complex header/footer structures.
 * It allows creating multi-row headers and footers with spanning cells.
 * Like Column, it's a configuration component used by DataTable.
 */

defineOptions({ name: 'ColumnGroup' });

const props = withDefaults(defineProps<ColumnGroupProps>(), {
  type: "header",
});

// Expose props for parent DataTable to access
defineExpose({
  props
});
</script>

<template>
  <!-- ColumnGroup is a configuration component that wraps Row components -->
  <slot />
</template>
