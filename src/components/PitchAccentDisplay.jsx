'use client';

import { useMemo, useCallback } from 'react';
import { lookupPitchAccent } from '@/lib/pitchAccentData';

const PATTERN_COLORS = {
  '平板': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  '頭高': 'bg-rose-50 text-rose-800 border-rose-200',
  '中高': 'bg-indigo-50 text-indigo-800 border-indigo-200',
  '尾高': 'bg-amber-50 text-amber-800 border-amber-200',
};

export default function PitchAccentDisplay({
  word,
  reading,
  showContour = true,
  showBadge = true,
  showAudio = true,
  compact = false,
}) {
  const pitchData = useMemo(() => {
    return lookupPitchAccent(word, reading);
  }, [word, reading]);

  const speak = useCallback((text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const moras = pitchData?.moras || [];
  if (moras.length === 0) return null;

  // Extract short category name (e.g. "平板" from "平板 (Heiban)")
  const shortCategory = pitchData.typeName.split(' ')[0] || '平板';
  const badgeColor = PATTERN_COLORS[shortCategory] || 'bg-slate-50 text-slate-700 border-slate-200';

  // SVG dimensions for contour graph
  const moraSpacing = compact ? 26 : 34;
  const svgWidth = Math.max(80, moras.length * moraSpacing);
  const svgHeight = compact ? 30 : 36;
  const highY = compact ? 7 : 8;
  const lowY = compact ? 23 : 26;

  // Compute SVG polyline points
  const points = moras.map((m, idx) => {
    const x = idx * moraSpacing + moraSpacing / 2;
    const y = m.pitch === 'H' ? highY : lowY;
    return { x, y, pitch: m.pitch, mora: m.mora, isDrop: m.isDrop };
  });

  const pathD = points.length > 0
    ? points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '')
    : '';

  return (
    <div className="inline-flex flex-col gap-1.5 font-japanese select-none animate-in fade-in duration-200">
      {/* Top Row: Meta Pill & Pronounce Button */}
      <div className="flex items-center gap-2 flex-wrap">
        {showBadge && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border tracking-wider uppercase ${badgeColor}`}>
            [{pitchData.pattern}] {pitchData.typeName}
          </span>
        )}

        {showAudio && (
          <button
            type="button"
            onClick={() => speak(pitchData.reading || pitchData.word)}
            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 transition-all text-xs flex items-center gap-1 font-sans"
            title="発音を再生 (Native Audio)"
          >
            <span>🔊</span>
            <span className="text-[10px] font-bold hidden sm:inline">発音</span>
          </button>
        )}
      </div>

      {/* Overline & Downstep Display (Standard Japanese Typography) */}
      <div className="inline-flex items-center gap-0 pt-1">
        {moras.map((m, idx) => {
          const isHigh = m.pitch === 'H';
          const isDrop = m.isDrop;

          return (
            <div
              key={idx}
              className={`relative inline-flex flex-col items-center px-1.5 pt-1 transition-all ${
                compact ? 'text-sm' : 'text-base sm:text-lg'
              }`}
            >
              {/* Overline for High Pitch */}
              {isHigh && (
                <span className="absolute top-0 left-0 right-0 h-[2px] bg-indigo-600" />
              )}

              {/* Downstep Drop Notch (┐) at pitch drop point */}
              {isDrop && (
                <span className="absolute top-0 right-0 w-[2px] h-2 bg-indigo-600" />
              )}

              {/* Mora Character */}
              <span
                className={`font-black transition-colors ${
                  isHigh ? 'text-indigo-950' : 'text-slate-500'
                }`}
              >
                {m.mora}
              </span>

              {/* Sub-label for High/Low */}
              <span className={`text-[8px] font-bold ${isHigh ? 'text-indigo-600' : 'text-slate-400'}`}>
                {isHigh ? '高' : '低'}
              </span>
            </div>
          );
        })}
      </div>

      {/* SVG Contour Curve Graph (Visual Tone Pitch Wave) */}
      {showContour && moras.length > 1 && (
        <div className="pt-0.5">
          <svg
            width={svgWidth}
            height={svgHeight}
            className="overflow-visible"
          >
            {/* Guide Lines */}
            <line
              x1="0"
              y1={highY}
              x2={svgWidth}
              y2={highY}
              stroke="#E2E8F0"
              strokeDasharray="2 2"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1={lowY}
              x2={svgWidth}
              y2={lowY}
              stroke="#E2E8F0"
              strokeDasharray="2 2"
              strokeWidth="1"
            />

            {/* Connecting Pitch Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#4F46E5"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Mora Pitch Dots */}
            {points.map((pt, idx) => (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={pt.pitch === 'H' ? 4 : 3}
                  className={
                    pt.pitch === 'H'
                      ? 'fill-indigo-600 stroke-white stroke-2'
                      : 'fill-white stroke-slate-400 stroke-2'
                  }
                />
              </g>
            ))}
          </svg>
        </div>
      )}
    </div>
  );
}

