import { ITINERARY } from "@/config/wedding";

// Running order for the day, as a simple vertical timeline.
export function Itinerary() {
  return (
    <ol className="relative mx-auto max-w-md">
      {/* The line the markers sit on. */}
      <span
        aria-hidden
        className="absolute bottom-3 left-[5px] top-3 w-px bg-line"
      />
      {ITINERARY.map((item) => (
        <li key={item.time} className="relative py-4 pl-7">
          <span
            aria-hidden
            className="absolute left-0 top-[1.45rem] h-[11px] w-[11px] rounded-full border border-ink/40 bg-stone-light"
          />
          {/* Time above the entry on a phone, beside it once there's room. */}
          <div className="flex flex-col sm:flex-row sm:gap-6">
            <span className="eyebrow shrink-0 whitespace-nowrap text-ink-faint sm:w-44 sm:pt-1">
              {item.time}
            </span>
            <span className="mt-1 font-display text-lg text-ink sm:mt-0">
              {item.what}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
