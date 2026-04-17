<template>
  <div
    ref="containerRef"
    class="multi-select"
    :class="additionalClasses"
  >
    <div
      v-rough
      class="multi-select__trigger"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      :aria-disabled="isDisabled"
      :tabindex="isDisabled ? -1 : 0"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <div class="multi-select__content">
        <template v-if="selectedItems.length === 0">
          <span class="multi-select__placeholder">{{ placeholder }}</span>
        </template>
        <template v-else-if="display === 'chip'">
          <div class="multi-select__chips">
            <span
              v-for="item in selectedItems"
              :key="getOptionValue(item)"
              class="multi-select__chip"
            >
              <span class="multi-select__chip-label">{{ getOptionLabel(item) }}</span>
              <button
                type="button"
                class="multi-select__chip-remove"
                aria-label="Remove"
                @click.stop="removeItem(item)"
              >
                <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.5 4.5L9.5 9.5M9.5 4.5L4.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </span>
          </div>
        </template>
        <template v-else>
          <span class="multi-select__label">{{ selectedLabels }}</span>
        </template>
      </div>
      <span class="multi-select__icon" :class="{ 'multi-select__icon--open': isOpen }">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </div>

    <Teleport to="body">
      <div
        v-if="isOpen"
        v-rough
        ref="dropdownRef"
        class="multi-select__dropdown"
        :style="dropdownStyle"
      >
        <div v-if="filter" class="multi-select__filter">
          <input
            ref="filterInputRef"
            v-model="filterValue"
            type="text"
            class="multi-select__filter-input"
            placeholder="Search..."
            @keydown="onFilterKeydown"
          />
        </div>
        <div class="multi-select__options" role="listbox" aria-multiselectable="true">
          <div
            v-for="(option, index) in filteredOptions"
            :key="getOptionValue(option)"
            class="multi-select__option"
            :class="{
              'multi-select__option--focused': focusedIndex === index,
              'multi-select__option--selected': isSelected(option)
            }"
            role="option"
            :aria-selected="isSelected(option)"
            @click="toggleOption(option)"
            @mouseenter="focusedIndex = index"
          >
            <span class="multi-select__checkbox" :class="{ 'multi-select__checkbox--checked': isSelected(option) }">
              <svg v-if="isSelected(option)" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="multi-select__option-label">{{ getOptionLabel(option) }}</span>
          </div>
          <div v-if="filteredOptions.length === 0" class="multi-select__empty">
            No results found
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style src="./MultiSelect.scss"></style>

<script setup lang="ts">
import type { MultiSelectProps, MultiSelectEmits } from '../../types';
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue";

defineOptions({ name: 'FtpMultiSelect' });

const props = withDefaults(defineProps<MultiSelectProps>(), {
  modelValue: () => [],
  options: () => [],
  optionLabel: "label",
  optionValue: "value",
  placeholder: "Select...",
  filter: false,
  display: "comma",
  size: "md",
  isDisabled: false,
  isInvalid: false,
});

const emit = defineEmits(["update:modelValue", "change"]);

const containerRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const filterInputRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const filterValue = ref("");
const focusedIndex = ref(0);
const dropdownStyle = ref({});

const getOptionValue = (option: any) => {
  if (typeof option === "string" || typeof option === "number") {
    return option;
  }
  return option[props.optionValue];
};

const getOptionLabel = (option: any) => {
  if (typeof option === "string" || typeof option === "number") {
    return option;
  }
  return option[props.optionLabel];
};

const selectedItems = computed(() => {
  return props.options.filter((option) =>
    props.modelValue.includes(getOptionValue(option))
  );
});

const selectedLabels = computed(() => {
  return selectedItems.value.map((item) => getOptionLabel(item)).join(", ");
});

const filteredOptions = computed(() => {
  if (!filterValue.value) return props.options;
  const search = filterValue.value.toLowerCase();
  return props.options.filter((option) =>
    getOptionLabel(option).toLowerCase().includes(search)
  );
});

const isSelected = (option: any) => {
  return props.modelValue.includes(getOptionValue(option));
};

const toggleOption = (option: any) => {
  const value = getOptionValue(option);
  let newValue;
  if (isSelected(option)) {
    newValue = props.modelValue.filter((v) => v !== value);
  } else {
    newValue = [...props.modelValue, value];
  }
  emit("update:modelValue", newValue);
  emit("change", { value: newValue });
};

const removeItem = (item: any) => {
  const value = getOptionValue(item);
  const newValue = props.modelValue.filter((v) => v !== value);
  emit("update:modelValue", newValue);
  emit("change", { value: newValue });
};

const toggle = () => {
  if (props.isDisabled) return;
  isOpen.value = !isOpen.value;
};

const open = () => {
  if (props.isDisabled || isOpen.value) return;
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;
  filterValue.value = "";
  focusedIndex.value = 0;
};

const updateDropdownPosition = () => {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  dropdownStyle.value = {
    position: "fixed",
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: 1000,
  };
};

const onTriggerKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case "Enter":
    case " ":
      event.preventDefault();
      toggle();
      break;
    case "ArrowDown":
      event.preventDefault();
      open();
      break;
    case "Escape":
      close();
      break;
  }
};

const onFilterKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      focusedIndex.value = Math.min(focusedIndex.value + 1, filteredOptions.value.length - 1);
      break;
    case "ArrowUp":
      event.preventDefault();
      focusedIndex.value = Math.max(focusedIndex.value - 1, 0);
      break;
    case "Enter":
      event.preventDefault();
      if (filteredOptions.value[focusedIndex.value]) {
        toggleOption(filteredOptions.value[focusedIndex.value]);
      }
      break;
    case "Escape":
      close();
      break;
  }
};

const onClickOutside = (event: MouseEvent) => {
  if (
    containerRef.value &&
    !containerRef.value.contains(event.target as Node) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target as Node)
  ) {
    close();
  }
};

watch(isOpen, async (newValue) => {
  if (newValue) {
    updateDropdownPosition();
    await nextTick();
    if (props.filter && filterInputRef.value) {
      filterInputRef.value.focus();
    }
  }
});

onMounted(() => {
  document.addEventListener("click", onClickOutside);
  window.addEventListener("resize", updateDropdownPosition);
  window.addEventListener("scroll", updateDropdownPosition, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onClickOutside);
  window.removeEventListener("resize", updateDropdownPosition);
  window.removeEventListener("scroll", updateDropdownPosition, true);
});

const additionalClasses = computed(() =>
  [
    `multi-select--size-${props.size}`,
    props.isDisabled && "multi-select--disabled",
    props.isInvalid && "multi-select--invalid",
    isOpen.value && "multi-select--open",
  ]
    .filter(Boolean)
    .join(" ")
);
</script>
