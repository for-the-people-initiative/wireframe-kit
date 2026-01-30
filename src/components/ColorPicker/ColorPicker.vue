<template>
  <div ref="containerRef" class="color-picker" :class="additionalClasses">
    <!-- Color trigger button -->
    <button
      v-if="!inline"
      type="button"
      class="color-picker__trigger"
      :disabled="isDisabled"
      :aria-expanded="isPanelOpen"
      aria-label="Choose color"
      aria-haspopup="true"
      @click="togglePanel"
    >
      <span
        class="color-picker__preview"
        :style="{ backgroundColor: modelValue || '#ffffff' }"
      />
    </button>

    <!-- Color picker panel -->
    <Teleport :to="inline ? null : 'body'" :disabled="inline">
      <div
        v-if="inline || isPanelOpen"
        ref="panelRef"
        class="color-picker__panel"
        :class="{ 'color-picker__panel--inline': inline }"
        :style="!inline ? panelStyle : {}"
      >
        <!-- Saturation/Brightness gradient -->
        <div
          ref="gradientRef"
          class="color-picker__gradient"
          :style="{ backgroundColor: `hsl(${hue}, 100%, 50%)` }"
          role="slider"
          tabindex="0"
          aria-label="Color saturation and brightness"
          :aria-valuenow="Math.round(saturation)"
          aria-valuemin="0"
          aria-valuemax="100"
          @mousedown="onGradientMouseDown"
          @keydown="onGradientKeydown"
        >
          <div
            class="color-picker__gradient-pointer"
            :style="gradientPointerStyle"
          />
        </div>

        <!-- Hue slider -->
        <div
          ref="hueRef"
          class="color-picker__hue"
          role="slider"
          tabindex="0"
          aria-label="Hue"
          :aria-valuenow="Math.round(hue)"
          aria-valuemin="0"
          aria-valuemax="360"
          @mousedown="onHueMouseDown"
          @keydown="onHueKeydown"
        >
          <div
            class="color-picker__hue-pointer"
            :style="{ left: `${(hue / 360) * 100}%` }"
          />
        </div>

        <!-- Hex input -->
        <div class="color-picker__input-wrapper">
          <span class="color-picker__input-prefix">#</span>
          <input
            v-model="hexInput"
            class="color-picker__input"
            type="text"
            maxlength="6"
            @blur="onHexInputBlur"
            @keydown.enter="onHexInputBlur"
          />
        </div>

        <!-- Preset colors -->
        <div v-if="presetColors.length > 0" class="color-picker__presets">
          <button
            v-for="(color, index) in presetColors"
            :key="index"
            type="button"
            class="color-picker__preset"
            :class="{ 'color-picker__preset--selected': modelValue === color }"
            :style="{ backgroundColor: color }"
            :aria-label="`Select color ${color}`"
            @click="selectPreset(color)"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style src="./ColorPicker.scss"></style>

<script setup lang="ts">
import type { ColorPickerProps, ColorPickerEmits } from '../../types';
import { computed, ref, watch, onMounted, onUnmounted } from "vue";

defineOptions({ name: 'FtpColorPicker' });

const props = withDefaults(defineProps<ColorPickerProps>(), {
  modelValue: "#000000",
  presetColors: () => ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#000000", "#ffffff"],
  inline: false,
  size: "md",
  isDisabled: false,
});

const emit = defineEmits(["update:modelValue", "change"]);

const containerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const gradientRef = ref<HTMLElement | null>(null);
const hueRef = ref<HTMLElement | null>(null);
const isPanelOpen = ref(false);
const panelStyle = ref({});

// HSV values
const hue = ref(0);
const saturation = ref(100);
const brightness = ref(100);
const hexInput = ref("");

// Convert hex to HSV
const hexToHsv = (hex: any) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 100, v: 100 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;

  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  return { h, s, v };
};

// Convert HSV to hex
const hsvToHex = (h: any, s: any, v: any) => {
  s = s / 100;
  v = v / 100;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r, g, b;

  if (h >= 0 && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h >= 60 && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h >= 120 && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h >= 180 && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h >= 240 && h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  const toHex = (n: any) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Initialize from modelValue
const initFromValue = () => {
  const hsv = hexToHsv(props.modelValue);
  hue.value = hsv.h;
  saturation.value = hsv.s;
  brightness.value = hsv.v;
  hexInput.value = props.modelValue.replace("#", "");
};

// Watch modelValue changes
watch(
  () => props.modelValue,
  () => {
    initFromValue();
  },
  { immediate: true }
);

// Update color from HSV
const updateColor = () => {
  const hex = hsvToHex(hue.value, saturation.value, brightness.value);
  hexInput.value = hex.replace("#", "");
  emit("update:modelValue", hex);
  emit("change", { value: hex });
};

// Gradient pointer position
const gradientPointerStyle = computed(() => ({
  left: `${saturation.value}%`,
  top: `${100 - brightness.value}%`,
}));

// Gradient keyboard handling
const onGradientKeydown = (event: KeyboardEvent) => {
  const step = event.shiftKey ? 10 : 2;
  switch (event.key) {
    case "ArrowRight":
      event.preventDefault();
      saturation.value = Math.min(100, saturation.value + step);
      updateColor();
      break;
    case "ArrowLeft":
      event.preventDefault();
      saturation.value = Math.max(0, saturation.value - step);
      updateColor();
      break;
    case "ArrowUp":
      event.preventDefault();
      brightness.value = Math.min(100, brightness.value + step);
      updateColor();
      break;
    case "ArrowDown":
      event.preventDefault();
      brightness.value = Math.max(0, brightness.value - step);
      updateColor();
      break;
  }
};

// Hue keyboard handling
const onHueKeydown = (event: KeyboardEvent) => {
  const step = event.shiftKey ? 10 : 2;
  switch (event.key) {
    case "ArrowRight":
    case "ArrowUp":
      event.preventDefault();
      hue.value = Math.min(360, hue.value + step);
      updateColor();
      break;
    case "ArrowLeft":
    case "ArrowDown":
      event.preventDefault();
      hue.value = Math.max(0, hue.value - step);
      updateColor();
      break;
  }
};

// Gradient mouse handling
const onGradientMouseDown = (event: MouseEvent) => {
  updateGradientFromEvent(event);
  document.addEventListener("mousemove", onGradientMouseMove);
  document.addEventListener("mouseup", onGradientMouseUp);
};

const onGradientMouseMove = (event: MouseEvent) => {
  updateGradientFromEvent(event);
};

const onGradientMouseUp = () => {
  document.removeEventListener("mousemove", onGradientMouseMove);
  document.removeEventListener("mouseup", onGradientMouseUp);
};

const updateGradientFromEvent = (event: MouseEvent) => {
  if (!gradientRef.value) return;
  const rect = gradientRef.value.getBoundingClientRect();
  const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
  const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));

  saturation.value = (x / rect.width) * 100;
  brightness.value = 100 - (y / rect.height) * 100;
  updateColor();
};

// Hue slider mouse handling
const onHueMouseDown = (event: MouseEvent) => {
  updateHueFromEvent(event);
  document.addEventListener("mousemove", onHueMouseMove);
  document.addEventListener("mouseup", onHueMouseUp);
};

const onHueMouseMove = (event: MouseEvent) => {
  updateHueFromEvent(event);
};

const onHueMouseUp = () => {
  document.removeEventListener("mousemove", onHueMouseMove);
  document.removeEventListener("mouseup", onHueMouseUp);
};

const updateHueFromEvent = (event: MouseEvent) => {
  if (!hueRef.value) return;
  const rect = hueRef.value.getBoundingClientRect();
  const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
  hue.value = (x / rect.width) * 360;
  updateColor();
};

// Hex input handling
const onHexInputBlur = () => {
  const cleanHex = hexInput.value.replace(/[^a-fA-F0-9]/g, "");
  if (cleanHex.length === 6) {
    const hex = `#${cleanHex}`;
    const hsv = hexToHsv(hex);
    hue.value = hsv.h;
    saturation.value = hsv.s;
    brightness.value = hsv.v;
    emit("update:modelValue", hex);
    emit("change", { value: hex });
  } else {
    hexInput.value = props.modelValue.replace("#", "");
  }
};

// Preset color selection
const selectPreset = (color: any) => {
  const hsv = hexToHsv(color);
  hue.value = hsv.h;
  saturation.value = hsv.s;
  brightness.value = hsv.v;
  hexInput.value = color.replace("#", "");
  emit("update:modelValue", color);
  emit("change", { value: color });
};

// Panel positioning
const updatePanelPosition = () => {
  if (!containerRef.value || props.inline) return;
  const rect = containerRef.value.getBoundingClientRect();
  panelStyle.value = {
    position: "fixed",
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    zIndex: 1000,
  };
};

const togglePanel = () => {
  if (props.isDisabled) return;
  isPanelOpen.value = !isPanelOpen.value;
  if (isPanelOpen.value) {
    updatePanelPosition();
  }
};

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  if (!containerRef.value || !panelRef.value) return;
  if (
    !containerRef.value.contains(event.target as Node) &&
    !panelRef.value.contains(event.target as Node)
  ) {
    isPanelOpen.value = false;
  }
};

const handleScroll = () => {
  if (isPanelOpen.value && !props.inline) {
    updatePanelPosition();
  }
};

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
  window.addEventListener("scroll", handleScroll, true);
  window.addEventListener("resize", handleScroll);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
  window.removeEventListener("scroll", handleScroll, true);
  window.removeEventListener("resize", handleScroll);
});

const additionalClasses = computed(() =>
  [
    `color-picker--size-${props.size}`,
    props.inline && "color-picker--inline",
    props.isDisabled && "color-picker--disabled",
  ]
    .filter(Boolean)
    .join(" ")
);
</script>
