<template>
  <Teleport to="body">
    <Transition name="confirm-popup-fade">
      <div
        v-if="isVisible"
        v-rough
        ref="popupRef"
        class="confirm-popup"
        :class="positionClass"
        :style="popupStyle"
        role="alertdialog"
        aria-modal="false"
        :aria-describedby="messageId"
      >
        <div class="confirm-popup__content">
          <div v-if="showIcon" class="confirm-popup__icon">
            <svg
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
          </div>
          <span :id="messageId" class="confirm-popup__message">{{ message }}</span>
        </div>
        <div class="confirm-popup__footer">
          <button
            type="button"
            class="confirm-popup__button confirm-popup__button--reject"
            @click="reject"
          >
            {{ rejectLabel }}
          </button>
          <button
            type="button"
            class="confirm-popup__button confirm-popup__button--accept"
            @click="accept"
          >
            {{ acceptLabel }}
          </button>
        </div>
        <span class="confirm-popup__arrow" />
      </div>
    </Transition>
  </Teleport>
</template>

<style src="./ConfirmPopup.scss"></style>

<script setup lang="ts">
import type { ConfirmPopupProps, ConfirmPopupEmits } from '../../types';
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";

defineOptions({ name: 'FtpConfirmPopup' });

const props = withDefaults(defineProps<ConfirmPopupProps>(), {
  target: null,
  message: "Are you sure?",
  acceptLabel: "Yes",
  rejectLabel: "No",
  showIcon: true,
  position: "top",
});

const emit = defineEmits(["accept", "reject"]);

const isVisible = ref(false);
const popupRef = ref<HTMLElement | null>(null);
const popupStyle = ref({});
const targetElement = ref<HTMLElement | null>(null);

const messageId = `confirm-popup-message-${Math.random().toString(36).substr(2, 9)}`;

const positionClass = computed(() => `confirm-popup--${props.position}`);

function show(event: Event) {
  if (event?.currentTarget) {
    targetElement.value = event.currentTarget as HTMLElement;
  } else if (typeof props.target === "string") {
    targetElement.value = document.querySelector(props.target) as HTMLElement | null;
  } else if (props.target) {
    targetElement.value = props.target;
  }

  isVisible.value = true;
  nextTick(updatePosition);
}

function hide() {
  isVisible.value = false;
}

function accept() {
  emit("accept");
  hide();
}

function reject() {
  emit("reject");
  hide();
}

function updatePosition() {
  if (!targetElement.value || !popupRef.value) return;

  const targetRect = targetElement.value.getBoundingClientRect();
  const popupRect = popupRef.value.getBoundingClientRect();
  const offset = 10; // Matches confirmPopup.offset token

  let top, left;

  switch (props.position) {
    case "top":
      top = targetRect.top - popupRect.height - offset;
      left = targetRect.left + (targetRect.width - popupRect.width) / 2;
      break;
    case "bottom":
      top = targetRect.bottom + offset;
      left = targetRect.left + (targetRect.width - popupRect.width) / 2;
      break;
    case "left":
      top = targetRect.top + (targetRect.height - popupRect.height) / 2;
      left = targetRect.left - popupRect.width - offset;
      break;
    case "right":
      top = targetRect.top + (targetRect.height - popupRect.height) / 2;
      left = targetRect.right + offset;
      break;
  }

  // Keep popup within viewport
  const viewportPadding = 8;
  left = Math.max(viewportPadding, Math.min(left, window.innerWidth - popupRect.width - viewportPadding));
  top = Math.max(viewportPadding, Math.min(top, window.innerHeight - popupRect.height - viewportPadding));

  popupStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  };
}

function handleClickOutside(event: MouseEvent) {
  if (isVisible.value && popupRef.value && !popupRef.value.contains(event.target as Node)) {
    if (targetElement.value && targetElement.value.contains(event.target as Node)) {
      return;
    }
    reject();
  }
}

function handleScroll() {
  if (isVisible.value) {
    updatePosition();
  }
}

function handleResize() {
  if (isVisible.value) {
    updatePosition();
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside, true);
  window.addEventListener("scroll", handleScroll, true);
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside, true);
  window.removeEventListener("scroll", handleScroll, true);
  window.removeEventListener("resize", handleResize);
});

// Expose methods for external control
defineExpose({
  show,
  hide,
});
</script>
