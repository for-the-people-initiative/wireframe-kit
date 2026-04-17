<template>
  <blockquote v-rough="{ disabled: variant !== 'card' }" class="testimonial" :class="`testimonial--${variant}`">
    <div v-if="rating" class="testimonial__rating" :aria-label="`${rating} out of 5 stars`">
      <span v-for="i in 5" :key="i" class="testimonial__star" :class="{ 'testimonial__star--filled': i <= rating }">★</span>
    </div>
    <p class="testimonial__quote">{{ quote }}</p>
    <footer class="testimonial__author">
      <img v-if="avatar" :src="avatar" :alt="author" class="testimonial__avatar" />
      <div class="testimonial__info">
        <cite class="testimonial__name">{{ author }}</cite>
        <span v-if="role || company" class="testimonial__role">
          {{ role }}<template v-if="role && company">, </template>{{ company }}
        </span>
      </div>
    </footer>
  </blockquote>
</template>

<style src="./Testimonial.scss"></style>

<script setup lang="ts">
import type { TestimonialProps } from '../../types';

defineOptions({ name: 'FtpTestimonial' });

withDefaults(defineProps<TestimonialProps>(), {
  variant: 'card',
});
</script>
