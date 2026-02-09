import { type Ref, type ComputedRef } from 'vue';
/**
 * Options for useFieldValidation composable
 */
export interface UseFieldValidationOptions<T = unknown> {
    /**
     * Custom validation function.
     * Returns error message string if invalid, or null if valid.
     */
    validateFn?: (value: T) => string | null;
    /**
     * Whether to run validation on mount.
     * @default false
     */
    validateOnMount?: boolean;
}
/**
 * Return type for useFieldValidation composable
 */
export interface UseFieldValidationReturn {
    /** True after first blur event */
    hasBlurred: Ref<boolean>;
    /** True after value has changed (input event) */
    isDirty: Ref<boolean>;
    /** True when error should be visible (hasBlurred && isDirty && errorMessage !== null) */
    shouldShowError: ComputedRef<boolean>;
    onFocus: () => void;
    onBlur: () => void;
    onInput: () => void;
    /** Reset all state to initial values */
    reset: () => void;
    /** Force validation, returns true if valid */
    validate: () => boolean;
    /** Current error message, or null if valid */
    errorMessage: Ref<string | null>;
    /** True when field is valid (no error message) */
    isValid: ComputedRef<boolean>;
}
/**
 * Composable for field validation with "touched-then-dirty" pattern.
 *
 * Pattern:
 * - Before first blur: never show errors (user is still typing)
 * - After first blur: validate on both blur AND input
 * - Error shown only when: hasBlurred && isDirty && errorMessage !== null
 *
 * @param value - Reactive reference to the field value to validate
 * @param options - Validation options
 * @returns Validation state and handlers
 *
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { useFieldValidation } from '@for-the-people-initiative/design-system/composables'
 *
 * const email = ref('')
 * const { shouldShowError, errorMessage, onFocus, onBlur, onInput } = useFieldValidation(email, {
 *   validateFn: (value) => {
 *     if (!value) return 'Email is required'
 *     if (!value.includes('@')) return 'Invalid email format'
 *     return null
 *   }
 * })
 * </script>
 *
 * <template>
 *   <InputText
 *     v-model="email"
 *     @focus="onFocus"
 *     @blur="onBlur"
 *     @input="onInput"
 *     :is-invalid="shouldShowError"
 *   />
 *   <small v-if="shouldShowError" class="error">{{ errorMessage }}</small>
 * </template>
 * ```
 */
export declare function useFieldValidation<T = unknown>(value: Ref<T>, options?: UseFieldValidationOptions<T>): UseFieldValidationReturn;
export default useFieldValidation;
