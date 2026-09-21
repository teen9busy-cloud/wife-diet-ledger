import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { StatsPeriodType } from '../../types';
import { generateStats } from '../../utils/calculations';
import { BarChart3 } from 'lucide-react';

export const StatsTab: React.FC = () => {
  const { records } = useData();
  const [period, setPeriod] = useState<StatsPeriodType>('weekly');
  const [showChart, setShowChart] = useState<boolean>(true);

  // 통계 행 데이터 계산
  const statsRows = useMemo(() => {
    return generateStats(records, period);
  }, [records, period]);

  // 차트용 데이터 (과거순 정렬)
  const chartData = useMemo(() => {
    return [...statsRows].reverse().filter((r) => r.avgWeight !== null);
  }, [statsRows]);

  return (
    <div className="pb-12 max-w-md mx-auto">
      {/* 1. 상단 서브 기간 탭 (스크린샷 2와 100% 동일: 주간, 월간, 연간, 기간) */}
      <div className="bg-white border-b border-gray-100 flex items-center justify-around px-2 text-sm font-medium">
        <button
          onClick={() => setPeriod('weekly')}
          className={`py-3 flex-1 text-center relative transition-colors ${
            period === 'weekly' ? 'text-brand-600 font-bold' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          주간
          {period === 'weekly' && (
            <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-brand-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setPeriod('monthly')}
          className={`py-3 flex-1 text-center relative transition-colors ${
            period === 'monthly' ? 'text-brand-600 font-bold' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          월간
          {period === 'monthly' && (
            <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-brand-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setPeriod('yearly')}
          className={`py-3 flex-1 text-center relative transition-colors ${
            period === 'yearly' ? 'text-brand-600 font-bold' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          연간
          {period === 'yearly' && (
            <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-brand-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setPeriod('custom')}
          className={`py-3 flex-1 text-center relative transition-colors ${
            period === 'custom' ? 'text-brand-600 font-bold' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          기간
          {period === 'custom' && (
            <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-brand-600 rounded-full" />
          )}
        </button>
      </div>

      {/* 옵션: 차트 토글 및 미니 트렌드 */}
      <div className="bg-white px-4 pt-3 pb-1 border-b border-gray-100 flex items-center justify-between">
        <button
          onClick={() => setShowChart(!showChart)}
          className="text-xs font-bold text-gray-700 flex items-center gap-1.5 hover:text-brand-600 transition"
        >
          <BarChart3 className="w-3.5 h-3.5 text-brand-600" />
          <span>체중 & 이동평균선(MA5) 추이</span>
          <span className="text-[10px] text-gray-400 font-normal">
            ({showChart ? '차트 숨기기' : '차트 보기'})
          </span>
        </button>
        {showChart && (
          <div className="flex items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1 text-brand-600">
              <span className="w-2.5 h-0.5 bg-brand-600 inline-block" /> 평균
            </span>
            <span className="flex items-center gap-1 text-amber-600">
              <span className="w-2.5 h-0.5 bg-amber-500 inline-block border-t border-dashed" /> MA5
            </span>
          </div>
        )}
      </div>

      {showChart && chartData.length > 2 && (
        <div className="bg-white px-4 pb-4 border-b border-gray-100">

          <div className="h-28 w-full pt-1">
            <svg viewBox="0 0 300 80" className="w-full h-full overflow-visible">
              <line x1="5" y1="65" x2="295" y2="65" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="5" y1="15" x2="295" y2="15" stroke="#f1f5f9" strokeWidth="1" />

              {(() => {
                const weights = chartData.map((d) => d.avgWeight as number);
                const minW = Math.floor(Math.min(...weights) - 0.5);
                const maxW = Math.ceil(Math.max(...weights) + 0.5);
                const range = Math.max(1, maxW - minW);
                const step = 280 / Math.max(1, chartData.length - 1);

                const pts = chartData.map((d, i) => ({
                  x: 10 + i * step,
                  y: 65 - (((d.avgWeight as number) - minW) / range) * 50,
                  val: d.avgWeight,
                  ma5: d.ma5,
                  label: d.label.slice(4),
                }));

                const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                
                const ma5Pts = pts.filter((p) => p.ma5 !== null);
                const ma5Path = ma5Pts
                  .map((p, i) => {
                    const y = 65 - (((p.ma5 as number) - minW) / range) * 50;
                    return `${i === 0 ? 'M' : 'L'} ${p.x} ${y}`;
                  })
                  .join(' ');

                return (
                  <g>
                    {ma5Path && (
                      <path d={ma5Path} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                    )}
                    <path d={linePath} fill="none" stroke="#b84e33" strokeWidth="2.5" strokeLinecap="round" />
                    {pts.map((p, i) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r="3" fill="#fff" stroke="#b84e33" strokeWidth="2" />
                        <text x={p.x} y={p.y - 6} fontSize="8" textAnchor="middle" fill="#78350f" fontWeight="bold">
                          {p.val}
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

      {/* 2. 통계 테이블 컬럼 헤더 (스크린샷 2와 100% 동일) */}
      <div className="bg-white px-4 py-2.5 border-b border-gray-100 text-xs font-semibold text-gray-700 flex items-center">
        <div className="w-24 flex-shrink-0 text-left">날짜</div>
        <div className="w-16 flex-shrink-0 text-center">평균</div>
        <div className="w-16 flex-shrink-0 text-center">대비</div>
        <div className="w-16 flex-shrink-0 text-center">MA5</div>
        <div className="w-12 flex-shrink-0 text-center">운동</div>
        <div className="w-12 flex-shrink-0 text-center">음주</div>
      </div>

      {/* 3. 통계 데이터 행 리스트 (스크린샷 2 재현) */}
      <div className="divide-y divide-gray-100 bg-white">
        {statsRows.map((row, idx) => {
          // 대비 색상 및 아이콘
          const isDecrease = row.change !== null && row.change < 0;
          const isIncrease = row.change !== null && row.change > 0;

          return (
            <div
              key={idx}
              className="px-4 py-3 flex items-center hover:bg-gray-50/80 transition-colors text-sm"
            >
              {/* 날짜 (예: 26. 09. 21.) */}
              <div className="w-24 flex-shrink-0 text-xs text-gray-900 font-medium tracking-tight">
                {row.label}
              </div>

              {/* 평균 체중 */}
              <div className="w-16 flex-shrink-0 text-center font-medium text-gray-900">
                {row.avgWeight !== null ? row.avgWeight.toFixed(2) : '-'}
              </div>

              {/* 대비 (▼ 감소: 파란색, ▲ 증가: 빨간색) */}
              <div className="w-16 flex-shrink-0 text-center font-semibold text-xs">
                {row.change !== null ? (
                  isDecrease ? (
                    <span className="text-blue-600 flex items-center justify-center gap-0.5">
                      <span className="text-[10px]">▼</span>
                      {Math.abs(row.change).toFixed(2)}
                    </span>
                  ) : isIncrease ? (
                    <span className="text-rose-600 flex items-center justify-center gap-0.5">
                      <span className="text-[10px]">▲</span>
                      {row.change.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-gray-400">0.00</span>
                  )
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </div>

              {/* MA5 (5구간 이동평균) */}
              <div className="w-16 flex-shrink-0 text-center text-xs text-gray-700 font-medium">
                {row.ma5 !== null ? row.ma5.toFixed(2) : '-'}
              </div>

              {/* 운동 횟수 */}
              <div className="w-12 flex-shrink-0 text-center text-xs text-gray-800">
                {row.workoutCount}
              </div>

              {/* 음주 횟수 */}
              <div className="w-12 flex-shrink-0 text-center text-xs text-gray-800">
                {row.alcoholCount}
              </div>
            </div>
          );
        })}

        {statsRows.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">
            등록된 체중 기록이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};
