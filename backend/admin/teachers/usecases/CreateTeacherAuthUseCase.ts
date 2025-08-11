import { TeacherAuthorization } from '@/backend/common/domains/entities/TeacherAuthorization';
import { IAdmTchrAuthRepository } from '@/backend/common/domains/repositories/IAdmTchrAuthRepository';

// 교사 인증 요청 생성 유스케이스
export class CreateTeacherAuthUseCase {
  private teacherAuthRepository: IAdmTchrAuthRepository;

  constructor(teacherAuthRepository: IAdmTchrAuthRepository) {
    this.teacherAuthRepository = teacherAuthRepository;
  }

  async execute(teacherAuthData: {
    teacherId: string;
    imgUrl: string;
  }): Promise<TeacherAuthorization> {
    if (!teacherAuthData.teacherId || !teacherAuthData.imgUrl) {
      throw new Error('교사 ID와 인증 이미지를 모두 입력해주세요.');
    }

    try {
      new URL(teacherAuthData.imgUrl);
    } catch {
      throw new Error('올바른 형식의 이미지 URL을 입력해주세요.');
    }

    const existingRequest = await this.teacherAuthRepository.findByTeacherId(
      teacherAuthData.teacherId
    );
    if (existingRequest) {
      throw new Error('이미 교사 인증 요청이 존재합니다.');
    }

    try {
      return await this.teacherAuthRepository.create(
        teacherAuthData.teacherId.trim(),
        teacherAuthData.imgUrl.trim()
      );
    } catch (error) {
      console.error('교사 인증 요청 생성 실패:', error);

      if (
        error instanceof Error &&
        error.message === '존재하지 않는 사용자입니다.'
      ) {
        throw error;
      }

      throw new Error('교사 인증 요청을 처리하는 중 오류가 발생했습니다.');
    }
  }
}
