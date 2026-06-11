export type Track = "frontend" | "backend";
export type QuestionType = "concept" | "experience";
export type AnswerFramework = "PREP" | "STAR";

export type FollowUpQuestion = {
  id: number;
  track: Track;
  questionOrder: number;
  title: string;
  questionText: string;
  questionType: QuestionType;
  recommendedFramework: AnswerFramework;
};

export type QuestionFollowUpLink = {
  id: number;
  questionId: number;
  followUpQuestionId: number;
  displayOrder: number;
};

export type Question = {
  id: number;
  track: Track;
  category: string;
  questionType: QuestionType;
  recommendedFramework: AnswerFramework;
  title: string;
  questionText: string;
  conceptSummary: string;
  modelAnswer: string;
  followUps: FollowUpQuestion[];
  questionOrder: number;
  isPublished: boolean;
};
