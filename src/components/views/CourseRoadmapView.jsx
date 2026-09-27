'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function CourseRoadmapView({
  lessons = [],
  onSelectLesson,
  onStartReview,
  dueCount = 0,
}) {
  const { t } = useLanguage();
  const [selectedUnit, setSelectedUnit] = useState('all'); // 'all' | 0 | 1 | 2 ...
  const [selectedJlptFilter, setSelectedJlptFilter] = useState('all'); // 'all' | 'N5' ...

  // Group lessons by Unit
  const unitDefinitions = [
    {
      unit: 0,
      title: 'Unit 0: Writing Systems & Kanji Fundamentals',
      titleJapanese: '文字体系と漢字基礎',
      description: 'Master the 46 Hiragana, 46 Katakana, voiced and blended sounds, and the building blocks of Kanji (radicals and on/kun readings).',
      jlpt: 'Intro',
    },
    {
      unit: 1,
      title: 'Unit 1: Foundations & First Sentences',
      titleJapanese: '基本文型と日常会話の基礎',
      description: 'Essential greetings, the copula (da/desu), topic marker (wa), subject marker (ga), demonstratives, and numbers.',
      jlpt: 'N5',
    },
    {
      unit: 2,
      title: 'Unit 2: Action, Time, & Basic Movement',
      titleJapanese: '動作・目的語・時間表現と動詞活用',
      description: 'SOV sentence structure, direct objects (o), action venues (de), movement targets (e/ni), polite forms (-masu), and basic time expressions.',
      jlpt: 'N5',
    },
    {
      unit: 3,
      title: 'Unit 3: Adjectives & Descriptive Language',
      titleJapanese: '形容詞による描写と修飾',
      description: 'い-adjectives, な-adjectives, predicate forms, noun modification, past/negative conjugations, and degree adverbs.',
      jlpt: 'N5',
    },
    {
      unit: 4,
      title: 'Unit 4: The Te-Form & Sentence Linking',
      titleJapanese: 'て形の活用と文の連結',
      description: 'Verb groupings (godan, ichidan, irregular), te-form conjugation rules, sequence of actions, and continuous state (-te iru).',
      jlpt: 'N5',
    },
    {
      unit: 5,
      title: 'Unit 5: Plain Form & Informal Speech',
      titleJapanese: '普通形（タ形・ナイ形・辞書形）と複文',
      description: 'Informal speech, casual past ta-form, negative nai-form, noun-modifying relative clauses, and experiential -ta koto ga aru.',
      jlpt: 'N5-N4',
    },
    {
      unit: 6,
      title: 'Unit 6: Desires, Requests, & Permissions',
      titleJapanese: '希望・依頼・許可と禁止',
      description: 'Expressing desires (-tai / -te hoshii), making polite requests (-te kudasai), asking permission (-te mo ii), and prohibitions.',
      jlpt: 'N4',
    },
    {
      unit: 7,
      title: 'Unit 7: Obligations, Complex Clauses, & Quotations',
      titleJapanese: '義務・条件・引用と能力表現',
      description: 'Obligations (must do), conditional structures, indirect and direct quotation, potential verbs, and stating reasons.',
      jlpt: 'N4',
    },
  ];

  // Completion calculation
  const completedCount = useMemo(() => {
    return lessons.filter((l) => l.isCompleted).length;
  }, [lessons]);

  const progressPercent = useMemo(() => {
    if (lessons.length === 0) return 0;
    return Math.round((completedCount / lessons.length) * 100);
  }, [completedCount, lessons.length]);

  // Current active lesson (first uncompleted & unlocked lesson)
  const currentLesson = useMemo(() => {
    return lessons.find((l) => l.isCurrent) || lessons.find((l) => !l.isCompleted && !l.isLocked) || lessons[0];
  }, [lessons]);

  // Filter lessons based on unit and JLPT
  const filteredLessons = useMemo(() => {
    return lessons.filter((l) => {
      const matchUnit = selectedUnit === 'all' || l.unit === Number(selectedUnit);
      const matchJlpt =
        selectedJlptFilter === 'all' ||
        (selectedJlptFilter === 'N5' && (l.unit === 0 || l.unit === 1 || l.unit === 2 || l.unit === 3 || l.unit === 4)) ||
        (selectedJlptFilter === 'N4' && (l.unit === 5 || l.unit === 6 || l.unit === 7));
      return matchUnit && matchJlpt;
    });
  }, [lessons, selectedUnit, selectedJlptFilter]);

  // Group filtered lessons by unit
  const groupedByUnit = useMemo(() => {
    const map = new Map();
    unitDefinitions.forEach((def) => {
      map.set(def.unit, { ...def, lessons: [] });
    });

    filteredLessons.forEach((l) => {
      if (map.has(l.unit)) {
        map.get(l.unit).lessons.push(l);
      }
    });

    return Array.from(map.values()).filter((u) => u.lessons.length > 0);
  }, [filteredLessons]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-8 animate-fadeIn pb-24">
      {/* 1. Header Banner & Progress */}
      <div className="rounded-3xl border border-[#E5E5DF] bg-white p-6 sm:p-8 shadow-xs space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#D94826] bg-[#FFF1EE] px-2.5 py-0.5 rounded-full border border-[#FECDCA]">
                {t('structuredCourseBadge') || 'STRUCTURED COURSE'}
              </span>
              <span className="text-xs text-[#71717A]">
                {lessons.length} Lessons · 8 Units
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">
              {t('courseRoadmapTitle') || 'Japanese Learning Roadmap'}
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed">
              {t('courseRoadmapSub') || 'A sequenced path from writing systems through grammar patterns and contextual vocabulary.'}
            </p>
          </div>

          {/* Overall Progress Gauge */}
          <div className="bg-[#FBFBF9] p-5 rounded-2xl border border-[#E5E5DF] shrink-0 text-center min-w-[200px] space-y-2">
            <div className="text-xs font-bold text-[#71717A]">{t('totalCourseProgress') || 'Total Course Progress'}</div>
            <div className="text-3xl font-black text-[#18181B]">{progressPercent}%</div>
            <div className="w-full bg-[#E5E5DF] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#D94826] h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-[#71717A]">
              {completedCount} / {lessons.length} Lessons Completed
            </div>
          </div>
        </div>

        {/* 2. Spotlight: Current Active Lesson */}
        {currentLesson && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8F6] border border-[#FECDCA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-[#D94826] bg-white px-2 py-0.5 rounded border border-[#FECDCA]">
                  NEXT LESSON
                </span>
                <span className="text-xs font-bold text-[#71717A]">
                  Lesson {currentLesson.order} (Unit {currentLesson.unit})
                </span>
              </div>
              <div className="text-base sm:text-lg font-black text-[#18181B]">
                {currentLesson.title}
              </div>
              <div className="text-xs text-[#71717A] line-clamp-1">
                {currentLesson.description}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onSelectLesson(currentLesson)}
                className="px-5 py-2.5 rounded-xl bg-[#D94826] hover:bg-[#BF3B1C] text-white text-xs font-black shadow-xs transition-fast cursor-pointer"
              >
                {currentLesson.isCompleted ? (t('reviewLesson') || 'Review Lesson →') : (t('startLesson') || 'Start Lesson Now →')}
              </button>
            </div>
          </div>
        )}

        {/* 3. Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#F4F4F0]">
          {/* Unit selector buttons */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedUnit('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-fast cursor-pointer shrink-0 ${
                selectedUnit === 'all'
                  ? 'bg-[#18181B] text-white'
                  : 'text-[#71717A] hover:bg-[#F4F4F0]'
              }`}
            >
              {t('allUnits') || 'All Units'}
            </button>
            {unitDefinitions.map((u) => (
              <button
                key={u.unit}
                onClick={() => setSelectedUnit(String(u.unit))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-fast cursor-pointer shrink-0 ${
                  selectedUnit === String(u.unit)
                    ? 'bg-[#18181B] text-white'
                    : 'text-[#71717A] hover:bg-[#F4F4F0]'
                }`}
              >
                Unit {u.unit}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Units & Lessons List */}
      <div className="space-y-10">
        {groupedByUnit.map((unitGroup) => (
          <div key={unitGroup.unit} className="space-y-4">
            {/* Unit Header */}
            <div className="border-b border-[#E5E5DF] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#71717A] bg-[#F4F4F0] px-2 py-0.5 rounded">
                  Unit {unitGroup.unit}
                </span>
                <span className="text-xs font-bold text-[#18181B]">
                  {unitGroup.titleJapanese}
                </span>
                <span className="text-[10px] text-[#A1A1AA]">
                  (JLPT {unitGroup.jlpt})
                </span>
              </div>
              <h2 className="text-xl font-black text-[#18181B] mt-1">
                {unitGroup.title}
              </h2>
              <p className="text-xs text-[#71717A] mt-0.5">
                {unitGroup.description}
              </p>
            </div>

            {/* Lessons Grid within Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unitGroup.lessons.map((lesson) => {
                const isLocked = lesson.isLocked;
                const isCompleted = lesson.isCompleted;
                const isCurrent = lesson.isCurrent;

                return (
                  <div
                    key={lesson._id}
                    onClick={() => {
                      if (!isLocked) {
                        onSelectLesson(lesson);
                      }
                    }}
                    className={`rounded-2xl border p-5 transition-all flex flex-col justify-between select-none ${
                      isLocked
                        ? 'border-[#E5E5DF] bg-[#F8F8F6] opacity-70 cursor-not-allowed'
                        : isCurrent
                        ? 'border-[#D94826] bg-white shadow-sm ring-2 ring-[#D94826]/10 hover:shadow-md cursor-pointer'
                        : isCompleted
                        ? 'border-[#E5E5DF] bg-white hover:border-[#18181B] cursor-pointer'
                        : 'border-[#E5E5DF] bg-white hover:border-[#18181B] cursor-pointer'
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#71717A]">
                          Lesson {lesson.order}
                        </span>

                        {isCompleted ? (
                          <span className="text-[10px] font-bold text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <span>✓</span>
                            <span>{t('lessonCompletedBadge') || 'Completed'}</span>
                          </span>
                        ) : isLocked ? (
                          <span className="text-[10px] font-bold text-[#71717A] bg-[#E5E5DF] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span>🔒</span>
                            <span>{t('lessonLockedBadge') || 'Locked'}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-[#D94826] bg-[#FFF1EE] px-2 py-0.5 rounded-full border border-[#FECDCA]">
                            {t('lessonReadyBadge') || 'Available'}
                          </span>
                        )}
                      </div>

                      {/* Lesson Titles */}
                      <div>
                        <h3 className="text-base font-black text-[#18181B] leading-snug">
                          {lesson.title}
                        </h3>
                        {lesson.titleJapanese && (
                          <div className="text-xs font-japanese font-bold text-[#71717A] mt-0.5">
                            {lesson.titleJapanese}
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#71717A] line-clamp-2 leading-relaxed">
                        {lesson.description}
                      </p>

                      {/* Content Item Breakdown */}
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {lesson.counts?.kana > 0 && (
                          <span className="text-[10px] font-bold text-[#71717A] bg-[#F4F4F0] px-2 py-0.5 rounded">
                            Kana {lesson.counts.kana}
                          </span>
                        )}
                        {lesson.counts?.grammar > 0 && (
                          <span className="text-[10px] font-bold text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            Grammar {lesson.counts.grammar}
                          </span>
                        )}
                        {lesson.counts?.vocab > 0 && (
                          <span className="text-[10px] font-bold text-[#1E40AF] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            Vocab {lesson.counts.vocab}
                          </span>
                        )}
                        {lesson.counts?.kanji > 0 && (
                          <span className="text-[10px] font-bold text-[#B45309] bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                            Kanji {lesson.counts.kanji}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-4 mt-4 border-t border-[#F4F4F0] flex items-center justify-between">
                      {isLocked ? (
                        <div className="text-[11px] text-[#A1A1AA] flex items-center gap-1.5">
                          <span>🔒</span>
                          <span>{t('prereqRequired') || 'Prerequisite required'}</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={`text-xs font-bold transition-fast ${
                            isCurrent
                              ? 'text-[#D94826] font-black'
                              : 'text-[#18181B] hover:text-[#D94826]'
                          }`}
                        >
                          {isCompleted ? (t('reviewLesson') || 'Review →') : (t('startLesson') || 'Start Lesson →')}
                        </button>
                      )}

                      <span className="text-[10px] font-mono text-[#A1A1AA]">
                        ~{lesson.estimatedMinutes || 15} mins
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
