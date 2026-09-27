'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import PitchAccentDisplay from '../PitchAccentDisplay';
import KanjiCanvas from '../KanjiCanvas';
import LoanwordBadge from '../LoanwordBadge';
import { awardXp } from '@/lib/accountEngine';

export default function ReviewSessionView({
  queue = [],
  onFinish,
  onExit,
  onRecordResult,
}) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isWhyDrawerOpen, setIsWhyDrawerOpen] = useState(false);
  const [activeReviewMode, setActiveReviewMode] = useState('recognition'); // 'recognition' | 'production' | 'audio' | 'canvas'
  const [hankoAnimation, setHankoAnimation] = useState(null); // 'again' | 'good' | 'easy'
  const [sessionResults, setSessionResults] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Swipe gesture tracking
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const [swipeOffset, setSwipeOffset] = useState({ x: 0, y: 0 });

  const currentCard = queue[currentIndex] || null;

  // Sound pronunciation using Web Speech API
  const speakJapanese = (text) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error:', e);
    }
  };

  // Auto-play audio in audio-only mode
  useEffect(() => {
    if (!currentCard) return;
    if (activeReviewMode === 'audio') {
      const textToSpeak = currentCard.reading || currentCard.kanji || currentCard.name;
      speakJapanese(textToSpeak);
    }
  }, [currentIndex, activeReviewMode, currentCard]);

  // SM-2 Review Action
  const handleGrade = async (rating) => {
    if (!currentCard) return;

    let stamp = 'good';
    let isCorrect = true;
    if (rating === 1) {
      stamp = 'again';
      isCorrect = false;
    } else if (rating === 4) {
      stamp = 'easy';
    }

    setHankoAnimation(stamp);

    // Record session history
    const resultItem = {
      cardId: currentCard.id || currentCard._id,
      contentType: currentCard.content_type || currentCard.category || 'vocab',
      rating,
      isCorrect,
      name: currentCard.kanji || currentCard.name || currentCard.pattern,
    };
    const updatedResults = [...sessionResults, resultItem];
    setSessionResults(updatedResults);

    // Call external server action / persistent recorder
    if (onRecordResult) {
      try {
        await onRecordResult(currentCard, rating);
      } catch (e) {
        console.error('Failed to record review result:', e);
      }
    }

    setTimeout(() => {
      setHankoAnimation(null);
      setIsFlipped(false);
      setIsWhyDrawerOpen(false);
      setSwipeOffset({ x: 0, y: 0 });

      if (currentIndex + 1 < queue.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Session Complete
        awardXp(queue.length * 10, 'SRSセッション完了');
        setIsCompleted(true);
      }
    }, 180);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isCompleted) return;

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === '1') {
        e.preventDefault();
        handleGrade(1); // Again
      } else if (e.key === '2') {
        e.preventDefault();
        handleGrade(2); // Hard
      } else if (e.key === '3') {
        e.preventDefault();
        handleGrade(3); // Good
      } else if (e.key === '4') {
        e.preventDefault();
        handleGrade(4); // Easy
      } else if (e.key === 'Escape') {
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompleted, isFlipped, currentCard]);

  // Touch swipe handling
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    setSwipeOffset({ x: dx, y: dy });
  };

  const handleTouchEnd = () => {
    const dx = swipeOffset.x;
    const dy = swipeOffset.y;
    const threshold = 80;

    if (dx > threshold) {
      // Swipe Right -> Good
      handleGrade(3);
    } else if (dx < -threshold) {
      // Swipe Left -> Again
      handleGrade(1);
    } else if (dy < -threshold) {
      // Swipe Up -> Easy
      handleGrade(4);
    }

    setSwipeOffset({ x: 0, y: 0 });
  };

  // Calculate session summary statistics
  const summary = useMemo(() => {
    const total = sessionResults.length;
    if (total === 0) return { total: 0, accuracy: 0, xp: 0, breakdown: {} };
    const correctCount = sessionResults.filter(r => r.isCorrect).length;
    const accuracy = Math.round((correctCount / total) * 100);
    const breakdown = {};
    sessionResults.forEach(r => {
      const type = r.contentType || 'other';
      breakdown[type] = (breakdown[type] || 0) + 1;
    });
    return {
      total,
      accuracy,
      xp: total * 10,
      breakdown,
    };
  }, [sessionResults]);

  // 1. Post-Session Summary Screen
  if (isCompleted) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FBFBF9] text-[#18181B] flex flex-col items-center justify-center p-4 animate-fadeIn">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E5E5DF] p-6 sm:p-8 shadow-sm space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF1EE] text-[#D94826] font-black text-2xl flex items-center justify-center mx-auto">
            完
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#18181B] tracking-tight">
              {t('sessionFinishedTitle') || 'セッション完了！'}
            </h2>
            <p className="text-xs text-[#71717A]">
              {t('sessionFinishedDesc') || 'お疲れ様でした。記憶のインターバルが正常に更新されました。'}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 py-2">
            <div className="p-3 rounded-2xl border border-[#E5E5DF] bg-[#FBFBF9]">
              <div className="text-[10px] font-bold text-[#71717A]">{t('reviewedCount') || '復習枚数'}</div>
              <div className="text-2xl font-black text-[#18181B] mt-0.5">{summary.total}</div>
            </div>
            <div className="p-3 rounded-2xl border border-[#E5E5DF] bg-[#FBFBF9]">
              <div className="text-[10px] font-bold text-[#71717A]">{t('accuracyRate') || '正解率'}</div>
              <div className="text-2xl font-black text-[#15803D] mt-0.5">{summary.accuracy}%</div>
            </div>
            <div className="p-3 rounded-2xl border border-[#E5E5DF] bg-[#FBFBF9]">
              <div className="text-[10px] font-bold text-[#71717A]">{t('xpEarned') || '獲得XP'}</div>
              <div className="text-2xl font-black text-[#D94826] mt-0.5">+{summary.xp}</div>
            </div>
          </div>

          {/* Content Type Breakdown */}
          <div className="p-3.5 rounded-2xl bg-[#F4F4F0] text-xs text-[#71717A] space-y-1 text-left">
            <div className="font-bold text-[#18181B] text-[11px] uppercase tracking-wider mb-1">{t('breakdown') || '内訳'}</div>
            {Object.entries(summary.breakdown).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center text-[11px]">
                <span className="capitalize">{type}</span>
                <span className="font-bold text-[#18181B]">{count}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => onFinish?.()}
              className="w-full py-3.5 rounded-xl bg-[#D94826] text-white font-bold text-sm hover:bg-[#BF3B1C] transition-fast shadow-xs cursor-pointer"
            >
              {t('backToDashboard') || 'ダッシュボードへ戻る'}
            </button>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsCompleted(false);
                setSessionResults([]);
              }}
              className="w-full py-3 rounded-xl border border-[#E5E5DF] text-xs font-bold text-[#71717A] hover:bg-[#F4F4F0] hover:text-[#18181B] transition-fast cursor-pointer"
            >
              {t('reviewAgain') || 'もう一度復習する'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div className="space-y-3">
          <div className="text-xl font-bold">{t('allReviewsCompleted') || '復習カードがありません'}</div>
          <button onClick={onExit} className="px-4 py-2 bg-[#18181B] text-white rounded-xl text-xs font-bold cursor-pointer">
            {t('back') || '戻る'}
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex) / queue.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-[#FBFBF9] text-[#18181B] flex flex-col select-none overflow-hidden animate-fadeIn">
      {/* 1. Minimal Chrome Header: Exit Button + Hairline Session Progress */}
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-[#E5E5DF] bg-white/70 backdrop-blur-md">
        <button
          onClick={onExit}
          className="p-2 -ml-2 rounded-xl text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F0] transition-fast text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          title={t('pause') || '復習を中断して戻る (Esc)'}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
          <span className="hidden sm:inline">{t('pause') || '一時停止'}</span>
        </button>

        {/* Counter */}
        <div className="text-xs font-mono font-bold text-[#71717A]">
          {currentIndex + 1} / {queue.length}
        </div>

        {/* Review Mode Selector (Recognition, Production, Audio, Kanji Canvas) */}
        <div className="flex items-center gap-1 bg-[#F4F4F0] p-0.5 rounded-xl border border-[#E5E5DF]">
          <button
            onClick={() => setActiveReviewMode('recognition')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-fast ${
              activeReviewMode === 'recognition' ? 'bg-white text-[#18181B] shadow-2xs' : 'text-[#71717A]'
            }`}
          >
            {t('modeRecognition') || '認識'}
          </button>
          <button
            onClick={() => setActiveReviewMode('audio')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-fast ${
              activeReviewMode === 'audio' ? 'bg-white text-[#18181B] shadow-2xs' : 'text-[#71717A]'
            }`}
          >
            {t('modeAudio') || '聴解'}
          </button>
          {((currentCard.content_type || currentCard.category) === 'Kanji' || currentCard.strokes) && (
            <button
              onClick={() => setActiveReviewMode('canvas')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-fast ${
                activeReviewMode === 'canvas' ? 'bg-white text-[#18181B] shadow-2xs' : 'text-[#71717A]'
              }`}
            >
              {t('modeCanvas') || '手書き'}
            </button>
          )}
        </div>
      </div>

      {/* Hairline Session Progress Bar */}
      <div className="w-full h-1 bg-[#E5E5DF]">
        <div
          className="h-full bg-[#D94826] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 2. Main Full-Screen Single Card Arena */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative max-w-xl mx-auto w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Hanko Stamp Overlay Animation */}
        {hankoAnimation && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className={`hanko-stamp animate-hanko text-5xl px-8 py-3 bg-white/90 shadow-lg ${
              hankoAnimation === 'again' ? 'text-rose-600 border-rose-600' : 'text-[#15803D] border-[#15803D]'
            }`}>
              {hankoAnimation === 'again' ? '難' : hankoAnimation === 'easy' ? '易' : '良'}
            </div>
          </div>
        )}

        {/* The Card Surface */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            transform: `translate(${swipeOffset.x * 0.4}px, ${swipeOffset.y * 0.4}px) rotate(${swipeOffset.x * 0.05}deg)`,
            transition: swipeOffset.x === 0 ? 'transform 0.15s ease-out' : 'none',
          }}
          className="w-full min-h-[380px] sm:min-h-[420px] rounded-3xl border border-[#E5E5DF] bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between cursor-pointer relative overflow-hidden transition-fast hover:border-[#18181B]"
        >
          {/* Top Card Metadata */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-[#71717A] uppercase tracking-wider text-[11px] bg-[#F4F4F0] px-2 py-0.5 rounded-md">
                {currentCard.content_type || currentCard.category || 'vocab'}
              </span>
              <LoanwordBadge word={currentCard.kanji || currentCard.name || currentCard.reading} item={currentCard} />
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                speakJapanese(currentCard.reading || currentCard.kanji || currentCard.name);
              }}
              className="p-2 rounded-xl bg-[#F4F4F0] text-[#18181B] hover:bg-[#E5E5DF] transition-fast cursor-pointer"
              title="発音を再生"
            >
              🔊
            </button>
          </div>

          {/* Center Card Content */}
          <div className="my-auto text-center py-4 space-y-3">
            {activeReviewMode === 'canvas' ? (
              <div onClick={(e) => e.stopPropagation()} className="py-2">
                <KanjiCanvas kanji={currentCard.kanji || currentCard.name} />
              </div>
            ) : activeReviewMode === 'audio' && !isFlipped ? (
              <div className="py-8 space-y-2">
                <div className="text-4xl">🔊</div>
                <div className="text-xs text-[#71717A]">発音を聞いて意味を思い浮かべてください</div>
              </div>
            ) : (
              <>
                {/* Kanji / Word Prompt */}
                <div className="text-5xl sm:text-6xl font-black text-[#18181B] font-japanese tracking-tight">
                  {currentCard.kanji || currentCard.name || currentCard.pattern}
                </div>

                {/* Reading / Furigana */}
                {(isFlipped || activeReviewMode !== 'production') && currentCard.reading && (
                  <div className="text-base sm:text-lg font-bold text-[#71717A]">
                    {currentCard.reading}
                  </div>
                )}
              </>
            )}

            {/* Back of Card (Shown on flip) */}
            {isFlipped && (
              <div className="pt-4 border-t border-[#E5E5DF] space-y-3 animate-fadeIn">
                <div className="text-lg sm:text-xl font-black text-[#18181B]">
                  {currentCard.meaning || currentCard.english || currentCard.cue}
                </div>

                {/* Pitch Accent Contour (if vocab) */}
                <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
                  <PitchAccentDisplay
                    word={currentCard.kanji || currentCard.name}
                    reading={currentCard.reading}
                    accent={currentCard.pitch_accent}
                  />
                </div>

                {/* Example sentence */}
                {currentCard.example && (
                  <div className="p-3 rounded-xl bg-[#FBFBF9] border border-[#E5E5DF] text-xs text-[#71717A] text-left leading-relaxed">
                    <span className="font-bold text-[#18181B]">例文: </span>
                    {currentCard.example}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Flip / Status Hint */}
          <div className="pt-3 border-t border-[#F4F4F0] flex items-center justify-between text-[11px] text-[#A1A1AA]">
            <span>{isFlipped ? (t('selectRating') || '評価を選択') : (t('tapToReveal') || 'タップまたはスペースキーで裏面')}</span>
            <span className="hidden sm:inline">{t('keyboardShortcuts') || 'ショートカット: 1, 2, 3, 4'}</span>
          </div>
        </div>

        {/* Collapsed-by-Default "Why this card" SRS Drawer */}
        <div className="w-full mt-3">
          <button
            type="button"
            onClick={() => setIsWhyDrawerOpen(!isWhyDrawerOpen)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl border border-[#E5E5DF] bg-white text-[11px] font-bold text-[#71717A] hover:bg-[#F4F4F0] transition-fast cursor-pointer"
          >
            <span>ℹ️ {t('whyThisCard') || 'なぜこのカードが出題されたか (SM-2計算式)'}</span>
            <span className={`transition-transform duration-200 ${isWhyDrawerOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {isWhyDrawerOpen && (
            <div className="mt-1.5 p-3 rounded-2xl border border-[#E5E5DF] bg-white text-xs text-[#71717A] space-y-2 animate-fadeIn shadow-2xs">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-[#F4F4F0]">
                  <div className="text-[10px] text-[#A1A1AA]">{t('currentInterval') || '現在の間隔'}</div>
                  <div className="font-bold text-[#18181B] mt-0.5">{currentCard.interval || 0} {t('days') || '日'}</div>
                </div>
                <div className="p-2 rounded-lg bg-[#F4F4F0]">
                  <div className="text-[10px] text-[#A1A1AA]">{t('easeFactor') || '容易度 (Ease)'}</div>
                  <div className="font-bold text-[#18181B] mt-0.5">{(currentCard.ease_factor || 2.5).toFixed(2)}</div>
                </div>
                <div className="p-2 rounded-lg bg-[#F4F4F0]">
                  <div className="text-[10px] text-[#A1A1AA]">{t('repetitionCount') || '連続正解数'}</div>
                  <div className="font-bold text-[#18181B] mt-0.5">{currentCard.repetitions || 0}</div>
                </div>
              </div>
              <p className="text-[10px] text-[#A1A1AA] leading-relaxed">
                SuperMemo SM-2 Spaced Repetition Engine により、忘却曲線の臨界点に合わせて自動算出されています。
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Rating Bar (4 Grade Buttons: Again, Hard, Good, Easy) */}
      <div className="p-4 sm:p-6 border-t border-[#E5E5DF] bg-white">
        <div className="max-w-xl mx-auto grid grid-cols-4 gap-2 sm:gap-3">
          {/* 1. Again (難) */}
          <button
            onClick={() => handleGrade(1)}
            className="py-3 sm:py-3.5 rounded-2xl border border-rose-200 bg-rose-50/70 text-rose-700 font-bold hover:bg-rose-100 hover:border-rose-300 transition-fast active:scale-95 flex flex-col items-center justify-center cursor-pointer shadow-2xs"
          >
            <span className="text-xs sm:text-sm font-black">{t('againBtn') || 'もう一度'}</span>
            <span className="text-[10px] text-rose-500 font-mono mt-0.5">1 (Again)</span>
          </button>

          {/* 2. Hard */}
          <button
            onClick={() => handleGrade(2)}
            className="py-3 sm:py-3.5 rounded-2xl border border-amber-200 bg-amber-50/70 text-amber-700 font-bold hover:bg-amber-100 hover:border-amber-300 transition-fast active:scale-95 flex flex-col items-center justify-center cursor-pointer shadow-2xs"
          >
            <span className="text-xs sm:text-sm font-black">{t('hardBtn') || '難しい'}</span>
            <span className="text-[10px] text-amber-600 font-mono mt-0.5">2 (Hard)</span>
          </button>

          {/* 3. Good (良) */}
          <button
            onClick={() => handleGrade(3)}
            className="py-3 sm:py-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 text-emerald-700 font-bold hover:bg-emerald-100 hover:border-emerald-300 transition-fast active:scale-95 flex flex-col items-center justify-center cursor-pointer shadow-2xs"
          >
            <span className="text-xs sm:text-sm font-black">{t('goodBtn') || '正解'}</span>
            <span className="text-[10px] text-emerald-600 font-mono mt-0.5">3 (Good)</span>
          </button>

          {/* 4. Easy (易) */}
          <button
            onClick={() => handleGrade(4)}
            className="py-3 sm:py-3.5 rounded-2xl border border-sky-200 bg-sky-50/70 text-sky-700 font-bold hover:bg-sky-100 hover:border-sky-300 transition-fast active:scale-95 flex flex-col items-center justify-center cursor-pointer shadow-2xs"
          >
            <span className="text-xs sm:text-sm font-black">{t('easyBtn') || '簡単'}</span>
            <span className="text-[10px] text-sky-600 font-mono mt-0.5">4 (Easy)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

