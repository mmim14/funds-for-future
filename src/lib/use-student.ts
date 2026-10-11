"use client";
import { useEffect, useState } from "react";
export type StudentProfile = { major: string; gpa: number | string | null; state: string; firstGeneration: string; collegeStart: string; interests: string[] };
export function storageKey(studentId: string, section: string) { return "fund-for-future:" + studentId + ":" + section; }
export function useStudent() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/student/profile", { cache: "no-store", signal: controller.signal });
        if (response.status === 401) return;
        if (!response.ok) throw new Error("Unable to load your profile. Please refresh to try again.");
        const data = await response.json();
        setStudentId(data.student.id); setProfile(data.profile);
      } catch (error) { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Unable to load your profile."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load(); return () => controller.abort();
  }, []);
  return { studentId, profile, loading, error };
}
