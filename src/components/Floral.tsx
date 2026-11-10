// Hand-drawn-style line art echoing the printed invitation: simple wildflowers,
// buds and leafy stems, all stroked in currentColor so they pick up the ink
// colour wherever they're used. Original artwork — nothing traced.

const LEAF = "M0 0 C2.6 -3.4 6.6 -3.4 9.2 0 C6.6 3.4 2.6 3.4 0 0";

function Daisy({ petals = 8, r = 1 }: { petals?: number; r?: number }) {
  return (
    <g transform={`scale(${r})`}>
      {Array.from({ length: petals }, (_, i) => (
        <ellipse
          key={i}
          cx="0"
          cy="-5.4"
          rx="1.9"
          ry="3.8"
          transform={`rotate(${(360 / petals) * i})`}
        />
      ))}
      <circle cx="0" cy="0" r="1.7" />
    </g>
  );
}

function Bud({ r = 1 }: { r?: number }) {
  return (
    <g transform={`scale(${r})`}>
      <path d="M0 0 C-3 -3 -2.6 -8 0 -10.5 C2.6 -8 3 -3 0 0" />
      <path d="M0 0 L0 6" />
    </g>
  );
}

/** A leafy stem that curves up and to the right, with a flower at the tip. */
function Sprig({ tip = "daisy" }: { tip?: "daisy" | "bud" }) {
  return (
    <g>
      <path d="M0 24 C20 23 42 18 64 7" />
      <g transform="translate(14 23.2) rotate(-6)">
        <path d={LEAF} />
      </g>
      <g transform="translate(16 22.6) rotate(-52)">
        <path d={LEAF} />
      </g>
      <g transform="translate(33 20.4) rotate(-14)">
        <path d={LEAF} />
      </g>
      <g transform="translate(35 19.6) rotate(-62)">
        <path d={LEAF} />
      </g>
      <g transform="translate(50 14.6) rotate(-26)">
        <path d={LEAF} />
      </g>
      <g transform="translate(40 30) rotate(16)">
        <path d={LEAF} />
      </g>
      <g transform="translate(70 4)">
        {tip === "daisy" ? <Daisy r={0.95} /> : <Bud r={0.95} />}
      </g>
    </g>
  );
}

/** Sprig — flower — mirrored sprig. Sits between sections in place of a rule. */
export function FloralDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 260 44"
      aria-hidden
      className={`mx-auto h-11 w-auto text-ink-faint ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g transform="translate(6 6)">
        <Sprig tip="bud" />
      </g>
      <g transform="translate(130 20)">
        <Daisy petals={9} r={1.25} />
      </g>
      <g transform="translate(254 6) scale(-1 1)">
        <Sprig tip="bud" />
      </g>
    </svg>
  );
}

/**
 * The oval cartouche from the invitation: a thin double ellipse that stretches
 * to whatever it wraps, with a flower resting at the top and bottom. The stroke
 * is kept even under non-uniform scaling by vector-effect.
 */
export function FloralFrame({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full text-ink/35 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      vectorEffect="non-scaling-stroke"
    >
      <ellipse cx="50" cy="50" rx="49" ry="49" vectorEffect="non-scaling-stroke" />
      <ellipse cx="50" cy="50" rx="47" ry="47" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** A single flower with a pair of leaves, for capping the oval. */
export function FloralCap({
  className = "",
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 70 26"
      aria-hidden
      className={`h-6 w-auto text-ink-faint ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      <g transform="translate(35 17)">
        <Daisy petals={9} r={1.1} />
      </g>
      <g transform="translate(14 15) rotate(14)">
        <path d={LEAF} />
      </g>
      <g transform="translate(56 15) rotate(166) ">
        <path d={LEAF} />
      </g>
      <path d="M8 19 C16 17 22 16 26 16" />
      <path d="M62 19 C54 17 48 16 44 16" />
    </svg>
  );
}
