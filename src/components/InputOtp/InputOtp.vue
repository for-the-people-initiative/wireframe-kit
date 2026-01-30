<template>
  <div class="input-otp" :class="additionalClasses">
    <div class="input-otp__container">
      <template v-for="(_, index) in length" :key="index">
        <!-- Separator (optional, e.g., between groups) -->
        <span
          v-if="separator && index > 0 && index % separator === 0"
          class="input-otp__separator"
        ></span>

        <input
          ref="inputRefs"
          type="text"
          :inputmode="integerOnly ? 'numeric' : 'text'"
          :pattern="integerOnly ? '[0-9]*' : undefined"
          class="input-otp__cell"
          :class="{
            'input-otp__cell--filled': values[index] !== '',
            'input-otp__cell--focus': focusedIndex === index,
          }"
          :value="mask && values[index] ? maskChar : values[index]"
          :disabled="isDisabled"
          :aria-label="`Digit ${index + 1} of ${length}`"
          maxlength="1"
          autocomplete="one-time-code"
          @input="onInput($event, index)"
          @keydown="onKeyDown($event, index)"
          @focus="onFocus(index)"
          @blur="onBlur"
          @paste="onPaste($event, index)"
        />
      </template>
    </div>
  </div>
</template>

<style src="./InputOtp.scss"></style>

<script setup lang="ts">
import type { InputOtpProps, InputOtpEmits } from '../../types';
import { computed, ref, watch, nextTick, onMounted } from "vue";

defineOptions({ name: 'FtpInputOtp' });

const props = withDefaults(defineProps<InputOtpProps>(), {
  modelValue: "",
  length: 4,
  mask: false,
  maskChar: "*",
  integerOnly: true,
  separator: 0,
  isDisabled: false,
  isInvalid: false,
  autoFocus: false,
});

const emit = defineEmits(["update:modelValue", "change", "complete"]);

const inputRefs = ref<(HTMLInputElement | null)[]>([]);
const focusedIndex = ref(-1);
const values = ref<string[]>([]);

// Initialize values from modelValue
const initializeValues = () => {
  const newValues = new Array(props.length).fill("");
  const modelChars = props.modelValue.split("");
  for (let i = 0; i < Math.min(modelChars.length, props.length); i++) {
    newValues[i] = modelChars[i];
  }
  values.value = newValues;
};

initializeValues();

watch(
  () => props.modelValue,
  () => {
    initializeValues();
  }
);

watch(
  () => props.length,
  () => {
    initializeValues();
  }
);

const additionalClasses = computed(() =>
  [
    props.isDisabled && "input-otp--disabled",
    props.isInvalid && "input-otp--invalid",
  ]
    .filter(Boolean)
    .join(" ")
);

const emitValue = () => {
  const newValue = values.value.join("");
  emit("update:modelValue", newValue);
  emit("change", { value: newValue });

  // Check if complete
  if (newValue.length === props.length && !values.value.includes("")) {
    emit("complete", { value: newValue });
  }
};

const isValidChar = (char: any) => {
  if (props.integerOnly) {
    return /^[0-9]$/.test(char);
  }
  return char.length === 1;
};

const onInput = (event: Event, index: any) => {
  const inputValue = (event.target as HTMLInputElement).value;
  const char = inputValue.slice(-1);

  if (char && !isValidChar(char)) {
    (event.target as HTMLInputElement).value = values.value[index];
    return;
  }

  values.value[index] = char;
  emitValue();

  // Move to next cell
  if (char && index < props.length - 1) {
    nextTick(() => {
      inputRefs.value[index + 1]?.focus();
    });
  }
};

const onKeyDown = (event: KeyboardEvent, index: any) => {
  switch (event.key) {
    case "Backspace":
      if (values.value[index] === "" && index > 0) {
        // Move to previous cell and clear it
        nextTick(() => {
          inputRefs.value[index - 1]?.focus();
        });
      } else {
        values.value[index] = "";
        emitValue();
      }
      break;

    case "Delete":
      values.value[index] = "";
      emitValue();
      break;

    case "ArrowLeft":
      if (index > 0) {
        event.preventDefault();
        inputRefs.value[index - 1]?.focus();
      }
      break;

    case "ArrowRight":
      if (index < props.length - 1) {
        event.preventDefault();
        inputRefs.value[index + 1]?.focus();
      }
      break;

    case "Home":
      event.preventDefault();
      inputRefs.value[0]?.focus();
      break;

    case "End":
      event.preventDefault();
      inputRefs.value[props.length - 1]?.focus();
      break;
  }
};

const onFocus = (index: any) => {
  focusedIndex.value = index;
  // Select existing content
  nextTick(() => {
    inputRefs.value[index]?.select();
  });
};

const onBlur = () => {
  focusedIndex.value = -1;
};

const onPaste = (event: ClipboardEvent, index: any) => {
  event.preventDefault();
  const pastedData = event.clipboardData?.getData("text") || "";
  const chars = pastedData.split("").filter((char: any) => isValidChar(char));

  // Fill from current index
  for (let i = 0; i < chars.length && index + i < props.length; i++) {
    values.value[index + i] = chars[i];
  }

  emitValue();

  // Focus appropriate cell
  const newIndex = Math.min(index + chars.length, props.length - 1);
  nextTick(() => {
    inputRefs.value[newIndex]?.focus();
  });
};

// Focus first cell on mount if autoFocus
onMounted(() => {
  if (props.autoFocus && inputRefs.value[0]) {
    inputRefs.value[0].focus();
  }
});

// Expose methods
defineExpose({
  focus: () => inputRefs.value[0]?.focus(),
  clear: () => {
    values.value = new Array(props.length).fill("");
    emitValue();
    nextTick(() => {
      inputRefs.value[0]?.focus();
    });
  },
});
</script>
