<template>
  <div
    v-rough
    class="listbox"
    :class="additionalClasses"
    role="listbox"
    :aria-multiselectable="multiple"
    :aria-disabled="isDisabled"
  >
    <div v-if="filter" class="listbox__filter">
      <input
        v-model="filterValue"
        type="text"
        class="listbox__filter-input"
        placeholder="Search..."
        @input="onFilterInput"
      />
      <svg
        class="listbox__filter-icon"
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
    <div class="listbox__list" role="group">
      <div
        v-for="(option, index) in filteredOptions"
        :key="getOptionValue(option)"
        class="listbox__option"
        :class="{
          'listbox__option--selected': isSelected(option),
          'listbox__option--focused': focusedIndex === index,
          'listbox__option--disabled': option.disabled,
        }"
        role="option"
        :aria-selected="isSelected(option)"
        :aria-disabled="option.disabled"
        :tabindex="option.disabled ? -1 : 0"
        @click="!option.disabled && selectOption(option)"
        @keydown="onOptionKeydown($event, option, index)"
      >
        <span v-if="multiple" class="listbox__checkbox">
          <svg
            v-if="isSelected(option)"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span class="listbox__option-label">{{ getOptionLabel(option) }}</span>
      </div>
      <div v-if="filteredOptions.length === 0" class="listbox__empty">
        No results found
      </div>
    </div>
  </div>
</template>

<style src="./ListBox.scss"></style>

<script setup lang="ts">
import type { ListBoxProps, ListBoxEmits } from '../../types';
import { computed, ref } from "vue";

defineOptions({ name: 'ListBox' });

const props = withDefaults(defineProps<ListBoxProps>(), {
  modelValue: null,
  options: () => [],
  optionLabel: "label",
  optionValue: "value",
  multiple: false,
  filter: false,
  isDisabled: false,
});

const emit = defineEmits(["update:modelValue", "change", "filter"]);

const filterValue = ref("");
const focusedIndex = ref(-1);

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
  const value = getOptionValue(option);
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(value);
  }
  return props.modelValue === value;
};

const selectOption = (option: any) => {
  if (props.isDisabled || option.disabled) return;

  const value = getOptionValue(option);

  if (props.multiple) {
    const currentValue = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const index = currentValue.indexOf(value);

    if (index > -1) {
      currentValue.splice(index, 1);
    } else {
      currentValue.push(value);
    }

    emit("update:modelValue", currentValue);
    emit("change", { value: currentValue, originalEvent: event });
  } else {
    emit("update:modelValue", value);
    emit("change", { value, originalEvent: event });
  }
};

const onFilterInput = (event: Event) => {
  emit("filter", { value: filterValue.value, originalEvent: event });
};

const onOptionKeydown = (event: KeyboardEvent, option: any, index: any) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (!option.disabled) {
      selectOption(option);
    }
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    const nextIndex = Math.min(index + 1, filteredOptions.value.length - 1);
    focusedIndex.value = nextIndex;
    focusOption(nextIndex);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    const prevIndex = Math.max(index - 1, 0);
    focusedIndex.value = prevIndex;
    focusOption(prevIndex);
  }
};

const focusOption = (index: any) => {
  const options = document.querySelectorAll(".listbox__option");
  if (options[index]) {
    (options[index] as HTMLElement).focus();
  }
};

const additionalClasses = computed(() => [
  props.isDisabled && "listbox--disabled",
  props.multiple && "listbox--multiple",
].filter(Boolean).join(" "));
</script>
