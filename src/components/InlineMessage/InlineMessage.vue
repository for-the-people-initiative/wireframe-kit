<template>
  <span v-rough class="inline-message" :class="additionalClasses" role="status">
    <slot name="icon">
      <span v-if="hasIcon" class="inline-message__icon">
        <!-- Success icon -->
        <svg v-if="severity === 'success'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
        </svg>
        <!-- Info icon -->
        <svg v-else-if="severity === 'info'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
        </svg>
        <!-- Warning icon -->
        <svg v-else-if="severity === 'warn'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="currentColor"/>
        </svg>
        <!-- Error icon -->
        <svg v-else-if="severity === 'error'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
        </svg>
      </span>
    </slot>
    <span class="inline-message__text">
      <slot />
    </span>
  </span>
</template>

<style src="./InlineMessage.scss"></style>

<script setup lang="ts">
import type { InlineMessageProps } from '../../types';
import { computed } from "vue";

defineOptions({ name: 'InlineMessage' });

const props = withDefaults(defineProps<InlineMessageProps>(), {
  severity: "info",
  icon: true,
});

const hasIcon = computed(() => props.icon);

const additionalClasses = computed(() =>
  [`inline-message--${props.severity}`].join(" ")
);
</script>
