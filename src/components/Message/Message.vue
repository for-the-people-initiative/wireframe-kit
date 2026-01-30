<template>
  <transition name="message">
    <div
      v-if="visible"
      class="message"
      :class="additionalClasses"
      role="alert"
      aria-live="assertive"
    >
      <slot name="container" :close-callback="close">
        <div class="message__content">
          <slot name="icon">
            <span v-if="hasIcon" class="message__icon">
              <!-- Success icon -->
              <svg v-if="severity === 'success'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
              </svg>
              <!-- Info icon -->
              <svg v-else-if="severity === 'info'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
              </svg>
              <!-- Warning icon -->
              <svg v-else-if="severity === 'warn'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="currentColor"/>
              </svg>
              <!-- Error icon -->
              <svg v-else-if="severity === 'error'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
              </svg>
            </span>
          </slot>
          <div class="message__text">
            <slot />
          </div>
          <button
            v-if="closable"
            type="button"
            class="message__close"
            aria-label="Close"
            @click="close"
          >
            <slot name="closeicon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/>
              </svg>
            </slot>
          </button>
        </div>
      </slot>
    </div>
  </transition>
</template>

<style src="./Message.scss"></style>

<script setup lang="ts">
import type { MessageProps, MessageEmits } from '../../types';
import { computed, ref, onMounted, onUnmounted } from "vue";

defineOptions({ name: 'FtpMessage' });

const props = withDefaults(defineProps<MessageProps>(), {
  severity: "info",
  closable: false,
  icon: true,
  life: null,
});

const emit = defineEmits(["close", "life-end"]);

const visible = ref(true);
let lifeTimeout: ReturnType<typeof setTimeout> | null = null;

const hasIcon = computed(() => props.icon);

const additionalClasses = computed(() =>
  [`message--${props.severity}`].join(" ")
);

const close = () => {
  visible.value = false;
  emit("close");
};

onMounted(() => {
  if (props.life) {
    lifeTimeout = setTimeout(() => {
      close();
      emit("life-end");
    }, props.life);
  }
});

onUnmounted(() => {
  if (lifeTimeout) {
    clearTimeout(lifeTimeout);
  }
});
</script>
