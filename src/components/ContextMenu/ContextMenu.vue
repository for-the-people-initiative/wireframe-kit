<template>
  <Teleport to="body">
    <Transition name="context-menu-fade">
      <div
        v-if="isVisible"
        v-rough
        ref="menuRef"
        class="context-menu"
        :class="menuClasses"
        :style="menuStyle"
        role="menu"
        @contextmenu.prevent
      >
        <!-- Arrow indicator for popup mode -->
        <div
          v-if="showArrow"
          class="context-menu__pointer"
          :style="arrowStyle"
        ></div>

        <ul class="context-menu__list">
          <template v-for="(item, index) in model" :key="item.key || index">
            <li v-if="item.separator" class="context-menu__separator" role="separator" />
            <li
              v-else
              class="context-menu__item"
              :class="{
                'context-menu__item--disabled': item.disabled,
                'context-menu__item--has-submenu': item.items?.length
              }"
              role="menuitem"
              :aria-disabled="item.disabled"
              tabindex="0"
              @click="onItemClick(item, $event)"
              @keydown.enter="onItemClick(item, $event)"
              @keydown.space.prevent="onItemClick(item, $event)"
              @mouseenter="onItemMouseEnter(item, $event)"
              @mouseleave="onItemMouseLeave"
            >
              <span v-if="item.icon" class="context-menu__icon">
                <component :is="item.icon" v-if="typeof item.icon === 'object'" />
                <i v-else-if="typeof item.icon === 'string'" :class="item.icon" aria-hidden="true" />
              </span>
              <span class="context-menu__label">{{ item.label }}</span>
              <span v-if="item.shortcut" class="context-menu__shortcut">{{ item.shortcut }}</span>
              <span v-if="item.items?.length" class="context-menu__arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>

              <!-- Submenu -->
              <Transition name="context-menu-fade">
                <ul
                  v-if="item.items?.length && activeSubmenu === item"
                  class="context-menu__submenu"
                  role="menu"
                >
                  <template v-for="(subItem, subIndex) in item.items" :key="subItem.key || subIndex">
                    <li v-if="subItem.separator" class="context-menu__separator" role="separator" />
                    <li
                      v-else
                      class="context-menu__item"
                      :class="{ 'context-menu__item--disabled': subItem.disabled }"
                      role="menuitem"
                      :aria-disabled="subItem.disabled"
                      tabindex="0"
                      @click="onItemClick(subItem, $event)"
                      @keydown.enter="onItemClick(subItem, $event)"
                      @keydown.space.prevent="onItemClick(subItem, $event)"
                    >
                      <span v-if="subItem.icon" class="context-menu__icon">
                        <component :is="subItem.icon" v-if="typeof subItem.icon === 'object'" />
                        <i v-else-if="typeof subItem.icon === 'string'" :class="subItem.icon" aria-hidden="true" />
                      </span>
                      <span class="context-menu__label">{{ subItem.label }}</span>
                      <span v-if="subItem.shortcut" class="context-menu__shortcut">{{ subItem.shortcut }}</span>
                    </li>
                  </template>
                </ul>
              </Transition>
            </li>
          </template>
        </ul>
      </div>
    </Transition>
  </Teleport>
</template>

<style src="./ContextMenu.scss"></style>

<script setup lang="ts">
import type { ContextMenuProps, ContextMenuEmits } from '../../types';
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";

defineOptions({ name: 'ContextMenu' });

const props = withDefaults(defineProps<ContextMenuProps>(), {
  model: () => [],
  global: false,
  popup: false,
  showArrow: false,
  highlightTrigger: false,
  appendTo: "body",
});

const emit = defineEmits(["show", "hide", "item-click"]);

const isVisible = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const position = ref({ x: 0, y: 0 });
const placement = ref("below");
const arrowOffset = ref(0);
const activeSubmenu = ref<any>(null);
const triggerElement = ref<HTMLElement | null>(null);
const initialScrollY = ref(0);
let submenuTimeout: ReturnType<typeof setTimeout> | null = null;

const menuClasses = computed(() => [
  props.popup && "context-menu--popup",
  props.showArrow && `context-menu--${placement.value}`,
].filter(Boolean).join(" "));

const menuStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
}));

const arrowStyle = computed(() => ({
  left: `${arrowOffset.value}px`,
}));

function show(event: any) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  triggerElement.value = event?.currentTarget || event?.target || null;
  initialScrollY.value = window.scrollY;

  // Add trigger highlight class
  if (props.highlightTrigger && triggerElement.value) {
    triggerElement.value.classList.add("context-menu-trigger--active");
  }

  if (props.popup && triggerElement.value) {
    // Popup mode: position relative to trigger element
    calculatePopupPosition(event);
  } else {
    // Context menu mode: position at cursor
    position.value = {
      x: event?.clientX || 0,
      y: event?.clientY || 0,
    };
  }

  isVisible.value = true;
  emit("show", event);

  nextTick(() => {
    if (!props.popup) {
      adjustPosition();
    }
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onEscapeKey);
    if (props.popup) {
      window.addEventListener("scroll", onWindowScroll, true);
    }
  });
}

function hide() {
  // Remove trigger highlight class
  if (props.highlightTrigger && triggerElement.value) {
    triggerElement.value.classList.remove("context-menu-trigger--active");
  }

  isVisible.value = false;
  activeSubmenu.value = null;
  emit("hide");

  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onEscapeKey);
  window.removeEventListener("scroll", onWindowScroll, true);
}

function toggle(event: Event) {
  if (isVisible.value) {
    hide();
  } else {
    show(event);
  }
}

function calculatePopupPosition(event: any) {
  const target = event?.currentTarget || event?.target;
  const triggerRect = target?.getBoundingClientRect() || {
    top: event?.clientY || 0,
    bottom: event?.clientY || 0,
    left: event?.clientX || 0,
    right: event?.clientX || 0,
  };

  const padding = 8;
  const gap = 14;

  // Initial position: below trigger
  position.value = {
    x: triggerRect.left,
    y: triggerRect.bottom + gap,
  };

  // Refine position after menu renders
  nextTick(() => {
    if (!menuRef.value) return;

    const menuRect = menuRef.value.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.value.x;
    let y = position.value.y;

    // Vertical positioning: prefer below, fall back to above
    const spaceBelow = viewportHeight - triggerRect.bottom - padding;
    const spaceAbove = triggerRect.top - padding;

    if (menuRect.height <= spaceBelow) {
      y = triggerRect.bottom + gap;
      placement.value = "below";
    } else if (menuRect.height <= spaceAbove) {
      y = triggerRect.top - menuRect.height - gap;
      placement.value = "above";
    } else {
      // Clamp to viewport
      y = Math.max(
        padding,
        Math.min(triggerRect.bottom + gap, viewportHeight - menuRect.height - padding)
      );
      placement.value = "below";
    }

    // Horizontal positioning: prefer left-aligned, fall back to right-aligned
    const spaceRight = viewportWidth - triggerRect.left - padding;
    const spaceLeft = triggerRect.right - padding;

    if (menuRect.width <= spaceRight) {
      x = triggerRect.left;
    } else if (menuRect.width <= spaceLeft) {
      x = triggerRect.right - menuRect.width;
    } else {
      // Clamp to viewport
      x = Math.max(
        padding,
        Math.min(triggerRect.left, viewportWidth - menuRect.width - padding)
      );
    }

    // Calculate arrow offset (center of trigger relative to menu left edge)
    if (props.showArrow) {
      const triggerCenterX = (triggerRect.left + triggerRect.right) / 2;
      arrowOffset.value = Math.max(12, Math.min(triggerCenterX - x, menuRect.width - 12));
    }

    position.value = { x, y };
  });
}

function adjustPosition() {
  if (!menuRef.value) return;

  const rect = menuRef.value.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const padding = 8;

  let x = position.value.x;
  let y = position.value.y;

  if (x + rect.width > viewportWidth - padding) {
    x = viewportWidth - rect.width - padding;
  }

  if (y + rect.height > viewportHeight - padding) {
    y = viewportHeight - rect.height - padding;
  }

  x = Math.max(padding, x);
  y = Math.max(padding, y);

  position.value = { x, y };
}

function onItemClick(item: any, event: any) {
  if (item.disabled) {
    event.stopPropagation();
    return;
  }

  if (item.items?.length) {
    event.stopPropagation();
    return;
  }

  emit("item-click", { originalEvent: event, item });

  if (item.command) {
    item.command({ originalEvent: event, item });
  }

  hide();
}

function onItemMouseEnter(item: any, event: any) {
  clearTimeout(submenuTimeout!);

  if (item.items?.length && !item.disabled) {
    submenuTimeout = setTimeout(() => {
      activeSubmenu.value = item;
    }, 100);
  } else {
    activeSubmenu.value = null;
  }
}

function onItemMouseLeave() {
  clearTimeout(submenuTimeout!);
  submenuTimeout = setTimeout(() => {
    activeSubmenu.value = null;
  }, 200);
}

function onDocumentClick(event: MouseEvent) {
  if (isVisible.value && menuRef.value && !menuRef.value.contains(event.target as Node)) {
    // In popup mode, also check if click is on trigger
    if (props.popup && triggerElement.value) {
      if (triggerElement.value === event.target || triggerElement.value.contains(event.target as Node)) {
        return;
      }
    }
    hide();
  }
}

function onDocumentContextMenu(event: Event) {
  if (props.global) {
    show(event);
  }
}

function onEscapeKey(event: KeyboardEvent) {
  if (event.key === "Escape" && isVisible.value) {
    hide();
  }
}

function onWindowScroll() {
  if (Math.abs(window.scrollY - initialScrollY.value) > 15) {
    hide();
  }
}

onMounted(() => {
  if (props.global) {
    document.addEventListener("contextmenu", onDocumentContextMenu);
  }
});

onUnmounted(() => {
  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onEscapeKey);
  document.removeEventListener("contextmenu", onDocumentContextMenu);
  window.removeEventListener("scroll", onWindowScroll, true);
  clearTimeout(submenuTimeout!);
});

// Expose methods for external use
defineExpose({
  show,
  hide,
  toggle,
});
</script>
