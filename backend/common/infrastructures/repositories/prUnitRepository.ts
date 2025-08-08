// ABOUTME: Prisma를 사용한 Unit Repository 구현체
// ABOUTME: 단원(Unit) 생성에 대한 인프라스트럭처 계층

import { PrismaClient } from '@prisma/client';
import { IUnitRepository } from '../../domains/repositories/IUnitRepository';
import { Unit } from '../../domains/entities/Unit';

export class PrUnitRepository implements IUnitRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // 단원 생성
  async create(unitData: { name: string; vidUrl: string }): Promise<Unit> {
    try {
      const created = await this.prisma.unit.create({
        data: {
          name: unitData.name,
          vidUrl: unitData.vidUrl,
        },
      });

      return {
        id: created.id,
        name: created.name,
        vidUrl: created.vidUrl,
        createdAt: created.createdAt,
      };
    } catch (error) {
      console.error('Unit 생성 오류:', error);
      throw new Error('단원 생성에 실패했습니다.');
    }
  }

  // 모든 단원 조회
  async findAll(): Promise<Unit[]> {
    const units = await this.prisma.unit.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, vidUrl: true, createdAt: true },
    });

    return units.map((u) => ({
      id: u.id,
      name: u.name,
      vidUrl: u.vidUrl,
      createdAt: u.createdAt,
    }));
  }
}
