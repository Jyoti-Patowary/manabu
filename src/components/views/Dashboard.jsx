'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { groupGrammarByJlpt } from '@/lib/groupDeckCollections';

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const normalizeJlpt = (value) => {
  if (value == null) return '';

  const text = String(value).trim();
  if (!text) return '';

  const compact = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const directMatch = compact.match(/N[1-5]/);
  if (directMatch) return directMatch[0];

  const jlptMatch = compact.match(/JLPTN([1-5])/);
  if (jlptMatch) return `N${jlptMatch[1]}`;

  return '';
};

export default function Dashboard({ decks, onManage, onStudy }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [now] = useState(() => Date.now());

  const filteredDecks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return decks.filter((deck) => {
      if (!query) return true;

      const searchableText = [
        deck.name,
        deck.category,
        ...(deck.cards || []).map((card) => [
          card.kanji,
          card.reading,
          card.meaning,
          card.category,
        ].join(' ')),
      ].join(' ').toLowerCase();

      return searchableText.includes(query);
    });
  }, [decks, search]);

  const grammarGroups = useMemo(() => {
    const query = search.trim().toLowerCase();

    return groupGrammarByJlpt(decks)
      .map((group) => ({
        ...group,
        decks: group.decks.filter((deck) => {
          if (!query) return true;

          const text = [
            deck.name,
            ...(deck.cards || []).map((card) => [card.grammar, card.meaning, card.example].join(' ')),
          ]
            .join(' ')
            .toLowerCase();

          return text.includes(query);
        }),
      }))
      .filter((group) => group.decks.length > 0);
  }, [decks, search]);

  // Separate non-grammar decks (like Vocabs) to render them in standard DeckCards
  const regularDecks = useMemo(() => {
    return filteredDecks.filter(
      (deck) => !deck.name.toLowerCase().includes('grammar') && !deck.category?.toLowerCase().includes('grammar')
    );
  }, [filteredDecks]);

  const totalCards = decks.reduce((sum, deck) => sum + deck.cards.length, 0);
  const totalDue = decks.reduce(
    (sum, deck) =>
      sum + deck.cards.filter((card) => card.dueDate <= now && card.repetitions > 0).length,
    0
  );
  const totalNew = decks.reduce(
    (sum, deck) => sum + deck.cards.filter((card) => card.repetitions === 0).length,
    0
  );

  return (
    <div className="pb-16 animate-in fade-in duration-300">
      
      {/* Top Header / Stats */}
      <section className="pt-2 pb-5 border-b border-slate-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <StatPill label="Cards" value={totalCards} />
            <StatPill label="Due" value={totalDue} tone="rose" />
            <StatPill label="New" value={totalNew} tone="sky" />
          </div>

          <CreateDeckCard />
        </div>
      </section>

      {/* Search Section */}
      <section className="pt-5 pb-2">
        <div className="relative">
          <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search decks and cards..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-slate-800"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-200"
              aria-label="Clear search"
            >
              x
            </button>
          )}
        </div>
      </section>

      {/* Grammar Groups Section */}
      {grammarGroups.length > 0 && (
        <div className="space-y-3 pt-4">
          <h2 className="mb-2 text-sm font-bold text-slate-700">Grammar Focus</h2>
          {grammarGroups.map(({ level, decks: groupDecks }) => {
            const totalGrammarPoints = groupDecks.reduce((sum, deck) => sum + (deck.cards || []).length, 0);
            const studyDeck = {
              id: `${level.toLowerCase()}-grammar-group`,
              name: `${level} Grammar`,
              cards: groupDecks.flatMap((deck) => deck.cards || []),
            };

            return (
              <div key={level} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700">
                    {level}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-500">{totalGrammarPoints} grammar points</span>
                    <button
                      type="button"
                      onClick={() => onStudy(studyDeck)}
                      className="rounded-lg bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white transition-colors hover:bg-slate-700"
                    >
                      Study
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {groupDecks.map((deck) => (
                    <button
                      key={deck.id}
                      type="button"
                      onClick={() => onStudy(deck)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100"
                    >
                      {deck.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Standard Decks Grid (Vocabs, Kanji, Kana, etc.) */}
      {regularDecks.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-bold text-slate-700">Study Decks</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {regularDecks.map((deck) => (
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

      {/* Empty State */}
      {grammarGroups.length === 0 && regularDecks.length === 0 && (
        <section className="pt-6">
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
            <p className="text-sm font-semibold text-slate-700">No decks found</p>
            <p className="mt-1 text-xs text-slate-400">Try adjusting your search or add a new deck.</p>
          </div>
        </section>
      )}
    </div>
  );
}

function DeckCard({ deck, now, onManage, onStudy }) {
  const due = deck.cards.filter((card) => card.dueDate <= now && card.repetitions > 0).length;
  const newCards = deck.cards.filter((card) => card.repetitions === 0).length;
  const studyCount = due + newCards;
  const totalCards = deck.cards.length;
  const learnedCards = totalCards - newCards;
  const progressPercent = totalCards > 0 ? Math.round((learnedCards / totalCards) * 100) : 0;
  const deckJlptLevels = Array.from(
    new Set([normalizeJlpt(deck.name), ...(deck.cards || []).map((card) => normalizeJlpt(card.jlpt))].filter(Boolean))
  );

  const baseDeckId = deck.id.includes('-') ? deck.id.split('-')[0] : deck.id;

  return (
    <article className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-slate-900">
              {deck.name}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">{totalCards} cards</p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Link
              href={`/stats/${baseDeckId}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              title="Stats"
            >
              <ChartIcon />
            </Link>
            <button
              type="button"
              onClick={() => onManage(baseDeckId)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              title="Manage"
            >
              <SettingsIcon />
            </button>
          </div>
        </div>

        <div className="mt-3.5 grid grid-cols-2 gap-2">
          <MiniMetric label="Due" value={due} tone="rose" />
          <MiniMetric label="New" value={newCards} tone="sky" />
        </div>

        {deckJlptLevels.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {deckJlptLevels.map((level) => (
              <span
                key={`${deck.id}-${level}`}
                className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700"
              >
                {level}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100">
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
          className={`flex h-9 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all ${
            studyCount > 0
              ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]'
              : 'cursor-not-allowed bg-slate-100 text-slate-400'
          }`}
        >
          {studyCount > 0 ? (
            <>
              Study Now
              <span className="rounded-md bg-white/20 px-1.5 py-0.2 text-[10px]">{studyCount}</span>
            </>
          ) : (
            'All Caught Up'
          )}
        </button>
      </div>
    </article>
  );
}

function CreateDeckCard() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name')?.toString().trim();

    if (!name) {
      alert('Please enter a deck name.');
      return;
    }

    try {
      setLoading(true);
      const { createDeck } = await import('@/app/actions');
      await createDeck(formData);
      form.reset();
      window.location.reload();
    } catch (error) {
      console.error('Failed to create deck:', error);
      alert('Failed to create deck. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-2 sm:w-auto">
      <input
        type="text"
        name="name"
        placeholder="New deck name..."
        required
        className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-slate-800 sm:w-40"
      />

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
      >
        <PlusIcon />
        {loading ? 'Adding...' : 'Add'}
      </button>
    </form>
  );
}

function StatPill({ label, value, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    rose: 'bg-rose-50 text-rose-700',
    sky: 'bg-sky-50 text-sky-700',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      <span className="font-bold">{value}</span>
      <span className="opacity-75">{label}</span>
    </span>
  );
}

function MiniMetric({ label, value, tone }) {
  const tones = {
    rose: 'border-rose-100 bg-rose-50/50 text-rose-700',
    sky: 'border-sky-100 bg-sky-50/50 text-sky-700',
  };

  return (
    <div className={`flex items-center justify-between rounded-lg border px-3 py-1.5 ${tones[tone]}`}>
      <span className="text-[11px] font-semibold">{label}</span>
      <span className="text-xs font-bold">{value}</span>
    </div>
  );
}

function SearchIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.5 19.5h15M7 16v-5M12 16V6M17 16v-8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15.25A3.25 3.25 0 1 0 12 8.75a3.25 3.25 0 0 0 0 6.5ZM19.4 13.5a7.86 7.86 0 0 0 .06-1.5l2.04-1.55-2-3.46-2.42.98a7.62 7.62 0 0 0-1.3-.76L15.45 4h-3.9l-.33 3.21c-.46.2-.9.46-1.3.76L7.5 6.99l-2 3.46L7.54 12a7.86 7.86 0 0 0 .06 1.5L5.5 15.06l2 3.46 2.42-.98c.4.3.84.56 1.3.76l.33 3.2h3.9l.33-3.2c.46-.2.9-.46 1.3-.76l2.42.98 2-3.46-2.1-1.56Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}