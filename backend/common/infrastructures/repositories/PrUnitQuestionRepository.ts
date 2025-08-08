// ABOUTME: Prisma를 사용한 UnitQuestion Repository 구현체
// ABOUTME: 실제 데이터베이스 연산을 수행하는 인프라스트럭처 계층

import { PrismaClient } from '@prisma/client';
import {
  IUnitQuestionRepository,
  CreateUnitQuestionData,
} from '../../domains/repositories/IUnitQuestionRepository';
import { UnitQuestion } from '../../domains/entities/UnitQuestion';

export class PrUnitQuestionRepository implements IUnitQuestionRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: CreateUnitQuestionData): Promise<UnitQuestion> {
    try {
      const unitQuestion = await this.prisma.unitQuestion.create({
        data: {
          unitCode: data.unitCode,
          question: data.question,
          answer: data.answer,
          helpText: data.helpText,
          unitId: data.unitId,
          userId: data.userId,
        },
      });

      return {
        id: unitQuestion.id,
        unitCode: unitQuestion.unitCode,
        question: unitQuestion.question,
        answer: unitQuestion.answer,
        helpText: unitQuestion.helpText,
        createdAt: unitQuestion.createdAt,
        unitId: unitQuestion.unitId,
        userId: unitQuestion.userId,
      };
    } catch (error) {
      console.error('UnitQuestion 생성 오류:', error);
      throw new Error('단원 문제 생성에 실패했습니다.');
    }
  }

  async createMany(
    dataList: CreateUnitQuestionData[]
  ): Promise<UnitQuestion[]> {
    try {
      // 여러 문제를 트랜잭션으로 일괄 생성
      const result = await this.prisma.$transaction(
        dataList.map((data) =>
          this.prisma.unitQuestion.create({
            data: {
              unitCode: data.unitCode,
              question: data.question,
              answer: data.answer,
              helpText: data.helpText,
              unitId: data.unitId,
              userId: data.userId,
            },
          })
        )
      );

      return result.map((unitQuestion) => ({
        id: unitQuestion.id,
        unitCode: unitQuestion.unitCode,
        question: unitQuestion.question,
        answer: unitQuestion.answer,
        helpText: unitQuestion.helpText,
        createdAt: unitQuestion.createdAt,
        unitId: unitQuestion.unitId,
        userId: unitQuestion.userId,
      }));
    } catch (error) {
      console.error('UnitQuestion 일괄 생성 오류:', error);
      throw new Error('단원 문제 일괄 생성에 실패했습니다.');
    }
  }

  async findByUnitCode(unitCode: string): Promise<UnitQuestion[]> {
    try {
      const unitQuestions = await this.prisma.unitQuestion.findMany({
        where: { unitCode },
        orderBy: { createdAt: 'desc' },
      });

      return unitQuestions.map((unitQuestion) => ({
        id: unitQuestion.id,
        unitCode: unitQuestion.unitCode,
        question: unitQuestion.question,
        answer: unitQuestion.answer,
        helpText: unitQuestion.helpText,
        createdAt: unitQuestion.createdAt,
        unitId: unitQuestion.unitId,
        userId: unitQuestion.userId,
      }));
    } catch (error) {
      console.error('UnitQuestion 조회 오류:', error);
      throw new Error('단원 문제 조회에 실패했습니다.');
    }
  }

  async findById(id: number): Promise<UnitQuestion | null> {
    try {
      const unitQuestion = await this.prisma.unitQuestion.findUnique({
        where: { id },
      });

      if (!unitQuestion) {
        return null;
      }

      return {
        id: unitQuestion.id,
        unitCode: unitQuestion.unitCode,
        question: unitQuestion.question,
        answer: unitQuestion.answer,
        helpText: unitQuestion.helpText,
        createdAt: unitQuestion.createdAt,
        unitId: unitQuestion.unitId,
        userId: unitQuestion.userId,
      };
    } catch (error) {
      console.error('UnitQuestion ID 조회 오류:', error);
      throw new Error('단원 문제 조회에 실패했습니다.');
    }
  }

  async findByUserId(userId: string): Promise<UnitQuestion[]> {
    try {
      const unitQuestions = await this.prisma.unitQuestion.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return unitQuestions.map((unitQuestion) => ({
        id: unitQuestion.id,
        unitCode: unitQuestion.unitCode,
        question: unitQuestion.question,
        answer: unitQuestion.answer,
        helpText: unitQuestion.helpText,
        createdAt: unitQuestion.createdAt,
        unitId: unitQuestion.unitId,
        userId: unitQuestion.userId,
      }));
    } catch (error) {
      console.error('사용자별 UnitQuestion 조회 오류:', error);
      throw new Error('사용자별 단원 문제 조회에 실패했습니다.');
    }
  }
}
