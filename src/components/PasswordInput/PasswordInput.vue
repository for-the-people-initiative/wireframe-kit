<template>
  <div class="password-input" :class="rootClasses">
    <!-- Label -->
    <label v-if="label" class="password-input__label" :for="inputId">
      {{ label }}
    </label>

    <!-- Main input wrapper -->
    <div class="password-input__field-wrapper">
      <input
        :id="inputId"
        ref="inputRef"
        class="password-input__field"
        :class="inputClasses"
        :type="showPassword ? 'text' : 'password'"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="isDisabled"
        :aria-describedby="ariaDescribedby"
        :aria-invalid="showStrengthError || isInvalid || undefined"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
      />
      <button
        type="button"
        class="password-input__toggle"
        :disabled="isDisabled"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
        @click="toggleVisibility"
      >
        <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" />
      </button>
    </div>

    <!-- Strength indicator -->
    <div v-if="showStrength && modelValue" class="password-input__strength">
      <div class="password-input__strength-bar">
        <div
          class="password-input__strength-fill"
          :class="`password-input__strength-fill--${strengthLevel}`"
          :style="{ width: strengthWidth }"
        />
      </div>
      <span class="password-input__strength-label" :class="`password-input__strength-label--${strengthLevel}`">
        {{ strengthLabel }}
      </span>
    </div>

    <!-- Strength requirement error message -->
    <div v-if="showStrengthError" class="password-input__error">
      <i class="pi pi-exclamation-circle" />
      <span>
        <slot name="error">{{ errorMessage || defaultErrorMessage }}</slot>
      </span>
    </div>

    <!-- Criteria checklist -->
    <div v-if="showCriteria" class="password-input__criteria-wrapper">
      <!-- Required -->
      <div class="password-input__criteria-section">
        <span class="password-input__criteria-label password-input__criteria-label--required">Required</span>
        <ul class="password-input__criteria">
          <li
            v-for="criterion in requiredCriteria"
            :key="criterion.key"
            class="password-input__criterion"
            :class="{ 'password-input__criterion--met': criterion.met }"
          >
            <i :class="criterion.met ? 'pi pi-check' : 'pi pi-times'" />
            <span>{{ criterion.label }}</span>
          </li>
        </ul>
      </div>
      <!-- Tips -->
      <div class="password-input__criteria-section">
        <span class="password-input__criteria-label password-input__criteria-label--tip">Tips for a stronger password</span>
        <ul class="password-input__criteria">
          <li
            v-for="criterion in tipCriteria"
            :key="criterion.key"
            class="password-input__criterion password-input__criterion--tip"
            :class="{ 'password-input__criterion--met': criterion.met }"
          >
            <i :class="criterion.met ? 'pi pi-check' : 'pi pi-circle'" />
            <span>{{ criterion.label }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Confirm field -->
    <div v-if="confirmValue !== undefined" class="password-input__confirm">
      <div class="password-input__field-wrapper">
        <input
          :id="`${inputId}-confirm`"
          class="password-input__field"
          :class="confirmInputClasses"
          :type="showConfirmPassword ? 'text' : 'password'"
          :value="confirmValue"
          :placeholder="confirmPlaceholder"
          :disabled="isDisabled"
          @input="onConfirmInput"
        />
        <button
          type="button"
          class="password-input__toggle"
          :disabled="isDisabled"
          :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
          @click="toggleConfirmVisibility"
        >
          <i :class="showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" />
        </button>
      </div>
      <div v-if="confirmValue" class="password-input__match">
        <i :class="passwordsMatch ? 'pi pi-check-circle' : 'pi pi-times-circle'" />
        <span :class="passwordsMatch ? 'password-input__match--success' : 'password-input__match--error'">
          {{ passwordsMatch ? 'Passwords match' : 'Passwords do not match' }}
        </span>
      </div>
    </div>
  </div>
</template>

<style src="./PasswordInput.scss"></style>

<script setup lang="ts">
import type { PasswordInputProps, PasswordInputEmits, PasswordStrength } from '../../types';
import { computed, ref, watch } from 'vue';

defineOptions({ name: 'FtpPasswordInput' });

const props = withDefaults(defineProps<PasswordInputProps>(), {
  modelValue: '',
  showStrength: true,
  showCriteria: false,
  minLength: 6,
  placeholder: 'Enter password',
  confirmPlaceholder: 'Confirm password',
  isDisabled: false,
  size: 'md',
  requireStrength: 'none',
});

const emit = defineEmits<PasswordInputEmits>();

// Refs
const inputRef = ref<HTMLInputElement | null>(null);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const hasTouched = ref(false); // Track if user has interacted
const inputId = computed(() => `password-input-${Math.random().toString(36).slice(2, 9)}`);

// Strength levels in order (for comparison)
const strengthOrder: PasswordStrength[] = ['weak', 'fair', 'strong', 'very-strong'];

// Strength calculation
const calculateStrength = (password: string): { level: PasswordStrength; score: number } => {
  if (!password) return { level: 'weak', score: 0 };

  let score = 0;

  // Length check
  if (password.length >= props.minLength) score++;
  if (password.length >= 10) score++;

  // Character type checks
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Determine level
  let level: PasswordStrength;
  if (score <= 2) level = 'weak';
  else if (score <= 3) level = 'fair';
  else if (score <= 5) level = 'strong';
  else level = 'very-strong';

  return { level, score };
};

const strength = computed(() => calculateStrength(props.modelValue));
const strengthLevel = computed(() => strength.value.level);
const strengthWidth = computed(() => {
  const widths: Record<PasswordStrength, string> = {
    'weak': '25%',
    'fair': '50%',
    'strong': '75%',
    'very-strong': '100%',
  };
  return widths[strengthLevel.value];
});
const strengthLabel = computed(() => {
  const labels: Record<PasswordStrength, string> = {
    'weak': 'Weak',
    'fair': 'Fair',
    'strong': 'Strong',
    'very-strong': 'Very strong',
  };
  return labels[strengthLevel.value];
});

// Validation: check if password meets required strength
const meetsRequiredStrength = computed(() => {
  if (props.requireStrength === 'none') return true;
  if (!props.modelValue) return false;
  
  const currentIndex = strengthOrder.indexOf(strengthLevel.value);
  const requiredIndex = strengthOrder.indexOf(props.requireStrength);
  
  return currentIndex >= requiredIndex;
});

// Overall validity (strength + confirm match if applicable)
const isValid = computed(() => {
  // Must meet strength requirement
  if (!meetsRequiredStrength.value) return false;
  
  // If confirm mode, must match
  if (props.confirmValue !== undefined && !passwordsMatch.value) return false;
  
  // Must have content
  if (!props.modelValue) return false;
  
  return true;
});

// Show error only if user has typed and doesn't meet requirement
const showStrengthError = computed(() => {
  if (props.requireStrength === 'none') return false;
  return hasTouched.value && props.modelValue.length > 0 && !meetsRequiredStrength.value;
});

// Default error message based on required strength
const defaultErrorMessage = computed(() => {
  const strengthNames: Record<string, string> = {
    'weak': 'weak',
    'fair': 'fair',
    'strong': 'strong',
    'very-strong': 'very strong',
  };
  return `Password must be at least ${strengthNames[props.requireStrength]} strength`;
});

// Watch for strength changes
watch(strengthLevel, (newLevel) => {
  emit('strength-change', newLevel);
}, { immediate: true });

// Watch for validity changes
watch(isValid, (newValid) => {
  emit('valid', newValid);
}, { immediate: true });

// Criteria
// Required criteria (must be met for validity)
const requiredCriteria = computed(() => [
  {
    key: 'length',
    label: `At least ${props.minLength} characters`,
    met: props.modelValue.length >= props.minLength,
  },
]);

// Tip criteria (improve strength but not required)
const tipCriteria = computed(() => [
  {
    key: 'uppercase',
    label: 'Add uppercase letter',
    met: /[A-Z]/.test(props.modelValue),
  },
  {
    key: 'number',
    label: 'Add a number',
    met: /[0-9]/.test(props.modelValue),
  },
  {
    key: 'special',
    label: 'Add special character',
    met: /[^A-Za-z0-9]/.test(props.modelValue),
  },
]);

// Combined for backward compatibility
const criteria = computed(() => [...requiredCriteria.value, ...tipCriteria.value]);

// Confirm matching
const passwordsMatch = computed(() => {
  if (props.confirmValue === undefined) return false;
  return props.modelValue === props.confirmValue && props.modelValue.length > 0;
});

// Event handlers
const onInput = (event: Event) => {
  hasTouched.value = true;
  const value = (event.target as HTMLInputElement).value;
  emit('update:modelValue', value);
};

const onConfirmInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  emit('update:confirmValue', value);
};

const onFocus = (event: FocusEvent) => {
  emit('focus', { originalEvent: event });
};

const onBlur = (event: FocusEvent) => {
  hasTouched.value = true; // Also mark as touched on blur
  emit('blur', { originalEvent: event });
};

const toggleVisibility = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

// Classes
const rootClasses = computed(() => [
  props.isDisabled && 'password-input--disabled',
  showStrengthError.value && 'password-input--error',
].filter(Boolean));

const inputClasses = computed(() => [
  `password-input__field--size-${props.size}`,
  (props.isInvalid || showStrengthError.value) && 'password-input__field--invalid',
].filter(Boolean));

const confirmInputClasses = computed(() => [
  `password-input__field--size-${props.size}`,
  props.confirmValue && !passwordsMatch.value && 'password-input__field--invalid',
  props.confirmValue && passwordsMatch.value && 'password-input__field--valid',
].filter(Boolean));

const ariaDescribedby = computed(() => {
  const ids: string[] = [];
  if (props.showStrength) ids.push(`${inputId.value}-strength`);
  if (props.showCriteria) ids.push(`${inputId.value}-criteria`);
  if (showStrengthError.value) ids.push(`${inputId.value}-error`);
  return ids.length > 0 ? ids.join(' ') : undefined;
});

// Expose
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  el: inputRef,
  isValid,
});
</script>
