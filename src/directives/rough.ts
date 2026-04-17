import rough from 'roughjs';
import type { Directive, DirectiveBinding } from 'vue';

export type RoughValue = Partial<{
  stroke: string;
  strokeWidth: number;
  roughness: number;
  bowing: number;
  fill: string;
  fillStyle: 'hachure' | 'solid' | 'zigzag' | 'cross-hatch' | 'dots' | 'dashed' | 'zigzag-line';
  hachureGap: number;
  hachureAngle: number;
  seed: number;
  disabled: boolean;
  shape: 'rectangle' | 'hline' | 'vline' | 'circle';
}>;

type State = {
  svg: SVGSVGElement;
  observer: ResizeObserver;
  seed: number;
  lastW: number;
  lastH: number;
};

const state = new WeakMap<HTMLElement, State>();

function drawRough(el: HTMLElement, opts: RoughValue) {
  const st = state.get(el);
  if (!st) return;
  if (opts.disabled) {
    while (st.svg.firstChild) st.svg.removeChild(st.svg.firstChild);
    return;
  }
  const w = el.clientWidth;
  const h = el.clientHeight;
  if (w === 0 || h === 0) return;
  if (w === st.lastW && h === st.lastH && st.svg.firstChild) return;
  st.lastW = w;
  st.lastH = h;
  st.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  st.svg.setAttribute('width', String(w));
  st.svg.setAttribute('height', String(h));
  while (st.svg.firstChild) st.svg.removeChild(st.svg.firstChild);

  const rc = rough.svg(st.svg);
  const sw = opts.strokeWidth ?? 1.8;
  const shape = opts.shape ?? 'rectangle';
  const drawOpts = {
    stroke: opts.stroke ?? 'currentColor',
    strokeWidth: sw,
    roughness: opts.roughness ?? 1.6,
    bowing: opts.bowing ?? 1.2,
    fill: opts.fill,
    fillStyle: opts.fillStyle ?? 'hachure',
    hachureGap: opts.hachureGap,
    hachureAngle: opts.hachureAngle,
    seed: opts.seed ?? st.seed,
  };

  let node: SVGGElement;
  if (shape === 'hline') {
    node = rc.line(0, h / 2, w, h / 2, drawOpts);
  } else if (shape === 'vline') {
    node = rc.line(w / 2, 0, w / 2, h, drawOpts);
  } else if (shape === 'circle') {
    const d = Math.min(w, h) - sw;
    node = rc.circle(w / 2, h / 2, Math.max(1, d), drawOpts);
  } else {
    const pad = Math.ceil(sw / 2);
    node = rc.rectangle(
      pad,
      pad,
      Math.max(1, w - pad * 2),
      Math.max(1, h - pad * 2),
      drawOpts,
    );
  }
  st.svg.appendChild(node);
}

function mount(el: HTMLElement, binding: DirectiveBinding<RoughValue | undefined>) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.style.position = 'absolute';
  svg.style.inset = '0';
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.pointerEvents = 'none';
  svg.style.overflow = 'visible';
  svg.style.zIndex = '0';
  svg.classList.add('wf-rough-svg');
  el.prepend(svg);

  const cs = getComputedStyle(el);
  if (cs.position === 'static') el.style.position = 'relative';
  if (cs.isolation !== 'isolate') el.style.isolation = 'isolate';
  el.style.borderColor = 'transparent';

  const observer = new ResizeObserver(() => drawRough(el, binding.value ?? {}));
  observer.observe(el);
  state.set(el, {
    svg,
    observer,
    seed: Math.floor(Math.random() * 2 ** 31),
    lastW: 0,
    lastH: 0,
  });
  drawRough(el, binding.value ?? {});
}

function unmount(el: HTMLElement) {
  const st = state.get(el);
  if (!st) return;
  st.observer.disconnect();
  st.svg.remove();
  state.delete(el);
}

export const vRough: Directive<HTMLElement, RoughValue | undefined> = {
  mounted: mount,
  updated(el, binding) {
    const st = state.get(el);
    if (st) {
      st.lastW = 0;
      st.lastH = 0;
    }
    drawRough(el, binding.value ?? {});
  },
  unmounted: unmount,
};
