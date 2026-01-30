<template>
  <Teleport to="body">
    <Transition name="confirm-dialog-fade">
      <div
        v-if="visible"
        class="confirm-dialog__overlay"
        @click="onOverlayClick"
        @keydown.escape="onEscapeKey"
      >
        <Transition name="confirm-dialog-scale">
          <div
            v-if="visible"
            ref="dialogRef"
            class="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            :aria-labelledby="headerId"
            :aria-describedby="messageId"
            @click.stop
          >
            <div v-if="header" class="confirm-dialog__header">
              <span :id="headerId" class="confirm-dialog__title">{{ header }}</span>
            </div>

            <div class="confirm-dialog__content">
              <div v-if="icon" class="confirm-dialog__icon" :class="iconClass">
                <svg
                  v-if="icon === 'warning'"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <svg
                  v-else-if="icon === 'danger'"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <svg
                  v-else-if="icon === 'info'"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <p :id="messageId" class="confirm-dialog__message">{{ message }}</p>
            </div>

            <div class="confirm-dialog__footer">
              <button
                type="button"
                class="confirm-dialog__button confirm-dialog__button--reject"
                @click="reject"
              >
                {{ rejectLabel }}
              </button>
              <button
                type="button"
                class="confirm-dialog__button confirm-dialog__button--accept"
                @click="accept"
              >
                {{ acceptLabel }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style src="./ConfirmDialog.scss"></style>

<script setup lang="ts">
import type { ConfirmDialogProps, ConfirmDialogEmits } from '../../types';
import { computed, watch, onUnmounted } from "vue";

defineOptions({ name: 'FtpConfirmDialog' });

const props = withDefaults(defineProps<ConfirmDialogProps>(), {
  visible: false,
  header: "Confirmation",
  message: "Are you sure you want to proceed?",
  icon: "warning",
  acceptLabel: "Yes",
  rejectLabel: "No",
  dismissableMask: false,
  closeOnEscape: true,
});

const emit = defineEmits(["update:visible", "accept", "reject"]);

const headerId = `confirm-dialog-header-${Math.random().toString(36).substr(2, 9)}`;
const messageId = `confirm-dialog-message-${Math.random().toString(36).substr(2, 9)}`;

const iconClass = computed(() => props.icon ? `confirm-dialog__icon--${props.icon}` : "");

const close = () => {
  emit("update:visible", false);
};

const accept = () => {
  emit("accept");
  close();
};

const reject = () => {
  emit("reject");
  close();
};

const onOverlayClick = () => {
  if (props.dismissableMask) {
    reject();
  }
};

const onEscapeKey = (event: KeyboardEvent) => {
  if (props.closeOnEscape && props.visible) {
    event.preventDefault();
    reject();
  }
};

// Block scroll when dialog is open
watch(
  () => props.visible,
  (newValue) => {
    if (newValue) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
);

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = "";
});
</script>
