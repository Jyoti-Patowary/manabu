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
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            <h2 className="text-lg font-black text-[#18181B]">{t('kanjiFundamentals') || 'Kanji Fundamentals'}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kanjiList.map((kj) => (
              <div
                key={kj._id}
                className="p-5 rounded-2xl border border-[#E5E5DF] bg-white shadow-2xs space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#FFF8EE] border border-amber-200 flex items-center justify-center text-4xl font-serif font-black text-amber-900 shrink-0">
                    {kj.character}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-[#18181B]">
                        {kj.meanings?.join(', ')}
                      </h3>
                      <button
                        onClick={() => speakJapanese(kj.character)}
                        className="p-1.5 rounded-lg text-[#71717A] hover:bg-[#F4F4F0]"
                        title={t('pronounce') || 'Listen'}
                      >
                        🔊
                      </button>
                    </div>

                    <div className="text-xs text-[#71717A] space-y-0.5">
                      {kj.onyomi?.length > 0 && (
                        <div>
                          <strong className="text-[#18181B]">On'yomi: </strong>
                          <span className="font-japanese">{kj.onyomi.join('、')}</span>
                        </div>
                      )}
                      {kj.kunyomi?.length > 0 && (
                        <div>
                          <strong className="text-[#18181B]">Kun'yomi: </strong>
                          <span className="font-japanese">{kj.kunyomi.join('、')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F4F4F0] text-xs text-[#71717A]">
                  <span>Strokes: {kj.strokeCount}</span>
                  {kj.radicals?.length > 0 && <span>Radicals: {kj.radicals.join(', ')}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. GRAMMAR POINTS SECTION (Tae Kim Sequenced + Tatoeba Examples) */}
      {(activeTab === 'all' || activeTab === 'grammar') && grammarList.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h2 className="text-lg font-black text-[#18181B]">{t('grammarConcepts') || 'Grammar Concepts & Structure'}</h2>
          </div>

          <div className="space-y-6">
            {grammarList.map((g, idx) => (
              <div
                key={g._id}
                className="rounded-3xl border border-[#E5E5DF] bg-white p-6 sm:p-7 shadow-xs space-y-5"
              >
                {/* Grammar Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      Grammar {idx + 1}: {g.title}
                    </span>
                    <span className="text-xs font-bold text-[#71717A]">
                      {g.jlptLevel ? `JLPT ${g.jlptLevel}` : 'Foundational'}
                    </span>
                  </div>

                  {/* Structural Formula Pattern */}
                  <div className="p-3.5 rounded-2xl bg-[#FBFBF9] border border-[#E5E5DF] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">{t('formationRule') || 'Formation Pattern'}</div>
                      <div className="text-base sm:text-lg font-mono font-black text-[#18181B] mt-0.5">
                        {g.pattern}
                      </div>
                    </div>
                    <button
                      onClick={() => speakJapanese(g.pattern.replace(/\[.*?\]/g, ''))}
                      className="p-2 rounded-xl bg-white border border-[#E5E5DF] text-[#18181B] hover:bg-[#F4F4F0] transition-fast cursor-pointer"
                      title={t('pronounce') || 'Listen'}
                    >
                      🔊
                    </button>
                  </div>
                </div>

                {/* Grammar Explanation */}
                <div className="text-xs sm:text-sm text-[#3F3F46] leading-relaxed whitespace-pre-line border-l-3 border-[#D94826] pl-4 py-1">
                  {g.explanation}
                </div>

                {/* Tatoeba Example Sentences */}
                {Array.isArray(g.exampleSentenceIds) && g.exampleSentenceIds.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                      <span>{t('exampleSentence') || 'Example Sentences (Tatoeba)'}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        CC-BY 2.0
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {g.exampleSentenceIds.map((ex) => (
                        <div
                          key={ex._id || ex.japanese}
                          className="p-3.5 rounded-2xl bg-[#F8F8F6] border border-[#E5E5DF] flex items-start justify-between gap-4 group hover:border-[#18181B] transition-fast"
                        >
                          <div className="space-y-1">
                            <div className="text-base sm:text-lg font-bold text-[#18181B] font-japanese">
                              {ex.japanese}
                            </div>
                            {ex.furigana && ex.furigana !== ex.japanese && (
                              <div className="text-xs text-[#71717A] font-japanese">
                                {ex.furigana}
                              </div>
                            )}
                            <div className="text-xs sm:text-sm text-[#52525B]">
                              {ex.english}
                            </div>
                          </div>

                          <button
                            onClick={() => speakJapanese(ex.japanese)}
                            className="p-2 rounded-xl bg-white border border-[#E5E5DF] hover:bg-[#E5E5DF] text-[#18181B] transition-fast shrink-0 cursor-pointer"
                            title={t('pronounce') || 'Listen'}
                          >
                            🔊
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Per-Grammar-Point SRS Enrollment Action */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vocabList.map((v) => (
              <div
                key={v._id}
                className="p-4 rounded-2xl border border-[#E5E5DF] bg-white shadow-2xs hover:border-[#18181B] transition-fast space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-xl font-black text-[#18181B] font-japanese">
                        {v.kanji || v.kana}
                      </div>
                      {isKatakanaLoanword(v.kanji || v.kana, v) && <LoanwordBadge />}
                    </div>
                    {v.kanji && (
                      <div className="text-xs font-bold text-[#71717A] font-japanese">
                        {v.kana}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => speakJapanese(v.kanji || v.kana)}
                    className="p-1.5 rounded-lg text-[#71717A] hover:bg-[#F4F4F0] cursor-pointer shrink-0"
                    title={t('pronounce') || 'Listen'}
                  >
                    🔊
                  </button>
                </div>

                <div className="text-sm font-medium text-[#27272A]">
                  {v.meanings?.join(', ')}
                </div>

                {v.partOfSpeech?.length > 0 && (
                  <div className="text-[10px] font-mono text-[#71717A]">
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
                      {v.exampleSentenceIds[0]?.english}
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
