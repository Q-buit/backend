export type Track = "frontend" | "backend";
export type QuestionType = "concept" | "experience";
export type AnswerFramework = "PREP" | "STAR";

export type FollowUp = {
  question: string;
  answer: string;
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
  followUps: FollowUp[];
  questionOrder: number;
  isPublished: boolean;
};
