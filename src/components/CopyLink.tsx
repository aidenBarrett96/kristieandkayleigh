"use client";

import { useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard may be unavailable on insecure origins; ignore.
        }
      }}
      className="text-xs font-medium text-ink-soft underline-offset-2 hover:text-ink hover:underline"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
