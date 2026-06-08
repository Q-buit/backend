import type { Question } from "../domain/question.js";
import { questions } from "../data/mock-data.js";

export class QuestionRepository {
  findById(id: number): Question | null {
    return questions.find((question) => question.id === id && question.isActive) ?? null;
  }

  findAll(): Question[] {
    return questions.filter((question) => question.isActive);
  }
}
