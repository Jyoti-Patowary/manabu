'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { groupGrammarByJlpt } from '@/lib/groupDeckCollections';
import { useLanguage } from '@/context/LanguageContext';
import KanaChart from '../KanaChart';
import KanjiBrowser from './KanjiBrowser';
import GrammarBrowser from './GrammarBrowser';
import ReadingLibrary from './ReadingLibrary';
import ReaderView from './ReaderView';
import RelationshipGraphView from '../RelationshipGraphView';
import ExamReadinessWidget from '../ExamReadinessWidget';
import { addWordFromReader } from '@/app/actions';

const formatCategory = (str) => {
  if (!str) return 'General';
  return String(str)
    .split(/[_ ]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const normalizeJlpt = (value) => {
  if (value == null) return '';
  const text = String(value).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const directMatch = text.match(/N[1-5]/);
  if (directMatch) return directMatch[0];
  const jlptMatch = text.match(/JLPTN([1-5])/);
  if (jlptMatch) return `N${jlptMatch[1]}`;
  return '';
};

const JLPT_COLOR_MAP = {
  N5: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  N4: { bg: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
  N3: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  N2: { bg: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  N1: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
};

export default function Dashboard({
  decks,
  collection,
  collectionId,
  activeJlptFilter = 'all',
  userVocabCards = [],
  userCards = [],
  onOpenReadinessModal,
  onManage,
  onStudy,
}) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [now] = useState(() => Date.now());
  const [graphRoot, setGraphRoot] = useState('食');
  const [selectedStory, setSelectedStory] = useState(null);

  const handleAddToSrs = async (cardData) => {
    try {
      await addWordFromReader(cardData);
    } catch (err) {
      console.error('Failed to add word from reader:', err);
    }
  };

  const handleViewGraph = (rootChar) => {
    if (rootChar) setGraphRoot(rootChar);
    setActiveTab('graph');
  };

  const resolvedUserVocab = useMemo(() => {
    if (userVocabCards && userVocabCards.length > 0) return userVocabCards;
    return (decks || []).flatMap((d) => d.cards || []).filter((c) => {
      const type = c.content_type || c.type;
      return type === 'vocab' || (!type && c.kanji && c.reading && !c.grammar);
    });
  }, [userVocabCards, decks]);

  const isKanaCollection = Boolean(
    collection?.name?.match(/kana|hiragana|katakana|かな|五十音/i)
  );

  const isKanjiCollection = Boolean(
    collection?.name?.match(/kanji|漢字/i)
  );

  const isGrammarCollection = Boolean(
    collection?.name?.match(/grammar|文法/i)
  );

  const defaultKanaScript = collection?.name?.toLowerCase().includes('katakana') ? 'katakana' : 'hiragana';

  const filteredDecks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return decks.filter((deck) => {
      // 1. Tab filter
      if (activeTab !== 'all') {
        const nameLower = deck.name.toLowerCase();
        const categoryLower = (deck.category || '').toLowerCase();
        const hasType = (deck.cards || []).some(c => (c.type || '').toLowerCase() === activeTab);

        if (activeTab === 'grammar' && !nameLower.includes('grammar') && !categoryLower.includes('grammar') && !hasType) {
          return false;
        }
        if (activeTab === 'vocab' && !nameLower.includes('vocab') && !categoryLower.includes('vocab') && !hasType) {
          return false;
        }
        if (activeTab === 'kanji' && !nameLower.includes('kanji') && !categoryLower.includes('kanji') && !hasType) {
          return false;
        }
        if (activeTab === 'kana' && !nameLower.includes('kana') && !nameLower.includes('hiragana') && !nameLower.includes('katakana') && !hasType) {
          return false;
        }
      }

      // 2. JLPT level filter
      if (activeJlptFilter !== 'all') {
        if (activeJlptFilter === 'kana') {
          const isKana = deck.name.toLowerCase().includes('kana') || deck.name.toLowerCase().includes('hiragana') || deck.name.toLowerCase().includes('katakana');
          if (!isKana) return false;
        } else {
          const deckJlpt = normalizeJlpt(deck.name);
          const cardJlpts = (deck.cards || []).map(c => normalizeJlpt(c.jlpt));
          const hasLevel = deckJlpt === activeJlptFilter || cardJlpts.includes(activeJlptFilter);
          if (!hasLevel) return false;
        }
      }

      // 3. Search query
      if (!query) return true;
      const searchableText = [
        deck.name,
        deck.category,
        ...(deck.cards || []).map((card) => [
          card.kanji,
          card.reading,
          card.meaning,
          card.grammar,
          card.category,
        ].join(' ')),
      ].join(' ').toLowerCase();

      return searchableText.includes(query);
    });
  }, [decks, search, activeTab, activeJlptFilter]);

  // Grammar Groups
  const grammarGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    const grammarOnly = filteredDecks.filter(
      (d) => d.name.toLowerCase().includes('grammar') || (d.category || '').toLowerCase().includes('grammar') || (d.cards || []).some(c => c.type === 'grammar')
    );

    return groupGrammarByJlpt(grammarOnly)
      .map((group) => ({
        ...group,
        decks: group.decks.filter((deck) => {
          if (!query) return true;
          const text = [
            deck.name,
            ...(deck.cards || []).map((card) => [card.grammar, card.meaning, card.example].join(' ')),
          ].join(' ').toLowerCase();
          return text.includes(query);
        }),
      }))
      .filter((group) => group.decks.length > 0);
  }, [filteredDecks, search]);

  // Standard Decks Grouped by Category
  const categorizedRegularDecks = useMemo(() => {
    const regular = filteredDecks.filter(
      (deck) => !deck.name.toLowerCase().includes('grammar') && !deck.category?.toLowerCase().includes('grammar')
    );

    const groups = {};

    regular.forEach((deck) => {
      let mainGroupName = deck.category ? formatCategory(deck.category) : '';
      if (!mainGroupName || mainGroupName === 'Uncategorized') {
        const nameLower = deck.name.toLowerCase();
        if (nameLower.includes('vocab')) mainGroupName = `${t('vocabPillar')} (Vocabulary)`;
        else if (nameLower.includes('kanji')) mainGroupName = `${t('kanjiPillar')} (Kanji)`;
        else if (nameLower.includes('kana') || nameLower.includes('hiragana') || nameLower.includes('katakana')) mainGroupName = `${t('kanaPillar')} (Kana)`;
        else mainGroupName = deck.name || 'General';
      }

      if (!groups[mainGroupName]) {
        groups[mainGroupName] = [];
      }

      const cardsByCategory = {};
      (deck.cards || []).forEach(card => {
        const rawCat = card.category || 'General';
        const cat = formatCategory(rawCat);
        if (!cardsByCategory[cat]) cardsByCategory[cat] = [];
        cardsByCategory[cat].push(card);
      });

      const catKeys = Object.keys(cardsByCategory);
      if (catKeys.length > 1 && deck.cards.length > 15) {
        catKeys.forEach(catName => {
          groups[mainGroupName].push({
            ...deck,
            id: deck.id,
            virtualKey: `${deck.id}-${catName}`,
            name: `${deck.name} · ${catName}`,
            cards: cardsByCategory[catName]
          });
        });
      } else {
        groups[mainGroupName].push({
          ...deck,
          virtualKey: deck.id,
          cards: deck.cards || []
        });
      }
    });

    return Object.entries(groups)
      .map(([category, groupDecks]) => ({
        category,
        decks: groupDecks.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [filteredDecks, t]);

  const totalCards = filteredDecks.reduce((sum, deck) => sum + (deck.cards || []).length, 0);
  const totalDue = filteredDecks.reduce(
    (sum, deck) => sum + (deck.cards || []).filter((card) => card.dueDate <= now && card.repetitions > 0).length,
    0
  );
  const totalNew = filteredDecks.reduce(
    (sum, deck) => sum + (deck.cards || []).filter((card) => card.repetitions === 0).length,
    0
  );

  if (isKanaCollection) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Complete Kana Chart for this collection */}
        <KanaChart onStudyKana={onStudy} defaultScript={defaultKanaScript} />

        {/* Study Cards / Decks for this Kana Collection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{collection?.name || t('kanaPillar')} {t('decks')}</span>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                {decks.length} {t('decks')}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {decks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                now={now}
                onManage={onManage}
                onStudy={onStudy}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isKanjiCollection) {
    const initialKanjiLevel = activeJlptFilter !== 'all' && activeJlptFilter !== 'kana' ? activeJlptFilter : 'N5';
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <KanjiBrowser
          onStudyKanji={onStudy}
          onViewGraph={handleViewGraph}
          initialLevel={initialKanjiLevel}
        />

        {decks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{collection?.name || t('kanjiPillar')} {t('decks')}</span>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                  {decks.length} {t('decks')}
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {decks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  now={now}
                  onManage={onManage}
                  onStudy={onStudy}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isGrammarCollection) {
    const initialGrammarLevel = activeJlptFilter !== 'all' && activeJlptFilter !== 'kana' ? activeJlptFilter : 'N5';
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <GrammarBrowser
          onStudyGrammar={onStudy}
          onViewGraph={handleViewGraph}
          initialLevel={initialGrammarLevel}
          userVocabCards={resolvedUserVocab}
        />

        {decks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{collection?.name || t('grammarPillar')} {t('decks')}</span>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                  {decks.length} {t('decks')}
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {decks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  now={now}
                  onManage={onManage}
                  onStudy={onStudy}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Exam Readiness & Time-to-Fluency Widget */}
      <ExamReadinessWidget
        userCards={userCards && userCards.length > 0 ? userCards : resolvedUserVocab}
        activeJlptFilter={activeJlptFilter}
        onOpenModal={onOpenReadinessModal}
      />

      {/* Top Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Metrics */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
              <span className="font-extrabold text-slate-950">{totalCards}</span> {t('cards')}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-200/80 px-3 py-1.5 text-xs font-bold text-rose-700">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-extrabold">{totalDue}</span> {t('dueCount')}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 border border-sky-200/80 px-3 py-1.5 text-xs font-bold text-sky-700">
              <span className="font-extrabold">{totalNew}</span> {t('newCount')}
            </span>
          </div>

          {/* Create Deck inline form */}
          <CreateDeckCard collectionId={collectionId} />
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Study Pillars */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: t('allPillar') },
              { id: 'vocab', label: t('vocabPillar') },
              { id: 'grammar', label: t('grammarPillar') },
              { id: 'kanji', label: t('kanjiPillar') },
              { id: 'kana', label: t('kanaPillar') },
              { id: 'reading', label: t('navLibrary') || '読書' },
              { id: 'graph', label: t('navExplore') || '関係図' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative sm:w-64">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchDecksPlaceholder')}
              className="w-full h-9 pl-9 pr-7 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 outline-none focus:border-slate-900 focus:bg-white transition-all placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Grammar Module */}
      {activeTab === 'grammar' && (
        <section className="animate-in fade-in duration-300">
          <GrammarBrowser
            onStudyGrammar={onStudy}
            onViewGraph={handleViewGraph}
            initialLevel={activeJlptFilter !== 'all' && activeJlptFilter !== 'kana' ? activeJlptFilter : 'N5'}
            userVocabCards={resolvedUserVocab}
          />
        </section>
      )}

      {/* Interactive Kanji Module */}
      {activeTab === 'kanji' && (
        <section className="animate-in fade-in duration-300">
          <KanjiBrowser
            onStudyKanji={onStudy}
            onViewGraph={handleViewGraph}
            initialLevel={activeJlptFilter !== 'all' && activeJlptFilter !== 'kana' ? activeJlptFilter : 'N5'}
          />
        </section>
      )}

      {/* Graded Reader & Reading Library Module */}
      {activeTab === 'reading' && (
        <section className="animate-in fade-in duration-300">
          {selectedStory ? (
            <ReaderView
              story={selectedStory}
              userCards={userVocabCards && userVocabCards.length > 0 ? userVocabCards : resolvedUserVocab}
              onBack={() => setSelectedStory(null)}
              onAddToSrs={handleAddToSrs}
            />
          ) : (
            <ReadingLibrary
              userCards={userVocabCards && userVocabCards.length > 0 ? userVocabCards : resolvedUserVocab}
              onSelectStory={(story) => setSelectedStory(story)}
              initialLevel={activeJlptFilter !== 'all' && activeJlptFilter !== 'kana' ? activeJlptFilter : 'all'}
            />
          )}
        </section>
      )}

      {/* Interactive Relationship Graph Web */}
      {activeTab === 'graph' && (
        <section className="animate-in fade-in duration-300">
          <RelationshipGraphView
            initialQuery={graphRoot || '食'}
            userVocabCards={resolvedUserVocab}
            onStudy={onStudy}
          />
        </section>
      )}

      {/* Grammar Focus Section */}
      {grammarGroups.length > 0 && activeTab !== 'reading' && activeTab !== 'graph' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{t('grammarFocusTitle')}</span>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">
                {t('grammarPillar')}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grammarGroups.map(({ level, decks: groupDecks }) => {
              const totalGrammarPoints = groupDecks.reduce((sum, deck) => sum + (deck.cards || []).length, 0);
              const studyDeck = {
                id: `${level.toLowerCase()}-grammar-group`,
                name: `${level} ${t('grammarPillar')}`,
                cards: groupDecks.flatMap((deck) => (deck.cards || []).map(c => ({ ...c, deckId: deck.id }))),
              };

              const dueInGroup = studyDeck.cards.filter(c => c.dueDate <= now && c.repetitions > 0).length;

              return (
                <div key={level} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-xl border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-black text-purple-700">
                          {level}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {t('grammarPointsCount', { n: totalGrammarPoints })}
                        </span>
                      </div>

                      {dueInGroup > 0 && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                          {t('reviewDue')} {dueInGroup}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {groupDecks.map((deck) => (
                        <button
                          key={deck.id}
                          type="button"
                          onClick={() => onStudy(deck)}
                          className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors"
                        >
                          {deck.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onStudy(studyDeck)}
                    className="w-full h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{t('studyAllGrammar', { level })}</span>
                    <span>→</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Categorized Standard Decks Grid */}
      {categorizedRegularDecks.length > 0 && activeTab !== 'reading' && activeTab !== 'graph' && (
        <div className="space-y-8">
          {categorizedRegularDecks.map((group) => (
            <section key={group.category} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{group.category}</span>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    {group.decks.length} {t('decks')}
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {group.decks.map((deck) => (
                  <DeckCard
                    key={deck.virtualKey || deck.id}
                    deck={deck}
                    now={now}
                    onManage={onManage}
                    onStudy={onStudy}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Empty State */}
      {activeTab !== 'reading' && activeTab !== 'graph' && grammarGroups.length === 0 && categorizedRegularDecks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-sm font-bold text-slate-700 mb-1">{t('noDecksMatch')}</p>
          <p className="text-xs text-slate-400 mb-4">{t('noDecksMatchDesc')}</p>
          <button
            onClick={() => {
              setSearch('');
              setActiveTab('all');
            }}
            className="text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors"
          >
            {t('resetFilter')}
          </button>
        </div>
      )}
    </div>
  );
}

function DeckCard({ deck, now, onManage, onStudy }) {
  const { t } = useLanguage();
  const cards = deck.cards || [];
  const due = cards.filter((card) => card.dueDate <= now && card.repetitions > 0).length;
  const newCards = cards.filter((card) => card.repetitions === 0).length;
  const studyCount = due + newCards;
  const totalCards = cards.length;
  const learnedCards = totalCards - newCards;
  const progressPercent = totalCards > 0 ? Math.round((learnedCards / totalCards) * 100) : 0;

  const isKanaDeck = Boolean(
    deck.name?.match(/kana|hiragana|katakana|かな/i) || 
    (cards.length > 0 && cards.every(c => (c.content_type || c.type) === 'kana' || (c.type === 'hiragana' || c.type === 'katakana')))
  );

  const deckJlptLevels = isKanaDeck
    ? []
    : Array.from(
        new Set([normalizeJlpt(deck.name), ...cards.map((card) => normalizeJlpt(card.jlpt_level || card.jlpt))].filter(Boolean))
      );

  const baseDeckId = deck.id.includes('-') ? deck.id.split('-')[0] : deck.id;

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              {isKanaDeck && (
                <span className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 px-2 py-0.5 text-[10px] font-black">
                  <span>{t('kana') || 'かな'} {t('elementary') || '基礎'}</span>
                </span>
              )}
              {deckJlptLevels.map((lvl) => {
                const colorMeta = JLPT_COLOR_MAP[lvl] || { bg: 'bg-slate-100 text-slate-700 border-slate-200' };
                return (
                  <span
                    key={`${deck.id}-${lvl}`}
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-black ${colorMeta.bg}`}
                  >
                    <span>{lvl}</span>
                  </span>
                );
              })}
            </div>

            <h3 className="truncate text-base font-black text-slate-950 group-hover:text-slate-900 transition-colors">
              {deck.name}
            </h3>
            <p className="text-xs text-slate-400 font-medium">{totalCards} {t('cards')}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Link
              href={`/stats/${baseDeckId}`}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title="Stats"
            >
              <ChartIcon />
            </Link>
            <button
              type="button"
              onClick={() => onManage(baseDeckId)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title="Manage"
            >
              <SettingsIcon />
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 my-3">
          <div className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-1.5 text-rose-700">
            <span className="text-[11px] font-bold">{t('reviewDue')}</span>
            <span className="text-xs font-black">{due}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-1.5 text-sky-700">
            <span className="text-[11px] font-bold">{t('newCount')}</span>
            <span className="text-xs font-black">{newCards}</span>
          </div>
        </div>
      </div>

      {/* Progress & Study Button */}
      <div className="mt-4 space-y-3 pt-3 border-t border-slate-100">
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
            <span>{t('masteryProgress')}</span>
            <span className="text-slate-700 font-extrabold">{progressPercent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-900 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          disabled={studyCount === 0}
          onClick={() => {
            if (studyCount > 0) onStudy(deck);
          }}
          className={`flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
            studyCount > 0
              ? 'bg-slate-950 text-white hover:bg-slate-800 active:scale-98 cursor-pointer'
              : 'cursor-not-allowed bg-slate-100 text-slate-400'
          }`}
        >
          {studyCount > 0 ? (
            <>
              <span>{t('studyNow')}</span>
              <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-black">
                {studyCount}
              </span>
            </>
          ) : (
            t('allCompleted')
          )}
        </button>
      </div>
    </article>
  );
}

function CreateDeckCard({ collectionId }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading || !name.trim()) return;

    try {
      setLoading(true);
      const { createDeck } = await import('@/app/actions');
      const formData = new FormData();
      formData.set('name', name.trim());
      if (collectionId) {
        formData.set('collectionId', collectionId);
      }
      await createDeck(formData);
      setName('');
      window.location.reload();
    } catch (error) {
      console.error('Failed to create deck:', error);
      alert('Error creating deck.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full md:w-auto">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('newDeckPlaceholder')}
        required
        className="h-9 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none focus:border-slate-900 transition-all placeholder:text-slate-400 md:w-44"
      />
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 text-xs font-bold text-white hover:bg-slate-800 transition-all active:scale-98 disabled:opacity-50 shrink-0"
      >
        <PlusIcon />
        <span>{loading ? t('addingButton') : t('addDeckButton')}</span>
      </button>
    </form>
  );
}

function PlusIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 19.5h15M7 16v-5M12 16V6M17 16v-8" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15.25A3.25 3.25 0 1 0 12 8.75a3.25 3.25 0 0 0 0 6.5ZM19.4 13.5a7.86 7.86 0 0 0 .06-1.5l2.04-1.55-2-3.46-2.42.98a7.62 7.62 0 0 0-1.3-.76L15.45 4h-3.9l-.33 3.21c-.46.2-.9.46-1.3.76L7.5 6.99l-2 3.46L7.54 12a7.86 7.86 0 0 0 .06 1.5L5.5 15.06l2 3.46 2.42-.98c.4.3.84.56 1.3.76l.33 3.2h3.9l.33-3.2c.46-.2.9-.46 1.3-.76l2.42.98 2-3.46-2.1-1.56Z" />
    </svg>
  );
}