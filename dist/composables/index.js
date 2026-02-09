import { ref, computed } from "vue";
function useFieldValidation(value, options = {}) {
  const { validateFn, validateOnMount = false } = options;
  const hasBlurred = ref(false);
  const isDirty = ref(false);
  const errorMessage = ref(null);
  const runValidation = () => {
    if (validateFn) {
      errorMessage.value = validateFn(value.value);
    } else {
      errorMessage.value = null;
    }
  };
  const isValid = computed(() => errorMessage.value === null);
  const shouldShowError = computed(() => {
    return hasBlurred.value && isDirty.value && errorMessage.value !== null;
  });
  const onFocus = () => {
  };
  const onBlur = () => {
    hasBlurred.value = true;
    runValidation();
  };
  const onInput = () => {
    isDirty.value = true;
    if (hasBlurred.value) {
      runValidation();
    }
  };
  const reset = () => {
    hasBlurred.value = false;
    isDirty.value = false;
    errorMessage.value = null;
  };
  const validate = () => {
    runValidation();
    return isValid.value;
  };
  if (validateOnMount) {
    runValidation();
  }
  return {
    // State
    hasBlurred,
    isDirty,
    shouldShowError,
    // Event handlers
    onFocus,
    onBlur,
    onInput,
    // Manual control
    reset,
    validate,
    // Error state
    errorMessage,
    isValid
  };
}
export {
  useFieldValidation
};
