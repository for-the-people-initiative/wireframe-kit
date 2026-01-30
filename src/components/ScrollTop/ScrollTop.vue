<template>
  <Teleport to="body">
    <Transition name="scroll-top-fade">
      <button
        v-show="isVisible"
        class="scroll-top"
        :class="additionalClasses"
        type="button"
        aria-label="Scroll to top"
        @click="scrollToTop"
      >
        <slot>
          <svg
            class="scroll-top__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </slot>
      </button>
    </Transition>
  </Teleport>
</template>

<style src="./ScrollTop.scss"></style>

<script setup lang="ts">
import type { ScrollTopProps, ScrollTopEmits } from '../../types';
import { ref, onMounted, onUnmounted, computed } from "vue";

defineOptions({ name: 'FtpScrollTop' });

const props = withDefaults(defineProps<ScrollTopProps>(), {
  threshold: 400,
  behavior: "smooth",
  target: "window",
});

const emit = defineEmits(["click"]);

const isVisible = ref(false);
let scrollTarget: HTMLElement | Window | null = null;

function getScrollTop() {
  if (props.target === "window") {
    return window.scrollY || document.documentElement.scrollTop;
  }
  return (scrollTarget as HTMLElement)?.scrollTop || 0;
}

function handleScroll() {
  isVisible.value = getScrollTop() > props.threshold;
}

function scrollToTop() {
  emit("click");

  if (props.target === "window") {
    window.scrollTo({
      top: 0,
      behavior: props.behavior,
    });
  } else if (scrollTarget) {
    scrollTarget.scrollTo({
      top: 0,
      behavior: props.behavior,
    });
  }
}

onMounted(() => {
  if (props.target === "window") {
    scrollTarget = window;
    window.addEventListener("scroll", handleScroll, { passive: true });
  } else {
    scrollTarget = document.querySelector(props.target) as HTMLElement | null;
    if (scrollTarget) {
      scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    }
  }
  handleScroll();
});

onUnmounted(() => {
  if (props.target === "window") {
    window.removeEventListener("scroll", handleScroll);
  } else if (scrollTarget) {
    scrollTarget.removeEventListener("scroll", handleScroll);
  }
});

const additionalClasses = computed(() => [].filter(Boolean).join(" "));
</script>
