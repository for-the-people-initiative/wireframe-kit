<template>
  <div v-rough class="panel" :class="additionalClasses">
    <div
      v-if="$slots.header || header"
      class="panel__header"
      :class="{ 'panel__header--toggleable': toggleable }"
      @click="onHeaderClick"
    >
      <button
        v-if="toggleable"
        type="button"
        class="panel__toggle"
        :aria-expanded="!isCollapsed"
        :aria-label="isCollapsed ? 'Expand panel' : 'Collapse panel'"
      >
        <svg
          class="panel__toggle-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <slot name="header">
        <span class="panel__title">{{ header }}</span>
      </slot>
      <div v-if="$slots.icons" class="panel__icons">
        <slot name="icons" />
      </div>
    </div>

    <div class="panel__content-wrapper">
      <div class="panel__content">
        <slot />
      </div>
    </div>

    <div v-if="$slots.footer" class="panel__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style src="./Panel.scss"></style>

<script setup lang="ts">
import type { PanelProps, PanelEmits } from '../../types';
import { computed, ref, watch } from "vue";

defineOptions({ name: 'FtpPanel' });

const props = withDefaults(defineProps<PanelProps>(), {
  header: "",
  toggleable: false,
  collapsed: false,
});

const emit = defineEmits(["update:collapsed", "toggle"]);

const isCollapsed = ref(props.collapsed);

watch(
  () => props.collapsed,
  (newVal) => {
    isCollapsed.value = newVal;
  }
);

const onHeaderClick = () => {
  if (!props.toggleable) return;

  isCollapsed.value = !isCollapsed.value;
  emit("update:collapsed", isCollapsed.value);
  emit("toggle", { collapsed: isCollapsed.value });
};

const additionalClasses = computed(() =>
  [
    props.toggleable && "panel--toggleable",
    isCollapsed.value && "panel--collapsed",
  ]
    .filter(Boolean)
    .join(" ")
);
</script>
