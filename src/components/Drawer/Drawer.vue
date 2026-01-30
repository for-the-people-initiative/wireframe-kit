<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div
        v-if="visible"
        class="drawer__overlay"
        @click="onOverlayClick"
        @keydown.escape="onEscapeKey"
      >
        <Transition :name="transitionName">
          <div
            v-if="visible"
            ref="drawerRef"
            class="drawer"
            :class="additionalClasses"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="headerId"
            @click.stop
          >
            <div v-if="$slots.header || header || closable" class="drawer__header">
              <slot name="header">
                <span :id="headerId" class="drawer__title">{{ header }}</span>
              </slot>
              <button
                v-if="closable"
                type="button"
                class="drawer__close"
                aria-label="Close"
                @click="close"
              >
                <svg
                  class="drawer__close-icon"
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

            <div class="drawer__content">
              <slot />
            </div>

            <div v-if="$slots.footer" class="drawer__footer">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style src="./Drawer.scss"></style>

<script setup lang="ts">
import type { DrawerProps, DrawerEmits } from '../../types';
import { computed, ref, watch, onUnmounted } from "vue";

defineOptions({ name: 'FtpDrawer' });

const props = withDefaults(defineProps<DrawerProps>(), {
  visible: false,
  header: "",
  position: "right",
  size: "md",
  closable: true,
  dismissable: true,
  closeOnEscape: true,
  blockScroll: true,
});

const emit = defineEmits(["update:visible", "show", "hide"]);

const drawerRef = ref(null);
const headerId = `drawer-header-${Math.random().toString(36).substr(2, 9)}`;

const additionalClasses = computed(() =>
  [
    `drawer--position-${props.position}`,
    `drawer--size-${props.size}`,
  ]
    .filter(Boolean)
    .join(" ")
);

const transitionName = computed(() => {
  return `drawer-slide-${props.position}`;
});

const close = () => {
  emit("update:visible", false);
  emit("hide");
};

const onOverlayClick = () => {
  if (props.dismissable) {
    close();
  }
};

const onEscapeKey = (event: KeyboardEvent) => {
  if (props.closeOnEscape && props.visible) {
    event.preventDefault();
    close();
  }
};

// Block scroll when drawer is open
watch(
  () => props.visible,
  (newValue) => {
    if (newValue) {
      emit("show");
      if (props.blockScroll) {
        document.body.style.overflow = "hidden";
      }
    } else {
      if (props.blockScroll) {
        document.body.style.overflow = "";
      }
    }
  }
);

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = "";
});
</script>
