<template>
  <fieldset v-rough class="field-set" :class="additionalClasses">
    <legend v-if="legend || $slots.legend" class="field-set__legend">
      <button
        v-if="toggleable"
        type="button"
        class="field-set__toggle"
        :aria-expanded="!isCollapsed"
        @click="toggle"
      >
        <slot name="legend">{{ legend }}</slot>
        <span class="field-set__toggle-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <span v-else class="field-set__legend-text">
        <slot name="legend">{{ legend }}</slot>
      </span>
    </legend>
    <div class="field-set__content-wrapper">
      <div class="field-set__content">
        <slot />
      </div>
    </div>
  </fieldset>
</template>

<style src="./FieldSet.scss"></style>

<script setup lang="ts">
import type { FieldSetProps, FieldSetEmits } from '../../types';
import { computed, ref, watch } from "vue";

defineOptions({ name: 'FtpFieldSet' });

const props = withDefaults(defineProps<FieldSetProps>(), {
  legend: "",
  toggleable: false,
  collapsed: false,
});

const emit = defineEmits(["update:collapsed", "toggle"]);

const isCollapsed = ref(props.collapsed);

// Sync with prop changes
watch(
  () => props.collapsed,
  (newVal) => {
    isCollapsed.value = newVal;
  }
);

const toggle = () => {
  isCollapsed.value = !isCollapsed.value;
  emit("update:collapsed", isCollapsed.value);
  emit("toggle", { collapsed: isCollapsed.value });
};

const additionalClasses = computed(() =>
  [
    props.toggleable && "field-set--toggleable",
    isCollapsed.value && "field-set--collapsed",
  ]
    .filter(Boolean)
    .join(" ")
);
</script>
