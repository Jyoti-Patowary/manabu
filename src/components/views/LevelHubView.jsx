'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import LessonSetView from './LessonSetView';

export default function LevelHubView({
  level = 'N5',
  userCards = [],
  onStartStudy,
  onStartDrill,
  onStartMockExam,
  onOpenCourse,
}) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('vocab'); // 'vocab' | 'kanji' | 'grammar'
  const [activeLessonSet, setActiveLessonSet] = useState(null); // When open, shows LessonSetView

  const levelTitles = {
    kana: { title: 'かな (Kana)', sub: '五十音・ひらがな・カタカナ・濁音・拗音', totalItems: 104 },
    N5: { title: 'JLPT N5', sub: '初級・基本的な語彙・漢字・日常文法', totalItems: 983 },
    N4: { title: 'JLPT N4', sub: '初中級・身近な話題の会話・基本表現', totalItems: 1791 },
    N3: { title: 'JLPT N3', sub: '中級・日常的な場面で使われる日本語の理解', totalItems: 4251 },
    N2: { title: 'JLPT N2', sub: '上中級・幅広い場面の日本語・ビジネス基礎', totalItems: 6760 },
    N1: { title: 'JLPT N1', sub: '上級・論理的で抽象度の高い文章の完全理解', totalItems: 11326 },
  };

  const currentLevelInfo = levelTitles[level] || levelTitles.N5;

  // Filter cards by level
  const levelCards = useMemo(() => {
    return userCards.filter(c => (c.jlpt_level || c.jlpt) === level || (level === 'kana' && (c.content_type === 'kana' || c.category?.includes('Kana'))));
  }, [userCards, level]);

  // Split cards by content type
  const vocabCards = useMemo(() => {
    return levelCards.filter(c => (c.content_type || c.category) === 'Vocabulary' || c.content_type === 'vocab');
  }, [levelCards]);

  const kanjiCards = useMemo(() => {
    return levelCards.filter(c => (c.content_type || c.category) === 'Kanji' || c.content_type === 'kanji');
  }, [levelCards]);

  const grammarCards = useMemo(() => {
    return levelCards.filter(c => (c.content_type || c.category) === 'Grammar' || c.content_type === 'grammar');
  }, [levelCards]);

  // Overall level completion calculation
  const overallMastery = useMemo(() => {
    if (levelCards.length === 0) return 0;
    const mastered = levelCards.filter(c => (c.interval || 0) >= 7).length;
    return Math.round((mastered / levelCards.length) * 100);
  }, [levelCards]);

  // Helper to chunk items into digestible sets of ~25 items each
  const chunkIntoSets = (items, prefix, categoryLabel) => {
    const CHUNK_SIZE = 25;
    const sets = [];
    const count = Math.max(1, Math.ceil(items.length / CHUNK_SIZE));

    for (let i = 0; i < count; i++) {
      const slice = items.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      const masteredInSlice = slice.filter(c => (c.interval || 0) >= 7).length;
      const mastery = slice.length > 0 ? Math.round((masteredInSlice / slice.length) * 100) : 0;

      // Simulated prerequisite dependency check: Set 3+ in grammar requires vocab completion
      const isLocked = categoryLabel === 'grammar' && i >= 2 && overallMastery < 30;

      sets.push({
        id: `${level}-${prefix}-${i + 1}`,
        title: `${categoryLabel} Set ${i + 1}`,
        subtitle: `${categoryLabel} ${i * CHUNK_SIZE + 1} 〜 ${Math.min(items.length, (i + 1) * CHUNK_SIZE)}`,
        items: slice,
        itemCount: slice.length,
        mastery,
        isLocked,
        lockReason: '前提となるN5語彙の定着率30%以上でアンロック',
      });
    }
    return sets;
  };

  const vocabSets = useMemo(() => chunkIntoSets(vocabCards, 'vocab', '語彙 (Vocab)'), [vocabCards, overallMastery, level]);
  const kanjiSets = useMemo(() => chunkIntoSets(kanjiCards, 'kanji', '漢字 (Kanji)'), [kanjiCards, overallMastery, level]);
  const grammarSets = useMemo(() => chunkIntoSets(grammarCards, 'grammar', '文法 (Grammar)'), [grammarCards, overallMastery, level]);

  // If a lesson set is selected, show LessonSetView
  if (activeLessonSet) {
    return (
      <LessonSetView
        setInfo={activeLessonSet}
        contentType={activeTab}
        items={activeLessonSet.items}
        allVocabCards={vocabCards}
        onBack={() => setActiveLessonSet(null)}
        onStartDrill={(items) => {
          setActiveLessonSet(null);
          onStartDrill(items);
        }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6 animate-fadeIn pb-24">
      {/* 1. Level Header Card: Level Name + Description + Completion % */}
      <div className="rounded-3xl border border-[#E5E5DF] bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#D94826] bg-[#FFF1EE] px-2.5 py-0.5 rounded-full border border-[#FECDCA]">
                {t('levelHub') || 'Level Hub'}
              </span>
              <span className="text-xs text-[#71717A]">
                {t('totalRegisteredCards', { n: levelCards.length }) || `登録カード計 ${levelCards.length} 枚`}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight">
              {currentLevelInfo.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] max-w-xl">
              {currentLevelInfo.sub}
            </p>
          </div>

          {/* Overall Mastery Ring / Bar */}
          <div className="flex items-center gap-4 shrink-0 bg-[#FBFBF9] p-4 rounded-2xl border border-[#E5E5DF]">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#E5E5DF]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#D94826] transition-all duration-700"
                  strokeDasharray={`${overallMastery}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-black text-[#18181B]">
                {overallMastery}%
              </span>
            </div>

            <div>
              <div className="text-xs font-black text-[#18181B]">{t('masteryRate') || '修了率 (Mastery)'}</div>
              <div className="text-[10px] text-[#71717A] mt-0.5">{t('masterySub') || '定着カード / 全カード'}</div>
            </div>
          </div>
        </div>

        {/* Quick Launch Action Bar */}
        <div className="mt-6 pt-4 border-t border-[#F4F4F0] flex flex-wrap gap-2">
          <button
            onClick={() => onStartStudy({ level })}
            className="px-4 py-2.5 rounded-xl bg-[#D94826] text-white text-xs font-bold hover:bg-[#BF3B1C] transition-fast shadow-xs cursor-pointer flex items-center gap-2"
          >
            <span>{t('reviewLevelCards', { level: currentLevelInfo.title }) || `${currentLevelInfo.title} の復習`}</span>
            <span>⚡</span>
          </button>

          <button
            onClick={() => onStartDrill(levelCards)}
            className="px-4 py-2.5 rounded-xl border border-[#E5E5DF] text-[#18181B] text-xs font-bold hover:bg-[#F4F4F0] transition-fast cursor-pointer flex items-center gap-1.5"
          >
            <span>{t('navDrill') || '集中ドリル'}</span>
            <span>🎯</span>
          </button>

          {level !== 'kana' && (
            <button
              onClick={() => onStartMockExam(level)}
              className="px-4 py-2.5 rounded-xl border border-[#E5E5DF] text-[#18181B] text-xs font-bold hover:bg-[#F4F4F0] transition-fast cursor-pointer flex items-center gap-1.5"
            >
              <span>{t('quickExamTitle', { level }) || `${level} 模擬試験`}</span>
              <span>⏱</span>
            </button>
          )}

          {onOpenCourse && (
            <button
              onClick={onOpenCourse}
              className="px-4 py-2.5 rounded-xl border border-[#D94826] bg-[#FFF1EE] text-[#D94826] text-xs font-bold hover:bg-[#FECDCA] transition-fast cursor-pointer flex items-center gap-1.5"
            >
              <span>カリキュラム講義を見る</span>
              <span>📚</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Three Tabs: Vocabulary / Kanji / Grammar */}
      <div className="flex border-b border-[#E5E5DF] gap-4 sm:gap-8">
        <button
          onClick={() => setActiveTab('vocab')}
          className={`pb-3 text-sm font-bold transition-fast relative cursor-pointer flex items-center gap-2 ${
            activeTab === 'vocab' ? 'text-[#18181B]' : 'text-[#71717A] hover:text-[#18181B]'
          }`}
        >
          <span>{t('vocabPillar') || '語彙 (Vocabulary)'}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DBEAFE] text-[#1E40AF] font-bold">
            {vocabCards.length}
          </span>
          {activeTab === 'vocab' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E40AF]"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('kanji')}
          className={`pb-3 text-sm font-bold transition-fast relative cursor-pointer flex items-center gap-2 ${
            activeTab === 'kanji' ? 'text-[#18181B]' : 'text-[#71717A] hover:text-[#18181B]'
          }`}
        >
          <span>{t('kanjiPillar') || '漢字 (Kanji)'}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] font-bold">
            {kanjiCards.length}
          </span>
          {activeTab === 'kanji' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B45309]"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('grammar')}
          className={`pb-3 text-sm font-bold transition-fast relative cursor-pointer flex items-center gap-2 ${
            activeTab === 'grammar' ? 'text-[#18181B]' : 'text-[#71717A] hover:text-[#18181B]'
          }`}
        >
          <span>{t('grammarPillar') || '文法 (Grammar)'}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] font-bold">
            {grammarCards.length}
          </span>
          {activeTab === 'grammar' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#15803D]"></span>
          )}
        </button>
      </div>

      {/* 3. Chunked Lesson Sets Grid (~20-30 items each) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(activeTab === 'vocab' ? vocabSets : activeTab === 'kanji' ? kanjiSets : grammarSets).map((set) => {
          return (
            <div
              key={set.id}
              className={`rounded-2xl border p-5 transition-fast flex flex-col justify-between ${
                set.isLocked
                  ? 'border-[#E5E5DF] bg-[#F4F4F0]/60 opacity-60 cursor-not-allowed'
                  : 'border-[#E5E5DF] bg-white hover:border-[#18181B] hover:shadow-2xs cursor-pointer'
              }`}
              onClick={() => {
                if (!set.isLocked) {
                  setActiveLessonSet(set);
                }
              }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#71717A]">
                    {set.itemCount} items
                  </span>

                  {set.isLocked ? (
                    <span className="text-xs" title={set.lockReason}>🔒</span>
                  ) : (
                    <span className="text-xs font-mono font-bold text-[#D94826]">
                      {set.mastery}% {t('mastery') || '定着'}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-[#18181B] mt-2">
                  {set.title}
                </h3>
                <p className="text-xs text-[#71717A] mt-0.5">
                  {set.subtitle}
                </p>

                {set.isLocked && (
                  <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg mt-3 border border-amber-200">
                    🔒 {set.lockReason}
                  </p>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-[#F4F4F0] flex items-center justify-between">
                <span className="text-xs font-bold text-[#18181B] hover:text-[#D94826] transition-colors">
                  {set.isLocked ? (t('locked') || 'ロック中') : (t('viewLesson') || 'レッスンを見る →')}
                </span>

                {!set.isLocked && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartDrill(set.items);
                    }}
                    className="p-1.5 rounded-lg hover:bg-[#F4F4F0] text-xs font-bold text-[#71717A] hover:text-[#18181B] transition-fast cursor-pointer"
                    title={t('startDrillForSet') || 'このセットを即時ドリル'}
                  >
                    🎯 {t('navDrill') || 'ドリル'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

