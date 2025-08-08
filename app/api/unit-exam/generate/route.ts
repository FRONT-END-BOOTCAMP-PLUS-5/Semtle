// ABOUTME: 단원평가 코드 생성 API 엔드포인트
// ABOUTME: POST 요청으로 카테고리와 문제 개수를 받아 랜덤 코드를 생성하고 DB에 저장
// ABOUTME: AI를 사용하여 문제도 자동 생성하여 UnitQuestion 테이블에 저장

import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../libs/prisma';
import { PrUnitExamRepository } from '../../../../backend/common/infrastructures/repositories/PrUnitExamRepository';
import { PrUnitQuestionRepository } from '../../../../backend/common/infrastructures/repositories/PrUnitQuestionRepository';
import { GenerateUnitExamUseCase } from '@/backend/unit/UseCases/UnitExamUsecase';

export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 데이터 추출
    const body = await request.json();
    const { selectedUnits, questionCount } = body;

    // Repository와 UseCase 인스턴스 생성
    const unitExamRepository = new PrUnitExamRepository(prisma);
    const unitQuestionRepository = new PrUnitQuestionRepository(prisma);
    const generateUnitExamUseCase = new GenerateUnitExamUseCase(
      unitExamRepository,
      unitQuestionRepository
    );

    // 임시 교사 계정 보장 (FK 제약 회피)
    const tempTeacher = await prisma.user.upsert({
      where: { userId: 'temp-teacher' },
      update: {},
      create: {
        userId: 'temp-teacher',
        password: 'temp-password',
        name: 'Temp Teacher',
        role: 'teacher',
      },
    });

    // 단원평가 코드 생성 실행
    const result = await generateUnitExamUseCase.execute({
      selectedUnits,
      questionCount,
      teacherId: tempTeacher.id, // 실제로는 세션에서 가져와야 함
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        code: result.code,
        examId: result.examId,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('단원평가 생성 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
