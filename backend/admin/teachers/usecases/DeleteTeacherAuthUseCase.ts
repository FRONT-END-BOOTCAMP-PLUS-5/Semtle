import { TeacherAuthorization } from '@/backend/common/domains/entities/TeacherAuthorization';
import { IAdmTchrAuthRepository } from '@/backend/common/domains/repositories/IAdmTchrAuthRepository';

// 교사 인증 요청 삭제 유스케이스
export class DeleteTeacherAuthUseCase {
  private teacherAuthRepository: IAdmTchrAuthRepository;

  constructor(teacherAuthRepository: IAdmTchrAuthRepository) {
    this.teacherAuthRepository = teacherAuthRepository;
  }

  async execute(id: number): Promise<TeacherAuthorization> {
    if (!id) {
      throw new Error('삭제할 교사 인증 요청의 ID가 필요합니다.');
    }

    try {
      return await this.teacherAuthRepository.delete(id);
    } catch (error) {
      console.error('교사 인증 요청 삭제 실패:', error);

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('교사 인증 요청 삭제 중 오류가 발생했습니다.');
    }
  }
}
