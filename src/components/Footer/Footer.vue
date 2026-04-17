<template>
  <footer class="site-footer">
    <div class="site-footer__container">
      <div v-if="$slots.logo || logo" class="site-footer__brand">
        <slot name="logo">
          <img v-if="logo" :src="logo" alt="Logo" class="site-footer__logo" />
        </slot>
      </div>
      <div class="site-footer__columns">
        <slot>
          <nav
            v-for="(col, i) in columns"
            :key="i"
            class="site-footer__column"
            :aria-label="col.title"
          >
            <h4 class="site-footer__column-title">{{ col.title }}</h4>
            <ul class="site-footer__links">
              <li v-for="(link, j) in col.links" :key="j">
                <a :href="link.href" class="site-footer__link">{{ link.label }}</a>
              </li>
            </ul>
          </nav>
        </slot>
      </div>
      <div v-if="socialLinks?.length" class="site-footer__social">
        <a
          v-for="(social, i) in socialLinks"
          :key="i"
          :href="social.href"
          class="site-footer__social-link"
          :aria-label="social.label"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i :class="social.icon" aria-hidden="true" />
        </a>
      </div>
    </div>
    <div class="site-footer__bottom">
      <slot name="bottom">
        <p v-if="copyright" class="site-footer__copyright">{{ copyright }}</p>
      </slot>
    </div>
  </footer>
</template>

<style src="./Footer.scss"></style>

<script setup lang="ts">
import type { FooterProps } from '../../types';

defineOptions({ name: 'Footer' });

withDefaults(defineProps<FooterProps>(), {
  columns: () => [],
  socialLinks: () => [],
});
</script>
