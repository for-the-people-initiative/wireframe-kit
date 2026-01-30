<template>
  <div v-if="visible" class="chip" :class="additionalClasses">
    <img
      v-if="image"
      :src="image"
      :alt="label || 'chip image'"
      class="chip__image"
    />
    <i v-if="icon" :class="icon" class="chip__icon"></i>
    <span v-if="label" class="chip__label">{{ label }}</span>
    <slot />
    <button
      v-if="removable"
      type="button"
      class="chip__remove"
      aria-label="Remove"
      @click="onRemove"
      @keydown="onKeydown"
    >
      <svg
        class="chip__remove-icon"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.5 4.5L9.5 9.5M9.5 4.5L4.5 9.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>
</template>

<style src="./Chip.scss"></style>

<script setup lang="ts">
import type { ChipProps, ChipEmits } from '../../types';
import { computed, ref } from "vue";

defineOptions({ name: 'FtpChip' });

const props = defineProps<ChipProps>();

const emit = defineEmits(["remove"]);

const visible = ref(true);

const onRemove = (event: Event) => {
  visible.value = false;
  emit("remove", event);
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter" || event.key === "Backspace") {
    onRemove(event);
  }
};

const additionalClasses = computed(() => {
  const classes = [];
  if (props.removable) {
    classes.push("chip--removable");
  }
  if (props.image) {
    classes.push("chip--has-image");
  }
  return classes.join(" ");
});
</script>
