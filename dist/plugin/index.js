import rough from "roughjs";
const SEVERITY_PRESETS = {
  1: { roughness: 0.5, bowing: 0.3, strokeWidth: 1, opacity: 0.4 },
  2: { roughness: 1, bowing: 0.7, strokeWidth: 1.4, opacity: 0.7 },
  3: { roughness: 1.6, bowing: 1.2, strokeWidth: 1.8, opacity: 1 },
  4: { roughness: 2.3, bowing: 1.7, strokeWidth: 2, opacity: 1 },
  5: { roughness: 3, bowing: 2.2, strokeWidth: 2.2, opacity: 1 }
};
const state = /* @__PURE__ */ new WeakMap();
function drawRough(el, opts) {
  const st = state.get(el);
  if (!st)
    return;
  if (opts.disabled) {
    while (st.svg.firstChild)
      st.svg.removeChild(st.svg.firstChild);
    return;
  }
  const w = st.host.clientWidth;
  const h = st.host.clientHeight;
  if (w === 0 || h === 0)
    return;
  if (w === st.lastW && h === st.lastH && st.svg.firstChild)
    return;
  st.lastW = w;
  st.lastH = h;
  st.svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  st.svg.setAttribute("width", String(w));
  st.svg.setAttribute("height", String(h));
  while (st.svg.firstChild)
    st.svg.removeChild(st.svg.firstChild);
  const rc = rough.svg(st.svg);
  const preset = SEVERITY_PRESETS[opts.severity ?? 3];
  st.svg.style.opacity = String(preset.opacity);
  const sw = opts.strokeWidth ?? preset.strokeWidth;
  const shape = opts.shape ?? "rectangle";
  const drawOpts = {
    stroke: opts.stroke ?? "currentColor",
    strokeWidth: sw,
    roughness: opts.roughness ?? preset.roughness,
    bowing: opts.bowing ?? preset.bowing,
    fill: opts.fill,
    fillStyle: opts.fillStyle ?? "hachure",
    hachureGap: opts.hachureGap,
    hachureAngle: opts.hachureAngle,
    seed: opts.seed ?? st.seed
  };
  if (opts.edges) {
    const pad = Math.ceil(sw / 2);
    for (const edge of opts.edges) {
      let line;
      if (edge === "top")
        line = rc.line(0, pad, w, pad, drawOpts);
      else if (edge === "bottom")
        line = rc.line(0, h - pad, w, h - pad, drawOpts);
      else if (edge === "left")
        line = rc.line(pad, 0, pad, h, drawOpts);
      else
        line = rc.line(w - pad, 0, w - pad, h, drawOpts);
      st.svg.appendChild(line);
    }
    return;
  }
  let node;
  if (shape === "hline") {
    node = rc.line(0, h / 2, w, h / 2, drawOpts);
  } else if (shape === "vline") {
    node = rc.line(w / 2, 0, w / 2, h, drawOpts);
  } else if (shape === "circle") {
    const d = Math.min(w, h) - sw;
    node = rc.circle(w / 2, h / 2, Math.max(1, d), drawOpts);
  } else {
    const pad = Math.ceil(sw / 2);
    node = rc.rectangle(
      pad,
      pad,
      Math.max(1, w - pad * 2),
      Math.max(1, h - pad * 2),
      drawOpts
    );
  }
  st.svg.appendChild(node);
}
function mount(el, binding) {
  const needsWrap = el.tagName === "INPUT" || el.tagName === "TEXTAREA";
  let host = el;
  let wrap = null;
  if (needsWrap && el.parentNode) {
    const cs2 = getComputedStyle(el);
    wrap = document.createElement("span");
    wrap.classList.add("rough-wrap");
    wrap.style.display = cs2.display === "inline" ? "inline-block" : cs2.display;
    wrap.style.position = "relative";
    wrap.style.verticalAlign = "middle";
    wrap.style.boxSizing = "border-box";
    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(el);
    host = wrap;
  }
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.style.position = "absolute";
  svg.style.inset = "0";
  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.style.pointerEvents = "none";
  svg.style.overflow = "visible";
  svg.style.zIndex = "0";
  svg.classList.add("rough-svg");
  host.prepend(svg);
  const cs = getComputedStyle(host);
  if (cs.position === "static")
    host.style.position = "relative";
  if (cs.isolation !== "isolate")
    host.style.isolation = "isolate";
  el.style.borderColor = "transparent";
  const observer = new ResizeObserver(() => drawRough(el, binding.value ?? {}));
  observer.observe(host);
  state.set(el, {
    host,
    wrap,
    svg,
    observer,
    seed: Math.floor(Math.random() * 2 ** 31),
    lastW: 0,
    lastH: 0
  });
  drawRough(el, binding.value ?? {});
}
function unmount(el) {
  const st = state.get(el);
  if (!st)
    return;
  st.observer.disconnect();
  st.svg.remove();
  if (st.wrap && st.wrap.parentNode) {
    st.wrap.parentNode.insertBefore(el, st.wrap);
    st.wrap.remove();
  }
  state.delete(el);
}
const vRough = {
  mounted: mount,
  updated(el, binding) {
    const st = state.get(el);
    if (st) {
      st.lastW = 0;
      st.lastH = 0;
    }
    drawRough(el, binding.value ?? {});
  },
  unmounted: unmount
};
const WireframePlugin = {
  install(app) {
    app.directive("rough", vRough);
  }
};
export {
  WireframePlugin,
  vRough
};
