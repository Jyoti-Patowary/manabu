'use client';

import { useState, useMemo } from 'react';
import { getAllStories, calculateReadingReadiness } from '@/lib/readingData';
import { useLanguage } from '@/context/LanguageContext';

const JLPT_COLORS = {
  N5: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  N4: 'bg-sky-50 text-sky-800 border-sky-200',
  N3: 'bg-amber-50 text-amber-800 border-amber-200',
  N2: 'bg-violet-50 text-violet-800 border-violet-200',
  N1: 'bg-rose-50 text-rose-800 border-rose-200',
};

export default function ReadingLibrary({
  stories: customStories,
  userCards = [],
  onSelectStory,
  initialLevel = 'all',
}) {
  const { t } = useLanguage();
  const [selectedLevel, setSelectedLevel] = useState(initialLevel);
  const [searchQuery, setSearchQuery] = useState('');

  const allStories = useMemo(() => {
    return customStories || getAllStories();
  }, [customStories]);

  const filteredStories = useMemo(() => {
    return allStories.filter((story) => {
      if (selectedLevel !== 'all' && story.jlpt !== selectedLevel) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = story.title?.toLowerCase().includes(q);
        const matchesTitleEn = story.title_en?.toLowerCase().includes(q);
        const matchesCategory = story.category?.toLowerCase().includes(q);
        return matchesTitle || matchesTitleEn || matchesCategory;
      }
      return true;
    });
  }, [allStories, selectedLevel, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6 animate-fadeIn pb-24 text-[#18181B]">
      {/* Header Banner */}
      <div className="rounded-3xl border border-[#E5E5DF] bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#F3E8FF] text-[#7E22CE] text-xs font-bold border border-[#E9D5FF]">
            <span>📖 {t('navLibrary') || '多読・多聴ライブラリ'}</span>
            <span>·</span>
            <span>Graded Readers</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#18181B] font-japanese">
            {t('navLibrary') || '生きた文脈で日本語を読む'}
          </h1>

          <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed">
            JLPTレベル別に構成された段階的リーダー。文中の単語をタップして辞書参照＆SRSキューへ即時追加できます。
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E5DF] p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Level Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: t('allPillar') || 'すべて' },
            { id: 'N5', label: 'N5' },
            { id: 'N4', label: 'N4' },
            { id: 'N3', label: 'N3' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedLevel(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-fast shrink-0 cursor-pointer ${
                selectedLevel === tab.id
                  ? 'bg-[#18181B] text-white'
                  : 'bg-[#F4F4F0] hover:bg-[#E5E5DF] text-[#71717A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative sm:w-64">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchDecksPlaceholder') || '本やカテゴリーを検索...'}
            className="w-full h-9 pl-8 pr-3 rounded-xl border border-[#E5E5DF] bg-[#FBFBF9] text-xs text-[#18181B] placeholder:text-[#A1A1AA] outline-none focus:border-[#18181B] focus:bg-white transition-all"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#A1A1AA]">
            🔍
          </span>
        </div>
      </div>

      {/* Grid of Book Covers with Reading Readiness % Badge */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStories.map((story) => {
          const readiness = calculateReadingReadiness(story, userCards);
          const levelColor = JLPT_COLORS[story.jlpt] || 'bg-slate-100 text-slate-800 border-slate-200';

          return (
            <div
              key={story.id}
              onClick={() => onSelectStory?.(story)}
              className="rounded-3xl border border-[#E5E5DF] bg-white p-6 shadow-2xs hover:border-[#18181B] hover:shadow-xs transition-fast cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Book Cover Visual */}
                <div className="h-36 rounded-2xl bg-[#F4F4F0] border border-[#E5E5DF] p-4 flex flex-col justify-between relative overflow-hidden group-hover:bg-[#EAEAE4] transition-colors">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${levelColor}`}>
                      {story.jlpt}
                    </span>
                    <span className="text-[11px] font-mono text-[#A1A1AA]">
                      {story.word_count || 120} words
                    </span>
                  </div>

                  <div className="text-xl font-black font-serif-jp text-[#18181B] line-clamp-2">
                    {story.title}
                  </div>

                  <div className="text-[10px] text-[#71717A] truncate font-medium">
                    {story.title_en}
                  </div>
                </div>

                {/* Readiness & Metadata */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#71717A] text-[11px]">Readiness (Known Vocab)</span>
                    <span className="font-mono font-bold text-[#D94826]">
                      {readiness.readinessPercent}%
                    </span>
                  </div>

                  {/* Readiness Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-[#F4F4F0] overflow-hidden">
                    <div
                      className="h-full bg-[#D94826] rounded-full transition-all duration-500"
                      style={{ width: `${readiness.readinessPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#F4F4F0] flex items-center justify-between text-xs font-bold text-[#18181B] group-hover:text-[#D94826] transition-colors">
                <span>{t('viewLesson') || '本文を読む →'}</span>
                <span className="text-[11px] text-[#A1A1AA] font-normal">
                  {readiness.knownCount}/{readiness.totalCount}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
