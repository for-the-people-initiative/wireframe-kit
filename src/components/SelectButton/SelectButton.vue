<template>
  <div
    class="select-button"
    :class="additionalClasses"
    role="group"
    :aria-label="ariaLabel"
  >
    <button
      v-for="(option, index) in options"
      :key="getOptionValue(option)"
      type="button"
      class="select-button__option"
      :class="{
        'select-button__option--selected': isSelected(option),
        'select-button__option--disabled': isDisabled || isOptionDisabled(option)
      }"
      :disabled="isDisabled || isOptionDisabled(option)"
      :aria-pressed="isSelected(option)"
      :tabindex="isDisabled || isOptionDisabled(option) ? -1 : 0"
      @click="onOptionClick(option, $event)"
    >
      <slot name="option" :option="option" :index="index" :selected="isSelected(option)">
        {{ getOptionLabel(option) }}
      </slot>
    </button>
  </div>
</template>

<style src="./SelectButton.scss"></style>

<script setup lang="ts">
import type { SelectButtonProps, SelectButtonEmits } from '../../types';
import { computed } from "vue";

defineOptions({ name: 'FtpSelectButton' });

const props = withDefaults(defineProps<SelectButtonProps>(), {
  modelValue: null,
  options: () => [],
  optionLabel: null,
  optionValue: null,
  optionDisabled: null,
  multiple: false,
  allowEmpty: true,
  isDisabled: false,
  ariaLabel: "Select button group",
});

const emit = defineEmits(["update:modelValue", "change"]);

const getOptionLabel = (option: any) => {
  if (props.optionLabel) {
    if (typeof props.optionLabel === "function") {
      return props.optionLabel(option);
    }
    return option?.[props.optionLabel];
  }
  return option?.label ?? option;
};

const getOptionValue = (option: any) => {
  if (props.optionValue) {
    if (typeof props.optionValue === "function") {
      return props.optionValue(option);
    }
    return option?.[props.optionValue];
  }
  return option?.value ?? option;
};

const isOptionDisabled = (option: any) => {
  if (props.optionDisabled) {
    if (typeof props.optionDisabled === "function") {
      return props.optionDisabled(option);
    }
    return option?.[props.optionDisabled];
  }
  return option?.disabled ?? false;
};

const isSelected = (option: any) => {
  const optionValue = getOptionValue(option);

  if (props.multiple) {
    if (!Array.isArray(props.modelValue)) return false;
    return props.modelValue.some((val) => equals(val, optionValue));
  }

  return equals(props.modelValue, optionValue);
};

const equals = (value1: any, value2: any) => {
  if (value1 === value2) return true;
  if (typeof value1 === "object" && typeof value2 === "object") {
    return JSON.stringify(value1) === JSON.stringify(value2);
  }
  return false;
};

const onOptionClick = (option: any, event: any) => {
  if (props.isDisabled || isOptionDisabled(option)) return;

  const optionValue = getOptionValue(option);
  let newValue;

  if (props.multiple) {
    const currentValue = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const index = currentValue.findIndex((val) => equals(val, optionValue));

    if (index !== -1) {
      // Deselecting - check if allowEmpty permits this
      if (props.allowEmpty || currentValue.length > 1) {
        currentValue.splice(index, 1);
        newValue = currentValue;
      } else {
        // Can't deselect the last item when allowEmpty is false
        return;
      }
    } else {
      currentValue.push(optionValue);
      newValue = currentValue;
    }
  } else {
    if (equals(props.modelValue, optionValue)) {
      // Deselecting in single mode
      if (props.allowEmpty) {
        newValue = null;
      } else {
        // Can't deselect when allowEmpty is false
        return;
      }
    } else {
      newValue = optionValue;
    }
  }

  emit("update:modelValue", newValue);
  emit("change", { originalEvent: event, value: newValue });
};

const additionalClasses = computed(() =>
  [props.isDisabled && "select-button--disabled"].filter(Boolean).join(" ")
);
</script>
