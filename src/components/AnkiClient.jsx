'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import AppShell from './layout/AppShell';
import LandingPageView from './views/LandingPageView';
import AuthModal from './auth/AuthModal';
import DashboardView from './views/DashboardView';
import ReviewSessionView from './views/ReviewSessionView';
import DrillSessionView from './views/DrillSessionView';
import LevelHubView from './views/LevelHubView';
import MockExamView from './views/MockExamView';
import RelationshipGraphView from './RelationshipGraphView';
import ReadingLibrary from './views/ReadingLibrary';
import ReaderView from './views/ReaderView';
import ProgressView from './views/ProgressView';
import SettingsView from './views/SettingsView';
import LeaderboardView from './views/LeaderboardView';
import AboutView from './views/AboutView';
import CollectionsDashboard from './views/CollectionsDashboard';
import Dashboard from './views/Dashboard';
import ManageDeck from './views/ManageDeck';
import CourseRoadmapView from './views/CourseRoadmapView';
import LessonFlowView from './views/LessonFlowView';
import AccountModal from './AccountModal';
import ExamReadinessModal from './ExamReadinessModal';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { createCollection, updateCardProgress, fetchCourseLessons, fetchDueCards, submitCardReview } from '@/app/actions';
import { calculateQualityStreak, calculateExamReadiness, recordReviewResult } from '@/lib/motivationEngine';
import { getLocalAccount, saveLocalAccount, awardXp } from '@/lib/accountEngine';

export default function AnkiClientWrapper(props) {
  return (
    <LanguageProvider>
      <AnkiClientContent {...props} />
    </LanguageProvider>
  );
}

function AnkiClientContent({ initialCollections, initialCurriculum = [], initialDueCards = [] }) {
  const { t } = useLanguage();
  const [collections, setCollections] = useState(initialCollections);
  const [curriculumLessons, setCurriculumLessons] = useState(initialCurriculum);
  const [dbDueCards, setDbDueCards] = useState(initialDueCards);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [currentDeckId, setCurrentDeckId] = useState(null);
  const [view, setView] = useState('dashboard');
  const [studyQueue, setStudyQueue] = useState([]);
  const [activeJlptFilter, setActiveJlptFilter] = useState('all');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [isReadinessModalOpen, setIsReadinessModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountInfo, setAccountInfo] = useState(() => getLocalAccount());
  const [selectedReaderStory, setSelectedReaderStory] = useState(null);

  // Restore navigation and auth state on mount
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('manabu-auth-user');
      if (savedAuth) {
        setIsLoggedIn(true);
      }

      // Restore saved local collections if available with progress preservation
      const savedCollections = localStorage.getItem('manabu_collections');
      if (savedCollections) {
        try {
          const parsed = JSON.parse(savedCollections);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const progressMap = new Map();
            parsed.forEach(col => {
              (col.decks || []).forEach(d => {
                (d.cards || []).forEach(c => {
                  const id = c.id || c._id;
                  if (id && (c.repetitions > 0 || c.interval > 0)) {
                    progressMap.set(id, c);
                  }
                });
              });
            });

            if (progressMap.size > 0 && Array.isArray(initialCollections) && initialCollections.length > 0) {
              const merged = initialCollections.map(col => ({
                ...col,
                decks: (col.decks || []).map(deck => ({
                  ...deck,
                  cards: (deck.cards || []).map(card => {
                    const id = card.id || card._id;
                    const saved = progressMap.get(id);
                    return saved ? { ...card, ...saved } : card;
                  }),
                })),
              }));
              setCollections(merged);
            } else if (Array.isArray(initialCollections) && initialCollections.length > 0) {
              setCollections(initialCollections);
            } else {
              setCollections(parsed);
            }
          }
        } catch (e) {}
      }

      const savedView = localStorage.getItem('anki-view');
      const savedCol = localStorage.getItem('anki-col');
      const savedDeck = localStorage.getItem('anki-deck');
      const savedQueue = localStorage.getItem('anki-queue');
      const savedLevel = localStorage.getItem('anki-jlpt-filter');
      const savedHistory = JSON.parse(localStorage.getItem('manabu_review_history') || '[]');

      setReviewHistory(savedHistory);

      let safeView = savedView || 'dashboard';
      if (savedCol) {
        const colExists = (initialCollections || []).find(c => c.id === savedCol);
        if (colExists) setActiveCollectionId(savedCol);
      }
      if (savedDeck) setCurrentDeckId(savedDeck);
      if (savedQueue && safeView === 'study') {
        setStudyQueue(JSON.parse(savedQueue));
      }
      if (savedLevel) setActiveJlptFilter(savedLevel);

      setView(safeView);
    } catch (e) {
      console.error('Failed to load local storage:', e);
    }
    setIsLoaded(true);
  }, [initialCollections]);

  // Load Course Curriculum & Due UserCards from MongoDB
  useEffect(() => {
    let isMounted = true;
    async function loadCourseData() {
      try {
        const [lessons, due] = await Promise.all([
          fetchCourseLessons().catch(() => []),
          fetchDueCards().catch(() => []),
        ]);
        if (isMounted) {
          if (Array.isArray(lessons) && lessons.length > 0) {
            setCurriculumLessons(lessons);
          }
          if (Array.isArray(due) && due.length > 0) {
            setDbDueCards(due);
          }
        }
      } catch (err) {
        console.warn('Course data background fetch note:', err?.message);
      }
    }
    loadCourseData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLessonCompleteSuccess = useCallback(async (completedLesson, res) => {
    try {
      const [lessons, due] = await Promise.all([
        fetchCourseLessons().catch(() => []),
        fetchDueCards().catch(() => []),
      ]);
      if (Array.isArray(lessons) && lessons.length > 0) {
        setCurriculumLessons(lessons);
      }
      if (Array.isArray(due)) {
        setDbDueCards(due);
      }
    } catch (e) {
      console.warn('Failed to refresh course after completion:', e);
    }
  }, []);

  // Aggregate cards across all collections
  const allDecks = useMemo(() => {
    return (collections || []).flatMap(c => c.decks || []);
  }, [collections]);

  const allUserCards = useMemo(() => {
    const cards = allDecks.flatMap(d => (d.cards || []).map(c => ({ ...c, deckId: d.id })));
    const seen = new Set(cards.map(c => String(c.id || c._id)));
    (dbDueCards || []).forEach(dc => {
      const id = String(dc.id || dc._id || dc.userCardId);
      if (!seen.has(id)) {
        seen.add(id);
        cards.push(dc);
      }
    });
    return cards;
  }, [allDecks, dbDueCards]);

  const allUserVocabCards = useMemo(() => {
    return allUserCards.filter(c => (c.content_type || c.category) === 'Vocabulary' || c.content_type === 'vocab');
  }, [allUserCards]);

  // Navigation router
  const navigateTo = useCallback((newView, colId = null, deckId = null) => {
    setView(newView);
    if (colId !== undefined) setActiveCollectionId(colId);
    if (deckId !== undefined) setCurrentDeckId(deckId);

    try {
      localStorage.setItem('anki-view', newView);
      if (colId) localStorage.setItem('anki-col', colId);
      else localStorage.removeItem('anki-col');

      if (deckId) localStorage.setItem('anki-deck', deckId);
      else localStorage.removeItem('anki-deck');
    } catch (e) {
      console.error(e);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Level Selection Handler
  const handleSelectLevel = useCallback((lvl) => {
    setActiveJlptFilter(lvl);
    try {
      localStorage.setItem('anki-jlpt-filter', lvl);
    } catch (e) {}
    navigateTo('hub');
  }, [navigateTo]);

  // Due queue and stats combining MongoDB course UserCards & local collections
  const { dueCards, dueBreakdown } = useMemo(() => {
    const now = Date.now();
    const due = [];
    const breakdown = { vocab: 0, kanji: 0, grammar: 0, kana: 0 };
    const seenIds = new Set();

    // 1. Add DB due cards from course UserCards
    (dbDueCards || []).forEach(card => {
      const id = String(card.id || card._id || card.userCardId);
      if (!seenIds.has(id)) {
        seenIds.add(id);
        due.push(card);
        const type = (card.cardType || card.content_type || card.category || 'vocab').toLowerCase();
        if (type.includes('kanji')) breakdown.kanji++;
        else if (type.includes('grammar')) breakdown.grammar++;
        else if (type.includes('kana')) breakdown.kana++;
        else breakdown.vocab++;
      }
    });

    // 2. Add local collection due cards
    allUserCards.forEach(card => {
      if (card.dueDate <= now && (card.repetitions > 0 || card.interval > 0)) {
        const id = String(card.id || card._id);
        if (!seenIds.has(id)) {
          seenIds.add(id);
          due.push(card);
          const type = (card.content_type || card.category || 'vocab').toLowerCase();
          if (type.includes('kanji')) breakdown.kanji++;
          else if (type.includes('grammar')) breakdown.grammar++;
          else if (type.includes('kana')) breakdown.kana++;
          else breakdown.vocab++;
        }
      }
    });

    return { dueCards: due, dueBreakdown: breakdown };
  }, [allUserCards, dbDueCards]);

  const qualityStreakData = useMemo(() => {
    return calculateQualityStreak(reviewHistory);
  }, [reviewHistory]);

  const examReadiness = useMemo(() => {
    const targetLvl = activeJlptFilter && activeJlptFilter !== 'all' && activeJlptFilter !== 'kana'
      ? activeJlptFilter
      : (accountInfo.targetLevel || 'N5');
    return calculateExamReadiness(allUserCards, targetLvl);
  }, [allUserCards, activeJlptFilter, accountInfo]);

  // Start SRS Review Session
  const startReviewSession = useCallback((customCards = null) => {
    let queue = customCards;
    if (!queue || queue.length === 0) {
      if (dueCards.length > 0) {
        queue = dueCards;
      } else {
        // Study unlearned / new cards if no cards are due
        const unlearned = allUserCards.filter(c => !c.repetitions || c.repetitions === 0);
        queue = unlearned.length > 0 ? unlearned.slice(0, 20) : allUserCards.slice(0, 20);
      }
    }

    if (!queue || queue.length === 0) {
      alert('No cards available for review at this time.');
      return;
    }

    // Shuffle queue
    const shuffled = [...queue].sort(() => Math.random() - 0.5);
    setStudyQueue(shuffled);
    try {
      localStorage.setItem('anki-queue', JSON.stringify(shuffled));
    } catch (e) {}
    navigateTo('study');
  }, [dueCards, allUserCards, navigateTo]);

  // Record review result to MongoDB & streak tracker (SM-2 preserved) & local dynamic state
  const handleRecordReviewResult = useCallback(async (card, rating) => {
    const targetDeckId = card.deckId || currentDeckId;
    const cardIdentifier = card.id || card._id;

    // Calculate SM-2 locally for immediate, real-time dynamic UI updates
    let rep = card.repetitions || 0;
    let ivl = card.interval || 0;
    let ease = card.ease_factor || card.easeFactor || 2.5;

    if (rating < 3) {
      rep = 0;
      ivl = 1;
      ease = Math.max(1.3, ease - 0.2);
    } else {
      if (rep === 0) {
        ivl = 1;
      } else if (rep === 1) {
        ivl = 6;
      } else {
        ivl = Math.round(ivl * ease);
      }
      rep += 1;
      ease = Math.max(1.3, ease + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)));
    }
    const nextDueDate = Date.now() + ivl * 86400000;
    const isMastered = rep >= 2 && ivl >= 7;

    setCollections(prevCollections => {
      const nextCols = (prevCollections || []).map(col => ({
        ...col,
        decks: (col.decks || []).map(deck => ({
          ...deck,
          cards: (deck.cards || []).map(c => {
            if ((c.id && c.id === cardIdentifier) || (c._id && c._id === cardIdentifier)) {
              return {
                ...c,
                repetitions: rep,
                interval: ivl,
                ease_factor: ease,
                easeFactor: ease,
                dueDate: nextDueDate,
                next_review_date: nextDueDate,
                mastered: isMastered,
              };
            }
            return c;
          }),
        })),
      }));

      try {
        localStorage.setItem('manabu_collections', JSON.stringify(nextCols));
      } catch (e) {}

      return nextCols;
    });

    // 1. If it's a course UserCard from MongoDB
    if (card.userCardId || card.cardModel) {
      try {
        await submitCardReview(card.userCardId || card.id, rating);
      } catch (err) {
        console.warn('Backend UserCard review sync note:', err?.message);
      }
      setDbDueCards(prev => prev.filter(c => String(c.userCardId || c.id) !== String(card.userCardId || card.id)));
    }

    const isVirtual = !targetDeckId || String(targetDeckId).startsWith('kana-practice-');
    if (targetDeckId && !isVirtual) {
      try {
        await updateCardProgress(targetDeckId, cardIdentifier, rating);
      } catch (err) {
        console.warn('Backend progress update sync note:', err?.message);
      }
    }

    // Record review rating into motivation engine quality history
    try {
      const stored = JSON.parse(localStorage.getItem('manabu_review_history') || '[]');
      const updated = recordReviewResult(stored, rating);
      localStorage.setItem('manabu_review_history', JSON.stringify(updated));
      setReviewHistory(updated);
      setAccountInfo(getLocalAccount());
    } catch (e) {
      console.error('Failed to log review to motivation history:', e);
    }
  }, [currentDeckId]);

  if (!isLoaded) return null;

  // 1. LOGGED OUT LANDING PAGE
  if (!isLoggedIn) {
    return (
      <>
        <LandingPageView
          onStartFree={() => setIsAuthModalOpen(true)}
          onLogin={() => setIsAuthModalOpen(true)}
          onSelectLevel={(lvl) => {
            setActiveJlptFilter(lvl);
            setIsAuthModalOpen(true);
          }}
          onViewAttribution={() => navigateTo('about')}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(profile) => {
            setIsLoggedIn(true);
            setAccountInfo(getLocalAccount());
            if (profile?.targetLevel) {
              setActiveJlptFilter(profile.targetLevel);
            }
            navigateTo('dashboard');
          }}
        />
      </>
    );
  }

  // 2. REVIEW SESSION (FULL-SCREEN SINGLE CARD, NO NAV CHROME)
  if (view === 'study') {
    return (
      <ReviewSessionView
        queue={studyQueue}
        onExit={() => navigateTo('dashboard')}
        onFinish={() => {
          setAccountInfo(getLocalAccount());
          navigateTo('dashboard');
        }}
        onRecordResult={handleRecordReviewResult}
      />
    );
  }

  // 3. DRILL SESSION (FULL-SCREEN DRILL)
  if (view === 'drill') {
    return (
      <DrillSessionView
        cards={studyQueue.length > 0 ? studyQueue : allUserCards}
        level={activeJlptFilter !== 'all' ? activeJlptFilter : 'N5'}
        allCards={allUserCards}
        onExit={() => navigateTo('dashboard')}
        onFinish={() => {
          setAccountInfo(getLocalAccount());
          navigateTo('dashboard');
        }}
        onRecordResult={handleRecordReviewResult}
      />
    );
  }

  // 4. MAIN APPLICATION (WRAPPED IN APPSHELL WITH DESKTOP SIDEBAR & MOBILE TABS)
  return (
    <AppShell
      currentView={view}
      onNavigate={navigateTo}
      activeLevel={activeJlptFilter}
      onSelectLevel={handleSelectLevel}
      dueCount={dueCards.length}
      streakData={qualityStreakData}
      accountInfo={accountInfo}
      onOpenAccount={() => setIsAccountModalOpen(true)}
      onOpenReadiness={() => setIsReadinessModalOpen(true)}
      onStartReview={() => startReviewSession()}
    >
      {/* View 1: Logged-in Dashboard (Home) */}
      {view === 'dashboard' && (
        <DashboardView
          userCards={allUserCards}
          dueCount={dueCards.length}
          dueBreakdown={dueBreakdown}
          streakData={qualityStreakData}
          examReadiness={examReadiness}
          curriculumLessons={curriculumLessons}
          onOpenCourse={() => navigateTo('course')}
          onSelectLesson={(lesson) => {
            setActiveLesson(lesson);
            navigateTo('lesson');
          }}
          onStartReview={() => startReviewSession()}
          onOpenDrill={() => {
            setStudyQueue(allUserCards);
            navigateTo('drill');
          }}
          onOpenLibrary={() => navigateTo('library')}
          onOpenExplore={() => navigateTo('explore')}
          onOpenExam={() => navigateTo('exam')}
          onSelectLevel={handleSelectLevel}
          onOpenReadinessModal={() => setIsReadinessModalOpen(true)}
        />
      )}

      {/* View: Course Roadmap (The 30-Lesson Structured Japanese Course) */}
      {view === 'course' && (
        <CourseRoadmapView
          lessons={curriculumLessons}
          onSelectLesson={(lesson) => {
            setActiveLesson(lesson);
            navigateTo('lesson');
          }}
          onStartReview={() => startReviewSession()}
          dueCount={dueCards.length}
        />
      )}

      {/* View: Interactive Lesson Flow (Kana / Grammar / Vocab / Kanji + Tatoeba) */}
      {view === 'lesson' && activeLesson && (
        <LessonFlowView
          lesson={activeLesson}
          onBack={() => navigateTo('course')}
          onCompleteSuccess={handleLessonCompleteSuccess}
          onStartReview={() => startReviewSession()}
          onSelectNextLesson={(nextL) => {
            setActiveLesson(nextL);
          }}
        />
      )}

      {/* View 2: Level Hub (N5 - N1 + Kana) */}
      {view === 'hub' && (
        <LevelHubView
          level={activeJlptFilter !== 'all' ? activeJlptFilter : 'N5'}
          userCards={allUserCards}
          onStartStudy={({ level: studyLvl }) => {
            const matching = allUserCards.filter(c => (c.jlpt_level || c.jlpt) === studyLvl);
            startReviewSession(matching);
          }}
          onStartDrill={(cards) => {
            setStudyQueue(cards);
            navigateTo('drill');
          }}
          onStartMockExam={(lvl) => {
            setActiveJlptFilter(lvl);
            navigateTo('exam');
          }}
          onOpenCourse={() => navigateTo('course')}
        />
      )}

      {/* View 3: Mock Exam */}
      {view === 'exam' && (
        <div className="py-6 px-4">
          <MockExamView
            initialLevel={activeJlptFilter !== 'all' && activeJlptFilter !== 'kana' ? activeJlptFilter : 'N5'}
            onFinish={() => {
              setAccountInfo(getLocalAccount());
              navigateTo('dashboard');
            }}
            onBack={() => navigateTo('dashboard')}
            onAddMissedToQueue={(missedCards) => {
              // Append missed cards to active cards
              awardXp(10, 'Added missed exam questions to SRS');
              setStudyQueue(missedCards);
              alert(`Added ${missedCards.length} missed question(s) to your SRS review queue!`);
            }}
          />
        </div>
      )}

      {/* View 4: Explore / Relationship Graph */}
      {view === 'explore' && (
        <div className="py-6 px-4">
          <RelationshipGraphView
            initialQuery="食"
            userVocabCards={allUserVocabCards}
            onStudy={(virtualDeck) => {
              startReviewSession(virtualDeck.cards);
            }}
          />
        </div>
      )}

      {/* View 5: Library & Graded Reader */}
      {view === 'library' && (
        <div className="py-6 px-4">
          {selectedReaderStory ? (
            <ReaderView
              story={selectedReaderStory}
              userCards={allUserCards}
              onBack={() => setSelectedReaderStory(null)}
              onAddToSrs={(card) => {
                alert(`Added "${card.kanji}" to your SRS queue.`);
              }}
            />
          ) : (
            <ReadingLibrary
              userCards={allUserCards}
              onSelectStory={(story) => setSelectedReaderStory(story)}
            />
          )}
        </div>
      )}

      {/* View 6: Progress & Analytics */}
      {view === 'progress' && (
        <div className="py-6 px-4 max-w-6xl mx-auto">
          <ProgressView
            userCards={allUserCards}
            onStartContrastDrill={(pattern) => {
              const drillCards = [
                {
                  id: `drill-${pattern.id}-a`,
                  content_type: pattern.category,
                  kanji: pattern.cardA.name,
                  reading: pattern.cardA.name,
                  meaning: `${pattern.cardA.cue} (${pattern.cardA.example})`,
                  category: 'Contrast Drill',
                  repetitions: 0,
                  interval: 0,
                },
                {
                  id: `drill-${pattern.id}-b`,
                  content_type: pattern.category,
                  kanji: pattern.cardB.name,
                  reading: pattern.cardB.name,
                  meaning: `${pattern.cardB.cue} (${pattern.cardB.example})`,
                  category: 'Contrast Drill',
                  repetitions: 0,
                  interval: 0,
                },
              ];
              setStudyQueue(drillCards);
              navigateTo('drill');
            }}
          />
        </div>
      )}

      {/* View 7: Settings / Profile */}
      {view === 'profile' && (
        <SettingsView
          onBack={() => navigateTo('dashboard')}
          onResetData={() => {
            localStorage.clear();
            window.location.reload();
          }}
        />
      )}

      {/* View 8: Leaderboard */}
      {view === 'leaderboard' && (
        <LeaderboardView />
      )}

      {/* View 9: About / Attribution */}
      {view === 'about' && (
        <AboutView onBack={() => navigateTo('dashboard')} />
      )}

      {/* View 10: Collections & Decks Management */}
      {view === 'collections' && (
        <div className="py-6 px-4 max-w-6xl mx-auto">
          <CollectionsDashboard
            collections={collections}
            activeJlptFilter={activeJlptFilter}
            userCards={allUserCards}
            onOpenReadinessModal={() => setIsReadinessModalOpen(true)}
            onSelectCollection={(colId) => navigateTo('deck-folder', colId, null)}
            onCreateCollection={async (name) => {
              const formData = new FormData();
              formData.set('name', name);
              await createCollection(formData);
              window.location.reload();
            }}
            onQuickStudyDeck={(deck) => startReviewSession(deck.cards)}
          />
        </div>
      )}

      {/* View 11: Deck Folder View */}
      {view === 'deck-folder' && (
        <div className="py-6 px-4 max-w-6xl mx-auto">
          {collections.find(c => c.id === activeCollectionId) && (
            <Dashboard
              decks={collections.find(c => c.id === activeCollectionId)?.decks || []}
              collection={collections.find(c => c.id === activeCollectionId)}
              collectionId={activeCollectionId}
              activeJlptFilter={activeJlptFilter}
              userVocabCards={allUserVocabCards}
              userCards={allUserCards}
              onOpenReadinessModal={() => setIsReadinessModalOpen(true)}
              onManage={(deckId) => navigateTo('manage', activeCollectionId, deckId)}
              onStudy={(deck) => startReviewSession(deck.cards)}
            />
          )}
        </div>
      )}

      {/* View 12: Manage Deck */}
      {view === 'manage' && (
        <div className="py-6 px-4 max-w-6xl mx-auto">
          <ManageDeck
            activeDeck={allDecks.find(d => d.id === currentDeckId)}
            setView={() => navigateTo('deck-folder', activeCollectionId, null)}
          />
        </div>
      )}

      {/* Modals */}
      {isReadinessModalOpen && (
        <ExamReadinessModal
          userCards={allUserCards}
          initialLevel={activeJlptFilter !== 'all' && activeJlptFilter !== 'kana' ? activeJlptFilter : 'N5'}
          streakData={qualityStreakData}
          onClose={() => setIsReadinessModalOpen(false)}
        />
      )}

      {isAccountModalOpen && (
        <AccountModal
          onClose={() => {
            setIsAccountModalOpen(false);
            setAccountInfo(getLocalAccount());
          }}
        />
      )}
    </AppShell>
  );
}