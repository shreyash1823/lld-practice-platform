import { describe, expect, it } from "vitest";
import { StructuralValidator } from "@/domain/evaluation/StructuralValidator";
import { validDesign } from "../helpers";

const validator = new StructuralValidator();

describe("StructuralValidator", () => {
  it("accepts a complete structured design", () => {
    const result = validator.validate(validDesign());
    expect(result.ok).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("rejects missing required headings", () => {
    const result = validator.validate("## Assumptions\n\nWe skip the rest on purpose.");
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.section === "Requirements understood")).toBe(
      true,
    );
  });

  it("rejects a heading with almost no body", () => {
    const thin = validDesign().replace(
      "Need multi-floor parking for bikes, cars, buses, tickets, and fees.",
      "Too short.",
    );
    const result = validator.validate(thin);
    expect(result.ok).toBe(false);
    expect(
      result.issues.some((i) => i.section === "Requirements understood"),
    ).toBe(true);
  });

  it("rejects an empty mermaid fence", () => {
    const result = validator.validate(`${validDesign()}\n\n\`\`\`mermaid\n\n\`\`\``);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.section === "mermaid")).toBe(true);
  });

  it("accepts a classDiagram mermaid block", () => {
    const result = validator.validate(
      `${validDesign()}\n\n\`\`\`mermaid\nclassDiagram\n  class ParkingLot\n\`\`\``,
    );
    expect(result.ok).toBe(true);
  });
});
