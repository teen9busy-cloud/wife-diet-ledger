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
  
  // 현재 조회 기준 년-월 (기본: 2026-09)
  const [currentYearMonth, setCurrentYearMonth] = useState<string>('2026-09');

  const [year, month] = currentYearMonth.split('-').map(Number);

  // 이전 달 / 다음 달 이동
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

  // 해당 월의 날짜 리스트 생성 (해당 월의 모든 날짜 생성: 1일부터 말일까지)
  const monthDays = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: { dateStr: string; dayNumber: number }[] = [];
    for (let d = daysInMonth; d >= 1; d--) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNumber: d });
    }
    return days;
  }, [year, month]);

  // 기록 매핑
  const recordMap = useMemo(() => {
    const map = new Map<string, DailyRecord>();
    records.forEach((r) => map.set(r.date, r));
    return map;
  }, [records]);

  // 상단 요약 수치
  const monthStats = useMemo(() => {
    const list = records.filter((r) => r.date.startsWith(currentYearMonth));
    const weights = list.filter((r) => r.weight !== null).map((r) => r.weight as number);
    const avgWeight = weights.length > 0 ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1) : '-';
    const workoutCount = list.filter((r) => r.workoutDone).length;
    return { avgWeight, workoutCount, totalDays: list.length };
  }, [records, currentYearMonth]);

  return (
    <div className="pb-24">
      {/* 1. 상단 3개 서브탭 (스크린샷 1 재현: 체중/다이어리, 식단, 운동) */}
      <div className="bg-white border-b border-gray-100 flex items-center justify-around px-2">
        <button
          onClick={() => setFilter('all')}
          className={`flex items-center justify-center py-3 flex-1 relative transition-colors ${
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
          className={`flex items-center justify-center py-3 flex-1 relative transition-colors ${
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
          className={`flex items-center justify-center py-3 flex-1 relative transition-colors ${
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

      {/* 2. 테이블 컬럼 헤더 (스크린샷 1과 100% 동일) */}
      <div className="bg-white px-4 py-2.5 border-b border-gray-100 text-xs font-semibold text-gray-700 flex items-center">
        <div className="w-16 flex-shrink-0 text-left">날짜</div>
        {settings.columns.showWeight && (
          <div className="w-16 flex-shrink-0 text-center">체중</div>
        )}
        {settings.columns.showWorkout && (
          <div className="w-14 flex-shrink-0 text-center">운동</div>
        )}
        {settings.columns.showAlcohol && (
          <div className="w-14 flex-shrink-0 text-center">음주</div>
        )}
        {settings.columns.showCalories && (
          <div className="w-14 flex-shrink-0 text-center">칼로리</div>
        )}
        {settings.columns.showMemo && (
          <div className="flex-1 text-right pr-2">메모</div>
        )}
      </div>

      {/* 3. 월 선택 헤더 섹션 ("2026년 9월 < >") */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">
            {year}년 {month}월
          </h2>
          <span className="text-xs text-gray-400 font-normal">
            (평균 {monthStats.avgWeight}kg · 운동 {monthStats.workoutCount}회)
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            aria-label="이전 달"
            className="p-1 hover:bg-gray-200 rounded text-gray-500 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextMonth}
            aria-label="다음 달"
            className="p-1 hover:bg-gray-200 rounded text-gray-500 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 4. 가계부 행 리스트 */}
      <div className="divide-y divide-gray-100 bg-white shadow-sm">
        {monthDays.map(({ dateStr, dayNumber }) => {
          const rec = recordMap.get(dateStr);
          const { name: dayName, dayIndex } = getDayOfWeek(dateStr);

          // 요일 색상 (토요일: 파랑, 일요일: 빨강, 평일: 기본 다크)
          let dayColor = 'text-gray-800';
          if (dayIndex === 6) dayColor = 'text-blue-600';
          if (dayIndex === 0) dayColor = 'text-rose-600';

          // 필터 적용 (운동만 보기/식단만 보기)
          if (filter === 'workout' && !rec?.workoutDone) return null;
          if (filter === 'diet' && !rec?.memo && !rec?.period) return null;

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
              className="px-4 py-3 flex items-center hover:bg-orange-50/40 active:bg-orange-100/50 cursor-pointer transition-colors text-sm"
            >
              {/* 날짜 & 요일 */}
              <div className="w-16 flex-shrink-0 flex items-baseline gap-1">
                <span className={`font-semibold ${dayColor}`}>{dayNumber}</span>
                <span className={`text-xs ${dayColor}`}>{dayName}</span>
              </div>

              {/* 체중 */}
              {settings.columns.showWeight && (
                <div className="w-16 flex-shrink-0 text-center font-medium text-gray-900">
                  {rec?.weight !== undefined && rec?.weight !== null ? `${rec.weight}` : '-'}
                </div>
              )}

              {/* 운동 여부 / 종류 */}
              {settings.columns.showWorkout && (
                <div className="w-14 flex-shrink-0 flex items-center justify-center">
                  {rec?.workoutDone ? (
                    <span className="inline-flex items-center justify-center text-brand-700 font-bold">
                      ✓
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              )}

              {/* 음주 */}
              {settings.columns.showAlcohol && (
                <div className="w-14 flex-shrink-0 text-center text-gray-700">
                  {rec && rec.alcoholCount > 0 ? (
                    <span className="inline-block px-1.5 py-0.5 text-xs font-semibold rounded bg-amber-50 text-amber-800 border border-amber-200">
                      {rec.alcoholCount}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              )}

              {/* 칼로리 */}
              {settings.columns.showCalories && (
                <div className="w-14 flex-shrink-0 text-center text-xs text-gray-600">
                  {rec?.workoutCalories ? `${rec.workoutCalories}` : '-'}
                </div>
              )}

              {/* 메모 / 생리 표시 */}
              {settings.columns.showMemo && (
                <div className="flex-1 text-right pr-2 truncate">
                  {rec?.period && (
                    <span className="inline-block mr-1 px-1.5 py-0.5 text-xs font-medium rounded-full bg-pink-100 text-pink-700">
                      생리
                    </span>
                  )}
                  {rec?.workoutType && (
                    <span className="inline-block mr-1 text-xs text-brand-700 font-medium">
                      [{rec.workoutType}]
                    </span>
                  )}
                  <span className="text-xs text-gray-600">
                    {rec?.memo || ''}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 5. 우측 하단 플로팅 + 버튼 (스크린샷 1의 테라코타 오렌지 라운드 버튼) */}
      <button
        onClick={() => onOpenAddModal()}
        aria-label="새 기록 추가"
        className="fixed right-5 bottom-20 z-30 w-14 h-14 rounded-full bg-brand-600 hover:bg-brand-700 active:scale-95 text-white shadow-lg flex items-center justify-center transition-all"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
};
