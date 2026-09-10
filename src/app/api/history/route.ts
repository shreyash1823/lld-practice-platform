import { NextResponse } from "next/server";
import { services } from "@/application/container";
import { getOrCreateLearnerId } from "@/lib/session";

export async function GET() {
  const learnerId = getOrCreateLearnerId();
  const items = await services.history.execute(learnerId);
  return NextResponse.json({ items });
}
