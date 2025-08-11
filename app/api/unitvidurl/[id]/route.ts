import { NextRequest, NextResponse } from 'next/server';
import { VidUrlSelectUseCase } from '@/backend/admin/units/Usecases/VidUrlSelectUseCase';
import { prAdminUnitRepository } from '@/backend/common/infrastructures/repositories/prAdminUnitRepository';
import prisma from '@/libs/prisma';

// 특정 단원의 영상 URL 조회
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: '유효한 단원 ID를 입력해주세요.' },
        { status: 400 }
      );
    }

    const unitRepository = new prAdminUnitRepository(prisma);
    const vidUrlSelectUseCase = new VidUrlSelectUseCase(unitRepository);

    const result = await vidUrlSelectUseCase.getVidUrlById(id);

    return NextResponse.json({
      message: '단원 영상 URL 조회가 완료되었습니다.',
      data: {
        id: result.id,
        vidUrl: result.vidUrl,
      },
    });
  } catch (error) {
    console.error('Unit vidUrl get error:', error);
    const errorMessage =
      error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
