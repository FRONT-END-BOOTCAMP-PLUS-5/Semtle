// ABOUTME: Prisma를 사용한 UnitExam Repository 구현체
// ABOUTME: 실제 데이터베이스 연산을 수행하는 인프라스트럭처 계층

import { PrismaClient } from '@prisma/client';
import {
  IUnitExamRepository,
  CreateUnitExamData,
} from '../../domains/repositories/IUnitExamRepository';
import { UnitExam } from '../../domains/entities/UnitExam';

export class PrUnitExamRepository implements IUnitExamRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: CreateUnitExamData): Promise<UnitExam> {
    try {
      const unitExam = await this.prisma.unitExam.create({
        data: {
          code: data.code,
          teacherId: data.teacherId,
        },
      });

      return {
        id: unitExam.id,
        code: unitExam.code,
        createdAt: unitExam.createdAt,
        teacherId: unitExam.teacherId,
      };
    } catch (error) {
      console.error('UnitExam 생성 오류:', error);
      throw new Error('단원평가 생성에 실패했습니다.');
    }
  }

  async findByCode(code: string): Promise<UnitExam | null> {
    try {
      const unitExam = await this.prisma.unitExam.findUnique({
        where: { code },
      });

      if (!unitExam) {
        return null;
      }

      return {
        id: unitExam.id,
        code: unitExam.code,
        createdAt: unitExam.createdAt,
        teacherId: unitExam.teacherId,
      };
    } catch (error) {
      console.error('UnitExam 조회 오류:', error);
      throw new Error('단원평가 조회에 실패했습니다.');
    }
  }

  async existsByCode(code: string): Promise<boolean> {
    try {
      const count = await this.prisma.unitExam.count({
        where: { code },
      });

      return count > 0;
    } catch (error) {
      console.error('UnitExam 존재 확인 오류:', error);
      throw new Error('코드 중복 확인에 실패했습니다.');
    }
  }

  async findById(id: number): Promise<UnitExam | null> {
    try {
      const unitExam = await this.prisma.unitExam.findUnique({
        where: { id },
      });

      if (!unitExam) {
        return null;
      }

      return {
        id: unitExam.id,
        code: unitExam.code,
        createdAt: unitExam.createdAt,
        teacherId: unitExam.teacherId,
      };
    } catch (error) {
      console.error('UnitExam ID 조회 오류:', error);
      throw new Error('단원평가 조회에 실패했습니다.');
    }
  }

  async findByTeacherId(teacherId: string): Promise<UnitExam[]> {
    try {
      const unitExams = await this.prisma.unitExam.findMany({
        where: { teacherId },
        orderBy: { createdAt: 'desc' },
      });

      return unitExams.map((unitExam) => ({
        id: unitExam.id,
        code: unitExam.code,
        createdAt: unitExam.createdAt,
        teacherId: unitExam.teacherId,
      }));
    } catch (error) {
      console.error('교사별 UnitExam 조회 오류:', error);
      throw new Error('교사별 단원평가 조회에 실패했습니다.');
    }
  }
}
