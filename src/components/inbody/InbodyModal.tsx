import React, { useState, useEffect } from 'react';
import { X, Trash2, Activity } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { InBodyRecord } from '../../types';

interface InbodyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecord?: InBodyRecord | null;
}

export const InbodyModal: React.FC<InbodyModalProps> = ({ isOpen, onClose, initialRecord }) => {
  const { saveInBodyRecord, deleteInBodyRecord, records } = useData();

  const todayStr = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState<string>(todayStr);
  const [weight, setWeight] = useState<string>('');
  const [skeletalMuscle, setSkeletalMuscle] = useState<string>('');
  const [bodyFatPercent, setBodyFatPercent] = useState<string>('');
  const [waistHipRatio, setWaistHipRatio] = useState<string>('');
  const [visceralFatLevel, setVisceralFatLevel] = useState<string>('');
  const [memo, setMemo] = useState<string>('');

  useEffect(() => {
    if (initialRecord) {
      setDate(initialRecord.date);
      setWeight(String(initialRecord.weight));
      setSkeletalMuscle(String(initialRecord.skeletalMuscle));
      setBodyFatPercent(String(initialRecord.bodyFatPercent));
      setWaistHipRatio(String(initialRecord.waistHipRatio));
      setVisceralFatLevel(String(initialRecord.visceralFatLevel));
      setMemo(initialRecord.memo || '');
    } else {
      setDate(todayStr);
      // 최근 체중 자동 제안
      const latestWeight = records.find((r) => r.weight !== null)?.weight;
      setWeight(latestWeight ? String(latestWeight) : '');
      setSkeletalMuscle('');
      setBodyFatPercent('');
      setWaistHipRatio('0.82');
      setVisceralFatLevel('6');
      setMemo('');
    }
  }, [initialRecord, isOpen, records, todayStr]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !skeletalMuscle || !bodyFatPercent) {
      alert('체중, 골격근량, 체지방률은 필수 입력 항목입니다.');
      return;
    }

    saveInBodyRecord({
      id: initialRecord?.id,
      date,
      weight: parseFloat(weight),
      skeletalMuscle: parseFloat(skeletalMuscle),
      bodyFatPercent: parseFloat(bodyFatPercent),
      waistHipRatio: waistHipRatio ? parseFloat(waistHipRatio) : 0.82,
      visceralFatLevel: visceralFatLevel ? parseInt(visceralFatLevel, 10) : 6,
      memo: memo.trim(),
    });

    onClose();
  };

  const handleDelete = () => {
    if (initialRecord?.id && window.confirm('이 인바디 기록을 삭제하시겠습니까?')) {
      deleteInBodyRecord(initialRecord.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* 모달 헤더 */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-50 text-brand-700">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {initialRecord ? '인바디 기록 수정' : '새 인바디 결과 등록'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 입력 영역 */}
        <form onSubmit={handleSave} className="overflow-y-auto px-5 py-4 space-y-4 flex-1 text-sm">
          {/* 날짜 */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">측정일</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* 체중 & 골격근량 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">체중 (kg) *</label>
              <input
                type="number"
                step="0.05"
                placeholder="예: 67.7"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">골격근량 (kg) *</label>
              <input
                type="number"
                step="0.1"
                placeholder="예: 23.6"
                value={skeletalMuscle}
                onChange={(e) => setSkeletalMuscle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* 체지방률 & 복부지방률 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">체지방률 (%) *</label>
              <input
                type="number"
                step="0.1"
                placeholder="예: 28.5"
                value={bodyFatPercent}
                onChange={(e) => setBodyFatPercent(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">복부지방률 (WHR)</label>
              <input
                type="number"
                step="0.01"
                placeholder="예: 0.81"
                value={waistHipRatio}
                onChange={(e) => setWaistHipRatio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* 내장지방레벨 */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              내장지방레벨 (1~20)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="20"
                value={visceralFatLevel || 5}
                onChange={(e) => setVisceralFatLevel(e.target.value)}
                className="flex-1 accent-brand-600"
              />
              <span className="w-12 text-center font-bold px-2 py-1 bg-gray-100 rounded text-brand-700">
                Lv. {visceralFatLevel || 5}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">1~9레벨은 안심 표준 범위입니다.</p>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">측정 장소 / 메모</label>
            <input
              type="text"
              placeholder="예: 헬스장 인바디, 아침 공복 측정"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* 하단 버튼 */}
          <div className="pt-3 flex items-center gap-2">
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
              className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition"
            >
              인바디 결과 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
