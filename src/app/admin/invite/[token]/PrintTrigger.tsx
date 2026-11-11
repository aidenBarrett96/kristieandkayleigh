"use client";

export function PrintTrigger() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-primary">
      Print / Save as PDF
    </button>
  );
}
