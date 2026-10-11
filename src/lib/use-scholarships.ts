"use client";
import { useEffect, useState } from "react";
import type { Opportunity } from "./opportunities";
export function useScholarships() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/scholarships", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load scholarships. Refresh to try again.");
        const data = await response.json(); setOpportunities(data.opportunities);
      } catch (error) { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Unable to load scholarships."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load(); return () => controller.abort();
  }, []);
  return { opportunities, loading, error };
}
