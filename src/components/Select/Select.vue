<template>
  <div class="select" :class="additionalClasses">
    <select
      ref="selectRef"
      class="select__input"
      :value="modelValue"
      :disabled="isDisabled"
      :name="name"
      :aria-invalid="isInvalid || undefined"
      :aria-describedby="ariaDescribedby || undefined"
      @change="onChange"
    >
      <option v-if="placeholder" value="" disabled :selected="!modelValue">
        {{ placeholder }}
      </option>
      <option
        v-for="option in normalizedOptions"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>
    <span class="select__icon">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 6L8 10L12 6"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  </div>
</template>

<style src="./Select.scss"></style>

<script setup lang="ts">
import type { SelectProps, SelectEmits } from '../../types';
import { computed, ref } from "vue";

defineOptions({ name: 'FtpSelect' });

const props = withDefaults(defineProps<SelectProps>(), {
  modelValue: null,
  options: () => [],
  optionLabel: "label",
  optionValue: "value",
  size: "md",
  isDisabled: false,
  isInvalid: false,
});

const emit = defineEmits(["update:modelValue", "change"]);

const selectRef = ref(null);

const normalizedOptions = computed((): any[] => {
  return props.options.map((option: any) => {
    if (typeof option === "string" || typeof option === "number") {
      return { label: option, value: option };
    }
    return {
      label: option[props.optionLabel],
      value: option[props.optionValue],
      disabled: option.disabled,
    };
  });
});

const onChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value;
  emit("update:modelValue", value);
  emit("change", { value, originalEvent: event });
};

const additionalClasses = computed(() => [
  `select--size-${props.size}`,
  props.isDisabled && "select--disabled",
  props.isInvalid && "select--invalid",
  !props.modelValue && props.placeholder && "select--placeholder",
].filter(Boolean).join(" "));
</script>
