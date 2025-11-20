"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  projectId: string;
};

export const GroupBathroomsButton = ({ projectId }: Props) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/bathroom-types/group`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({})
        }
      );
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Grouping failed");
      }
      const data = await response.json();
      setResult(`Grouped ${data.data.length} types`);
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      <Button onClick={handleClick} disabled={loading}>
        {loading ? "Grouping..." : "Group bathrooms"}
      </Button>
      {result && <p className="text-xs text-slate-500">{result}</p>}
    </div>
  );
};
