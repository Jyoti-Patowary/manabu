'use client';

import { useState } from 'react';

const COLLECTION_META = {
  Hiragana: {
    label: 'ひらがな',
    subtitle: 'きそ',
    accent: 'bg-rose-500',
    tint: 'bg-rose-50 text-rose-700 border-rose-100',
  },
  Katakana: {
    label: 'カタカナ',
    subtitle: 'がいらいご',
    accent: 'bg-indigo-500',
    tint: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  },
  Vocabs: {
    label: '語彙',
    subtitle: 'ことば',
    accent: 'bg-sky-500',
    tint: 'bg-sky-50 text-sky-700 border-sky-100',
  },
  Grammar: {
    label: '文法',
    subtitle: 'ルール',
    accent: 'bg-emerald-500',
    tint: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  Kanji: {
    label: '漢字',
    subtitle: '文字',
    accent: 'bg-amber-500',
    tint: 'bg-amber-50 text-amber-700 border-amber-100',
  },
};

export default function CollectionsDashboard({ collections, onSelectCollection, onCreateCollection }) {
  const [newCollectionName, setNewCollectionName] = useState('');
  const totalDecks = collections.reduce((sum, collection) => sum + (collection.decks?.length || 0), 0);
  const totalCards = collections.reduce(
    (sum, collection) =>
      sum + (collection.decks?.reduce((deckSum, deck) => deckSum + (deck.cards?.length || 0), 0) || 0),
    0
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    onCreateCollection(newCollectionName);
    setNewCollectionName('');
  };

  return (
    <div className="pb-16 animate-in fade-in duration-300">
      <section className="pt-2 pb-7 border-b border-slate-200">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">学ぶ</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {totalDecks} デッキ · {totalCards} カード
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex w-full gap-2 sm:w-auto">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="新しいフォルダ"
              required
              className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 sm:w-44"
            />
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98]"
            >
              <PlusIcon />
              作成
            </button>
          </form>
        </div>
      </section>

      {collections.length > 0 ? (
        <section className="grid grid-cols-1 gap-3 pt-6 sm:grid-cols-2">
          {collections.map((col) => {
            const meta = COLLECTION_META[col.name] || {
              label: col.name,
              subtitle: 'フォルダ',
              accent: 'bg-slate-500',
              tint: 'bg-slate-50 text-slate-700 border-slate-100',
            };
            const deckCount = col.decks?.length || 0;
            const cardCount = col.decks?.reduce((sum, deck) => sum + (deck.cards?.length || 0), 0) || 0;
            const previewDecks = (col.decks || []).slice(0, 3);

            return (
              <button
                type="button"
                key={col.id}
                onClick={() => onSelectCollection(col.id)}
                className="group flex min-h-44 w-full flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-900/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className={`mt-1 h-9 w-1.5 rounded-full ${meta.accent}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-400">{meta.subtitle}</p>
                      <h2 className="mt-1 truncate text-2xl font-black tracking-tight text-slate-950">
                        {meta.label}
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500">{col.name}</p>
                    </div>
                  </div>

                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${meta.tint}`}>
                    <FolderIcon />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <StatPill label="デッキ" value={deckCount} />
                    <StatPill label="カード" value={cardCount} />
                  </div>

                  <div className="min-h-6">
                    {previewDecks.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {previewDecks.map((deck) => (
                          <span
                            key={deck.id}
                            className="max-w-full truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600"
                          >
                            {deck.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-slate-400">デッキなし</p>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-bold text-slate-700">
                  <span>開く</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </button>
            );
          })}
        </section>
      ) : (
        <section className="pt-6">
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <FolderIcon />
            </div>
            <p className="text-sm font-bold text-slate-900">コレクションがありません</p>
            <p className="mt-1 text-xs text-slate-400">データベースにデッキが追加されると表示されます。</p>
          </div>
        </section>
      )}
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600">
      <span className="text-slate-950">{value}</span>
      {label}
    </span>
  );
}

function FolderIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3.75 6.75A2.25 2.25 0 0 1 6 4.5h3.2c.6 0 1.17.24 1.6.66l1.04 1.04c.42.43 1 .66 1.6.66H18A2.25 2.25 0 0 1 20.25 9v8.25A2.25 2.25 0 0 1 18 19.5H6a2.25 2.25 0 0 1-2.25-2.25V6.75Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
