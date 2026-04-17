<template>
  <div
    class="popover-wrapper"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="onClick"
    @focus="onFocus"
    @blur="onBlur"
  >
    <slot name="trigger" />
    <Teleport to="body">
      <Transition name="popover-fade">
        <div
          v-if="isVisible"
          v-rough
          ref="popoverRef"
          class="popover"
          :class="positionClass"
          :style="popoverStyle"
          role="tooltip"
          @mouseenter="onPopoverMouseEnter"
          @mouseleave="onPopoverMouseLeave"
        >
          <div class="popover__content">
            <slot />
          </div>
          <span class="popover__arrow" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style src="./PopOver.scss"></style>

<script setup lang="ts">
import type { PopOverProps, PopOverEmits } from '../../types';
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";

defineOptions({ name: 'PopOver' });

const props = withDefaults(defineProps<PopOverProps>(), {
  trigger: "hover",
  position: "top",
  showDelay: 0,
  hideDelay: 0,
  disabled: false,
});

const emit = defineEmits(["update:visible", "show", "hide"]);

const internalVisible = ref(false);
const popoverRef = ref<HTMLElement | null>(null);
const popoverStyle = ref({});
const isOverPopover = ref(false);
let showTimeoutId: ReturnType<typeof setTimeout> | null = null;
let hideTimeoutId: ReturnType<typeof setTimeout> | null = null;
let triggerElement: HTMLElement | null = null;

// Support both controlled (v-model) and uncontrolled modes
const isVisible = computed(() => {
  return props.visible !== undefined ? props.visible : internalVisible.value;
});

const positionClass = computed(() => `popover--${props.position}`);

function clearTimeouts() {
  if (showTimeoutId) {
    clearTimeout(showTimeoutId);
    showTimeoutId = null;
  }
  if (hideTimeoutId) {
    clearTimeout(hideTimeoutId);
    hideTimeoutId = null;
  }
}

function show(event: Event) {
  if (props.disabled) return;

  clearTimeouts();
  if (event?.currentTarget) {
    triggerElement = event.currentTarget as HTMLElement;
  }

  const doShow = () => {
    if (props.visible !== undefined) {
      emit("update:visible", true);
    } else {
      internalVisible.value = true;
    }
    emit("show");
    nextTick(updatePosition);
  };

  if (props.showDelay > 0) {
    showTimeoutId = setTimeout(doShow, props.showDelay);
  } else {
    doShow();
  }
}

function hide() {
  clearTimeouts();

  const doHide = () => {
    if (isOverPopover.value) return;

    if (props.visible !== undefined) {
      emit("update:visible", false);
    } else {
      internalVisible.value = false;
    }
    emit("hide");
  };

  if (props.hideDelay > 0) {
    hideTimeoutId = setTimeout(doHide, props.hideDelay);
  } else {
    doHide();
  }
}

function toggle(event: Event) {
  if (isVisible.value) {
    hide();
  } else {
    show(event);
  }
}

function updatePosition() {
  if (!triggerElement || !popoverRef.value) return;

  const triggerRect = triggerElement.getBoundingClientRect();
  const popoverRect = popoverRef.value.getBoundingClientRect();
  const offset = 10; // Matches popover.offset token

  let top, left;

  switch (props.position) {
    case "top":
      top = triggerRect.top - popoverRect.height - offset;
      left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
      break;
    case "bottom":
      top = triggerRect.bottom + offset;
      left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
      break;
    case "left":
      top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
      left = triggerRect.left - popoverRect.width - offset;
      break;
    case "right":
      top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
      left = triggerRect.right + offset;
      break;
  }

  // Keep popover within viewport
  const viewportPadding = 8;
  left = Math.max(viewportPadding, Math.min(left, window.innerWidth - popoverRect.width - viewportPadding));
  top = Math.max(viewportPadding, Math.min(top, window.innerHeight - popoverRect.height - viewportPadding));

  popoverStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  };
}

function onMouseEnter(event: MouseEvent) {
  if (props.trigger === "hover") {
    show(event);
  }
}

function onMouseLeave() {
  if (props.trigger === "hover") {
    hide();
  }
}

function onPopoverMouseEnter() {
  if (props.trigger === "hover") {
    isOverPopover.value = true;
    clearTimeouts();
  }
}

function onPopoverMouseLeave() {
  if (props.trigger === "hover") {
    isOverPopover.value = false;
    hide();
  }
}

function onClick(event: MouseEvent) {
  if (props.trigger === "click") {
    toggle(event);
  }
}

function onFocus(event: FocusEvent) {
  if (props.trigger === "hover") {
    show(event);
  }
}

function onBlur() {
  if (props.trigger === "hover") {
    hide();
  }
}

function handleClickOutside(event: MouseEvent) {
  if (props.trigger === "click" && isVisible.value && popoverRef.value && !popoverRef.value.contains(event.target as Node)) {
    if (triggerElement && triggerElement.contains(event.target as Node)) {
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

onMounted(() => {
  document.addEventListener("click", handleClickOutside, true);
  window.addEventListener("scroll", handleScroll, true);
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  clearTimeouts();
  document.removeEventListener("click", handleClickOutside, true);
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
