export type CriterionScore = {
  name: string;
  score: number;
  evidence: string;
  concern: string;
  suggestion: string;
  confidence: "low" | "medium" | "high";
};

export type FeedbackData = {
  criteria: CriterionScore[];
  overallSummary: string;
  strengths: string[];
  improvements: string[];
};

export class Feedback {
  constructor(private readonly data: FeedbackData) {}

  get criteria() {
    return this.data.criteria;
  }
  get overallSummary() {
    return this.data.overallSummary;
  }
  get strengths() {
    return this.data.strengths;
  }
  get improvements() {
    return this.data.improvements;
  }

  overallScore(): number | null {
    if (this.data.criteria.length === 0) return null;
    const sum = this.data.criteria.reduce((acc, c) => acc + c.score, 0);
    return Math.round((sum / this.data.criteria.length) * 10) / 10;
  }

  toJSON(): FeedbackData & { overallScore: number | null } {
    return {
      ...this.data,
      criteria: this.data.criteria.map((c) => ({ ...c })),
      strengths: [...this.data.strengths],
      improvements: [...this.data.improvements],
      overallScore: this.overallScore(),
    };
  }
}
