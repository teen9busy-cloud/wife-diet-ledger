import React from 'react';
import { Search, MoreVertical, Settings as SettingsIcon, Plus } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface HeaderProps {
  onSearchClick?: () => void;
  onAddInBodyClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchClick, onAddInBodyClick }) => {
  const { activeTab, setActiveTab } = useData();

  const getTitle = () => {
    switch (activeTab) {
      case 'ledger':
        return '체중 기록';
      case 'stats':
        return '체중 통계';
      case 'inbody':
        return '체성분 · 인바디';
      case 'settings':
        return '커스텀 설정';
      default:
        return '체중 기록';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3.5 flex items-center justify-between">
      <h1 className="text-xl font-bold tracking-tight text-gray-900">{getTitle()}</h1>
      
      <div className="flex items-center space-x-2">
        {activeTab === 'ledger' && (
          <>
            <button
              onClick={onSearchClick}
              aria-label="기록 검색"
              className="p-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              aria-label="설정 메뉴"
              className="p-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </>
        )}

        {activeTab === 'stats' && (
          <button
            onClick={() => setActiveTab('settings')}
            aria-label="통계 설정"
            className="p-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        )}

        {activeTab === 'inbody' && (
          <button
            onClick={onAddInBodyClick}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            인바디 입력
          </button>
        )}
      </div>
    </header>
  );
};
