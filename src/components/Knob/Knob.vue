<template>
  <div
    class="knob"
    :class="additionalClasses"
    :style="{ width: sizeValue, height: sizeValue }"
  >
    <svg
      class="knob__svg"
      viewBox="0 0 100 100"
      role="slider"
      :aria-valuenow="modelValue"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-disabled="isDisabled || undefined"
      tabindex="0"
      @mousedown="onMouseDown"
      @touchstart="onTouchStart"
      @keydown="onKeyDown"
    >
      <!-- Sketchy background track -->
      <g ref="trackGroup" class="knob__track" />

      <!-- Sketchy fill arc -->
      <g ref="fillGroup" class="knob__fill" />
    </svg>

    <!-- Value display -->
    <div v-if="showValue" class="knob__value">
      <slot name="value" :value="modelValue">
        {{ displayValue }}
      </slot>
    </div>
  </div>
</template>

<style src="./Knob.scss"></style>

<script setup lang="ts">
import type { KnobProps, KnobEmits } from '../../types';
import { computed, ref, watchEffect } from "vue";
import rough from "roughjs";

defineOptions({ name: 'Knob' });

const props = withDefaults(defineProps<KnobProps>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  size: "md",
  showValue: true,
  valueTemplate: "{value}",
  isDisabled: false,
});

const emit = defineEmits(["update:modelValue", "change"]);

const sizeMap = {
  sm: 80,
  md: 120,
  lg: 160,
};

const strokeMap = {
  sm: 6,
  md: 8,
  lg: 10,
};

const sizeValue = computed(() => `${sizeMap[props.size]}px`);

const strokeWidthValue = computed(() => {
  if (props.strokeWidth !== undefined) {
    return (props.strokeWidth / sizeMap[props.size]) * 100;
  }
  return (strokeMap[props.size] / sizeMap[props.size]) * 100;
});

const radius = computed(() => 50 - strokeWidthValue.value / 2);

const percentage = computed(() => {
  const range = props.max - props.min;
  if (range === 0) return 0;
  return ((props.modelValue - props.min) / range) * 100;
});

const displayValue = computed(() => {
  return props.valueTemplate.replace("{value}", String(props.modelValue));
});

const additionalClasses = computed(() =>
  [
    `knob--size-${props.size}`,
    props.isDisabled && "knob--disabled",
  ]
    .filter(Boolean)
    .join(" ")
);

const isDragging = ref(false);

const trackGroup = ref<SVGGElement | null>(null);
const fillGroup = ref<SVGGElement | null>(null);
const trackSeed = Math.floor(Math.random() * 2 ** 31);
const fillSeed = Math.floor(Math.random() * 2 ** 31);

watchEffect(() => {
  const tg = trackGroup.value;
  const fg = fillGroup.value;
  if (!tg || !fg) return;
  const svg = tg.ownerSVGElement;
  if (!svg) return;

  const rc = rough.svg(svg);
  while (tg.firstChild) tg.removeChild(tg.firstChild);
  while (fg.firstChild) fg.removeChild(fg.firstChild);

  const cx = 50;
  const cy = 50;
  const r = radius.value;
  const sw = strokeWidthValue.value;

  tg.appendChild(
    rc.circle(cx, cy, 2 * r, {
      stroke: 'currentColor',
      strokeWidth: sw,
      roughness: 1.5,
      bowing: 1,
      fill: undefined,
      seed: trackSeed,
    }),
  );

  const pct = percentage.value / 100;
  if (pct <= 0) return;
  const startAngle = -Math.PI / 2;
  if (pct >= 1) {
    fg.appendChild(
      rc.circle(cx, cy, 2 * r, {
        stroke: 'currentColor',
        strokeWidth: sw * 1.15,
        roughness: 1.2,
        bowing: 0.8,
        fill: undefined,
        seed: fillSeed,
      }),
    );
    return;
  }
  const endAngle = startAngle + pct * 2 * Math.PI;
  fg.appendChild(
    rc.arc(cx, cy, 2 * r, 2 * r, startAngle, endAngle, false, {
      stroke: 'currentColor',
      strokeWidth: sw * 1.15,
      roughness: 1.2,
      bowing: 0.8,
      seed: fillSeed,
    }),
  );
});

const updateValue = (event: MouseEvent | TouchEvent) => {
  if (props.isDisabled) return;

  const svg = (event.target as HTMLElement).closest("svg") || event.currentTarget as HTMLElement;
  const rect = svg!.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const clientX = 'touches' in event && event.touches.length ? event.touches[0].clientX : (event as MouseEvent).clientX;
  const clientY = 'touches' in event && event.touches.length ? event.touches[0].clientY : (event as MouseEvent).clientY;

  // Calculate angle from center
  const dx = clientX - centerX;
  const dy = clientY - centerY;
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Convert to 0-360 starting from top (270 degrees offset)
  angle = (angle + 90 + 360) % 360;

  // Convert angle to value
  const range = props.max - props.min;
  let value = (angle / 360) * range + props.min;

  // Apply step
  value = Math.round(value / props.step) * props.step;

  // Clamp value
  value = Math.max(props.min, Math.min(props.max, value));

  if (value !== props.modelValue) {
    emit("update:modelValue", value);
  }
};

const onMouseDown = (event: MouseEvent) => {
  if (props.isDisabled) return;

  isDragging.value = true;
  updateValue(event);

  const onMouseMove = (e: MouseEvent) => {
    if (isDragging.value) {
      updateValue(e);
    }
  };

  const onMouseUp = () => {
    if (isDragging.value) {
      isDragging.value = false;
      emit("change", { value: props.modelValue });
    }
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
};

const onTouchStart = (event: TouchEvent) => {
  if (props.isDisabled) return;

  isDragging.value = true;
  updateValue(event);

  const onTouchMove = (e: TouchEvent) => {
    if (isDragging.value) {
      e.preventDefault();
      updateValue(e);
    }
  };

  const onTouchEnd = () => {
    if (isDragging.value) {
      isDragging.value = false;
      emit("change", { value: props.modelValue });
    }
    document.removeEventListener("touchmove", onTouchMove);
    document.removeEventListener("touchend", onTouchEnd);
  };

  document.addEventListener("touchmove", onTouchMove, { passive: false });
  document.addEventListener("touchend", onTouchEnd);
};

const onKeyDown = (event: KeyboardEvent) => {
  if (props.isDisabled) return;

  let newValue = props.modelValue;

  switch (event.key) {
    case "ArrowUp":
    case "ArrowRight":
      newValue = Math.min(props.max, props.modelValue + props.step);
      event.preventDefault();
      break;
    case "ArrowDown":
    case "ArrowLeft":
      newValue = Math.max(props.min, props.modelValue - props.step);
      event.preventDefault();
      break;
    case "Home":
      newValue = props.min;
      event.preventDefault();
      break;
    case "End":
      newValue = props.max;
      event.preventDefault();
      break;
    case "PageUp":
      newValue = Math.min(props.max, props.modelValue + props.step * 10);
      event.preventDefault();
      break;
    case "PageDown":
      newValue = Math.max(props.min, props.modelValue - props.step * 10);
      event.preventDefault();
      break;
    default:
      return;
  }

  if (newValue !== props.modelValue) {
    emit("update:modelValue", newValue);
    emit("change", { value: newValue });
  }
};
</script>
