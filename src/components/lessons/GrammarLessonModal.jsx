'use client';

import { useState, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function GrammarLessonModal({
  grammarPoint,
  onClose,
  onStartDrill,
}) {
  const { t } = useLanguage();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const speak = useCallback((text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error(e);
      setIsPlayingAudio(false);
    }
  }, []);

  if (!grammarPoint) return null;

  const examples = grammarPoint.grammarExamples || grammarPoint.examples || [
    {
      japanese: grammarPoint.example || '例文を準備中',
      reading: grammarPoint.exampleReading || '',
      english: grammarPoint.exampleMeaning || '',
    },
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
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-50 text-[#15803D] border border-emerald-200">
                JLPT {grammarPoint.level || grammarPoint.jlpt || 'N5'} · 文法レッスン
              </span>
              {grammarPoint.category && (
                <span className="text-xs font-semibold text-[#71717A]">
                  {grammarPoint.category}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-serif-jp tracking-tight text-[#1A1A1A]">
              {grammarPoint.grammar}
            </h2>
            <p className="text-sm font-medium text-[#71717A]">
              {grammarPoint.meaning}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F5F5F0] hover:bg-[#E8E8E2] text-[#71717A] flex items-center justify-center text-sm font-bold transition-fast cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Formation / Connection Rule */}
        <div className="bg-[#FAFAF7] rounded-2xl border border-[#E8E8E2] p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-black text-[#15803D] uppercase tracking-wider">
            <span>📐</span>
            <span>接続ルール (Grammar Structure & Formation)</span>
          </div>
          <p className="font-mono text-xs sm:text-sm font-bold text-[#1A1A1A] bg-white px-3 py-2 rounded-xl border border-[#E8E8E2] inline-block">
            {grammarPoint.formation || '接続規則: 基本形 / て形 + 文法パターン'}
          </p>
          {grammarPoint.usage && (
            <p className="text-xs text-[#71717A] pt-1">
              {grammarPoint.usage}
            </p>
          )}
        </div>

        {/* Example Sentences */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-[#71717A] uppercase tracking-wider flex items-center gap-2">
            <span>💬</span>
            <span>実用例文 (Example Sentences with Audio)</span>
          </h4>

          <div className="space-y-2.5">
            {examples.map((ex, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#E8E8E2] flex items-start justify-between gap-3 group hover:border-[#15803D]/40 transition-fast"
              >
                <div className="space-y-1 flex-1">
                  <p className="font-serif-jp text-base font-bold text-[#1A1A1A] leading-relaxed">
                    {ex.japanese}
                  </p>
                  {ex.reading && (
                    <p className="text-xs text-[#71717A] font-serif-jp">
                      {ex.reading}
                    </p>
                  )}
                  {ex.english && (
                    <p className="text-xs text-[#71717A] italic">
                      "{ex.english}"
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => speak(ex.japanese)}
                  className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-[#71717A] hover:text-[#15803D] border border-[#E8E8E2] transition-fast shrink-0 cursor-pointer"
                  title="音声を再生"
                >
                  🔊
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Common Confusion & Nuance Callout */}
        <div className="bg-[#FFF1EE] rounded-2xl border border-[#FECDCA] p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-black text-[#D94826] uppercase tracking-wider">
            <span>⚠️</span>
            <span>ニュアンス・注意点 (Common Confusion Notes)</span>
          </div>
          <p className="text-xs text-[#7A271A] leading-relaxed">
            {grammarPoint.commonMistake ||
              grammarPoint.nuanceNotes ||
              '類似の文法表現と混同しやすいため、話者の意志が含まれるか、単なる客観的条件かを見極めて使い分けましょう。'}
          </p>
          {grammarPoint.formalAlternative && (
            <p className="text-[11px] text-[#D94826] font-medium pt-0.5">
              改まった表現 (Formal alternative): <strong>{grammarPoint.formalAlternative}</strong>
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E8E8E2]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#71717A] hover:text-[#1A1A1A] transition-fast cursor-pointer"
          >
            閉じる
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onStartDrill) onStartDrill(grammarPoint);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#D94826] text-white text-xs font-bold transition-fast shadow-xs cursor-pointer"
          >
            <span>🎯 この文法をドリル練習</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

