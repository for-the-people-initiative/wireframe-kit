<template>
  <div class="panelmenu">
    <div
      v-for="(panel, panelIndex) in model"
      :key="panel.key || panelIndex"
      class="panelmenu__panel"
      :class="{
        'panelmenu__panel--expanded': isExpanded(panelIndex),
        'panelmenu__panel--disabled': panel.disabled
      }"
    >
      <!-- Panel Header -->
      <button
        type="button"
        class="panelmenu__header"
        :disabled="panel.disabled"
        :aria-expanded="isExpanded(panelIndex)"
        :aria-controls="`panelmenu-content-${panelIndex}`"
        @click="togglePanel(panelIndex, panel)"
        @keydown="onHeaderKeydown($event, panelIndex)"
      >
        <i v-if="panel.icon" :class="panel.icon" class="panelmenu__header-icon"></i>
        <span class="panelmenu__header-text">{{ panel.label }}</span>
        <svg
          class="panelmenu__chevron"
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

      <!-- Panel Content -->
      <div
        :id="`panelmenu-content-${panelIndex}`"
        class="panelmenu__content-wrapper"
        role="region"
        :aria-labelledby="`panelmenu-header-${panelIndex}`"
      >
        <div class="panelmenu__content">
          <ul class="panelmenu__list" role="menu">
            <template v-for="(item, itemIndex) in panel.items" :key="item.key || itemIndex">
              <!-- Separator -->
              <li v-if="item.separator" class="panelmenu__separator" role="separator"></li>

              <!-- Menu Item -->
              <li
                v-else
                class="panelmenu__item"
                :class="{
                  'panelmenu__item--active': item.active,
                  'panelmenu__item--disabled': item.disabled,
                  'panelmenu__item--has-submenu': item.items && item.items.length > 0,
                  'panelmenu__item--expanded': isSubmenuExpanded(panelIndex, itemIndex)
                }"
                role="none"
              >
                <a
                  v-if="item.url"
                  :href="item.url"
                  :target="item.target"
                  class="panelmenu__link"
                  role="menuitem"
                  :tabindex="item.disabled ? -1 : 0"
                  :aria-disabled="item.disabled || undefined"
                  @click="onItemClick($event, item, panelIndex, itemIndex)"
                >
                  <i v-if="item.icon" :class="item.icon" class="panelmenu__icon"></i>
                  <span class="panelmenu__label">{{ item.label }}</span>
                </a>
                <button
                  v-else
                  type="button"
                  class="panelmenu__link"
                  role="menuitem"
                  :tabindex="item.disabled ? -1 : 0"
                  :disabled="item.disabled"
                  :aria-expanded="item.items && item.items.length > 0 ? isSubmenuExpanded(panelIndex, itemIndex) : undefined"
                  @click="onItemClick($event, item, panelIndex, itemIndex)"
                >
                  <i v-if="item.icon" :class="item.icon" class="panelmenu__icon"></i>
                  <span class="panelmenu__label">{{ item.label }}</span>
                  <svg
                    v-if="item.items && item.items.length > 0"
                    class="panelmenu__submenu-chevron"
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

                <!-- Nested Submenu -->
                <ul
                  v-if="item.items && item.items.length > 0"
                  class="panelmenu__submenu"
                  role="menu"
                >
                  <template v-for="(subitem, subitemIndex) in item.items" :key="subitem.key || subitemIndex">
                    <li v-if="subitem.separator" class="panelmenu__separator" role="separator"></li>
                    <li
                      v-else
                      class="panelmenu__item panelmenu__item--nested"
                      :class="{
                        'panelmenu__item--active': subitem.active,
                        'panelmenu__item--disabled': subitem.disabled
                      }"
                      role="none"
                    >
                      <a
                        v-if="subitem.url"
                        :href="subitem.url"
                        :target="subitem.target"
                        class="panelmenu__link"
                        role="menuitem"
                        :tabindex="subitem.disabled ? -1 : 0"
                        :aria-disabled="subitem.disabled || undefined"
                        @click="onSubitemClick($event, subitem)"
                      >
                        <i v-if="subitem.icon" :class="subitem.icon" class="panelmenu__icon"></i>
                        <span class="panelmenu__label">{{ subitem.label }}</span>
                      </a>
                      <button
                        v-else
                        type="button"
                        class="panelmenu__link"
                        role="menuitem"
                        :tabindex="subitem.disabled ? -1 : 0"
                        :disabled="subitem.disabled"
                        @click="onSubitemClick($event, subitem)"
                      >
                        <i v-if="subitem.icon" :class="subitem.icon" class="panelmenu__icon"></i>
                        <span class="panelmenu__label">{{ subitem.label }}</span>
                      </button>
                    </li>
                  </template>
                </ul>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="./PanelMenu.scss"></style>

<script setup lang="ts">
import type { PanelMenuProps, PanelMenuEmits } from '../../types';
import { ref, computed, watch } from "vue";

defineOptions({ name: 'FtpPanelMenu' });

const props = withDefaults(defineProps<PanelMenuProps>(), {
  model: () => [],
  expandedKeys: () => ({}),
  multiple: false,
});

const emit = defineEmits(["update:expandedKeys", "panel-open", "panel-close", "item-click"]);

// Internal state
const internalExpandedKeys = ref<Record<string, boolean>>({ ...props.expandedKeys });
const expandedSubmenus = ref<Record<string, boolean>>({});

// Watch for external changes
watch(
  () => props.expandedKeys,
  (newVal) => {
    internalExpandedKeys.value = { ...newVal };
  },
  { deep: true }
);

const isExpanded = (panelIndex: any) => {
  return internalExpandedKeys.value[panelIndex] === true;
};

const isSubmenuExpanded = (panelIndex: any, itemIndex: any) => {
  const key = `${panelIndex}-${itemIndex}`;
  return expandedSubmenus.value[key] === true;
};

const togglePanel = (panelIndex: any, panel: any) => {
  if (panel.disabled) return;

  const wasExpanded = isExpanded(panelIndex);

  if (props.multiple) {
    internalExpandedKeys.value = {
      ...internalExpandedKeys.value,
      [panelIndex]: !wasExpanded,
    };
  } else {
    // Close all panels except the clicked one
    const newKeys: Record<string, boolean> = {};
    if (!wasExpanded) {
      newKeys[panelIndex] = true;
    }
    internalExpandedKeys.value = newKeys;
  }

  emit("update:expandedKeys", { ...internalExpandedKeys.value });

  if (wasExpanded) {
    emit("panel-close", { index: panelIndex, panel });
  } else {
    emit("panel-open", { index: panelIndex, panel });
  }
};

const toggleSubmenu = (panelIndex: any, itemIndex: any) => {
  const key = `${panelIndex}-${itemIndex}`;
  expandedSubmenus.value = {
    ...expandedSubmenus.value,
    [key]: !expandedSubmenus.value[key],
  };
};

const onItemClick = (event: MouseEvent, item: any, panelIndex: any, itemIndex: any) => {
  if (item.disabled) {
    event.preventDefault();
    return;
  }

  // Toggle submenu if item has children
  if (item.items && item.items.length > 0) {
    event.preventDefault();
    toggleSubmenu(panelIndex, itemIndex);
    return;
  }

  if (item.command) {
    item.command({ originalEvent: event, item });
  }

  emit("item-click", { originalEvent: event, item });
};

const onSubitemClick = (event: MouseEvent, item: any) => {
  if (item.disabled) {
    event.preventDefault();
    return;
  }

  if (item.command) {
    item.command({ originalEvent: event, item });
  }

  emit("item-click", { originalEvent: event, item });
};

const onHeaderKeydown = (event: KeyboardEvent, panelIndex: any) => {
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      // Focus next panel header or first item
      break;
    case "ArrowUp":
      event.preventDefault();
      // Focus previous panel header
      break;
    case "Home":
      event.preventDefault();
      // Focus first panel header
      break;
    case "End":
      event.preventDefault();
      // Focus last panel header
      break;
    case "Enter":
    case " ":
      event.preventDefault();
      togglePanel(panelIndex, props.model[panelIndex]);
      break;
  }
};
</script>
