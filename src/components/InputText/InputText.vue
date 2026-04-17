<template>
  <input
    ref="inputRef"
    v-rough="{ severity: 2 }"
    class="input-text"
    :class="additionalClasses"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="isDisabled"
    :name="name"
    :aria-invalid="isInvalid || undefined"
    :aria-describedby="ariaDescribedby || undefined"
    @input="onInput"
    @change="onChange"
    @focus="onFocus"
    @blur="onBlur"
  />
</template>

<style src="./InputText.scss"></style>

<script setup lang="ts">
import type { InputTextProps, InputTextEmits } from '../../types';
import { computed, ref } from "vue";

defineOptions({ name: 'InputText' });

const props = withDefaults(defineProps<InputTextProps>(), {
  modelValue: "",
  type: "text",
  size: "md",
  isDisabled: false,
  isInvalid: false,
});

const emit = defineEmits(["update:modelValue", "input", "change", "focus", "blur"]);

const inputRef = ref<HTMLInputElement | null>(null);

const onInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  emit("update:modelValue", value);
  emit("input", { value, originalEvent: event });
};

const onChange = (event: Event) => {
  emit("change", { value: (event.target as HTMLInputElement).value, originalEvent: event });
};

const onFocus = (event: FocusEvent) => {
  emit("focus", { originalEvent: event });
};

const onBlur = (event: FocusEvent) => {
  emit("blur", { originalEvent: event });
};

const additionalClasses = computed(() => [
  `input-text--size-${props.size}`,
  props.isDisabled && "input-text--disabled",
  props.isInvalid && "input-text--invalid",
].filter(Boolean).join(" "));

// Expose input ref for programmatic focus
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select(),
  el: inputRef,
});
</script>
