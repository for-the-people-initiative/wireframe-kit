<template>
  <label class="checkbox" :class="additionalClasses">
    <input
      type="checkbox"
      class="checkbox__input"
      :checked="modelValue"
      :disabled="isDisabled"
      :name="name"
      :value="value"
      :aria-invalid="isInvalid || undefined"
      @change="onChange"
    />
    <span v-rough="{ severity: 1 }" class="checkbox__box">
      <svg
        class="checkbox__icon"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          v-if="!indeterminate"
          d="M10 3L4.5 8.5L2 6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          v-else
          d="M2.5 6H9.5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </span>
    <span v-if="label || $slots.default" class="checkbox__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style src="./Checkbox.scss"></style>

<script setup lang="ts">
import type { CheckboxProps, CheckboxEmits } from '../../types';
import { computed } from "vue";

defineOptions({ name: 'Checkbox' });

const props = withDefaults(defineProps<CheckboxProps>(), {
  modelValue: false,
  value: true,
  size: "md",
  isDisabled: false,
  isInvalid: false,
  indeterminate: false,
});

const emit = defineEmits(["update:modelValue", "change"]);

const onChange = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked;
  emit("update:modelValue", checked);
  emit("change", { checked, originalEvent: event });
};

const additionalClasses = computed(() => [
  `checkbox--size-${props.size}`,
  props.isDisabled && "checkbox--disabled",
  props.isInvalid && "checkbox--invalid",
  props.modelValue && "checkbox--checked",
  props.indeterminate && "checkbox--indeterminate",
].filter(Boolean).join(" "));
</script>
