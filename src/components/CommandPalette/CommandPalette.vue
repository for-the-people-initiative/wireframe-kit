<template>
  <Teleport to="body">
    <Transition name="command-palette-fade">
      <div
        v-if="open"
        class="command-palette__overlay"
        @click="onOverlayClick"
        @keydown.escape.prevent="close"
      >
        <Transition name="command-palette-scale">
          <div
            v-if="open"
            v-rough="{ severity: 4 }"
            ref="paletteRef"
            class="command-palette"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            @click.stop
            @keydown="onKeyDown"
          >
            <div class="command-palette__search">
              <svg class="command-palette__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref="inputRef"
                v-model="query"
                class="command-palette__input"
                type="text"
                :placeholder="placeholder"
                aria-label="Search commands"
                autocomplete="off"
              />
              <kbd class="command-palette__kbd">ESC</kbd>
            </div>

            <div v-if="filteredCommands.length > 0" class="command-palette__list" role="listbox">
              <template v-for="(group, gi) in groupedCommands" :key="group.label ?? gi">
                <div v-if="group.label" class="command-palette__group-label">{{ group.label }}</div>
                <div
                  v-for="cmd in group.items"
                  :key="cmd.id"
                  class="command-palette__item"
                  :class="{ 'command-palette__item--active': cmd.id === activeId }"
                  role="option"
                  :aria-selected="cmd.id === activeId"
                  @click="selectCommand(cmd)"
                  @mouseenter="activeId = cmd.id"
                >
                  <i v-if="cmd.icon" :class="cmd.icon" class="command-palette__item-icon" aria-hidden="true"></i>
                  <span class="command-palette__item-label">{{ cmd.label }}</span>
                  <kbd v-if="cmd.shortcut" class="command-palette__item-shortcut">{{ cmd.shortcut }}</kbd>
                </div>
              </template>
            </div>

            <div v-else class="command-palette__empty">
              No results found
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style src="./CommandPalette.scss"></style>

<script setup lang="ts">
import type { CommandPaletteProps, CommandPaletteCommand } from '../../types';
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue';

defineOptions({ name: 'CommandPalette' });

const props = withDefaults(defineProps<CommandPaletteProps>(), {
  placeholder: 'Type a command or search…',
  open: false,
});

const emit = defineEmits<{
  (e: 'select', command: CommandPaletteCommand): void
  (e: 'close'): void
  (e: 'update:open', value: boolean): void
}>();

const paletteRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const query = ref('');
const activeId = ref<string | null>(null);

const filteredCommands = computed(() => {
  const q = query.value.toLowerCase().trim();
  if (!q) return props.commands;
  return props.commands.filter(c => c.label.toLowerCase().includes(q));
});

const groupedCommands = computed(() => {
  const groups = new Map<string | undefined, CommandPaletteCommand[]>();
  for (const cmd of filteredCommands.value) {
    const key = cmd.group;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(cmd);
  }
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
});

const close = () => {
  emit('update:open', false);
  emit('close');
};

const selectCommand = (cmd: CommandPaletteCommand) => {
  emit('select', cmd);
  if (cmd.action) cmd.action();
  close();
};

const onOverlayClick = () => close();

const onKeyDown = (event: KeyboardEvent) => {
  const cmds = filteredCommands.value;
  if (!cmds.length) return;

  const currentIndex = cmds.findIndex(c => c.id === activeId.value);

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    const next = currentIndex < cmds.length - 1 ? currentIndex + 1 : 0;
    activeId.value = cmds[next].id;
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    const prev = currentIndex > 0 ? currentIndex - 1 : cmds.length - 1;
    activeId.value = cmds[prev].id;
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const cmd = cmds.find(c => c.id === activeId.value);
    if (cmd) selectCommand(cmd);
  }
};

const onGlobalKeyDown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault();
    emit('update:open', !props.open);
  }
};

watch(() => props.open, async (val) => {
  if (val) {
    query.value = '';
    activeId.value = filteredCommands.value[0]?.id ?? null;
    await nextTick();
    inputRef.value?.focus();
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onMounted(() => document.addEventListener('keydown', onGlobalKeyDown));
onUnmounted(() => {
  document.removeEventListener('keydown', onGlobalKeyDown);
  document.body.style.overflow = '';
});
</script>
