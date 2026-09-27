'use client';

import { useMemo } from 'react';
import { calculateExamReadiness, estimateTimeToFluency } from '@/lib/motivationEngine';

export default function ExamReadinessWidget({
  userCards = [],
  activeJlptFilter = 'N5',
  onOpenModal,
}) {
  const targetLevel = activeJlptFilter && activeJlptFilter !== 'all' && activeJlptFilter !== 'kana'
    ? activeJlptFilter
    : 'N5';

  const readiness = useMemo(() => {
    return calculateExamReadiness(userCards, targetLevel);
  }, [userCards, targetLevel]);

  const fluencyEstimate = useMemo(() => {
    return estimateTimeToFluency(userCards, targetLevel, 15, 0.85);
  }, [userCards, targetLevel]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Side: Score & Target */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Radial Mini Gauge */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="9"
                fill="none"
                className="text-slate-100"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="9"
                fill="none"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * readiness.readinessPercent) / 100}
                strokeLinecap="round"
                className="text-[#D94826] transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm sm:text-base font-black text-[#1A1A1A] leading-none">
                {readiness.readinessPercent}%
              </span>
              <span className="text-[9px] font-black text-[#D94826] uppercase">
                {targetLevel}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#D94826]/10 text-[#D94826] border border-[#D94826]/20">
                {targetLevel} 合格レディネス
              </span>
              <span className="text-xs font-semibold text-slate-400">
                到達予想: <strong className="text-slate-700">{fluencyEstimate.projectedDateFormatted}</strong>
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-[#1A1A1A] font-serif-jp tracking-tight">
              {targetLevel} 試験対策 SRS定着スコア: {readiness.readinessPercent}%
            </h3>

            {/* Micro Breakdown with systematic content-type colors */}
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium pt-0.5 flex-wrap">
              <span>語彙: <strong className="text-[#1E40AF]">{readiness.breakdown.vocab.score}%</strong></span>
              <span>·</span>
              <span>漢字: <strong className="text-[#B45309]">{readiness.breakdown.kanji.score}%</strong></span>
              <span>·</span>
              <span>文法: <strong className="text-[#15803D]">{readiness.breakdown.grammar.score}%</strong></span>
            </div>
          </div>
        </div>

        {/* Right Side: CTA Button */}
        <div className="flex items-center gap-3 self-end lg:self-center">
          <button
            type="button"
            onClick={onOpenModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#D94826] text-white text-xs font-bold transition-fast shadow-xs cursor-pointer"
          >
            <span>詳細・ペースシミュレーター</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

