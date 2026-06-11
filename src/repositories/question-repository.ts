import type {
  AnswerFramework as PrismaAnswerFramework,
  Prisma,
  QuestionType as PrismaQuestionType,
  Track as PrismaTrack,
} from "@prisma/client";
import type { Question, Track } from "../domain/question.js";
import { prisma } from "../lib/prisma.js";

type QuestionRow = Prisma.QuestionGetPayload<{
  include: {
    followUpLinks: {
      include: {
        followUpQuestion: true;
      };
      orderBy: {
        displayOrder: "asc";
      };
    };
  };
}>;

export class QuestionRepository {
  async findByTrackAndOrder(track: Track, questionOrder: number): Promise<Question | null> {
    const question = await prisma.question.findFirst({
      where: {
        track: track as PrismaTrack,
        questionOrder,
        isPublished: true,
      },
      include: {
        followUpLinks: {
          include: {
            followUpQuestion: true,
          },
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });

    return question ? this.toDomain(question) : null;
  }

  async findById(id: number): Promise<Question | null> {
    const question = await prisma.question.findFirst({
      where: {
        id,
        isPublished: true,
      },
      include: {
        followUpLinks: {
          include: {
            followUpQuestion: true,
          },
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });

    return question ? this.toDomain(question) : null;
  }

  async findAll(): Promise<Question[]> {
    const questions = await prisma.question.findMany({
      where: {
        isPublished: true,
      },
      include: {
        followUpLinks: {
          include: {
            followUpQuestion: true,
          },
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
      orderBy: [{ track: "asc" }, { questionOrder: "asc" }],
    });

    return questions.map((question) => this.toDomain(question));
  }

  async findAllByTrack(track: Track): Promise<Question[]> {
    const questions = await prisma.question.findMany({
      where: {
        track: track as PrismaTrack,
        isPublished: true,
      },
      include: {
        followUpLinks: {
          include: {
            followUpQuestion: true,
          },
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
      orderBy: {
        questionOrder: "asc",
      },
    });

    return questions.map((question) => this.toDomain(question));
  }

  async existsByIds(ids: number[]): Promise<number[]> {
    if (ids.length === 0) {
      return [];
    }

    const rows = await prisma.question.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
      },
    });

    return rows.map((row) => row.id);
  }

  async getNextQuestionId(): Promise<number> {
    const aggregate = await prisma.question.aggregate({
      _max: {
        id: true,
      },
    });

    return (aggregate._max.id ?? 0) + 1;
  }

  async getNextQuestionOrder(track: Track): Promise<number> {
    const aggregate = await prisma.question.aggregate({
      where: {
        track: track as PrismaTrack,
      },
      _max: {
        questionOrder: true,
      },
    });

    return (aggregate._max.questionOrder ?? 0) + 1;
  }

  async create(
    question: Omit<Question, "followUps">,
    followUpQuestionIds: number[],
  ): Promise<Question> {
    const created = await prisma.question.create({
      data: {
        id: question.id,
        track: question.track as PrismaTrack,
        category: question.category,
        questionType: question.questionType as PrismaQuestionType,
        recommendedFramework: question.recommendedFramework as PrismaAnswerFramework,
        title: question.title,
        questionText: question.questionText,
        conceptSummary: question.conceptSummary,
        modelAnswer: question.modelAnswer,
        questionOrder: question.questionOrder,
        isPublished: question.isPublished,
        followUpLinks: {
          create: followUpQuestionIds.map((followUpQuestionId, index) => ({
            followUpQuestionId,
            displayOrder: index + 1,
          })),
        },
      },
      include: {
        followUpLinks: {
          include: {
            followUpQuestion: true,
          },
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });

    return this.toDomain(created);
  }

  async update(
    id: number,
    update: Partial<Omit<Question, "followUps">>,
    followUpQuestionIds?: number[],
  ): Promise<Question | null> {
    const existing = await prisma.question.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return null;
    }

    await prisma.$transaction(async (tx) => {
      await tx.question.update({
        where: { id },
        data: {
          ...(update.track ? { track: update.track as PrismaTrack } : {}),
          ...(update.category !== undefined ? { category: update.category } : {}),
          ...(update.questionType ? { questionType: update.questionType as PrismaQuestionType } : {}),
          ...(update.recommendedFramework
            ? { recommendedFramework: update.recommendedFramework as PrismaAnswerFramework }
            : {}),
          ...(update.title !== undefined ? { title: update.title } : {}),
          ...(update.questionText !== undefined ? { questionText: update.questionText } : {}),
          ...(update.conceptSummary !== undefined ? { conceptSummary: update.conceptSummary } : {}),
          ...(update.modelAnswer !== undefined ? { modelAnswer: update.modelAnswer } : {}),
          ...(update.questionOrder !== undefined ? { questionOrder: update.questionOrder } : {}),
          ...(update.isPublished !== undefined ? { isPublished: update.isPublished } : {}),
        },
      });

      if (followUpQuestionIds !== undefined) {
        await tx.questionFollowUp.deleteMany({
          where: {
            questionId: id,
          },
        });

        if (followUpQuestionIds.length > 0) {
          await tx.questionFollowUp.createMany({
            data: followUpQuestionIds.map((followUpQuestionId, index) => ({
              questionId: id,
              followUpQuestionId,
              displayOrder: index + 1,
            })),
          });
        }
      }
    });

    return this.findById(id);
  }

  private toDomain(question: QuestionRow): Question {
    return {
      id: question.id,
      track: question.track as Track,
      category: question.category,
      questionType: question.questionType as Question["questionType"],
      recommendedFramework: question.recommendedFramework as Question["recommendedFramework"],
      title: question.title,
      questionText: question.questionText,
      conceptSummary: question.conceptSummary,
      modelAnswer: question.modelAnswer,
      questionOrder: question.questionOrder,
      isPublished: question.isPublished,
      followUps: question.followUpLinks
        .filter((link) => link.followUpQuestion.isPublished)
        .map((link) => ({
          id: link.followUpQuestion.id,
          track: link.followUpQuestion.track as Track,
          questionOrder: link.followUpQuestion.questionOrder,
          title: link.followUpQuestion.title,
          questionText: link.followUpQuestion.questionText,
          questionType: link.followUpQuestion.questionType as Question["questionType"],
          recommendedFramework: link.followUpQuestion.recommendedFramework as Question["recommendedFramework"],
        })),
    };
  }
}
