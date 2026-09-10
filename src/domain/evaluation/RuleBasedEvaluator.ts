import { RUBRIC_CRITERIA } from "../constants";
import { Feedback } from "../entities/Feedback";
import type { Problem } from "../entities/Problem";
import type { Submission } from "../entities/Submission";
import type { Evaluator } from "./Evaluator";

const SECTION_NAMES = [
  "Requirements understood",
  "Assumptions",
  "Core classes & responsibilities",
  "Key interfaces / abstractions",
  "Important interactions (sequence / flow)",
  "Extensibility & trade-offs",
  "Edge cases & testability",
] as const;

export class RuleBasedEvaluator implements Evaluator {
  async evaluate(submission: Submission, problem: Problem): Promise<Feedback> {
    const normalized = submission.content.replace(/\r\n/g, "\n").trim();
    const sections = this.extractSections(normalized);

    const criteria = RUBRIC_CRITERIA.map((criterion) => {
      const { score, evidence, concern, suggestion } = this.scoreCriterion(
        criterion.name,
        sections,
        normalized,
      );

      return {
        name: criterion.name,
        score,
        evidence,
        concern,
        suggestion,
        confidence: score >= 4 ? "high" : score >= 3 ? "medium" : "low",
      };
    });

    const strengths = this.buildStrengths(sections, normalized);
    const improvements = [
      "Name the class or module that owns each responsibility.",
      "Call out one realistic change scenario and how the design adapts.",
      "Describe at least one failure path and how it is observed or tested.",
    ];

    return new Feedback({
      criteria,
      overallSummary:
        "offline rule-based evaluation ran successfully. This feedback is generated locally from the structured submission and avoids any dependency on an external AI service.",
      strengths,
      improvements,
    });
  }

  private extractSections(content: string) {
    const sections: Record<string, string> = {};

    for (const section of SECTION_NAMES) {
      const pattern = new RegExp(
        `^##\\s+${escapeRegExp(section)}\\s*$\\n?([\\s\\S]*?)(?=^##\\s+|$)`,
        "im",
      );
      const match = content.match(pattern);
      sections[section] = (match?.[1] ?? "").trim();
    }

    return sections;
  }

  private scoreCriterion(
    criterionName: string,
    sections: Record<string, string>,
    normalized: string,
  ) {
    const requirements = sections["Requirements understood"] ?? "";
    const assumptions = sections["Assumptions"] ?? "";
    const classes = sections["Core classes & responsibilities"] ?? "";
    const interfaces = sections["Key interfaces / abstractions"] ?? "";
    const interactions = sections["Important interactions (sequence / flow)"] ?? "";
    const extensibility = sections["Extensibility & trade-offs"] ?? "";
    const edgeCases = sections["Edge cases & testability"] ?? "";

    const sectionLengths = {
      requirements: (requirements + " " + assumptions).trim().length,
      classes: classes.length,
      interfaces: interfaces.length,
      interactions: interactions.length,
      extensibility: extensibility.length,
      edgeCases: edgeCases.length,
      explanation: normalized.length,
    };

    const scoreMap: Record<string, { score: number; evidence: string; concern: string; suggestion: string }> = {
      "Requirement understanding": {
        score: this.scoreFromSignals(
          sectionLengths.requirements,
          /requirement|constraint|assumption|scope|missing/i,
          requirements + " " + assumptions,
        ),
        evidence: this.pickEvidence(requirements || assumptions, "requirement or assumption"),
        concern:
          sectionLengths.requirements < 80
            ? "The submission does not yet spell out the scope and assumptions clearly."
            : "The scope is mostly covered, but hidden assumptions are still implicit.",
        suggestion:
          "State the key assumptions and any edges that might otherwise be interpreted differently.",
      },
      "Class responsibilities": {
        score: this.scoreFromSignals(
          sectionLengths.classes,
          /class|service|manager|controller|responsib/i,
          classes,
        ),
        evidence: this.pickEvidence(classes, "class responsibilities"),
        concern:
          sectionLengths.classes < 80
            ? "The responsibilities are not yet split into clear owners."
            : "Some responsibilities may be overlapping or not clearly assigned.",
        suggestion:
          "Give each class one primary responsibility and explain what it should never own.",
      },
      "Coupling / cohesion": {
        score: this.scoreFromSignals(
          sectionLengths.interactions,
          /depends on|depends|cohesive|coupling|owner|flow/i,
          interactions,
        ),
        evidence: this.pickEvidence(interactions, "interaction flow or dependency structure"),
        concern:
          sectionLengths.interactions < 80
            ? "The dependency direction is not fully explained."
            : "A few dependencies may still be too implicit for a reviewer to trust.",
        suggestion:
          "Describe which components depend on which others and why the dependency direction is correct.",
      },
      "Encapsulation & interfaces": {
        score: this.scoreFromSignals(
          sectionLengths.interfaces,
          /interface|abstract|port|contract|hide|encapsulat/i,
          interfaces,
        ),
        evidence: this.pickEvidence(interfaces, "interfaces or abstractions"),
        concern:
          sectionLengths.interfaces < 80
            ? "The submission does not yet show a strong abstraction boundary."
            : "The boundaries are mostly visible, but a few internal details may be leaking.",
        suggestion:
          "Introduce one explicit interface or abstraction that hides implementation details from callers.",
      },
      "Patterns & abstraction": {
        score: this.scoreFromSignals(
          sectionLengths.extensibility,
          /strategy|factory|observer|decorator|pattern|trade-off|swap|replace/i,
          extensibility,
        ),
        evidence: this.pickEvidence(extensibility, "pattern reasoning or trade-offs"),
        concern:
          sectionLengths.extensibility < 80
            ? "The design does not explain when a pattern is worth the complexity."
            : "There is some architectural thinking, but the abstraction choice should be justified more explicitly.",
        suggestion:
          "Name the abstraction you are adding, why it exists, and what it would enable later.",
      },
      "Extensibility": {
        score: this.scoreFromSignals(
          sectionLengths.extensibility,
          /later|change|extend|swap|replace|plug|policy|config/i,
          extensibility,
        ),
        evidence: this.pickEvidence(extensibility, "extensibility discussion"),
        concern:
          sectionLengths.extensibility < 80
            ? "There is not yet enough evidence that the design can absorb future change."
            : "The design has some extensibility ideas, but the change scenario could be more concrete.",
        suggestion:
          "Describe one concrete requirement change and explain how the current design handles it without rewiring the core.",
      },
      "Edge cases & testability": {
        score: this.scoreFromSignals(
          sectionLengths.edgeCases,
          /edge|invalid|null|error|test|failure|race|case/i,
          edgeCases,
        ),
        evidence: this.pickEvidence(edgeCases, "edge cases or testability discussion"),
        concern:
          sectionLengths.edgeCases < 80
            ? "The design does not yet surface failure modes or how they would be validated."
            : "The design covers some failure modes, but the validation story could be clearer.",
        suggestion:
          "List one or two failure cases and describe how you would verify the behavior under those conditions.",
      },
      "Explanation quality": {
        score: this.scoreFromSignals(
          sectionLengths.explanation,
          /because|therefore|so that|ensures|this allows|however|trade-off/i,
          normalized,
        ),
        evidence: this.pickEvidence(normalized, "reasoning quality"),
        concern:
          sectionLengths.explanation < 300
            ? "The submission is short enough that the reasoning may feel under-explained."
            : "The design is detailed, but the reasoning is not yet fully tied to concrete evidence.",
        suggestion:
          "Tie each design choice back to a specific requirement, constraint, or trade-off instead of naming patterns alone.",
      },
    };

    return scoreMap[criterionName];
  }

  private scoreFromSignals(
    length: number,
    pattern: RegExp,
    content: string,
  ): number {
    const matches = pattern.test(content);
    const lengthScore = length > 500 ? 4 : length > 180 ? 3 : length > 80 ? 2 : 1;
    const keywordBonus = matches ? 1 : 0;
    return Math.min(5, Math.max(1, lengthScore + keywordBonus));
  }

  private pickEvidence(content: string, label: string): string {
    const cleaned = content.replace(/\s+/g, " ").trim();
    if (!cleaned) {
      return `No explicit ${label} was found in the submission.`;
    }
    return cleaned.slice(0, 180);
  }

  private buildStrengths(
    sections: Record<string, string>,
    normalized: string,
  ): string[] {
    const strengths: string[] = [];

    if ((sections["Key interfaces / abstractions"] ?? "").length > 40) {
      strengths.push("You named relevant interfaces or abstractions that clarify the design boundary.");
    }
    if ((sections["Extensibility & trade-offs"] ?? "").length > 40) {
      strengths.push("You discussed trade-offs and how the design can adapt to later changes.");
    }
    if ((sections["Edge cases & testability"] ?? "").length > 40) {
      strengths.push("You surfaced failure modes and made the design testable.");
    }
    if (strengths.length === 0) {
      strengths.push("The submission includes a structured format that can be scored reliably offline.");
    }

    if ((normalized.match(/class|service|controller|repository/gi) ?? []).length >= 2) {
      strengths.push("The design uses recognizable domain objects and responsibilities.");
    }

    return strengths.slice(0, 4);
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
