'use client';

import { SolveListItemDto } from '@/backend/solves/dtos/SolveDto';

interface TestCardProps {
  solves: SolveListItemDto[];
  category: string;
}

export default function TestCard({ solves, category }: TestCardProps) {
  if (!solves?.length) {
    return (
      <div className="inline-flex w-96 flex-col items-center justify-center overflow-hidden rounded-2xl bg-white/90 p-4 shadow-lg outline-1 outline-offset-[-1px] outline-zinc-300 backdrop-blur-[2px] desktop:min-w-96 desktop:grow">
        <div className="text-sm text-gray-600">데이터가 없습니다</div>
      </div>
    );
  }
  const totalProblems = solves.length;
  const correctProblems = solves.filter((solve) => solve.isCorrect).length;
  const accuracy =
    totalProblems > 0 ? Math.round((correctProblems / totalProblems) * 100) : 0;

  // Get first 3 questions for display
  const sampleQuestions = solves.slice(0, 3);

  // Format the latest date
  const latestDate = solves[0]?.createdAt
    ? new Date(solves[0].createdAt)
        .toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .replace(/\./g, '.')
        .replace(/\s/g, '')
    : '';

  return (
    <div className="inline-flex w-96 flex-col items-start justify-start overflow-hidden rounded-2xl bg-white/90 p-4 shadow-lg outline-1 outline-offset-[-1px] outline-zinc-300 backdrop-blur-[2px] desktop:w-6xl desktop:min-w-96 desktop:grow">
      <div className="flex flex-col items-start justify-start self-stretch">
        <div className="inline-flex items-center justify-start self-stretch">
          <div className="justify-end font-['Inter'] text-lg leading-7 font-bold text-gray-800">
            {category}
          </div>
        </div>
        <div className="inline-flex items-end justify-end self-stretch">
          <div className="justify-center font-['Inter'] text-xs leading-7 font-normal text-black">
            {totalProblems} 문제
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start justify-start gap-2 self-stretch py-3">
        {sampleQuestions.map((solve) => (
          <div
            key={solve.id}
            className="inline-flex items-center justify-start self-stretch rounded bg-gray-50 p-2"
          >
            <div className="justify-center font-['Inter'] text-sm leading-tight font-normal text-gray-700">
              {solve.question}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto flex flex-col items-start justify-start gap-1 self-stretch pt-1">
        <div className="inline-flex items-start justify-between self-stretch">
          <div className="justify-center font-['Inter'] text-sm leading-tight font-normal text-gray-600">
            정답률
          </div>
          <div className="inline-flex flex-col items-start justify-start self-stretch">
            <div className="justify-center font-['Inter'] text-sm leading-tight font-normal text-gray-600">
              {accuracy}%
            </div>
          </div>
        </div>
        <div className="flex h-2 flex-col items-start justify-center self-stretch rounded-[58px] bg-gray-200">
          <div
            className="flex-1 self-stretch bg-green-400"
            style={{ width: `${accuracy}%` }}
          />
        </div>
      </div>
      <div className="flex flex-col items-start justify-end gap-2.5 self-stretch pt-3">
        <div className="justify-center font-['Inter'] text-sm leading-tight font-normal text-gray-600">
          {latestDate}
        </div>
      </div>
    </div>
  );
}
