import { NextRequest, NextResponse } from 'next/server';
import { CreateTeacherAuthUseCase } from '@/backend/admin/teacher/usecases/CreateTeacherAuthUseCase';
import { PrAdmTchrAuthCreateRepository } from '@/backend/common/infrastructures/repositories/PrAdmTchrAuthCreateRepository';
import prisma from '@/libs/prisma';

// 교사 인증 요청 생성
export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { teacherId, imgUrl } = requestBody;
    

    const teacherAuthRepository = new PrAdmTchrAuthCreateRepository(prisma);
    const createTeacherAuthUseCase = new CreateTeacherAuthUseCase(teacherAuthRepository);

    const teacherAuth = await createTeacherAuthUseCase.execute({ teacherId, imgUrl });

    return NextResponse.json(
      {
        message: '교사 인증 요청이 성공적으로 생성되었습니다.',
        data: {
          id: teacherAuth.id,
          teacherId: teacherAuth.teacherId,
          imgUrl: teacherAuth.imgUrl,
          createdAt: teacherAuth.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Teacher auth creation error:', error);
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
