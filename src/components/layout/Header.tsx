import React from 'react';
import { Search, Settings as SettingsIcon, ChevronLeft, Plus } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface HeaderProps {
  onSearchClick?: () => void;
  onAddInBodyClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchClick, onAddInBodyClick }) => {
  const { activeTab, setActiveTab } = useData();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-2xs">
      {/* 1. 상단 타이틀 및 액션 버튼 바 */}
      <div className="px-4 py-3 flex items-center justify-between">
        {activeTab === 'settings' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ledger')}
              className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900 transition"
              aria-label="뒤로가기"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
              <span>체중 기록으로</span>
            </button>
          </div>
        ) : (
          <h1 className="text-lg font-bold tracking-tight text-gray-900 flex items-center gap-1.5">
            <span className="w-2 h-4 rounded-full bg-brand-600 inline-block" />
            체중 · 운동 가계부
          </h1>
        )}

        <div className="flex items-center space-x-1.5">
          {activeTab === 'ledger' && (
            <button
              onClick={onSearchClick}
              aria-label="기록 검색"
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
              title="검색"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {activeTab === 'inbody' && (
            <button
              onClick={onAddInBodyClick}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
              title="인바디 입력"
            >
              <Plus className="w-3.5 h-3.5" />
              인바디 입력
            </button>
          )}

          {activeTab !== 'settings' && (
            <button
              onClick={() => setActiveTab('settings')}
              aria-label="설정 메뉴"
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
              title="설정"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. 상단 3개 메인 탭 (체중 / 인바디 / 체중 통계 분석) */}
      {activeTab !== 'settings' && (
        <nav className="flex border-t border-gray-100 bg-white">
          {/* 탭 1: 체중 */}
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 py-2.5 text-center text-sm font-bold transition-all relative ${
              activeTab === 'ledger'
                ? 'text-brand-600'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            체중
            {activeTab === 'ledger' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />
            )}
          </button>

          {/* 탭 2: 인바디 */}
          <button
            onClick={() => setActiveTab('inbody')}
            className={`flex-1 py-2.5 text-center text-sm font-bold transition-all relative ${
              activeTab === 'inbody'
                ? 'text-brand-600'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            인바디
            {activeTab === 'inbody' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />
            )}
          </button>

          {/* 탭 3: 체중 통계 분석 */}
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2.5 text-center text-sm font-bold transition-all relative ${
              activeTab === 'stats'
                ? 'text-brand-600'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            체중 통계 분석
            {activeTab === 'stats' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />
            )}
          </button>
        </nav>
      )}
    </header>
  );
};
