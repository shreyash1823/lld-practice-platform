import { NextResponse } from "next/server";
import { services } from "@/application/container";
import { getOrCreateLearnerId } from "@/lib/session";
import { errorResponse } from "@/lib/http";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const learnerId = getOrCreateLearnerId();
    const evaluation = await services.getEvaluation.execute(params.id, learnerId);
    if (evaluation.status !== "FAILED") {
      return NextResponse.json(
        { error: "Only failed evaluations can be retried." },
        { status: 409 },
      );
    }
    void services.runEvaluation.execute(params.id).catch((error) => {
      console.error("Retry evaluation failed", error);
    });
    return NextResponse.json({ evaluationId: params.id, status: "PENDING" }, { status: 202 });
  } catch (error) {
    return errorResponse(error);
  }
}
