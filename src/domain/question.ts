export type Track = "frontend" | "backend";
export type QuestionType = "concept" | "experience";
export type AnswerFramework = "PREP" | "STAR";

export type Question = {
  id: number;
  slug: string;
  track: Track;
  category: string;
  questionType: QuestionType;
  recommendedFramework: AnswerFramework;
  title: string;
  question: string;
  conceptSummary: string;
  modelAnswer: string;
  followUps: string[];
  sequenceNo: number;
  isActive: boolean;
};
