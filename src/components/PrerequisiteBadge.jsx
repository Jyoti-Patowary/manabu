'use client';

import { useState } from 'react';

export default function PrerequisiteBadge({
  lockStatus,
  compact = false,
  interactive = true,
}) {
  const [showPopover, setShowPopover] = useState(false);

  if (!lockStatus || lockStatus.totalCount === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
        <span>✓</span>
        <span>前提条件なし</span>
      </span>
    );
  }

  const { isUnlocked, readinessPercent, stableCount, totalCount, prerequisites = [], thresholdDays = 7 } = lockStatus;

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={(e) => {
          if (interactive) {
            e.stopPropagation();
            setShowPopover(!showPopover);
          }
        }}
        className={`inline-flex items-center gap-1.5 rounded-full font-black transition-all ${
          compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } ${
          isUnlocked
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
            : readinessPercent > 0
            ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
            : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
        }`}
        title="クリックして前提単語の習得状況を確認"
      >
        <span>{isUnlocked ? '✓' : '🔒'}</span>
        <span>
          {isUnlocked
            ? '前提単語クリア'
            : `${readinessPercent}% (${stableCount}/${totalCount})`}
        </span>
      </button>

      {/* Popover / Tooltip displaying Prerequisite Breakdown */}
      {showPopover && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 bottom-full mb-2 left-0 w-64 p-3 bg-white rounded-2xl border border-slate-200 shadow-xl text-left text-xs space-y-2.5 animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="font-extrabold text-slate-900 flex items-center gap-1.5 text-[11px]">
              <span>{isUnlocked ? '🔓' : '🔒'}</span>
              <span>前提語彙ステータス</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              目標: {thresholdDays}日以上の間隔
            </span>
          </div>

          <div className="space-y-1.5">
            {prerequisites.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px]"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-japanese font-bold text-slate-900">{p.kanji}</span>
                    {p.reading && <span className="text-[10px] text-slate-500 font-japanese">({p.reading})</span>}
                  </div>
                  {p.meaning && <p className="text-[10px] text-slate-500 line-clamp-1 italic">{p.meaning}</p>}
                </div>

                <div className="text-right shrink-0">
                  {p.isStable ? (
                    <span className="font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded-md text-[10px]">
                      ✓ {p.currentInterval}日
                    </span>
                  ) : (
                    <span className="font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded-md text-[10px]">
                      {p.currentInterval}日 / {thresholdDays}日
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={() => setShowPopover(false)}
              className="text-[10px] text-slate-400 hover:text-slate-700 font-bold px-1.5 py-0.5"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

