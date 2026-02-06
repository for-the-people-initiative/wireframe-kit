<template>
  <component
    :is="linkComponent"
    :href="href || undefined"
    class="live-tile"
    :class="{ clickable: !href }"
    :role="href ? undefined : 'button'"
    @click="handleClick"
  >
    <!-- Badge -->
    <div v-if="badge" class="tile-badge" :class="badgeClass">
      <template v-if="badge === 'dot'">
        <span class="badge-dot"></span>
      </template>
      <template v-else-if="badge === 'check'">
        <i class="pi pi-check"></i>
      </template>
      <template v-else>
        {{ badge }}
      </template>
    </div>

    <!-- Static Header (optional) -->
    <div v-if="$slots.header" class="tile-header">
      <slot name="header" />
    </div>

    <!-- Tile Faces Container -->
    <div
      class="tile-faces"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @mousedown="onMouseDown"
    >
      <Transition :name="slideDirection" mode="out-in">
        <div :key="currentFaceIndex" class="tile-face">
          <!-- Support numbered face slots (face-0, face-1, face-2, etc.) -->
          <slot :name="`face-${currentFaceIndex}`">
            <!-- Fallback to legacy front/back slots for backward compatibility -->
            <slot v-if="currentFaceIndex === 0" name="front">
              <!-- Default loading placeholder when no content -->
              <div class="tile-loading-placeholder">
                <i class="pi pi-spin pi-spinner"></i>
              </div>
            </slot>
            <slot v-else-if="currentFaceIndex === 1" name="back" />
          </slot>
        </div>
      </Transition>
    </div>

    <!-- Branding (bottom) -->
    <div v-if="!hideBranding" class="tile-branding">
      <i :class="icon" class="branding-icon"></i>
      <span class="branding-title">{{ title }}</span>
    </div>
  </component>
</template>

<script setup lang="ts">
/**
 * LiveTile - A dynamic tile component with multiple rotating "faces"
 *
 * Features:
 * - Multiple faces with auto-rotation using prime number intervals for natural timing
 * - Touch/drag support for manual navigation
 * - Optional badge (dot, check, or custom text/number)
 * - Optional branding footer with icon and title
 * - Static header slot
 * - Respects prefers-reduced-motion
 * - Loading state support
 *
 * @example
 * ```vue
 * <LiveTile
 *   href="/dashboard"
 *   title="My Tile"
 *   icon="pi pi-chart-line"
 *   badge="3"
 *   :face-count="2"
 * >
 *   <template #face-0>
 *     <p>Front face content</p>
 *   </template>
 *   <template #face-1>
 *     <p>Back face content</p>
 *   </template>
 * </LiveTile>
 * ```
 */
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { LiveTileProps, LiveTileEmits } from '../../types';

defineOptions({ name: 'FtpLiveTile' });

const props = withDefaults(defineProps<LiveTileProps>(), {
  href: undefined,
  title: '',
  icon: '',
  badge: null,
  badgeClass: '',
  loading: false,
  faceCount: 2,
  hideBranding: false,
});

const emit = defineEmits<LiveTileEmits>();

/**
 * Determines which element to render based on whether href is provided
 */
const linkComponent = computed(() => (props.href ? 'a' : 'div'));

/**
 * Handles click events, emitting only when not a link
 */
function handleClick() {
  if (!props.href) {
    emit('click');
  }
}

const currentFaceIndex = ref(0);
let rotationTimer: ReturnType<typeof setTimeout> | null = null;
let resumeTimer: ReturnType<typeof setTimeout> | null = null;

/** Time to wait before resuming auto-rotation after manual interaction */
const RESUME_DELAY = 10000; // 10 seconds

/** Slide direction for transitions */
const slideDirection = ref<'slide-left' | 'slide-right'>('slide-left');

/**
 * Navigate to the next face
 */
function nextFace() {
  slideDirection.value = 'slide-left';
  currentFaceIndex.value = (currentFaceIndex.value + 1) % props.faceCount;
}

/**
 * Navigate to the previous face
 */
function prevFace() {
  slideDirection.value = 'slide-right';
  currentFaceIndex.value =
    (currentFaceIndex.value - 1 + props.faceCount) % props.faceCount;
}

/**
 * Called when user manually rotates content - pauses auto-rotation temporarily
 */
function onManualRotation() {
  stopRotation();

  if (resumeTimer) {
    clearTimeout(resumeTimer);
    resumeTimer = null;
  }

  if (!prefersReducedMotion.value) {
    resumeTimer = setTimeout(() => {
      resumeTimer = null;
      startRotation();
    }, RESUME_DELAY);
  }
}

// Swipe handling state
let touchStartX = 0;
let touchStartY = 0;
let isSwiping = false;
const swipeThreshold = 50;

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  isSwiping = true;
}

function onTouchMove(e: TouchEvent) {
  if (!isSwiping) return;

  const touchX = e.touches[0].clientX;
  const touchY = e.touches[0].clientY;
  const deltaX = touchStartX - touchX;
  const deltaY = Math.abs(touchStartY - touchY);

  // If vertical scroll is more prominent, don't handle as swipe
  if (deltaY > Math.abs(deltaX)) {
    isSwiping = false;
    return;
  }

  // Prevent page scroll during horizontal swipe
  if (Math.abs(deltaX) > 10) {
    e.preventDefault();
  }
}

function onTouchEnd(e: TouchEvent) {
  if (!isSwiping) {
    return;
  }

  const touchEndX = e.changedTouches[0].clientX;
  const deltaX = touchStartX - touchEndX;

  if (Math.abs(deltaX) > swipeThreshold) {
    if (deltaX > 0) {
      nextFace();
    } else {
      prevFace();
    }
    onManualRotation();
  }

  isSwiping = false;
}

// Mouse support for desktop
let mouseStartX = 0;
let isMouseDown = false;

function onMouseDown(e: MouseEvent) {
  if (e.button !== 0) return;

  mouseStartX = e.clientX;
  isMouseDown = true;

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(_e: MouseEvent) {
  // Just track, actual swipe happens on mouseup
}

function onMouseUp(e: MouseEvent) {
  if (!isMouseDown) return;

  const deltaX = mouseStartX - e.clientX;

  if (Math.abs(deltaX) > swipeThreshold) {
    if (deltaX > 0) {
      nextFace();
    } else {
      prevFace();
    }
    onManualRotation();
  }

  isMouseDown = false;

  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
}

/** Check for reduced motion preference */
const prefersReducedMotion = ref(false);

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (!prefersReducedMotion.value && !props.loading) {
    startRotation();
  }
});

onUnmounted(() => {
  stopRotation();
  if (resumeTimer) {
    clearTimeout(resumeTimer);
    resumeTimer = null;
  }
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
});

// Watch for loading state changes
watch(
  () => props.loading,
  (newLoading) => {
    if (newLoading) {
      stopRotation();
      currentFaceIndex.value = 0;
    } else if (!prefersReducedMotion.value) {
      startRotation();
    }
  }
);

/** Prime numbers between 10 and 30 for dynamic content rotation intervals */
const ROTATION_PRIMES = [11, 13, 17, 19, 23, 29];

/**
 * Get a random prime interval in milliseconds
 */
function getRandomPrimeInterval(): number {
  const prime =
    ROTATION_PRIMES[Math.floor(Math.random() * ROTATION_PRIMES.length)];
  return prime * 1000;
}

/**
 * Schedule the next face rotation
 */
function scheduleNextRotation() {
  if (rotationTimer) return;

  const interval = getRandomPrimeInterval();

  rotationTimer = setTimeout(() => {
    nextFace();
    rotationTimer = null;
    scheduleNextRotation();
  }, interval);
}

/**
 * Start auto-rotation with a random offset
 */
function startRotation() {
  if (rotationTimer) return;

  // Add random offset to prevent synchronized rotation across tiles
  const offset = Math.random() * 2000;

  setTimeout(() => {
    scheduleNextRotation();
  }, offset);
}

/**
 * Stop auto-rotation
 */
function stopRotation() {
  if (rotationTimer) {
    clearTimeout(rotationTimer);
    rotationTimer = null;
  }
}
</script>

<style scoped>
.live-tile {
  display: grid;
  grid-template-rows: 1fr auto;
  position: relative;
  background: var(--surface-panel);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-md, 6px);
  padding: var(--space-m);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  width: 100%;
  text-align: left;
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
}

.live-tile:hover {
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* Badge */
.tile-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  min-width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--brand-secondary, #f97316);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.75rem;
  padding: 0 var(--space-xs);
  z-index: 10;
}

.tile-badge.warning {
  background: var(--feedback-warning, #f59e0b);
}

.tile-badge.success {
  background: var(--feedback-success, #22c55e);
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.tile-badge i {
  font-size: 0.75rem;
}

/* Tile Faces */
.tile-faces {
  position: relative;
  width: 100%;
  min-height: 0;
  overflow: hidden;
  touch-action: pan-y pinch-zoom;
  cursor: grab;
  user-select: none;
}

.tile-faces:active {
  cursor: grabbing;
}

.tile-face {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.tile-face > * {
  animation: content-fade-in 0.4s ease-out;
}

@keyframes content-fade-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tile-loading-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
}

/* Slide Left Animation (content enters from right, exits to left) */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.35s ease-out;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Slide Right Animation (content enters from left, exits to right) */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.35s ease-out;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Static Header */
.tile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 100%;
}

/* Branding */
.tile-branding {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding-top: var(--space-s);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.branding-icon {
  font-size: 1rem;
  color: var(--brand-secondary, #f97316);
}

.branding-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-muted);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: none;
  }

  .live-tile:hover {
    transform: none;
  }

  .tile-face > * {
    animation: none;
  }
}
</style>
