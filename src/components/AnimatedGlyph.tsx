"use client";

import { useEffect, useRef, useState } from "react";

// A day-sign glyph that carves itself in: each shape's outline is traced,
// then the fill rises. Plays when the glyph scrolls into view, and again
// each time the mouse enters its card.
//
// The SVG is fetched at runtime (not bundled) and inlined so its paths can be
// animated. Until it arrives — and without JS — the static masked glyph shows,
// so the card never renders empty. Reduced-motion users get the static glyph.

const SHAPES = "path, polygon, rect, circle, ellipse, polyline";

function prepareSvg(text: string): string | null {
  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) return null;
  svg.querySelectorAll("style, title").forEach((n) => n.remove());
  for (const attr of ["id", "x", "y", "style", "width", "height", "xml:space", "version"]) svg.removeAttribute(attr);
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.querySelectorAll(SHAPES).forEach((s) => s.setAttribute("class", "glyph-shape"));
  return new XMLSerializer().serializeToString(svg);
}

export function AnimatedGlyph({ src, label, className }: { src: string; label: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [markup, setMarkup] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let alive = true;
    fetch(src)
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((text) => {
        if (alive) setMarkup(prepareSvg(text));
      })
      .catch(() => {
        // Keep the static glyph.
      });
    return () => {
      alive = false;
    };
  }, [src]);

  useEffect(() => {
    const root = ref.current;
    if (!markup || !root) return;
    const shapes = [...root.querySelectorAll<SVGGeometryElement>(".glyph-shape")];
    // Stagger the shapes, but keep the whole carving under ~2.6s.
    const step = Math.min(220, 900 / Math.max(1, shapes.length));
    const animations = shapes.map((shape, i) => {
      const len = Math.ceil(shape.getTotalLength?.() ?? 2000);
      shape.style.strokeDasharray = `${len}`;
      const a = shape.animate(
        [
          { strokeDashoffset: len, fillOpacity: 0, strokeOpacity: 1 },
          { strokeDashoffset: 0, fillOpacity: 0, strokeOpacity: 1, offset: 0.72 },
          { strokeDashoffset: 0, fillOpacity: 1, strokeOpacity: 0 },
        ],
        { duration: 1700, delay: i * step, easing: "cubic-bezier(0.45, 0, 0.25, 1)", fill: "both" },
      );
      a.pause();
      return a;
    });

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          animations.forEach((a) => a.play());
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(root);

    // Hovering the card re-carves the glyph — once it has finished, so a
    // pointer wandering across the card doesn't restart it mid-stroke.
    const card = root.closest(".day-card") ?? root;
    const onEnter = (e: Event) => {
      if ((e as PointerEvent).pointerType !== "mouse") return;
      if (!animations.every((a) => a.playState === "finished")) return;
      animations.forEach((a) => {
        a.currentTime = 0;
        a.play();
      });
    };
    card.addEventListener("pointerenter", onEnter);

    return () => {
      io.disconnect();
      card.removeEventListener("pointerenter", onEnter);
      animations.forEach((a) => a.cancel());
    };
  }, [markup]);

  if (!markup) {
    return (
      <span
        className={`${className ?? ""} day-card-glyph`}
        style={{ maskImage: `url(${src})`, WebkitMaskImage: `url(${src})` }}
        role="img"
        aria-label={label}
      />
    );
  }
  return (
    <span
      ref={ref}
      className={`${className ?? ""} day-card-glyph-live`}
      role="img"
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
