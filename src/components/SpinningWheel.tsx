"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Wraps the wheel art and spins it into place the first time it scrolls into
// view: it starts turned back ~70°, then eases forward, overshoots a touch
// and settles on the day. Server HTML (and reduced-motion users) get the
// wheel already at rest. States: data-spin="armed" → "go" (see globals.css).
export function SpinningWheel({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.spin = "armed";
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          // Let the armed (turned-back) pose paint before releasing it
          requestAnimationFrame(() => {
            el.dataset.spin = "go";
          });
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el.closest(".day-card") ?? el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
