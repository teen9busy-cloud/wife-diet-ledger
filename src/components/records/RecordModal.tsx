import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Dumbbell, Heart, Wine, Plus } from 'lucide-react';
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

  // 다중 대분류 & 다중 소분류 선택 상태
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['헬스']);
  const [selectedWorkoutTypes, setSelectedWorkoutTypes] = useState<string[]>([]);
  const [customWorkoutType, setCustomWorkoutType] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [calories, setCalories] = useState<string>('');
  const [period, setPeriod] = useState<boolean>(false);
  const [alcohol, setAlcohol] = useState<boolean>(false);
  const [memo, setMemo] = useState<string>('');

  useEffect(() => {
    if (initialRecord) {
      setDate(initialRecord.date);
      setWeight(initialRecord.weight !== null ? String(initialRecord.weight) : '');
      setWorkoutDone(initialRecord.workoutDone);

      // 다중 대분류 불러오기
      if (initialRecord.workoutCategories && initialRecord.workoutCategories.length > 0) {
        setSelectedCategories(initialRecord.workoutCategories);
      } else if (initialRecord.workoutCategory) {
        setSelectedCategories(initialRecord.workoutCategory.split(', ').map((s) => s.trim()));
      } else {
        setSelectedCategories([categories[0]?.name || '헬스']);
      }

      // 다중 소분류 불러오기
      if (initialRecord.workoutTypes && initialRecord.workoutTypes.length > 0) {
        setSelectedWorkoutTypes(initialRecord.workoutTypes);
      } else if (initialRecord.workoutType) {
        setSelectedWorkoutTypes(initialRecord.workoutType.split(', ').map((s) => s.trim()));
      } else {
        setSelectedWorkoutTypes([]);
      }

      setDuration(initialRecord.workoutDuration ? String(initialRecord.workoutDuration) : '');
      setCalories(initialRecord.workoutCalories ? String(initialRecord.workoutCalories) : '');
      setPeriod(initialRecord.period);
      setAlcohol(Boolean(initialRecord.alcohol || (initialRecord.alcoholCount && initialRecord.alcoholCount > 0)));
      setMemo(initialRecord.memo || '');
    } else {
      setDate(targetDate || todayStr);
      setWeight('');
      setWorkoutDone(false);
      setSelectedCategories([categories[0]?.name || '헬스']);
      setSelectedWorkoutTypes([]);
      setCustomWorkoutType('');
      setDuration('');
      setCalories('');
      setPeriod(false);
      setAlcohol(false);
      setMemo('');
    }
  }, [initialRecord, targetDate, isOpen, categories, todayStr]);

  if (!isOpen) return null;

  // 대분류 토글 (헬스, 홈트 등 중복 체크 가능)
  const toggleCategory = (catName: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(catName)) {
        // 최소 1개는 유지하거나 없으면 빈 배열
        return prev.filter((c) => c !== catName);
      } else {
        return [...prev, catName];
      }
    });
  };

  // 소분류 운동 항목 토글 (중복 선택)
  const toggleWorkoutType = (typeName: string) => {
    setSelectedWorkoutTypes((prev) => {
      if (prev.includes(typeName)) {
        return prev.filter((t) => t !== typeName);
      } else {
        return [...prev, typeName];
      }
    });
  };

  // 직접 입력한 운동 추가
  const handleAddCustomWorkout = () => {
    const trimmed = customWorkoutType.trim();
    if (trimmed && !selectedWorkoutTypes.includes(trimmed)) {
      setSelectedWorkoutTypes((prev) => [...prev, trimmed]);
      setCustomWorkoutType('');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // 입력창에 남아있는 텍스트가 있다면 자동 추가
    const finalTypes = [...selectedWorkoutTypes];
    if (customWorkoutType.trim() && !finalTypes.includes(customWorkoutType.trim())) {
      finalTypes.push(customWorkoutType.trim());
    }

    saveRecord({
      id: initialRecord?.id,
      date,
      weight: weight ? parseFloat(weight) : null,
      workoutDone,
      workoutCategory: workoutDone ? selectedCategories.join(', ') : undefined,
      workoutCategories: workoutDone ? selectedCategories : [],
      workoutType: workoutDone ? finalTypes.join(', ') : undefined,
      workoutTypes: workoutDone ? finalTypes : [],
      workoutDuration: workoutDone && duration ? parseInt(duration, 10) : null,
      workoutCalories: workoutDone && calories ? parseInt(calories, 10) : null,
      period,
      alcohol,
      alcoholCount: alcohol ? 1 : 0,
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
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* 모달 헤더 */}
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">
            {initialRecord ? '기록 수정' : '오늘의 기록 쓰기'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 본문 */}
        <form onSubmit={handleSave} className="overflow-y-auto px-4 py-3.5 space-y-4 flex-1">
          {/* 1. 날짜 & 체중 */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
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
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="absolute right-2.5 top-1.5 text-[11px] text-gray-400 font-medium">kg</span>
              </div>
            </div>
          </div>

          {/* 2. 운동 여부 토글 및 중복 체크 선택기 (와이프 피드백: 헬스·홈트 중복 체크 지원) */}
          <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-brand-600" />
                오늘 운동 하셨나요?
              </span>
              <button
                type="button"
                onClick={() => setWorkoutDone(!workoutDone)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                  workoutDone ? 'bg-brand-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    workoutDone ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {workoutDone && (
              <div className="space-y-3 pt-2 border-t border-gray-200/80 animate-in fade-in duration-200">
                {/* 1단계: 대분류 (헬스, 홈트 등 중복 체크 가능) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      운동 대분류 <span className="text-brand-600 text-[11px] font-normal">(중복 선택 가능)</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => {
                      const isSelected = selectedCategories.includes(cat.name);
                      return (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => toggleCategory(cat.name)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border flex items-center gap-1 transition ${
                            isSelected
                              ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2단계: 소분류 운동 종류 선택 (선택된 대분류 항목들에 속한 모든 운동 표시) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    상세 운동 종류 <span className="text-brand-600 text-[11px] font-normal">(여러 개 체크 가능)</span>
                  </label>

                  <div className="space-y-2">
                    {categories
                      .filter((cat) => selectedCategories.includes(cat.name))
                      .map((cat) => (
                        <div key={cat.id} className="bg-white/80 p-2 rounded-lg border border-gray-100">
                          <span className="text-[11px] font-bold text-brand-800 mb-1 block">
                            [{cat.name}]
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {cat.items.map((item) => {
                              const isChecked = selectedWorkoutTypes.includes(item);
                              return (
                                <button
                                  type="button"
                                  key={item}
                                  onClick={() => toggleWorkoutType(item)}
                                  className={`px-2.5 py-1 text-xs rounded-full border flex items-center gap-1 transition ${
                                    isChecked
                                      ? 'bg-brand-100 text-brand-800 border-brand-300 font-bold'
                                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  {isChecked && <Check className="w-3 h-3 text-brand-700 stroke-[3]" />}
                                  {item}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                    {/* 직접 추가된 항목들 표시 */}
                    {selectedWorkoutTypes
                      .filter((t) => !categories.some((c) => c.items.includes(t)))
                      .map((customItem) => (
                        <span
                          key={customItem}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-brand-100 text-brand-800 border border-brand-300 font-bold mr-1"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          {customItem}
                          <button
                            type="button"
                            onClick={() => toggleWorkoutType(customItem)}
                            className="ml-1 text-gray-400 hover:text-red-500 text-sm"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>

                  {/* 목록에 없는 운동 직접 추가 */}
                  <div className="flex gap-1.5 mt-2">
                    <input
                      type="text"
                      placeholder="목록에 없는 운동 직접 입력 후 추가"
                      value={customWorkoutType}
                      onChange={(e) => setCustomWorkoutType(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomWorkout();
                        }
                      }}
                      className="flex-1 px-2.5 py-1 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomWorkout}
                      className="px-2.5 py-1 bg-gray-800 text-white rounded-lg text-xs font-bold hover:bg-gray-900 transition flex items-center gap-0.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      추가
                    </button>
                  </div>
                </div>

                {/* 시간 & 칼로리 */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">운동 시간 (분)</label>
                    <input
                      type="number"
                      placeholder="예: 40"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">소모 칼로리 (kcal)</label>
                    <input
                      type="number"
                      placeholder="예: 300"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. 생리 & 음주 체크 */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* 생리 체크 */}
            <button
              type="button"
              onClick={() => setPeriod(!period)}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                period
                  ? 'bg-pink-50 border-pink-300 text-pink-700 font-semibold'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xs font-medium flex items-center gap-1.5">
                <Heart className={`w-3.5 h-3.5 ${period ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} />
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

            {/* 음주 여부 토글 */}
            <button
              type="button"
              onClick={() => setAlcohol(!alcohol)}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                alcohol
                  ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xs font-medium flex items-center gap-1.5">
                <Wine className={`w-3.5 h-3.5 ${alcohol ? 'text-amber-600 fill-amber-500' : 'text-gray-400'}`} />
                음주
              </span>
              <div
                className={`w-4 h-4 rounded flex items-center justify-center border ${
                  alcohol ? 'bg-amber-600 border-amber-600 text-white' : 'border-gray-300 bg-white'
                }`}
              >
                {alcohol && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
          </div>

          {/* 4. 메모 */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">메모 / 식단 기록</label>
            <textarea
              rows={2}
              placeholder="예: 점심 샐러드, 물 2L, 특이사항"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* 하단 버튼 */}
          <div className="pt-1 flex items-center gap-2">
            {initialRecord && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition flex items-center justify-center border border-red-200"
                title="기록 삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md active:scale-[0.99] transition text-sm"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
