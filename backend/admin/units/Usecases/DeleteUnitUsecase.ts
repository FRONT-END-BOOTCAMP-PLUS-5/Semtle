import { Unit } from '@/backend/common/domains/entities/Unit';
import { IAdminUnitRepository } from '@/backend/common/domains/repositories/IAdminUnitRepository';

export class DeleteUnitUsecase {
  private unitRepository: IAdminUnitRepository;

  constructor(unitRepository: IAdminUnitRepository) {
    this.unitRepository = unitRepository;
  }

  async execute(id: number): Promise<Unit> {
    if (!id) {
      throw new Error('삭제할 단원의 ID가 필요합니다.');
    }

    const existingUnit = await this.unitRepository.findById(id);
    if (!existingUnit) {
      throw new Error('존재하지 않는 단원입니다.');
    }

    try {
      return await this.unitRepository.delete(id);
    } catch (error) {
      console.error('Unit delete error:', error);
      throw new Error('단원 삭제 중 오류가 발생했습니다.');
    }
  }
}
