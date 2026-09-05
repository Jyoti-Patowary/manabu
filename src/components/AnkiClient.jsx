'use client';

import { useState, useEffect } from 'react';
import CollectionsDashboard from './views/CollectionsDashboard';
import Dashboard from './views/Dashboard';
import ManageDeck from './views/ManageDeck';
import StudySession from './views/StudySession';

export default function AnkiClient({ initialCollections }) {
  // Now managing collections instead of flat decks directly
  const [collections, setCollections] = useState(initialCollections);
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [currentDeckId, setCurrentDeckId] = useState(null);
  const [view, setView] = useState('collections'); // 'collections' | 'dashboard' | 'manage' | 'study'
  const [studyQueue, setStudyQueue] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  // JLPT N3 Examination Countdown: December 6, 2026
  useEffect(() => {
    const targetDate = new Date('2026-12-06T00:00:00');

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        setTimeLeft({ days, hours, minutes });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, []);

  const activeCollection = collections.find(c => c.id === activeCollectionId);
  const activeDeck = activeCollection?.decks?.find(d => d.id === currentDeckId);

  // Handlers
  const handleCreateCollection = async (name) => {
    // Implement your server action call to create a collection here, then update state
    // For now, mockup locally or tie to your backend action
  };

  const startStudying = (deck) => {
    if (!deck) return;
    const now = Date.now();
    const reviewCards = deck.cards.filter(c => c.dueDate <= now && c.repetitions > 0);
    const newCards = deck.cards.filter(c => c.repetitions === 0);
    const queue = [...reviewCards, ...newCards];

    // Shuffle
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }

    if (queue.length === 0) {
      alert("You're completely caught up with this deck! 🎉");
      return;
    }

    setStudyQueue(queue);
    setCurrentDeckId(deck.id);
    setView('study');
  };

  return (
    <main className="min-h-[100dvh] w-full">
      <div className="w-full max-w-md sm:max-w-xl mx-auto min-h-[100dvh] font-sans text-slate-800 flex flex-col px-4">

        {/* HEADER & TIMER */}
        {view !== 'study' && (
          <header className="pt-6 pb-6 text-center">
            <div className="flex items-center justify-between mb-4">
              {view !== 'collections' ? (
                <button 
                  onClick={() => setView('collections')}
                  className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  ← コレクションへ
                </button>
              ) : <div />}
              <div className="inline-flex items-center gap-2" aria-label="学ぶ">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white shadow-sm">
                  学
                </span>
                <span className="text-2xl font-black text-slate-950 tracking-normal">学ぶ</span>
              </div>
              <div />
            </div>

            {activeCollection && (
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                {activeCollection.name}
              </h1>
            )}

            {/* JLPT Countdown Pill */}
            <div className="mt-3 inline-flex items-center gap-2 bg-slate-100 border border-slate-200/80 px-4 py-2 rounded-2xl shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-xs font-bold text-slate-700 tracking-tight">
                JLPT N3まで <span className="text-blue-600 font-extrabold">{timeLeft.days}</span> 日{' '}
                <span className="text-slate-400 font-normal">({timeLeft.hours}時間 {timeLeft.minutes}分)</span>
              </p>
            </div>
          </header>
        )}

        {/* VIEW ROUTING */}
        {view === 'collections' && (
          <CollectionsDashboard
            collections={collections}
            onSelectCollection={(colId) => {
              setActiveCollectionId(colId);
              setView('dashboard');
            }}
            onCreateCollection={handleCreateCollection}
          />
        )}

        {view === 'dashboard' && activeCollection && (
          <Dashboard
            decks={activeCollection.decks || []}
            onManage={(deckId) => {
              setCurrentDeckId(deckId);
              setView('manage');
            }}
            onStudy={startStudying}
          />
        )}

        {view === 'manage' && activeDeck && (
          <ManageDeck
            activeDeck={activeDeck}
            setView={() => setView('dashboard')}
          />
        )}

        {view === 'study' && (
          <StudySession
            queue={studyQueue}
            deckId={currentDeckId}
            setView={() => setView('dashboard')}
          />
        )}

      </div>
    </main>
  );
}
