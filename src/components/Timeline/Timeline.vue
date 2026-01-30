<template>
  <div class="timeline" :class="additionalClasses">
    <div
      v-for="(event, index) in value"
      :key="index"
      class="timeline__item"
      :class="getItemClasses(index)"
    >
      <div class="timeline__opposite">
        <slot name="opposite" :item="event" :index="index">
          <span v-if="event.date" class="timeline__date">{{ event.date }}</span>
        </slot>
      </div>
      <div class="timeline__separator">
        <div class="timeline__connector timeline__connector--before" v-if="index > 0" />
        <div class="timeline__marker" :style="getMarkerStyle(event)">
          <slot name="marker" :item="event" :index="index">
            <span class="timeline__marker-dot" />
          </slot>
        </div>
        <div class="timeline__connector timeline__connector--after" v-if="index < value.length - 1" />
      </div>
      <div class="timeline__content">
        <slot name="content" :item="event" :index="index">
          <div class="timeline__event">
            <h4 v-if="event.title" class="timeline__title">{{ event.title }}</h4>
            <p v-if="event.description" class="timeline__description">{{ event.description }}</p>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<style src="./Timeline.scss"></style>

<script setup lang="ts">
import type { TimelineProps, TimelineEvent } from '../../types';
import { computed } from "vue";

defineOptions({ name: 'FtpTimeline' });

const props = withDefaults(defineProps<TimelineProps>(), {
  align: "left",
  layout: "vertical",
});

const colorMap: Record<string, string> = {
  primary: "var(--timeline-colors-primary)",
  success: "var(--timeline-colors-success)",
  warning: "var(--timeline-colors-warning)",
  danger: "var(--timeline-colors-danger)",
};

function getMarkerStyle(event: TimelineEvent) {
  if (event.color) {
    const color = colorMap[event.color] || event.color;
    return { "--timeline-marker-color": color };
  }
  return {};
}

function getItemClasses(index: any) {
  const classes = [];
  if (props.align === "alternate") {
    classes.push(index % 2 === 0 ? "timeline__item--left" : "timeline__item--right");
  }
  return classes;
}

const additionalClasses = computed(() =>
  [
    `timeline--align-${props.align}`,
    `timeline--layout-${props.layout}`,
  ]
    .filter(Boolean)
    .join(" ")
);
</script>
