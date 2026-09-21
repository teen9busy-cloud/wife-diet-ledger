import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Dumbbell, Heart, Wine } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { DailyRecord } from '../../types';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDate?: string;
  initialRecord?: DailyRecord | null;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  onClose,
  targetDate,
  initialRecord,
}) => {
  const { categories, saveRecord, deleteRecord } = useData();

  const todayStr = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState<string>(targetDate || todayStr);
  const [weight, setWeight] = useState<string>('');
  const [workoutDone, setWorkoutDone] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('헬스');
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>('천국의 계단');
  const [customWorkoutType, setCustomWorkoutType] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [calories, setCalories] = useState<string>('');
  const [period, setPeriod] = useState<boolean>(false);
  const [alcoholCount, setAlcoholCount] = useState<number>(0);
  const [memo, setMemo] = useState<string>('');

  useEffect(() => {
    if (initialRecord) {
      setDate(initialRecord.date);
      setWeight(initialRecord.weight !== null ? String(initialRecord.weight) : '');
      setWorkoutDone(initialRecord.workoutDone);
      setSelectedCategory(initialRecord.workoutCategory || (categories[0]?.name || '헬스'));
      setSelectedWorkoutType(initialRecord.workoutType || '');
      setDuration(initialRecord.workoutDuration ? String(initialRecord.workoutDuration) : '');
      setCalories(initialRecord.workoutCalories ? String(initialRecord.workoutCalories) : '');
      setPeriod(initialRecord.period);
      setAlcoholCount(initialRecord.alcoholCount || 0);
      setMemo(initialRecord.memo || '');
    } else {
      setDate(targetDate || todayStr);
      setWeight('');
      setWorkoutDone(false);
      setSelectedCategory(categories[0]?.name || '헬스');
      setSelectedWorkoutType(categories[0]?.items[0] || '천국의 계단');
      setCustomWorkoutType('');
      setDuration('');
      setCalories('');
      setPeriod(false);
      setAlcoholCount(0);
      setMemo('');
    }
  }, [initialRecord, targetDate, isOpen, categories]);

  if (!isOpen) return null;

  // 현재 선택된 대분류의 하위 소분류 항목들
  const currentCategoryObj = categories.find((c) => c.name === selectedCategory);
  const subItems = currentCategoryObj ? currentCategoryObj.items : [];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const finalWorkoutType = customWorkoutType.trim() ? customWorkoutType.trim() : selectedWorkoutType;

    saveRecord({
      id: initialRecord?.id,
      date,
      weight: weight ? parseFloat(weight) : null,
      workoutDone,
      workoutCategory: workoutDone ? selectedCategory : undefined,
      workoutType: workoutDone ? finalWorkoutType : undefined,
      workoutDuration: workoutDone && duration ? parseInt(duration, 10) : null,
      workoutCalories: workoutDone && calories ? parseInt(calories, 10) : null,
      period,
      alcoholCount,
      memo: memo.trim(),
    });

    onClose();
  };

  const handleDelete = () => {
    if (initialRecord?.id && window.confirm('이 날의 기록을 삭제하시겠습니까?')) {
      deleteRecord(initialRecord.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* 모달 헤더 */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {initialRecord ? '기록 수정' : '오늘의 기록 쓰기'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 내용 스크롤 영역 */}
        <form onSubmit={handleSave} className="overflow-y-auto px-5 py-4 space-y-5 flex-1">
          {/* 1. 날짜 & 체중 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">체중 (kg)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.05"
                  placeholder="예: 67.7"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="absolute right-3 top-2 text-xs text-gray-400 font-medium">kg</span>
              </div>
            </div>
          </div>

          {/* 2. 운동 여부 토글 및 계층형 선택 (손글씨 기획 메모 반영) */}
          <div className="border border-gray-100 rounded-xl p-3.5 bg-gray-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-brand-600" />
                운동 완료 여부
              </span>
              <button
                type="button"
                onClick={() => setWorkoutDone(!workoutDone)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  workoutDone ? 'bg-brand-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    workoutDone ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {workoutDone && (
              <div className="space-y-3 pt-2 border-t border-gray-200/80 animate-in fade-in duration-200">
                {/* 1단계: 운동 대분류 (헬스, 홈트 등) */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    운동 대분류
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setSelectedWorkoutType(cat.items[0] || '');
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                          selectedCategory === cat.name
                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2단계: 운동 소분류 (천국의 계단, 러닝머신, 자전거 등) */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    운동 종류 (소분류)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {subItems.map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => {
                          setSelectedWorkoutType(item);
                          setCustomWorkoutType('');
                        }}
                        className={`px-3 py-1 text-xs rounded-full border transition ${
                          selectedWorkoutType === item && !customWorkoutType
                            ? 'bg-brand-100 text-brand-800 border-brand-300 font-bold'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  {/* 직접 입력 */}
                  <input
                    type="text"
                    placeholder="목록에 없는 운동 직접 입력"
                    value={customWorkoutType}
                    onChange={(e) => setCustomWorkoutType(e.target.value)}
                    className="mt-2 w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                {/* 운동 시간 / 칼로리 수치 */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">운동 시간 (분)</label>
                    <input
                      type="number"
                      placeholder="예: 40"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">소모 칼로리 (kcal)</label>
                    <input
                      type="number"
                      placeholder="예: 300"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. 생리 & 음주 체크 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 생리 체크 */}
            <button
              type="button"
              onClick={() => setPeriod(!period)}
              className={`p-3 rounded-xl border flex items-center justify-between transition ${
                period
                  ? 'bg-pink-50 border-pink-300 text-pink-700 font-semibold'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xs font-medium flex items-center gap-1.5">
                <Heart className={`w-4 h-4 ${period ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} />
                생리 중
              </span>
              <div
                className={`w-4 h-4 rounded flex items-center justify-center border ${
                  period ? 'bg-pink-600 border-pink-600 text-white' : 'border-gray-300 bg-white'
                }`}
              >
                {period && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>

            {/* 음주 잔 수 */}
            <div className="p-3 rounded-xl border border-gray-200 bg-white flex flex-col justify-between">
              <span className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                <Wine className="w-4 h-4 text-amber-600" />
                음주 (잔/회)
              </span>
              <div className="flex items-center justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setAlcoholCount((prev) => Math.max(0, prev - 1))}
                  className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold flex items-center justify-center text-sm"
                >
                  -
                </button>
                <span className="text-sm font-bold text-gray-800 w-4 text-center">
                  {alcoholCount}
                </span>
                <button
                  type="button"
                  onClick={() => setAlcoholCount((prev) => prev + 1)}
                  className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 font-bold flex items-center justify-center text-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* 4. 자유 메모 */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">메모 / 식단 요약</label>
            <textarea
              rows={2}
              placeholder="예: 점심 샐러드, 물 2L 마심, 143"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* 하단 버튼 */}
          <div className="pt-2 flex items-center gap-2">
            {initialRecord && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition flex items-center justify-center border border-red-200"
                title="기록 삭제"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md active:scale-[0.99] transition"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
