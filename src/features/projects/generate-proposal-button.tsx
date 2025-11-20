"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  projectId: string;
  projectName: string;
};

export const GenerateProposalButton = ({ projectId, projectName }: Props) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/proposal`, {
        method: "POST"
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Failed to generate proposal");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${projectName}-proposal.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMessage("Proposal downloaded");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      <Button onClick={handleClick} disabled={loading}>
        {loading ? "Preparing..." : "Download proposal"}
      </Button>
      {message && <p className="text-xs text-slate-500">{message}</p>}
    </div>
  );
};
