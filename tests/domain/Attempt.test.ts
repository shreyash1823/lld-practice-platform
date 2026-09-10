import { describe, expect, it } from "vitest";
import { ATTEMPT_STATUS } from "@/domain/constants";
import { DomainError } from "@/domain/errors";
import { inProgressAttempt } from "../helpers";

describe("Attempt", () => {
  it("transitions from in progress to submitted once", () => {
    const attempt = inProgressAttempt();
    attempt.markSubmitted(new Date("2026-02-01"));
    expect(attempt.status).toBe(ATTEMPT_STATUS.SUBMITTED);
    expect(attempt.submittedAt?.toISOString()).toBe(
      new Date("2026-02-01").toISOString(),
    );
    expect(() => attempt.markSubmitted()).toThrow(DomainError);
  });

  it("belongs only to its learner", () => {
    const attempt = inProgressAttempt("abc");
    expect(attempt.belongsTo("abc")).toBe(true);
    expect(attempt.belongsTo("other")).toBe(false);
  });
});
