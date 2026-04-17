<template>
  <nav v-rough class="menubar" :class="additionalClasses" role="menubar" aria-label="Menu">
    <ul class="menubar__list">
      <template v-for="(item, index) in model" :key="item.key || index">
        <!-- Separator -->
        <li v-if="item.separator" class="menubar__separator" role="separator"></li>

        <!-- Menu item -->
        <li
          v-else
          class="menubar__item"
          :class="{
            'menubar__item--active': activeItem === index,
            'menubar__item--disabled': item.disabled,
            'menubar__item--has-submenu': item.items && item.items.length > 0
          }"
          role="none"
          @mouseenter="onItemMouseEnter(index, item)"
          @mouseleave="onItemMouseLeave"
        >
          <a
            v-if="item.url"
            :href="item.url"
            :target="item.target"
            class="menubar__link"
            role="menuitem"
            :tabindex="item.disabled ? -1 : 0"
            :aria-disabled="item.disabled || undefined"
            :aria-haspopup="item.items && item.items.length > 0 ? 'true' : undefined"
            :aria-expanded="item.items && item.items.length > 0 ? activeItem === index : undefined"
            @click="onItemClick($event, item)"
            @keydown="onItemKeydown($event, index, item)"
          >
            <i v-if="item.icon" :class="item.icon" class="menubar__icon"></i>
            <span class="menubar__label">{{ item.label }}</span>
            <svg
              v-if="item.items && item.items.length > 0"
              class="menubar__submenu-icon"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M4 6L8 10L12 6"
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
            class="menubar__link"
            role="menuitem"
            :tabindex="item.disabled ? -1 : 0"
            :disabled="item.disabled"
            :aria-haspopup="item.items && item.items.length > 0 ? 'true' : undefined"
            :aria-expanded="item.items && item.items.length > 0 ? activeItem === index : undefined"
            @click="onItemClick($event, item)"
            @keydown="onItemKeydown($event, index, item)"
          >
            <i v-if="item.icon" :class="item.icon" class="menubar__icon"></i>
            <span class="menubar__label">{{ item.label }}</span>
            <svg
              v-if="item.items && item.items.length > 0"
              class="menubar__submenu-icon"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
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

          <!-- Submenu -->
          <ul
            v-if="item.items && item.items.length > 0"
            class="menubar__submenu"
            :class="{ 'menubar__submenu--visible': activeItem === index }"
            role="menu"
          >
            <template v-for="(subitem, subindex) in item.items" :key="subitem.key || subindex">
              <li v-if="subitem.separator" class="menubar__separator" role="separator"></li>
              <li
                v-else
                class="menubar__submenu-item"
                :class="{
                  'menubar__submenu-item--disabled': subitem.disabled,
                  'menubar__submenu-item--has-submenu': subitem.items && subitem.items.length > 0
                }"
                role="none"
                @mouseenter="onSubitemMouseEnter(subindex, subitem)"
                @mouseleave="onSubitemMouseLeave"
              >
                <a
                  v-if="subitem.url"
                  :href="subitem.url"
                  :target="subitem.target"
                  class="menubar__submenu-link"
                  role="menuitem"
                  :tabindex="subitem.disabled ? -1 : 0"
                  :aria-disabled="subitem.disabled || undefined"
                  @click="onItemClick($event, subitem)"
                >
                  <i v-if="subitem.icon" :class="subitem.icon" class="menubar__icon"></i>
                  <span class="menubar__label">{{ subitem.label }}</span>
                  <svg
                    v-if="subitem.items && subitem.items.length > 0"
                    class="menubar__chevron-right"
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
                  class="menubar__submenu-link"
                  role="menuitem"
                  :tabindex="subitem.disabled ? -1 : 0"
                  :disabled="subitem.disabled"
                  @click="onItemClick($event, subitem)"
                >
                  <i v-if="subitem.icon" :class="subitem.icon" class="menubar__icon"></i>
                  <span class="menubar__label">{{ subitem.label }}</span>
                  <svg
                    v-if="subitem.items && subitem.items.length > 0"
                    class="menubar__chevron-right"
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

                <!-- Nested submenu (flyout) -->
                <ul
                  v-if="subitem.items && subitem.items.length > 0"
                  class="menubar__submenu menubar__submenu--nested"
                  :class="{ 'menubar__submenu--visible': activeSubitem === subindex }"
                  role="menu"
                >
                  <template v-for="(nestedItem, nestedIndex) in subitem.items" :key="nestedItem.key || nestedIndex">
                    <li v-if="nestedItem.separator" class="menubar__separator" role="separator"></li>
                    <li
                      v-else
                      class="menubar__submenu-item"
                      :class="{ 'menubar__submenu-item--disabled': nestedItem.disabled }"
                      role="none"
                    >
                      <a
                        v-if="nestedItem.url"
                        :href="nestedItem.url"
                        :target="nestedItem.target"
                        class="menubar__submenu-link"
                        role="menuitem"
                        :tabindex="nestedItem.disabled ? -1 : 0"
                        :aria-disabled="nestedItem.disabled || undefined"
                        @click="onItemClick($event, nestedItem)"
                      >
                        <i v-if="nestedItem.icon" :class="nestedItem.icon" class="menubar__icon"></i>
                        <span class="menubar__label">{{ nestedItem.label }}</span>
                      </a>
                      <button
                        v-else
                        type="button"
                        class="menubar__submenu-link"
                        role="menuitem"
                        :tabindex="nestedItem.disabled ? -1 : 0"
                        :disabled="nestedItem.disabled"
                        @click="onItemClick($event, nestedItem)"
                      >
                        <i v-if="nestedItem.icon" :class="nestedItem.icon" class="menubar__icon"></i>
                        <span class="menubar__label">{{ nestedItem.label }}</span>
                      </button>
                    </li>
                  </template>
                </ul>
              </li>
            </template>
          </ul>
        </li>
      </template>
    </ul>
  </nav>
</template>

<style src="./MenuBar.scss"></style>

<script setup lang="ts">
import type { MenuBarProps, MenuBarEmits } from '../../types';
import { ref, computed } from "vue";

defineOptions({ name: 'MenuBar' });

const props = withDefaults(defineProps<MenuBarProps>(), {
  model: () => [],
});

const emit = defineEmits(["item-click"]);

const activeItem = ref(null);
const activeSubitem = ref(null);

const additionalClasses = computed(() => [].filter(Boolean).join(" "));

const onItemMouseEnter = (index: any, item: any) => {
  if (!item.disabled && item.items && item.items.length > 0) {
    activeItem.value = index;
  }
};

const onItemMouseLeave = () => {
  // Delay to allow moving to submenu
  setTimeout(() => {
    activeItem.value = null;
    activeSubitem.value = null;
  }, 100);
};

const onSubitemMouseEnter = (index: any, item: any) => {
  if (!item.disabled && item.items && item.items.length > 0) {
    activeSubitem.value = index;
  }
};

const onSubitemMouseLeave = () => {
  // Keep submenu open when hovering
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

  // Close submenus after click
  if (!item.items || item.items.length === 0) {
    activeItem.value = null;
    activeSubitem.value = null;
  }
};

const onItemKeydown = (event: KeyboardEvent, index: any, item: any) => {
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      if (item.items && item.items.length > 0) {
        activeItem.value = index;
      }
      break;
    case "ArrowRight":
      event.preventDefault();
      // Move to next item
      break;
    case "ArrowLeft":
      event.preventDefault();
      // Move to previous item
      break;
    case "Escape":
      activeItem.value = null;
      activeSubitem.value = null;
      break;
    case "Enter":
    case " ":
      if (item.items && item.items.length > 0) {
        event.preventDefault();
        activeItem.value = activeItem.value === index ? null : index;
      }
      break;
  }
};
</script>
