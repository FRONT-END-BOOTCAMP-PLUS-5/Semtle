'use client';

import { useState } from 'react';

// 카테고리 타입 정의
type Category = '일차방정식' | '무리수' | '소인수분해' | '유리수' | '함수';

export default function UnitTestPage() {
  // 선택된 카테고리들을 관리하는 상태
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  // 문제 개수를 관리하는 상태
  const [questionCount, setQuestionCount] = useState<number>(5);
  // 생성된 코드를 저장하는 상태
  const [generatedCode, setGeneratedCode] = useState<string>('');
  // 학생이 입력한 코드를 관리하는 상태
  const [studentCode, setStudentCode] = useState<string>('');
  // 로딩 상태 관리
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 사용 가능한 카테고리 목록
  const categories: Category[] = [
    '일차방정식',
    '무리수',
    '소인수분해',
    '유리수',
    '함수',
  ];

  // 카테고리 선택/해제 함수
  const handleCategoryToggle = (category: Category) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        // 이미 선택된 카테고리면 제거
        return prev.filter((cat) => cat !== category);
      } else {
        // 선택되지 않은 카테고리면 추가
        return [...prev, category];
      }
    });
  };

  // 단원평가 코드 생성 함수
  const handleGenerateCode = async () => {
    // 유효성 검증
    if (selectedCategories.length === 0) {
      alert('최소 1개 이상의 카테고리를 선택해주세요.');
      return;
    }

    if (questionCount <= 0) {
      alert('문제 개수는 1개 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      // API 호출로 단원평가 코드 생성
      const response = await fetch('/api/unit-exam/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categories: selectedCategories,
          questionCount: questionCount,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedCode(data.code);
        alert(`단원평가 코드가 생성되었습니다: ${data.code}`);
      } else {
        alert('코드 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('코드 생성 오류:', error);
      alert('코드 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 학생이 입력한 코드 검증 함수
  const handleVerifyCode = async () => {
    if (!studentCode.trim()) {
      alert('코드를 입력해주세요.');
      return;
    }

    try {
      // API 호출로 코드 검증
      const response = await fetch('/api/unit-exam/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: studentCode.trim().toUpperCase(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        console.log('코드가 올바릅니다!');
        alert('올바른 코드입니다!');
      } else {
        console.log('잘못된 코드입니다.');
        alert('잘못된 코드입니다.');
      }
    } catch (error) {
      console.error('코드 검증 오류:', error);
      alert('코드 검증 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">
        단원평가 코드 생성
      </h1>

      {/* 카테고리 선택 섹션 */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">카테고리 선택</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryToggle(category)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                selectedCategories.includes(category)
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          선택된 카테고리:{' '}
          {selectedCategories.length > 0
            ? selectedCategories.join(', ')
            : '없음'}
        </div>
      </div>

      {/* 문제 개수 설정 섹션 */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">문제 개수 설정</h2>
        <div className="flex items-center gap-4">
          <label htmlFor="questionCount" className="text-gray-700">
            문제 개수:
          </label>
          <input
            id="questionCount"
            type="number"
            min="1"
            max="50"
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value) || 1)}
            className="w-20 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-600">개</span>
        </div>
      </div>

      {/* 코드 생성 버튼 */}
      <div className="mb-8 text-center">
        <button
          onClick={handleGenerateCode}
          disabled={isLoading}
          className={`px-8 py-3 rounded-lg font-semibold text-white ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors duration-200`}
        >
          {isLoading ? '생성 중...' : '단원평가 코드 생성'}
        </button>
      </div>

      {/* 생성된 코드 표시 */}
      {generatedCode && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            생성된 코드
          </h3>
          <div className="text-2xl font-mono font-bold text-green-700">
            {generatedCode}
          </div>
        </div>
      )}

      {/* 구분선 */}
      <hr className="my-8 border-gray-300" />

      {/* 학생용 코드 입력 섹션 */}
      <div className="p-6 bg-yellow-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-yellow-800">
          학생용: 코드 입력
        </h2>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="단원평가 코드를 입력하세요 (예: ABCDEF)"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            maxLength={6}
          />
          <button
            onClick={handleVerifyCode}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
          >
            코드 확인
          </button>
        </div>
        <div className="mt-2 text-sm text-yellow-700">
          * 영어 대문자 6글자로 된 코드를 입력하세요
        </div>
      </div>
    </div>
  );
}
