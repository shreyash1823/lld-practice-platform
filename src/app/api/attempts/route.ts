import { NextResponse } from "next/server";
import { services } from "@/application/container";
import { getOrCreateLearnerId } from "@/lib/session";
import { errorResponse } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const learnerId = getOrCreateLearnerId();
    const body = (await request.json()) as { problemSlug?: string };
    if (!body.problemSlug) {
      return NextResponse.json({ error: "problemSlug is required" }, { status: 400 });
    }
    const result = await services.startAttempt.execute({
      problemSlug: body.problemSlug,
      learnerId,
    });
    return NextResponse.json({
      attemptId: result.attempt.id,
      problemSlug: result.problem.slug,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
