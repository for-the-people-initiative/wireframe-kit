<template>
  <nav v-rough="{ edges: ['bottom'] }" class="tabmenu" role="navigation">
    <ul class="tabmenu__list" role="menubar">
      <li
        v-for="(item, index) in model"
        :key="item.key || index"
        class="tabmenu__item"
        :class="{
          'tabmenu__item--active': index === activeIndex,
          'tabmenu__item--disabled': item.disabled
        }"
        role="none"
      >
        <a
          v-if="item.url"
          :href="item.url"
          :target="item.target"
          class="tabmenu__link"
          role="menuitem"
          :tabindex="item.disabled ? -1 : 0"
          :aria-disabled="item.disabled || undefined"
          :aria-current="index === activeIndex ? 'page' : undefined"
          @click="onTabClick($event, item, index)"
          @keydown="onTabKeydown($event, index)"
        >
          <i v-if="item.icon" :class="item.icon" class="tabmenu__icon"></i>
          <span class="tabmenu__label">{{ item.label }}</span>
          <span v-if="item.badge" class="tabmenu__badge">{{ item.badge }}</span>
        </a>
        <button
          v-else
          type="button"
          class="tabmenu__link"
          role="menuitem"
          :tabindex="item.disabled ? -1 : 0"
          :disabled="item.disabled"
          :aria-current="index === activeIndex ? 'page' : undefined"
          @click="onTabClick($event, item, index)"
          @keydown="onTabKeydown($event, index)"
        >
          <i v-if="item.icon" :class="item.icon" class="tabmenu__icon"></i>
          <span class="tabmenu__label">{{ item.label }}</span>
          <span v-if="item.badge" class="tabmenu__badge">{{ item.badge }}</span>
        </button>
      </li>
    </ul>
    <div class="tabmenu__inkbar" :style="inkbarStyle"></div>
  </nav>
</template>

<style src="./TabMenu.scss"></style>

<script setup lang="ts">
import type { TabMenuProps, TabMenuEmits } from '../../types';
import { ref, computed, watch, onMounted, nextTick } from "vue";

defineOptions({ name: 'TabMenu' });

const props = withDefaults(defineProps<TabMenuProps>(), {
  model: () => [],
  activeIndex: 0,
});

const emit = defineEmits(["update:activeIndex", "tab-change"]);

const tabRefs = ref([]);
const inkbarStyle = ref({});

const updateInkbar = async () => {
  await nextTick();
  const activeTab = document.querySelector(".tabmenu__item--active .tabmenu__link");
  if (activeTab) {
    const tabmenu = activeTab.closest(".tabmenu");
    const tabmenuRect = tabmenu?.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();

    if (tabmenuRect) {
      inkbarStyle.value = {
        width: `${tabRect.width}px`,
        transform: `translateX(${tabRect.left - tabmenuRect.left}px)`,
      };
    }
  }
};

onMounted(() => {
  updateInkbar();
});

watch(() => props.activeIndex, () => {
  updateInkbar();
});

const onTabClick = (event: MouseEvent | KeyboardEvent, item: any, index: any) => {
  if (item.disabled) {
    event.preventDefault();
    return;
  }

  if (item.command) {
    item.command({ originalEvent: event, item, index });
  }

  emit("update:activeIndex", index);
  emit("tab-change", { originalEvent: event, item, index });
};

const onTabKeydown = (event: KeyboardEvent, index: any) => {
  const itemCount = props.model.length;

  switch (event.key) {
    case "ArrowRight":
      event.preventDefault();
      {
        let nextIndex = index + 1;
        while (nextIndex < itemCount && props.model[nextIndex].disabled) {
          nextIndex++;
        }
        if (nextIndex < itemCount) {
          focusTab(nextIndex);
        }
      }
      break;
    case "ArrowLeft":
      event.preventDefault();
      {
        let prevIndex = index - 1;
        while (prevIndex >= 0 && props.model[prevIndex].disabled) {
          prevIndex--;
        }
        if (prevIndex >= 0) {
          focusTab(prevIndex);
        }
      }
      break;
    case "Home":
      event.preventDefault();
      {
        let firstIndex = 0;
        while (firstIndex < itemCount && props.model[firstIndex].disabled) {
          firstIndex++;
        }
        if (firstIndex < itemCount) {
          focusTab(firstIndex);
        }
      }
      break;
    case "End":
      event.preventDefault();
      {
        let lastIndex = itemCount - 1;
        while (lastIndex >= 0 && props.model[lastIndex].disabled) {
          lastIndex--;
        }
        if (lastIndex >= 0) {
          focusTab(lastIndex);
        }
      }
      break;
    case "Enter":
    case " ":
      event.preventDefault();
      onTabClick(event, props.model[index], index);
      break;
  }
};

const focusTab = (index: any) => {
  const tabs = document.querySelectorAll(".tabmenu__link");
  if (tabs[index]) {
    (tabs[index] as HTMLElement).focus();
  }
};
</script>
