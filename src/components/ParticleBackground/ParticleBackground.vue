<template>
  <canvas
    ref="canvasRef"
    class="particle-background"
    :class="{ 'particle-background--fixed': fixed }"
  />
</template>

<script setup lang="ts">
import type { ParticleBackgroundProps } from '../../types';
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";

defineOptions({ name: 'FtpParticleBackground' });

const props = withDefaults(defineProps<ParticleBackgroundProps>(), {
  particleCount: 150,
  staticStarCount: 300,
  clusterCount: 8,
  starsPerCluster: 15,
  particleColor: "rgba(255, 255, 255, 0.8)",
  minSize: 0.5,
  maxSize: 2,
  speed: 0.2,
  twinkle: true,
  parallax: false,
  fixed: false,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let staticStars: StaticStar[] = [];
let animationId: number | null = null;
let mouseX = 0;
let mouseY = 0;

// Static star - doesn't move, only ~10% twinkle
class StaticStar {
  canvas: any; x: number; y: number; size: number; opacity: number;
  doesTwinkle: boolean; twinkleSpeed: number; twinklePhase: number; currentOpacity: number;
  constructor(canvas: any, x: number | null = null, y: number | null = null, sizeMultiplier = 1) {
    this.canvas = canvas;
    // Allow preset position for clusters
    this.x = x !== null ? x : Math.random() * canvas.width;
    this.y = y !== null ? y : Math.random() * canvas.height;
    // Static stars are generally smaller
    const baseSize = props.minSize + Math.random() * (props.maxSize - props.minSize) * 0.7;
    this.size = baseSize * sizeMultiplier;
    this.opacity = 0.2 + Math.random() * 0.6;
    // Only ~10% of stars twinkle
    this.doesTwinkle = Math.random() < 0.1;
    this.twinkleSpeed = 0.003 + Math.random() * 0.006;
    this.twinklePhase = Math.random() * Math.PI * 2;
    this.currentOpacity = this.opacity;
  }

  update(deltaTime: any) {
    if (this.doesTwinkle && props.twinkle) {
      this.twinklePhase += this.twinkleSpeed * deltaTime;
      this.currentOpacity = this.opacity * (0.6 + 0.4 * Math.sin(this.twinklePhase));
    }
  }

  draw(ctx: any) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx!.fillStyle = props.particleColor.replace(
      /[\d.]+\)$/,
      `${this.currentOpacity})`
    );
    ctx.fill();
  }
}

// Moving particle
class Particle {
  canvas: any; x: number = 0; y: number = 0; size: number = 0; speedX: number = 0; speedY: number = 0;
  opacity: number = 0; twinkleSpeed: number = 0; twinklePhase: number = 0; depth: number = 0; currentOpacity: number = 0;
  constructor(canvas: any) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.size = props.minSize + Math.random() * (props.maxSize - props.minSize);
    this.speedX = (Math.random() - 0.5) * props.speed;
    this.speedY = (Math.random() - 0.5) * props.speed;
    this.opacity = 0.3 + Math.random() * 0.7;
    this.twinkleSpeed = 0.005 + Math.random() * 0.01;
    this.twinklePhase = Math.random() * Math.PI * 2;
    // Depth for parallax (0 = far, 1 = close)
    this.depth = Math.random();
  }

  update(deltaTime: any) {
    // Movement
    this.x += this.speedX * deltaTime;
    this.y += this.speedY * deltaTime;

    // Wrap around edges
    if (this.x < 0) this.x = this.canvas.width;
    if (this.x > this.canvas.width) this.x = 0;
    if (this.y < 0) this.y = this.canvas.height;
    if (this.y > this.canvas.height) this.y = 0;

    // Twinkle effect
    if (props.twinkle) {
      this.twinklePhase += this.twinkleSpeed * deltaTime;
      this.currentOpacity = this.opacity * (0.5 + 0.5 * Math.sin(this.twinklePhase));
    } else {
      this.currentOpacity = this.opacity;
    }
  }

  draw(ctx: any, offsetX = 0, offsetY = 0) {
    const parallaxMultiplier = props.parallax ? this.depth * 0.02 : 0;
    const drawX = this.x + offsetX * parallaxMultiplier;
    const drawY = this.y + offsetY * parallaxMultiplier;

    ctx.beginPath();
    ctx.arc(drawX, drawY, this.size, 0, Math.PI * 2);
    ctx.fillStyle = props.particleColor.replace(
      /[\d.]+\)$/,
      `${this.currentOpacity})`
    );
    ctx.fill();

    // Add subtle glow for larger particles
    if (this.size > 1.2) {
      ctx.beginPath();
      ctx.arc(drawX, drawY, this.size * 2, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(
        drawX, drawY, 0,
        drawX, drawY, this.size * 2
      );
      gradient.addColorStop(0, props.particleColor.replace(/[\d.]+\)$/, `${this.currentOpacity * 0.3})`));
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }
}

function initParticles() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  // Initialize moving particles
  particles = [];
  for (let i = 0; i < props.particleCount; i++) {
    particles.push(new Particle(canvas));
  }

  // Initialize static stars
  staticStars = [];

  // Random scattered static stars
  for (let i = 0; i < props.staticStarCount; i++) {
    staticStars.push(new StaticStar(canvas));
  }

  // Create star clusters
  for (let c = 0; c < props.clusterCount; c++) {
    // Random cluster center
    const clusterX = Math.random() * canvas.width;
    const clusterY = Math.random() * canvas.height;
    // Cluster radius varies
    const clusterRadius = 30 + Math.random() * 80;
    // Number of stars in this cluster
    const starCount = Math.floor(props.starsPerCluster * (0.5 + Math.random()));

    for (let i = 0; i < starCount; i++) {
      // Gaussian-like distribution for more stars near center
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * Math.random() * clusterRadius; // Squared for density toward center
      const x = clusterX + Math.cos(angle) * distance;
      const y = clusterY + Math.sin(angle) * distance;

      // Stars near cluster center can be slightly larger
      const sizeMultiplier = 0.6 + (1 - distance / clusterRadius) * 0.6;

      staticStars.push(new StaticStar(canvas, x, y, sizeMultiplier));
    }
  }
}

function resizeCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();

  // If canvas has no dimensions yet, retry after a frame
  if (rect.width === 0 || rect.height === 0) {
    requestAnimationFrame(resizeCanvas);
    return;
  }

  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx = canvas.getContext("2d");
  ctx!.scale(dpr, dpr);

  // Reinitialize particles with new dimensions
  initParticles();
}

let lastTime = 0;
function animate(currentTime: any) {
  const deltaTime = lastTime ? (currentTime - lastTime) / 16.67 : 1; // Normalize to ~60fps
  lastTime = currentTime;

  const canvas = canvasRef.value;
  if (!canvas || !ctx) return;

  const rect = canvas.getBoundingClientRect();

  // Clear canvas
  ctx!.clearRect(0, 0, rect.width, rect.height);

  // Calculate parallax offset
  const offsetX = props.parallax ? (mouseX - rect.width / 2) : 0;
  const offsetY = props.parallax ? (mouseY - rect.height / 2) : 0;

  // Draw static stars first (background layer)
  for (const star of staticStars) {
    star.update(deltaTime);
    star.draw(ctx);
  }

  // Update and draw moving particles (foreground layer)
  for (const particle of particles) {
    particle.update(deltaTime);
    particle.draw(ctx, offsetX, offsetY);
  }

  animationId = requestAnimationFrame(animate);
}

function handleMouseMove(e: MouseEvent) {
  if (!props.parallax) return;
  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
}

function handleResize() {
  resizeCanvas();
}

onMounted(async () => {
  // Wait for layout to complete before measuring canvas
  await nextTick();

  // Additional delay to ensure CSS has been applied
  requestAnimationFrame(() => {
    resizeCanvas();
    animationId = requestAnimationFrame(animate);
  });

  window.addEventListener("resize", handleResize);
  if (props.parallax) {
    window.addEventListener("mousemove", handleMouseMove);
  }
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("mousemove", handleMouseMove);
});

// Watch for prop changes
watch(() => props.particleCount, initParticles);
watch(() => props.parallax, (newVal) => {
  if (newVal) {
    window.addEventListener("mousemove", handleMouseMove);
  } else {
    window.removeEventListener("mousemove", handleMouseMove);
  }
});
</script>

<style>
.particle-background {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle-background--fixed {
  position: fixed;
  inset: 0;
  z-index: 0;
}
</style>
