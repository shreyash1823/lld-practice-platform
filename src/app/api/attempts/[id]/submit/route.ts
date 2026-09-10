import { NextResponse } from "next/server";
import { services } from "@/application/container";
import { getOrCreateLearnerId } from "@/lib/session";
import { errorResponse } from "@/lib/http";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const learnerId = getOrCreateLearnerId();
    const body = (await request.json()) as { content?: string };
    if (typeof body.content !== "string") {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const result = await services.submitSolution.execute({
      attemptId: params.id,
      learnerId,
      content: body.content,
    });

    if (!result.alreadySubmitted) {
      const evaluationId = result.evaluationId;
      void services.runEvaluation.execute(evaluationId).catch((error) => {
        console.error("Background evaluation failed", error);
      });
    }

    return NextResponse.json(result, { status: 202 });
  } catch (error) {
    return errorResponse(error);
  }
}
