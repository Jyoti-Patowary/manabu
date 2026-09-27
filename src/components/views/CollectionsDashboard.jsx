'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import ExamReadinessWidget from '../ExamReadinessWidget';

function getCollectionMeta(name, t) {
  const map = {
    Hiragana: {
      kanji: '平',
      label: t('hiragana') || 'ひらがな',
      subtitle: t('fiftySounds') || '五十音・基本',
      accent: 'bg-slate-600',
      border: 'border-[#E8E8E2] hover:border-slate-400',
      tint: 'bg-slate-100 text-slate-800',
      tag: t('kana') || 'かな',
    },
    Katakana: {
      kanji: '片',
      label: t('katakana') || 'カタカナ',
      subtitle: t('loanwords') || '外来語・符号',
      accent: 'bg-slate-600',
      border: 'border-[#E8E8E2] hover:border-slate-400',
      tint: 'bg-slate-100 text-slate-800',
      tag: t('kana') || 'かな',
    },
    Kana: {
      kanji: '仮',
      label: t('kanaPillar') || 'かな (Kana)',
      subtitle: t('fiftySounds') || 'ひらがな・カタカナ',
      accent: 'bg-slate-600',
      border: 'border-[#E8E8E2] hover:border-slate-400',
      tint: 'bg-slate-100 text-slate-800',
      tag: t('kana') || 'かな',
    },
    Vocabs: {
      kanji: '語',
      label: t('vocabPillar') || '語彙',
      subtitle: t('vocab') || '単語・イディオム',
      accent: 'bg-[#1E40AF]',
      border: 'border-blue-100 hover:border-blue-300',
      tint: 'bg-blue-50 text-[#1E40AF]',
      tag: t('vocab') || '語彙',
    },
    Vocabulary: {
      kanji: '語',
      label: t('vocabPillar') || '語彙 (Vocabulary)',
      subtitle: t('vocab') || '単語・イディオム',
      accent: 'bg-[#1E40AF]',
      border: 'border-blue-100 hover:border-blue-300',
      tint: 'bg-blue-50 text-[#1E40AF]',
      tag: t('vocab') || '語彙',
    },
    Grammar: {
      kanji: '文',
      label: t('grammarPillar') || '文法',
      subtitle: t('grammar') || '構文・接続ルール',
      accent: 'bg-[#15803D]',
      border: 'border-emerald-100 hover:border-emerald-300',
      tint: 'bg-emerald-50 text-[#15803D]',
      tag: t('grammar') || '文法',
    },
    Kanji: {
      kanji: '字',
      label: t('kanjiPillar') || '漢字',
      subtitle: t('kanji') || '音訓・部首・筆順',
      accent: 'bg-[#B45309]',
      border: 'border-amber-100 hover:border-amber-300',
      tint: 'bg-amber-50 text-[#B45309]',
      tag: t('kanji') || '漢字',
    },
  };
  return map[name] || {
    kanji: '学',
    label: name,
    subtitle: t('folders') || 'Folder',
    accent: 'bg-slate-700',
    border: 'border-slate-200 hover:border-slate-400',
    tint: 'bg-slate-100 text-slate-700',
    tag: t('folders') || 'フォルダ',
  };
}

function normalizeJlpt(value) {
  if (value == null) return '';
  const text = String(value).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const directMatch = text.match(/N[1-5]/);
  if (directMatch) return directMatch[0];
  const jlptMatch = text.match(/JLPTN([1-5])/);
  if (jlptMatch) return `N${jlptMatch[1]}`;
  return '';
}

export default function CollectionsDashboard({
  collections,
  activeJlptFilter = 'all',
  userCards = [],
  onOpenReadinessModal,
  onSelectCollection,
  onCreateCollection,
  onQuickStudyDeck,
}) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const now = useMemo(() => Date.now(), []);

  // Filter collections and decks based on JLPT level and Search Query
  const filteredCollections = useMemo(() => {
    const q = search.trim().toLowerCase();

    return collections
      .map((col) => {
        const filteredDecks = (col.decks || []).filter((deck) => {
          // 1. JLPT filter
          if (activeJlptFilter !== 'all') {
            if (activeJlptFilter === 'kana') {
              const isKanaCol = col.name.toLowerCase().includes('hiragana') || col.name.toLowerCase().includes('katakana') || col.name.toLowerCase().includes('kana');
              const isKanaDeck = deck.name.toLowerCase().includes('hiragana') || deck.name.toLowerCase().includes('katakana') || deck.name.toLowerCase().includes('kana');
              if (!isKanaCol && !isKanaDeck) return false;
            } else {
              const deckJlpt = normalizeJlpt(deck.name);
              const cardJlpts = (deck.cards || []).map((c) => normalizeJlpt(c.jlpt));
              const hasLevel = deckJlpt === activeJlptFilter || cardJlpts.includes(activeJlptFilter);
              if (!hasLevel) return false;
            }
          }

          // 2. Search query filter
          if (!q) return true;
          const matchCol = col.name.toLowerCase().includes(q);
          const matchDeck = deck.name.toLowerCase().includes(q);
          const matchCards = (deck.cards || []).some(
            (c) =>
              (c.kanji || '').toLowerCase().includes(q) ||
              (c.reading || '').toLowerCase().includes(q) ||
              (c.meaning || '').toLowerCase().includes(q) ||
              (c.grammar || '').toLowerCase().includes(q)
          );
          return matchCol || matchDeck || matchCards;
        });

        return {
          ...col,
          filteredDecks,
        };
      })
      .filter((col) => {
        if (activeJlptFilter !== 'all') {
          return col.filteredDecks.length > 0;
        }
        if (!search) return true;
        return col.filteredDecks.length > 0 || col.name.toLowerCase().includes(search.toLowerCase());
      });
  }, [collections, activeJlptFilter, search]);

  const totalDecks = collections.reduce((sum, c) => sum + (c.decks?.length || 0), 0);
  const totalCards = collections.reduce(
    (sum, c) => sum + (c.decks?.reduce((dSum, d) => dSum + (d.cards?.length || 0), 0) || 0),
    0
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner - Serene Stationery Aesthetic */}
      <section className="relative overflow-hidden rounded-3xl bg-[#FFFFFF] text-[#1A1A1A] p-6 sm:p-8 md:p-10 shadow-xs border border-[#E8E8E2]">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none select-none text-9xl font-black font-serif-jp">
          学び
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#D94826]/10 text-[#D94826] border border-[#D94826]/20 px-3 py-1 rounded-full text-[11px] font-black tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-[#D94826]" />
            <span>{t('brandSub') || 'JLPT N5〜N1 統合ポータル'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-3 font-serif-jp">
            {t('collectionsPortalTitle')}<br className="hidden sm:inline" />
            <span className="text-[#666660] font-sans font-medium text-lg sm:text-2xl">
              {t('collectionsPortalSub')}
            </span>
          </h1>

          <p className="text-sm text-[#666660] leading-relaxed mb-6 max-w-2xl">
            {t('collectionsPortalDesc')}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#FAFAF7] px-4 py-2 rounded-xl border border-[#E8E8E2] flex items-center gap-2">
              <span className="text-slate-400 text-xs font-semibold">{t('totalFolders')}</span>
              <span className="font-black text-[#1A1A1A] text-base">{collections.length}</span>
            </div>
            <div className="bg-[#FAFAF7] px-4 py-2 rounded-xl border border-[#E8E8E2] flex items-center gap-2">
              <span className="text-slate-400 text-xs font-semibold">{t('totalDecks')}</span>
              <span className="font-black text-[#1A1A1A] text-base">{totalDecks}</span>
            </div>
            <div className="bg-[#FAFAF7] px-4 py-2 rounded-xl border border-[#E8E8E2] flex items-center gap-2">
              <span className="text-slate-400 text-xs font-semibold">{t('totalCards')}</span>
              <span className="font-black text-[#D94826] text-base">{totalCards}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Exam Readiness & Time-to-Fluency Hero Widget */}
      <ExamReadinessWidget
        userCards={userCards}
        activeJlptFilter={activeJlptFilter}
        onOpenModal={onOpenReadinessModal}
      />

      {/* Filter, Actions and Search Bar */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('collectionsList')}</span>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {filteredCollections.length}
            </span>
          </h2>
          {activeJlptFilter !== 'all' && (
            <span className="text-xs font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded-md">
              {activeJlptFilter} {t('filteringWith')}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full h-10 pl-9 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center bg-slate-100"
            >
              ×
            </button>
          )}
        </div>
      </section>

      {/* Responsive Collections Grid */}
      {filteredCollections.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCollections.map((col) => {
            const meta = getCollectionMeta(col.name, t);

            const decksToShow = col.filteredDecks || col.decks || [];
            const deckCount = decksToShow.length;
            const cardCount = decksToShow.reduce((sum, d) => sum + (d.cards?.length || 0), 0);
            
            const dueCards = decksToShow.reduce((sum, d) => {
              return sum + (d.cards || []).filter((c) => c.dueDate <= now && c.repetitions > 0).length;
            }, 0);

            return (
              <div
                key={col.id}
                onClick={() => onSelectCollection(col.id)}
                className={`group cursor-pointer rounded-2xl bg-white border ${meta.border} p-5 sm:p-6 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden`}
              >
                {/* Top Accent Strip */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${meta.accent}`} />

                {/* Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl shadow-xs ${meta.tint}`}>
                        {meta.kanji}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {meta.subtitle}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-slate-950 transition-colors">
                          {meta.label}
                        </h3>
                        {col.name !== meta.label && (
                          <p className="text-xs text-slate-500 font-medium">{col.name}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {dueCards > 0 && (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          {t('reviewDue')} {dueCards}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metrics Bar */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                      <span className="font-extrabold text-slate-900">{deckCount}</span> {t('decks')}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                      <span className="font-extrabold text-slate-900">{cardCount}</span> {t('cards')}
                    </span>
                  </div>

                  {/* Decks Preview List */}
                  <div className="space-y-1.5 mb-5">
                    {decksToShow.slice(0, 3).map((deck) => (
                      <div
                        key={deck.id}
                        className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 p-2 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                      >
                        <span className="truncate max-w-[170px]">{deck.name}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-bold text-slate-400">
                            {deck.cards?.length || 0}
                          </span>
                          {onQuickStudyDeck && (deck.cards?.length || 0) > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onQuickStudyDeck(deck);
                              }}
                              className="text-[10px] font-bold text-white bg-slate-900 hover:bg-slate-800 px-2 py-0.5 rounded-md transition-colors shadow-xs"
                            >
                              {t('study')}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {decksToShow.length > 3 && (
                      <p className="text-[11px] font-bold text-slate-400 pl-1">
                        {t('otherDecksCount', { n: decksToShow.length - 3 })}
                      </p>
                    )}
                    {decksToShow.length === 0 && (
                      <p className="text-xs text-slate-400 py-3 text-center">
                        {t('noDecksInFolder')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-slate-950">
                  <span>{t('viewDecks')}</span>
                  <span className="transition-transform group-hover:translate-x-1.5 font-bold">→</span>
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <section className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            📭
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">{t('noCollectionsFound')}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            {t('noCollectionsDesc')}
          </p>
          <button
            onClick={() => setSearch('')}
            className="text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors"
          >
            {t('resetFilter')}
          </button>
        </section>
      )}
    </div>
  );
}
