import { NextResponse } from "next/server";
import { services } from "@/application/container";
import { getOrCreateLearnerId } from "@/lib/session";
import { errorResponse } from "@/lib/http";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const learnerId = getOrCreateLearnerId();
    const detail = await services.attemptDetail.execute(params.id, learnerId);
    return NextResponse.json(detail);
  } catch (error) {
    return errorResponse(error);
  }
}
