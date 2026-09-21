import { DailyRecord } from '../types';

export interface StatRow {
  label: string;          // 예: "26. 09. 21."
  startDate: string;
  endDate: string;
  avgWeight: number | null;
  change: number | null;  // 직전 대비 (+: 증가, -: 감소)
  ma5: number | null;     // 5구간 이동평균
  workoutCount: number;
  alcoholCount: number;
}

/**
 * 날짜 포맷 변환 (YYYY-MM-DD -> YY. MM. DD.)
 */
export function formatDateDot(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const yy = parts[0].slice(2);
    const mm = parts[1];
    const dd = parts[2];
    return `${yy}. ${mm}. ${dd}.`;
  }
  return dateStr;
}

/**
 * 요일 한글 반환
 */
export function getDayOfWeek(dateStr: string): { name: string; dayIndex: number } {
  const date = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dayIndex = date.getDay();
  return { name: days[dayIndex], dayIndex };
}

/**
 * 주간/월간/연간 통계 데이터 산출 로직
 * 스크린샷 2(체중 통계)의 평균, 대비, MA5, 운동, 음주 완벽 재현
 */
export function generateStats(records: DailyRecord[], period: 'weekly' | 'monthly' | 'yearly' | 'custom'): StatRow[] {
  if (!records || records.length === 0) return [];

  // 날짜 오름차순 정렬 (과거 -> 최신)
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));

  const groups: { [key: string]: DailyRecord[] } = {};

  if (period === 'weekly') {
    // 7일 단위 주차 그룹화 (최신 날짜 기준 역산)
    // 과거부터 주차별로 그룹화
    sorted.forEach((rec) => {
      const d = new Date(rec.date);
      // 일요일 시작 또는 월요일 기준 주차
      const day = d.getDay();
      const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diffToMonday));
      const key = monday.toISOString().slice(0, 10);
      if (!groups[key]) groups[key] = [];
      groups[key].push(rec);
    });
  } else if (period === 'monthly') {
    sorted.forEach((rec) => {
      const key = rec.date.slice(0, 7); // YYYY-MM
      if (!groups[key]) groups[key] = [];
      groups[key].push(rec);
    });
  } else if (period === 'yearly') {
    sorted.forEach((rec) => {
      const key = rec.date.slice(0, 4); // YYYY
      if (!groups[key]) groups[key] = [];
      groups[key].push(rec);
    });
  } else {
    // custom: 10일 간격 등
    sorted.forEach((rec) => {
      const key = rec.date.slice(0, 7);
      if (!groups[key]) groups[key] = [];
      groups[key].push(rec);
    });
  }

  // 그룹 키 오름차순
  const sortedKeys = Object.keys(groups).sort();
  const rawRows: {
    label: string;
    startDate: string;
    endDate: string;
    avgWeight: number | null;
    workoutCount: number;
    alcoholCount: number;
  }[] = [];

  sortedKeys.forEach((key) => {
    const list = groups[key];
    const weights = list.filter((r) => r.weight !== null && r.weight > 0).map((r) => r.weight as number);
    const avgWeight = weights.length > 0 ? Number((weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(2)) : null;

    const workoutCount = list.filter((r) => r.workoutDone).length;
    const alcoholCount = list.reduce((sum, r) => sum + (r.alcohol || (r.alcoholCount && r.alcoholCount > 0) ? 1 : 0), 0);

    let label = '';
    if (period === 'weekly') {
      // 마지막 날짜 또는 주차 시작일
      const lastDate = list[list.length - 1].date;
      label = formatDateDot(lastDate);
    } else if (period === 'monthly') {
      const [y, m] = key.split('-');
      label = `${y.slice(2)}. ${m}월`;
    } else if (period === 'yearly') {
      label = `${key}년`;
    } else {
      label = formatDateDot(list[0].date);
    }

    rawRows.push({
      label,
      startDate: list[0].date,
      endDate: list[list.length - 1].date,
      avgWeight,
      workoutCount,
      alcoholCount,
    });
  });

  // 이제 직전 대비 및 MA5(최근 5구간 이동평균) 계산
  const calculatedRows: StatRow[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const current = rawRows[i];
    
    // 대비 (전 기간과의 평균 차이)
    let change: number | null = null;
    if (i > 0 && current.avgWeight !== null) {
      // 이전 유효한 평균 찾기
      const prev = rawRows[i - 1];
      if (prev.avgWeight !== null) {
        change = Number((current.avgWeight - prev.avgWeight).toFixed(2));
      }
    }

    // MA5: 현재 포함 직전 5개 구간의 avgWeight 평균
    // 만약 5개 미만이면 스크린샷처럼 null (-)
    let ma5: number | null = null;
    if (i >= 4) {
      const windowRows = rawRows.slice(i - 4, i + 1).map((r) => r.avgWeight).filter((w): w is number => w !== null);
      if (windowRows.length === 5) {
        ma5 = Number((windowRows.reduce((a, b) => a + b, 0) / 5).toFixed(2));
      }
    }

    calculatedRows.push({
      label: current.label,
      startDate: current.startDate,
      endDate: current.endDate,
      avgWeight: current.avgWeight,
      change,
      ma5,
      workoutCount: current.workoutCount,
      alcoholCount: current.alcoholCount,
    });
  }

  // 스크린샷처럼 최신 날짜가 위로 오도록 내림차순 반환
  return calculatedRows.reverse();
}

/**
 * 인바디 판정 헬퍼
 */
export function evaluateInBody(
  weight: number,
  skeletalMuscle: number,
  bodyFatPercent: number,
  waistHipRatio: number,
  visceralFatLevel: number,
  heightCm: number = 163
) {
  const heightM = heightCm / 100;
  const bmi = Number((weight / (heightM * heightM)).toFixed(1));

  // 체지방률 판정 (여성 기준)
  let fatStatus: '표준이하' | '표준' | '경계' | '비만' = '표준';
  if (bodyFatPercent < 18) fatStatus = '표준이하';
  else if (bodyFatPercent <= 28) fatStatus = '표준';
  else if (bodyFatPercent <= 33) fatStatus = '경계';
  else fatStatus = '비만';

  // 골격근량 정상범위 (대략 체중의 34~40%)
  const standardMuscleMin = Number((weight * 0.34).toFixed(1));
  const standardMuscleMax = Number((weight * 0.42).toFixed(1));
  let muscleStatus: '부족' | '표준' | '우수' = '표준';
  if (skeletalMuscle < standardMuscleMin) muscleStatus = '부족';
  else if (skeletalMuscle > standardMuscleMax) muscleStatus = '우수';

  // 복부지방률 WHR (여성 기준: 0.85 이상 복부비만)
  let whrStatus: '표준' | '경계' | '복부비만' = '표준';
  if (waistHipRatio < 0.80) whrStatus = '표준';
  else if (waistHipRatio <= 0.85) whrStatus = '경계';
  else whrStatus = '복부비만';

  // 내장지방레벨 (1~9 안심, 10~14 경계, 15 이상 위험)
  let visceralStatus: '안심' | '경계' | '위험' = '안심';
  if (visceralFatLevel <= 9) visceralStatus = '안심';
  else if (visceralFatLevel <= 14) visceralStatus = '경계';
  else visceralStatus = '위험';

  // C-I-D 판정
  let bodyType: 'C형 (체지방형)' | 'I형 (표준형)' | 'D형 (근육형)' = 'I형 (표준형)';
  if (muscleStatus === '부족' && (fatStatus === '비만' || fatStatus === '경계')) {
    bodyType = 'C형 (체지방형)';
  } else if (muscleStatus === '우수' && fatStatus !== '비만') {
    bodyType = 'D형 (근육형)';
  }

  return {
    bmi,
    fatStatus,
    muscleStatus,
    whrStatus,
    visceralStatus,
    bodyType,
    standardMuscleMin,
    standardMuscleMax,
  };
}
