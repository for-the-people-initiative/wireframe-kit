<template>
  <div class="tabs" :class="additionalClasses">
    <div class="tabs__nav" role="tablist" :aria-label="ariaLabel">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        class="tabs__tab"
        :class="{
          'tabs__tab--active': index === activeIndex,
          'tabs__tab--disabled': tab.disabled
        }"
        :id="`${tabsId}-tab-${index}`"
        :aria-selected="index === activeIndex"
        :aria-controls="`${tabsId}-panel-${index}`"
        :tabindex="index === activeIndex ? 0 : -1"
        :disabled="tab.disabled"
        @click="onTabClick(index, $event)"
        @keydown="onKeydown($event, index)"
      >
        {{ tab.header }}
      </button>
      <span
        class="tabs__indicator"
        :style="indicatorStyle"
      ></span>
    </div>
    <div class="tabs__panels">
      <slot></slot>
    </div>
  </div>
</template>

<style src="./Tabs.scss"></style>

<script setup lang="ts">
import type { TabsProps, TabsEmits } from '../../types';
import { ref, computed, provide, onMounted, nextTick, watch } from "vue";

defineOptions({ name: 'FtpTabs' });

const props = withDefaults(defineProps<TabsProps>(), {
  activeIndex: 0,
  ariaLabel: "Tabs",
});

const emit = defineEmits(["update:activeIndex", "tabChange", "tabClick"]);

// Generate unique ID for accessibility
const tabsId = `tabs-${Math.random().toString(36).substring(2, 9)}`;

// Tab registration
const tabs = ref<any[]>([]);
const tabElements = ref([]);
const navRef = ref(null);

const registerTab = (tab: any) => {
  const id = `tab-${tabs.value.length}`;
  tabs.value.push({ ...tab, id });
  return tabs.value.length - 1;
};

const unregisterTab = (index: any) => {
  tabs.value.splice(index, 1);
};

// Provide context to TabPanel children
provide("tabs", {
  registerTab,
  unregisterTab,
  activeIndex: computed(() => props.activeIndex),
  tabsId,
});

// Indicator positioning
const indicatorStyle = ref({});

const updateIndicator = async () => {
  await nextTick();
  const activeTab = document.querySelector(`#${tabsId}-tab-${props.activeIndex}`);
  if (activeTab) {
    indicatorStyle.value = {
      width: `${(activeTab as HTMLElement).offsetWidth}px`,
      transform: `translateX(${(activeTab as HTMLElement).offsetLeft}px)`,
    };
  }
};

onMounted(() => {
  updateIndicator();
});

watch(() => props.activeIndex, updateIndicator);
watch(() => tabs.value.length, updateIndicator);

// Event handlers
const onTabClick = (index: any, event: any) => {
  if (tabs.value[index]?.disabled) return;

  emit("tabClick", { originalEvent: event, index });

  if (index !== props.activeIndex) {
    emit("update:activeIndex", index);
    emit("tabChange", { originalEvent: event, index });
  }
};

const onKeydown = (event: KeyboardEvent, currentIndex: any) => {
  const tabCount = tabs.value.length;
  let newIndex = currentIndex;

  switch (event.key) {
    case "ArrowLeft":
      event.preventDefault();
      newIndex = currentIndex - 1;
      if (newIndex < 0) newIndex = tabCount - 1;
      while (tabs.value[newIndex]?.disabled && newIndex !== currentIndex) {
        newIndex = newIndex - 1;
        if (newIndex < 0) newIndex = tabCount - 1;
      }
      break;
    case "ArrowRight":
      event.preventDefault();
      newIndex = currentIndex + 1;
      if (newIndex >= tabCount) newIndex = 0;
      while (tabs.value[newIndex]?.disabled && newIndex !== currentIndex) {
        newIndex = newIndex + 1;
        if (newIndex >= tabCount) newIndex = 0;
      }
      break;
    case "Home":
      event.preventDefault();
      newIndex = 0;
      while (tabs.value[newIndex]?.disabled && newIndex < tabCount - 1) {
        newIndex++;
      }
      break;
    case "End":
      event.preventDefault();
      newIndex = tabCount - 1;
      while (tabs.value[newIndex]?.disabled && newIndex > 0) {
        newIndex--;
      }
      break;
    default:
      return;
  }

  if (newIndex !== currentIndex && !tabs.value[newIndex]?.disabled) {
    emit("update:activeIndex", newIndex);
    emit("tabChange", { originalEvent: event, index: newIndex });
    // Focus the new tab
    nextTick(() => {
      const newTab = document.querySelector(`#${tabsId}-tab-${newIndex}`);
      (newTab as HTMLElement)?.focus();
    });
  }
};

const additionalClasses = computed(() => [].filter(Boolean).join(" "));
</script>
