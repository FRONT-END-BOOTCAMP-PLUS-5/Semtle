export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/libs/prisma';

// 단원 목록 조회
export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true },
    });

    return NextResponse.json({ units }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: '단원 목록을 불러오지 못했습니다.' },
      { status: 500 }
    );
  }
}

// 단원 생성 (테스트 용도)
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { name?: string; vidUrl?: string };

    if (!body?.name || !body?.vidUrl) {
      return NextResponse.json(
        { error: '과목명과 영상 URL을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    if (body.name.trim().length < 2 || body.name.length > 20) {
      return NextResponse.json(
        { error: '과목명은 2자 이상 20자 이하로 입력해주세요.' },
        { status: 400 }
      );
    }

    const created = await prisma.unit.create({
      data: { name: body.name.trim(), vidUrl: body.vidUrl.trim() },
      select: { id: true, name: true, vidUrl: true, createdAt: true },
    });

    return NextResponse.json(
      {
        message: '수학 단원이 성공적으로 생성되었습니다.',
        unit: created,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 400 }
    );
  }
}
