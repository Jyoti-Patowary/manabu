'use client';

import { useState, useCallback } from 'react';
import KanjiCanvas from '@/components/KanjiCanvas';
import { useLanguage } from '@/context/LanguageContext';

export default function KanjiLessonModal({
  kanjiItem,
  level = 'N5',
  onClose,
  onStartDrill,
  onViewGraph,
}) {
  const { t } = useLanguage();

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

  if (!kanjiItem) return null;

  const char = kanjiItem.kanji || '';
  const strokeCount = kanjiItem.stroke_count || kanjiItem.strokes || 0;
  const meaningsText = Array.isArray(kanjiItem.meanings) ? kanjiItem.meanings.join(', ') : (kanjiItem.meaning || '');
  const onyomi = Array.isArray(kanjiItem.on_readings) ? kanjiItem.on_readings : (kanjiItem.onyomi ? kanjiItem.onyomi.split(/[、,]/) : []);
  const kunyomi = Array.isArray(kanjiItem.kun_readings) ? kanjiItem.kun_readings : (kanjiItem.kunyomi ? kanjiItem.kunyomi.split(/[、,]/) : []);

  // Common sample compounds for this kanji
  const compounds = Array.isArray(kanjiItem.compounds) ? kanjiItem.compounds : [
    { word: `${char}生`, reading: 'せい', meaning: 'life, birth, student' },
    { word: `${char}物`, reading: 'もの', meaning: 'thing, entity' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FFFFFF] rounded-3xl border border-[#E8E8E2] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150 text-[#1A1A1A]"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E8E8E2] pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FAFAF7] border border-[#E8E8E2] flex items-center justify-center text-4xl font-serif-jp font-black text-[#1A1A1A] shadow-xs">
              {char}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-50 text-[#B45309] border border-amber-200">
                  JLPT {level} · 漢字レッスン
                </span>
                <span className="text-xs font-semibold text-[#71717A]">
                  {strokeCount} 画
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-serif-jp tracking-tight text-[#1A1A1A]">
                {meaningsText}
              </h2>
              {kanjiItem.heisig_en && (
                <p className="text-xs text-[#71717A]">
                  Heisig: <strong className="text-[#1A1A1A]">{kanjiItem.heisig_en}</strong>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => speak(char)}
              className="p-2.5 rounded-xl bg-[#FAFAF7] hover:bg-amber-50 text-[#71717A] hover:text-[#B45309] border border-[#E8E8E2] transition-fast cursor-pointer"
              title="発音を再生"
            >
              🔊
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#F5F5F0] hover:bg-[#E8E8E2] text-[#71717A] flex items-center justify-center text-sm font-bold transition-fast cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Readings Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#E8E8E2] space-y-1">
            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">
              音読み (Onyomi - Chinese Reading)
            </span>
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {onyomi.length > 0 ? (
                onyomi.map((on, idx) => (
                  <span
                    key={idx}
                    onClick={() => speak(on.trim())}
                    className="px-2 py-1 rounded-lg bg-white border border-[#E8E8E2] font-serif-jp font-bold text-[#1A1A1A] cursor-pointer hover:border-[#B45309]"
                  >
                    {on.trim()}
                  </span>
                ))
              ) : (
                <span className="text-[#A1A1AA]">—</span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#E8E8E2] space-y-1">
            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">
              訓読み (Kunyomi - Japanese Reading)
            </span>
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {kunyomi.length > 0 ? (
                kunyomi.map((kun, idx) => (
                  <span
                    key={idx}
                    onClick={() => speak(kun.trim())}
                    className="px-2 py-1 rounded-lg bg-white border border-[#E8E8E2] font-serif-jp font-bold text-[#1A1A1A] cursor-pointer hover:border-[#B45309]"
                  >
                    {kun.trim()}
                  </span>
                ))
              ) : (
                <span className="text-[#A1A1AA]">—</span>
              )}
            </div>
          </div>
        </div>

        {/* Stroke Order Practice Canvas */}
        <div className="p-4 rounded-3xl bg-[#FAFAF7] border border-[#E8E8E2] flex flex-col items-center space-y-3">
          <div className="flex items-center justify-between w-full text-xs font-bold text-[#71717A]">
            <span>筆順キャンバス (KanjiVG Stroke Order)</span>
            <span className="text-[11px] text-[#A1A1AA]">ガイドに沿って正しく書いてみましょう</span>
          </div>

          <KanjiCanvas
            key={`lesson-${char}`}
            targetKanji={char}
            expectedStrokes={strokeCount}
            size={220}
            showGhostDefault={true}
          />
        </div>

        {/* Example Compounds (熟語) */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
            <span>📚</span>
            <span>代表的な熟語 (Compound Vocabulary)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {compounds.map((cmp, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white border border-[#E8E8E2] flex items-center justify-between hover:border-[#B45309]/50 transition-fast"
              >
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif-jp font-black text-sm text-[#1A1A1A]">{cmp.word}</span>
                    <span className="text-[11px] text-[#71717A] font-serif-jp">{cmp.reading}</span>
                  </div>
                  <p className="text-[11px] text-[#71717A] truncate max-w-[180px]">{cmp.meaning}</p>
                </div>
                <button
                  type="button"
                  onClick={() => speak(cmp.word)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#1A1A1A] transition-colors"
                >
                  🔊
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E8E8E2]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#71717A] hover:text-[#1A1A1A] transition-fast cursor-pointer"
            >
              閉じる
            </button>
            {onViewGraph && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewGraph(char);
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-[#1E40AF] hover:bg-blue-50 transition-fast cursor-pointer"
              >
                相関図を見る →
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onStartDrill) onStartDrill(kanjiItem);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#D94826] text-white text-xs font-bold transition-fast shadow-xs cursor-pointer"
          >
            <span>🎯 この漢字をドリル練習</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

