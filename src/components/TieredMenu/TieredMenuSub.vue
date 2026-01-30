<template>
  <template v-for="(item, index) in items" :key="item.key || index">
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
        @click="onItemClick($event, item)"
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
        @click="onItemClick($event, item)"
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

      <!-- Nested Submenu -->
      <ul
        v-if="item.items && item.items.length > 0"
        class="tieredmenu__submenu"
        :class="{ 'tieredmenu__submenu--visible': activeSubmenu === index }"
        role="menu"
      >
        <TieredMenuSub
          :items="item.items"
          @item-click="$emit('item-click', $event)"
        />
      </ul>
    </li>
  </template>
</template>

<script setup lang="ts">
import type { TieredMenuSubProps, TieredMenuSubEmits } from '../../types';
import { ref } from "vue";

defineOptions({ name: 'FtpTieredMenuSub' });

const props = withDefaults(defineProps<TieredMenuSubProps>(), {
  items: () => [],
});

const emit = defineEmits(["item-click"]);

const activeSubmenu = ref(null);

const onItemMouseEnter = (index: any, item: any) => {
  if (!item.disabled && item.items && item.items.length > 0) {
    activeSubmenu.value = index;
  }
};

const onItemMouseLeave = () => {
  // Keep open while hovering submenu
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
};
</script>
