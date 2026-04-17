<template>
  <div class="file-upload" :class="additionalClasses">
    <!-- Dropzone -->
    <div
      v-rough
      class="file-upload__dropzone"
      :class="{ 'file-upload__dropzone--active': isDragging }"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        class="file-upload__input"
        :accept="accept"
        :multiple="multiple"
        :disabled="isDisabled"
        @change="onFileSelect"
      />

      <div class="file-upload__content">
        <svg class="file-upload__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p class="file-upload__text-primary">
          <slot name="header">
            {{ isDragging ? 'Drop files here' : 'Drag and drop files here' }}
          </slot>
        </p>
        <p class="file-upload__text-secondary">
          <slot name="subheader">
            or click to browse
          </slot>
        </p>
      </div>
    </div>

    <!-- File list -->
    <div v-if="files.length > 0" class="file-upload__list">
      <div
        v-for="(file, index) in files"
        :key="file.name + index"
        class="file-upload__item"
      >
        <div class="file-upload__file-info">
          <span class="file-upload__file-name">{{ file.name }}</span>
          <span class="file-upload__file-size">{{ formatFileSize(file.size) }}</span>
        </div>
        <button
          type="button"
          class="file-upload__remove"
          aria-label="Remove file"
          @click="removeFile(index)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style src="./FileUpload.scss"></style>

<script setup lang="ts">
import type { FileUploadProps, FileUploadEmits } from '../../types';
import { computed, ref } from "vue";

defineOptions({ name: 'FileUpload' });

const props = withDefaults(defineProps<FileUploadProps>(), {
  accept: undefined,
  multiple: false,
  maxFileSize: null,
  maxFiles: null,
  isDisabled: false,
});

const emit = defineEmits(["select", "remove", "error"]);

const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const files = ref<File[]>([]);

const additionalClasses = computed(() =>
  [
    props.isDisabled && "file-upload--disabled",
  ]
    .filter(Boolean)
    .join(" ")
);

const triggerFileInput = () => {
  if (!props.isDisabled) {
    fileInputRef.value?.click();
  }
};

const onDragEnter = () => {
  if (!props.isDisabled) {
    isDragging.value = true;
  }
};

const onDragOver = () => {
  if (!props.isDisabled) {
    isDragging.value = true;
  }
};

const onDragLeave = () => {
  isDragging.value = false;
};

const onDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (props.isDisabled) return;

  const droppedFiles = Array.from(event.dataTransfer!.files);
  processFiles(droppedFiles);
};

const onFileSelect = (event: Event) => {
  const selectedFiles = Array.from((event.target as HTMLInputElement).files!);
  processFiles(selectedFiles);
  (event.target as HTMLInputElement).value = "";
};

const processFiles = (newFiles: any) => {
  const validFiles = [];

  for (const file of newFiles) {
    // Check file size
    if (props.maxFileSize && file.size > props.maxFileSize) {
      emit("error", { type: "size", file, maxSize: props.maxFileSize });
      continue;
    }

    // Check max files
    if (props.maxFiles && files.value.length + validFiles.length >= props.maxFiles) {
      emit("error", { type: "limit", file, maxFiles: props.maxFiles });
      break;
    }

    validFiles.push(file);
  }

  if (validFiles.length > 0) {
    if (props.multiple) {
      files.value = [...files.value, ...validFiles];
    } else {
      files.value = [validFiles[0]];
    }
    emit("select", files.value);
  }
};

const removeFile = (index: any) => {
  const removed = files.value[index];
  files.value = files.value.filter((_, i) => i !== index);
  emit("remove", removed);
};

const formatFileSize = (bytes: any) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

// Expose methods for parent components
defineExpose({
  files,
  clear: () => { files.value = []; },
});
</script>
