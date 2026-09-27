'use client';

import { useMemo, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function DashboardView({
  userCards = [],
  dueCount = 0,
  dueBreakdown = { vocab: 0, kanji: 0, grammar: 0, kana: 0 },
  streakData = { currentStreak: 0, todayQualified: false },
  examReadiness = { readinessPercent: 0, targetLevel: 'N5' },
  curriculumLessons = [],
  onOpenCourse,
  onSelectLesson,
  onStartReview,
  onOpenDrill,
  onOpenLibrary,
  onOpenExplore,
  onOpenExam,
  onSelectLevel,
  onOpenReadinessModal,
}) {
  const { t } = useLanguage();
  const [targetLvl, setTargetLvl] = useState(examReadiness.targetLevel || 'N5');

  const completedLessons = useMemo(() => {
    return (curriculumLessons || []).filter(l => l.isCompleted);
  }, [curriculumLessons]);

  const activeLesson = useMemo(() => {
    return (
      (curriculumLessons || []).find(l => l.isCurrent) ||
      (curriculumLessons || []).find(l => !l.isCompleted && !l.isLocked) ||
      (curriculumLessons || [])[0] ||
      null
    );
  }, [curriculumLessons]);

  const courseProgressPercent = useMemo(() => {
    if (!curriculumLessons || curriculumLessons.length === 0) return 0;
    return Math.round((completedLessons.length / curriculumLessons.length) * 100);
  }, [completedLessons, curriculumLessons]);

  // Today's formatted date in English
  const todayFormatted = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }, []);

  // Word of the day (picked deterministically from user vocab cards or fallback)
  const wordOfTheDay = useMemo(() => {
    const vocabCards = userCards.filter(c => (c.content_type || c.category) === 'Vocabulary' || c.content_type === 'vocab');
    if (vocabCards.length > 0) {
      const idx = (new Date().getDate() * 7) % vocabCards.length;
      return vocabCards[idx];
    }
    return {
      kanji: '習慣',
      reading: 'しゅうかん [0] (Heiban)',
      meaning: 'Habit, custom, practice',
      example: '毎日少しずつ勉強する習慣をつける。(Build a habit of studying a little every day.)',
    };
  }, [userCards]);

  const targetLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6 animate-fadeIn">
      {/* Top Header: Greeting + Date + Streak */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E5DF]">
        <div>
          <div className="text-xs font-mono font-semibold text-[#71717A] tracking-wider uppercase">
            {todayFormatted}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight mt-0.5">
            {t('welcomeBack') || 'Welcome back'}
          </h1>
        </div>

        {/* Top-Right Streak Indicator */}
        <button
          onClick={onOpenReadinessModal}
          className="self-start sm:self-auto flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border border-[#E5E5DF] bg-white hover:bg-[#F4F4F0] transition-fast shadow-2xs cursor-pointer group"
          title="Streak"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">🔥</span>
          <div className="text-left">
            <div className="text-xs font-black text-[#18181B] leading-none">
              {t('streakDays', { n: streakData.currentStreak }) || `${streakData.currentStreak} Day Streak`}
            </div>
            <div className="text-[10px] text-[#71717A] mt-0.5">
              {streakData.todayQualified ? (t('streakCompletedToday') || 'Completed today ✓') : (t('streakPendingToday') || 'Due today')}
            </div>
          </div>
        </button>
      </div>

      {/* Primary Learning Path Card: Course Progress & Next Lesson */}
      {curriculumLessons.length > 0 && activeLesson && (
        <div className="rounded-3xl border border-[#E5E5DF] bg-white p-6 sm:p-7 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-[#D94826] bg-[#FFF1EE] px-2.5 py-0.5 rounded-full border border-[#FECDCA]">
                {t('structuredCourseBadge') || 'STRUCTURED COURSE'}
              </span>
              <span className="text-xs text-[#71717A]">
                {completedLessons.length} / {curriculumLessons.length} Lessons Completed ({courseProgressPercent}%)
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-[#71717A]">
                Current Lesson: Lesson {activeLesson.order} (Unit {activeLesson.unit})
              </div>
              <h2 className="text-xl font-black text-[#18181B] mt-0.5">{activeLesson.title}</h2>
              {activeLesson.titleJapanese && (
                <div className="text-xs font-japanese font-bold text-[#71717A]">{activeLesson.titleJapanese}</div>
              )}
            </div>
            <p className="text-xs text-[#71717A] line-clamp-1">{activeLesson.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectLesson?.(activeLesson)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#D94826] hover:bg-[#BF3B1C] text-white font-black text-xs shadow-xs transition-fast cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{activeLesson.isCompleted ? (t('reviewLesson') || 'Review Lesson') : (t('continueLesson') || 'Continue Lesson')}</span>
              <span>→</span>
            </button>
            <button
              onClick={onOpenCourse}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl border border-[#E5E5DF] hover:bg-[#F4F4F0] text-xs font-bold text-[#18181B] transition-fast cursor-pointer"
            >
              {t('viewFullCurriculum') || 'View Full Curriculum'}
            </button>
          </div>
        </div>
      )}

      {/* 2-Column Desktop Grid / Stacked Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Large Primary Card: "Due Today" (MAIN UNMISSABLE ACTION) */}
        <div className="lg:col-span-7 rounded-3xl border border-[#E5E5DF] bg-white p-6 sm:p-8 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFF1EE] rounded-full blur-3xl -z-10 pointer-events-none opacity-60"></div>
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#71717A] bg-[#F4F4F0] px-2.5 py-1 rounded-md">
                {t('srsQueue') || 'SRS Queue'}
              </span>
              <span className="text-xs font-mono text-[#A1A1AA]">
                {t('estMinutes', { n: Math.ceil(dueCount * 0.4) }) || `Est: ~${Math.ceil(dueCount * 0.4)} mins`}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <div className="text-6xl sm:text-7xl font-black text-[#18181B] tracking-tight">
                {dueCount}
              </div>
              <div className="text-sm font-bold text-[#71717A]">
                {t('cardsDueForReview') || 'cards due for review'}
              </div>
            </div>

            {/* Content-Type Breakdown Pills */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl border border-[#BFDBFE] bg-[#DBEAFE]/40 text-center">
                <div className="text-[11px] font-bold text-[#1E40AF]">{t('vocab') || 'Vocabulary'}</div>
                <div className="text-lg font-black text-[#1E40AF] mt-0.5">
                  {dueBreakdown.vocab || 0}
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-[#FDE68A] bg-[#FEF3C7]/40 text-center">
                <div className="text-[11px] font-bold text-[#B45309]">{t('kanji') || 'Kanji'}</div>
                <div className="text-lg font-black text-[#B45309] mt-0.5">
                  {dueBreakdown.kanji || 0}
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-[#BBF7D0] bg-[#DCFCE7]/40 text-center">
                <div className="text-[11px] font-bold text-[#15803D]">{t('grammar') || 'Grammar'}</div>
                <div className="text-lg font-black text-[#15803D] mt-0.5">
                  {dueBreakdown.grammar || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Single Prominent "Start Review" Action */}
          <div className="mt-8 pt-4 border-t border-[#F4F4F0]">
            <button
              onClick={onStartReview}
              disabled={dueCount === 0 && userCards.length === 0}
              className="w-full py-4 rounded-2xl bg-[#D94826] text-white font-black text-base sm:text-lg hover:bg-[#BF3B1C] transition-fast shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer group"
            >
              <span>
                {dueCount > 0 
                  ? (t('startReview') || 'Start Review') 
                  : (userCards.length > 0 
                      ? (t('learnNewCards') || 'Learn New Cards (20 cards)') 
                      : (t('allReviewsCompleted') || 'All reviews completed for today! 🎉'))}
              </span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Secondary Card: Exam Readiness Ring */}
        <div className="lg:col-span-5 rounded-3xl border border-[#E5E5DF] bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#71717A]">{t('examReadiness') || 'Exam Readiness'}</span>
              {/* Level Selector */}
              <div className="flex gap-1">
                {targetLevels.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setTargetLvl(lvl);
                      onSelectLevel?.(lvl);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-fast cursor-pointer ${
                      targetLvl === lvl
                        ? 'bg-[#18181B] text-white'
                        : 'text-[#71717A] hover:bg-[#F4F4F0]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Circular Progress Gauge */}
            <div className="flex flex-col items-center justify-center my-6">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#F4F4F0]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#D94826] transition-all duration-700 ease-out"
                    strokeDasharray={`${Math.min(100, Math.max(0, examReadiness.readinessPercent || 0))}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-[#18181B] tracking-tight">
                    {examReadiness.readinessPercent || 0}%
                  </span>
                  <span className="text-[10px] font-bold text-[#71717A]">
                    {t('masteryLevel', { level: targetLvl }) || `${targetLvl} Mastery`}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#71717A] text-center leading-relaxed">
              {t('readinessDesc') || 'Calculated from cards that have reached stable SRS intervals (7+ days).'}
            </p>
          </div>

          <div className="pt-3 border-t border-[#F4F4F0]">
            <button
              onClick={onOpenReadinessModal}
              className="w-full py-2.5 rounded-xl border border-[#E5E5DF] text-xs font-bold text-[#18181B] hover:bg-[#F4F4F0] transition-fast text-center cursor-pointer"
            >
              {t('viewFluencyProjection') || 'View detailed fluency projection →'}
            </button>
          </div>
        </div>
      </div>

      {/* Row of Smaller Cards: Quick Links to Drill, Library, Explore, Exam */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Drill Mode */}
        <button
          onClick={onOpenDrill}
          className="p-4 rounded-2xl border border-[#E5E5DF] bg-white hover:border-[#18181B] hover:-translate-y-0.5 transition-fast text-left shadow-2xs cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg mb-2 group-hover:scale-105 transition-transform">
            🎯
          </div>
          <div className="font-bold text-sm text-[#18181B]">{t('quickDrillTitle') || 'Adaptive Drill'}</div>
          <div className="text-[11px] text-[#71717A] mt-0.5">{t('quickDrillSub') || 'Mistake-focused drill'}</div>
        </button>

        {/* Reading Library */}
        <button
          onClick={onOpenLibrary}
          className="p-4 rounded-2xl border border-[#E5E5DF] bg-white hover:border-[#18181B] hover:-translate-y-0.5 transition-fast text-left shadow-2xs cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-lg mb-2 group-hover:scale-105 transition-transform">
            📖
          </div>
          <div className="font-bold text-sm text-[#18181B]">{t('quickLibraryTitle') || 'Graded Reader'}</div>
          <div className="text-[11px] text-[#71717A] mt-0.5">{t('quickLibrarySub') || 'Contextual SRS reading'}</div>
        </button>

        {/* Explore / Graph */}
        <button
          onClick={onOpenExplore}
          className="p-4 rounded-2xl border border-[#E5E5DF] bg-white hover:border-[#18181B] hover:-translate-y-0.5 transition-fast text-left shadow-2xs cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-lg mb-2 group-hover:scale-105 transition-transform">
            🕸️
          </div>
          <div className="font-bold text-sm text-[#18181B]">{t('quickGraphTitle') || 'Relationship Graph'}</div>
          <div className="text-[11px] text-[#71717A] mt-0.5">{t('quickGraphSub') || 'Kanji ⇄ Vocab ⇄ Grammar'}</div>
        </button>

        {/* Mock Exam */}
        <button
          onClick={onOpenExam}
          className="p-4 rounded-2xl border border-[#E5E5DF] bg-white hover:border-[#18181B] hover:-translate-y-0.5 transition-fast text-left shadow-2xs cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center text-lg mb-2 group-hover:scale-105 transition-transform">
            ⏱
          </div>
          <div className="font-bold text-sm text-[#18181B]">{t('quickExamTitle') || 'JLPT Mock Exam'}</div>
          <div className="text-[11px] text-[#71717A] mt-0.5">{t('quickExamSub') || 'Timed test with audio'}</div>
        </button>
      </div>

      {/* Bottom Section: "Word of the Day" Card */}
      {wordOfTheDay && (
        <div className="rounded-3xl border border-[#E5E5DF] bg-white p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E40AF] bg-[#DBEAFE] px-2 py-0.5 rounded">
                {t('wordOfTheDay') || 'Word of the Day'}
              </span>
              <span className="text-xs font-mono text-[#A1A1AA]">
                {wordOfTheDay.reading || ''}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#18181B] font-japanese">
              {wordOfTheDay.kanji || wordOfTheDay.name}
            </div>
            <p className="text-xs text-[#71717A] max-w-xl">
              <strong className="text-[#18181B]">{wordOfTheDay.meaning}</strong>
              {wordOfTheDay.example ? ` — ${wordOfTheDay.example}` : ''}
            </p>
          </div>

          <button
            onClick={() => onStartReview()}
            className="shrink-0 px-4 py-2 rounded-xl border border-[#E5E5DF] hover:bg-[#F4F4F0] text-xs font-bold text-[#18181B] transition-fast cursor-pointer"
          >
            {t('reviewInQueue') || 'Review in Queue'}
          </button>
        </div>
      )}
    </div>
  );
}

