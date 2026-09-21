import React, { useState } from 'react';
import { Target, Calendar, ChevronRight, Plus, Activity } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { evaluateInBody, formatDateDot } from '../../utils/calculations';
import { InBodyRecord } from '../../types';
import { InbodyModal } from './InbodyModal';

export const InbodyTab: React.FC = () => {
  const { inBodyRecords, settings, records } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<InBodyRecord | null>(null);

  // 최신 인바디 기록 (날짜 내림차순 정렬)
  const sortedInBody = [...inBodyRecords].sort((a, b) => b.date.localeCompare(a.date));
  const latestInBody = sortedInBody[0];

  // 최신 체중 (인바디 기록 또는 일별 체중 기록 중 가장 최근값)
  const latestDailyWeight = records.find((r) => r.weight !== null)?.weight;
  const currentWeight = latestInBody?.weight || latestDailyWeight || 67.7;

  // 목표 대비 계산
  const targetWeight = settings.targetWeight || 58.0;
  const startWeight = settings.startWeight || 71.39;
  const remainingWeight = Number((currentWeight - targetWeight).toFixed(1));
  const totalGoalToLose = Math.max(0.1, startWeight - targetWeight);
  const actualLost = Math.max(0, startWeight - currentWeight);
  const progressPercent = Math.min(100, Math.max(0, Math.round((actualLost / totalGoalToLose) * 100)));

  // 인바디 판정
  const evaluation = latestInBody
    ? evaluateInBody(
        latestInBody.weight,
        latestInBody.skeletalMuscle,
        latestInBody.bodyFatPercent,
        latestInBody.waistHipRatio,
        latestInBody.visceralFatLevel,
        settings.height || 164
      )
    : null;

  return (
    <div className="pb-12 px-4 pt-4 space-y-4 max-w-md mx-auto">
      {/* 1. 목표 몸무게 & 남은 체중 달성 카드 (Hero Card) */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm flex items-center gap-1">
            <Target className="w-3.5 h-3.5" />
            목표 다이어트 현황
          </span>
          <span className="text-xs text-brand-100 font-medium">
            시작 {startWeight}kg ➔ 목표 {targetWeight}kg
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-2">
          <div>
            <p className="text-xs text-brand-100 font-normal">목표까지 남은 체중</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-extrabold tracking-tight">
                {remainingWeight > 0 ? `-${remainingWeight}` : '달성!'}
              </span>
              <span className="text-sm font-semibold">kg</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-brand-100">현재 체중</p>
            <p className="text-2xl font-bold">{currentWeight} <span className="text-xs font-normal">kg</span></p>
          </div>
        </div>

        {/* 프로그레스 바 */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-brand-100 mb-1">
            <span>목표 달성률</span>
            <span className="font-bold text-white">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. 최근 인바디 6대 핵심 지표 (사용자 요청 사항 100% 반영) */}
      {latestInBody && evaluation ? (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-1.5 text-base">
                <Activity className="w-4 h-4 text-brand-600" />
                최근 인바디 분석 지표
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                측정일: {formatDateDot(latestInBody.date)} {latestInBody.memo && `· ${latestInBody.memo}`}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingRecord(latestInBody);
                setModalOpen(true);
              }}
              className="text-xs text-brand-600 font-semibold hover:underline"
            >
              수정
            </button>
          </div>

          {/* 6대 지표 그리드 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 골격근량 */}
            <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100 flex flex-col justify-between">
              <span className="text-xs text-gray-500 font-medium">골격근량</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold text-gray-900">
                  {latestInBody.skeletalMuscle} <span className="text-xs font-normal text-gray-500">kg</span>
                </span>
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                    evaluation.muscleStatus === '우수'
                      ? 'bg-blue-100 text-blue-700'
                      : evaluation.muscleStatus === '표준'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {evaluation.muscleStatus}
                </span>
              </div>
              <div className="w-full h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${Math.min(100, (latestInBody.skeletalMuscle / 30) * 100)}%` }}
                />
              </div>
            </div>

            {/* 체지방률 */}
            <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex flex-col justify-between">
              <span className="text-xs text-gray-500 font-medium">체지방률</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold text-gray-900">
                  {latestInBody.bodyFatPercent} <span className="text-xs font-normal text-gray-500">%</span>
                </span>
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                    evaluation.fatStatus === '표준'
                      ? 'bg-green-100 text-green-700'
                      : evaluation.fatStatus === '경계'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {evaluation.fatStatus}
                </span>
              </div>
              <div className="w-full h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${Math.min(100, (latestInBody.bodyFatPercent / 45) * 100)}%` }}
                />
              </div>
            </div>

            {/* 복부지방률 WHR */}
            <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex flex-col justify-between">
              <span className="text-xs text-gray-500 font-medium">복부지방률 (WHR)</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold text-gray-900">
                  {latestInBody.waistHipRatio}
                </span>
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                    evaluation.whrStatus === '표준'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {evaluation.whrStatus}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">여성 기준 0.85 미만 권장</p>
            </div>

            {/* 내장지방레벨 */}
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex flex-col justify-between">
              <span className="text-xs text-gray-500 font-medium">내장지방레벨</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold text-gray-900">
                  Lv. {latestInBody.visceralFatLevel}
                </span>
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                    evaluation.visceralStatus === '안심'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {evaluation.visceralStatus}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">1~9레벨 안심 범위</p>
            </div>
          </div>

          {/* 체형 타입 진단 */}
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500">인바디 체형 분석</span>
              <p className="text-sm font-bold text-brand-800">{evaluation.bodyType}</p>
            </div>
            <span className="text-xs text-gray-600 bg-white px-2.5 py-1 rounded-lg border border-gray-200 font-medium">
              BMI {evaluation.bmi}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 space-y-3">
          <p className="text-gray-500 text-sm">아직 등록된 인바디 기록이 없습니다.</p>
          <button
            onClick={() => {
              setEditingRecord(null);
              setModalOpen(true);
            }}
            className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
          >
            첫 인바디 등록하기
          </button>
        </div>
      )}

      {/* 3. 인바디 변화 추이 (미니멀 차트) */}
      {sortedInBody.length > 1 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-900">체지방률 & 골격근량 추이</h4>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-rose-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                체지방률(%)
              </span>
              <span className="flex items-center gap-1 text-brand-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />
                골격근량(kg)
              </span>
            </div>
          </div>

          {/* SVG 심플 트렌드 차트 */}
          <div className="h-32 w-full pt-2">
            <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
              {/* 축 라인 */}
              <line x1="10" y1="80" x2="290" y2="80" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="10" y1="20" x2="290" y2="20" stroke="#f1f5f9" strokeWidth="1" />

              {/* 포인트 및 라인 (과거 -> 최신 오름차순으로 렌더) */}
              {(() => {
                const chronological = [...sortedInBody].reverse();
                const step = 280 / Math.max(1, chronological.length - 1);

                // 체지방률 포인트 (20~40% 범위 매핑)
                const fatPoints = chronological.map((rec, idx) => {
                  const x = 10 + idx * step;
                  const y = 80 - ((rec.bodyFatPercent - 20) / 20) * 60;
                  return { x, y: Math.max(15, Math.min(85, y)), val: rec.bodyFatPercent, date: rec.date };
                });

                // 근육량 포인트 (20~30kg 범위 매핑)
                const musclePoints = chronological.map((rec, idx) => {
                  const x = 10 + idx * step;
                  const y = 80 - ((rec.skeletalMuscle - 20) / 10) * 60;
                  return { x, y: Math.max(15, Math.min(85, y)), val: rec.skeletalMuscle, date: rec.date };
                });

                const fatPath = fatPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                const musclePath = musclePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                return (
                  <g>
                    {/* 패스 라인 */}
                    <path d={fatPath} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
                    <path d={musclePath} fill="none" stroke="#b84e33" strokeWidth="2.5" strokeLinecap="round" />

                    {/* 체지방 포인트 */}
                    {fatPoints.map((p, i) => (
                      <g key={`fat-${i}`}>
                        <circle cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#f43f5e" strokeWidth="2" />
                        <text x={p.x} y={p.y - 7} fontSize="10" textAnchor="middle" fill="#e11d48" fontWeight="bold">
                          {p.val}%
                        </text>
                        <text x={p.x} y="96" fontSize="9" textAnchor="middle" fill="#94a3b8">
                          {p.date.slice(5)}
                        </text>
                      </g>
                    ))}

                    {/* 근육량 포인트 */}
                    {musclePoints.map((p, i) => (
                      <g key={`mus-${i}`}>
                        <circle cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#b84e33" strokeWidth="2" />
                        <text x={p.x} y={p.y + 14} fontSize="10" textAnchor="middle" fill="#9a3412" fontWeight="bold">
                          {p.val}kg
                        </text>
                      </g>
                    ))}
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>
      )}

      {/* 4. 인바디 기록 이력 리스트 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-900">인바디 측정 이력</h4>
          <button
            onClick={() => {
              setEditingRecord(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
          >
            <Plus className="w-3.5 h-3.5" />
            기록 추가
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {sortedInBody.map((rec) => (
            <div
              key={rec.id}
              onClick={() => {
                setEditingRecord(rec);
                setModalOpen(true);
              }}
              className="py-2.5 flex items-center justify-between hover:bg-gray-50 cursor-pointer rounded-lg px-2 transition"
            >
              <div>
                <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {formatDateDot(rec.date)}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  골격근 {rec.skeletalMuscle}kg · 체지방 {rec.bodyFatPercent}% · WHR {rec.waistHipRatio}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">{rec.weight}kg</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 인바디 모달 */}
      <InbodyModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRecord(null);
        }}
        initialRecord={editingRecord}
      />
    </div>
  );
};
