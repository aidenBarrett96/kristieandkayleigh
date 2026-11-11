import { FAQS } from "@/config/wedding";

// Native <details> so the whole thing works without JavaScript and stays
// keyboard-accessible for free.
export function Faq() {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white/50">
      {FAQS.map((item) => (
        <details key={item.q} className="group">
          <summary
            className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4
              font-display text-lg text-ink transition hover:bg-white/70
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/20
              [&::-webkit-details-marker]:hidden"
          >
            {item.q}
            <span
              aria-hidden
              className="shrink-0 text-xl font-light leading-none text-ink-faint transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="px-5 pb-5">
            <p className="text-ink-soft">{item.a}</p>
            {item.link && (
              <a
                href={item.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm text-ink underline underline-offset-4 hover:text-ink-soft"
              >
                {item.link.label} →
              </a>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
