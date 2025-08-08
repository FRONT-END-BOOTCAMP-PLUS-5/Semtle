// ABOUTME: UnitExam 엔티티에 대한 Repository 인터페이스
// ABOUTME: 데이터 접근 계층의 추상화를 위한 인터페이스 정의

import { UnitExam } from '../entities/UnitExam';

export interface CreateUnitExamData {
  code: string;
  teacherId: string;
}

export interface IUnitExamRepository {
  // 단원평가 생성
  create(data: CreateUnitExamData): Promise<UnitExam>;

  // 코드로 단원평가 조회
  findByCode(code: string): Promise<UnitExam | null>;

  // 코드 존재 여부 확인
  existsByCode(code: string): Promise<boolean>;

  // ID로 단원평가 조회
  findById(id: number): Promise<UnitExam | null>;

  // 교사별 단원평가 목록 조회
  findByTeacherId(teacherId: string): Promise<UnitExam[]>;
}
