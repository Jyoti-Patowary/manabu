'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { updateCardProgress } from '@/app/actions';
import { useLanguage } from '@/context/LanguageContext';
import KanjiCanvas from '@/components/KanjiCanvas';
import GrammarCardView from '@/components/GrammarCardView';
import PitchAccentDisplay from '@/components/PitchAccentDisplay';
import LoanwordBadge from '@/components/LoanwordBadge';
import { recordReviewResult } from '@/lib/motivationEngine';

// Systematic content-type color tokens (Washi & Sumi system)
const CONTENT_BADGES = {
  kanji: { label: '漢字', bg: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]' },
  vocab: { label: '語彙', bg: 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]' },
  grammar: { label: '文法', bg: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]' },
  kana: { label: '五十音', bg: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]' },
};

const JLPT_BADGES = {
  N5: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  N4: 'bg-sky-50 text-sky-800 border-sky-200',
  N3: 'bg-amber-50 text-amber-800 border-amber-200',
  N2: 'bg-violet-50 text-violet-800 border-violet-200',
  N1: 'bg-rose-50 text-rose-800 border-rose-200',
};

export default function StudySession({
  queue,
  deckId,
  setView,
  initialReviewMode = 'recognition',
  userVocabCards = [],
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [studyQueue, setStudyQueue] = useState(queue);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewMode, setReviewMode] = useState(initialReviewMode);
  const [showRomaji, setShowRomaji] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [statsSummary, setStatsSummary] = useState({ again: 0, good: 0, easy: 0 });
  const [showWhyThisCard, setShowWhyThisCard] = useState(false);
  const [hankoFeedback, setHankoFeedback] = useState(null); // { text: '良'|'難'|'易', color: string }

  // Touch swipe gesture tracking
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const totalCardsInSession = queue.length;
  const currentCard = studyQueue[currentCardIndex];
  const cardType = currentCard?.content_type || currentCard?.type ||
    (currentCard?.grammar ? 'grammar' : (currentCard?.kanji && !currentCard?.reading ? 'kanji' : 'vocab'));
  const isKana = cardType === 'kana' || cardType === 'hiragana' || cardType === 'katakana';

  const badgeMeta = CONTENT_BADGES[isKana ? 'kana' : cardType] || CONTENT_BADGES.vocab;
  const jlptClass = JLPT_BADGES[currentCard?.jlpt_level || currentCard?.jlpt] || 'bg-slate-100 text-slate-700 border-slate-200';

  const speakJapanese = useCallback((text) => {
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
      console.error('TTS error:', e);
      setIsPlayingAudio(false);
    }
  }, []);

  // Auto-play audio when in Audio-only mode on a new card
  useEffect(() => {
    if (reviewMode === 'audio' && currentCard && !isFlipped) {
      const textToRead = currentCard?.character ||
        (cardType === 'grammar'
          ? (currentCard?.grammarExamples?.[0]?.japanese || currentCard?.example || currentCard?.grammar)
          : (currentCard?.kanji || currentCard?.reading || currentCard?.example || currentCard?.grammar));
      if (textToRead) {
        speakJapanese(textToRead);
      }
    }
  }, [currentCardIndex, reviewMode, isFlipped, currentCard, cardType, speakJapanese]);

  const handleReview = useCallback(async (rating) => {
    if (!currentCard) return;

    // Trigger brief Hanko stamp feedback
    const stampText = rating === 1 ? '難' : (rating === 2 ? '良' : '易');
    const stampColor = rating === 1 ? 'border-rose-600 text-rose-600' : (rating === 2 ? 'border-[#D94826] text-[#D94826]' : 'border-indigo-600 text-indigo-600');
    setHankoFeedback({ text: stampText, color: stampColor });
    setTimeout(() => setHankoFeedback(null), 250);

    setStatsSummary((prev) => ({
      again: rating === 1 ? prev.again + 1 : prev.again,
      good: rating === 2 ? prev.good + 1 : prev.good,
      easy: rating === 3 ? prev.easy + 1 : prev.easy,
    }));

    const targetDeckId = currentCard.deckId || (deckId === 'all-due' ? null : deckId);
    const isVirtual = !targetDeckId || String(targetDeckId).startsWith('kana-practice-') || (String(targetDeckId).includes('-group') && !currentCard.deckId);

    if (targetDeckId && !isVirtual) {
      const cardIdentifier = currentCard.id || currentCard._id;
      updateCardProgress(targetDeckId, cardIdentifier, rating).catch((e) => {
        console.error('Failed to update card progress:', e);
      });
    }

    // Record review rating into motivation engine quality history
    try {
      const stored = JSON.parse(localStorage.getItem('manabu_review_history') || '[]');
      const updated = recordReviewResult(stored, rating);
      localStorage.setItem('manabu_review_history', JSON.stringify(updated));
      window.dispatchEvent(new Event('manabu-review-recorded'));
    } catch (e) {
      console.error('Failed to log review to motivation history:', e);
    }

    let updatedQueue = [...studyQueue];
    if (rating === 1) {
      updatedQueue.push(currentCard);
    }

    // Reset card drag position
    setDragOffset({ x: 0, y: 0 });

    if (currentCardIndex + 1 < updatedQueue.length) {
      setStudyQueue(updatedQueue);
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      setShowWhyThisCard(false);
    } else {
      setStudyQueue([]);
    }
  }, [currentCard, currentCardIndex, deckId, studyQueue]);

  // Touch Swipe Handlers (Mobile-First)
  const handleTouchStart = (e) => {
    if (reviewMode === 'writing') return; // Canvas handles its own touches
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || reviewMode === 'writing') return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    setDragOffset({ x: dx, y: dy });
  };

  const handleTouchEnd = () => {
    if (!isDragging || reviewMode === 'writing') return;
    setIsDragging(false);

    const { x, y } = dragOffset;
    const absX = Math.abs(x);
    const absY = Math.abs(y);

    // If flipped, swipes grade the card
    if (isFlipped) {
      if (absX > 60 && absX > absY) {
        if (x > 0) {
          handleReview(2); // Swipe right = Good
        } else {
          handleReview(1); // Swipe left = Again
        }
        return;
      } else if (y < -60 && absY > absX) {
        handleReview(3); // Swipe up = Easy
        return;
      }
    } else {
      // If front of card and tapped/swiped lightly, flip it
      if (absX < 15 && absY < 15) {
        setIsFlipped(true);
      }
    }

    // Animate back to center if threshold wasn't met
    setDragOffset({ x: 0, y: 0 });
  };

  // Keyboard navigation for desktop studying
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === '1') {
        if (isFlipped) handleReview(1);
      } else if (e.key === '2') {
        if (isFlipped) handleReview(2);
      } else if (e.key === '3') {
        if (isFlipped) handleReview(3);
      } else if (e.key === 'r' || e.key === 'R' || e.key === 'a' || e.key === 'A') {
        const textToRead = currentCard?.character || currentCard?.example || currentCard?.kanji || currentCard?.reading || currentCard?.grammar;
        if (textToRead) speakJapanese(textToRead);
      } else if (e.key === 'm' || e.key === 'M') {
        setReviewMode((prev) => {
          if (prev === 'recognition') return 'production';
          if (prev === 'production') return 'writing';
          if (prev === 'writing') return 'audio';
          return 'recognition';
        });
      } else if (e.key === 'Escape') {
        setView('dashboard');
        router.refresh();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleReview, currentCard, speakJapanese, setView, router]);

  // Session-length progress calculation
  const completedCount = totalCardsInSession - (studyQueue.length - currentCardIndex);
  const sessionProgressPercent = totalCardsInSession > 0
    ? Math.min(100, Math.round(((completedCount) / totalCardsInSession) * 100))
    : 0;

  // Session Completed Screen
  if (studyQueue.length === 0 || !currentCard) {
    const totalReviews = statsSummary.again + statsSummary.good + statsSummary.easy;
    const accuracy = totalReviews > 0 ? Math.round(((statsSummary.good + statsSummary.easy) / totalReviews) * 100) : 100;

    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-[#FFFFFF] rounded-3xl border border-[#E8E8E2] p-8 sm:p-12 text-center shadow-xs space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-[#FFF1EE] text-[#D94826] border border-[#FECDCA] flex items-center justify-center text-2xl font-black mx-auto">
            ✓
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight font-japanese">
              {t('sessionCompletedTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed">
              {t('sessionCompletedDesc')}
            </p>
          </div>

          {/* Session Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-[#F5F5F0] p-4 rounded-2xl border border-[#E8E8E2]">
            <div>
              <div className="text-2xl font-black text-[#1A1A1A]">{totalReviews}</div>
              <div className="text-[10px] font-bold text-[#71717A] uppercase">{t('cards')}</div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#D94826]">{accuracy}%</div>
              <div className="text-[10px] font-bold text-[#71717A] uppercase">正答率</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-700">{statsSummary.good + statsSummary.easy}</div>
              <div className="text-[10px] font-bold text-[#71717A] uppercase">定着</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setView('dashboard');
              router.refresh();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#18181B] hover:bg-[#27272A] text-white font-bold text-sm transition-all shadow-xs cursor-pointer active:scale-98"
          >
            {t('backToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  // Active Card Swipe Transform Style
  const cardTransform = isDragging
    ? {
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.04}deg)`,
        transition: 'none',
      }
    : {
        transform: 'translate(0px, 0px) rotate(0deg)',
        transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
      };

  // Swipe Direction Indicator
  let swipeOverlay = null;
  if (isDragging && isFlipped) {
    if (dragOffset.x > 40) {
      swipeOverlay = (
        <div className="absolute inset-0 bg-emerald-500/10 border-2 border-emerald-500 rounded-3xl flex items-center justify-end pr-8 pointer-events-none z-20 animate-in fade-in duration-100">
          <span className="hanko-stamp px-3 py-2 text-2xl bg-white border-emerald-600 text-emerald-600">良 [Good]</span>
        </div>
      );
    } else if (dragOffset.x < -40) {
      swipeOverlay = (
        <div className="absolute inset-0 bg-rose-500/10 border-2 border-rose-500 rounded-3xl flex items-center justify-start pl-8 pointer-events-none z-20 animate-in fade-in duration-100">
          <span className="hanko-stamp px-3 py-2 text-2xl bg-white border-rose-600 text-rose-600">難 [Again]</span>
        </div>
      );
    } else if (dragOffset.y < -40) {
      swipeOverlay = (
        <div className="absolute inset-0 bg-indigo-500/10 border-2 border-indigo-500 rounded-3xl flex items-start justify-center pt-8 pointer-events-none z-20 animate-in fade-in duration-100">
          <span className="hanko-stamp px-3 py-2 text-2xl bg-white border-indigo-600 text-indigo-600">易 [Easy]</span>
        </div>
      );
    }
  }

  return (
    <div className="min-h-[92vh] flex flex-col justify-between max-w-2xl mx-auto w-full select-none py-2 sm:py-4 px-3 sm:px-4">
      {/* Top Thin Session Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#E8E8E2]">
        <div
          className="h-full bg-[#D94826] transition-all duration-200"
          style={{ width: `${sessionProgressPercent}%` }}
        />
      </div>

      {/* Top Header Controls (Minimal Chrome) */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E8E8E2]/80">
        {/* Session Count & Exit */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setView('dashboard');
              router.refresh();
            }}
            className="w-8 h-8 rounded-xl bg-white hover:bg-[#F5F5F0] border border-[#E8E8E2] text-[#71717A] hover:text-[#1A1A1A] flex items-center justify-center text-xs font-bold transition-fast cursor-pointer"
            title="セッションを終了して戻る (ESC)"
          >
            ✕
          </button>

          <span className="text-xs font-mono font-bold text-[#71717A]">
            <strong className="text-[#1A1A1A]">{currentCardIndex + 1}</strong> / {totalCardsInSession}
          </span>
        </div>

        {/* Study Mode Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <div className="inline-flex items-center bg-[#F5F5F0] p-0.5 rounded-xl border border-[#E8E8E2] text-xs">
            <button
              type="button"
              onClick={() => setReviewMode('recognition')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-fast text-[11px] cursor-pointer ${
                reviewMode === 'recognition'
                  ? 'bg-white text-[#1A1A1A] shadow-2xs'
                  : 'text-[#71717A] hover:text-[#1A1A1A]'
              }`}
              title="認識: 単語を見て意味を思い出す"
            >
              認識
            </button>
            <button
              type="button"
              onClick={() => setReviewMode('production')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-fast text-[11px] cursor-pointer ${
                reviewMode === 'production'
                  ? 'bg-white text-[#1A1A1A] shadow-2xs'
                  : 'text-[#71717A] hover:text-[#1A1A1A]'
              }`}
              title="想起: 意味から日本語を思い出す"
            >
              想起
            </button>
            {cardType === 'kanji' && (
              <button
                type="button"
                onClick={() => setReviewMode('writing')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-fast text-[11px] cursor-pointer ${
                  reviewMode === 'writing'
                    ? 'bg-white text-[#1A1A1A] shadow-2xs'
                    : 'text-[#71717A] hover:text-[#1A1A1A]'
                }`}
                title="書取: 筆順キャンバスで手書き練習"
              >
                書取
              </button>
            )}
            <button
              type="button"
              onClick={() => setReviewMode('audio')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-fast text-[11px] cursor-pointer ${
                reviewMode === 'audio'
                  ? 'bg-white text-[#1A1A1A] shadow-2xs'
                  : 'text-[#71717A] hover:text-[#1A1A1A]'
              }`}
              title="音声: 耳で聞いて思い出す"
            >
              音声
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowRomaji(!showRomaji)}
            className={`px-2 py-1 rounded-xl text-[11px] font-bold transition-fast border cursor-pointer ${
              showRomaji
                ? 'bg-[#18181B] text-white border-[#18181B]'
                : 'bg-white text-[#71717A] border-[#E8E8E2] hover:bg-[#F5F5F0]'
            }`}
          >
            Ro
          </button>
        </div>
      </div>

      {/* Main Flashcard Canvas (Direction A: The Zen Flashcard) */}
      <div className="relative my-4 flex-1 flex flex-col justify-center">
        {swipeOverlay}

        {/* Hanko Stamp Confirmation Pop Animation */}
        {hankoFeedback && (
          <div className="absolute right-6 top-6 z-30 pointer-events-none animate-hanko">
            <span className={`hanko-stamp px-3 py-1.5 text-2xl bg-white/95 shadow-md ${hankoFeedback.color}`}>
              {hankoFeedback.text}
            </span>
          </div>
        )}

        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => {
            if (!isDragging && reviewMode !== 'writing') {
              setIsFlipped(!isFlipped);
            }
          }}
          style={{ ...cardTransform, minHeight: '380px' }}
          className={`relative bg-[#FFFFFF] rounded-3xl border border-[#E8E8E2] p-6 sm:p-10 shadow-sm transition-fast flex flex-col justify-between cursor-pointer ${
            !isFlipped ? 'hover:border-[#D4D4D0]' : 'bg-[#FAFAF7]'
          }`}
        >
          {/* Card Top Meta Badges */}
          <div className="flex items-center justify-between gap-2 w-full mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black border ${badgeMeta.bg}`}>
                {badgeMeta.label}
              </span>
              {currentCard.jlpt && (
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-black border ${jlptClass}`}>
                  {currentCard.jlpt}
                </span>
              )}
              <LoanwordBadge word={currentCard.kanji || currentCard.character || currentCard.reading} item={currentCard} />
            </div>

            {currentCard.partOfSpeech && (
              <span className="text-[11px] font-semibold text-[#A1A1AA]">
                {currentCard.partOfSpeech}
              </span>
            )}
          </div>

          {/* Card Center Prompt / Answer */}
          <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
            {!isFlipped ? (
              /* FRONT OF CARD */
              reviewMode === 'writing' && cardType === 'kanji' ? (
                <div className="space-y-4 w-full" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs font-bold text-[#71717A]">
                    画数: {currentCard.strokes || currentCard.stroke_count} 画
                  </span>
                  <div className="flex justify-center py-2">
                    <KanjiCanvas
                      key={`canvas-${currentCard.id || currentCardIndex}`}
                      targetKanji={currentCard.kanji || currentCard.character}
                      expectedStrokes={Number(currentCard.strokes || currentCard.stroke_count || 0)}
                      size={220}
                    />
                  </div>
                  <p className="text-[11px] text-[#A1A1AA]">
                    文字を書いてからカードをタップして回答を確認
                  </p>
                </div>
              ) : reviewMode === 'production' ? (
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-[#1E40AF]">
                    想起プロンプト (Production)
                  </span>
                  <h1 className="text-4xl sm:text-5xl font-black text-[#1A1A1A] font-sans tracking-tight">
                    {currentCard.meaning || currentCard.romaji}
                  </h1>
                  <p className="text-xs text-[#A1A1AA]">
                    日本語の単語・読みを思い浮かべてください
                  </p>
                </div>
              ) : reviewMode === 'audio' ? (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const textToRead = currentCard?.character || currentCard?.kanji || currentCard?.reading;
                      if (textToRead) speakJapanese(textToRead);
                    }}
                    className="w-20 h-20 rounded-2xl bg-[#18181B] hover:bg-[#27272A] text-white flex items-center justify-center text-3xl shadow-sm transition-fast mx-auto cursor-pointer"
                  >
                    🔊
                  </button>
                  <p className="text-xs text-[#A1A1AA]">
                    音声を聴いて文字・意味を想起してください
                  </p>
                </div>
              ) : (
                /* Recognition Mode (Default) */
                <div className="space-y-2">
                  <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-[#1A1A1A] font-serif-jp tracking-tight">
                    {currentCard.kanji || currentCard.character || currentCard.reading || currentCard.grammar}
                  </h1>
                  {showRomaji && currentCard.romaji && (
                    <p className="text-xs text-[#A1A1AA] font-mono tracking-widest uppercase">
                      {currentCard.romaji}
                    </p>
                  )}
                </div>
              )
            ) : (
              /* BACK OF CARD */
              cardType === 'grammar' ? (
                <div className="w-full text-left" onClick={(e) => e.stopPropagation()}>
                  <GrammarCardView
                    card={currentCard}
                    isFlipped={true}
                    reviewMode={reviewMode}
                    onPlaySpeech={speakJapanese}
                    isPlayingAudio={isPlayingAudio}
                    userVocabCards={userVocabCards}
                    t={t}
                  />
                </div>
              ) : (
                <div className="w-full text-left space-y-4 animate-in fade-in duration-150">
                  <div className="border-b border-[#E8E8E2] pb-4 space-y-1">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <h2 className="text-4xl sm:text-5xl font-black text-[#1A1A1A] font-serif-jp">
                        {currentCard.kanji || currentCard.character || currentCard.reading}
                      </h2>
                      {currentCard.kanji && currentCard.reading && (
                        <span className="text-xl sm:text-2xl font-bold text-[#71717A] font-japanese">
                          {currentCard.reading}
                        </span>
                      )}
                    </div>

                    {showRomaji && currentCard.romaji && (
                      <p className="text-xs text-[#A1A1AA] font-mono uppercase">
                        {currentCard.romaji}
                      </p>
                    )}
                  </div>

                  {/* Primary Definition */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#A1A1AA] block">
                      意味 (Definition)
                    </span>
                    <p className="text-xl sm:text-2xl font-black text-[#D94826] leading-snug">
                      {currentCard.meaning}
                    </p>
                  </div>

                  {/* Japanese Pitch Accent Display */}
                  {cardType !== 'grammar' && cardType !== 'kanji' && (currentCard.reading || currentCard.kanji) && (
                    <div className="pt-2">
                      <PitchAccentDisplay
                        word={currentCard.kanji || currentCard.reading}
                        reading={currentCard.reading || currentCard.kanji}
                        showAudio={false}
                        compact={true}
                      />
                    </div>
                  )}

                  {/* Kanji On/Kun Readings if available */}
                  {(currentCard.onyomi || currentCard.kunyomi) && (
                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                      {currentCard.onyomi && (
                        <div className="p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E8E8E2]">
                          <span className="text-[10px] font-bold text-[#71717A] block">音読み (On)</span>
                          <span className="font-bold text-[#1A1A1A] font-japanese">{currentCard.onyomi}</span>
                        </div>
                      )}
                      {currentCard.kunyomi && (
                        <div className="p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E8E8E2]">
                          <span className="text-[10px] font-bold text-[#71717A] block">訓読み (Kun)</span>
                          <span className="font-bold text-[#1A1A1A] font-japanese">{currentCard.kunyomi}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          {/* Card Footer Hint */}
          <div className="w-full flex items-center justify-between text-xs text-[#A1A1AA] pt-4 border-t border-[#E8E8E2]/60">
            <span>
              {!isFlipped
                ? 'タップ または Space で裏返す'
                : '← スワイプ左(難) · スワイプ右(良) →'}
            </span>

            {/* Collapsed "Why this card" Drawer Trigger */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowWhyThisCard(!showWhyThisCard);
              }}
              className="font-bold text-[#71717A] hover:text-[#1A1A1A] flex items-center gap-1 transition-fast cursor-pointer"
            >
              <span>ℹ なぜ今出題？</span>
              <span className="text-[10px]">{showWhyThisCard ? '▲' : '▼'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible "Why this Card" Math Drawer */}
        {showWhyThisCard && (
          <div className="mt-3 p-4 bg-white rounded-2xl border border-[#E8E8E2] text-xs space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between border-b border-[#E8E8E2] pb-2">
              <span className="font-black text-[#1A1A1A]">SRS 忘却曲線パラメータ (SM-2 Algorithm)</span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                間隔: {currentCard.interval || 0}日
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-2 rounded-xl bg-[#F5F5F0]">
                <div className="text-[#71717A]">復習回数</div>
                <div className="font-black text-[#1A1A1A] text-sm">{currentCard.repetitions || 0}回</div>
              </div>
              <div className="p-2 rounded-xl bg-[#F5F5F0]">
                <div className="text-[#71717A]">容易度 (Ease)</div>
                <div className="font-black text-[#1A1A1A] text-sm">{(currentCard.ease_factor || currentCard.easeFactor || 2.5).toFixed(2)}</div>
              </div>
              <div className="p-2 rounded-xl bg-[#F5F5F0]">
                <div className="text-[#71717A]">次回出題目安</div>
                <div className="font-black text-[#D94826] text-sm">
                  {currentCard.interval ? `+${currentCard.interval}日` : '1日後'}
                </div>
              </div>
            </div>

            <p className="text-[10px] text-[#A1A1AA] leading-relaxed">
              科学的エビングハウス忘却曲線に基づき、直近の正答率と容易度係数から最適な復習間隔を算出しています。
            </p>
          </div>
        )}
      </div>

      {/* Bottom Rating Action Bar (Visible When Flipped) */}
      <div className="pt-2">
        {isFlipped ? (
          <div className="grid grid-cols-3 gap-3 animate-in fade-in duration-150">
            <button
              type="button"
              onClick={() => handleReview(1)}
              className="py-3 sm:py-3.5 rounded-2xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-black text-sm flex flex-col items-center justify-center transition-fast shadow-xs active:scale-98 cursor-pointer"
            >
              <span>{t('again')}</span>
              <span className="text-[10px] text-rose-500 font-mono font-medium">1日後 [1]</span>
            </button>

            <button
              type="button"
              onClick={() => handleReview(2)}
              className="py-3 sm:py-3.5 rounded-2xl bg-[#D94826] hover:bg-[#BF3B1C] text-white font-black text-sm flex flex-col items-center justify-center transition-fast shadow-xs active:scale-98 cursor-pointer"
            >
              <span>{t('good')}</span>
              <span className="text-[10px] text-white/80 font-mono font-medium">推奨 [2]</span>
            </button>

            <button
              type="button"
              onClick={() => handleReview(3)}
              className="py-3 sm:py-3.5 rounded-2xl bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 font-black text-sm flex flex-col items-center justify-center transition-fast shadow-xs active:scale-98 cursor-pointer"
            >
              <span>{t('easy')}</span>
              <span className="text-[10px] text-indigo-500 font-mono font-medium">長期 [3]</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsFlipped(true)}
            className="w-full py-3.5 rounded-2xl bg-[#18181B] hover:bg-[#27272A] text-white font-black text-sm transition-fast shadow-xs cursor-pointer active:scale-98"
          >
            {t('revealAnswer')} <span className="text-xs font-normal opacity-70 font-mono">[Space]</span>
          </button>
        )}
      </div>
    </div>
  );
}