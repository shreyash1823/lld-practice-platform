import {
  MIN_SECTION_CHARS,
  REQUIRED_SECTIONS,
} from "../constants";

export type StructuralIssue = {
  section: string;
  message: string;
};

export type StructuralResult = {
  ok: boolean;
  issues: StructuralIssue[];
};

/**
 * Deterministic checks on structured-text submissions.
 * Future formats get their own SubmissionValidator implementation.
 */
export interface SubmissionValidator {
  validate(content: string): StructuralResult;
}

export class StructuralValidator implements SubmissionValidator {
  validate(content: string): StructuralResult {
    const issues: StructuralIssue[] = [];
    const normalized = content.replace(/\r\n/g, "\n");

    if (!normalized.trim()) {
      return {
        ok: false,
        issues: [{ section: "document", message: "Submission is empty." }],
      };
    }

    for (const section of REQUIRED_SECTIONS) {
      const heading = new RegExp(`^##\\s+${escapeRegExp(section)}\\s*$`, "im");
      if (!heading.test(normalized)) {
        issues.push({
          section,
          message: `Missing required heading "## ${section}".`,
        });
        continue;
      }
      const body = extractSectionBody(normalized, section);
      if (body.length < MIN_SECTION_CHARS) {
        issues.push({
          section,
          message: `Section needs at least ${MIN_SECTION_CHARS} characters of design reasoning.`,
        });
      }
    }

    const mermaidBlocks = Array.from(
      normalized.matchAll(/```mermaid\s*([\s\S]*?)```/gi),
    );
    for (const block of mermaidBlocks) {
      const inner = (block[1] ?? "").trim();
      if (!inner) {
        issues.push({
          section: "mermaid",
          message: "Optional mermaid block is empty.",
        });
      } else if (!/^(classDiagram|sequenceDiagram|flowchart|graph)\b/m.test(inner)) {
        issues.push({
          section: "mermaid",
          message:
            "Mermaid block should start with classDiagram, sequenceDiagram, flowchart, or graph.",
        });
      }
    }

    return { ok: issues.length === 0, issues };
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractSectionBody(markdown: string, heading: string): string {
  const pattern = new RegExp(
    `^##\\s+${escapeRegExp(heading)}\\s*$\\n?([\\s\\S]*?)(?=^##\\s+|$)`,
    "im",
  );
  const match = markdown.match(pattern);
  if (!match) return "";
  return (match[1] ?? "")
    .replace(/```[\s\S]*?```/g, "")
    .trim();
}
