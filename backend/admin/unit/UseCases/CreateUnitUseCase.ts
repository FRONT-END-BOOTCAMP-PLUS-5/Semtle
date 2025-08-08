import { Unit } from '@/backend/common/domains/entities/Unit';
import { IUnitRepository } from '@/backend/common/domains/repositories/IUnitRepository';

export class CreateUnitUseCase {
  private unitRepository: IUnitRepository;

  constructor(unitRepository: IUnitRepository) {
    this.unitRepository = unitRepository;
  }

  async execute(unitData: { name: string; vidUrl: string }): Promise<Unit> {
    if (!unitData.name || !unitData.vidUrl) {
      throw new Error('과목명과 영상 URL을 모두 입력해주세요.');
    }

    if (unitData.name.trim().length < 2) {
      throw new Error('과목명은 2자 이상 입력해주세요.');
    }

    if (unitData.name.length > 20) {
      throw new Error('과목명은 20자 이하로 입력해주세요.');
    }

    try {
      return await this.unitRepository.create({
        name: unitData.name.trim(),
        vidUrl: unitData.vidUrl.trim(),
      });
    } catch (error) {
      console.error('Unit creation error:', error);
      throw new Error('수학 단원 생성 중 오류가 발생했습니다.');
    }
  }
}
