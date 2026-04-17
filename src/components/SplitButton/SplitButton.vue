<template>
  <div
    ref="containerRef"
    class="split-button"
    :class="additionalClasses"
  >
    <button
      v-rough="{ severity: 2 }"
      type="button"
      class="split-button__main"
      :disabled="isDisabled"
      @click="onMainClick"
    >
      <i
        v-if="icon"
        :class="icon"
        class="split-button__icon"
        aria-hidden="true"
      ></i>
      <span v-if="label" class="split-button__label">{{ label }}</span>
    </button>
    <button
      v-rough="{ severity: 2 }"
      type="button"
      class="split-button__dropdown"
      :disabled="isDisabled"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      @click="toggleMenu"
    >
      <svg
        class="split-button__dropdown-icon"
        :class="{ 'split-button__dropdown-icon--open': isOpen }"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 6L8 10L12 6"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        v-rough
        ref="menuRef"
        class="split-button__menu"
        :style="menuStyle"
        role="menu"
      >
        <div
          v-for="(item, index) in model"
          :key="index"
          class="split-button__menu-item"
          role="menuitem"
          :tabindex="0"
          @click="onItemClick(item)"
          @keydown.enter="onItemClick(item)"
        >
          <i
            v-if="item.icon"
            :class="item.icon"
            class="split-button__menu-item-icon"
            aria-hidden="true"
          ></i>
          <span class="split-button__menu-item-label">{{ item.label }}</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style src="./SplitButton.scss"></style>

<script setup lang="ts">
import type { SplitButtonProps, SplitButtonEmits } from '../../types';
import { computed, ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";

defineOptions({ name: 'SplitButton' });

const props = withDefaults(defineProps<SplitButtonProps>(), {
  model: () => [],
  severity: "primary",
  size: "md",
  isDisabled: false,
});

const emit = defineEmits(["click"]);

const containerRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const menuStyle = ref({});

const toggleMenu = () => {
  if (props.isDisabled) return;
  isOpen.value = !isOpen.value;
};

const closeMenu = () => {
  isOpen.value = false;
};

const onMainClick = (event: MouseEvent) => {
  if (props.isDisabled) return;
  emit("click", event);
};

const onItemClick = (item: any) => {
  if (item.command) {
    item.command({ originalEvent: event, item });
  }
  closeMenu();
};

const updateMenuPosition = () => {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  menuStyle.value = {
    position: "fixed",
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    minWidth: `${rect.width}px`,
    zIndex: 1000,
  };
};

const onClickOutside = (event: MouseEvent) => {
  if (
    containerRef.value &&
    !containerRef.value.contains(event.target as Node) &&
    menuRef.value &&
    !menuRef.value.contains(event.target as Node)
  ) {
    closeMenu();
  }
};

watch(isOpen, async (newValue) => {
  if (newValue) {
    updateMenuPosition();
  }
});

onMounted(() => {
  document.addEventListener("click", onClickOutside);
  window.addEventListener("resize", updateMenuPosition);
  window.addEventListener("scroll", updateMenuPosition, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onClickOutside);
  window.removeEventListener("resize", updateMenuPosition);
  window.removeEventListener("scroll", updateMenuPosition, true);
});

const additionalClasses = computed(() =>
  [
    `split-button--size-${props.size}`,
    `split-button--severity-${props.severity}`,
    props.isDisabled && "split-button--disabled",
    isOpen.value && "split-button--open",
  ]
    .filter(Boolean)
    .join(" ")
);
</script>
