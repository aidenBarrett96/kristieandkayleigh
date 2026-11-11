// Hand-drawn heart motif, echoing the save-the-date card.
export function Heart({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 72"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M32 24c-4-11-13-15-20-11C4 17 4 28 11 36c5 6 14 14 21 22" />
      <path d="M32 24c4-11 13-15 20-11 8 4 8 15 1 23-3 4-8 8-13 13" />
    </svg>
  );
}
