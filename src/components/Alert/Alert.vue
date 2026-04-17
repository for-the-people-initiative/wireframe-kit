<template>
  <div
    v-if="!dismissed"
    v-rough
    class="alert"
    :class="additionalClasses"
    role="alert"
  >
    <div class="alert__icon-wrapper" aria-hidden="true">
      <slot name="icon">
        <svg v-if="computedIcon === 'success'" class="alert__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <svg v-else-if="computedIcon === 'info'" class="alert__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <svg v-else-if="computedIcon === 'warn'" class="alert__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <svg v-else-if="computedIcon === 'error'" class="alert__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </slot>
    </div>

    <div class="alert__content">
      <div v-if="title" class="alert__title">{{ title }}</div>
      <div v-if="$slots.default" class="alert__description">
        <slot />
      </div>
    </div>

    <div v-if="$slots.action" class="alert__action">
      <slot name="action" />
    </div>

    <button
      v-if="closable"
      type="button"
      class="alert__close"
      aria-label="Close"
      @click="onClose"
    >
      <svg class="alert__close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
</template>

<style src="./Alert.scss"></style>

<script setup lang="ts">
import type { AlertProps } from '../../types';
import { computed, ref } from 'vue';

defineOptions({ name: 'Alert' });

const props = withDefaults(defineProps<AlertProps>(), {
  severity: 'info',
  closable: false,
});

const emit = defineEmits<{
  (e: 'close'): void
}>();

const dismissed = ref(false);

const computedIcon = computed(() => props.icon ?? props.severity);

const additionalClasses = computed(() =>
  [`alert--${props.severity}`].filter(Boolean).join(' ')
);

const onClose = () => {
  dismissed.value = true;
  emit('close');
};
</script>
