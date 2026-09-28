'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import KanjiCanvas from '../KanjiCanvas';
import LoanwordBadge from '../LoanwordBadge';
import { isKatakanaLoanword } from '@/lib/japaneseUtils';
import { fetchLessonDetail, completeLessonAction, enrollGrammarPointAction } from '@/app/actions';
import { awardXp } from '@/lib/accountEngine';

export default function LessonFlowView({
  lesson,
  onBack,
  onCompleteSuccess,
  onStartReview,
  onSelectNextLesson,
}) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [lessonDetail, setLessonDetail] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'grammar' | 'vocab' | 'kana' | 'kanji'
  const [activePracticeKana, setActivePracticeKana] = useState(null);
  const [kanaPracticeFlipped, setKanaPracticeFlipped] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [enrolledGrammarIds, setEnrolledGrammarIds] = useState(new Set());
  const [enrollingGrammarId, setEnrollingGrammarId] = useState(null);
  const [completionResult, setCompletionResult] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Native Web Speech synthesis for audio
  const speakJapanese = useCallback((text) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Audio playback error:', e);
    }
  }, []);

  // Fetch full lesson content on mount or lesson change
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!lesson?._id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchLessonDetail(lesson._id);
        if (isMounted) {
          setLessonDetail(data);
          if (Array.isArray(data?.enrolledGrammarPointIds)) {
            setEnrolledGrammarIds(new Set(data.enrolledGrammarPointIds.map(String)));
          }
          // Set initial active tab based on content availability
          if (data?.kanaEntries?.length > 0 && !data?.grammarPoints?.length) {
            setActiveTab('kana');
          } else if (data?.kanjiEntries?.length > 0 && !data?.grammarPoints?.length) {
            setActiveTab('kanji');
          } else {
            setActiveTab('all');
          }
        }
      } catch (err) {
        console.error('Failed to load lesson detail:', err);
        if (isMounted) setError('Failed to load lesson content.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [lesson?._id]);

  const kanaList = lessonDetail?.kanaEntries || [];
  const grammarList = lessonDetail?.grammarPoints || [];
  const vocabList = lessonDetail?.vocabEntries || [];
  const kanjiList = lessonDetail?.kanjiEntries || [];

  const totalItems = kanaList.length + grammarList.length + vocabList.length + kanjiList.length;

  // Granular Grammar SRS Enrollment calculation
  const totalGrammarCount = grammarList.length;
  const enrolledGrammarCount = grammarList.filter(g => enrolledGrammarIds.has(String(g._id))).length;
  const unmasteredGrammarCount = Math.max(0, totalGrammarCount - enrolledGrammarCount);
  const allGrammarEnrolled = totalGrammarCount === 0 || unmasteredGrammarCount === 0;

  // Handle per-grammar point SRS enrollment
  const handleEnrollGrammar = async (grammarPointId) => {
    if (!grammarPointId || enrollingGrammarId) return;
    const idStr = String(grammarPointId);
    setEnrollingGrammarId(idStr);
    try {
      const res = await enrollGrammarPointAction(grammarPointId);
      if (res?.success) {
        setEnrolledGrammarIds((prev) => new Set([...prev, idStr]));
        awardXp(15, 'Grammar Point Enrolled in SRS');
      }
    } catch (err) {
      console.error('Failed to enroll grammar point in SRS:', err);
      alert('Failed to enroll grammar point: ' + (err?.message || 'Network error'));
    } finally {
      setEnrollingGrammarId(null);
    }
  };

  // Handle Lesson Completion
  const handleCompleteLesson = async () => {
    if (!lesson?._id || completing) return;
    if (!allGrammarEnrolled) {
      alert(`Please mark all ${totalGrammarCount} grammar points as understood before completing the lesson.`);
      return;
    }
    setCompleting(true);
    try {
      const res = await completeLessonAction(lesson._id);
      awardXp(50, `Lesson Completed: ${lesson.title}`);
      setCompletionResult(res);
      setShowCelebration(true);
      if (onCompleteSuccess) {
        onCompleteSuccess(lesson, res);
      }
    } catch (err) {
      console.error('Failed to complete lesson:', err);
      alert('Failed to record lesson completion: ' + (err?.message || 'Network error'));
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="inline-block w-10 h-10 border-4 border-[#D94826] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-[#71717A]">Loading lesson content...</p>
      </div>
    );
  }

  if (error || !lessonDetail) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-2xl">⚠️</div>
        <h2 className="text-xl font-black text-[#18181B]">{error || 'Lesson content not found'}</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-[#18181B] text-white text-xs font-bold hover:bg-[#3F3F46] transition-fast cursor-pointer"
        >
          {t('backToCurriculum') || 'Back to Curriculum'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-8 animate-fadeIn pb-32">
      {/* 1. Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5DF]">
        <button
          onClick={onBack}
          className="self-start flex items-center gap-2 text-xs font-bold text-[#71717A] hover:text-[#18181B] px-3 py-1.5 rounded-xl hover:bg-[#F4F4F0] transition-fast cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>{t('backToCurriculum') || 'Back to Curriculum'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-[#71717A] bg-[#F4F4F0] px-2.5 py-1 rounded-lg">
            Unit {lesson.unit}
          </span>
          <span className="text-[11px] font-mono font-bold text-[#D94826] bg-[#FFF1EE] px-2.5 py-1 rounded-lg border border-[#FECDCA]">
            Lesson {lesson.order}
          </span>
        </div>
      </div>

      {/* 2. Hero Header Card */}
      <div className="rounded-3xl border border-[#E5E5DF] bg-white p-6 sm:p-8 shadow-xs space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D94826] bg-[#FFF1EE] px-2.5 py-0.5 rounded-md border border-[#FECDCA]">
                {lesson.type}
              </span>
              <span className="text-xs font-bold text-[#71717A] bg-[#F4F4F0] px-2.5 py-0.5 rounded-md">
                Est. ~{lesson.estimatedMinutes || 15} mins
              </span>
              {lesson.unit === 0 ? (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  Foundational Writing Systems (Intro)
                </span>
              ) : (
                <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  JLPT N5 Grammar & Vocabulary
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">
              {lesson.title}
            </h1>
            {lesson.titleJapanese && (
              <p className="text-sm font-japanese font-bold text-[#71717A]">
                {lesson.titleJapanese}
              </p>
            )}
            <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed pt-1">
              {lesson.description}
            </p>
          </div>

          {/* Quick counts overview widget */}
          <div className="grid grid-cols-2 gap-2 bg-[#FBFBF9] p-4 rounded-2xl border border-[#E5E5DF] shrink-0 text-center">
            {kanaList.length > 0 && (
              <div className="px-3 py-1.5">
                <div className="text-[10px] font-bold text-[#71717A]">Kana Characters</div>
                <div className="text-lg font-black text-[#18181B]">{kanaList.length}</div>
              </div>
            )}
            {grammarList.length > 0 && (
              <div className="px-3 py-1.5">
                <div className="text-[10px] font-bold text-[#15803D]">Grammar Points</div>
                <div className="text-lg font-black text-[#15803D]">{grammarList.length}</div>
              </div>
            )}
            {vocabList.length > 0 && (
              <div className="px-3 py-1.5">
                <div className="text-[10px] font-bold text-[#1E40AF]">Vocabulary</div>
                <div className="text-lg font-black text-[#1E40AF]">{vocabList.length}</div>
              </div>
            )}
            {kanjiList.length > 0 && (
              <div className="px-3 py-1.5">
                <div className="text-[10px] font-bold text-[#B45309]">Kanji</div>
                <div className="text-lg font-black text-[#B45309]">{kanjiList.length}</div>
              </div>
            )}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 pt-2 border-t border-[#F4F4F0] overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-fast cursor-pointer shrink-0 ${
              activeTab === 'all' ? 'bg-[#18181B] text-white' : 'text-[#71717A] hover:bg-[#F4F4F0]'
            }`}
          >
            Show All
          </button>
          {kanaList.length > 0 && (
            <button
              onClick={() => setActiveTab('kana')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-fast cursor-pointer shrink-0 ${
                activeTab === 'kana' ? 'bg-[#18181B] text-white' : 'text-[#71717A] hover:bg-[#F4F4F0]'
              }`}
            >
              Characters ({kanaList.length})
            </button>
          )}
          {grammarList.length > 0 && (
            <button
              onClick={() => setActiveTab('grammar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-fast cursor-pointer shrink-0 ${
                activeTab === 'grammar' ? 'bg-[#18181B] text-white' : 'text-[#71717A] hover:bg-[#F4F4F0]'
              }`}
            >
              Grammar Points ({grammarList.length})
            </button>
          )}
          {vocabList.length > 0 && (
            <button
              onClick={() => setActiveTab('vocab')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-fast cursor-pointer shrink-0 ${
                activeTab === 'vocab' ? 'bg-[#18181B] text-white' : 'text-[#71717A] hover:bg-[#F4F4F0]'
              }`}
            >
              Vocabulary ({vocabList.length})
            </button>
          )}
          {kanjiList.length > 0 && (
            <button
              onClick={() => setActiveTab('kanji')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-fast cursor-pointer shrink-0 ${
                activeTab === 'kanji' ? 'bg-[#18181B] text-white' : 'text-[#71717A] hover:bg-[#F4F4F0]'
              }`}
            >
              Kanji ({kanjiList.length})
            </button>
          )}
        </div>
      </div>

      {/* 3. KANA SECTION (Hiragana / Katakana) */}
      {(activeTab === 'all' || activeTab === 'kana') && kanaList.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D94826]"></span>
              <h2 className="text-lg font-black text-[#18181B]">{t('kanaCharacters') || 'Kana & Pronunciation'}</h2>
            </div>
            <span className="text-xs text-[#71717A]">{t('pronunciationHint') || 'Tap to hear pronunciation'}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {kanaList.map((k) => (
              <div
                key={k._id}
                onClick={() => speakJapanese(k.character)}
                className="group p-4 rounded-2xl border border-[#E5E5DF] bg-white hover:border-[#D94826] hover:shadow-xs transition-fast cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-mono font-bold text-[#71717A]">{k.romaji}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakJapanese(k.character);
                    }}
                    className="p-1 rounded-lg text-[#71717A] hover:bg-[#F4F4F0] transition-fast"
                    title={t('pronounce') || 'Listen'}
                  >
                    🔊
                  </button>
                </div>

                <div className="text-center py-2">
                  <div className="text-4xl font-black text-[#18181B] font-japanese group-hover:scale-110 transition-transform">
                    {k.character}
                  </div>
                </div>

                {k.mnemonic && (
                  <div className="text-[11px] text-[#71717A] bg-[#FBFBF9] p-2 rounded-xl border border-[#F4F4F0] mt-1 leading-snug">
                    💡 {k.mnemonic}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. KANJI FUNDAMENTALS SECTION */}
      {(activeTab === 'all' || activeTab === 'kanji') && kanjiList.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
              <h2 className="text-lg font-black text-[#18181B]">{t('kanjiFundamentals') || 'Kanji Fundamentals'}</h2>
            </div>
            <span className="text-xs text-[#71717A]">{kanjiList.length} characters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kanjiList.map((kj) => {
              const currentCtx = kj.currentContext || (kj.courseContexts?.[0]);
              const primaryVocab = kj.primaryVocabulary || currentCtx?.vocabulary || kj.character;
              const reading = kj.lessonReading || currentCtx?.reading || kj.relevantReading || '';
              const romaji = kj.lessonRomaji || currentCtx?.romaji || '';
              const coreMeaning = kj.coreMeaning || currentCtx?.meaning || (Array.isArray(kj.meanings) ? kj.meanings[0] : kj.meaning) || '';

              return (
                <div
                  key={kj._id}
                  className="p-5 rounded-3xl border border-[#E5E5DF] bg-white shadow-2xs space-y-4 hover:border-amber-400 transition-fast"
                >
                  {/* Top Block: 1. Kanji Character, 2. Course Vocabulary Context, 3. Reading/Romaji, 4. Meaning */}
                  <div className="flex items-start gap-4">
                    {/* 1. Kanji character (visually prominent) */}
                    <div className="w-18 h-18 rounded-2xl bg-[#FFF8EE] border border-amber-200 flex items-center justify-center text-4xl sm:text-5xl font-serif-jp font-black text-amber-900 shrink-0 shadow-2xs">
                      {kj.character}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      {/* Course Vocabulary Context indicator when kanji is inside a word */}
                      {primaryVocab && primaryVocab !== kj.character && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-900 font-semibold mb-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
                            Seen in
                          </span>
                          <span className="font-japanese font-bold text-base text-[#18181B]">{primaryVocab}</span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {/* 2. Learner-facing Hiragana reading of the vocabulary word */}
                          <div className="text-2xl sm:text-3xl font-japanese font-black text-[#18181B] tracking-tight leading-tight">
                            {reading}
                          </div>

                          {/* 3. Romaji (Hepburn) */}
                          {romaji && (
                            <div className="text-xs font-mono font-bold text-amber-800 tracking-wider pt-0.5">
                              {romaji}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => speakJapanese(primaryVocab || kj.character)}
                          className="p-1.5 rounded-xl text-[#71717A] hover:bg-[#F4F4F0] hover:text-[#18181B] cursor-pointer shrink-0 transition-fast"
                          title={t('pronounce') || 'Listen'}
                        >
                          🔊
                        </button>
                      </div>

                      {/* 4. Meaning / English translation in course context */}
                      <div className="pt-1.5">
                        <h3 className="text-sm sm:text-base font-bold text-[#18181B] leading-snug">
                          {coreMeaning}
                        </h3>
                        {kj.meanings?.length > 1 && (
                          <div className="text-[11px] text-[#71717A] truncate">
                            Dictionary: {kj.meanings.filter((m) => m !== coreMeaning).slice(0, 3).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 5. Supporting readings (On'yomi / Kun'yomi dictionary reference) */}
                  {(kj.onyomi?.length > 0 || kj.kunyomi?.length > 0) && (
                    <div className="p-3 rounded-2xl bg-[#FAFAF8] border border-[#EBEBE6] text-xs space-y-1.5">
                      <div className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">
                        辞書リファレンス (Dictionary Reference)
                      </div>
                      {kj.onyomi?.length > 0 && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider w-16 shrink-0">On'yomi:</span>
                          <span className="font-japanese font-bold text-[#18181B]">{kj.onyomi.join('、')}</span>
                        </div>
                      )}
                      {kj.kunyomi?.length > 0 && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider w-16 shrink-0">Kun'yomi:</span>
                          <span className="font-japanese font-bold text-[#18181B]">{kj.kunyomi.join('、')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Multiple Contexts Across Lessons */}
                  {kj.courseContexts?.length > 1 && (
                    <div className="p-2.5 rounded-2xl bg-[#F9F9F6] border border-[#EBEBE6] text-xs space-y-1">
                      <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                        他の学習語彙 (Also appears in):
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {kj.courseContexts
                          .filter((c) => c.vocabulary !== primaryVocab)
                          .slice(0, 4)
                          .map((ctx, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-lg bg-white border border-[#E5E5DF] text-[#3F3F46]">
                              L{ctx.lesson}: <strong className="font-japanese text-[#18181B]">{ctx.vocabulary}</strong> ({ctx.reading})
                            </span>
                          ))}
                      </div>
                    </div>
                  )}


                  {/* Why Kanji Appears Here & Course Relevance */}
                  {(kj.whyAppearsHere || kj.courseRelevance) && (
                    <div className="p-3 rounded-2xl bg-[#FFFDF7] border border-amber-100 text-xs text-amber-950 space-y-1">
                      {kj.courseRelevance && (
                        <div className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                          {kj.courseRelevance}
                        </div>
                      )}
                      {kj.whyAppearsHere && (
                        <p className="leading-relaxed text-[#3F3F46]">{kj.whyAppearsHere}</p>
                      )}
                    </div>
                  )}

                  {/* 6. Strokes / other details */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#F4F4F0] text-xs text-[#71717A]">
                    <span>Strokes: <strong className="text-[#18181B]">{kj.strokeCount || kj.strokes || 1}</strong></span>
                    {kj.radicals?.length > 0 && <span>Radical: <strong className="text-[#18181B]">{kj.radicals.join(', ')}</strong></span>}
                    <span className="font-mono text-[11px] bg-[#F4F4F0] px-2 py-0.5 rounded font-bold text-[#52525B]">
                      {kj.jlptLevel || 'N5'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. GRAMMAR & EXPRESSIONS SECTION (Deep Understanding Architecture) */}
      {(activeTab === 'all' || activeTab === 'grammar') && grammarList.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h2 className="text-lg font-black text-[#18181B]">{t('grammarConcepts') || 'Grammar Concepts & Expressions'}</h2>
          </div>

          <div className="space-y-6">
            {grammarList.map((g, idx) => (
              <div
                key={g._id}
                className="rounded-3xl border border-[#E5E5DF] bg-white p-6 sm:p-7 shadow-xs space-y-6 hover:border-emerald-300 transition-fast"
              >
                {/* 1. Header & Level Badges */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        {g.categoryType === 'expression'
                          ? `Expression ${idx + 1}`
                          : g.categoryType === 'usage-pattern'
                          ? `Usage Pattern ${idx + 1}`
                          : `Grammar Point ${idx + 1}`}
                      </span>
                      {g.courseLevel && (
                        <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                          {g.courseLevel}
                        </span>
                      )}
                      {g.politenessLevel && (
                        <span className="text-xs font-semibold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                          {g.politenessLevel}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#71717A]">
                      {g.jlptLevel ? `JLPT ${g.jlptLevel}` : 'Core N5'}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
                    {g.title}
                  </h3>

                  {/* Structural Formula Pattern */}
                  <div className="p-4 rounded-2xl bg-[#FBFBF9] border border-[#E5E5DF] flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">
                        {t('formationRule') || 'Formation Pattern'}
                      </div>
                      <div className="text-base sm:text-lg font-mono font-black text-[#18181B]">
                        {g.pattern}
                      </div>
                      {g.formation && g.formation !== g.pattern && (
                        <div className="text-xs text-[#52525B] font-medium pt-0.5">
                          {g.formation}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => speakJapanese(g.pattern.replace(/\[.*?\]/g, ''))}
                      className="p-2.5 rounded-xl bg-white border border-[#E5E5DF] text-[#18181B] hover:bg-[#F4F4F0] transition-fast cursor-pointer shrink-0 shadow-2xs"
                      title={t('pronounce') || 'Listen'}
                    >
                      🔊
                    </button>
                  </div>
                </div>

                {/* 2. Literal Structure vs. Natural English (Progressive Understanding) */}
                {(g.literalMeaning || g.naturalMeaning) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF]">
                    {g.literalMeaning && (
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-amber-700 flex items-center gap-1">
                          <span>🔍</span>
                          <span>Literal Japanese Structure</span>
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                          {g.literalMeaning}
                        </div>
                      </div>
                    )}
                    {g.naturalMeaning && (
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 flex items-center gap-1">
                          <span>🎯</span>
                          <span>Natural English Meaning</span>
                        </div>
                        <div className="text-xs sm:text-sm font-black text-[#18181B] leading-snug">
                          {g.naturalMeaning}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Word-by-Word Component Breakdown */}
                {Array.isArray(g.wordBreakdown) && g.wordBreakdown.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">
                      Component Breakdown (構成要素)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {g.wordBreakdown.map((item, bIdx) => (
                        <div
                          key={bIdx}
                          className="p-3 rounded-2xl bg-white border border-[#E5E5DF] shadow-2xs space-y-1"
                        >
                          <div className="flex items-baseline justify-between">
                            <span className="font-japanese font-black text-[#18181B] text-base">{item.japanese}</span>
                            {item.reading && item.reading !== item.japanese && (
                              <span className="text-[10px] text-[#71717A] font-japanese">{item.reading}</span>
                            )}
                          </div>
                          {item.romaji && (
                            <div className="text-[10px] font-mono text-[#A1A1AA]">{item.romaji}</div>
                          )}
                          <div className="text-xs font-bold text-[#27272A]">{item.literal}</div>
                          {item.role && (
                            <div className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 inline-block">
                              {item.role}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. "WHY IT IS USED" Communicative Purpose Callout */}
                {g.whyItIsUsed && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                      <span>💡</span>
                      <span>Why Japanese Uses This Structure (Communicative Purpose)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
                      {g.whyItIsUsed}
                    </p>
                  </div>
                )}

                {/* 5. Detailed Linguistic Explanation */}
                <div className="text-xs sm:text-sm text-[#3F3F46] leading-relaxed whitespace-pre-line border-l-3 border-[#D94826] pl-4 py-1">
                  {g.explanation}
                </div>

                {/* 6. Context & Nuance Notes */}
                {(g.whenToUse || g.whenNotToUse || g.nuance || g.beginnerTip) && (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {g.whenToUse && (
                        <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-emerald-950 space-y-0.5">
                          <strong className="text-[10px] uppercase font-bold text-emerald-700 block">✓ When to use</strong>
                          <p className="leading-snug">{g.whenToUse}</p>
                        </div>
                      )}
                      {g.whenNotToUse && (
                        <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 text-rose-950 space-y-0.5">
                          <strong className="text-[10px] uppercase font-bold text-rose-700 block">✕ When NOT to use</strong>
                          <p className="leading-snug">{g.whenNotToUse}</p>
                        </div>
                      )}
                    </div>
                    {g.nuance && (
                      <div className="p-3 rounded-2xl bg-[#F4F4F0] border border-[#E5E5DF] text-xs text-[#3F3F46] space-y-0.5">
                        <strong className="text-[10px] uppercase font-bold text-[#71717A] block">Nuance & Pragmatics</strong>
                        <p className="leading-relaxed">{g.nuance}</p>
                      </div>
                    )}
                    {g.beginnerTip && (
                      <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 space-y-0.5">
                        <strong className="text-[10px] uppercase font-bold text-blue-700 block">💡 Beginner Tip</strong>
                        <p className="leading-relaxed">{g.beginnerTip}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 7. Comparison Table (e.g. は vs が, です vs だ) */}
                {g.comparison && Array.isArray(g.comparison.comparisonPoints) && g.comparison.comparisonPoints.length > 0 && (
                  <div className="space-y-2 p-4 rounded-2xl bg-[#FBFBF9] border border-[#E5E5DF]">
                    <div className="text-xs font-black text-[#18181B] flex items-center gap-1.5">
                      <span>⚖️</span>
                      <span>Comparison: {g.comparison.target || 'Contrast Analysis'}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#E5E5DF] text-[#71717A]">
                            <th className="py-2 pr-3 font-bold">Concept</th>
                            <th className="py-2 px-3 font-bold font-japanese">Pattern A</th>
                            <th className="py-2 px-3 font-bold font-japanese">Pattern B</th>
                            <th className="py-2 pl-3 font-bold">Contrast & Function</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F4F4F0]">
                          {g.comparison.comparisonPoints.map((cp, cIdx) => (
                            <tr key={cIdx} className="hover:bg-white transition-fast">
                              <td className="py-2 pr-3 font-bold text-[#18181B]">{cp.label}</td>
                              <td className="py-2 px-3 font-japanese font-bold text-blue-700">{cp.itemA}</td>
                              <td className="py-2 px-3 font-japanese font-bold text-purple-700">{cp.itemB}</td>
                              <td className="py-2 pl-3 text-[#52525B] leading-snug">{cp.explanation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 8. Common Learner Mistakes (❌ vs ✅) */}
                {((Array.isArray(g.commonMistakes) && g.commonMistakes.length > 0) || g.caution) && (
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2.5">
                    <div className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>Common Beginner Mistakes to Avoid</span>
                    </div>
                    {Array.isArray(g.commonMistakes) && g.commonMistakes.length > 0 ? (
                      <div className="space-y-2">
                        {g.commonMistakes.map((cm, mIdx) => (
                          <div key={mIdx} className="p-3 rounded-xl bg-white border border-amber-100 text-xs space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-japanese font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                ❌ {cm.incorrect}
                              </span>
                              <span className="text-[#A1A1AA]">→</span>
                              <span className="font-japanese font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                ✅ {cm.correct}
                              </span>
                            </div>
                            <p className="text-[#52525B] leading-snug pt-0.5">{cm.explanation}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-amber-950 font-medium leading-relaxed">{g.caution}</p>
                    )}
                  </div>
                )}

                {/* 9. Contextual Example Sentences (with Romaji & Word Breakdowns) */}
                {Array.isArray(g.exampleSentenceIds) && g.exampleSentenceIds.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span>{t('exampleSentence') || 'Example Sentences (Tatoeba)'}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          CC-BY 2.0
                        </span>
                      </div>
                      <span className="text-[11px] text-[#A1A1AA]">{g.exampleSentenceIds.length} examples</span>
                    </div>

                    <div className="space-y-2.5">
                      {g.exampleSentenceIds.map((ex) => (
                        <div
                          key={ex._id || ex.japanese}
                          className="p-4 rounded-2xl bg-[#F8F8F6] border border-[#E5E5DF] space-y-2 group hover:border-[#18181B] transition-fast"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1 flex-1">
                              <div className="text-base sm:text-lg font-bold text-[#18181B] font-japanese leading-snug">
                                {ex.japanese}
                              </div>
                              {ex.furigana && ex.furigana !== ex.japanese && (
                                <div className="text-xs text-[#71717A] font-japanese">
                                  {ex.furigana}
                                </div>
                              )}
                              {ex.romaji && (
                                <div className="text-[11px] text-[#A1A1AA] font-mono">
                                  {ex.romaji}
                                </div>
                              )}
                              <div className="text-xs sm:text-sm font-medium text-[#27272A] pt-0.5">
                                {ex.naturalEnglish || ex.english}
                              </div>
                            </div>

                            <button
                              onClick={() => speakJapanese(ex.japanese)}
                              className="p-2 rounded-xl bg-white border border-[#E5E5DF] hover:bg-[#E5E5DF] text-[#18181B] transition-fast shrink-0 cursor-pointer shadow-2xs"
                              title={t('pronounce') || 'Listen'}
                            >
                              🔊
                            </button>
                          </div>

                          {/* Sentence Word Breakdown (if provided) */}
                          {Array.isArray(ex.breakdown) && ex.breakdown.length > 0 && (
                            <div className="pt-2 border-t border-[#EAEAE6] flex flex-wrap gap-1.5">
                              {ex.breakdown.map((b, bIdx) => (
                                <span
                                  key={bIdx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-[#E5E5DF] text-[10px] text-[#3F3F46]"
                                >
                                  <strong className="font-japanese text-[#18181B]">{b.japanese}</strong>
                                  <span className="text-[#A1A1AA]">({b.english})</span>
                                </span>
                              ))}
                            </div>
                          )}

                          {ex.grammarNote && (
                            <div className="text-[11px] text-emerald-800 bg-emerald-50/70 px-2.5 py-1 rounded-lg border border-emerald-100">
                              ℹ️ {ex.grammarNote}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 10. Per-Grammar-Point SRS Enrollment Action */}
                <div className="pt-3 border-t border-[#F4F4F0] flex items-center justify-between flex-wrap gap-3">
                  <div className="text-xs">
                    {enrolledGrammarIds.has(String(g._id)) ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Enrolled in SRS Review Queue
                      </span>
                    ) : (
                      <span className="text-[#71717A]">
                        Review this rule and mark as understood to add to your daily queue
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={enrolledGrammarIds.has(String(g._id)) || enrollingGrammarId === String(g._id)}
                    onClick={() => handleEnrollGrammar(g._id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-fast flex items-center gap-1.5 ${
                      enrolledGrammarIds.has(String(g._id))
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                        : enrollingGrammarId === String(g._id)
                        ? 'bg-[#F4F4F0] text-[#71717A] cursor-wait'
                        : 'bg-white hover:bg-[#18181B] text-[#18181B] hover:text-white border border-[#18181B] cursor-pointer shadow-2xs'
                    }`}
                  >
                    {enrolledGrammarIds.has(String(g._id)) ? (
                      <>
                        <span>✓</span>
                        <span>Understood & Enrolled in SRS</span>
                      </>
                    ) : enrollingGrammarId === String(g._id) ? (
                      <>
                        <div className="w-3 h-3 border-2 border-[#71717A] border-t-transparent rounded-full animate-spin"></div>
                        <span>Enrolling...</span>
                      </>
                    ) : (
                      <>
                        <span>＋</span>
                        <span>Mark as Understood & Add to SRS</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. VOCABULARY IN CONTEXT SECTION */}
      {(activeTab === 'all' || activeTab === 'vocab') && vocabList.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-lg font-black text-[#18181B]">{t('contextVocab') || 'Vocabulary in Context'}</h2>
            </div>
            <span className="text-xs text-[#71717A]">{vocabList.length} words</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vocabList.map((v) => (
              <div
                key={v._id}
                className="p-5 rounded-3xl border border-[#E5E5DF] bg-white shadow-2xs hover:border-[#18181B] transition-fast space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-2xl font-black text-[#18181B] font-japanese">
                        {v.kanji || v.kana}
                      </div>
                      {isKatakanaLoanword(v.kanji || v.kana, v) && <LoanwordBadge />}
                      {v.register && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                          {v.register}
                        </span>
                      )}
                    </div>
                    {v.kanji && (
                      <div className="text-xs font-bold text-[#71717A] font-japanese">
                        {v.kana}
                      </div>
                    )}
                    {v.romaji && (
                      <div className="text-[10px] font-mono text-[#A1A1AA]">
                        {v.romaji}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => speakJapanese(v.kanji || v.kana)}
                    className="p-2 rounded-xl text-[#71717A] hover:bg-[#F4F4F0] cursor-pointer shrink-0 border border-[#F4F4F0]"
                    title={t('pronounce') || 'Listen'}
                  >
                    🔊
                  </button>
                </div>

                {/* Meanings: Natural vs. Literal */}
                <div className="space-y-1">
                  <div className="text-sm font-bold text-[#18181B]">
                    {v.naturalMeaning || v.meanings?.join(', ')}
                  </div>
                  {v.literalMeaning && (
                    <div className="text-xs text-[#71717A] italic">
                      Literal: {v.literalMeaning}
                    </div>
                  )}
                </div>

                {/* Nuance / Usage / Context Notes */}
                {(v.usage || v.nuance || v.kanjiNotes) && (
                  <div className="text-xs text-[#52525B] p-2.5 rounded-xl bg-[#FBFBF9] border border-[#F4F4F0] space-y-1">
                    {v.usage && <p className="leading-snug">{v.usage}</p>}
                    {v.nuance && <p className="text-[11px] text-[#71717A] leading-snug">💡 {v.nuance}</p>}
                    {v.kanjiNotes && <p className="text-[11px] text-amber-800 leading-snug">ℹ️ {v.kanjiNotes}</p>}
                  </div>
                )}

                {/* Collocations / Common Mistakes */}
                {(v.collocations?.length > 0 || v.commonMistakes) && (
                  <div className="space-y-1 text-xs pt-1">
                    {v.collocations?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[10px] font-bold text-[#71717A]">Collocations:</span>
                        {v.collocations.map((c, cIdx) => (
                          <span key={cIdx} className="font-japanese text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                    {v.commonMistakes && (
                      <div className="text-[11px] text-rose-700 bg-rose-50/70 p-2 rounded-lg border border-rose-100">
                        ⚠️ {v.commonMistakes}
                      </div>
                    )}
                  </div>
                )}

                {/* Pos & Example */}
                {v.partOfSpeech?.length > 0 && (
                  <div className="text-[10px] font-mono text-[#71717A] pt-1 border-t border-[#F4F4F0]">
                    {v.partOfSpeech.join(' · ')}
                  </div>
                )}

                {Array.isArray(v.exampleSentenceIds) && v.exampleSentenceIds.length > 0 && (
                  <div className="text-xs text-[#71717A] bg-[#FBFBF9] p-2.5 rounded-xl border border-[#F4F4F0] space-y-1">
                    <div className="font-bold text-[#18181B] font-japanese">
                      {v.exampleSentenceIds[0]?.japanese}
                    </div>
                    {v.exampleSentenceIds[0]?.furigana && v.exampleSentenceIds[0]?.furigana !== v.exampleSentenceIds[0]?.japanese && (
                      <div className="text-[11px] text-[#71717A] font-japanese">
                        {v.exampleSentenceIds[0]?.furigana}
                      </div>
                    )}
                    <div className="text-[11px] text-[#52525B]">
                      {v.exampleSentenceIds[0]?.naturalEnglish || v.exampleSentenceIds[0]?.english}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Bottom Fixed Completion Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E5DF] p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <div className="text-xs font-bold text-[#18181B]">
              Lesson {lesson.order} Summary
            </div>
            <div className="text-[11px] text-[#71717A]">
              {totalGrammarCount > 0
                ? `${enrolledGrammarCount} of ${totalGrammarCount} grammar points understood · Vocab & kanji enroll on completion`
                : `Master all ${totalItems} items and add them to your SRS review queue`}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onBack}
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl border border-[#E5E5DF] text-xs font-bold text-[#71717A] hover:bg-[#F4F4F0] transition-fast cursor-pointer"
            >
              {t('exitAndSave') || 'Exit & Save'}
            </button>
            <button
              onClick={handleCompleteLesson}
              disabled={completing || !allGrammarEnrolled}
              className={`flex-2 sm:flex-none px-6 py-3 rounded-2xl font-black text-sm transition-fast shadow-sm flex items-center justify-center gap-2 ${
                !allGrammarEnrolled
                  ? 'bg-[#E5E5DF] text-[#71717A] cursor-not-allowed'
                  : 'bg-[#D94826] hover:bg-[#BF3B1C] text-white cursor-pointer'
              }`}
            >
              {completing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Recording completion...</span>
                </>
              ) : !allGrammarEnrolled ? (
                <span>
                  Mark all grammar points as understood to complete lesson ({unmasteredGrammarCount} remaining)
                </span>
              ) : (
                <>
                  <span>{t('completeLessonAndAddToSrs') || 'Complete Lesson & Add to SRS Reviews'}</span>
                  <span>✓</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 8. Celebration Modal after completing lesson */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E5E5DF] p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-[#FFF1EE] text-[#D94826] font-black text-3xl flex items-center justify-center mx-auto shadow-xs">
              ✓
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#18181B] tracking-tight">
                {t('lessonCompletedTitle') || 'Lesson Completed!'}
              </h2>
              <p className="text-xs text-[#71717A]">
                You have successfully completed &quot;{lesson.title}&quot;.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FBFBF9] border border-[#E5E5DF] space-y-2 text-left text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-[#71717A]">{t('xpEarned') || 'XP Earned'}:</span>
                <span className="text-[#D94826] font-mono">+50 XP</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-[#71717A]">{t('cardsAddedToSrs') || 'Cards Added to SRS Queue'}:</span>
                <span className="text-[#18181B] font-mono">{completionResult?.enqueuedCount || totalItems} cards</span>
              </div>
              {completionResult?.nextLesson && (
                <div className="pt-2 border-t border-[#E5E5DF] text-[11px] text-[#15803D] font-bold">
                  🔓 Next lesson &quot;{completionResult.nextLesson.title}&quot; has been unlocked!
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowCelebration(false);
                  if (onStartReview) onStartReview();
                }}
                className="w-full py-3.5 rounded-2xl bg-[#D94826] hover:bg-[#BF3B1C] text-white font-black text-sm shadow-sm transition-fast cursor-pointer"
              >
                {t('startSrsReviewNow') || 'Start SRS Review Now →'}
              </button>

              {completionResult?.nextLesson ? (
                <button
                  onClick={() => {
                    setShowCelebration(false);
                    if (onSelectNextLesson) onSelectNextLesson(completionResult.nextLesson);
                  }}
                  className="w-full py-3 rounded-2xl border border-[#E5E5DF] hover:bg-[#F4F4F0] text-xs font-bold text-[#18181B] transition-fast cursor-pointer"
                >
                  {t('proceedToNextLesson') || 'Proceed to Next Lesson →'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowCelebration(false);
                    onBack();
                  }}
                  className="w-full py-3 rounded-2xl border border-[#E5E5DF] hover:bg-[#F4F4F0] text-xs font-bold text-[#18181B] transition-fast cursor-pointer"
                >
                  {t('backToCurriculum') || 'Back to Curriculum'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
