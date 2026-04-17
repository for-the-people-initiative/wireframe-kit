<template>
  <textarea
    ref="textareaRef"
    v-rough="{ severity: 2 }"
    class="textarea"
    :class="additionalClasses"
    :value="modelValue"
    :rows="rows"
    :cols="cols"
    :placeholder="placeholder"
    :disabled="isDisabled"
    :aria-invalid="isInvalid || undefined"
    :aria-describedby="ariaDescribedby || undefined"
    @input="onInput"
  ></textarea>
</template>

<style src="./Textarea.scss"></style>

<script setup lang="ts">
import type { TextareaProps, TextareaEmits } from '../../types';
import { computed, ref, watch, onMounted, onUpdated, onBeforeUnmount, nextTick } from "vue";

defineOptions({ name: 'Textarea' });

const props = withDefaults(defineProps<TextareaProps>(), {
  modelValue: "",
  rows: 3,
  cols: undefined,
  placeholder: "",
  isDisabled: false,
  isInvalid: false,
  autoResize: false,
});

const emit = defineEmits(["update:modelValue", "input"]);

const textareaRef = ref<HTMLTextAreaElement | null>(null);
let resizeObserver: ResizeObserver | null = null;

const resize = () => {
  if (!textareaRef.value || !props.autoResize) return;

  const textarea = textareaRef.value;
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
};

const onInput = (event: Event) => {
  const value = (event.target as HTMLTextAreaElement).value;
  emit("update:modelValue", value);
  emit("input", { value, originalEvent: event });

  if (props.autoResize) {
    nextTick(resize);
  }
};

const additionalClasses = computed(() =>
  [
    props.isDisabled && "textarea--disabled",
    props.isInvalid && "textarea--invalid",
    props.autoResize && "textarea--auto-resize",
  ]
    .filter(Boolean)
    .join(" ")
);

onMounted(() => {
  if (props.autoResize) {
    resize();
    resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(resize);
    });
    if (textareaRef.value) {
      resizeObserver.observe(textareaRef.value);
    }
  }
});

onUpdated(() => {
  if (props.autoResize) {
    resize();
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});

watch(
  () => props.modelValue,
  () => {
    if (props.autoResize) {
      nextTick(resize);
    }
  }
);
</script>
