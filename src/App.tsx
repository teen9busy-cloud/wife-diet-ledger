import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Header } from './components/layout/Header';
import { RecordLedgerTab } from './components/records/RecordLedgerTab';
import { RecordModal } from './components/records/RecordModal';
import { StatsTab } from './components/stats/StatsTab';
import { InbodyTab } from './components/inbody/InbodyTab';
import { SettingsTab } from './components/settings/SettingsTab';
import { InbodyModal } from './components/inbody/InbodyModal';
import { DailyRecord } from './types';
import { Smartphone } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab } = useData();

  // 일별 기록 모달 상태
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [targetDate, setTargetDate] = useState<string | undefined>(undefined);
  const [editingRecord, setEditingRecord] = useState<DailyRecord | null>(null);

  // 인바디 모달 상태
  const [inbodyModalOpen, setInbodyModalOpen] = useState(false);

  // PWA 홈 화면 추가 팁 배너 닫기 상태
  const [showPwaTip, setShowPwaTip] = useState(false);

  const handleOpenAdd = (date?: string) => {
    setEditingRecord(null);
    setTargetDate(date);
    setRecordModalOpen(true);
  };

  const handleEditRecord = (record: DailyRecord) => {
    setEditingRecord(record);
    setTargetDate(record.date);
    setRecordModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* 모바일 컨테이너 (스마트폰 크기에 최적화된 심플 프레임) */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-md flex flex-col relative">
        {/* 상단 헤더 */}
        <Header
          onAddInBodyClick={() => setInbodyModalOpen(true)}
          onSearchClick={() => {
            const query = prompt('검색할 날짜(YYYY-MM-DD) 또는 메모/운동명을 입력하세요:');
            if (query) {
              alert(`'${query}' 검색 결과는 리스트에서 바로 확인하실 수 있습니다.`);
            }
          }}
        />

        {/* PWA 안내 미니 배너 */}
        {showPwaTip && (
          <div className="bg-brand-50 px-4 py-2 border-b border-brand-100 flex items-center justify-between text-xs text-brand-800">
            <span className="flex items-center gap-1.5 font-medium">
              <Smartphone className="w-4 h-4 text-brand-600" />
              브라우저 메뉴에서 <strong>[홈 화면에 추가]</strong>를 누르면 앱처럼 설치됩니다!
            </span>
            <button
              onClick={() => setShowPwaTip(false)}
              className="text-brand-500 font-bold ml-2 text-sm"
            >
              ×
            </button>
          </div>
        )}

        {/* 탭 본문 영역 */}
        <main className="flex-1">
          {activeTab === 'ledger' && (
            <RecordLedgerTab
              onOpenAddModal={handleOpenAdd}
              onEditRecord={handleEditRecord}
            />
          )}

          {activeTab === 'stats' && <StatsTab />}

          {activeTab === 'inbody' && <InbodyTab />}

          {activeTab === 'settings' && <SettingsTab />}
        </main>

        {/* 기록 입력/수정 팝업 */}
        <RecordModal
          isOpen={recordModalOpen}
          onClose={() => {
            setRecordModalOpen(false);
            setEditingRecord(null);
          }}
          targetDate={targetDate}
          initialRecord={editingRecord}
        />

        {/* 인바디 모달 (헤더 등에서 바로 호출 시) */}
        <InbodyModal
          isOpen={inbodyModalOpen}
          onClose={() => setInbodyModalOpen(false)}
        />
      </div>
    </div>
  );
};

export function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

export default App;
