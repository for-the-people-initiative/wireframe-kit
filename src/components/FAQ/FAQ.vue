<template>
  <div class="faq" :class="`faq--${variant}`">
    <Accordion :multiple="true">
      <AccordionTab
        v-for="(item, i) in items"
        :key="i"
        :header="item.question"
      >
        <div v-html="item.answer" />
      </AccordionTab>
    </Accordion>
  </div>
</template>

<style src="./FAQ.scss"></style>

<script setup lang="ts">
import type { FAQProps } from '../../types';
import Accordion from '../Accordion/Accordion.vue';
import AccordionTab from '../Accordion/AccordionTab.vue';

defineOptions({ name: 'FAQ' });

withDefaults(defineProps<FAQProps>(), {
  items: () => [],
  variant: 'default',
});
</script>
