import { REQUIRED_SECTIONS } from "@/domain/constants";

export const SUBMISSION_TEMPLATE = REQUIRED_SECTIONS.map(
  (section) => `## ${section}\n\n`,
).join("\n");
