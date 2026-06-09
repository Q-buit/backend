import type { Question, Track } from "../domain/question.js";
import { questions } from "../data/mock-data.js";

export class QuestionRepository {
  findByTrackAndOrder(track: Track, questionOrder: number): Question | null {
    return questions.find((question) => question.track === track && question.questionOrder === questionOrder && question.isPublished) ?? null;
  }

  findById(id: number): Question | null {
    return questions.find((question) => question.id === id && question.isPublished) ?? null;
  }

  findAll(): Question[] {
    return questions.filter((question) => question.isPublished);
  }

  findAllByTrack(track: Track): Question[] {
    return questions.filter((question) => question.track === track && question.isPublished);
  }

  create(question: Question): Question {
    questions.push(question);
    return question;
  }

  update(id: number, update: Partial<Question>): Question | null {
    const index = questions.findIndex((question) => question.id === id);
    if (index === -1) {
      return null;
    }

    questions[index] = {
      ...questions[index],
      ...update,
    };

    return questions[index];
  }
}
