<template>
  <div v-rough class="toolbar" role="toolbar">
    <div v-if="$slots.start" class="toolbar__start">
      <slot name="start" />
    </div>
    <div v-if="$slots.center" class="toolbar__center">
      <slot name="center" />
    </div>
    <div v-if="$slots.end" class="toolbar__end">
      <slot name="end" />
    </div>
    <slot />
  </div>
</template>

<style src="./Toolbar.scss"></style>

<script setup lang="ts">

defineOptions({ name: 'FtpToolbar' });
// Toolbar is a simple layout component with slots
// No props needed for basic functionality
</script>
