// ABOUTME: UnitSolve 엔티티 저장을 위한 Repository 인터페이스

export interface CreateUnitSolveData {
  questionId: number;
  userId: string;
  userInput: string;
  isCorrect: boolean;
  createdAt?: Date;
}

export interface IUnitSolveRepository {
  createMany(data: CreateUnitSolveData[]): Promise<number>;
}
