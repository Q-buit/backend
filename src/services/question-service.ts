import type { AnswerFramework, Question, QuestionType, Track } from "../domain/question.js";
import { QuestionRepository } from "../repositories/question-repository.js";

type CreateQuestionInput = {
  track: Track;
  category: string;
  questionType: QuestionType;
  recommendedFramework: AnswerFramework;
  title: string;
  questionText: string;
  conceptSummary: string;
  modelAnswer: string;
  followUpQuestionIds: number[];
};

type UpdateQuestionInput = Partial<CreateQuestionInput> & {
  isPublished?: boolean;
};

export class QuestionService {
  constructor(private readonly questionRepository: QuestionRepository) {}

  getQuestionDetail(track: Track, questionOrder: number) {
    return this.questionRepository.findByTrackAndOrder(track, questionOrder);
  }

  getQuestionById(id: number) {
    return this.questionRepository.findById(id);
  }

  listQuestions(track?: Track) {
    if (track) {
      return this.questionRepository.findAllByTrack(track);
    }

    return this.questionRepository.findAll();
  }

  createQuestion(input: CreateQuestionInput) {
    const existingQuestions = this.questionRepository.findAllByTrack(input.track);
    const existingPublishedQuestions = this.questionRepository.findAll();
    const nextId = this.questionRepository.findAll().reduce((max, question) => Math.max(max, question.id), 0) + 1;
    const nextQuestionOrder = existingQuestions.reduce((max, question) => Math.max(max, question.questionOrder), 0) + 1;
    const normalizedFollowUpQuestionIds = [...new Set(input.followUpQuestionIds)];

    if (normalizedFollowUpQuestionIds.includes(nextId)) {
      throw new Error("질문은 자기 자신을 꼬리질문으로 가질 수 없습니다.");
    }

    const missingFollowUpQuestionId = normalizedFollowUpQuestionIds.find(
      (followUpQuestionId) => !existingPublishedQuestions.some((question) => question.id === followUpQuestionId),
    );
    if (missingFollowUpQuestionId) {
      throw new Error(`존재하지 않는 꼬리질문 ID가 있습니다: ${missingFollowUpQuestionId}`);
    }

    const question: Omit<Question, "followUps"> = {
      id: nextId,
      track: input.track,
      category: input.category,
      questionType: input.questionType,
      recommendedFramework: input.recommendedFramework,
      title: input.title,
      questionText: input.questionText,
      conceptSummary: input.conceptSummary,
      modelAnswer: input.modelAnswer,
      questionOrder: nextQuestionOrder,
      isPublished: true,
    };

    return this.questionRepository.create(question, normalizedFollowUpQuestionIds);
  }

  updateQuestion(id: number, input: UpdateQuestionInput) {
    if (input.followUpQuestionIds?.includes(id)) {
      throw new Error("질문은 자기 자신을 꼬리질문으로 가질 수 없습니다.");
    }

    if (input.followUpQuestionIds) {
      const existingPublishedQuestions = this.questionRepository.findAll();
      const missingFollowUpQuestionId = input.followUpQuestionIds.find(
        (followUpQuestionId) => !existingPublishedQuestions.some((question) => question.id === followUpQuestionId),
      );
      if (missingFollowUpQuestionId) {
        throw new Error(`존재하지 않는 꼬리질문 ID가 있습니다: ${missingFollowUpQuestionId}`);
      }
    }

    const { followUpQuestionIds, ...questionUpdate } = input;

    return this.questionRepository.update(
      id,
      questionUpdate,
      followUpQuestionIds ? [...new Set(followUpQuestionIds)] : undefined,
    );
  }
}
