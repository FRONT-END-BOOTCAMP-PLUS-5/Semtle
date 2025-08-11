import { TeacherAuthorization } from '@/backend/common/domains/entities/TeacherAuthorization';
import { IAdmTchrAuthRepository } from '@/backend/common/domains/repositories/IAdmTchrAuthRepository';

export class SelectTeacherAuthListUseCase {
  private teacherAuthRepository: IAdmTchrAuthRepository;

  constructor(teacherAuthRepository: IAdmTchrAuthRepository) {
    this.teacherAuthRepository = teacherAuthRepository;
  }

  async getAllTeacherAuths(): Promise<{
    teacherAuths: TeacherAuthorization[];
    total: number;
  }> {
    try {
      const teacherAuths = await this.teacherAuthRepository.findAll();

      return {
        teacherAuths,
        total: teacherAuths.length,
      };
    } catch (error) {
      console.error('교사 인증 요청 목록 조회 실패:', error);
      throw new Error('교사 인증 요청 목록 조회 중 오류가 발생했습니다.');
    }
  }
}
