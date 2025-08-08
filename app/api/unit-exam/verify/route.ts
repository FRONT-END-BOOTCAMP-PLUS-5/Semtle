// ABOUTME: 단원평가 코드 검증 API 엔드포인트
// ABOUTME: POST 요청으로 학생이 입력한 코드를 검증하여 유효성을 확인
// ABOUTME: 유효한 코드인 경우 unit_exam_attempts 테이블에 시도 기록 저장

import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../libs/prisma';
import { PrUnitExamRepository } from '../../../../backend/common/infrastructures/repositories/PrUnitExamRepository';
import { PrUnitExamAttemptRepository } from '../../../../backend/common/infrastructures/repositories/PrUnitExamAttemptRepository';
import { VerifyUnitExamUseCase } from '@/backend/unit/UseCases/UnitExamUsecase';

export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 데이터 추출
    const body = await request.json();
    const { code } = body;

    // Repository와 UseCase 인스턴스 생성
    const unitExamRepository = new PrUnitExamRepository(prisma);
    const unitExamAttemptRepository = new PrUnitExamAttemptRepository(prisma);
    const verifyUnitExamUseCase = new VerifyUnitExamUseCase(
      unitExamRepository,
      unitExamAttemptRepository
    );

    // 코드 검증 실행
    const result = await verifyUnitExamUseCase.execute({
      code: code?.toString().trim().toUpperCase(),
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        valid: result.valid,
        examData: result.examData,
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
    console.error('코드 검증 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
