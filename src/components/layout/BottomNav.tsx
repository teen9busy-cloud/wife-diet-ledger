import React from 'react';
import { Home, FileText, BarChart2, PieChart, User } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useData();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around h-14 px-2">
        {/* 1. Home button */}
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'ledger' ? 'text-gray-400' : 'text-gray-400 hover:text-gray-600'
          }`}
          title="홈"
        >
          <Home className="w-5 h-5" />
        </button>

        {/* 2. Ledger Record (Tab 1) */}
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'ledger' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
          }`}
          title="체중 기록"
        >
          <FileText className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* 3. Stats (Tab 3 - Screenshot 2) */}
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'stats' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
          }`}
          title="체중 통계"
        >
          <BarChart2 className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* 4. InBody & Goal (Tab 2) */}
        <button
          onClick={() => setActiveTab('inbody')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'inbody' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
          }`}
          title="인바디 체성분"
        >
          <PieChart className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* 5. Custom Settings (Tab 4) */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'settings' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
          }`}
          title="설정"
        >
          <User className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>
    </nav>
  );
};
