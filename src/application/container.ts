import { EvaluationPipeline } from "@/domain/evaluation/EvaluationPipeline";
import { RuleBasedEvaluator } from "@/domain/evaluation/RuleBasedEvaluator";
import { StructuralValidator } from "@/domain/evaluation/StructuralValidator";
import {
  GetAttemptDetailService,
  GetAttemptHistoryService,
  GetEvaluationService,
} from "@/application/services/GetAttemptHistoryService";
import { RunEvaluationService } from "@/application/services/RunEvaluationService";
import { StartAttemptService } from "@/application/services/StartAttemptService";
import { SubmitSolutionService } from "@/application/services/SubmitSolutionService";
import { createLlmClient } from "@/infrastructure/ai/llmClient";
import { PrismaAttemptRepository } from "@/infrastructure/prisma/PrismaAttemptRepository";
import { PrismaEvaluationRepository } from "@/infrastructure/prisma/PrismaEvaluationRepository";
import { PrismaProblemRepository } from "@/infrastructure/prisma/PrismaProblemRepository";
import { PrismaSubmissionRepository } from "@/infrastructure/prisma/PrismaSubmissionRepository";

const problems = new PrismaProblemRepository();
const attempts = new PrismaAttemptRepository();
const submissions = new PrismaSubmissionRepository();
const evaluations = new PrismaEvaluationRepository();
const validator = new StructuralValidator();
const evaluator = new RuleBasedEvaluator();
const pipeline = new EvaluationPipeline(validator, evaluator, evaluations);

export const services = {
  startAttempt: new StartAttemptService(problems, attempts),
  submitSolution: new SubmitSolutionService(
    attempts,
    submissions,
    evaluations,
    validator,
  ),
  runEvaluation: new RunEvaluationService(
    pipeline,
    evaluations,
    submissions,
    attempts,
    problems,
  ),
  history: new GetAttemptHistoryService(
    attempts,
    problems,
    submissions,
    evaluations,
  ),
  attemptDetail: new GetAttemptDetailService(
    attempts,
    problems,
    submissions,
    evaluations,
  ),
  getEvaluation: new GetEvaluationService(evaluations, submissions, attempts),
  problems,
};
