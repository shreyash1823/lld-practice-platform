export type ProblemData = {
  id: string;
  slug: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  prompt: string;
  requirements: string[];
  constraints: string[];
  guidingQuestions: string[];
};

export class Problem {
  constructor(private readonly data: ProblemData) {}

  get id() {
    return this.data.id;
  }
  get slug() {
    return this.data.slug;
  }
  get title() {
    return this.data.title;
  }
  get difficulty() {
    return this.data.difficulty;
  }
  get prompt() {
    return this.data.prompt;
  }
  get requirements() {
    return this.data.requirements;
  }
  get constraints() {
    return this.data.constraints;
  }
  get guidingQuestions() {
    return this.data.guidingQuestions;
  }

  toJSON(): ProblemData {
    return { ...this.data, requirements: [...this.data.requirements] };
  }
}
