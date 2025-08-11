import { NextRequest, NextResponse } from 'next/server';
import { CreateUnitUsecase } from '@/backend/admin/units/Usecases/CreateUnitUsecase';
import { UnitSelectUsecase } from '@/backend/admin/units/Usecases/SelectUnitUseCase';
import { prAdminUnitRepository } from '@/backend/common/infrastructures/repositories/prAdminUnitRepository';
import prisma from '@/libs/prisma';

// Unit 생성
export async function POST(request: NextRequest) {
  try {
    const { name, vidUrl } = await request.json();

    const unitRepository = new prAdminUnitRepository(prisma);
    const createUnitUseCase = new CreateUnitUsecase(unitRepository);

    const unit = await createUnitUseCase.execute({ name, vidUrl });

    return NextResponse.json(
      {
        message: '수학 단원이 성공적으로 생성되었습니다.',
        data: {
          id: unit.id,
          name: unit.name,
          vidUrl: unit.vidUrl,
          createdAt: unit.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unit creation error:', error);
    const errorMessage =
      error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

// Unit 목록 조회
export async function GET() {
  try {
    const unitRepository = new prAdminUnitRepository(prisma);
    const unitSelectUseCase = new UnitSelectUsecase(unitRepository);

    const result = await unitSelectUseCase.getAllUnits();

    return NextResponse.json({
      message: '단원 목록 조회가 완료되었습니다.',
      data: {
        units: result.units.map((unit) => ({
          id: unit.id,
          name: unit.name,
          vidUrl: unit.vidUrl,
          createdAt: unit.createdAt,
        })),
        total: result.total,
      },
    });
  } catch (error) {
    console.error('Unit list error:', error);
    const errorMessage =
      error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
