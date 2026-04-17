<template>
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <ol class="breadcrumb__list">
      <!-- Home item -->
      <li v-if="home" class="breadcrumb__item">
        <a
          v-if="home.url"
          :href="home.url"
          class="breadcrumb__link"
          :aria-label="home.label || 'Home'"
        >
          <i v-if="home.icon" :class="home.icon" class="breadcrumb__icon"></i>
          <svg
            v-else
            class="breadcrumb__home-icon"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M2 6.5L8 2L14 6.5V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V6.5Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M6 14V9H10V14"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span v-if="home.label && home.icon" class="breadcrumb__label">{{ home.label }}</span>
        </a>
        <span v-else class="breadcrumb__text">
          <i v-if="home.icon" :class="home.icon" class="breadcrumb__icon"></i>
          <svg
            v-else
            class="breadcrumb__home-icon"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M2 6.5L8 2L14 6.5V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V6.5Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M6 14V9H10V14"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span v-if="home.label && home.icon" class="breadcrumb__label">{{ home.label }}</span>
        </span>
      </li>

      <!-- Separator after home -->
      <li v-if="home && model && model.length > 0" class="breadcrumb__separator" aria-hidden="true">
        <slot name="separator">
          <svg
            class="breadcrumb__separator-icon"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 4L10 8L6 12"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </slot>
      </li>

      <!-- Model items -->
      <template v-for="(item, index) in model" :key="index">
        <li
          class="breadcrumb__item"
          :class="{ 'breadcrumb__item--current': index === model.length - 1 }"
        >
          <a
            v-if="item.url && index !== model.length - 1"
            :href="item.url"
            class="breadcrumb__link"
          >
            <i v-if="item.icon" :class="item.icon" class="breadcrumb__icon"></i>
            <span class="breadcrumb__label">{{ item.label }}</span>
          </a>
          <span v-else class="breadcrumb__text" :aria-current="index === model.length - 1 ? 'page' : undefined">
            <i v-if="item.icon" :class="item.icon" class="breadcrumb__icon"></i>
            <span class="breadcrumb__label">{{ item.label }}</span>
          </span>
        </li>

        <!-- Separator (not after last item) -->
        <li v-if="index < model.length - 1" class="breadcrumb__separator" aria-hidden="true">
          <slot name="separator">
            <svg
              class="breadcrumb__separator-icon"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 4L10 8L6 12"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </slot>
        </li>
      </template>
    </ol>
  </nav>
</template>

<style src="./Breadcrumb.scss"></style>

<script setup lang="ts">
import type { BreadcrumbProps } from '../../types';

defineOptions({ name: 'Breadcrumb' });

const props = withDefaults(defineProps<BreadcrumbProps>(), {
  model: () => [],
});
</script>
