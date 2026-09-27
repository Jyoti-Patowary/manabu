'use client';

import { useState, useMemo } from 'react';
import {
  calculateExamReadiness,
  estimateTimeToFluency,
  JLPT_BENCHMARKS,
} from '@/lib/motivationEngine';
import { useLanguage } from '@/context/LanguageContext';

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export default function ExamReadinessModal({
  userCards = [],
  initialLevel = 'N5',
  streakData = null,
  onClose,
}) {
  const { t } = useLanguage();
  const [selectedLevel, setSelectedLevel] = useState(initialLevel || 'N5');
  const [dailyPace, setDailyPace] = useState(15);
  const [targetAccuracy, setTargetAccuracy] = useState(0.85);

  const readiness = useMemo(() => {
    return calculateExamReadiness(userCards, selectedLevel);
  }, [userCards, selectedLevel]);

  const fluencyEstimate = useMemo(() => {
    return estimateTimeToFluency(userCards, selectedLevel, dailyPace, targetAccuracy);
  }, [userCards, selectedLevel, dailyPace, targetAccuracy]);

  const benchmark = JLPT_BENCHMARKS[selectedLevel] || JLPT_BENCHMARKS.N5;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black tracking-wider uppercase text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              科学的学習指標 · Motivation Engine
            </span>
            <h2 className="text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2 font-japanese">
              <span>{t('examReadiness') || 'JLPT 合格レディネス & 習熟予測'}</span>
            </h2>
            <p className="text-xs text-slate-500">
              単なる日数カウントダウンではなく、SRS間隔の定着度と学習ペースから合格準備率を算出します。
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center text-sm font-bold transition-all shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Level Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {JLPT_LEVELS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedLevel(lvl)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
                selectedLevel === lvl
                  ? 'bg-slate-900 text-white shadow-sm scale-102'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Hero Score Card */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-extrabold text-indigo-300">
              {selectedLevel} {t('examReadiness') || '合格レディネス (Overall Readiness)'}
            </span>
            <div className="flex items-baseline justify-center sm:justify-start gap-2">
              <span className="text-5xl font-black tracking-tight font-japanese">
                {readiness.readinessPercent}%
              </span>
              <span className="text-xs text-slate-300 font-medium">
                / 100% (目安)
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-xs leading-relaxed font-sans">
              定着済みカード(間隔7日以上: 100%加算)と学習中カード(間隔1〜6日: 50%加算)の合算スコアです。
            </p>
          </div>

          {/* Radial Progress Graphic */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-white/10"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * readiness.readinessPercent) / 100}
                strokeLinecap="round"
                className="text-indigo-400 transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-black text-indigo-200 uppercase tracking-wider">{selectedLevel}</span>
              <span className="text-sm font-extrabold text-white">{readiness.readinessPercent}%</span>
            </div>
          </div>
        </div>

        {/* 3 Pillars Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            分野別レディネス内訳 (Weighting: 語彙 40% · 漢字 30% · 文法 30%)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Vocab */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>語彙 (Vocab 40%)</span>
                <span className="text-sky-600 font-extrabold">{readiness.breakdown.vocab.score}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, readiness.breakdown.vocab.score)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>定着: {readiness.breakdown.vocab.stable}語</span>
                <span>目標: {benchmark.vocab}語</span>
              </div>
            </div>

            {/* Kanji */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>漢字 (Kanji 30%)</span>
                <span className="text-violet-600 font-extrabold">{readiness.breakdown.kanji.score}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, readiness.breakdown.kanji.score)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>定着: {readiness.breakdown.kanji.stable}字</span>
                <span>目標: {benchmark.kanji}字</span>
              </div>
            </div>

            {/* Grammar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>文法 (Grammar 30%)</span>
                <span className="text-purple-600 font-extrabold">{readiness.breakdown.grammar.score}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, readiness.breakdown.grammar.score)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>定着: {readiness.breakdown.grammar.stable}項目</span>
                <span>目標: {benchmark.grammar}項目</span>
              </div>
            </div>
          </div>
        </div>

        {/* Time-to-Fluency Pace Simulator */}
        <div className="p-5 rounded-3xl bg-indigo-50/70 border border-indigo-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-700">
                📈 習熟時期シミュレーター (Time-to-Fluency)
              </span>
              <h4 className="text-base font-black text-slate-900 font-japanese">
                {selectedLevel} 合格水準到達予想: <span className="text-indigo-600">{fluencyEstimate.projectedDateFormatted}</span>
              </h4>
            </div>
            <span className="px-3 py-1 rounded-xl bg-white border border-indigo-200 text-xs font-extrabold text-indigo-900 shadow-2xs self-start sm:self-auto">
              約 {fluencyEstimate.daysToFluency} 日後
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>1日の目標復習・新規学習ペース</span>
              <span className="text-indigo-700 font-extrabold">{dailyPace} 問/日</span>
            </div>

            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={dailyPace}
              onChange={(e) => setDailyPace(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>ゆったり (5問/日)</span>
              <span>標準 (15問/日)</span>
              <span>集中特訓 (50問/日)</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
            合格目安(シラバス85%習熟)に必要な残り {fluencyEstimate.remainingCards} カードを、正答率85%ベースで試算しています。ペースを上げると到達予定日が早まります。
          </p>
        </div>

        {/* 14-day Quality Heatmap if streak data available */}
        {streakData?.recentDays && streakData.recentDays.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black uppercase tracking-wider text-slate-400">
                直近14日間のクオリティ復習実績
              </span>
              <span className="text-amber-700 font-bold">
                現在のストリーク: {streakData.currentStreak}日連続 🔥
              </span>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5">
              {streakData.recentDays.map((day) => {
                const dayLabel = day.date.slice(5); // MM-DD
                return (
                  <div
                    key={day.date}
                    className={`p-2 rounded-xl text-center border transition-all ${
                      day.qualified
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : day.count > 0
                        ? 'bg-amber-50 border-amber-200 text-amber-900 font-medium'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                    title={`${day.date}: ${day.count}問 (${Math.round(day.accuracy * 100)}%) · ${
                      day.qualified ? '条件達成 ✓' : '未達成'
                    }`}
                  >
                    <div className="text-[9px] text-slate-400">{dayLabel}</div>
                    <div className="text-xs font-black mt-0.5">
                      {day.qualified ? '🔥' : day.count > 0 ? `${day.count}` : '·'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

