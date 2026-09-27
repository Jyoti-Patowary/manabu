'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import PitchAccentDisplay from '../PitchAccentDisplay';
import KanjiCanvas from '../KanjiCanvas';
import { awardXp } from '@/lib/accountEngine';
import { generateClozePrompt } from '@/lib/grammarData';
import { getDefaultCollections } from '@/lib/defaultCollections';

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function DrillSessionView({
  cards = [],
  level = 'N5',
  allCards = [],
  onFinish,
  onExit,
  onRecordResult,
}) {
  const { t } = useLanguage();
  const [drillMode, setDrillMode] = useState('quiz'); // 'quiz' | 'flashcard'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'vocab' | 'kanji' | 'grammar'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false); // For flashcard mode
  const [selectedOption, setSelectedOption] = useState(null); // For quiz mode: selected option index
  const [answeredState, setAnsweredState] = useState(null); // 'correct' | 'incorrect' | null
  const [drillScore, setDrillScore] = useState({ correct: 0, total: 0 });
  const [missedCards, setMissedCards] = useState([]);
  const [isRetryingMissed, setIsRetryingMissed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hanko, setHanko] = useState(null);
  const [showCanvas, setShowCanvas] = useState(false);

  // Swipe gesture tracking for flashcard mode
  const touchStartRef = useRef({ x: 0, y: 0 });
  const [swipeOffset, setSwipeOffset] = useState({ x: 0, y: 0 });

  // Fallback candidate card pool for distractors
  const candidatePool = useMemo(() => {
    if (Array.isArray(allCards) && allCards.length > 20) {
      return allCards;
    }
    const defaultCols = getDefaultCollections();
    return defaultCols.flatMap(c => c.decks.flatMap(d => d.cards));
  }, [allCards]);

  // Filter cards and prioritize missed / low ease
  const baseQueue = useMemo(() => {
    let filtered = cards.length > 0 ? cards : candidatePool.filter(c => (c.jlpt_level || c.jlpt) === level);
    if (filterType !== 'all') {
      filtered = filtered.filter(c => {
        const type = (c.content_type || c.category || c.type || '').toLowerCase();
        return type.includes(filterType.toLowerCase());
      });
    }

    return [...filtered].sort((a, b) => {
      const easeA = a.ease_factor || a.easeFactor || 2.5;
      const easeB = b.ease_factor || b.easeFactor || 2.5;
      return easeA - easeB; // lowest ease first (most difficult)
    });
  }, [cards, candidatePool, filterType, level]);

  const [activeQueue, setActiveQueue] = useState(baseQueue);

  // Update active queue when baseQueue changes
  useEffect(() => {
    if (!isRetryingMissed) {
      setActiveQueue(baseQueue);
      setCurrentIndex(0);
      setSelectedOption(null);
      setAnsweredState(null);
    }
  }, [baseQueue, isRetryingMissed]);

  const currentCard = activeQueue[currentIndex] || null;

  // Speak Japanese audio pronunciation helper
  const speakJapanese = useCallback((text) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Generate dynamic, high-accuracy question & distractors for current card
  const quizQuestion = useMemo(() => {
    if (!currentCard) return null;

    const rawType = (currentCard.content_type || currentCard.category || currentCard.type || 'vocab').toLowerCase();
    const isGrammar = rawType.includes('grammar');
    const isKanji = rawType.includes('kanji');
    const isKana = rawType.includes('kana');

    // 1. GRAMMAR: Cloze fill-in-the-blank test
    if (isGrammar) {
      const cloze = generateClozePrompt(currentCard);
      const correctAnswer = currentCard.grammar || currentCard.pattern || currentCard.kanji || currentCard.name;
      
      const otherGrammar = candidatePool
        .filter(c => ((c.content_type || c.category || '').toLowerCase().includes('grammar')))
        .map(c => c.grammar || c.pattern || c.kanji || c.name)
        .filter(p => p && p !== correctAnswer);

      const fallbackGrammar = ['〜てしまう', '〜なければならない', '〜かもしれない', '〜たことがある', '〜てはいけない', '〜ようと思う'];
      const combinedPool = [...new Set([...otherGrammar, ...fallbackGrammar])].filter(p => p !== correctAnswer);
      const distractors = shuffleArray(combinedPool).slice(0, 3);
      const options = shuffleArray([correctAnswer, ...distractors]);

      return {
        type: 'grammar',
        prompt: t('selectGrammarPattern') || '文脈に合う文法パターンを選択してください',
        sentence: cloze?.clozeSentence || `【＿＿＿＿】 (${currentCard.meaning})`,
        hint: cloze?.english || currentCard.meaning,
        correctAnswer,
        options,
        explanation: currentCard.formation ? `${t('formationRule') || '接続'}: ${currentCard.formation}` : currentCard.usage,
      };
    }

    // 2. KANJI: Meaning or Reading test
    if (isKanji) {
      const char = currentCard.kanji || currentCard.name;
      // Alternate question between meaning and reading based on card index
      const testReading = currentIndex % 2 === 1 && (currentCard.onyomi || currentCard.kunyomi);

      if (testReading) {
        const correctAnswer = currentCard.onyomi || currentCard.kunyomi || currentCard.reading;
        const otherReadings = candidatePool
          .filter(c => (c.content_type || c.category || '').toLowerCase().includes('kanji'))
          .map(c => c.onyomi || c.kunyomi || c.reading)
          .filter(r => r && r !== correctAnswer);

        const fallbackReadings = ['ショク', 'セイ', 'コウ', 'ダイ', 'ガク', 'シン', 'スイ', 'モク'];
        const combined = [...new Set([...otherReadings, ...fallbackReadings])].filter(r => r !== correctAnswer);
        const distractors = shuffleArray(combined).slice(0, 3);
        const options = shuffleArray([correctAnswer, ...distractors]);

        return {
          type: 'kanji',
          prompt: `「${char}」の正しい読み（音/訓）を選択してください`,
          displayWord: char,
          subHint: currentCard.meaning || currentCard.english,
          correctAnswer,
          options,
          explanation: `${t('onyomi') || '音読み'}: ${currentCard.onyomi || '—'} / ${t('kunyomi') || '訓読み'}: ${currentCard.kunyomi || '—'}`,
        };
      } else {
        const correctAnswer = currentCard.meaning || currentCard.english || 'Kanji character';
        const otherMeanings = candidatePool
          .filter(c => (c.content_type || c.category || '').toLowerCase().includes('kanji'))
          .map(c => c.meaning || c.english)
          .filter(m => m && m !== correctAnswer);

        const fallbackMeanings = ['water', 'fire', 'person', 'tree', 'eat', 'read', 'walk', 'mountain'];
        const combined = [...new Set([...otherMeanings, ...fallbackMeanings])].filter(m => m !== correctAnswer);
        const distractors = shuffleArray(combined).slice(0, 3);
        const options = shuffleArray([correctAnswer, ...distractors]);

        return {
          type: 'kanji',
          prompt: `漢字「${char}」の正しい意味を選択してください`,
          displayWord: char,
          subHint: currentCard.onyomi || currentCard.kunyomi || currentCard.reading,
          correctAnswer,
          options,
          explanation: `${t('strokes') || '画数'}: ${currentCard.strokes || currentCard.stroke_count || '—'} 画 · ${currentCard.onyomi || ''} ${currentCard.kunyomi || ''}`,
        };
      }
    }

    // 3. KANA: Romaji reading test
    if (isKana) {
      const char = currentCard.kanji || currentCard.reading || currentCard.name;
      const correctAnswer = currentCard.romaji || currentCard.reading;
      const otherRomaji = candidatePool
        .filter(c => (c.content_type || c.category || '').toLowerCase().includes('kana'))
        .map(c => c.romaji || c.reading)
        .filter(r => r && r !== correctAnswer);

      const fallbackKana = ['a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa'];
      const combined = [...new Set([...otherRomaji, ...fallbackKana])].filter(r => r !== correctAnswer);
      const distractors = shuffleArray(combined).slice(0, 3);
      const options = shuffleArray([correctAnswer, ...distractors]);

      return {
        type: 'kana',
        prompt: `かな「${char}」の正しい読み（ローマ字）を選択してください`,
        displayWord: char,
        correctAnswer,
        options,
        explanation: `${char} (${correctAnswer})`,
      };
    }

    // 4. VOCABULARY: Reading test (if has kanji) or Meaning test
    const hasKanji = currentCard.kanji && currentCard.kanji !== currentCard.reading;
    const testReading = hasKanji && currentIndex % 2 === 0;

    if (testReading) {
      const correctAnswer = currentCard.reading;
      const otherReadings = candidatePool
        .filter(c => !(c.content_type || c.category || '').toLowerCase().includes('grammar'))
        .map(c => c.reading)
        .filter(r => r && r !== correctAnswer);

      const fallbackReadings = ['わたし', 'がくせい', 'せんせい', 'にほんご', 'ともだち', 'がっこう', 'べんきょう'];
      const combined = [...new Set([...otherReadings, ...fallbackReadings])].filter(r => r !== correctAnswer);
      const distractors = shuffleArray(combined).slice(0, 3);
      const options = shuffleArray([correctAnswer, ...distractors]);

      return {
        type: 'vocab',
        prompt: `「${currentCard.kanji}」の正しい読み方（ふりがな）は？`,
        displayWord: currentCard.kanji,
        subHint: currentCard.meaning || currentCard.english,
        correctAnswer,
        options,
        explanation: `${currentCard.kanji} 【${currentCard.reading}】 : ${currentCard.meaning || currentCard.english}`,
      };
    } else {
      const correctAnswer = currentCard.meaning || currentCard.english || 'word';
      const otherMeanings = candidatePool
        .filter(c => !(c.content_type || c.category || '').toLowerCase().includes('grammar'))
        .map(c => c.meaning || c.english)
        .filter(m => m && m !== correctAnswer);

      const fallbackMeanings = ['student', 'teacher', 'book', 'school', 'eat', 'friend', 'house', 'study'];
      const combined = [...new Set([...otherMeanings, ...fallbackMeanings])].filter(m => m !== correctAnswer);
      const distractors = shuffleArray(combined).slice(0, 3);
      const options = shuffleArray([correctAnswer, ...distractors]);

      return {
        type: 'vocab',
        prompt: `「${currentCard.kanji || currentCard.reading}」の日本語の意味は？`,
        displayWord: currentCard.kanji || currentCard.reading,
        subHint: currentCard.reading !== currentCard.kanji ? currentCard.reading : '',
        correctAnswer,
        options,
        explanation: `${currentCard.kanji || currentCard.reading} : ${correctAnswer}`,
      };
    }
  }, [currentCard, currentIndex, candidatePool, t]);

  // Handle quiz option selection
  const handleSelectQuizOption = (option, optIdx) => {
    if (answeredState !== null || !quizQuestion) return;

    setSelectedOption(optIdx);
    const isCorrect = option === quizQuestion.correctAnswer;
    setAnsweredState(isCorrect ? 'correct' : 'incorrect');
    setHanko(isCorrect ? 'good' : 'again');

    if (isCorrect) {
      speakJapanese(currentCard.reading || currentCard.kanji || currentCard.grammar || quizQuestion.correctAnswer);
      setDrillScore(prev => ({
        correct: prev.correct + 1,
        total: prev.total + 1,
      }));
      onRecordResult?.(currentCard, 4);
    } else {
      setDrillScore(prev => ({
        correct: prev.correct,
        total: prev.total + 1,
      }));
      setMissedCards(prev => [...prev, currentCard]);
      onRecordResult?.(currentCard, 1);
    }

    setTimeout(() => {
      setHanko(null);
    }, 600);
  };

  // Advance to next card in quiz mode
  const handleNextQuizQuestion = () => {
    setSelectedOption(null);
    setAnsweredState(null);
    setShowCanvas(false);

    if (currentIndex + 1 < activeQueue.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      awardXp(30, '弱点ドリル完了');
      setIsCompleted(true);
    }
  };

  // Flashcard mode answer handler (Again / Good)
  const handleFlashcardAnswer = (isCorrect) => {
    setHanko(isCorrect ? 'good' : 'again');
    setDrillScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    if (!isCorrect) {
      setMissedCards(prev => [...prev, currentCard]);
      onRecordResult?.(currentCard, 1);
    } else {
      onRecordResult?.(currentCard, 4);
    }

    setTimeout(() => {
      setHanko(null);
      setIsFlipped(false);
      setSwipeOffset({ x: 0, y: 0 });
      setShowCanvas(false);

      if (currentIndex + 1 < activeQueue.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        awardXp(25, 'ドリル完了');
        setIsCompleted(true);
      }
    }, 180);
  };

  // Restart drill with only missed cards
  const handleRetryMissedCards = () => {
    if (missedCards.length === 0) return;
    setActiveQueue(missedCards);
    setMissedCards([]);
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnsweredState(null);
    setIsCompleted(false);
    setIsRetryingMissed(true);
    setDrillScore({ correct: 0, total: 0 });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isCompleted) return;

      if (drillMode === 'quiz') {
        if (answeredState === null && quizQuestion) {
          if (['1', '2', '3', '4'].includes(e.key)) {
            const idx = parseInt(e.key, 10) - 1;
            if (quizQuestion.options[idx] !== undefined) {
              e.preventDefault();
              handleSelectQuizOption(quizQuestion.options[idx], idx);
            }
          }
        } else if (answeredState !== null) {
          if (e.key === 'Enter' || e.code === 'Space') {
            e.preventDefault();
            handleNextQuizQuestion();
          }
        }
      } else {
        // Flashcard mode
        if (e.code === 'Space' || e.key === ' ') {
          e.preventDefault();
          setIsFlipped(prev => !prev);
        } else if (e.key === '1') {
          e.preventDefault();
          handleFlashcardAnswer(false);
        } else if (e.key === '2' || e.key === '3' || e.key === '4') {
          e.preventDefault();
          handleFlashcardAnswer(true);
        }
      }

      if (e.key === 'Escape') {
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompleted, drillMode, answeredState, quizQuestion, isFlipped, currentCard]);

  // Touch gesture handlers for flashcard mode
  const handleTouchStart = (e) => {
    if (drillMode !== 'flashcard') return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e) => {
    if (drillMode !== 'flashcard') return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    setSwipeOffset({ x: dx, y: dy });
  };

  const handleTouchEnd = () => {
    if (drillMode !== 'flashcard') return;
    const dx = swipeOffset.x;
    if (dx > 70) {
      handleFlashcardAnswer(true);
    } else if (dx < -70) {
      handleFlashcardAnswer(false);
    }
    setSwipeOffset({ x: 0, y: 0 });
  };

  // Completion Screen
  if (isCompleted) {
    const accuracy = drillScore.total > 0 ? Math.round((drillScore.correct / drillScore.total) * 100) : 0;
    return (
      <div className="fixed inset-0 z-50 bg-[#FBFBF9] text-[#18181B] flex flex-col items-center justify-center p-4 animate-fadeIn">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E5E5DF] p-6 sm:p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 font-black text-3xl flex items-center justify-center mx-auto border border-amber-200">
            🎯
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#18181B]">{t('drillCompletedTitle') || '特訓ドリル完了！'}</h2>
            <p className="text-xs text-[#71717A]">
              {isRetryingMissed
                ? '再テストにより苦手カードの克服が完了しました。'
                : '弱点カードの集中特訓が完了しました。'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 py-2">
            <div className="p-3 rounded-2xl border border-[#E5E5DF] bg-[#FBFBF9]">
              <div className="text-[10px] text-[#71717A] font-bold">{t('reviewedCount') || '回答数'}</div>
              <div className="text-2xl font-black text-[#18181B] mt-0.5">{drillScore.total}</div>
            </div>
            <div className="p-3 rounded-2xl border border-[#E5E5DF] bg-[#FBFBF9]">
              <div className="text-[10px] text-[#71717A] font-bold">{t('accuracyRate') || '正解率'}</div>
              <div className={`text-2xl font-black mt-0.5 ${accuracy >= 80 ? 'text-[#15803D]' : 'text-[#D94826]'}`}>
                {accuracy}%
              </div>
            </div>
            <div className="p-3 rounded-2xl border border-[#E5E5DF] bg-[#FBFBF9]">
              <div className="text-[10px] text-[#71717A] font-bold">{t('xpEarned') || '獲得XP'}</div>
              <div className="text-2xl font-black text-[#D94826] mt-0.5">+30</div>
            </div>
          </div>

          {/* Missed cards notice & retry CTA */}
          {missedCards.length > 0 && !isRetryingMissed && (
            <div className="p-3.5 rounded-2xl bg-[#FFF1EE] border border-[#FECDCA] text-left space-y-1.5">
              <div className="text-xs font-bold text-[#D94826] flex items-center gap-1.5">
                <span>⚠️</span>
                <span>{missedCards.length}問の間違えたカードがあります</span>
              </div>
              <p className="text-[11px] text-[#71717A]">
                間違えたカードだけを抽出して即座に再特訓し、100%の定着を目指しましょう。
              </p>
              <button
                onClick={handleRetryMissedCards}
                className="w-full mt-2 py-2.5 rounded-xl bg-[#D94826] text-white font-bold text-xs hover:bg-[#BF3B1C] transition-fast cursor-pointer"
              >
                間違えた{missedCards.length}問を今すぐ再特訓する
              </button>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <button
              onClick={() => onFinish?.()}
              className="w-full py-3.5 rounded-xl bg-[#18181B] text-white font-bold text-sm hover:bg-[#27272A] transition-fast cursor-pointer"
            >
              {t('backToDashboard') || 'ダッシュボードへ戻る'}
            </button>
            <button
              onClick={() => {
                setActiveQueue(baseQueue);
                setCurrentIndex(0);
                setIsCompleted(false);
                setMissedCards([]);
                setIsRetryingMissed(false);
                setDrillScore({ correct: 0, total: 0 });
              }}
              className="w-full py-2.5 rounded-xl border border-[#E5E5DF] text-xs font-bold text-[#71717A] hover:bg-[#F4F4F0] cursor-pointer"
            >
              {t('reviewAgain') || 'もう一度最初からドリルする'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard || !quizQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div className="space-y-3">
          <div className="text-xl font-bold">{t('allReviewsCompleted') || 'ドリル対象のカードがありません'}</div>
          <button onClick={onExit} className="px-4 py-2 bg-[#18181B] text-white rounded-xl text-xs font-bold cursor-pointer">
            {t('back') || '戻る'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#FBFBF9] text-[#18181B] flex flex-col select-none overflow-hidden animate-fadeIn">
      {/* 1. Header with Mode Toggle & Clear Badge */}
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-[#E5E5DF] bg-white/80 backdrop-blur-md">
        <button
          onClick={onExit}
          className="p-2 -ml-2 rounded-xl text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F0] transition-fast text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
          <span className="hidden sm:inline">{t('back') || '終了'}</span>
        </button>

        {/* Mode Switcher Toggle */}
        <div className="flex items-center gap-1 bg-[#F4F4F0] p-1 rounded-xl">
          <button
            onClick={() => setDrillMode('quiz')}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-fast cursor-pointer ${
              drillMode === 'quiz' ? 'bg-white text-[#18181B] shadow-2xs' : 'text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            選択クイズ
          </button>
          <button
            onClick={() => setDrillMode('flashcard')}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-fast cursor-pointer ${
              drillMode === 'flashcard' ? 'bg-white text-[#18181B] shadow-2xs' : 'text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            単語カード
          </button>
        </div>

        {/* Progress & Content Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#71717A]">
            {currentIndex + 1} / {activeQueue.length}
          </span>
          <div className="hidden sm:flex gap-1 text-[10px]">
            {['all', 'vocab', 'kanji', 'grammar'].map(type => (
              <button
                key={type}
                onClick={() => {
                  setFilterType(type);
                  setCurrentIndex(0);
                  setSelectedOption(null);
                  setAnsweredState(null);
                }}
                className={`px-2 py-1 rounded-md font-bold transition-fast ${
                  filterType === type ? 'bg-[#18181B] text-white' : 'text-[#71717A] hover:bg-[#F4F4F0]'
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-[#E5E5DF]">
        <div
          className="h-full bg-amber-500 transition-all duration-300"
          style={{ width: `${Math.round(((currentIndex + 1) / activeQueue.length) * 100)}%` }}
        />
      </div>

      {/* Hanko Stamp Overlay */}
      {hanko && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div className={`hanko-stamp animate-hanko text-5xl px-8 py-3 bg-white/95 shadow-xl border-2 ${
            hanko === 'again' ? 'text-rose-600 border-rose-600' : 'text-[#15803D] border-[#15803D]'
          }`}>
            {hanko === 'again' ? '難' : '良'}
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center">
        <div className="max-w-xl w-full mx-auto space-y-4">
          
          {/* ======================================================== */}
          {/* MODE A: INTERACTIVE ACCURATE QUIZ MODE (TESTING & CLOZE) */}
          {/* ======================================================== */}
          {drillMode === 'quiz' && (
            <div className="bg-white rounded-3xl border border-[#E5E5DF] p-6 sm:p-8 shadow-sm space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between text-xs pb-3 border-b border-[#F4F4F0]">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 text-[10px] uppercase">
                    {quizQuestion.type.toUpperCase()} · 弱点集中
                  </span>
                  {isRetryingMissed && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      再特訓中
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {quizQuestion.type === 'kanji' && (
                    <button
                      type="button"
                      onClick={() => setShowCanvas(!showCanvas)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-fast ${
                        showCanvas ? 'bg-[#18181B] text-white border-[#18181B]' : 'bg-[#F4F4F0] text-[#71717A] border-[#E5E5DF]'
                      }`}
                    >
                      ✍️ {t('handwriting') || '筆順'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => speakJapanese(currentCard.reading || currentCard.kanji || currentCard.name || quizQuestion.correctAnswer)}
                    className="p-1.5 rounded-lg bg-[#F4F4F0] text-[#18181B] hover:bg-[#E5E5DF] transition-fast"
                    title="発音を聞く"
                  >
                    🔊
                  </button>
                </div>
              </div>

              {/* Stroke Order Canvas Toggle for Kanji */}
              {showCanvas && quizQuestion.type === 'kanji' && (
                <div className="p-4 rounded-2xl bg-[#FBFBF9] border border-[#E5E5DF] flex flex-col items-center animate-fadeIn">
                  <KanjiCanvas kanji={currentCard.kanji || currentCard.name} />
                  <span className="text-[11px] text-[#A1A1AA] mt-2">
                    {t('strokes') || '画数'}: {currentCard.strokes || currentCard.stroke_count || '—'} 画
                  </span>
                </div>
              )}

              {/* Central Question Display */}
              <div className="text-center py-2 space-y-3">
                <div className="text-xs font-bold text-[#71717A]">
                  {quizQuestion.prompt}
                </div>

                {quizQuestion.sentence ? (
                  /* Grammar Cloze Sentence */
                  <div className="p-4 rounded-2xl bg-[#DCFCE7]/25 border border-[#BBF7D0] space-y-1">
                    <div className="text-xl sm:text-2xl font-black text-[#18181B] font-japanese leading-relaxed">
                      {quizQuestion.sentence}
                    </div>
                    {quizQuestion.hint && (
                      <div className="text-xs text-[#71717A]">
                        {quizQuestion.hint}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Kanji or Vocab Word Prompt */
                  <div className="space-y-1">
                    <div className="text-5xl sm:text-6xl font-black text-[#18181B] font-japanese tracking-tight">
                      {quizQuestion.displayWord}
                    </div>
                    {quizQuestion.subHint && (
                      <div className="text-sm font-bold text-[#71717A]">
                        {quizQuestion.subHint}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 4 Interactive Multiple-Choice Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {quizQuestion.options.map((option, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const isCorrect = option === quizQuestion.correctAnswer;
                  
                  let btnStyle = 'border-[#E5E5DF] bg-[#FBFBF9] hover:border-[#18181B] hover:bg-white text-[#18181B]';
                  let icon = <span className="font-mono text-[10px] text-[#A1A1AA]">[{optIdx + 1}]</span>;

                  if (answeredState !== null) {
                    if (isCorrect) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-black shadow-xs';
                      icon = <span className="text-emerald-700 font-black text-sm">✓ 正解</span>;
                    } else if (isSelected) {
                      btnStyle = 'border-rose-500 bg-rose-50 text-rose-800 font-bold';
                      icon = <span className="text-rose-600 font-black text-sm">✗ 不正解</span>;
                    } else {
                      btnStyle = 'border-[#E5E5DF] bg-white opacity-40 text-[#71717A]';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={answeredState !== null}
                      onClick={() => handleSelectQuizOption(option, optIdx)}
                      className={`p-4 rounded-2xl border text-left transition-fast cursor-pointer flex items-center justify-between gap-2 min-h-[58px] ${btnStyle}`}
                    >
                      <span className="font-japanese font-bold text-sm sm:text-base leading-snug">
                        {option}
                      </span>
                      {icon}
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Breakdown Card after selection */}
              {answeredState !== null && (
                <div className="pt-4 border-t border-[#F4F4F0] space-y-4 animate-fadeIn">
                  <div className={`p-4 rounded-2xl border space-y-2 ${
                    answeredState === 'correct' ? 'bg-emerald-50/70 border-emerald-200' : 'bg-[#FFF1EE] border-[#FECDCA]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#18181B]">
                        {quizQuestion.explanation}
                      </span>
                      {currentCard.reading && currentCard.content_type === 'vocab' && (
                        <div className="w-32">
                          <PitchAccentDisplay text={currentCard.kanji} reading={currentCard.reading} />
                        </div>
                      )}
                    </div>

                    {currentCard.example && (
                      <div className="text-xs text-[#71717A] pt-1 border-t border-black/5 space-y-0.5">
                        <div className="font-japanese font-semibold text-[#18181B]">{currentCard.example}</div>
                        {currentCard.exampleMeaning && <div>{currentCard.exampleMeaning}</div>}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleNextQuizQuestion}
                    className="w-full py-4 rounded-2xl bg-[#18181B] text-white font-black text-sm hover:bg-[#27272A] transition-fast shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{currentIndex + 1 < activeQueue.length ? '次の問題へ (Next)' : '結果を見る (Finish)'}</span>
                    <span className="font-mono text-xs text-white/70">[Space / Enter]</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE B: RAPID FLASHCARD FLIP DRILL WITH SWIPE            */}
          {/* ======================================================== */}
          {drillMode === 'flashcard' && (
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={() => setIsFlipped(!isFlipped)}
              style={{
                transform: `translate(${swipeOffset.x * 0.4}px, ${swipeOffset.y * 0.4}px) rotate(${swipeOffset.x * 0.05}deg)`,
                transition: swipeOffset.x === 0 ? 'transform 0.15s ease-out' : 'none',
              }}
              className="w-full min-h-[380px] rounded-3xl border border-[#E5E5DF] bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between cursor-pointer hover:border-[#18181B] transition-fast"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-[11px] border border-amber-200">
                  弱点優先カード
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakJapanese(currentCard.reading || currentCard.kanji || currentCard.name);
                  }}
                  className="p-1.5 rounded-lg bg-[#F4F4F0] text-[#18181B]"
                >
                  🔊
                </button>
              </div>

              <div className="my-auto text-center py-4 space-y-3">
                <div className="text-5xl sm:text-6xl font-black text-[#18181B] font-japanese">
                  {currentCard.kanji || currentCard.name || currentCard.grammar || currentCard.pattern}
                </div>

                {isFlipped && (
                  <div className="pt-4 border-t border-[#E5E5DF] space-y-3 animate-fadeIn">
                    <div className="text-base font-bold text-[#71717A]">
                      {currentCard.reading}
                    </div>
                    <div className="text-lg font-black text-[#18181B]">
                      {currentCard.meaning || currentCard.english}
                    </div>
                    {currentCard.example && (
                      <div className="p-3 rounded-xl bg-[#FBFBF9] text-xs text-[#71717A] text-left">
                        {currentCard.example}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#F4F4F0] flex items-center justify-between text-[11px] text-[#A1A1AA]">
                <span>{isFlipped ? '合否を選択' : 'タップで答えを表示'}</span>
                <span>スワイプ: 右=良, 左=難</span>
              </div>
            </div>
          )}

          {/* Flashcard Action Buttons */}
          {drillMode === 'flashcard' && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleFlashcardAnswer(false)}
                className="py-3.5 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 font-black hover:bg-rose-100 transition-fast flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>再特訓 (Again)</span>
                <span className="font-mono text-xs">[1]</span>
              </button>
              <button
                onClick={() => handleFlashcardAnswer(true)}
                className="py-3.5 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-black hover:bg-emerald-100 transition-fast flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>克服した (Pass)</span>
                <span className="font-mono text-xs">[3]</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
