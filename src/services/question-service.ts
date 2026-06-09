import type { AnswerFramework, FollowUp, Question, QuestionType, Track } from "../domain/question.js";
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
  followUps: FollowUp[];
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
    const nextId = this.questionRepository.findAll().reduce((max, question) => Math.max(max, question.id), 0) + 1;
    const nextQuestionOrder = existingQuestions.reduce((max, question) => Math.max(max, question.questionOrder), 0) + 1;

    const question: Question = {
      id: nextId,
      track: input.track,
      category: input.category,
      questionType: input.questionType,
      recommendedFramework: input.recommendedFramework,
      title: input.title,
      questionText: input.questionText,
      conceptSummary: input.conceptSummary,
      modelAnswer: input.modelAnswer,
      followUps: input.followUps,
      questionOrder: nextQuestionOrder,
      isPublished: true,
    };

    return this.questionRepository.create(question);
  }

  updateQuestion(id: number, input: UpdateQuestionInput) {
    return this.questionRepository.update(id, input);
  }
}
