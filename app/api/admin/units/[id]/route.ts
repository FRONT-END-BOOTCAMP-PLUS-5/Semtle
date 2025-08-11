import { NextRequest, NextResponse } from 'next/server';
import { DeleteUnitUsecase } from '@/backend/admin/units/Usecases/DeleteUnitUseCase';
import { UnitUpdateUsecase } from '@/backend/admin/units/Usecases/UpdateUnitUseCase';
import { prAdminUnitRepository } from '@/backend/common/infrastructures/repositories/prAdminUnitRepository';
import prisma from '@/libs/prisma';

// Unit 업데이트
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, vidUrl } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: '단원 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const unitRepository = new prAdminUnitRepository(prisma);
    const updateUnitUseCase = new UnitUpdateUsecase(unitRepository);

    const unit = await updateUnitUseCase.execute(Number(id), { name, vidUrl });

    return NextResponse.json({
      message: '수학 단원이 성공적으로 업데이트되었습니다.',
      data: {
        id: unit.id,
        name: unit.name,
        vidUrl: unit.vidUrl,
        createdAt: unit.createdAt,
      },
    });
  } catch (error) {
    console.error('Unit update error:', error);
    const errorMessage =
      error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

// Unit 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // await 추가

    if (!id) {
      return NextResponse.json(
        { error: '단원 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const unitRepository = new prAdminUnitRepository(prisma);
    const deleteUnitUseCase = new DeleteUnitUsecase(unitRepository);

    const unit = await deleteUnitUseCase.execute(Number(id));

    return NextResponse.json({
      message: `"${unit.name}" 단원이 성공적으로 삭제되었습니다.`,
      data: { id: unit.id, name: unit.name },
    });
  } catch (error) {
    console.error('Unit delete error:', error);
    const errorMessage =
      error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
