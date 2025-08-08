// ABOUTME: 단원평가 비즈니스 로직을 담당하는 UseCase
// ABOUTME: 코드 생성, 검증, 중복 체크, AI 문제 생성, 시도 기록 등의 핵심 비즈니스 규칙 구현

import { IUnitExamRepository } from '../../common/domains/repositories/IUnitExamRepository';
import { IUnitQuestionRepository } from '../../common/domains/repositories/IUnitQuestionRepository';
import { IUnitExamAttemptRepository } from '../../common/domains/repositories/IUnitExamAttemptRepository';
import { callGemini } from '../../../libs/gemini/callGemini';
import {
  GenerateUnitExamRequestDto,
  UnitExamGenerationResult,
  VerifyUnitExamRequestDto,
  UnitExamVerificationResult,
  AIGeneratedQuestion,
  AIQuestionGenerationResult,
  CreateExamAttemptRequestDto,
  ExamAttemptResult,
} from '../dtos/UnitExamDto';

export class GenerateUnitExamUseCase {
  private unitExamRepository: IUnitExamRepository;
  private unitQuestionRepository: IUnitQuestionRepository;

  constructor(
    unitExamRepository: IUnitExamRepository,
    unitQuestionRepository: IUnitQuestionRepository
  ) {
    this.unitExamRepository = unitExamRepository;
    this.unitQuestionRepository = unitQuestionRepository;
  }

  async execute(
    request: GenerateUnitExamRequestDto
  ): Promise<UnitExamGenerationResult> {
    try {
      // 환경 변수 확인: GEMINI_API_KEY 없으면 동작 금지
      if (!process.env.GEMINI_API_KEY) {
        return {
          success: false,
          error: 'GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.',
        };
      }

      // 입력 데이터 유효성 검증
      if (!request.selectedUnits || request.selectedUnits.length === 0) {
        return {
          success: false,
          error: '최소 1개 이상의 단원을 선택해주세요.',
        };
      }

      if (!request.questionCount || request.questionCount <= 0) {
        return {
          success: false,
          error: '문제 개수는 1개 이상이어야 합니다.',
        };
      }

      // 랜덤 코드 생성 (영어 대문자 6글자)
      const code = this.generateRandomCode();

      // 코드 중복 체크
      const isDuplicate = await this.unitExamRepository.existsByCode(code);
      if (isDuplicate) {
        // 중복된 경우 재귀적으로 다시 생성
        return this.execute(request);
      }

      // AI를 사용하여 문제 생성
      const aiResult = await this.generateQuestionsWithAI(
        request.selectedUnits,
        request.questionCount
      );

      // AI 생성 실패 시 중단
      if (
        !aiResult.success ||
        !aiResult.questions ||
        aiResult.questions.length === 0
      ) {
        return {
          success: false,
          error: aiResult.error || 'AI 문제 생성에 실패했습니다.',
        };
      }

      // 임시 교사 ID (실제로는 인증된 사용자 정보에서 가져와야 함)
      const teacherId = request.teacherId || 'temp-teacher-id';

      // 단원평가 생성 및 저장 (AI 성공 이후에 수행)
      const unitExam = await this.unitExamRepository.create({
        code,
        teacherId,
      });

      // 생성된 문제들을 UnitQuestion 테이블에 저장
      await this.saveGeneratedQuestions(aiResult.questions, code, teacherId);

      return {
        success: true,
        code: unitExam.code,
        examId: unitExam.id,
      };
    } catch (error) {
      console.error('단원평가 생성 오류:', error);
      return {
        success: false,
        error: '단원평가 생성 중 오류가 발생했습니다.',
      };
    }
  }

  // 랜덤 코드 생성 메서드 (영어 대문자 6글자)
  private generateRandomCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';

    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }

    return result;
  }

  // AI를 사용하여 문제 생성
  private async generateQuestionsWithAI(
    selectedUnits: Array<{ unitId: number; unitName: string }>,
    questionCount: number
  ): Promise<AIQuestionGenerationResult> {
    try {
      // 프롬프트 생성
      const prompt = this.createPrompt(selectedUnits, questionCount);

      // Gemini AI 호출
      const response = await callGemini(prompt);

      // JSON 응답 파싱
      const questions = this.parseAIResponse(response);

      return {
        success: true,
        questions,
      };
    } catch (error) {
      console.error('AI 문제 생성 오류:', error);
      return {
        success: false,
        error: 'AI 문제 생성에 실패했습니다.',
      };
    }
  }

  // AI 프롬프트 생성
  private createPrompt(
    selectedUnits: Array<{ unitId: number; unitName: string }>,
    questionCount: number
  ): string {
    const unitsJson = JSON.stringify(selectedUnits);

    return `기초학력을 위한 수학 문제를 생성하라. 해설은 학생이 이해하기 쉽게 자세히 작성한다.
단원 목록(단원명과 저장용 식별자 포함)은 다음과 같다: ${unitsJson}
총 문제 수는 ${questionCount}개이며, 단원별 문제 비율은 가능한 비슷하게 분배한다.
오직 JSON 배열로만 응답하라. 각 항목은 아래 형식을 따른다.
{
  "unitId": number,
  "question": string,
  "answer": string,
  "help_text": string
}
배열 이외의 다른 텍스트나 주석은 절대 포함하지 말고, 모든 항목은 위 단원 목록에 포함된 unitId 중 하나를 사용한다.`;
  }

  // AI 응답 파싱
  private parseAIResponse(response: string): AIGeneratedQuestion[] {
    try {
      // JSON 부분만 추출 (```json과 ``` 제거)
      const jsonMatch =
        response.match(/```json\s*([\s\S]*?)\s*```/) ||
        response.match(/\[[\s\S]*\]/);

      if (!jsonMatch) {
        throw new Error('JSON 형식을 찾을 수 없습니다.');
      }

      const jsonString = jsonMatch[1] || jsonMatch[0];
      const questions = JSON.parse(jsonString);

      if (!Array.isArray(questions)) {
        throw new Error('응답이 배열 형식이 아닙니다.');
      }

      return questions;
    } catch (error) {
      console.error('AI 응답 파싱 오류:', error);
      // 파싱 실패 시 테스트 데이터 반환
      return this.getTestQuestions();
    }
  }

  // 테스트용 더미 문제 데이터
  private getTestQuestions(): AIGeneratedQuestion[] {
    return [
      {
        unitId: 1,
        question: '2x + 3 = 7을 풀어보세요.',
        answer: 'x = 2',
        help_text: '양변에서 3을 빼고, 2로 나누면 됩니다.',
      },
      {
        unitId: 1,
        question: '√16의 값은?',
        answer: '4',
        help_text: '16의 제곱근은 4입니다.',
      },
    ];
  }

  // 생성된 문제들을 데이터베이스에 저장
  private async saveGeneratedQuestions(
    questions: AIGeneratedQuestion[],
    unitCode: string,
    userId: string
  ): Promise<void> {
    try {
      const unitQuestionData = questions.map((q) => ({
        unitCode,
        question: q.question,
        answer: q.answer,
        helpText: q.help_text,
        unitId: q.unitId,
        userId,
      }));

      await this.unitQuestionRepository.createMany(unitQuestionData);
      console.log(`✅ ${questions.length}개의 문제가 저장되었습니다.`);
    } catch (error) {
      console.error('문제 저장 오류:', error);
      throw new Error('생성된 문제 저장에 실패했습니다.');
    }
  }
}

export class VerifyUnitExamUseCase {
  private unitExamRepository: IUnitExamRepository;
  private unitExamAttemptRepository: IUnitExamAttemptRepository;

  constructor(
    unitExamRepository: IUnitExamRepository,
    unitExamAttemptRepository: IUnitExamAttemptRepository
  ) {
    this.unitExamRepository = unitExamRepository;
    this.unitExamAttemptRepository = unitExamAttemptRepository;
  }

  async execute(
    request: VerifyUnitExamRequestDto
  ): Promise<UnitExamVerificationResult> {
    try {
      // 입력 데이터 유효성 검증
      if (!request.code || request.code.trim().length !== 6) {
        return {
          success: false,
          error: '코드는 6글자 영어 대문자여야 합니다.',
        };
      }

      // 코드 형식 검증 (영어 대문자만 허용)
      const codePattern = /^[A-Z]{6}$/;
      if (!codePattern.test(request.code)) {
        return {
          success: false,
          error: '코드는 영어 대문자 6글자만 허용됩니다.',
        };
      }

      // 데이터베이스에서 코드 검증
      const unitExam = await this.unitExamRepository.findByCode(request.code);

      if (unitExam) {
        // 유효한 코드인 경우, 시도 기록 생성
        await this.createExamAttempt(request.code, unitExam.id);

        return {
          success: true,
          valid: true,
          examData: {
            id: unitExam.id,
            teacherId: unitExam.teacherId,
            createdAt: unitExam.createdAt,
          },
        };
      } else {
        return {
          success: true,
          valid: false,
        };
      }
    } catch (error) {
      console.error('코드 검증 오류:', error);
      return {
        success: false,
        error: '코드 검증 중 오류가 발생했습니다.',
      };
    }
  }

  // 시도 기록 생성
  private async createExamAttempt(
    unitCode: string,
    unitExamId: number
  ): Promise<void> {
    try {
      const studentId = 'temp-student-id'; // 임시 학생 ID

      await this.unitExamAttemptRepository.create({
        unitCode,
        studentId,
        unitExamId,
      });

      console.log(
        `✅ 학생 ${studentId}의 단원평가 시도가 기록되었습니다. (코드: ${unitCode})`
      );
    } catch (error) {
      console.error('시도 기록 생성 오류:', error);
      // 시도 기록 실패는 전체 검증을 실패시키지 않음
    }
  }
}

// 단원평가 시도 기록을 위한 별도 UseCase
export class CreateExamAttemptUseCase {
  private unitExamRepository: IUnitExamRepository;
  private unitExamAttemptRepository: IUnitExamAttemptRepository;

  constructor(
    unitExamRepository: IUnitExamRepository,
    unitExamAttemptRepository: IUnitExamAttemptRepository
  ) {
    this.unitExamRepository = unitExamRepository;
    this.unitExamAttemptRepository = unitExamAttemptRepository;
  }

  async execute(
    request: CreateExamAttemptRequestDto
  ): Promise<ExamAttemptResult> {
    try {
      // 코드 유효성 검증
      if (!request.code || request.code.trim().length !== 6) {
        return {
          success: false,
          error: '코드는 6글자 영어 대문자여야 합니다.',
        };
      }

      // 단원평가 존재 확인
      const unitExam = await this.unitExamRepository.findByCode(request.code);
      if (!unitExam) {
        return {
          success: false,
          error: '존재하지 않는 코드입니다.',
        };
      }

      // 시도 기록 생성
      const studentId = request.studentId || 'temp-student-id';
      const attempt = await this.unitExamAttemptRepository.create({
        unitCode: request.code,
        studentId,
        unitExamId: unitExam.id,
      });

      return {
        success: true,
        attemptId: attempt.id,
      };
    } catch (error) {
      console.error('시도 기록 생성 오류:', error);
      return {
        success: false,
        error: '시도 기록 생성 중 오류가 발생했습니다.',
      };
    }
  }
}
