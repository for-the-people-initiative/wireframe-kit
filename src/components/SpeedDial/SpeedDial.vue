<template>
  <div
    class="speed-dial"
    :class="additionalClasses"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <button
      type="button"
      class="speed-dial__button"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      @click="toggle"
    >
      <svg
        class="speed-dial__button-icon"
        :class="{ 'speed-dial__button-icon--open': isOpen }"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 5V19M5 12H19"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <div v-if="isOpen" class="speed-dial__actions" :class="`speed-dial__actions--${direction}`">
      <div
        v-for="(item, index) in model"
        :key="index"
        class="speed-dial__action-wrapper"
        :style="getActionStyle(index)"
      >
        <span v-if="item.label" class="speed-dial__action-label">{{ item.label }}</span>
        <button
          type="button"
          class="speed-dial__action"
          :aria-label="item.label"
          @click="onActionClick(item)"
        >
          <i :class="item.icon" class="speed-dial__action-icon" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style src="./SpeedDial.scss"></style>

<script setup lang="ts">
import type { SpeedDialProps, SpeedDialEmits } from '../../types';
import { computed, ref } from "vue";

defineOptions({ name: 'SpeedDial' });

const props = withDefaults(defineProps<SpeedDialProps>(), {
  model: () => [],
  direction: "up",
  type: "linear",
  radius: 80,
  showLabels: true,
  openOnHover: false,
});

const emit = defineEmits(["click", "show", "hide"]);

const isOpen = ref(false);

const toggle = () => {
  isOpen.value = !isOpen.value;
  emit(isOpen.value ? "show" : "hide");
};

const open = () => {
  if (!isOpen.value) {
    isOpen.value = true;
    emit("show");
  }
};

const close = () => {
  if (isOpen.value) {
    isOpen.value = false;
    emit("hide");
  }
};

const onMouseEnter = () => {
  if (props.openOnHover) {
    open();
  }
};

const onMouseLeave = () => {
  if (props.openOnHover) {
    close();
  }
};

const onActionClick = (item: any) => {
  if (item.command) {
    item.command({ originalEvent: event, item });
  }
  emit("click", item);
  close();
};

const getActionStyle = (index: any) => {
  if (props.type === "linear") {
    return {};
  }

  const total = props.model.length;
  const radius = props.radius;
  let startAngle, endAngle;

  switch (props.type) {
    case "circle":
      startAngle = 0;
      endAngle = 360;
      break;
    case "semi-circle":
      switch (props.direction) {
        case "up":
          startAngle = 180;
          endAngle = 360;
          break;
        case "down":
          startAngle = 0;
          endAngle = 180;
          break;
        case "left":
          startAngle = 90;
          endAngle = 270;
          break;
        case "right":
          startAngle = -90;
          endAngle = 90;
          break;
      }
      break;
    case "quarter-circle":
      switch (props.direction) {
        case "up":
          startAngle = 180;
          endAngle = 270;
          break;
        case "down":
          startAngle = 0;
          endAngle = 90;
          break;
        case "left":
          startAngle = 90;
          endAngle = 180;
          break;
        case "right":
          startAngle = -90;
          endAngle = 0;
          break;
      }
      break;
  }

  const angleStep = (endAngle - startAngle) / (props.type === "circle" ? total : total - 1 || 1);
  const angle = startAngle + index * angleStep;
  const radian = (angle * Math.PI) / 180;

  const x = Math.cos(radian) * radius;
  const y = Math.sin(radian) * radius;

  return {
    position: 'absolute' as const,
    left: `calc(50% + ${x}px)`,
    top: `calc(50% + ${y}px)`,
    transform: "translate(-50%, -50%)",
  };
};

const additionalClasses = computed(() =>
  [
    `speed-dial--direction-${props.direction}`,
    `speed-dial--type-${props.type}`,
    isOpen.value && "speed-dial--open",
    props.showLabels && "speed-dial--show-labels",
  ]
    .filter(Boolean)
    .join(" ")
);
</script>
