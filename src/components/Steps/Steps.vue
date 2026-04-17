<template>
  <nav v-rough class="steps" :class="additionalClasses" aria-label="Progress steps">
    <ol class="steps__list">
      <li
        v-for="(step, index) in model"
        :key="index"
        class="steps__item"
        :class="getStepClasses(index)"
      >
        <!-- Connector (before step, except first) -->
        <div
          v-if="index > 0"
          v-rough="{ shape: 'hline', severity: 1 }"
          class="steps__connector"
          :class="{ 'steps__connector--complete': index <= activeIndex }"
        ></div>

        <!-- Step content -->
        <button
          type="button"
          class="steps__marker-wrapper"
          :disabled="isReadonly || step.disabled"
          :aria-current="index === activeIndex ? 'step' : undefined"
          :aria-label="`Step ${index + 1}: ${step.label}`"
          @click="onStepClick($event, step, index)"
        >
          <span class="steps__marker">
            <svg
              v-if="index < activeIndex"
              class="steps__check-icon"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3 8.5L6.5 12L13 4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span v-else class="steps__number">{{ index + 1 }}</span>
          </span>
          <span class="steps__label">{{ step.label }}</span>
        </button>
      </li>
    </ol>
  </nav>
</template>

<style src="./Steps.scss"></style>

<script setup lang="ts">
import type { StepsProps, StepsEmits } from '../../types';
import { computed } from "vue";

defineOptions({ name: 'Steps' });

const props = withDefaults(defineProps<StepsProps>(), {
  model: () => [],
  activeIndex: 0,
  isReadonly: false,
});

const emit = defineEmits(["update:activeIndex", "step-click"]);

const additionalClasses = computed(() =>
  [props.isReadonly && "steps--readonly"].filter(Boolean).join(" ")
);

const getStepClasses = (index: any) => {
  const classes = [];

  if (index < props.activeIndex) {
    classes.push("steps__item--complete");
  } else if (index === props.activeIndex) {
    classes.push("steps__item--active");
  } else {
    classes.push("steps__item--incomplete");
  }

  if (props.model[index]?.disabled) {
    classes.push("steps__item--disabled");
  }

  return classes.join(" ");
};

const onStepClick = (event: MouseEvent, step: any, index: any) => {
  if (props.isReadonly || step.disabled) return;

  emit("update:activeIndex", index);
  emit("step-click", {
    originalEvent: event,
    item: step,
    index,
  });
};
</script>
