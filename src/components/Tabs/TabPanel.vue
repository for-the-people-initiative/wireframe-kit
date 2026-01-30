<template>
  <div
    v-if="isActive"
    class="tabs__panel"
    role="tabpanel"
    :id="`${tabsContext.tabsId}-panel-${panelIndex}`"
    :aria-labelledby="`${tabsContext.tabsId}-tab-${panelIndex}`"
    :tabindex="0"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import type { TabPanelProps } from '../../types';
import { computed, inject, onMounted, onBeforeUnmount, ref } from "vue";

defineOptions({ name: 'FtpTabPanel' });

const props = withDefaults(defineProps<TabPanelProps>(), {
  disabled: false,
});

const tabsContext = inject("tabs") as any;
const panelIndex = ref(-1);

onMounted(() => {
  panelIndex.value = tabsContext.registerTab({
    header: props.header,
    disabled: props.disabled,
  });
});

onBeforeUnmount(() => {
  if (panelIndex.value !== -1) {
    tabsContext.unregisterTab(panelIndex.value);
  }
});

const isActive = computed(() => tabsContext.activeIndex.value === panelIndex.value);
</script>
