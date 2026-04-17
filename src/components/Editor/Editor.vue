<template>
  <div v-rough class="editor" :class="additionalClasses">
    <!-- Toolbar -->
    <div class="editor__toolbar">
      <button
        type="button"
        class="editor__button"
        :class="{ 'editor__button--active': activeFormats.bold }"
        title="Bold"
        :disabled="isDisabled"
        @click="execCommand('bold')"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 3H9C10.6569 3 12 4.34315 12 6C12 7.65685 10.6569 9 9 9H4V3Z" stroke="currentColor" stroke-width="1.5" />
          <path d="M4 9H10C11.6569 9 13 10.3431 13 12C13 13.6569 11.6569 15 10 15H4V9Z" stroke="currentColor" stroke-width="1.5" />
        </svg>
      </button>

      <button
        type="button"
        class="editor__button"
        :class="{ 'editor__button--active': activeFormats.italic }"
        title="Italic"
        :disabled="isDisabled"
        @click="execCommand('italic')"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3H14M6 13H10M12 3L8 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <button
        type="button"
        class="editor__button"
        :class="{ 'editor__button--active': activeFormats.underline }"
        title="Underline"
        :disabled="isDisabled"
        @click="execCommand('underline')"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 3V8C4 10.2091 5.79086 12 8 12C10.2091 12 12 10.2091 12 8V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M3 15H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>

      <button
        type="button"
        class="editor__button"
        :class="{ 'editor__button--active': activeFormats.strikeThrough }"
        title="Strikethrough"
        :disabled="isDisabled"
        @click="execCommand('strikeThrough')"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M11 4C11 4 10 3 8 3C6 3 4.5 4.5 4.5 6C4.5 7 5 7.5 6 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M5 12C5 12 6 13 8 13C10 13 11.5 11.5 11.5 10C11.5 9.5 11.3 9 11 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>

      <span class="editor__separator" />

      <button
        type="button"
        class="editor__button"
        :class="{ 'editor__button--active': activeFormats.insertUnorderedList }"
        title="Bullet List"
        :disabled="isDisabled"
        @click="execCommand('insertUnorderedList')"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="3" cy="4" r="1" fill="currentColor" />
          <circle cx="3" cy="8" r="1" fill="currentColor" />
          <circle cx="3" cy="12" r="1" fill="currentColor" />
          <path d="M6 4H14M6 8H14M6 12H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>

      <button
        type="button"
        class="editor__button"
        :class="{ 'editor__button--active': activeFormats.insertOrderedList }"
        title="Numbered List"
        :disabled="isDisabled"
        @click="execCommand('insertOrderedList')"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <text x="2" y="5" fill="currentColor" font-size="5" font-weight="500">1.</text>
          <text x="2" y="9" fill="currentColor" font-size="5" font-weight="500">2.</text>
          <text x="2" y="13" fill="currentColor" font-size="5" font-weight="500">3.</text>
          <path d="M6 4H14M6 8H14M6 12H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>

      <span class="editor__separator" />

      <button
        type="button"
        class="editor__button"
        title="Link"
        :disabled="isDisabled"
        @click="insertLink"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6.5 9.5L9.5 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M9 10.5L10.5 9C11.8807 7.61929 11.8807 5.38071 10.5 4L10 3.5C8.61929 2.11929 6.38071 2.11929 5 3.5L3.5 5C2.11929 6.38071 2.11929 8.61929 3.5 10L4 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M7 5.5L5.5 7C4.11929 8.38071 4.11929 10.6193 5.5 12L6 12.5C7.38071 13.8807 9.61929 13.8807 11 12.5L12.5 11C13.8807 9.61929 13.8807 7.38071 12.5 6L12 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>

      <span class="editor__separator" />

      <button
        type="button"
        class="editor__button"
        title="Clear Formatting"
        :disabled="isDisabled"
        @click="execCommand('removeFormat')"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <!-- Content area -->
    <div
      ref="contentRef"
      class="editor__content"
      contenteditable
      :data-placeholder="placeholder"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @keyup="updateActiveFormats"
      @mouseup="updateActiveFormats"
    />
  </div>
</template>

<style src="./Editor.scss"></style>

<script setup lang="ts">
import type { EditorProps, EditorEmits } from '../../types';
import { computed, ref, watch, onMounted, nextTick } from "vue";

defineOptions({ name: 'FtpEditor' });

const props = withDefaults(defineProps<EditorProps>(), {
  modelValue: "",
  placeholder: "Enter text...",
  isDisabled: false,
  isInvalid: false,
});

const emit = defineEmits(["update:modelValue", "focus", "blur", "change"]);

const contentRef = ref<HTMLElement | null>(null);
const isFocused = ref(false);
const activeFormats = ref({
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
  insertUnorderedList: false,
  insertOrderedList: false,
});

const execCommand = (command: any, value: string | undefined = undefined) => {
  if (props.isDisabled) return;
  contentRef.value?.focus();
  document.execCommand(command, false, value);
  updateActiveFormats();
  emitValue();
};

const insertLink = () => {
  if (props.isDisabled) return;
  const url = prompt("Enter URL:");
  if (url) {
    execCommand("createLink", url);
  }
};

const updateActiveFormats = () => {
  activeFormats.value = {
    bold: document.queryCommandState("bold"),
    italic: document.queryCommandState("italic"),
    underline: document.queryCommandState("underline"),
    strikeThrough: document.queryCommandState("strikeThrough"),
    insertUnorderedList: document.queryCommandState("insertUnorderedList"),
    insertOrderedList: document.queryCommandState("insertOrderedList"),
  };
};

const onInput = () => {
  emitValue();
};

const emitValue = () => {
  const html = contentRef.value?.innerHTML || "";
  emit("update:modelValue", html);
  emit("change", { value: html });
};

const onFocus = (event: FocusEvent) => {
  isFocused.value = true;
  emit("focus", { originalEvent: event });
};

const onBlur = (event: FocusEvent) => {
  isFocused.value = false;
  emit("blur", { originalEvent: event });
};

// Sync content with modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (contentRef.value && contentRef.value.innerHTML !== newValue) {
      contentRef.value.innerHTML = newValue;
    }
  }
);

onMounted(() => {
  if (contentRef.value && props.modelValue) {
    contentRef.value.innerHTML = props.modelValue;
  }
});

const additionalClasses = computed(() =>
  [
    isFocused.value && "editor--focused",
    props.isDisabled && "editor--disabled",
    props.isInvalid && "editor--invalid",
  ]
    .filter(Boolean)
    .join(" ")
);

defineExpose({
  focus: () => contentRef.value?.focus(),
  blur: () => contentRef.value?.blur(),
  getContent: () => contentRef.value?.innerHTML || "",
  setContent: (html: any) => {
    if (contentRef.value) {
      contentRef.value.innerHTML = html;
      emitValue();
    }
  },
});
</script>
