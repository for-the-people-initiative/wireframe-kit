<template>
  <div
    v-rough="{ severity: 2 }"
    class="input-chips"
    :class="additionalClasses"
    @click="focusInput"
  >
    <span
      v-for="(chip, index) in modelValue"
      :key="`chip-${index}`"
      class="input-chips__chip"
    >
      <span class="input-chips__chip-label">{{ chip }}</span>
      <button
        v-if="!isDisabled"
        type="button"
        class="input-chips__chip-remove"
        aria-label="Remove"
        @click.stop="removeChip(index)"
      >
        <svg
          class="input-chips__chip-remove-icon"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.5 4.5L9.5 9.5M9.5 4.5L4.5 9.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </span>
    <input
      ref="inputRef"
      v-model="inputValue"
      class="input-chips__input"
      type="text"
      :placeholder="showPlaceholder ? placeholder : ''"
      :disabled="isDisabled"
      @keydown="onKeydown"
      @paste="onPaste"
      @focus="onFocus"
      @blur="onBlur"
    />
  </div>
</template>

<style src="./InputChips.scss"></style>

<script setup lang="ts">
import type { InputChipsProps, InputChipsEmits } from '../../types';
import { computed, ref, nextTick } from "vue";

defineOptions({ name: 'InputChips' });

const props = withDefaults(defineProps<InputChipsProps>(), {
  modelValue: () => [],
  separator: null,
  allowDuplicate: false,
  max: null,
  placeholder: "",
  size: "md",
  isDisabled: false,
  isInvalid: false,
});

const emit = defineEmits(["update:modelValue", "add", "remove", "focus", "blur"]);

const inputRef = ref<HTMLInputElement | null>(null);
const inputValue = ref("");
const isFocused = ref(false);

const showPlaceholder = computed(() => props.modelValue.length === 0);

const canAddMore = computed(() => {
  if (props.max === null) return true;
  return props.modelValue.length < props.max;
});

const addChip = (value: any) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return false;

  if (!props.allowDuplicate && props.modelValue.includes(trimmedValue)) {
    return false;
  }

  if (!canAddMore.value) return false;

  const newValue = [...props.modelValue, trimmedValue];
  emit("update:modelValue", newValue);
  emit("add", { value: trimmedValue, chips: newValue });
  return true;
};

const removeChip = (index: any) => {
  const removedValue = props.modelValue[index];
  const newValue = props.modelValue.filter((_, i) => i !== index);
  emit("update:modelValue", newValue);
  emit("remove", { value: removedValue, chips: newValue });
};

const processInput = (value: any) => {
  if (props.separator) {
    const parts = value.split(props.separator);
    parts.forEach((part: any) => addChip(part));
  } else {
    addChip(value);
  }
  inputValue.value = "";
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    event.preventDefault();
    if (inputValue.value) {
      processInput(inputValue.value);
    }
  } else if (event.key === "Backspace" && !inputValue.value && props.modelValue.length > 0) {
    removeChip(props.modelValue.length - 1);
  } else if (props.separator && typeof props.separator === "string" && event.key === props.separator) {
    event.preventDefault();
    if (inputValue.value) {
      processInput(inputValue.value);
    }
  }
};

const onPaste = (event: ClipboardEvent) => {
  if (props.separator) {
    event.preventDefault();
    const pastedText = event.clipboardData!.getData("text");
    processInput(pastedText);
  }
};

const onFocus = (event: FocusEvent) => {
  isFocused.value = true;
  emit("focus", { originalEvent: event });
};

const onBlur = (event: FocusEvent) => {
  isFocused.value = false;
  if (inputValue.value) {
    processInput(inputValue.value);
  }
  emit("blur", { originalEvent: event });
};

const focusInput = () => {
  inputRef.value?.focus();
};

const additionalClasses = computed(() => [
  `input-chips--size-${props.size}`,
  isFocused.value && "input-chips--focused",
  props.isDisabled && "input-chips--disabled",
  props.isInvalid && "input-chips--invalid",
].filter(Boolean).join(" "));

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  el: inputRef,
});
</script>
