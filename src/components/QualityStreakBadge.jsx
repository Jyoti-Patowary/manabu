'use client';

import { useState } from 'react';

export default function QualityStreakBadge({
  streakData = { currentStreak: 0, longestStreak: 0, todayStatus: { count: 0, accuracy: 0, qualified: false, remainingToQualify: 5 } },
  onClick,
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { currentStreak, todayStatus } = streakData;
  const isQualified = todayStatus?.qualified;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-black transition-all shadow-2xs hover:scale-102 cursor-pointer ${
          isQualified
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-300'
            : currentStreak > 0
            ? 'bg-orange-50 border-orange-200 text-orange-950'
            : 'bg-slate-100 border-slate-200 text-slate-700'
        }`}
      >
        <span className={`text-base ${currentStreak > 0 ? 'animate-bounce' : 'grayscale opacity-60'}`}>
          🔥
        </span>

        <span className="font-extrabold tracking-tight">
          {currentStreak}日連続
        </span>

        {/* Today's mini status pill */}
        <span
          className={`px-1.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
            isQualified
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : todayStatus?.count > 0
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'bg-slate-200/80 text-slate-600'
          }`}
        >
          {isQualified ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>達成</span>
            </>
          ) : (
            <span>{todayStatus?.count || 0}/5</span>
          )}
        </span>
      </button>

      {/* Hover / tap explanation popover */}
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-slate-900 text-white rounded-2xl shadow-xl text-xs z-50 animate-in fade-in zoom-in-95 pointer-events-none space-y-1.5">
          <div className="flex items-center justify-between font-bold border-b border-slate-700 pb-1.5">
            <span>クオリティ・ストリーク (Quality Streak)</span>
            <span className="text-amber-400">🔥 {currentStreak}日</span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
            単なるアプリ起動ではなく、<strong className="text-white">1日5問以上の復習 ＆ 正答率70%以上</strong>を達成した日のみストリークとして記録されます。
          </p>

          <div className="pt-1 text-[11px] font-bold text-slate-300 flex items-center justify-between">
            <span>本日の進捗:</span>
            <span className={isQualified ? 'text-emerald-400' : 'text-amber-400'}>
              {todayStatus?.count}問 ({todayStatus?.accuracy}%) · {isQualified ? '本日達成 ✓' : `あと${todayStatus?.remainingToQualify}問`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

