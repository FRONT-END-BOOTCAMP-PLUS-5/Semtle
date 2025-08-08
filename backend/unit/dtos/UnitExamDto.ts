// ABOUTME: 단원평가 관련 Data Transfer Objects
// ABOUTME: 단원평가 코드 생성 및 검증을 위한 입출력 구조 정의

export interface GenerateUnitExamRequestDto {
  // 프론트에서 선택한 단원 목록 (카테고리명 대신 단원명 사용)
  selectedUnits: Array<{ unitId: number; unitName: string }>;
  questionCount: number;
  teacherId?: string; // 선택적으로 교사 ID 포함
  // 하위 호환을 위해 기존 categories를 남겨두되 사용하지 않음
  categories?: string[];
}

export interface GenerateUnitExamResponseDto {
  code: string;
  teacherId: string;
  createdAt: Date;
}

export interface UnitExamGenerationResult {
  success: boolean;
  code?: string;
  examId?: number;
  error?: string;
}

export interface VerifyUnitExamRequestDto {
  code: string;
}

export interface VerifyUnitExamResponseDto {
  valid: boolean;
  examId?: number;
  teacherId?: string;
  createdAt?: Date;
}

export interface UnitExamVerificationResult {
  success: boolean;
  valid?: boolean;
  examData?: {
    id: number;
    teacherId: string;
    createdAt: Date;
  };
  error?: string;
}

// AI 생성 문제 관련 DTO
export interface AIGeneratedQuestion {
  unitId: number;
  question: string;
  answer: string;
  help_text: string;
}

export interface AIQuestionGenerationResult {
  success: boolean;
  questions?: AIGeneratedQuestion[];
  error?: string;
}

// 단원평가 시도 관련 DTO
export interface CreateExamAttemptRequestDto {
  code: string;
  studentId?: string; // 선택적으로 학생 ID 포함
}

export interface ExamAttemptResult {
  success: boolean;
  attemptId?: number;
  error?: string;
}
