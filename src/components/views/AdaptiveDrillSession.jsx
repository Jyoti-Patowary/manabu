'use client';

import { useState, useMemo, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { awardXp, XP_REWARDS } from '@/lib/accountEngine';

export default function AdaptiveDrillSession({
  cards = [],
  level = 'N5',
  onFinish,
  onBack,
}) {
  const { t } = useLanguage();
  const [filterType, setFilterType] = useState('all'); // 'all' | 'vocab' | 'kanji' | 'grammar'
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [results, setResults] = useState({ correct: 0, incorrect: 0, answers: [] });
  const [isFinished, setIsFinished] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  // Audio synthesis
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

  // Filter and prioritize weak/missed cards
  const prioritizedQueue = useMemo(() => {
    let pool = cards.filter((c) => {
      const type = c.content_type || c.type || 'vocab';
      if (filterType === 'all') return true;
      return type === filterType;
    });

    if (pool.length === 0) return [];

    // Score cards: lower easeFactor and interval 0 are prioritized first (weakest/missed)
    return [...pool].sort((a, b) => {
      const easeA = a.ease_factor || a.easeFactor || 2.5;
      const easeB = b.ease_factor || b.easeFactor || 2.5;
      const repsA = a.repetitions || 0;
      const repsB = b.repetitions || 0;

      // Missed/new first
      if (repsA === 0 && repsB > 0) return -1;
      if (repsB === 0 && repsA > 0) return 1;

      // Lower ease factor first
      return easeA - easeB;
    }).slice(0, 20); // Practice set of 20 cards
  }, [cards, filterType]);

  const currentCard = prioritizedQueue[currentIndex];
  const cardType = currentCard?.content_type || currentCard?.type || 'vocab';

  const handleAnswer = (isCorrect) => {
    const updatedCorrect = isCorrect ? results.correct + 1 : results.correct;
    const updatedIncorrect = !isCorrect ? results.incorrect + 1 : results.incorrect;

    const newResults = {
      correct: updatedCorrect,
      incorrect: updatedIncorrect,
      answers: [...results.answers, { card: currentCard, isCorrect }],
    };

    setResults(newResults);

    if (currentIndex + 1 < prioritizedQueue.length) {
      setCurrentIndex(currentIndex + 1);
      setIsRevealed(false);
    } else {
      // Finished drill!
      setIsFinished(true);
      const xpInfo = awardXp(XP_REWARDS.ADAPTIVE_DRILL, 'drill');
      setEarnedXp(XP_REWARDS.ADAPTIVE_DRILL);
    }
  };

  // Start Screen
  if (!isStarted) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl border border-[#E8E8E2] p-6 sm:p-10 shadow-xs space-y-6 animate-in fade-in duration-200 text-[#1A1A1A]">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#B45309] border border-amber-200 flex items-center justify-center text-2xl mx-auto shadow-2xs font-bold">
            🎯
          </div>
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-100 text-slate-700 inline-block">
            JLPT {level} · 弱点集中ドリル (Adaptive Drill)
          </span>
          <h2 className="text-2xl font-black font-serif-jp tracking-tight">
            ミス頻出カード優先特訓
          </h2>
          <p className="text-xs text-[#71717A] max-w-sm mx-auto leading-relaxed">
            過去に間違えたカードや容易度の低い項目を自動抽出し、高速で定着させます。（SRSの間隔計算には影響しません）
          </p>
        </div>

        {/* Filter Type Pills */}
        <div className="space-y-2">
          <label className="text-xs font-black text-[#71717A] uppercase tracking-wider block text-center">
            対象のコンテンツ種別
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'all', label: 'すべて (Mixed)' },
              { id: 'vocab', label: '語彙 (Vocab)' },
              { id: 'kanji', label: '漢字 (Kanji)' },
              { id: 'grammar', label: '文法 (Grammar)' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilterType(t.id)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-fast border cursor-pointer text-center ${
                  filterType === t.id
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-[#FAFAF7] text-[#71717A] border-[#E8E8E2] hover:bg-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drill Meta info */}
        <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#E8E8E2] flex items-center justify-between text-xs font-medium">
          <span className="text-[#71717A]">出題予定数:</span>
          <span className="font-bold text-[#1A1A1A]">{prioritizedQueue.length} 問</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1A1A1A] text-xs font-bold transition-fast cursor-pointer"
          >
            ← 戻る
          </button>
          <button
            type="button"
            disabled={prioritizedQueue.length === 0}
            onClick={() => setIsStarted(true)}
            className="flex-2 py-3 rounded-xl bg-[#1A1A1A] hover:bg-[#D94826] text-white text-xs font-bold transition-fast shadow-xs cursor-pointer disabled:opacity-50"
          >
            ドリルを開始する ({prioritizedQueue.length}問) →
          </button>
        </div>
      </div>
    );
  }

  // Summary / Finished Screen
  if (isFinished) {
    const accuracy = prioritizedQueue.length > 0 ? Math.round((results.correct / prioritizedQueue.length) * 100) : 0;
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#E8E8E2] p-8 shadow-sm text-center space-y-6 animate-in zoom-in-95 duration-200 text-[#1A1A1A]">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#15803D] border border-emerald-200 flex items-center justify-center text-3xl mx-auto shadow-xs font-bold">
          🎉
        </div>

        <div className="space-y-1">
          <span className="text-xs font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
            Drill Completed
          </span>
          <h2 className="text-2xl font-black font-serif-jp">
            特訓ドリル完了！
          </h2>
          <p className="text-xs text-[#71717A]">
            集中特訓お疲れ様でした。弱点の補強が進んでいます。
          </p>
        </div>

        {/* Results Metrics */}
        <div className="grid grid-cols-3 gap-2 p-4 rounded-2xl bg-[#FAFAF7] border border-[#E8E8E2]">
          <div>
            <span className="text-[10px] text-[#71717A] block">正解数</span>
            <span className="text-xl font-black text-[#15803D]">{results.correct}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#71717A] block">誤答数</span>
            <span className="text-xl font-black text-rose-600">{results.incorrect}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#71717A] block">正答率</span>
            <span className="text-xl font-black text-[#1A1A1A]">{accuracy}%</span>
          </div>
        </div>

        {/* XP Rewarded Callout */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-[#B45309] flex items-center justify-center gap-2">
          <span>⚡ 獲得XP:</span>
          <span className="text-sm font-black">+{earnedXp} XP</span>
        </div>

        <button
          type="button"
          onClick={onFinish || onBack}
          className="w-full py-3 rounded-xl bg-[#1A1A1A] hover:bg-[#D94826] text-white text-xs font-bold transition-fast shadow-xs cursor-pointer"
        >
          学習ハブに戻る
        </button>
      </div>
    );
  }

  // Active Flashcard Drill
  return (
    <div className="max-w-xl mx-auto space-y-4 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex items-center justify-between text-xs text-[#71717A]">
        <button
          type="button"
          onClick={onBack}
          className="hover:text-[#1A1A1A] font-bold"
        >
          ✕ ドリル中断
        </button>

        <span className="font-mono font-bold text-[#1A1A1A]">
          {currentIndex + 1} / {prioritizedQueue.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-[#E8E8E2] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1A1A1A] transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / prioritizedQueue.length) * 100}%` }}
        />
      </div>

      {/* Drill Card */}
      <div
        onClick={() => !isRevealed && setIsRevealed(true)}
        className="bg-white rounded-3xl border border-[#E8E8E2] p-8 sm:p-12 shadow-sm text-center flex flex-col justify-between min-h-[360px] cursor-pointer relative hover:border-[#D4D4D0] transition-fast"
      >
        <div className="flex items-center justify-between w-full">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-100 text-slate-700">
            {cardType}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              speak(currentCard.kanji || currentCard.grammar || currentCard.reading);
            }}
            className="text-slate-400 hover:text-[#1A1A1A]"
          >
            🔊
          </button>
        </div>

        {/* Prompt */}
        <div className="py-6 space-y-3">
          <h1 className="text-4xl sm:text-5xl font-black font-serif-jp text-[#1A1A1A]">
            {currentCard.kanji || currentCard.grammar || currentCard.reading}
          </h1>

          {isRevealed && (
            <div className="space-y-2 animate-in fade-in duration-150 border-t border-[#E8E8E2] pt-4">
              {currentCard.reading && currentCard.reading !== currentCard.kanji && (
                <p className="text-lg font-bold text-[#71717A] font-serif-jp">
                  {currentCard.reading}
                </p>
              )}
              <p className="text-base font-bold text-[#1A1A1A]">
                {currentCard.meaning}
              </p>
              {currentCard.example && (
                <p className="text-xs text-[#71717A] italic font-serif-jp pt-1">
                  "{currentCard.example}"
                </p>
              )}
            </div>
          )}
        </div>

        <div className="text-xs text-[#A1A1AA]">
          {!isRevealed ? 'タップして正解を表示' : '自己採点を選択してください'}
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div>
        {isRevealed ? (
          <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-150">
            <button
              type="button"
              onClick={() => handleAnswer(false)}
              className="py-3 rounded-2xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-black text-xs transition-fast cursor-pointer"
            >
              ✕ 不正解 / もう一度
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(true)}
              className="py-3 rounded-2xl bg-[#1A1A1A] hover:bg-[#D94826] text-white font-black text-xs transition-fast shadow-xs cursor-pointer"
            >
              ✓ 正解 (覚えた)
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsRevealed(true)}
            className="w-full py-3.5 rounded-2xl bg-[#1A1A1A] hover:bg-[#27272A] text-white text-xs font-bold transition-fast shadow-xs cursor-pointer"
          >
            答えを見る (Reveal Answer)
          </button>
        )}
      </div>
    </div>
  );
}

