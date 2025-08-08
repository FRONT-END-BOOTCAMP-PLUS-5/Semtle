// ABOUTME: Prisma를 사용한 UnitExamAttempt Repository 구현체
// ABOUTME: 학생의 단원평가 시도 기록 데이터베이스 연산

import { PrismaClient } from '@prisma/client';
import {
  IUnitExamAttemptRepository,
  CreateUnitExamAttemptData,
} from '../../domains/repositories/IUnitExamAttemptRepository';
import { UnitExamAttempt } from '../../domains/entities/UnitExamAttempt';

export class PrUnitExamAttemptRepository implements IUnitExamAttemptRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: CreateUnitExamAttemptData): Promise<UnitExamAttempt> {
    try {
      const unitExamAttempt = await this.prisma.unitExamAttempt.create({
        data: {
          unitCode: data.unitCode,
          studentId: data.studentId,
          unitExamId: data.unitExamId,
        },
      });

      return {
        id: unitExamAttempt.id,
        unitCode: unitExamAttempt.unitCode,
        studentId: unitExamAttempt.studentId,
        createdAt: unitExamAttempt.createdAt,
        unitExamId: unitExamAttempt.unitExamId,
      };
    } catch (error) {
      console.error('UnitExamAttempt 생성 오류:', error);
      throw new Error('단원평가 시도 기록 생성에 실패했습니다.');
    }
  }

  async findByUnitCode(unitCode: string): Promise<UnitExamAttempt[]> {
    try {
      const attempts = await this.prisma.unitExamAttempt.findMany({
        where: { unitCode },
        orderBy: { createdAt: 'desc' },
      });

      return attempts.map((attempt) => ({
        id: attempt.id,
        unitCode: attempt.unitCode,
        studentId: attempt.studentId,
        createdAt: attempt.createdAt,
        unitExamId: attempt.unitExamId,
      }));
    } catch (error) {
      console.error('UnitExamAttempt 조회 오류:', error);
      throw new Error('단원평가 시도 기록 조회에 실패했습니다.');
    }
  }

  async findByStudentId(studentId: string): Promise<UnitExamAttempt[]> {
    try {
      const attempts = await this.prisma.unitExamAttempt.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
      });

      return attempts.map((attempt) => ({
        id: attempt.id,
        unitCode: attempt.unitCode,
        studentId: attempt.studentId,
        createdAt: attempt.createdAt,
        unitExamId: attempt.unitExamId,
      }));
    } catch (error) {
      console.error('학생별 UnitExamAttempt 조회 오류:', error);
      throw new Error('학생별 단원평가 시도 기록 조회에 실패했습니다.');
    }
  }

  async existsByStudentAndExam(
    studentId: string,
    unitExamId: number
  ): Promise<boolean> {
    try {
      const count = await this.prisma.unitExamAttempt.count({
        where: {
          studentId,
          unitExamId,
        },
      });

      return count > 0;
    } catch (error) {
      console.error('UnitExamAttempt 존재 확인 오류:', error);
      throw new Error('단원평가 시도 기록 확인에 실패했습니다.');
    }
  }
}
