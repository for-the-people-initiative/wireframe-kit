<template>
  <div
    class="tooltip-wrapper"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @focus="onFocus"
    @blur="onBlur"
  >
    <slot />
    <Teleport to="body">
      <Transition name="tooltip-fade">
        <div
          v-if="isVisible"
          ref="tooltipRef"
          class="tooltip"
          :class="positionClass"
          :style="tooltipStyle"
          role="tooltip"
        >
          <span class="tooltip__content">{{ content }}</span>
          <span class="tooltip__arrow" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style src="./Tooltip.scss"></style>

<script setup lang="ts">
import type { TooltipProps } from '../../types';
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";

defineOptions({ name: 'Tooltip' });

const props = withDefaults(defineProps<TooltipProps>(), {
  position: "top",
  showDelay: 0,
  hideDelay: 0,
  disabled: false,
});

const isVisible = ref(false);
const tooltipRef = ref<HTMLElement | null>(null);
const tooltipStyle = ref({});
let showTimeoutId: ReturnType<typeof setTimeout> | null = null;
let hideTimeoutId: ReturnType<typeof setTimeout> | null = null;
let triggerElement: HTMLElement | null = null;

const positionClass = computed(() => `tooltip--${props.position}`);

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
  triggerElement = event.currentTarget as HTMLElement;

  if (props.showDelay > 0) {
    showTimeoutId = setTimeout(() => {
      isVisible.value = true;
      nextTick(updatePosition);
    }, props.showDelay);
  } else {
    isVisible.value = true;
    nextTick(updatePosition);
  }
}

function hide() {
  clearTimeouts();

  if (props.hideDelay > 0) {
    hideTimeoutId = setTimeout(() => {
      isVisible.value = false;
    }, props.hideDelay);
  } else {
    isVisible.value = false;
  }
}

function updatePosition() {
  if (!triggerElement || !tooltipRef.value) return;

  const triggerRect = triggerElement.getBoundingClientRect();
  const tooltipRect = tooltipRef.value.getBoundingClientRect();
  const offset = 8; // Matches tooltip.offset token

  let top, left;

  switch (props.position) {
    case "top":
      top = triggerRect.top - tooltipRect.height - offset;
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      break;
    case "bottom":
      top = triggerRect.bottom + offset;
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      break;
    case "left":
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      left = triggerRect.left - tooltipRect.width - offset;
      break;
    case "right":
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      left = triggerRect.right + offset;
      break;
  }

  // Keep tooltip within viewport
  const viewportPadding = 8;
  left = Math.max(viewportPadding, Math.min(left, window.innerWidth - tooltipRect.width - viewportPadding));
  top = Math.max(viewportPadding, Math.min(top, window.innerHeight - tooltipRect.height - viewportPadding));

  tooltipStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  };
}

function onMouseEnter(event: MouseEvent) {
  show(event);
}

function onMouseLeave() {
  hide();
}

function onFocus(event: FocusEvent) {
  show(event);
}

function onBlur() {
  hide();
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
  window.addEventListener("scroll", handleScroll, true);
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  clearTimeouts();
  window.removeEventListener("scroll", handleScroll, true);
  window.removeEventListener("resize", handleResize);
});
</script>
