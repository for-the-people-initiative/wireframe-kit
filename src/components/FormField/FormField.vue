<template>
  <div
    class="form-field"
    :class="{
      'form-field--error': !!error,
      'form-field--required': required,
      'form-field--disabled': disabled
    }"
  >
    <label
      v-if="label"
      :for="computedLabelFor"
      class="form-field__label"
    >
      {{ label }}
      <span v-if="required" class="form-field__required" aria-hidden="true">*</span>
    </label>
    <div class="form-field__control">
      <slot />
    </div>
    <div
      v-if="error"
      :id="errorId"
      class="form-field__error"
      role="alert"
    >
      <i class="pi pi-exclamation-circle form-field__error-icon" aria-hidden="true"></i>
      <span>{{ error }}</span>
    </div>
    <div
      v-else-if="hint"
      :id="hintId"
      class="form-field__hint"
    >
      {{ hint }}
    </div>
  </div>
</template>

<style src="./FormField.scss"></style>

<script setup lang="ts">
import type { FormFieldProps } from '../../types';
import { computed } from 'vue';

defineOptions({ name: 'FormField' });

let idCounter = 0;
const useId = () => 'ff-' + idCounter++;

const props = withDefaults(defineProps<FormFieldProps>(), {
  required: false,
  disabled: false,
});

const errorId = useId();
const hintId = useId();

// Support both labelFor and htmlFor (labelFor takes precedence)
const computedLabelFor = computed(() => props.labelFor ?? props.htmlFor);
</script>
