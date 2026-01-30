<template>
  <div
    v-if="!popup || visible"
    ref="menuRef"
    class="tieredmenu"
    :class="additionalClasses"
    role="menu"
    tabindex="-1"
    @keydown="onKeydown"
  >
    <ul class="tieredmenu__list">
      <template v-for="(item, index) in model" :key="item.key || index">
        <!-- Separator -->
        <li v-if="item.separator" class="tieredmenu__separator" role="separator"></li>

        <!-- Menu Item -->
        <li
          v-else
          class="tieredmenu__item"
          :class="{
            'tieredmenu__item--active': item.active,
            'tieredmenu__item--disabled': item.disabled,
            'tieredmenu__item--has-submenu': item.items && item.items.length > 0,
            'tieredmenu__item--submenu-open': activeSubmenu === index
          }"
          role="none"
          @mouseenter="onItemMouseEnter(index, item)"
          @mouseleave="onItemMouseLeave"
        >
          <a
            v-if="item.url"
            :href="item.url"
            :target="item.target"
            class="tieredmenu__link"
            role="menuitem"
            :tabindex="item.disabled ? -1 : 0"
            :aria-disabled="item.disabled || undefined"
            :aria-haspopup="item.items && item.items.length > 0 ? 'true' : undefined"
            :aria-expanded="item.items && item.items.length > 0 ? activeSubmenu === index : undefined"
            @click="onItemClick($event, item)"
            @keydown="onItemKeydown($event, index, item)"
          >
            <i v-if="item.icon" :class="item.icon" class="tieredmenu__icon"></i>
            <span class="tieredmenu__label">{{ item.label }}</span>
            <svg
              v-if="item.items && item.items.length > 0"
              class="tieredmenu__chevron"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M6 4L10 8L6 12"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </a>
          <button
            v-else
            type="button"
            class="tieredmenu__link"
            role="menuitem"
            :tabindex="item.disabled ? -1 : 0"
            :disabled="item.disabled"
            :aria-haspopup="item.items && item.items.length > 0 ? 'true' : undefined"
            :aria-expanded="item.items && item.items.length > 0 ? activeSubmenu === index : undefined"
            @click="onItemClick($event, item)"
            @keydown="onItemKeydown($event, index, item)"
          >
            <i v-if="item.icon" :class="item.icon" class="tieredmenu__icon"></i>
            <span class="tieredmenu__label">{{ item.label }}</span>
            <svg
              v-if="item.items && item.items.length > 0"
              class="tieredmenu__chevron"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M6 4L10 8L6 12"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <!-- Submenu -->
          <ul
            v-if="item.items && item.items.length > 0"
            class="tieredmenu__submenu"
            :class="{ 'tieredmenu__submenu--visible': activeSubmenu === index }"
            role="menu"
          >
            <TieredMenuSub
              :items="item.items"
              @item-click="onSubitemClick"
            />
          </ul>
        </li>
      </template>
    </ul>
  </div>
</template>

<style src="./TieredMenu.scss"></style>

<script setup lang="ts">
import type { TieredMenuProps, TieredMenuEmits } from '../../types';
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import TieredMenuSub from "./TieredMenuSub.vue";

defineOptions({ name: 'FtpTieredMenu' });

const props = withDefaults(defineProps<TieredMenuProps>(), {
  model: () => [],
  popup: false,
});

const emit = defineEmits(["item-click", "show", "hide"]);

const menuRef = ref<HTMLElement | null>(null);
const visible = ref(!props.popup);
const activeSubmenu = ref(null);

const additionalClasses = computed(() =>
  [props.popup && "tieredmenu--popup"].filter(Boolean).join(" ")
);

const show = (event: any) => {
  if (props.popup) {
    visible.value = true;
    emit("show", event);

    // Position the menu near the click/target
    if (event && menuRef.value) {
      const target = event.currentTarget || event.target;
      if (target) {
        const rect = target.getBoundingClientRect();
        menuRef.value.style.top = `${rect.bottom + window.scrollY}px`;
        menuRef.value.style.left = `${rect.left + window.scrollX}px`;
      }
    }
  }
};

const hide = () => {
  if (props.popup) {
    visible.value = false;
    activeSubmenu.value = null;
    emit("hide");
  }
};

const toggle = (event: Event) => {
  if (visible.value) {
    hide();
  } else {
    show(event);
  }
};

// Handle click outside
const onClickOutside = (event: MouseEvent) => {
  if (props.popup && visible.value && menuRef.value && !menuRef.value.contains(event.target as Node)) {
    hide();
  }
};

onMounted(() => {
  if (props.popup) {
    document.addEventListener("click", onClickOutside);
  }
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
});

const onItemMouseEnter = (index: any, item: any) => {
  if (!item.disabled && item.items && item.items.length > 0) {
    activeSubmenu.value = index;
  }
};

const onItemMouseLeave = () => {
  // Delay to allow moving to submenu
};

const onItemClick = (event: MouseEvent, item: any) => {
  if (item.disabled) {
    event.preventDefault();
    return;
  }

  if (item.command) {
    item.command({ originalEvent: event, item });
  }

  emit("item-click", { originalEvent: event, item });

  // Close menu after click if no submenu
  if (!item.items || item.items.length === 0) {
    if (props.popup) {
      hide();
    }
  }
};

const onSubitemClick = ({ originalEvent, item }: { originalEvent: any; item: any }) => {
  emit("item-click", { originalEvent, item });

  if (props.popup) {
    hide();
  }
};

const onItemKeydown = (event: KeyboardEvent, index: any, item: any) => {
  switch (event.key) {
    case "ArrowRight":
      event.preventDefault();
      if (item.items && item.items.length > 0) {
        activeSubmenu.value = index;
      }
      break;
    case "ArrowLeft":
      event.preventDefault();
      activeSubmenu.value = null;
      break;
    case "ArrowDown":
      event.preventDefault();
      // Focus next item
      break;
    case "ArrowUp":
      event.preventDefault();
      // Focus previous item
      break;
    case "Escape":
      event.preventDefault();
      if (activeSubmenu.value !== null) {
        activeSubmenu.value = null;
      } else if (props.popup) {
        hide();
      }
      break;
    case "Enter":
    case " ":
      if (item.items && item.items.length > 0) {
        event.preventDefault();
        activeSubmenu.value = activeSubmenu.value === index ? null : index;
      }
      break;
  }
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && props.popup) {
    hide();
  }
};

// Expose methods for parent components
defineExpose({ show, hide, toggle });
</script>
