import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Plus, Trash2, Download, Upload, RotateCcw, Target, Dumbbell, Eye } from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const {
    settings,
    categories,
    updateSettings,
    toggleColumn,
    addCategory,
    deleteCategory,
    addWorkoutItem,
    deleteWorkoutItem,
    exportDataJSON,
    exportDataCSV,
    importDataJSON,
    resetAllData,
  } = useData();

  // 신규 운동 대분류 입력 상태
  const [newCatName, setNewCatName] = useState('');
  // 카테고리별 소분류 신규 입력 상태
  const [newItems, setNewItems] = useState<{ [catId: string]: string }>({});

  const handleAddItem = (catId: string) => {
    const text = newItems[catId];
    if (text && text.trim()) {
      addWorkoutItem(catId, text.trim());
      setNewItems((prev) => ({ ...prev, [catId]: '' }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        if (success) {
          alert('데이터를 성공적으로 복원했습니다!');
        } else {
          alert('백업 파일 형식이 올바르지 않습니다.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="pb-12 px-4 pt-4 space-y-5 max-w-md mx-auto text-sm">
      {/* 1. 목표 및 신체 정보 설정 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-bold text-gray-900 flex items-center gap-1.5 text-base">
          <Target className="w-4 h-4 text-brand-600" />
          목표 다이어트 설정
        </h3>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">목표 체중</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={settings.targetWeight}
                onChange={(e) => updateSettings({ targetWeight: parseFloat(e.target.value) || 0 })}
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <span className="absolute right-2 top-1.5 text-[10px] text-gray-400">kg</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">시작 체중</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={settings.startWeight}
                onChange={(e) => updateSettings({ startWeight: parseFloat(e.target.value) || 0 })}
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <span className="absolute right-2 top-1.5 text-[10px] text-gray-400">kg</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">키 (신장)</label>
            <div className="relative">
              <input
                type="number"
                value={settings.height}
                onChange={(e) => updateSettings({ height: parseInt(e.target.value, 10) || 160 })}
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <span className="absolute right-2 top-1.5 text-[10px] text-gray-400">cm</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 리스트 화면 컬럼 On/Off 설정 (커스텀 차별점) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-bold text-gray-900 flex items-center gap-1.5 text-base">
          <Eye className="w-4 h-4 text-brand-600" />
          가계부 리스트 표시 항목 (컬럼 On/Off)
        </h3>
        <p className="text-xs text-gray-400">
          보고 싶지 않은 항목은 꺼두어 가계부 테이블을 더 깔끔하게 관리하세요.
        </p>

        <div className="divide-y divide-gray-100 pt-1">
          {[
            { key: 'showWeight', label: '체중 (kg)' },
            { key: 'showWorkout', label: '운동 체크 (✓)' },
            { key: 'showAlcohol', label: '음주 여부/잔 수' },
            { key: 'showPeriod', label: '생리 주기 표시' },
            { key: 'showCalories', label: '운동 소모 칼로리' },
            { key: 'showMemo', label: '식단 및 한 줄 메모' },
          ].map((item) => (
            <div key={item.key} className="py-2 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">{item.label}</span>
              <button
                type="button"
                onClick={() => toggleColumn(item.key as keyof typeof settings.columns)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  settings.columns[item.key as keyof typeof settings.columns]
                    ? 'bg-brand-600'
                    : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    settings.columns[item.key as keyof typeof settings.columns]
                      ? 'translate-x-4'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 운동 항목 커스텀 관리 (손글씨 메모 반영) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-1.5 text-base">
            <Dumbbell className="w-4 h-4 text-brand-600" />
            운동 종류 커스텀 관리
          </h3>
        </div>
        <p className="text-xs text-gray-400">
          와이프분이 자주 하시는 운동(천국의 계단, 자전거 등)을 등록해두면 입력할 때 한 번의 터치로 선택할 수 있습니다.
        </p>

        {/* 카테고리별 목록 */}
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.id} className="border border-gray-200 rounded-xl p-3 bg-gray-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-brand-800 bg-brand-50 px-2 py-0.5 rounded">
                  {cat.name}
                </span>
                {categories.length > 1 && (
                  <button
                    onClick={() => {
                      if (window.confirm(`'${cat.name}' 카테고리를 삭제하시겠습니까?`)) {
                        deleteCategory(cat.id);
                      }
                    }}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 하위 항목 칩 리스트 */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {cat.items.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-white border border-gray-200 rounded-full text-gray-700 shadow-2xs"
                  >
                    {item}
                    <button
                      onClick={() => deleteWorkoutItem(cat.id, item)}
                      className="text-gray-400 hover:text-red-500 rounded-full ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* 소분류 항목 추가 인풋 */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="새 운동 추가 (예: 천국의 계단)"
                  value={newItems[cat.id] || ''}
                  onChange={(e) => setNewItems({ ...newItems, [cat.id]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddItem(cat.id);
                    }
                  }}
                  className="flex-1 px-2.5 py-1 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddItem(cat.id)}
                  className="px-2.5 py-1 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 transition"
                >
                  추가
                </button>
              </div>
            </div>
          ))}

          {/* 대분류 추가 */}
          <div className="flex gap-1.5 pt-1">
            <input
              type="text"
              placeholder="새 운동 대분류 (예: 수영, 테니스)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (newCatName.trim()) {
                    addCategory(newCatName.trim());
                    setNewCatName('');
                  }
                }
              }}
              className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={() => {
                if (newCatName.trim()) {
                  addCategory(newCatName.trim());
                  setNewCatName('');
                }
              }}
              className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-bold hover:bg-gray-900 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              대분류 추가
            </button>
          </div>
        </div>
      </div>

      {/* 4. 데이터 백업 & 내보내기 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-bold text-gray-900 flex items-center gap-1.5 text-base">
          <Download className="w-4 h-4 text-brand-600" />
          데이터 백업 및 엑셀 다운로드
        </h3>
        <p className="text-xs text-gray-400">
          소중한 기록이 날아가지 않도록 파일로 저장하거나 엑셀로 내보낼 수 있습니다.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={exportDataCSV}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition"
          >
            <Download className="w-3.5 h-3.5" />
            엑셀 (CSV) 다운로드
          </button>
          <button
            onClick={exportDataJSON}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 rounded-xl text-xs font-bold transition"
          >
            <Download className="w-3.5 h-3.5" />
            전체 백업 파일 저장
          </button>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-gray-100">
          <label className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 cursor-pointer font-medium py-1 px-2 rounded hover:bg-gray-100 transition">
            <Upload className="w-3.5 h-3.5 text-gray-500" />
            백업 파일 불러오기
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (window.confirm('기본 데모 데이터로 초기화하시겠습니까? (현재 데이터는 교체됩니다)')) {
                resetAllData();
                alert('초기화되었습니다.');
              }
            }}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition py-1 px-2 rounded"
          >
            <RotateCcw className="w-3 h-3" />
            초기 상태 복원
          </button>
        </div>
      </div>
    </div>
  );
};
