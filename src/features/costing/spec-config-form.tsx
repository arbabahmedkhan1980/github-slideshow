"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { SpecTier } from "@prisma/client";

const tiers: SpecTier[] = ["LOW", "LUXURY", "ULTRA", "SMART"];

type Props = {
  bathroomTypeId: string;
  defaultRateProfileId?: string;
};

export const SpecConfigForm = ({
  bathroomTypeId,
  defaultRateProfileId
}: Props) => {
  const [rateProfileId, setRateProfileId] = useState(defaultRateProfileId ?? "");
  const [structureTier, setStructureTier] = useState<SpecTier>("LOW");
  const [floorTier, setFloorTier] = useState<SpecTier>("LOW");
  const [lightingTier, setLightingTier] = useState<SpecTier>("LOW");
  const [wcTier, setWcTier] = useState<SpecTier>("LOW");
  const [ceilingLights, setCeilingLights] = useState(2);
  const [ledStripFeet, setLedStripFeet] = useState(4);
  const [overhead, setOverhead] = useState(0.15);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const payload = {
        rateProfileId: rateProfileId || undefined,
        structureConfig: {
          concreteTier: structureTier,
          lgsTier: structureTier,
          mepFirstFixTier: structureTier,
          mepSecondFixTier: structureTier,
          floorTileTier: floorTier
        },
        lightingConfig: {
          ceilingLights,
          ledStripFeet,
          tier: lightingTier
        },
        secondFixItems: [
          { category: "WC", tier: wcTier, quantity: 1 },
          { category: "SHOWER_SET", tier: wcTier, quantity: 1 },
          { category: "BASIN", tier: wcTier, quantity: 1 },
          { category: "BASIN_MIXER", tier: wcTier, quantity: 1 }
        ],
        overheadMargin: overhead
      };

      const response = await fetch(
        `/api/bathroom-types/${bathroomTypeId}/spec`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to save spec");
      }

      setMessage("Spec saved");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-slate-200 p-4">
      <div>
        <label className="text-sm text-slate-600">Rate profile ID</label>
        <input
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={rateProfileId}
          onChange={(e) => setRateProfileId(e.target.value)}
          placeholder="cuid of rate profile"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Selection
          label="Structure tier"
          value={structureTier}
          onChange={setStructureTier}
        />
        <Selection
          label="Floor finish tier"
          value={floorTier}
          onChange={setFloorTier}
        />
        <Selection
          label="Lighting tier"
          value={lightingTier}
          onChange={setLightingTier}
        />
        <Selection label="WC tier" value={wcTier} onChange={setWcTier} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-slate-600">Ceiling lights</label>
          <input
            type="number"
            min={1}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={ceilingLights}
            onChange={(e) => setCeilingLights(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">LED strip (ft)</label>
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={ledStripFeet}
            onChange={(e) => setLedStripFeet(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">Overhead margin</label>
          <input
            type="number"
            step={0.01}
            min={0}
            max={0.5}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={overhead}
            onChange={(e) => setOverhead(Number(e.target.value))}
          />
        </div>
      </div>
      {message && <p className="text-sm text-slate-600">{message}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save spec"}
      </Button>
    </form>
  );
};

const Selection = ({
  label,
  value,
  onChange
}: {
  label: string;
  value: SpecTier;
  onChange: (tier: SpecTier) => void;
}) => (
  <div>
    <label className="text-sm text-slate-600">{label}</label>
    <select
      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value as SpecTier)}
    >
      {tiers.map((tier) => (
        <option key={tier} value={tier}>
          {tier}
        </option>
      ))}
    </select>
  </div>
);
