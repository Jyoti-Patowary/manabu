'use client';

import { useState, useCallback } from 'react';
import KanjiCanvas from '@/components/KanjiCanvas';
import { useLanguage } from '@/context/LanguageContext';
import { getKanjiCourseContexts } from '@/lib/kanjiContextualReadings';

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

  const char = kanjiItem.character || kanjiItem.kanji || '';
  const strokeCount = kanjiItem.strokeCount || kanjiItem.stroke_count || kanjiItem.strokes || 0;
  const meaningsText = Array.isArray(kanjiItem.meanings) ? kanjiItem.meanings.join(', ') : (kanjiItem.meaning || '');
  const onyomi = Array.isArray(kanjiItem.onyomi)
    ? kanjiItem.onyomi
    : Array.isArray(kanjiItem.on_readings)
    ? kanjiItem.on_readings
    : (kanjiItem.onyomi ? String(kanjiItem.onyomi).split(/[、,]/) : []);
  const kunyomi = Array.isArray(kanjiItem.kunyomi)
    ? kanjiItem.kunyomi
    : Array.isArray(kanjiItem.kun_readings)
    ? kanjiItem.kun_readings
    : (kanjiItem.kunyomi ? String(kanjiItem.kunyomi).split(/[、,]/) : []);

  // Course Contexts
  const contexts = (Array.isArray(kanjiItem.courseContexts) && kanjiItem.courseContexts.length > 0)
    ? kanjiItem.courseContexts
    : getKanjiCourseContexts(char);
  const primaryCtx = kanjiItem.currentContext || contexts[0];
  const primaryVocab = kanjiItem.primaryVocabulary || primaryCtx?.vocabulary || char;
  const lessonReading = kanjiItem.lessonReading || primaryCtx?.reading || (kunyomi?.[0]?.replace(/\./g, '') || onyomi?.[0] || '');
  const lessonRomaji = kanjiItem.lessonRomaji || primaryCtx?.romaji || '';
  const coreMeaning = kanjiItem.coreMeaning || primaryCtx?.meaning || (Array.isArray(kanjiItem.meanings) ? kanjiItem.meanings[0] : meaningsText);

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
            <div className="w-16 h-16 rounded-2xl bg-[#FFF8EE] border border-amber-200 flex items-center justify-center text-4xl sm:text-5xl font-serif-jp font-black text-amber-900 shadow-xs">
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
                {coreMeaning}
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
              onClick={() => speak(primaryVocab || char)}
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

        {/* Primary Course Context Section */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 uppercase tracking-wider">
            <span>コース内での学習語彙 (Course Vocabulary Context)</span>
            {primaryCtx?.lesson && (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-bold">
                Lesson {primaryCtx.lesson}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-3 flex-wrap">
            {primaryVocab && primaryVocab !== char && (
              <span className="text-xl sm:text-2xl font-serif-jp font-black text-[#1A1A1A]">
                {primaryVocab}
              </span>
            )}
            <div className="text-2xl sm:text-3xl font-japanese font-black text-amber-950 tracking-tight">
              {lessonReading}
            </div>
            {lessonRomaji && (
              <div className="text-xs font-mono font-bold text-amber-800 tracking-wider">
                {lessonRomaji}
              </div>
            )}
          </div>

          <div className="text-sm font-bold text-[#1A1A1A]">
            {coreMeaning}
          </div>

          {/* Multiple Contexts Across Lessons */}
          {contexts.length > 1 && (
            <div className="pt-2 border-t border-amber-200/60 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[10px] font-bold text-amber-800 uppercase">Also in:</span>
              {contexts
                .filter((c) => c.vocabulary !== primaryVocab)
                .slice(0, 4)
                .map((ctx, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-950 font-medium">
                    L{ctx.lesson}: <strong className="font-japanese font-bold">{ctx.vocabulary}</strong> ({ctx.reading})
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* Dictionary Reference Section (Secondary) */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">
            辞書リファレンス (Dictionary Reference)
          </div>
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
          {meaningsText && (
            <div className="text-[11px] text-[#71717A] px-1">
              Dictionary Meanings: <span className="text-[#1A1A1A] font-medium">{meaningsText}</span>
            </div>
          )}
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

