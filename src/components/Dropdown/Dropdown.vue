<template>
  <div
    ref="containerRef"
    class="dropdown"
    :class="additionalClasses"
  >
    <button
      v-rough="{ severity: 2 }"
      ref="triggerRef"
      type="button"
      class="dropdown__trigger"
      :disabled="isDisabled"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      :aria-describedby="ariaDescribedby || undefined"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <span class="dropdown__value">
        {{ displayValue }}
      </span>
      <span class="dropdown__icon" :class="{ 'dropdown__icon--open': isOpen }">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        v-rough
        ref="panelRef"
        class="dropdown__panel"
        :style="panelStyle"
      >
        <div v-if="filter" class="dropdown__filter">
          <input
            ref="filterInputRef"
            v-model="filterValue"
            type="text"
            class="dropdown__filter-input"
            placeholder="Search..."
            @input="onFilterInput"
            @keydown="onFilterKeydown"
          />
          <svg
            class="dropdown__filter-icon"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 12C9.76142 12 12 9.76142 12 7C12 4.23858 9.76142 2 7 2C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M14 14L10.5 10.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="dropdown__list" role="listbox">
          <div
            v-for="(option, index) in filteredOptions"
            :key="getOptionValue(option)"
            class="dropdown__option"
            :class="{
              'dropdown__option--selected': isSelected(option),
              'dropdown__option--focused': focusedIndex === index,
              'dropdown__option--disabled': option.disabled,
            }"
            role="option"
            :aria-selected="isSelected(option)"
            @click="!option.disabled && selectOption(option)"
            @mouseenter="focusedIndex = index"
          >
            <span class="dropdown__option-label">{{ getOptionLabel(option) }}</span>
          </div>
          <div v-if="filteredOptions.length === 0" class="dropdown__empty">
            No results found
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style src="./Dropdown.scss"></style>

<script setup lang="ts">
import type { DropdownProps, DropdownEmits } from '../../types';
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from "vue";

defineOptions({ name: 'Dropdown' });

const props = withDefaults(defineProps<DropdownProps>(), {
  modelValue: null,
  options: () => [],
  optionLabel: "label",
  optionValue: "value",
  filter: false,
  placeholder: "Select an option",
  size: "md",
  isDisabled: false,
  isInvalid: false,
});

const emit = defineEmits(["update:modelValue", "change", "show", "hide", "filter"]);

const containerRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const filterInputRef = ref<HTMLElement | null>(null);

const isOpen = ref(false);
const filterValue = ref("");
const focusedIndex = ref(-1);
const panelStyle = ref({});

const getOptionLabel = (option: any) => {
  if (typeof option === "string" || typeof option === "number") {
    return option;
  }
  return option[props.optionLabel];
};

const getOptionValue = (option: any) => {
  if (typeof option === "string" || typeof option === "number") {
    return option;
  }
  return option[props.optionValue];
};

const displayValue = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) {
    return props.placeholder;
  }
  const selectedOption = props.options.find(
    (option) => getOptionValue(option) === props.modelValue
  );
  return selectedOption ? getOptionLabel(selectedOption) : props.placeholder;
});

const filteredOptions = computed((): any[] => {
  if (!filterValue.value) {
    return props.options;
  }
  const searchTerm = filterValue.value.toLowerCase();
  return props.options.filter((option) => {
    const label = getOptionLabel(option);
    return String(label).toLowerCase().includes(searchTerm);
  });
});

const isSelected = (option: any) => {
  return props.modelValue === getOptionValue(option);
};

const selectOption = (option: any) => {
  if (props.isDisabled || option.disabled) return;

  const value = getOptionValue(option);
  emit("update:modelValue", value);
  emit("change", { value, originalEvent: event });
  close();
};

const updatePanelPosition = () => {
  if (!triggerRef.value) return;

  const rect = triggerRef.value.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const spaceBelow = viewportHeight - rect.bottom;
  const spaceAbove = rect.top;
  const panelHeight = 300; // approximate max height

  const openBelow = spaceBelow >= panelHeight || spaceBelow >= spaceAbove;

  panelStyle.value = {
    position: "fixed",
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: 1000,
    ...(openBelow
      ? { top: `${rect.bottom + 4}px` }
      : { bottom: `${viewportHeight - rect.top + 4}px` }),
  };
};

const open = () => {
  if (isOpen.value || props.isDisabled) return;

  isOpen.value = true;
  filterValue.value = "";
  focusedIndex.value = -1;

  nextTick(() => {
    updatePanelPosition();
    if (props.filter && filterInputRef.value) {
      filterInputRef.value.focus();
    }
  });

  emit("show");
};

const close = () => {
  if (!isOpen.value) return;

  isOpen.value = false;
  filterValue.value = "";
  emit("hide");
};

const toggle = () => {
  if (isOpen.value) {
    close();
  } else {
    open();
  }
};

const onTriggerKeydown = (event: KeyboardEvent) => {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    if (!isOpen.value) {
      open();
    }
  } else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    toggle();
  } else if (event.key === "Escape") {
    close();
  }
};

const onFilterInput = (event: Event) => {
  focusedIndex.value = 0;
  emit("filter", { value: filterValue.value, originalEvent: event });
};

const onFilterKeydown = (event: KeyboardEvent) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    focusedIndex.value = Math.min(focusedIndex.value + 1, filteredOptions.value.length - 1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    focusedIndex.value = Math.max(focusedIndex.value - 1, 0);
  } else if (event.key === "Enter") {
    event.preventDefault();
    if (focusedIndex.value >= 0 && filteredOptions.value[focusedIndex.value]) {
      const option = filteredOptions.value[focusedIndex.value];
      if (!option.disabled) {
        selectOption(option);
      }
    }
  } else if (event.key === "Escape") {
    close();
    triggerRef.value?.focus();
  }
};

const onClickOutside = (event: MouseEvent) => {
  if (!containerRef.value?.contains(event.target as Node) && !panelRef.value?.contains(event.target as Node)) {
    close();
  }
};

const onScroll = () => {
  if (isOpen.value) {
    updatePanelPosition();
  }
};

onMounted(() => {
  document.addEventListener("click", onClickOutside);
  window.addEventListener("scroll", onScroll, true);
  window.addEventListener("resize", onScroll);
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
  window.removeEventListener("scroll", onScroll, true);
  window.removeEventListener("resize", onScroll);
});

const additionalClasses = computed(() => [
  `dropdown--size-${props.size}`,
  isOpen.value && "dropdown--open",
  props.isDisabled && "dropdown--disabled",
  props.isInvalid && "dropdown--invalid",
  (props.modelValue === null || props.modelValue === undefined) && "dropdown--placeholder",
].filter(Boolean).join(" "));
</script>
