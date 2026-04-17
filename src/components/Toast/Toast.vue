<template>
  <Teleport to="body">
    <div
      class="toast-container"
      :class="`toast-container--${position}`"
    >
      <TransitionGroup name="toast-slide">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          v-rough
          class="toast"
          :class="[
            `toast--${toast.severity || 'default'}`,
            { 'toast--closable': toast.closable !== false }
          ]"
          role="alert"
          aria-live="assertive"
        >
          <span v-if="showIcon" class="toast__icon">
            <svg v-if="toast.severity === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <svg v-else-if="toast.severity === 'info'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <svg v-else-if="toast.severity === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <svg v-else-if="toast.severity === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </span>

          <div class="toast__content">
            <span v-if="toast.summary" class="toast__summary">{{ toast.summary }}</span>
            <span v-if="toast.detail" class="toast__detail">{{ toast.detail }}</span>
          </div>

          <button
            v-if="toast.closable !== false"
            type="button"
            class="toast__close"
            aria-label="Close"
            @click="removeToast(toast.id)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div
            v-if="toast.life && showProgress"
            class="toast__progress"
          >
            <div
              class="toast__progress-bar"
              :class="`toast__progress-bar--${toast.severity || 'default'}`"
              :style="{ animationDuration: `${toast.life}ms` }"
            />
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style src="./Toast.scss"></style>

<script setup lang="ts">
import type { ToastProps } from '../../types';
import { ref, onMounted, onUnmounted } from "vue";

defineOptions({ name: 'Toast' });

const props = withDefaults(defineProps<ToastProps>(), {
  position: "top-right",
  group: null,
  showIcon: true,
  showProgress: true,
});

const toasts = ref<any[]>([]);
let toastIdCounter = 0;
const timeoutIds = new Map();

function add(toast: any) {
  const id = ++toastIdCounter;
  const newToast = {
    id,
    severity: "default",
    closable: true,
    life: 3000,
    ...toast,
  };

  toasts.value.push(newToast);

  if (newToast.life > 0) {
    const timeoutId = setTimeout(() => {
      timeoutIds.delete(id);
      removeToast(id);
    }, newToast.life);
    timeoutIds.set(id, timeoutId);
  }

  return id;
}

function removeToast(id: any) {
  const timeoutId = timeoutIds.get(id);
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutIds.delete(id);
  }
  const index = toasts.value.findIndex((t) => t.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
}

function removeGroup(group: any) {
  toasts.value.filter((t) => t.group === group).forEach((t) => {
    const timeoutId = timeoutIds.get(t.id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutIds.delete(t.id);
    }
  });
  toasts.value = toasts.value.filter((t) => t.group !== group);
}

function removeAllGroups() {
  timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
  timeoutIds.clear();
  toasts.value = [];
}

onUnmounted(() => {
  timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
  timeoutIds.clear();
});

// Expose methods for external use
defineExpose({
  add,
  remove: removeToast,
  removeGroup,
  removeAllGroups,
});
</script>
