"use client";

import { useEffect, useId, useRef, useState } from "react";

type Option = { id: string; name: string };

// Matches MIN_QUERY in /api/guests/search — no point asking before then.
const MIN_QUERY = 2;
const DEBOUNCE_MS = 180;

export function GuestNameCombobox() {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [guestId, setGuestId] = useState("");
  const [pending, setPending] = useState(false);

  // Set when we fill the input ourselves (i.e. the guest picked a name), so the
  // effect below doesn't immediately re-open the list with what we just chose.
  const skipNextFetch = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }

    const q = query.trim();
    if (q.length < MIN_QUERY) {
      setOptions([]);
      setOpen(false);
      setPending(false);
      return;
    }

    const controller = new AbortController();
    setPending(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/guests/search?q=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`search failed: ${res.status}`);
        const data = (await res.json()) as { guests: Option[] };
        setOptions(data.guests);
        setActiveIndex(data.guests.length > 0 ? 0 : -1);
        setOpen(true);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setOptions([]);
        setActiveIndex(-1);
      } finally {
        // A superseded request must not clear the spinner the new one just lit.
        if (!controller.signal.aborted) setPending(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Close when the guest clicks away from the field.
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // Keep the keyboard-highlighted row inside the scrollable list.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    listRef.current
      ?.querySelector<HTMLLIElement>('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function select(option: Option) {
    skipNextFetch.current = true;
    setQuery(option.name);
    setGuestId(option.id);
    setOpen(false);
    setActiveIndex(-1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (options.length === 0) return;
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const delta = e.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((i) => (i + delta + options.length) % options.length);
      return;
    }

    if (e.key === "Enter" && open && options[activeIndex]) {
      // Take the highlighted name rather than submitting the partial one.
      e.preventDefault();
      select(options[activeIndex]);
      return;
    }

    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (e.key === "Tab" && open && options[activeIndex]) {
      select(options[activeIndex]);
    }
  }

  const noMatches =
    open && !pending && options.length === 0 && query.trim().length >= MIN_QUERY;

  return (
    <div ref={rootRef} className="relative">
      {/* The picked invitation. Cleared the moment they edit the name again. */}
      <input type="hidden" name="guestId" value={guestId} />

      <input
        id="name"
        name="name"
        type="text"
        role="combobox"
        required
        autoFocus
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open && options.length > 0}
        aria-controls={listId}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
        }
        className="field-input pr-10"
        placeholder="Start typing your name…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setGuestId("");
        }}
        onKeyDown={onKeyDown}
        onFocus={() => {
          if (options.length > 0) setOpen(true);
        }}
      />

      {pending && (
        <span
          aria-hidden
          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin
            rounded-full border-2 border-line border-t-ink-soft"
        />
      )}

      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label="Matching invitations"
        hidden={!open || options.length === 0}
        className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border
          border-line bg-white py-1 shadow-lg"
      >
        {options.map((option, i) => (
          <li
            key={option.id}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === activeIndex}
            data-active={i === activeIndex}
            // pointerdown, not click: the input's blur must not close us first.
            onPointerDown={(e) => {
              e.preventDefault();
              select(option);
            }}
            onMouseEnter={() => setActiveIndex(i)}
            className={`cursor-pointer px-4 py-2 text-sm text-ink-soft ${
              i === activeIndex ? "bg-stone" : ""
            }`}
          >
            <Highlight text={option.name} query={query} />
          </li>
        ))}
      </ul>

      {noMatches && (
        <p className="mt-1.5 text-sm text-ink-faint">
          No invitation matches that name yet — keep typing, or check the
          spelling on your invite.
        </p>
      )}

      <p className="sr-only" role="status">
        {open && options.length > 0
          ? `${options.length} matching ${
              options.length === 1 ? "invitation" : "invitations"
            }. Use the arrow keys to choose.`
          : ""}
      </p>
    </div>
  );
}

// Bolds the typed portion inside each suggestion.
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (at === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="font-semibold text-ink">
        {text.slice(at, at + q.length)}
      </span>
      {text.slice(at + q.length)}
    </>
  );
}
