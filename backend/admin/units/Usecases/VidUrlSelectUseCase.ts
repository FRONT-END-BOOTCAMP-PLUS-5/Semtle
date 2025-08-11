import { IAdminUnitRepository } from '@/backend/common/domains/repositories/IAdminUnitRepository';

export class VidUrlSelectUseCase {
  private unitRepository: IAdminUnitRepository;

  constructor(unitRepository: IAdminUnitRepository) {
    this.unitRepository = unitRepository;
  }

  async getVidUrlById(id: number): Promise<{ id: number; vidUrl: string }> {
    if (!id) {
      throw new Error('조회할 단원의 ID가 필요합니다.');
    }

    try {
      const unit = await this.unitRepository.findVidUrlById(id);

      if (!unit) {
        throw new Error('존재하지 않는 단원입니다.');
      }

      return unit;
    } catch (error) {
      console.error('단원 영상 URL 조회 실패:', { id, error });

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('단원 영상 URL 조회 중 오류가 발생했습니다.');
    }
  }
}
