"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  bathroomTypeId: string;
};

export const RunCostButton = ({ bathroomTypeId }: Props) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/bathroom-types/${bathroomTypeId}/cost`, {
        method: "POST"
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Failed to calculate cost");
      }
      setMessage("Cost updated");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      <Button onClick={handleClick} disabled={loading}>
        {loading ? "Calculating..." : "Run cost"}
      </Button>
      {message && <p className="text-xs text-slate-500">{message}</p>}
    </div>
  );
};
