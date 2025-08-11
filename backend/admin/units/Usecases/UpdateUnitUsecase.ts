import { Unit } from '@/backend/common/domains/entities/Unit';
import { IAdminUnitRepository } from '@/backend/common/domains/repositories/IAdminUnitRepository';

export class UnitUpdateUsecase {
  private unitRepository: IAdminUnitRepository;

  constructor(unitRepository: IAdminUnitRepository) {
    this.unitRepository = unitRepository;
  }

  async execute(
    id: number,
    updateData: { name?: string; vidUrl?: string }
  ): Promise<Unit> {
    if (!id) {
      throw new Error('업데이트할 단원의 ID가 필요합니다.');
    }

    const existingUnit = await this.unitRepository.findById(id);
    if (!existingUnit) {
      throw new Error('존재하지 않는 단원입니다.');
    }

    const validatedData: { name?: string; vidUrl?: string } = {};

    if (updateData.name !== undefined) {
      if (updateData.name.trim().length < 2) {
        throw new Error('과목명은 2자 이상 입력해주세요.');
      }
      if (updateData.name.length > 20) {
        throw new Error('과목명은 20자 이하로 입력해주세요.');
      }
      validatedData.name = updateData.name.trim();
    }

    if (updateData.vidUrl !== undefined) {
      if (!updateData.vidUrl.trim()) {
        throw new Error('영상 URL을 입력해주세요.');
      }
      validatedData.vidUrl = updateData.vidUrl.trim();
    }

    if (Object.keys(validatedData).length === 0) {
      throw new Error('업데이트할 데이터가 없습니다.');
    }

    try {
      return await this.unitRepository.update(id, validatedData);
    } catch (error) {
      console.error('Unit update error:', error);
      throw new Error('단원 업데이트 중 오류가 발생했습니다.');
    }
  }
}
