<template>
  <div class="input-number" :class="additionalClasses">
    <button
      v-if="showButtons"
      type="button"
      class="input-number__button input-number__button--decrement"
      :disabled="isDisabled || isAtMin"
      @click="decrement"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 6H9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
    <input
      ref="inputRef"
      type="text"
      inputmode="decimal"
      class="input-number__input"
      :value="displayValue"
      :disabled="isDisabled"
      :placeholder="placeholder"
      :name="name"
      :aria-invalid="isInvalid || undefined"
      @input="onInput"
      @blur="onBlur"
      @keydown="onKeydown"
    />
    <button
      v-if="showButtons"
      type="button"
      class="input-number__button input-number__button--increment"
      :disabled="isDisabled || isAtMax"
      @click="increment"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 2.5V9.5M2.5 6H9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<style src="./InputNumber.scss"></style>

<script setup lang="ts">
import type { InputNumberProps, InputNumberEmits } from '../../types';
import { computed, ref } from "vue";

defineOptions({ name: 'FtpInputNumber' });

const props = withDefaults(defineProps<InputNumberProps>(), {
  modelValue: null,
  min: null,
  max: null,
  step: 1,
  size: "md",
  showButtons: true,
  isDisabled: false,
  isInvalid: false,
  locale: "nl-NL",
  minFractionDigits: 0,
  maxFractionDigits: 2,
});

const emit = defineEmits(["update:modelValue", "change"]);

const inputRef = ref<HTMLInputElement | null>(null);

const displayValue = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) {
    return "";
  }
  return new Intl.NumberFormat(props.locale, {
    minimumFractionDigits: props.minFractionDigits,
    maximumFractionDigits: props.maxFractionDigits,
  }).format(props.modelValue);
});

const isAtMin = computed(() => {
  if (props.min === null) return false;
  return props.modelValue !== null && props.modelValue <= props.min;
});

const isAtMax = computed(() => {
  if (props.max === null) return false;
  return props.modelValue !== null && props.modelValue >= props.max;
});

const parseValue = (value: any) => {
  if (!value || value === "") return null;
  // Handle locale-specific parsing
  const cleanedValue = value
    .replace(/[^\d,.-]/g, "")
    .replace(",", ".");
  const parsed = parseFloat(cleanedValue);
  return isNaN(parsed) ? null : parsed;
};

const clampValue = (value: any) => {
  if (value === null) return null;
  let result = value;
  if (props.min !== null && result < props.min) result = props.min;
  if (props.max !== null && result > props.max) result = props.max;
  return result;
};

const updateValue = (value: any) => {
  const clamped = clampValue(value);
  emit("update:modelValue", clamped);
  emit("change", { value: clamped });
};

const onInput = (event: Event) => {
  // Allow typing, don't update immediately
};

const onBlur = (event: FocusEvent) => {
  const parsed = parseValue((event.target as HTMLInputElement).value);
  updateValue(parsed);
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    increment();
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    decrement();
  } else if (event.key === "Enter") {
    const parsed = parseValue((event.target as HTMLInputElement).value);
    updateValue(parsed);
  }
};

const increment = () => {
  const current = props.modelValue ?? 0;
  updateValue(current + props.step);
};

const decrement = () => {
  const current = props.modelValue ?? 0;
  updateValue(current - props.step);
};

const additionalClasses = computed(() => [
  `input-number--size-${props.size}`,
  props.isDisabled && "input-number--disabled",
  props.isInvalid && "input-number--invalid",
  props.showButtons && "input-number--with-buttons",
].filter(Boolean).join(" "));
</script>
