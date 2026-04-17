<template>
  <nav
    class="mega-menu"
    :class="[
      `mega-menu--${orientation}`,
      { 'mega-menu--mobile-open': mobileMenuOpen }
    ]"
  >
    <button
      type="button"
      class="mega-menu__mobile-toggle"
      aria-label="Toggle menu"
      @click="mobileMenuOpen = !mobileMenuOpen"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>

    <ul class="mega-menu__root" role="menubar">
      <li
        v-for="(item, index) in model"
        :key="item.key || index"
        class="mega-menu__root-item"
        :class="{
          'mega-menu__root-item--active': activeRootItem === item,
          'mega-menu__root-item--disabled': item.disabled
        }"
        role="none"
        @mouseenter="onRootItemMouseEnter(item)"
        @mouseleave="onRootItemMouseLeave"
      >
        <a
          class="mega-menu__root-link"
          :href="item.url || '#'"
          role="menuitem"
          :aria-haspopup="item.items?.length ? 'true' : undefined"
          :aria-expanded="activeRootItem === item ? 'true' : undefined"
          @click="onRootItemClick(item, $event)"
        >
          <span v-if="item.icon" class="mega-menu__root-icon">
            <component :is="item.icon" v-if="typeof item.icon === 'object'" />
            <span v-else v-html="item.icon" />
          </span>
          <span class="mega-menu__root-label">{{ item.label }}</span>
          <span v-if="item.items?.length" class="mega-menu__root-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </a>

        <!-- Dropdown Panel -->
        <Transition name="mega-menu-panel">
          <div
            v-if="item.items?.length && activeRootItem === item"
            v-rough
            class="mega-menu__panel"
            role="menu"
            @mouseenter="onPanelMouseEnter"
            @mouseleave="onPanelMouseLeave"
          >
            <div class="mega-menu__columns">
              <div
                v-for="(column, colIndex) in item.items"
                :key="column.key || colIndex"
                class="mega-menu__column"
              >
                <span v-if="column.label" class="mega-menu__category">
                  {{ column.label }}
                </span>
                <ul class="mega-menu__list">
                  <li
                    v-for="(subItem, subIndex) in column.items || [column]"
                    :key="subItem.key || subIndex"
                    class="mega-menu__item"
                    :class="{ 'mega-menu__item--disabled': subItem.disabled }"
                    role="none"
                  >
                    <a
                      class="mega-menu__link"
                      :href="subItem.url || '#'"
                      role="menuitem"
                      @click="onItemClick(subItem, $event)"
                    >
                      <span v-if="subItem.icon" class="mega-menu__icon">
                        <component :is="subItem.icon" v-if="typeof subItem.icon === 'object'" />
                        <span v-else v-html="subItem.icon" />
                      </span>
                      <span class="mega-menu__content">
                        <span class="mega-menu__label">{{ subItem.label }}</span>
                        <span v-if="subItem.description" class="mega-menu__description">
                          {{ subItem.description }}
                        </span>
                      </span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Transition>
      </li>
    </ul>
  </nav>
</template>

<style src="./MegaMenu.scss"></style>

<script setup lang="ts">
import type { MegaMenuProps, MegaMenuEmits } from '../../types';
import { ref, onMounted, onUnmounted } from "vue";

defineOptions({ name: 'MegaMenu' });

const props = withDefaults(defineProps<MegaMenuProps>(), {
  model: () => [],
  orientation: "horizontal",
});

const emit = defineEmits(["item-click"]);

const activeRootItem = ref<any>(null);
const mobileMenuOpen = ref(false);
let closeTimeout: ReturnType<typeof setTimeout> | null = null;

function onRootItemClick(item: any, event: any) {
  if (item.disabled) {
    event.preventDefault();
    return;
  }

  if (item.items?.length) {
    event.preventDefault();
    if (activeRootItem.value === item) {
      activeRootItem.value = null;
    } else {
      activeRootItem.value = item;
    }
    return;
  }

  if (item.command) {
    item.command({ originalEvent: event, item });
  }
}

function onRootItemMouseEnter(item: any) {
  if (item.disabled) return;

  clearTimeout(closeTimeout!);

  if (item.items?.length) {
    activeRootItem.value = item;
  }
}

function onRootItemMouseLeave() {
  closeTimeout = setTimeout(() => {
    activeRootItem.value = null;
  }, 150);
}

function onPanelMouseEnter() {
  clearTimeout(closeTimeout!);
}

function onPanelMouseLeave() {
  closeTimeout = setTimeout(() => {
    activeRootItem.value = null;
  }, 150);
}

function onItemClick(item: any, event: any) {
  if (item.disabled) {
    event.preventDefault();
    return;
  }

  if (!item.url || item.url === "#") {
    event.preventDefault();
  }

  if (item.command) {
    item.command({ originalEvent: event, item });
  }

  emit("item-click", { originalEvent: event, item });
  activeRootItem.value = null;
  mobileMenuOpen.value = false;
}

function onDocumentClick(event: MouseEvent) {
  if (!(event.target as HTMLElement).closest(".mega-menu")) {
    activeRootItem.value = null;
    mobileMenuOpen.value = false;
  }
}

function onEscapeKey(event: KeyboardEvent) {
  if (event.key === "Escape") {
    activeRootItem.value = null;
    mobileMenuOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onEscapeKey);
});

onUnmounted(() => {
  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onEscapeKey);
  clearTimeout(closeTimeout!);
});
</script>
