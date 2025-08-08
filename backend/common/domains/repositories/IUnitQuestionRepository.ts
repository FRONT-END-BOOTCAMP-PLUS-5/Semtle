// ABOUTME: UnitQuestion 엔티티에 대한 Repository 인터페이스
// ABOUTME: 문제 생성, 조회 등의 데이터 접근 계층 추상화

import { UnitQuestion } from '../entities/UnitQuestion';

export interface CreateUnitQuestionData {
  unitCode: string;
  question: string;
  answer: string;
  helpText: string;
  unitId: number;
  userId: string;
}

export interface IUnitQuestionRepository {
  // 단원 문제 생성
  create(data: CreateUnitQuestionData): Promise<UnitQuestion>;

  // 여러 문제 일괄 생성
  createMany(dataList: CreateUnitQuestionData[]): Promise<UnitQuestion[]>;

  // 단원 코드로 문제 목록 조회
  findByUnitCode(unitCode: string): Promise<UnitQuestion[]>;

  // ID로 문제 조회
  findById(id: number): Promise<UnitQuestion | null>;

  // 사용자별 문제 목록 조회
  findByUserId(userId: string): Promise<UnitQuestion[]>;
}
