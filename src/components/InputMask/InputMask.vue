<template>
  <input
    v-rough
    ref="inputRef"
    class="input-mask"
    :class="additionalClasses"
    type="text"
    :value="displayValue"
    :placeholder="placeholder"
    :disabled="isDisabled"
    :name="name"
    :aria-invalid="isInvalid || undefined"
    @input="onInput"
    @keydown="onKeydown"
    @focus="onFocus"
    @blur="onBlur"
  />
</template>

<style src="./InputMask.scss"></style>

<script setup lang="ts">
import type { InputMaskProps, InputMaskEmits } from '../../types';
import { computed, ref, watch, onMounted } from "vue";

defineOptions({ name: 'FtpInputMask' });

const props = withDefaults(defineProps<InputMaskProps>(), {
  modelValue: "",
  slotChar: "_",
  autoClear: true,
  size: "md",
  isDisabled: false,
  isInvalid: false,
});

const emit = defineEmits(["update:modelValue", "complete", "focus", "blur"]);

const inputRef = ref<HTMLInputElement | null>(null);
const buffer = ref<string[]>([]);
const focusPosition = ref(0);

// Mask definitions: 9 = digit, a = letter, * = alphanumeric
const maskDefinitions: Record<string, RegExp> = {
  "9": /\d/,
  "a": /[a-zA-Z]/,
  "*": /[a-zA-Z0-9]/,
};

const getMaskArray = () => props.mask.split("");

const isEditablePosition = (pos: any) => {
  const maskArray = getMaskArray();
  if (pos < 0 || pos >= maskArray.length) return false;
  return Object.keys(maskDefinitions).includes(maskArray[pos]);
};

const getNextEditablePosition = (pos: any) => {
  const maskArray = getMaskArray();
  for (let i = pos; i < maskArray.length; i++) {
    if (isEditablePosition(i)) return i;
  }
  return -1;
};

const getPrevEditablePosition = (pos: any) => {
  for (let i = pos - 1; i >= 0; i--) {
    if (isEditablePosition(i)) return i;
  }
  return -1;
};

const getFirstEditablePosition = () => getNextEditablePosition(0);

const initBuffer = () => {
  const maskArray = getMaskArray();
  buffer.value = maskArray.map((char, index) => {
    if (isEditablePosition(index)) {
      return props.slotChar;
    }
    return char;
  });
};

const setValueFromModel = () => {
  if (!props.modelValue) {
    initBuffer();
    return;
  }

  const maskArray = getMaskArray();
  const rawValue = props.modelValue.replace(/[^a-zA-Z0-9]/g, "");
  let valueIndex = 0;

  buffer.value = maskArray.map((maskChar, index) => {
    if (isEditablePosition(index) && valueIndex < rawValue.length) {
      const regex = maskDefinitions[maskChar];
      const char = rawValue[valueIndex];
      if (regex && regex.test(char)) {
        valueIndex++;
        return char;
      }
      valueIndex++;
      return props.slotChar;
    } else if (!isEditablePosition(index)) {
      return maskChar;
    }
    return props.slotChar;
  });
};

const displayValue = computed(() => buffer.value.join(""));

const getRawValue = () => {
  const maskArray = getMaskArray();
  return buffer.value
    .filter((char, index) => isEditablePosition(index) && char !== props.slotChar)
    .join("");
};

const isComplete = () => {
  return buffer.value.every((char, index) => {
    if (isEditablePosition(index)) {
      return char !== props.slotChar;
    }
    return true;
  });
};

const validateChar = (char: any, pos: any) => {
  const maskArray = getMaskArray();
  const maskChar = maskArray[pos];
  const regex = maskDefinitions[maskChar];
  return regex ? regex.test(char) : false;
};

const onInput = (event: Event) => {
  // Prevent default input handling - we manage it ourselves
  event.preventDefault();
};

const onKeydown = (event: KeyboardEvent) => {
  const input = inputRef.value;
  if (!input) return;

  const pos = input.selectionStart;

  if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    const nextPos = getNextEditablePosition(pos);
    if (nextPos !== -1 && validateChar(event.key, nextPos)) {
      buffer.value[nextPos] = event.key;
      const newPos = getNextEditablePosition(nextPos + 1);
      focusPosition.value = newPos !== -1 ? newPos : nextPos + 1;

      requestAnimationFrame(() => {
        input.setSelectionRange(focusPosition.value, focusPosition.value);
      });

      emitValue();
    }
  } else if (event.key === "Backspace") {
    event.preventDefault();
    let deletePos = pos;

    if (!isEditablePosition(pos) || buffer.value[pos!] === props.slotChar) {
      deletePos = getPrevEditablePosition(pos!);
    } else {
      deletePos = pos!;
    }

    if (deletePos !== -1 && deletePos >= 0) {
      buffer.value[deletePos] = props.slotChar;
      const newPos = deletePos;
      focusPosition.value = newPos;

      requestAnimationFrame(() => {
        input.setSelectionRange(newPos, newPos);
      });

      emitValue();
    }
  } else if (event.key === "Delete") {
    event.preventDefault();
    const deletePos = isEditablePosition(pos) ? pos : getNextEditablePosition(pos);
    if (deletePos !== -1) {
      buffer.value[deletePos!] = props.slotChar;
      emitValue();
    }
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    const newPos = getPrevEditablePosition(pos);
    if (newPos !== -1) {
      input.setSelectionRange(newPos, newPos);
    }
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    const newPos = getNextEditablePosition(pos! + 1);
    if (newPos !== -1) {
      input.setSelectionRange(newPos, newPos);
    }
  }
};

const emitValue = () => {
  const rawValue = getRawValue();
  emit("update:modelValue", rawValue);

  if (isComplete()) {
    emit("complete", { value: rawValue, maskedValue: displayValue.value });
  }
};

const onFocus = (event: FocusEvent) => {
  const input = inputRef.value;
  if (!input) return;

  const firstEditable = getFirstEditablePosition();
  if (firstEditable !== -1) {
    requestAnimationFrame(() => {
      input.setSelectionRange(firstEditable, firstEditable);
    });
  }

  emit("focus", { originalEvent: event });
};

const onBlur = (event: FocusEvent) => {
  if (props.autoClear && !isComplete()) {
    initBuffer();
    emit("update:modelValue", "");
  }
  emit("blur", { originalEvent: event });
};

const additionalClasses = computed(() => [
  `input-mask--size-${props.size}`,
  props.isDisabled && "input-mask--disabled",
  props.isInvalid && "input-mask--invalid",
].filter(Boolean).join(" "));

// Initialize
onMounted(() => {
  if (props.modelValue) {
    setValueFromModel();
  } else {
    initBuffer();
  }
});

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== getRawValue()) {
    setValueFromModel();
  }
});

watch(() => props.mask, () => {
  initBuffer();
  setValueFromModel();
});

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select(),
  el: inputRef,
});
</script>
