'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IoChevronBack } from 'react-icons/io5';
import FilterDropdown from '@/app/_components/filters/FilterDropdown';
import TestCard from '@/app/_components/cards/TestCard';
import { useGets } from '@/hooks/useGets';
import { useInfiniteGets } from '@/hooks/useInfiniteGets';
import { SolveListItemDto } from '@/backend/solves/dtos/SolveDto';

interface Unit {
  id: number;
  name: string;
}

interface UnitsResponse {
  units: Unit[];
}

export default function ProblemSolvingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL parameters
  const [selectedUnits, setSelectedUnits] = useState<(number | string)[]>(
    () => {
      const unitsParam = searchParams.get('units');
      return unitsParam
        ? unitsParam.split(',').map((id) => parseInt(id) || id)
        : [];
    }
  );

  const [dateSort, setDateSort] = useState<'newest' | 'oldest'>(() => {
    const sortParam = searchParams.get('sort');
    return sortParam === 'oldest' || sortParam === 'newest'
      ? sortParam
      : 'newest';
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedUnits.length > 0) {
      params.set('units', selectedUnits.join(','));
    }

    if (dateSort !== 'newest') {
      params.set('sort', dateSort);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : '/problem-solving';

    router.replace(newUrl, { scroll: false });
  }, [selectedUnits, dateSort, router]);

  const {
    data: solvesData,
    isLoading: solvesLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError: solvesError,
  } = useInfiniteGets<SolveListItemDto>(
    [
      'solves',
      'list',
      {
        userId: session?.user?.id,
        units: selectedUnits.join(','),
        sort: dateSort,
      },
    ],
    '/solves/list',
    !!session?.user?.id,
    {
      userId: session?.user?.id || '',
      limit: '20',
      sortDirection: dateSort,
    },
    undefined,
    {
      // Prevent stale data from showing during transitions
      placeholderData: undefined,
      // Keep cache time short for different sort variants
      gcTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: unitsData } = useGets<UnitsResponse>(['units'], '/unit', true);

  const unitOptions = useMemo(() => {
    if (!unitsData?.units) return [];
    return unitsData.units.map((unit) => ({
      id: unit.id,
      name: unit.name,
      checked: selectedUnits.includes(unit.id),
    }));
  }, [unitsData?.units, selectedUnits]);

  const dateOptions = [
    { id: 'newest', name: '최신순', checked: dateSort === 'newest' },
    { id: 'oldest', name: '오래된순', checked: dateSort === 'oldest' },
  ];

  // Deduplicate items to prevent duplicate key errors
  const deduplicatedSolves = useMemo(() => {
    if (!solvesData || solvesData.length === 0) return [];

    const seen = new Set<number>();
    const dedup: SolveListItemDto[] = [];

    for (const item of solvesData) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        dedup.push(item);
      }
    }

    return dedup;
  }, [solvesData]);

  const filteredAndGroupedSolves = useMemo(() => {
    if (deduplicatedSolves.length === 0) return [];

    // Apply filtering first (this is the only client-side operation we should do)
    let filtered = deduplicatedSolves;
    if (selectedUnits.length > 0) {
      filtered = deduplicatedSolves.filter((solve: SolveListItemDto) =>
        selectedUnits.includes(solve.unitId)
      );
    }

    // Group by unit + category + date
    const grouped = filtered.reduce(
      (
        acc: Map<
          string,
          { category: string; unitId: number; solves: SolveListItemDto[] }
        >,
        solve
      ) => {
        const date = new Date(solve.createdAt).toDateString();
        const key = `${solve.unitId}-${solve.category}-${date}`;

        if (!acc.has(key)) {
          acc.set(key, {
            category: solve.category,
            unitId: solve.unitId,
            solves: [],
          });
        }
        acc.get(key)!.solves.push(solve);
        return acc;
      },
      new Map()
    );

    // Convert to array and sort groups by date
    const groupedArray = Array.from(grouped.values());
    return groupedArray;
  }, [deduplicatedSolves, selectedUnits]);

  const handleUnitSelectionChange = (selectedIds: (number | string)[]) => {
    setSelectedUnits(selectedIds);
  };

  const handleDateSortChange = (selectedIds: (number | string)[]) => {
    if (selectedIds.length > 0) {
      setDateSort(selectedIds[0] as 'newest' | 'oldest');
    }
  };

  // Intersection observer for infinite scrolling - clean implementation
  const loaderRef = useRef<HTMLDivElement>(null);

  // Stable handler that doesn't change on every render
  const handleIntersection = useRef(
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          observer.unobserve(entry.target);
          fetchNextPage();
        }
      });
    }
  );

  // Update the handler closure with current values
  handleIntersection.current = (
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver
  ) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        observer.unobserve(entry.target);
        fetchNextPage();
      }
    });
  };

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => handleIntersection.current(entries, observer),
      {
        root: null,
        rootMargin: '20px',
        threshold: 0,
      }
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [filteredAndGroupedSolves.length]); // Only recreate when content changes

  // Re-observe when fetch completes
  useEffect(() => {
    if (!isFetchingNextPage && hasNextPage && loaderRef.current) {
      const observer = new IntersectionObserver(
        (entries) => handleIntersection.current(entries, observer),
        {
          root: null,
          rootMargin: '20px',
          threshold: 0,
        }
      );
      observer.observe(loaderRef.current);

      return () => observer.disconnect();
    }
  }, [isFetchingNextPage, hasNextPage]);

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen">
        <div className="flex h-96 items-center justify-center">
          <div className="text-gray-600">로그인이 필요합니다</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <div className="px-4 py-6 desktop:px-48">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-200"
          >
            <IoChevronBack className="h-6 w-6 text-gray-700" />
          </button>

          <h1 className="text-lg font-bold text-gray-800">문제풀기</h1>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <div className="h-6 w-6 rounded-full bg-purple-300"></div>
          </div>
        </div>

        <div className="mb-6 flex justify-center gap-6 tablet:justify-end-safe">
          <FilterDropdown
            title="종류별 정렬"
            options={unitOptions}
            onSelectionChange={handleUnitSelectionChange}
          />
          <FilterDropdown
            title="날짜순 정렬"
            options={dateOptions}
            onSelectionChange={handleDateSortChange}
            mode="radio"
          />
        </div>

        <div
          key={`${dateSort}-${selectedUnits.join(',')}`}
          className="space-y-6 tablet:grid tablet:grid-cols-2 tablet:gap-6 tablet:space-y-0"
        >
          {solvesLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            </div>
          )}

          {solvesError && (
            <div className="flex justify-center py-12">
              <div className="text-sm text-red-600">
                데이터를 불러오는데 실패했습니다
              </div>
            </div>
          )}

          {!solvesLoading &&
            !solvesError &&
            filteredAndGroupedSolves.length === 0 && (
              <div className="flex justify-center py-12">
                <div className="text-sm text-gray-600">
                  문제 풀이 기록이 없습니다
                </div>
              </div>
            )}

          {/* Only render when we have data and not loading to prevent mixed data */}
          {!solvesLoading &&
            !solvesError &&
            filteredAndGroupedSolves.length > 0 && (
              <>
                {filteredAndGroupedSolves.map((group) => {
                  // Create stable key using the same logic as grouping
                  const firstSolve = group.solves[0];
                  const date = new Date(firstSolve.createdAt).toDateString();
                  const stableKey = `${group.unitId}-${group.category}-${date}-${dateSort}`;

                  return (
                    <div
                      key={stableKey}
                      className="flex justify-center tablet:justify-stretch"
                    >
                      <TestCard
                        solves={group.solves}
                        category={group.category}
                      />
                    </div>
                  );
                })}

                {/* Loading next page indicator */}
                {isFetchingNextPage && (
                  <div className="flex justify-center py-6">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
                  </div>
                )}

                {/* Intersection observer target for infinite scrolling */}
                {hasNextPage && <div ref={loaderRef} className="h-4 w-full" />}

                {/* End of results indicator */}
                {!hasNextPage && (
                  <div className="flex justify-center py-6">
                    <div className="text-sm text-gray-500">
                      모든 문제 풀이 기록을 불러왔습니다
                    </div>
                  </div>
                )}
              </>
            )}
        </div>
      </div>
    </div>
  );
}
