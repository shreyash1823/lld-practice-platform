import { DomainError } from "@/domain/errors";
import { NextResponse } from "next/server";

export function errorResponse(error: unknown) {
  if (error instanceof DomainError) {
    const status =
      error.code === "FORBIDDEN"
        ? 403
        : error.code === "INVALID_SUBMISSION"
          ? 400
          : error.code === "ALREADY_SUBMITTED"
            ? 409
            : error.code.endsWith("NOT_FOUND")
              ? 404
              : 400;
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status },
    );
  }
  console.error(error);
  return NextResponse.json({ error: "Internal error" }, { status: 500 });
}
