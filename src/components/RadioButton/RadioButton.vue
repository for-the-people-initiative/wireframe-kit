<template>
  <label class="radio" :class="additionalClasses">
    <input
      type="radio"
      class="radio__input"
      :checked="isChecked"
      :disabled="isDisabled"
      :name="name"
      :value="value"
      :aria-invalid="isInvalid || undefined"
      @change="onChange"
    />
    <span v-rough="{ shape: 'circle', strokeWidth: 1.5, roughness: 1.2 }" class="radio__circle">
      <span class="radio__dot"></span>
    </span>
    <span v-if="label || $slots.default" class="radio__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style src="./RadioButton.scss"></style>

<script setup lang="ts">
import type { RadioButtonProps, RadioButtonEmits } from '../../types';
import { computed } from "vue";

defineOptions({ name: 'FtpRadioButton' });

const props = withDefaults(defineProps<RadioButtonProps>(), {
  modelValue: null,
  size: "md",
  isDisabled: false,
  isInvalid: false,
});

const emit = defineEmits(["update:modelValue", "change"]);

const isChecked = computed(() => props.modelValue === props.value);

const onChange = (event: Event) => {
  emit("update:modelValue", props.value);
  emit("change", { value: props.value, originalEvent: event });
};

const additionalClasses = computed(() => [
  `radio--size-${props.size}`,
  props.isDisabled && "radio--disabled",
  props.isInvalid && "radio--invalid",
  isChecked.value && "radio--checked",
].filter(Boolean).join(" "));
</script>
