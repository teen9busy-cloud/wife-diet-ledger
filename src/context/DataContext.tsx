import React, { createContext, useContext, useState, useEffect } from 'react';
import { DailyRecord, InBodyRecord, MainTabType, UserSettings, WorkoutCategory } from '../types';
import { initialCategories, initialInBodyRecords, initialRecords, initialSettings } from './initialData';

interface DataContextType {
  records: DailyRecord[];
  inBodyRecords: InBodyRecord[];
  categories: WorkoutCategory[];
  settings: UserSettings;
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  // Records
  saveRecord: (record: Omit<DailyRecord, 'id'> & { id?: string }) => void;
  deleteRecord: (id: string) => void;
  getRecordByDate: (date: string) => DailyRecord | undefined;
  // InBody
  saveInBodyRecord: (record: Omit<InBodyRecord, 'id'> & { id?: string }) => void;
  deleteInBodyRecord: (id: string) => void;
  // Settings & Categories
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  toggleColumn: (columnKey: keyof UserSettings['columns']) => void;
  addCategory: (name: string) => void;
  deleteCategory: (id: string) => void;
  addWorkoutItem: (categoryId: string, item: string) => void;
  deleteWorkoutItem: (categoryId: string, item: string) => void;
  // Backup
  exportDataJSON: () => void;
  exportDataCSV: () => void;
  importDataJSON: (jsonStr: string) => boolean;
  resetAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  RECORDS: 'wife_diet_records_v1',
  INBODY: 'wife_diet_inbody_v1',
  CATEGORIES: 'wife_diet_categories_v1',
  SETTINGS: 'wife_diet_settings_v1',
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<MainTabType>('ledger');

  // Load from LocalStorage or use initial data
  const [records, setRecords] = useState<DailyRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return saved ? JSON.parse(saved) : initialRecords;
    } catch {
      return initialRecords;
    }
  });

  const [inBodyRecords, setInBodyRecords] = useState<InBodyRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INBODY);
      return saved ? JSON.parse(saved) : initialInBodyRecords;
    } catch {
      return initialInBodyRecords;
    }
  });

  const [categories, setCategories] = useState<WorkoutCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : initialCategories;
    } catch {
      return initialCategories;
    }
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INBODY, JSON.stringify(inBodyRecords));
  }, [inBodyRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Record CRUD
  const saveRecord = (recordData: Omit<DailyRecord, 'id'> & { id?: string }) => {
    setRecords((prev) => {
      const existingIndex = prev.findIndex((r) => (recordData.id ? r.id === recordData.id : r.date === recordData.date));
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...recordData,
          id: updated[existingIndex].id,
        };
        return updated;
      } else {
        const newRecord: DailyRecord = {
          ...recordData,
          id: recordData.id || `rec-${Date.now()}`,
        };
        return [newRecord, ...prev];
      }
    });
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const getRecordByDate = (date: string) => {
    return records.find((r) => r.date === date);
  };

  // InBody CRUD
  const saveInBodyRecord = (inBodyData: Omit<InBodyRecord, 'id'> & { id?: string }) => {
    setInBodyRecords((prev) => {
      const existingIndex = prev.findIndex((r) => (inBodyData.id ? r.id === inBodyData.id : r.date === inBodyData.date));
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...inBodyData,
          id: updated[existingIndex].id,
        };
        return updated;
      } else {
        const newInBody: InBodyRecord = {
          ...inBodyData,
          id: inBodyData.id || `inbody-${Date.now()}`,
        };
        return [newInBody, ...prev];
      }
    });
  };

  const deleteInBodyRecord = (id: string) => {
    setInBodyRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Settings & Category functions
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const toggleColumn = (columnKey: keyof UserSettings['columns']) => {
    setSettings((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [columnKey]: !prev.columns[columnKey],
      },
    }));
  };

  const addCategory = (name: string) => {
    if (!name.trim()) return;
    const newCat: WorkoutCategory = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      items: [],
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addWorkoutItem = (categoryId: string, item: string) => {
    if (!item.trim()) return;
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, items: [...c.items, item.trim()] } : c))
    );
  };

  const deleteWorkoutItem = (categoryId: string, item: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, items: c.items.filter((i) => i !== item) } : c))
    );
  };

  // Export / Import
  const exportDataJSON = () => {
    const data = { records, inBodyRecords, categories, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `다이어트가계부_백업_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportDataCSV = () => {
    const headers = ['날짜', '체중(kg)', '운동여부', '운동대분류', '운동종류', '운동시간(분)', '칼로리(kcal)', '생리여부', '음주잔수', '메모'];
    const rows = records.map((r) => [
      r.date,
      r.weight ?? '',
      r.workoutDone ? 'O' : 'X',
      r.workoutCategory ?? '',
      r.workoutType ?? '',
      r.workoutDuration ?? '',
      r.workoutCalories ?? '',
      r.period ? 'O' : 'X',
      r.alcoholCount || 0,
      `"${(r.memo || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `체중_운동_기록_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.records) setRecords(data.records);
      if (data.inBodyRecords) setInBodyRecords(data.inBodyRecords);
      if (data.categories) setCategories(data.categories);
      if (data.settings) setSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  const resetAllData = () => {
    setRecords(initialRecords);
    setInBodyRecords(initialInBodyRecords);
    setCategories(initialCategories);
    setSettings(initialSettings);
  };

  return (
    <DataContext.Provider
      value={{
        records,
        inBodyRecords,
        categories,
        settings,
        activeTab,
        setActiveTab,
        saveRecord,
        deleteRecord,
        getRecordByDate,
        saveInBodyRecord,
        deleteInBodyRecord,
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
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
