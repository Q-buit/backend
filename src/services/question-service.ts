import { QuestionRepository } from "../repositories/question-repository.js";

export class QuestionService {
  constructor(private readonly questionRepository: QuestionRepository) {}

  getQuestionDetail(id: number) {
    const question = this.questionRepository.findById(id);
    if (!question) {
      return null;
    }

    return question;
  }

  listQuestions() {
    return this.questionRepository.findAll();
  }
}
