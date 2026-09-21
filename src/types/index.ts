export interface DailyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number | null;
  workoutDone: boolean;
  workoutCategory?: string; // 헬스, 홈트, 유산소 등
  workoutType?: string;     // 천국의 계단, 러닝머신, 자전거 등
  workoutDuration?: number | null; // 분
  workoutCalories?: number | null; // kcal
  period: boolean;          // 생리 여부
  alcoholCount: number;     // 음주 잔/횟수 (0=안마심)
  memo: string;
}

export interface InBodyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;             // 체중 (kg)
  skeletalMuscle: number;     // 골격근량 (kg)
  bodyFatPercent: number;     // 체지방률 (%)
  waistHipRatio: number;      // 복부지방률 (WHR)
  visceralFatLevel: number;   // 내장지방레벨 (1~20)
  memo?: string;
}

export interface WorkoutCategory {
  id: string;
  name: string;      // 대분류
  items: string[];   // 소분류
}

export interface ColumnSettings {
  showWeight: boolean;
  showWorkout: boolean;
  showAlcohol: boolean;
  showPeriod: boolean;
  showCalories: boolean;
  showMemo: boolean;
}

export interface UserSettings {
  targetWeight: number;      // 목표 몸무게 (kg)
  startWeight: number;       // 시작 몸무게 (kg)
  height: number;            // 신장 (cm)
  targetDate?: string;       // 목표 달성일
  columns: ColumnSettings;
}

export type MainTabType = 'ledger' | 'stats' | 'inbody' | 'settings';
export type StatsPeriodType = 'weekly' | 'monthly' | 'yearly' | 'custom';
export type LedgerFilterType = 'all' | 'weight' | 'diet' | 'workout';
