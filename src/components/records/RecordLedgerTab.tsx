import React, { useState, useMemo } from 'react';
import { BookOpen, Utensils, Dumbbell, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { DailyRecord, LedgerFilterType } from '../../types';
import { getDayOfWeek } from '../../utils/calculations';

interface RecordLedgerTabProps {
  onOpenAddModal: (date?: string) => void;
  onEditRecord: (record: DailyRecord) => void;
}

export const RecordLedgerTab: React.FC<RecordLedgerTabProps> = ({ onOpenAddModal, onEditRecord }) => {
  const { records, settings } = useData();
  const [filter, setFilter] = useState<LedgerFilterType>('all');
  
  // 현재 조회 기준 년-월
  const [currentYearMonth, setCurrentYearMonth] = useState<string>('2026-09');

  const [year, month] = currentYearMonth.split('-').map(Number);

  const handlePrevMonth = () => {
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    setCurrentYearMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    setCurrentYearMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  // 해당 월의 날짜 리스트 (말일부터 1일까지 역순)
  const monthDays = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: { dateStr: string; dayNumber: number }[] = [];
    for (let d = daysInMonth; d >= 1; d--) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNumber: d });
    }
    return days;
  }, [year, month]);

  const recordMap = useMemo(() => {
    const map = new Map<string, DailyRecord>();
    records.forEach((r) => map.set(r.date, r));
    return map;
  }, [records]);

  const monthStats = useMemo(() => {
    const list = records.filter((r) => r.date.startsWith(currentYearMonth));
    const weights = list.filter((r) => r.weight !== null).map((r) => r.weight as number);
    const avgWeight = weights.length > 0 ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1) : '-';
    const workoutCount = list.filter((r) => r.workoutDone).length;
    return { avgWeight, workoutCount, totalDays: list.length };
  }, [records, currentYearMonth]);

  return (
    <div className="pb-24">
      {/* 1. 상단 서브탭 (체중/다이어리, 식단, 운동) */}
      <div className="bg-white border-b border-gray-100 flex items-center justify-around px-2">
        <button
          onClick={() => setFilter('all')}
          className={`flex items-center justify-center py-2.5 flex-1 relative transition-colors ${
            filter === 'all' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
          }`}
          title="체중 기록"
        >
          <div className="p-1 rounded">
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          {filter === 'all' && (
            <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-brand-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setFilter('diet')}
          className={`flex items-center justify-center py-2.5 flex-1 relative transition-colors ${
            filter === 'diet' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
          }`}
          title="식단 / 메모"
        >
          <div className="p-1 rounded">
            <Utensils className="w-5 h-5 stroke-[2.2]" />
          </div>
          {filter === 'diet' && (
            <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-brand-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setFilter('workout')}
          className={`flex items-center justify-center py-2.5 flex-1 relative transition-colors ${
            filter === 'workout' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
          }`}
          title="운동 기록"
        >
          <div className="p-1 rounded">
            <Dumbbell className="w-5 h-5 stroke-[2.2]" />
          </div>
          {filter === 'workout' && (
            <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-brand-600 rounded-full" />
          )}
        </button>
      </div>

      {/* 2. 테이블 컬럼 헤더 (간격 축소 및 메모 영역 극대화) */}
      <div className="bg-gray-50/80 px-2.5 py-2 border-b border-gray-100 text-xs font-semibold text-gray-600 flex items-center">
        <div className="w-12 flex-shrink-0 text-left">날짜</div>
        {settings.columns.showWeight && (
          <div className="w-12 flex-shrink-0 text-center">체중</div>
        )}
        {settings.columns.showWorkout && (
          <div className="w-14 flex-shrink-0 text-center">운동</div>
        )}
        {settings.columns.showAlcohol && (
          <div className="w-9 flex-shrink-0 text-center">음주</div>
        )}
        {settings.columns.showCalories && (
          <div className="w-11 flex-shrink-0 text-center">칼로리</div>
        )}
        {settings.columns.showMemo && (
          <div className="flex-1 pl-1.5 text-left">메모 / 특이사항</div>
        )}
      </div>

      {/* 3. 월 선택 헤더 섹션 */}
      <div className="px-3 pt-3 pb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h2 className="text-base font-bold text-gray-900 tracking-tight">
            {year}년 {month}월
          </h2>
          <span className="text-[11px] text-gray-400">
            (평균 {monthStats.avgWeight}kg · 운동 {monthStats.workoutCount}회)
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            aria-label="이전 달"
            className="p-1 hover:bg-gray-100 rounded text-gray-500 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            aria-label="다음 달"
            className="p-1 hover:bg-gray-100 rounded text-gray-500 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. 가계부 행 리스트 (와이프 피드백: 좌우 간격 축소 및 글씨 줄바꿈 완벽 노출) */}
      <div className="divide-y divide-gray-100 bg-white shadow-xs">
        {monthDays.map(({ dateStr, dayNumber }) => {
          const rec = recordMap.get(dateStr);
          const { name: dayName, dayIndex } = getDayOfWeek(dateStr);

          // 요일 색상 (토요일: 파랑, 일요일: 빨강, 평일: 기본 다크)
          let dayColor = 'text-gray-800';
          if (dayIndex === 6) dayColor = 'text-blue-600';
          if (dayIndex === 0) dayColor = 'text-rose-600';

          // 필터 적용
          if (filter === 'workout' && !rec?.workoutDone) return null;
          if (filter === 'diet' && !rec?.memo && !rec?.period) return null;

          // 운동 컬럼에 표시할 대분류/입력 텍스트 (예: '홈트', '헬스')
          const getWorkoutCategoryText = (r?: DailyRecord) => {
            if (!r || !r.workoutDone) return null;
            if (r.workoutCategories && r.workoutCategories.length > 0) {
              return r.workoutCategories.join(', ');
            }
            if (r.workoutCategory) {
              return r.workoutCategory;
            }
            if (r.workoutTypes && r.workoutTypes.length > 0) {
              return r.workoutTypes.join(', ');
            }
            if (r.workoutType) {
              return r.workoutType;
            }
            return '운동';
          };

          const categoryLabel = getWorkoutCategoryText(rec);

          // 세부 운동 종류 (카테고리와 다른 구체적 운동명이 있을 때만 메모에 뱃지 표시)
          const detailTypes = rec?.workoutTypes && rec.workoutTypes.length > 0
            ? rec.workoutTypes.join(', ')
            : rec?.workoutType;
          const showDetailInMemo = detailTypes && detailTypes !== categoryLabel;

          return (
            <div
              key={dateStr}
              onClick={() => {
                if (rec) {
                  onEditRecord(rec);
                } else {
                  onOpenAddModal(dateStr);
                }
              }}
              className="px-2.5 py-2.5 flex items-center hover:bg-orange-50/40 active:bg-orange-100/50 cursor-pointer transition-colors text-xs"
            >
              {/* 날짜 & 요일 (너비 48px) */}
              <div className="w-12 flex-shrink-0 flex items-baseline gap-0.5">
                <span className={`font-bold ${dayColor} text-sm`}>{dayNumber}</span>
                <span className={`text-[11px] ${dayColor} font-medium`}>{dayName}</span>
              </div>

              {/* 체중 (너비 48px) */}
              {settings.columns.showWeight && (
                <div className="w-12 flex-shrink-0 text-center font-bold text-gray-900 text-xs">
                  {rec?.weight !== undefined && rec?.weight !== null ? `${rec.weight}` : '-'}
                </div>
              )}

              {/* 운동 (너비 56px - 체크 대신 '홈트', '헬스' 등 입력 내용 노출) */}
              {settings.columns.showWorkout && (
                <div className="w-14 flex-shrink-0 text-center flex items-center justify-center">
                  {rec?.workoutDone && categoryLabel ? (
                    <span className="inline-block px-1.5 py-0.5 text-[11px] font-bold text-brand-700 bg-brand-50 rounded border border-brand-200/70 break-words leading-tight max-w-full">
                      {categoryLabel}
                    </span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </div>
              )}

              {/* 음주 여부 (너비 36px) */}
              {settings.columns.showAlcohol && (
                <div className="w-9 flex-shrink-0 text-center text-gray-700">
                  {rec && (rec.alcohol || (rec.alcoholCount && rec.alcoholCount > 0)) ? (
                    <span className="inline-flex items-center justify-center text-amber-700 font-extrabold text-sm">
                      ✓
                    </span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </div>
              )}

              {/* 칼로리 (너비 44px) */}
              {settings.columns.showCalories && (
                <div className="w-11 flex-shrink-0 text-center text-[11px] text-gray-600">
                  {rec?.workoutCalories ? `${rec.workoutCalories}` : '-'}
                </div>
              )}

              {/* 메모 / 세부 운동명 / 생리 */}
              {settings.columns.showMemo && (
                <div className="flex-1 min-w-0 pl-1.5 text-left break-words leading-tight space-y-0.5">
                  <div className="flex flex-wrap items-center gap-1">
                    {rec?.period && (
                      <span className="inline-block px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-pink-100 text-pink-700">
                        생리
                      </span>
                    )}
                    {showDetailInMemo && (
                      <span className="inline-block text-[11px] text-brand-700 font-bold">
                        [{detailTypes}]
                      </span>
                    )}
                  </div>
                  {rec?.memo && (
                    <p className="text-[11px] text-gray-700 break-words leading-snug">
                      {rec.memo}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 5. 우측 하단 플로팅 + 버튼 */}
      <button
        onClick={() => onOpenAddModal()}
        aria-label="새 기록 추가"
        className="fixed right-4 bottom-20 z-30 w-13 h-13 rounded-full bg-brand-600 hover:bg-brand-700 active:scale-95 text-white shadow-lg flex items-center justify-center transition-all"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>
    </div>
  );
};
