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
  
  // 연도 선택 (기본: 2026년)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  // 월 선택 ('all': 전체 월 연속 스크롤, '09', '08', '07' ... '01')
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // 기록 매핑 (날짜 -> 레코드)
  const recordMap = useMemo(() => {
    const map = new Map<string, DailyRecord>();
    records.forEach((r) => map.set(r.date, r));
    return map;
  }, [records]);

  // 표시할 월 목록 결정
  // 'all'인 경우: 9월부터 1월까지 (또는 기록이 있는 월들 및 최근 월들)
  const monthsToDisplay = useMemo(() => {
    if (selectedMonth !== 'all') {
      return [parseInt(selectedMonth, 10)];
    }
    // 전체 보기일 때: 9월부터 1월까지 역순으로 연속 노출 (기록이 있는 8월, 7월 등 모두 포함)
    return [9, 8, 7, 6, 5, 4, 3, 2, 1];
  }, [selectedMonth]);

  // 각 월별 일자 리스트 생성 헬퍼
  const getDaysForMonth = (yr: number, m: number) => {
    const daysInMonth = new Date(yr, m, 0).getDate();
    const days: { dateStr: string; dayNumber: number }[] = [];
    for (let d = daysInMonth; d >= 1; d--) {
      const dateStr = `${yr}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNumber: d });
    }
    return days;
  };

  // 월별 통계 요약 헬퍼
  const getMonthStats = (yr: number, m: number) => {
    const prefix = `${yr}-${String(m).padStart(2, '0')}`;
    const list = records.filter((r) => r.date.startsWith(prefix));
    const weights = list.filter((r) => r.weight !== null).map((r) => r.weight as number);
    const avgWeight = weights.length > 0 ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1) : '-';
    const workoutCount = list.filter((r) => r.workoutDone).length;
    const totalCalories = list.reduce((sum, r) => sum + (r.workoutCalories || 0), 0);
    return { avgWeight, workoutCount, totalCalories, recordCount: list.length };
  };

  // 연도 변경
  const handlePrevYear = () => setSelectedYear((prev) => prev - 1);
  const handleNextYear = () => setSelectedYear((prev) => prev + 1);

  return (
    <div className="pb-28">
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

      {/* 2. 연도 선택 & 월 바로가기 칩 네비게이션 (와이프 피드백: 모든 월/날짜 지원) */}
      <div className="bg-white px-3 pt-2.5 pb-2 border-b border-gray-100 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          {/* 연도 네비게이션 */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevYear}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 transition"
              title="이전 연도"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-extrabold text-gray-900 tracking-tight">
              {selectedYear}년
            </span>
            <button
              onClick={handleNextYear}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 transition"
              title="다음 연도"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-[11px] text-brand-700 font-medium">
            {selectedMonth === 'all' ? '전체 월 모아보기' : `${parseInt(selectedMonth, 10)}월 보기`}
          </span>
        </div>

        {/* 1월 ~ 12월 및 '전체' 스크롤 칩 바 */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          <button
            onClick={() => setSelectedMonth('all')}
            className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition ${
              selectedMonth === 'all'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            전체 모아보기
          </button>
          {[9, 8, 7, 6, 5, 4, 3, 2, 1, 10, 11, 12].map((m) => {
            const mStr = String(m).padStart(2, '0');
            const isSelected = selectedMonth === mStr;
            const stats = getMonthStats(selectedYear, m);
            const hasData = stats.recordCount > 0;
            return (
              <button
                key={m}
                onClick={() => setSelectedMonth(mStr)}
                className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap flex items-center gap-1 transition ${
                  isSelected
                    ? 'bg-brand-600 text-white font-bold shadow-xs'
                    : hasData
                    ? 'bg-orange-50 text-brand-800 border border-brand-200 font-semibold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {m}월
                {hasData && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 테이블 컬럼 헤더 */}
      <div className="sticky top-12 z-20 bg-gray-50/95 backdrop-blur-sm px-2.5 py-2 border-b border-gray-200 text-xs font-semibold text-gray-600 flex items-center shadow-2xs">
        <div className="w-12 flex-shrink-0 text-left">날짜</div>
        {settings.columns.showWeight && (
          <div className="w-12 flex-shrink-0 text-center">체중</div>
        )}
        {settings.columns.showWorkout && (
          <div className="w-14 flex-shrink-0 text-center">운동</div>
        )}
        {settings.columns.showAlcohol && (
          <div className="w-11 flex-shrink-0 text-center">음주</div>
        )}
        {settings.columns.showCalories && (
          <div className="w-11 flex-shrink-0 text-center">칼로리</div>
        )}
        {settings.columns.showMemo && (
          <div className="flex-1 pl-1.5 text-left">메모 / 특이사항</div>
        )}
      </div>

      {/* 4. 월별 섹션 및 날짜 리스트 (모든 월 연속 스크롤) */}
      <div className="space-y-4 pt-2">
        {monthsToDisplay.map((m) => {
          const days = getDaysForMonth(selectedYear, m);
          const stats = getMonthStats(selectedYear, m);

          return (
            <div key={m} className="bg-white shadow-xs border-b border-gray-100">
              {/* 각 월별 헤더 (예: 2026년 9월, 8월, 7월 등) */}
              <div className="sticky top-[86px] z-10 bg-gray-100/90 backdrop-blur-sm px-3 py-1.5 flex items-center justify-between border-y border-gray-200/80">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
                    {selectedYear}년 {m}월
                  </h3>
                  <span className="text-[11px] text-gray-500 font-normal">
                    {stats.avgWeight !== '-' ? `평균 ${stats.avgWeight}kg · ` : ''}운동 {stats.workoutCount}회
                    {stats.totalCalories > 0 ? ` · 🔥 소모 ${stats.totalCalories.toLocaleString()}kcal` : ''}
                  </span>
                </div>

                <button
                  onClick={() => onOpenAddModal(`${selectedYear}-${String(m).padStart(2, '0')}-01`)}
                  className="text-[11px] font-bold text-brand-700 hover:text-brand-800 flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  {m}월 기록 추가
                </button>
              </div>

              {/* 해당 월의 날짜 리스트 */}
              <div className="divide-y divide-gray-100">
                {days.map(({ dateStr, dayNumber }) => {
                  const rec = recordMap.get(dateStr);
                  const { name: dayName, dayIndex } = getDayOfWeek(dateStr);

                  // 요일 색상 (토: 파랑, 일: 빨강)
                  let dayColor = 'text-gray-800';
                  if (dayIndex === 6) dayColor = 'text-blue-600';
                  if (dayIndex === 0) dayColor = 'text-rose-600';

                  // 필터 적용
                  if (filter === 'workout' && !rec?.workoutDone) return null;
                  if (filter === 'diet' && !rec?.memo && !rec?.period) return null;

                  // 운동 대분류 텍스트
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

                  // 세부 운동명
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
                      {/* 날짜 & 요일 */}
                      <div className="w-12 flex-shrink-0 flex items-baseline gap-0.5">
                        <span className={`font-bold ${dayColor} text-sm`}>{dayNumber}</span>
                        <span className={`text-[11px] ${dayColor} font-medium`}>{dayName}</span>
                      </div>

                      {/* 체중 */}
                      {settings.columns.showWeight && (
                        <div className="w-12 flex-shrink-0 text-center font-bold text-gray-900 text-xs">
                          {rec?.weight !== undefined && rec?.weight !== null ? `${rec.weight}` : '-'}
                        </div>
                      )}

                      {/* 운동 */}
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

                      {/* 음주 (너비 44px - 체크 대신 '음주' 텍스트 노출) */}
                      {settings.columns.showAlcohol && (
                        <div className="w-11 flex-shrink-0 text-center flex items-center justify-center">
                          {rec && (rec.alcohol || (rec.alcoholCount && rec.alcoholCount > 0)) ? (
                            <span className="inline-block px-1.5 py-0.5 text-[11px] font-bold text-amber-800 bg-amber-50 rounded border border-amber-200/80">
                              음주
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </div>
                      )}

                      {/* 칼로리 */}
                      {settings.columns.showCalories && (
                        <div className="w-11 flex-shrink-0 text-center text-[11px] text-gray-600">
                          {rec?.workoutCalories ? `${rec.workoutCalories}` : '-'}
                        </div>
                      )}

                      {/* 메모 / 세부 운동 / 소모 칼로리 / 생리 */}
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
                            {rec?.workoutCalories ? (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded bg-orange-50 text-orange-700 border border-orange-200">
                                🔥{rec.workoutCalories}kcal
                              </span>
                            ) : null}
                            {rec?.workoutDuration ? (
                              <span className="inline-block text-[10px] text-gray-500 font-medium">
                                {rec.workoutDuration}분
                              </span>
                            ) : null}
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
