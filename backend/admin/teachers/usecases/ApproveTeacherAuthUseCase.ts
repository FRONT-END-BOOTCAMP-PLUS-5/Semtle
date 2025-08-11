import { TeacherAuthorization } from '@/backend/common/domains/entities/TeacherAuthorization';
import { IAdmTchrAuthRepository } from '@/backend/common/domains/repositories/IAdmTchrAuthRepository';

// 교사 인증 요청 승인 유스케이스
export class ApproveTeacherAuthUsecase {
  private teacherAuthRepository: IAdmTchrAuthRepository;

  constructor(teacherAuthRepository: IAdmTchrAuthRepository) {
    this.teacherAuthRepository = teacherAuthRepository;
  }

  async execute(id: number): Promise<TeacherAuthorization> {
    if (!id) {
      throw new Error('승인할 교사 인증 요청의 ID가 필요합니다.');
    }

    try {
      const teacherAuth = await this.teacherAuthRepository.findById(id);
      if (!teacherAuth) {
        throw new Error('존재하지 않는 교사 인증 요청입니다.');
      }

      await this.teacherAuthRepository.updateUserRole(
        teacherAuth.teacherId,
        'teacher'
      );
      const deletedAuth = await this.teacherAuthRepository.delete(id);

      return deletedAuth;
    } catch (error) {
      console.error('교사 인증 승인 실패:', error);

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('교사 인증 승인 중 오류가 발생했습니다.');
    }
  }
}
