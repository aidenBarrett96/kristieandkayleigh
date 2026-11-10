"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "@/components/Heart";

type Status = "idle" | "uploading" | "done" | "error";

const MAX_EDGE = 2560; // longest side after downscale
const JPEG_QUALITY = 0.85;

// Downscale large photos in the browser so uploads stay fast and within limits.
// Non-resizable types (e.g. HEIC the browser can't decode) fall back to the
// original file untouched.
async function downscale(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 3 * 1024 * 1024) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    return blob ?? file;
  } catch {
    return file; // decoding failed — let the server take the original
  }
}

export function PhotoUpload() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  async function handleUpload() {
    const files = fileRef.current?.files;
    if (!files || files.length === 0) {
      setError("Choose one or more photos first.");
      return;
    }
    setError(null);
    setStatus("uploading");
    setProgress({ done: 0, total: files.length });

    try {
      for (let i = 0; i < files.length; i++) {
        const original = files[i];
        const resized = await downscale(original);
        const name = original.name.replace(/\.[^.]+$/, "") + ".jpg";

        const form = new FormData();
        form.append("file", new File([resized], name, { type: resized.type || "image/jpeg" }));
        form.append("caption", caption);

        const res = await fetch("/api/photos/upload", { method: "POST", body: form });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Upload failed — please try again.");
        }
        setProgress({ done: i + 1, total: files.length });
      }
      setStatus("done");
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Upload failed — please try again.");
    }
  }

  return (
    <div className="card">
      <div className="flex items-start gap-3">
        <Heart className="mt-1 h-6 w-6 shrink-0 text-ink" />
        <div>
          <h3 className="font-display text-xl text-ink">Share your photos</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Upload your snaps from the day — they go straight to Kristie &amp;
            Kayleigh.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="block w-full text-sm text-ink-soft file:mr-4 file:rounded-full file:border-0
            file:bg-ink file:px-5 file:py-2 file:text-sm file:font-medium file:uppercase
            file:tracking-widest file:text-stone-light hover:file:bg-ink-soft"
        />
        <input
          className="field-input"
          placeholder="Caption (optional) — applies to this batch"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {status === "done" && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            Thank you! Your photos have been shared.
          </p>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={status === "uploading"}
          className="btn-primary"
        >
          {status === "uploading"
            ? `Uploading ${progress.done}/${progress.total}…`
            : "Upload photos"}
        </button>
      </div>
    </div>
  );
}
