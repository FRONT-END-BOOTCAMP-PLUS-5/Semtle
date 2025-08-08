import { Unit } from '../entities/Unit';

export interface IUnitRepository {
  create(unitData: { name: string; vidUrl: string }): Promise<Unit>;
  // 모든 단원 조회
  findAll(): Promise<Unit[]>;
}
