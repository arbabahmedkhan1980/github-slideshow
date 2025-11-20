"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type FloorOption = {
  id: string;
  name: string;
};

type Props = {
  projectId: string;
  floors: FloorOption[];
};

export const ManualBathroomForm = ({ projectId, floors }: Props) => {
  const router = useRouter();
  const [floorId, setFloorId] = useState(floors[0]?.id ?? "");
  const [label, setLabel] = useState("BATH");
  const [lengthMm, setLengthMm] = useState(2600);
  const [widthMm, setWidthMm] = useState(1800);
  const [heightMm, setHeightMm] = useState(2600);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const floorOptions = useMemo(
    () =>
      floors.map((floor) => (
        <option key={floor.id} value={floor.id}>
          {floor.name}
        </option>
      )),
    [floors]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const bathrooms = Array.from({ length: quantity }).map(() => ({
        floorId,
        label,
        lengthMm,
        widthMm,
        heightMm
      }));

      const response = await fetch(`/api/projects/${projectId}/bathrooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bathrooms })
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Failed to add bathrooms");
      }

      setMessage("Bathrooms added");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-sm text-slate-600">Floor</label>
        <select
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={floorId}
          onChange={(e) => setFloorId(e.target.value)}
        >
          {floorOptions}
        </select>
      </div>
      <div>
        <label className="text-sm text-slate-600">Label</label>
        <input
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-sm text-slate-600">Length (mm)</label>
          <input
            type="number"
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={lengthMm}
            onChange={(e) => setLengthMm(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">Width (mm)</label>
          <input
            type="number"
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={widthMm}
            onChange={(e) => setWidthMm(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">Height (mm)</label>
          <input
            type="number"
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={heightMm}
            onChange={(e) => setHeightMm(Number(e.target.value))}
          />
        </div>
      </div>
      <div>
        <label className="text-sm text-slate-600">Quantity</label>
        <input
          type="number"
          min={1}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>
      {message && <p className="text-sm text-slate-600">{message}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Add bathrooms"}
      </Button>
    </form>
  );
};
