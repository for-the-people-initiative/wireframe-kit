<template>
  <label class="input-switch" :class="additionalClasses">
    <input
      type="checkbox"
      class="input-switch__input"
      :checked="modelValue"
      :disabled="isDisabled"
      :name="name"
      role="switch"
      :aria-checked="modelValue"
      @change="onChange"
    />
    <span class="input-switch__track">
      <span class="input-switch__thumb"></span>
    </span>
    <span v-if="label || $slots.default" class="input-switch__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style src="./InputSwitch.scss"></style>

<script setup lang="ts">
import type { InputSwitchProps, InputSwitchEmits } from '../../types';
import { computed } from "vue";

defineOptions({ name: 'InputSwitch' });

const props = withDefaults(defineProps<InputSwitchProps>(), {
  modelValue: false,
  size: "md",
  isDisabled: false,
});

const emit = defineEmits(["update:modelValue", "change"]);

const onChange = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked;
  emit("update:modelValue", checked);
  emit("change", { value: checked, originalEvent: event });
};

const additionalClasses = computed(() => [
  `input-switch--size-${props.size}`,
  props.isDisabled && "input-switch--disabled",
  props.modelValue && "input-switch--checked",
].filter(Boolean).join(" "));
</script>
