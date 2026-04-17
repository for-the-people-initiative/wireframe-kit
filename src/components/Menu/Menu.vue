<template>
  <div
    v-if="!popup || isVisible"
    v-rough
    ref="menuRef"
    class="menu"
    :class="additionalClasses"
    role="menu"
    :style="popupStyle"
  >
    <ul class="menu__list">
      <template v-for="(item, index) in model" :key="index">
        <!-- Separator -->
        <li v-if="item.separator" class="menu__separator" role="separator"></li>

        <!-- Menu Item -->
        <li
          v-else
          class="menu__item"
          :class="{
            'menu__item--disabled': item.disabled,
          }"
          role="menuitem"
          :aria-disabled="item.disabled || undefined"
          tabindex="0"
          @click="onItemClick($event, item)"
          @keydown.enter="onItemClick($event, item)"
          @keydown.space.prevent="onItemClick($event, item)"
        >
          <i
            v-if="item.icon"
            :class="item.icon"
            class="menu__item-icon"
            aria-hidden="true"
          ></i>
          <span class="menu__item-label">{{ item.label }}</span>
        </li>
      </template>
    </ul>
  </div>
</template>

<style src="./Menu.scss"></style>

<script setup lang="ts">
import type { MenuProps, MenuEmits } from '../../types';
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";

defineOptions({ name: 'Menu' });

const props = withDefaults(defineProps<MenuProps>(), {
  model: () => [],
  popup: false,
});

const emit = defineEmits(["item-click", "show", "hide"]);

const menuRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);
const triggerElement = ref<HTMLElement | null>(null);
const position = ref({ top: 0, left: 0 });
const initialScrollY = ref(0);

const additionalClasses = computed(() =>
  [props.popup && "menu--popup", isVisible.value && "menu--visible"]
    .filter(Boolean)
    .join(" ")
);

const popupStyle = computed(() => {
  if (!props.popup) return {};
  return {
    top: `${position.value.top}px`,
    left: `${position.value.left}px`,
  };
});

const onItemClick = (event: MouseEvent | KeyboardEvent, item: any) => {
  if (item.disabled) return;

  emit("item-click", {
    originalEvent: event,
    item,
  });

  if (typeof item.command === "function") {
    item.command({
      originalEvent: event,
      item,
    });
  }

  if (props.popup) {
    hide();
  }
};

const show = (event: any) => {
  if (!props.popup) return;

  triggerElement.value = event.currentTarget || event.target;
  initialScrollY.value = window.scrollY;
  calculatePosition(event);
  isVisible.value = true;
  emit("show");

  nextTick(() => {
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onDocumentKeydown);
    window.addEventListener("scroll", onWindowScroll, true);
  });
};

const hide = () => {
  if (!props.popup) return;

  isVisible.value = false;
  emit("hide");

  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onDocumentKeydown);
  window.removeEventListener("scroll", onWindowScroll, true);
};

const toggle = (event: Event) => {
  if (isVisible.value) {
    hide();
  } else {
    show(event);
  }
};

const calculatePosition = (event: any) => {
  const triggerRect = event.currentTarget?.getBoundingClientRect() || {
    top: event.clientY ?? 0,
    bottom: event.clientY ?? 0,
    left: event.clientX ?? 0,
    right: event.clientX ?? 0,
  };

  const padding = 8;
  const gap = 4;

  // Initial position: below trigger, left-aligned
  let top = triggerRect.bottom + gap;
  let left = triggerRect.left;

  position.value = { top, left };

  // Refine position after menu renders
  nextTick(() => {
    if (!menuRef.value) return;

    const menuRect = menuRef.value.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Vertical positioning: prefer below, fall back to above
    const spaceBelow = viewportHeight - triggerRect.bottom - padding;
    const spaceAbove = triggerRect.top - padding;

    if (menuRect.height <= spaceBelow) {
      top = triggerRect.bottom + gap;
    } else if (menuRect.height <= spaceAbove) {
      top = triggerRect.top - menuRect.height - gap;
    } else {
      // Clamp to viewport
      top = Math.max(padding, Math.min(triggerRect.bottom + gap, viewportHeight - menuRect.height - padding));
    }

    // Horizontal positioning: prefer left-aligned, fall back to right-aligned
    const spaceRight = viewportWidth - triggerRect.left - padding;
    const spaceLeft = triggerRect.right - padding;

    if (menuRect.width <= spaceRight) {
      left = triggerRect.left;
    } else if (menuRect.width <= spaceLeft) {
      left = triggerRect.right - menuRect.width;
    } else {
      // Clamp to viewport
      left = Math.max(padding, Math.min(triggerRect.left, viewportWidth - menuRect.width - padding));
    }

    position.value = { top, left };
  });
};

const onDocumentClick = (event: MouseEvent) => {
  if (
    menuRef.value &&
    !menuRef.value.contains(event.target as Node) &&
    triggerElement.value !== event.target &&
    !triggerElement.value?.contains(event.target as Node)
  ) {
    hide();
  }
};

const onDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    hide();
  }
};

const onWindowScroll = () => {
  if (Math.abs(window.scrollY - initialScrollY.value) > 15) {
    hide();
  }
};

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onDocumentKeydown);
  window.removeEventListener("scroll", onWindowScroll, true);
});

defineExpose({
  show,
  hide,
  toggle,
});
</script>
