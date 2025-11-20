"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  floorId: string;
};

export const UploadPlanForm = ({ floorId }: Props) => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [autoDetect, setAutoDetect] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;
    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("autoDetect", String(autoDetect));

      const response = await fetch(`/api/floors/${floorId}/uploads`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Upload failed");
      }

      setFile(null);
      setMessage("Upload complete");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="file"
        accept="application/pdf"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={autoDetect}
          onChange={(e) => setAutoDetect(e.target.checked)}
        />
        Auto-detect bathrooms
      </label>
      {message && <p className="text-sm text-slate-600">{message}</p>}
      <Button type="submit" disabled={!file || loading}>
        {loading ? "Uploading..." : "Upload plan"}
      </Button>
    </form>
  );
};
