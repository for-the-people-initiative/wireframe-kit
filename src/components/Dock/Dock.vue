<template>
  <div
    class="dock"
    :class="[
      `dock--${position}`,
      { 'dock--magnify': magnification }
    ]"
  >
    <div class="dock__container">
      <div
        v-for="(item, index) in model"
        :key="item.key || index"
        class="dock__item"
        :class="{
          'dock__item--active': item.active,
          'dock__item--disabled': item.disabled
        }"
        :style="getItemStyle(index)"
        @click="onItemClick(item, $event)"
        @mouseenter="onItemMouseEnter(index)"
        @mouseleave="onItemMouseLeave"
      >
        <span class="dock__icon">
          <component :is="item.icon" v-if="typeof item.icon === 'object'" />
          <span v-else v-html="item.icon" />
        </span>

        <Transition :name="tooltipTransition">
          <span
            v-if="showTooltips && hoveredIndex === index"
            class="dock__tooltip"
          >
            {{ item.label }}
          </span>
        </Transition>

        <span v-if="item.active" class="dock__indicator" />
      </div>
    </div>
  </div>
</template>

<style src="./Dock.scss"></style>

<script setup lang="ts">
import type { DockProps, DockEmits } from '../../types';
import { ref, computed } from "vue";

defineOptions({ name: 'FtpDock' });

const props = withDefaults(defineProps<DockProps>(), {
  model: () => [],
  position: "bottom",
  magnification: true,
  magnificationScale: 1.5,
  showTooltips: true,
});

const emit = defineEmits(["item-click"]);

const hoveredIndex = ref(-1);

const tooltipTransition = computed(() => {
  if (props.position === "bottom") return "dock-tooltip-up";
  if (props.position === "top") return "dock-tooltip-down";
  if (props.position === "left") return "dock-tooltip-right";
  return "dock-tooltip-left";
});

function getItemStyle(index: any) {
  if (!props.magnification || hoveredIndex.value === -1) {
    return {};
  }

  const distance = Math.abs(hoveredIndex.value - index);
  const maxDistance = 2;

  if (distance > maxDistance) {
    return {};
  }

  const scale = 1 + (props.magnificationScale - 1) * (1 - distance / (maxDistance + 1));

  return {
    transform: `scale(${scale})`,
    zIndex: maxDistance - distance + 1,
  };
}

function onItemClick(item: any, event: any) {
  if (item.disabled) return;

  if (item.command) {
    item.command({ originalEvent: event, item });
  }

  emit("item-click", { originalEvent: event, item });
}

function onItemMouseEnter(index: any) {
  hoveredIndex.value = index;
}

function onItemMouseLeave() {
  hoveredIndex.value = -1;
}
</script>
