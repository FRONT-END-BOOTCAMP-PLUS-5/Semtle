// ABOUTME: UnitExamAttempt 엔티티에 대한 Repository 인터페이스
// ABOUTME: 학생의 단원평가 시도 기록을 관리하는 데이터 접근 계층

import { UnitExamAttempt } from '../entities/UnitExamAttempt';

export interface CreateUnitExamAttemptData {
  unitCode: string;
  studentId: string;
  unitExamId: number;
}

export interface IUnitExamAttemptRepository {
  // 시도 기록 생성
  create(data: CreateUnitExamAttemptData): Promise<UnitExamAttempt>;

  // 단원 코드별 시도 기록 조회
  findByUnitCode(unitCode: string): Promise<UnitExamAttempt[]>;

  // 학생별 시도 기록 조회
  findByStudentId(studentId: string): Promise<UnitExamAttempt[]>;

  // 특정 학생의 특정 단원평가 시도 여부 확인
  existsByStudentAndExam(
    studentId: string,
    unitExamId: number
  ): Promise<boolean>;
}
