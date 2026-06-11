import type { Question, QuestionFollowUpLink, Track } from "../domain/question.js";
import { questionFollowUpLinks, questions } from "../data/mock-data.js";

export class QuestionRepository {
  findByTrackAndOrder(track: Track, questionOrder: number): Question | null {
    const question = questions.find(
      (item) => item.track === track && item.questionOrder === questionOrder && item.isPublished,
    );

    return question ? this.resolveQuestion(question) : null;
  }

  findById(id: number): Question | null {
    const question = questions.find((item) => item.id === id && item.isPublished);
    return question ? this.resolveQuestion(question) : null;
  }

  findAll(): Question[] {
    return questions
      .filter((item) => item.isPublished)
      .map((item) => this.resolveQuestion(item));
  }

  findAllByTrack(track: Track): Question[] {
    return questions
      .filter((item) => item.track === track && item.isPublished)
      .map((item) => this.resolveQuestion(item));
  }

  create(question: Omit<Question, "followUps">, followUpQuestionIds: number[]): Question {
    questions.push({
      ...question,
      followUps: [],
    });

    this.replaceFollowUps(question.id, followUpQuestionIds);
    return this.findById(question.id)!;
  }

  update(
    id: number,
    update: Partial<Omit<Question, "followUps">>,
    followUpQuestionIds?: number[],
  ): Question | null {
    const index = questions.findIndex((question) => question.id === id);
    if (index === -1) {
      return null;
    }

    questions[index] = {
      ...questions[index],
      ...update,
      followUps: [],
    };

    if (followUpQuestionIds) {
      this.replaceFollowUps(id, followUpQuestionIds);
    }

    return this.findById(id);
  }

  private resolveQuestion(question: Question): Question {
    const followUps = questionFollowUpLinks
      .filter((link) => link.questionId === question.id)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((link) => questions.find((candidate) => candidate.id === link.followUpQuestionId && candidate.isPublished))
      .filter((item): item is Question => item !== undefined)
      .map((item) => ({
        id: item.id,
        track: item.track,
        questionOrder: item.questionOrder,
        title: item.title,
        questionText: item.questionText,
        questionType: item.questionType,
        recommendedFramework: item.recommendedFramework,
      }));

    return {
      ...question,
      followUps,
    };
  }

  private replaceFollowUps(questionId: number, followUpQuestionIds: number[]) {
    for (let index = questionFollowUpLinks.length - 1; index >= 0; index -= 1) {
      if (questionFollowUpLinks[index].questionId === questionId) {
        questionFollowUpLinks.splice(index, 1);
      }
    }

    const uniqueIds = [...new Set(followUpQuestionIds)];
    let nextId = questionFollowUpLinks.reduce((max, link) => Math.max(max, link.id), 0) + 1;

    uniqueIds.forEach((followUpQuestionId, orderIndex) => {
      questionFollowUpLinks.push({
        id: nextId,
        questionId,
        followUpQuestionId,
        displayOrder: orderIndex + 1,
      });
      nextId += 1;
    });
  }
}
