<template>
  <div ref="containerRef" class="calendar" :class="additionalClasses">
    <!-- Input trigger -->
    <div v-if="!inline" class="calendar__input-wrapper" @click="togglePanel">
      <input
        ref="inputRef"
        class="calendar__input"
        type="text"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="isDisabled"
        :aria-invalid="isInvalid || undefined"
        readonly
        @focus="onInputFocus"
        @blur="onInputBlur"
      />
      <span class="calendar__input-icon">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" stroke-width="1.5" />
          <path d="M2 6H14" stroke="currentColor" stroke-width="1.5" />
          <path d="M5 1V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M11 1V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </span>
    </div>

    <!-- Calendar panel -->
    <Teleport :to="inline ? null : 'body'" :disabled="inline">
      <div
        v-if="inline || isPanelOpen"
        ref="panelRef"
        class="calendar__panel"
        :class="{ 'calendar__panel--inline': inline }"
        :style="!inline ? panelStyle : {}"
      >
        <!-- Header with navigation -->
        <div class="calendar__header">
          <button
            type="button"
            class="calendar__nav calendar__nav--prev"
            aria-label="Previous month"
            @click="navigateMonth(-1)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <div class="calendar__title">
            <button type="button" class="calendar__title-btn" @click="toggleView">
              {{ monthNames[viewDate.getMonth()] }} {{ viewDate.getFullYear() }}
            </button>
          </div>

          <button
            type="button"
            class="calendar__nav calendar__nav--next"
            aria-label="Next month"
            @click="navigateMonth(1)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>

        <!-- Day view -->
        <div v-if="currentView === 'day'" class="calendar__body" role="grid" aria-label="Calendar">
          <div class="calendar__weekdays" role="row">
            <span v-for="day in weekdayNames" :key="day" class="calendar__weekday" role="columnheader">
              {{ day }}
            </span>
          </div>
          <div class="calendar__days">
            <button
              v-for="(day, index) in calendarDays"
              :key="index"
              type="button"
              class="calendar__day"
              :class="getDayClasses(day)"
              :disabled="!day.currentMonth"
              :aria-label="day.currentMonth ? formatFullDate(day.date) : undefined"
              :aria-selected="isSelected(day.date) || undefined"
              @click="selectDate(day)"
            >
              {{ day.day }}
            </button>
          </div>
        </div>

        <!-- Month view -->
        <div v-else-if="currentView === 'month'" class="calendar__months">
          <button
            v-for="(month, index) in monthNames"
            :key="index"
            type="button"
            class="calendar__month"
            :class="{ 'calendar__month--selected': isCurrentMonth(index) }"
            @click="selectMonth(index)"
          >
            {{ month.substring(0, 3) }}
          </button>
        </div>

        <!-- Year view -->
        <div v-else-if="currentView === 'year'" class="calendar__years">
          <button
            v-for="year in yearRange"
            :key="year"
            type="button"
            class="calendar__year"
            :class="{ 'calendar__year--selected': isCurrentYear(year) }"
            @click="selectYear(year)"
          >
            {{ year }}
          </button>
        </div>

        <!-- Footer with today button -->
        <div v-if="showTodayButton" class="calendar__footer">
          <button type="button" class="calendar__today-btn" @click="goToToday">
            Today
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style src="./Calendar.scss"></style>

<script setup lang="ts">
import type { CalendarProps, CalendarEmits } from '../../types';
import { computed, ref, watch, onMounted, onUnmounted } from "vue";

defineOptions({ name: 'FtpCalendar' });

const props = withDefaults(defineProps<CalendarProps>(), {
  modelValue: null,
  placeholder: "Select date",
  dateFormat: "dd/mm/yyyy",
  selectionMode: "single",
  minDate: null,
  maxDate: null,
  inline: false,
  showTodayButton: false,
  size: "md",
  isDisabled: false,
  isInvalid: false,
});

const emit = defineEmits(["update:modelValue", "select", "show", "hide"]);

const containerRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const isPanelOpen = ref(false);
const isFocused = ref(false);
const viewDate = ref(new Date());
const currentView = ref("day");
const panelStyle = ref({});

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weekdayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const today = new Date();
today.setHours(0, 0, 0, 0);

const formatDate = (date: any) => {
  if (!date) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return props.dateFormat
    .replace("dd", day)
    .replace("mm", month)
    .replace("yyyy", String(year));
};

const formatFullDate = (date: any) => {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
};

const displayValue = computed(() => {
  if (!props.modelValue) return "";
  if (props.selectionMode === "range" && Array.isArray(props.modelValue)) {
    const [start, end] = props.modelValue;
    if (start && end) {
      return `${formatDate(start)} - ${formatDate(end)}`;
    }
    if (start) {
      return formatDate(start);
    }
    return "";
  }
  return formatDate(props.modelValue);
});

const calendarDays = computed(() => {
  const year = viewDate.value.getFullYear();
  const month = viewDate.value.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();

  const days = [];

  // Previous month days
  const prevMonth = new Date(year, month, 0);
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({
      day: prevMonth.getDate() - i,
      date: new Date(year, month - 1, prevMonth.getDate() - i),
      currentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({
      day: i,
      date: new Date(year, month, i),
      currentMonth: true,
    });
  }

  // Next month days
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      date: new Date(year, month + 1, i),
      currentMonth: false,
    });
  }

  return days;
});

const yearRange = computed(() => {
  const currentYear = viewDate.value.getFullYear();
  const startYear = currentYear - 6;
  const years = [];
  for (let i = 0; i < 12; i++) {
    years.push(startYear + i);
  }
  return years;
});

const isSameDay = (date1: any, date2: any) => {
  if (!date1 || !date2) return false;
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

const isDateInRange = (date: any) => {
  if (props.selectionMode !== "range" || !Array.isArray(props.modelValue)) return false;
  const [start, end] = props.modelValue;
  if (!start || !end) return false;
  return date > start && date < end;
};

const isSelected = (date: any) => {
  if (!props.modelValue) return false;
  if (props.selectionMode === "range" && Array.isArray(props.modelValue)) {
    return props.modelValue.some((d) => d && isSameDay(d, date));
  }
  return isSameDay(props.modelValue, date);
};

const getDayClasses = (day: any) => {
  return {
    "calendar__day--other-month": !day.currentMonth,
    "calendar__day--today": isSameDay(day.date, today),
    "calendar__day--selected": isSelected(day.date),
    "calendar__day--in-range": isDateInRange(day.date),
  };
};

const isCurrentMonth = (monthIndex: any) => {
  const selected = props.modelValue instanceof Date ? props.modelValue : null;
  return selected && selected.getMonth() === monthIndex && selected.getFullYear() === viewDate.value.getFullYear();
};

const isCurrentYear = (year: any) => {
  const selected = props.modelValue instanceof Date ? props.modelValue : null;
  return selected && selected.getFullYear() === year;
};

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
  if (isPanelOpen.value) {
    closePanel();
  } else {
    openPanel();
  }
};

const openPanel = () => {
  isPanelOpen.value = true;
  currentView.value = "day";
  if (props.modelValue instanceof Date) {
    viewDate.value = new Date(props.modelValue);
  }
  updatePanelPosition();
  emit("show");
};

const closePanel = () => {
  isPanelOpen.value = false;
  emit("hide");
};

const toggleView = () => {
  if (currentView.value === "day") {
    currentView.value = "month";
  } else if (currentView.value === "month") {
    currentView.value = "year";
  } else {
    currentView.value = "day";
  }
};

const navigateMonth = (offset: any) => {
  const newDate = new Date(viewDate.value);
  newDate.setMonth(newDate.getMonth() + offset);
  viewDate.value = newDate;
};

const selectDate = (day: any) => {
  if (!day.currentMonth) return;

  if (props.selectionMode === "range") {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : [null, null];
    if (!current[0] || (current[0] && current[1])) {
      emit("update:modelValue", [day.date, null]);
    } else {
      const start = current[0];
      if (day.date < start) {
        emit("update:modelValue", [day.date, start]);
      } else {
        emit("update:modelValue", [start, day.date]);
      }
      if (!props.inline) closePanel();
    }
  } else {
    emit("update:modelValue", day.date);
    emit("select", { value: day.date });
    if (!props.inline) closePanel();
  }
};

const selectMonth = (monthIndex: any) => {
  const newDate = new Date(viewDate.value);
  newDate.setMonth(monthIndex);
  viewDate.value = newDate;
  currentView.value = "day";
};

const selectYear = (year: any) => {
  const newDate = new Date(viewDate.value);
  newDate.setFullYear(year);
  viewDate.value = newDate;
  currentView.value = "month";
};

const goToToday = () => {
  viewDate.value = new Date();
  if (props.selectionMode === "single") {
    selectDate({ date: new Date(), currentMonth: true });
  }
};

const onInputFocus = () => {
  isFocused.value = true;
};

const onInputBlur = () => {
  isFocused.value = false;
};

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  if (!containerRef.value || !panelRef.value) return;
  if (
    !containerRef.value.contains(event.target as Node) &&
    !panelRef.value.contains(event.target as Node)
  ) {
    closePanel();
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
    `calendar--size-${props.size}`,
    props.inline && "calendar--inline",
    isFocused.value && "calendar--focused",
    props.isDisabled && "calendar--disabled",
    props.isInvalid && "calendar--invalid",
  ]
    .filter(Boolean)
    .join(" ")
);

defineExpose({
  show: openPanel,
  hide: closePanel,
});
</script>
