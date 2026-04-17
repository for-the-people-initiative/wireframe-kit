<template>
  <button
    v-rough
    type="button"
    class="toggle-button"
    :class="additionalClasses"
    :disabled="isDisabled"
    :aria-pressed="modelValue"
    @click="onClick"
  >
    <span v-if="currentIcon" class="toggle-button__icon">
      <slot name="icon" :value="modelValue">
        <i :class="currentIcon"></i>
      </slot>
    </span>
    <span v-if="currentLabel" class="toggle-button__label">
      {{ currentLabel }}
    </span>
  </button>
</template>

<style src="./ToggleButton.scss"></style>

<script setup lang="ts">
import type { ToggleButtonProps, ToggleButtonEmits } from '../../types';
import { computed } from "vue";

defineOptions({ name: 'FtpToggleButton' });

const props = withDefaults(defineProps<ToggleButtonProps>(), {
  modelValue: false,
  onLabel: "",
  offLabel: "",
  onIcon: "",
  offIcon: "",
  size: "md",
  isDisabled: false,
});

const emit = defineEmits(["update:modelValue", "change"]);

const onClick = (event: MouseEvent) => {
  if (props.isDisabled) return;
  const newValue = !props.modelValue;
  emit("update:modelValue", newValue);
  emit("change", { value: newValue, originalEvent: event });
};

const currentLabel = computed(() => {
  return props.modelValue ? props.onLabel : props.offLabel;
});

const currentIcon = computed(() => {
  return props.modelValue ? props.onIcon : props.offIcon;
});

const additionalClasses = computed(() =>
  [
    `toggle-button--size-${props.size}`,
    props.modelValue && "toggle-button--checked",
    props.isDisabled && "toggle-button--disabled",
  ]
    .filter(Boolean)
    .join(" ")
);
</script>
