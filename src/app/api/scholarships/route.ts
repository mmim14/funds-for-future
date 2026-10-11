import { NextResponse } from "next/server";
import { loadScholarships } from "@/lib/scholarship-store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try { return NextResponse.json({ opportunities: await loadScholarships() }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "Unable to load scholarships. Please try again." }, { status: 503 }); }
}
