<template>
  <Teleport :to="appendTo">
    <Transition name="overlay-panel-fade">
      <div
        v-if="isVisible"
        v-rough
        ref="panelRef"
        class="overlay-panel"
        :style="panelStyle"
        role="dialog"
        aria-modal="false"
        @click.stop
      >
        <button
          v-if="showCloseIcon"
          type="button"
          class="overlay-panel__close"
          aria-label="Close"
          @click="hide"
        >
          <svg
            class="overlay-panel__close-icon"
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
        <div class="overlay-panel__content">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style src="./OverlayPanel.scss"></style>

<script setup lang="ts">
import type { OverlayPanelProps, OverlayPanelEmits } from '../../types';
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";

defineOptions({ name: 'FtpOverlayPanel' });

const props = withDefaults(defineProps<OverlayPanelProps>(), {
  appendTo: "body",
  dismissable: true,
  showCloseIcon: false,
});

const emit = defineEmits(["update:visible", "show", "hide"]);

const internalVisible = ref(false);
const panelRef = ref<HTMLElement | null>(null);
const panelStyle = ref({});
let targetElement: HTMLElement | null = null;

// Support both controlled (v-model) and uncontrolled modes
const isVisible = computed(() => {
  return props.visible !== undefined ? props.visible : internalVisible.value;
});

function show(event: Event) {
  if (event?.currentTarget) {
    targetElement = event.currentTarget as HTMLElement;
  } else if (event?.target) {
    targetElement = event.target as HTMLElement;
  }

  if (props.visible !== undefined) {
    emit("update:visible", true);
  } else {
    internalVisible.value = true;
  }
  emit("show");
  nextTick(updatePosition);
}

function hide() {
  if (props.visible !== undefined) {
    emit("update:visible", false);
  } else {
    internalVisible.value = false;
  }
  emit("hide");
}

function toggle(event: Event) {
  if (isVisible.value) {
    hide();
  } else {
    show(event);
  }
}

function updatePosition() {
  if (!targetElement || !panelRef.value) return;

  const targetRect = targetElement.getBoundingClientRect();
  const panelRect = panelRef.value.getBoundingClientRect();
  const offset = 10; // Matches overlayPanel.offset token

  // Position below the target by default
  let top = targetRect.bottom + offset;
  let left = targetRect.left;

  // Adjust horizontal position if panel goes off screen
  if (left + panelRect.width > window.innerWidth) {
    left = targetRect.right - panelRect.width;
  }

  // Keep panel within viewport
  const viewportPadding = 8;
  left = Math.max(viewportPadding, Math.min(left, window.innerWidth - panelRect.width - viewportPadding));

  // If panel would go below viewport, position above target
  if (top + panelRect.height > window.innerHeight) {
    top = targetRect.top - panelRect.height - offset;
  }

  top = Math.max(viewportPadding, top);

  panelStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  };
}

function handleClickOutside(event: MouseEvent) {
  if (props.dismissable && isVisible.value && panelRef.value && !panelRef.value.contains(event.target as Node)) {
    if (targetElement && targetElement.contains(event.target as Node)) {
      return;
    }
    hide();
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

function handleEscape(event: KeyboardEvent) {
  if (props.dismissable && isVisible.value && event.key === "Escape") {
    hide();
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside, true);
  document.addEventListener("keydown", handleEscape);
  window.addEventListener("scroll", handleScroll, true);
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside, true);
  document.removeEventListener("keydown", handleEscape);
  window.removeEventListener("scroll", handleScroll, true);
  window.removeEventListener("resize", handleResize);
});

// Expose methods for external control
defineExpose({
  show,
  hide,
  toggle,
});
</script>
