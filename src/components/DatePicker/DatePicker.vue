<template>
  <div class="date-picker" :class="{ 'date-picker--disabled': disabled }">
    <div v-rough class="date-picker__input-wrapper" @click="toggleCalendar">
      <input
        ref="inputRef"
        class="date-picker__input"
        :class="{ 'date-picker__input--active': isOpen }"
        type="text"
        readonly
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        aria-haspopup="dialog"
        :aria-expanded="isOpen"
        @focus="openCalendar"
        @keydown.escape="closeCalendar"
        @keydown.enter="toggleCalendar"
      />
      <svg class="date-picker__calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    </div>

    <Teleport to="body">
      <Transition name="date-picker-dropdown">
        <div
          v-if="isOpen"
          v-rough
          ref="dropdownRef"
          class="date-picker__dropdown"
          :style="dropdownStyle"
          @mousedown.prevent
        >
          <Calendar
            :model-value="modelValue"
            inline
            :min-date="minDate"
            :max-date="maxDate"
            @update:model-value="onDateSelect"
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style src="./DatePicker.scss"></style>

<script setup lang="ts">
import type { DatePickerProps } from '../../types';
import Calendar from '../Calendar/Calendar.vue';
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue';

defineOptions({ name: 'FtpDatePicker' });

const props = withDefaults(defineProps<DatePickerProps>(), {
  placeholder: 'Select a date',
  format: 'yyyy-MM-dd',
  disabled: false,
  locale: 'en-US',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: Date | null): void
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const dropdownStyle = ref<Record<string, string>>({});

const displayValue = computed(() => {
  if (!props.modelValue) return '';
  try {
    return new Intl.DateTimeFormat(props.locale).format(props.modelValue);
  } catch {
    return props.modelValue.toLocaleDateString();
  }
});

const positionDropdown = async () => {
  await nextTick();
  if (!inputRef.value) return;
  const rect = inputRef.value.getBoundingClientRect();
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    zIndex: '9998',
  };
};

const openCalendar = () => {
  if (props.disabled) return;
  isOpen.value = true;
  positionDropdown();
};

const closeCalendar = () => {
  isOpen.value = false;
};

const toggleCalendar = () => {
  if (isOpen.value) closeCalendar();
  else openCalendar();
};

const onDateSelect = (value: Date | Date[] | null) => {
  emit('update:modelValue', Array.isArray(value) ? value[0] ?? null : value);
  closeCalendar();
};

const onClickOutside = (event: MouseEvent) => {
  if (!isOpen.value) return;
  const target = event.target as Node;
  if (inputRef.value?.contains(target) || dropdownRef.value?.contains(target)) return;
  closeCalendar();
};

onMounted(() => document.addEventListener('mousedown', onClickOutside));
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside));
</script>
