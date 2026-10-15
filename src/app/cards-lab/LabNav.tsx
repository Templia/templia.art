// Links between the design-lab examples; the current one is plain text.
const EXAMPLES = [
  { href: "/cards-lab/", label: "Example 1" },
  { href: "/cards-lab/stone/", label: "Example 2" },
  { href: "/cards-lab/codex/", label: "Example 3" },
  { href: "/cards-lab/wheel/", label: "Example 4" },
  { href: "/cards-lab/journey/", label: "Journey" },
];

export function LabNav({ current }: { current: number }) {
  return (
    <p className="text-xs tracking-[0.3em] uppercase text-gold/80 mb-3">
      Design lab
      {EXAMPLES.map((e, i) => (
        <span key={e.href}>
          {" · "}
          {i + 1 === current ? (
            e.label
          ) : (
            <a href={e.href} className="underline underline-offset-4 decoration-gold/30 hover:decoration-gold/70">
              {e.label}
            </a>
          )}
        </span>
      ))}
    </p>
  );
}
