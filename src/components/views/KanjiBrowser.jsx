'use client';

import { useState, useMemo, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { getKanjiByLevel, searchKanji, createKanjiCard, JLPT_KANJI_LEVELS, KANJI_COUNT_BY_LEVEL } from '@/lib/kanjiData';
import KanjiCanvas from '@/components/KanjiCanvas';

export default function KanjiBrowser({ onStudyKanji, onViewGraph, initialLevel = 'N5' }) {
  const { t } = useLanguage();
  const [level, setLevel] = useState(initialLevel);
  const [search, setSearch] = useState('');
  const [selectedKanji, setSelectedKanji] = useState(null);
  const [activeSound, setActiveSound] = useState(null);

  const speak = useCallback((text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
      setActiveSound(text);
      setTimeout(() => setActiveSound(null), 500);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const kanjiList = useMemo(() => {
    if (search.trim()) {
      return searchKanji(search, level);
    }
    return getKanjiByLevel(level);
  }, [level, search]);

  const handleStudyLevel = (mode = 'writing') => {
    if (!onStudyKanji) return;
    const cards = getKanjiByLevel(level).map((item) => createKanjiCard(item, level));
    onStudyKanji(
      {
        id: `kanji-${level.toLowerCase()}-deck`,
        name: `JLPT ${level} Kanji (${cards.length}字)`,
        cards,
      },
      mode
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Level Selector */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-700 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider mb-1">
              <span>漢</span>
              <span>JLPT N5〜N1 常用漢字ライブラリ (Kanji Module)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              JLPT 漢字・書取練習 (Kanji Writing & SRS)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              筆順ガイド付きキャンバスで書取練習。SRSフラッシュカードで復習可能。
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleStudyLevel('writing')}
              className="inline-flex items-center gap-1.5 bg-violet-700 hover:bg-violet-800 text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <span>✍️ {level} 書取モードで練習</span>
              <span>→</span>
            </button>
            <button
              type="button"
              onClick={() => handleStudyLevel('recognition')}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <span>👁️ 認識モード</span>
            </button>
          </div>
        </div>

        {/* Level Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Level Tabs */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 gap-1 overflow-x-auto max-w-full">
            {JLPT_KANJI_LEVELS.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setLevel(lvl);
                  setSelectedKanji(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all whitespace-nowrap cursor-pointer ${
                  level === lvl
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {lvl}
                <span className="text-[10px] font-normal opacity-60 ml-1">
                  ({KANJI_COUNT_BY_LEVEL[lvl]})
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="意味・漢字・読みを検索..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-violet-500 font-medium"
            />
            <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
          </div>
        </div>
      </div>

      {/* Main Grid & Practice Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Kanji Cards Grid (2 cols on desktop) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs font-bold text-slate-500">
            <span>
              {level} 漢字一覧 ({kanjiList.length}字)
            </span>
            <span className="text-[11px] text-slate-400">
              タップして右側で書取練習
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-[640px] overflow-y-auto pr-1">
            {kanjiList.map((item) => {
              const isSelected = selectedKanji?.kanji === item.kanji;
              return (
                <button
                  key={`${item.kanji}-${item.unicode}`}
                  type="button"
                  onClick={() => {
                    setSelectedKanji(item);
                    speak(item.kanji);
                  }}
                  className={`group relative rounded-2xl border p-2.5 flex flex-col items-center justify-between text-center transition-all cursor-pointer select-none active:scale-95 ${
                    isSelected
                      ? 'bg-violet-50 border-violet-500 ring-2 ring-violet-400 shadow-md'
                      : 'bg-slate-50/50 hover:bg-white border-slate-200/80 hover:border-violet-300 hover:shadow-xs'
                  }`}
                >
                  {/* Stroke Count Badge */}
                  <span className="absolute top-1 right-1 text-[9px] font-bold text-slate-400 bg-white px-1 py-0.5 rounded-md border border-slate-200/60">
                    {item.stroke_count}画
                  </span>

                  {/* Character */}
                  <span className="text-3xl font-black font-japanese text-slate-900 group-hover:text-violet-700 transition-colors my-1">
                    {item.kanji}
                  </span>

                  {/* Primary Meaning */}
                  <span className="text-[10px] font-bold text-slate-500 truncate w-full group-hover:text-slate-900">
                    {Array.isArray(item.meanings) ? item.meanings[0] : item.meaning}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Kanji Calligraphy Practice Drawer */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4 lg:sticky lg:top-4">
          {selectedKanji ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black font-japanese text-slate-950">
                    {selectedKanji.kanji}
                  </span>
                  <div>
                    <span className="text-xs font-black text-violet-700 uppercase block">
                      JLPT {level}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                      {selectedKanji.stroke_count} 画
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => speak(selectedKanji.kanji)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-violet-50 hover:text-violet-700 text-slate-700 flex items-center justify-center text-lg transition-colors cursor-pointer"
                  title="発音を聴く"
                >
                  🔊
                </button>
              </div>

              {/* Meanings & Readings Details */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">意味 (Meanings)</span>
                  <p className="font-bold text-slate-900 leading-snug">
                    {Array.isArray(selectedKanji.meanings) ? selectedKanji.meanings.join(', ') : selectedKanji.meaning}
                  </p>
                </div>

                {selectedKanji.on_readings?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5">音読み (Onyomi)</span>
                    <p className="font-bold text-slate-800 font-japanese">
                      {selectedKanji.on_readings.join('、')}
                    </p>
                  </div>
                )}

                {selectedKanji.kun_readings?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5">訓読み (Kunyomi)</span>
                    <p className="font-bold text-slate-800 font-japanese">
                      {selectedKanji.kun_readings.join('、')}
                    </p>
                  </div>
                )}

                {selectedKanji.heisig_en && (
                  <div className="pt-1 text-[11px] text-slate-500">
                    Heisig Keyword: <strong className="text-slate-800">{selectedKanji.heisig_en}</strong>
                  </div>
                )}

                {onViewGraph && (
                  <button
                    type="button"
                    onClick={() => onViewGraph(selectedKanji.kanji)}
                    className="w-full mt-2 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <span>🕸️</span>
                    <span>相関ネットワークを見る (Graph Web)</span>
                  </button>
                )}
              </div>

              {/* Calligraphy Practice Canvas */}
              <div className="pt-2 border-t border-slate-100 flex flex-col items-center">
                <span className="text-xs font-black text-slate-700 mb-2">
                  書取練習キャンバス (Stroke Pad)
                </span>
                <KanjiCanvas
                  key={`practice-${selectedKanji.kanji}`}
                  targetKanji={selectedKanji.kanji}
                  expectedStrokes={selectedKanji.stroke_count}
                  size={240}
                  showGhostDefault={true}
                />
              </div>
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center text-3xl mx-auto shadow-2xs font-japanese">
                字
              </div>
              <h3 className="text-base font-black text-slate-900">
                漢字を選択してください
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                左の一覧から漢字をタップすると、意味・読み・筆順ガイド付きの書取キャンバスが表示されます。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

