<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="visible"
        class="dialog__overlay"
        :class="{ 'dialog__overlay--modal': modal }"
        @click="onOverlayClick"
        @keydown.escape="onEscapeKey"
      >
        <Transition name="dialog-scale">
          <div
            v-if="visible"
            ref="dialogRef"
            v-rough="{ strokeWidth: 2 }"
            class="dialog"
            :class="additionalClasses"
            role="dialog"
            :aria-modal="modal"
            :aria-labelledby="headerId"
            @click.stop
            @keydown="onKeyDown"
          >
            <div v-if="$slots.header || header || closable" class="dialog__header">
              <slot name="header">
                <span :id="headerId" class="dialog__title">{{ header }}</span>
              </slot>
              <button
                v-if="closable"
                type="button"
                class="dialog__close"
                aria-label="Close"
                @click="close"
              >
                <svg
                  class="dialog__close-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div class="dialog__content">
              <slot />
            </div>

            <div v-if="$slots.footer" class="dialog__footer">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style src="./Dialog.scss"></style>

<script setup lang="ts">
import type { DialogProps, DialogEmits } from '../../types';
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from "vue";

defineOptions({ name: 'FtpDialog' });

// Bug #2: SSR-safe ID generation (atomic counter instead of Math.random)
let idCounter = 0;
const useId = () => 'ftp-' + idCounter++;

// Bug #3: Body scroll lock counter (shared across all Dialog instances)
let scrollLockCount = 0;
const lockScroll = () => {
  scrollLockCount++;
  if (scrollLockCount === 1) {
    document.body.style.overflow = "hidden";
  }
};
const unlockScroll = () => {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = "";
  }
};

const props = withDefaults(defineProps<DialogProps>(), {
  visible: false,
  header: "",
  closable: true,
  modal: true,
  draggable: false,
  dismissableMask: false,
  closeOnEscape: true,
  size: "md",
});

const emit = defineEmits(["update:visible", "show", "hide"]);

const dialogRef = ref<HTMLElement | null>(null);
const headerId = useId();

// Drag state
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const dialogPosition = ref({ x: 0, y: 0 });

const additionalClasses = computed(() => [
  `dialog--size-${props.size}`,
  props.draggable && "dialog--draggable",
].filter(Boolean).join(" "));

const close = () => {
  emit("update:visible", false);
  emit("hide");
};

const onOverlayClick = () => {
  if (props.dismissableMask) {
    close();
  }
};

const onEscapeKey = (event: KeyboardEvent) => {
  if (props.closeOnEscape && props.visible) {
    event.preventDefault();
    close();
  }
};

// Bug #1: Focus trap
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key !== 'Tab' || !props.modal || !dialogRef.value) return;

  const focusableElements = [...dialogRef.value.querySelectorAll(FOCUSABLE_SELECTOR)];
  if (focusableElements.length === 0) {
    event.preventDefault();
    return;
  }

  const firstEl = (focusableElements[0] as HTMLElement);
  const lastEl = (focusableElements[focusableElements.length - 1] as HTMLElement);

  if (event.shiftKey) {
    if (document.activeElement === firstEl || !dialogRef.value.contains(document.activeElement)) {
      event.preventDefault();
      lastEl.focus();
    }
  } else {
    if (document.activeElement === lastEl || !dialogRef.value.contains(document.activeElement)) {
      event.preventDefault();
      firstEl.focus();
    }
  }
};

// Bug #4: Drag cleanup helper
const removeDragListeners = () => {
  document.removeEventListener("mousemove", onDragMove);
  document.removeEventListener("mouseup", onDragEnd);
  isDragging.value = false;
};

// Dragging functionality
const onDragStart = (event: MouseEvent) => {
  if (!props.draggable || !dialogRef.value) return;

  isDragging.value = true;
  const rect = dialogRef.value.getBoundingClientRect();
  dragOffset.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };

  document.addEventListener("mousemove", onDragMove);
  document.addEventListener("mouseup", onDragEnd);
};

const onDragMove = (event: MouseEvent) => {
  if (!isDragging.value) return;

  dialogPosition.value = {
    x: event.clientX - dragOffset.value.x,
    y: event.clientY - dragOffset.value.y,
  };

  if (dialogRef.value) {
    dialogRef.value.style.left = `${dialogPosition.value.x}px`;
    dialogRef.value.style.top = `${dialogPosition.value.y}px`;
    dialogRef.value.style.transform = "none";
  }
};

const onDragEnd = () => {
  removeDragListeners();
};

// Track whether we locked scroll (for cleanup)
let didLockScroll = false;

watch(
  () => props.visible,
  async (newValue) => {
    if (newValue) {
      emit("show");
      if (props.modal) {
        lockScroll();
        didLockScroll = true;
      }
      // Focus first focusable element when dialog opens
      await nextTick();
      if (dialogRef.value) {
        const focusable = dialogRef.value.querySelector(FOCUSABLE_SELECTOR);
        if (focusable) {
          (focusable as HTMLElement).focus();
        } else {
          dialogRef.value.setAttribute('tabindex', '-1');
          dialogRef.value.focus();
        }
      }
    } else {
      // Bug #4: Clean up drag listeners on hide
      removeDragListeners();
      if (didLockScroll) {
        unlockScroll();
        didLockScroll = false;
      }
    }
  }
);

// Cleanup on unmount
onUnmounted(() => {
  if (didLockScroll) {
    unlockScroll();
    didLockScroll = false;
  }
  removeDragListeners();
});
</script>
