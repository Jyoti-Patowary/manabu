'use client';

import { useState, useMemo, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  getAllGrammar,
  getGrammarByLevel,
  searchGrammar,
  createGrammarCard,
  generateGrammarDeck,
  JLPT_GRAMMAR_LEVELS,
} from '@/lib/grammarData';
import { evaluateGrammarLockStatus } from '@/lib/dependencyGraph';
import PrerequisiteBadge from '@/components/PrerequisiteBadge';

export default function GrammarBrowser({ onStudyGrammar, onViewGraph, initialLevel = 'N5', userVocabCards = [] }) {
  const { t } = useLanguage();
  const [level, setLevel] = useState(initialLevel);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [unlockFilter, setUnlockFilter] = useState('all'); // 'all' | 'unlocked' | 'locked'
  const [search, setSearch] = useState('');
  const [selectedGrammar, setSelectedGrammar] = useState(null);
  const [activeAudioText, setActiveAudioText] = useState(null);

  const speak = useCallback((text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
      setActiveAudioText(text);
      setTimeout(() => setActiveAudioText(null), 1500);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Filter grammar points
  const grammarList = useMemo(() => {
    let list;
    if (search.trim() || categoryFilter !== 'all') {
      list = searchGrammar(search, level, categoryFilter);
    } else {
      list = getGrammarByLevel(level);
    }

    if (unlockFilter !== 'all') {
      list = list.filter((item) => {
        const lock = evaluateGrammarLockStatus(item, userVocabCards);
        return unlockFilter === 'unlocked' ? lock.isUnlocked : !lock.isUnlocked;
      });
    }

    return list;
  }, [level, search, categoryFilter, unlockFilter, userVocabCards]);

  // Extract all categories available for current level
  const availableCategories = useMemo(() => {
    const list = getGrammarByLevel(level);
    const cats = new Set();
    list.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats).sort();
  }, [level]);

  // Counts by level
  const counts = useMemo(() => {
    return {
      N5: getGrammarByLevel('N5').length,
      N4: getGrammarByLevel('N4').length,
      N3: 0,
      N2: 0,
      N1: 0,
    };
  }, []);

  const handleStudyLevel = (mode = 'recognition') => {
    if (!onStudyGrammar) return;
    const deck = generateGrammarDeck(level);
    onStudyGrammar(deck, mode);
  };

  const handleStudySingle = (item, mode = 'recognition') => {
    if (!onStudyGrammar) return;
    const card = createGrammarCard(item, level);
    onStudyGrammar(
      {
        id: `deck-grammar-${card.id}`,
        name: `Grammar: ${item.grammar}`,
        cards: [card],
      },
      mode
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Level Selector */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-700 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider mb-1">
              <span>文</span>
              <span>JLPT N5〜N1 文法マスター (Grammar Module)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              文法構造・接続・例文ライブラリ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              文法パターンの接続規則、ニュアンス、音声付き例文、よくある間違いを網羅的に学習
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleStudyLevel('recognition')}
              disabled={grammarList.length === 0}
              className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white text-xs font-black shadow-sm flex items-center gap-1.5 transition-all"
            >
              <span>👁️</span>
              <span>このレベルを復習 ({grammarList.length}項目)</span>
            </button>
            <button
              type="button"
              onClick={() => handleStudyLevel('production')}
              disabled={grammarList.length === 0}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-black shadow-sm flex items-center gap-1.5 transition-all"
            >
              <span>✍️</span>
              <span>穴埋め想起テスト</span>
            </button>
          </div>
        </div>

        {/* JLPT Level Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {JLPT_GRAMMAR_LEVELS.map((lvl) => {
            const count = counts[lvl] || 0;
            const isAvailable = count > 0;
            const isActive = level === lvl;

            return (
              <button
                key={lvl}
                onClick={() => {
                  if (isAvailable) {
                    setLevel(lvl);
                    setCategoryFilter('all');
                  }
                }}
                disabled={!isAvailable}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 border ${
                  isActive
                    ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
                    : isAvailable
                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    : 'bg-slate-50/50 text-slate-300 border-dashed border-slate-200 cursor-not-allowed'
                }`}
              >
                <span>{lvl}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-purple-700 text-white'
                      : isAvailable
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-slate-100 text-slate-300'
                  }`}
                >
                  {isAvailable ? count : '準備中'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="文法パターン・意味・例文で検索 (例: から、ないといけない、must)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/30"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {availableCategories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600/30"
            >
              <option value="all">すべてのカテゴリ ({grammarList.length}件)</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          {/* Dependency Unlock Status Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 shrink-0">
            <button
              type="button"
              onClick={() => setUnlockFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                unlockFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              すべて
            </button>
            <button
              type="button"
              onClick={() => setUnlockFilter('unlocked')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                unlockFilter === 'unlocked'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
              title="前提語彙が安定（7日以上）している文法"
            >
              <span>🔓</span>
              <span>解放済み</span>
            </button>
            <button
              type="button"
              onClick={() => setUnlockFilter('locked')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                unlockFilter === 'locked'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-amber-800'
              }`}
              title="前提語彙が未達成の文法"
            >
              <span>🔒</span>
              <span>前提未達</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grammar Cards Grid */}
      {grammarList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
          <p className="text-sm font-bold">一致する文法が見つかりませんでした。</p>
          <p className="text-xs text-slate-400">検索条件を変更するかクリアしてください。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grammarList.map((item, idx) => {
            const isSelected = selectedGrammar?.grammar === item.grammar;
            const exCount = (item.grammarExamples?.length || 0) + (item.example ? 1 : 0);
            const lock = evaluateGrammarLockStatus(item, userVocabCards);

            return (
              <div
                key={idx}
                onClick={() => setSelectedGrammar(item)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white text-left flex flex-col justify-between gap-3 shadow-2xs hover:shadow-md ${
                  isSelected
                    ? 'border-purple-600 ring-2 ring-purple-600/20'
                    : 'border-slate-200/90 hover:border-purple-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-100 text-purple-800">
                        {item.jlpt || level}
                      </span>
                      {item.category && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 truncate max-w-[110px]">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <PrerequisiteBadge lockStatus={lock} compact />
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900 font-japanese tracking-tight">
                      {item.grammar}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 line-clamp-2 mt-0.5">
                      {item.meaning}
                    </p>
                  </div>

                  {item.formation && (
                    <div className="px-2.5 py-1 rounded-lg bg-purple-50/70 border border-purple-100 text-[11px] font-japanese font-bold text-purple-800 line-clamp-1">
                      <span className="opacity-60 text-[9px] font-sans mr-1">接:</span>
                      {item.formation}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{exCount} 例文</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(item.grammar);
                      }}
                      className="p-1 rounded-md hover:bg-purple-100 text-slate-500 hover:text-purple-700 transition-all"
                      title="音声を再生"
                    >
                      🔊
                    </button>
                    <span className="font-bold text-purple-700 text-xs hover:underline">
                      詳細 →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Grammar Detail Drawer / Modal */}
      {selectedGrammar && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
          onClick={() => setSelectedGrammar(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6 relative"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedGrammar(null)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold"
            >
              ✕
            </button>

            {/* Header */}
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-200">
                  {selectedGrammar.jlpt || level} 文法
                </span>
                {selectedGrammar.category && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {selectedGrammar.category}
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-3xl sm:text-4xl font-black text-purple-900 font-japanese">
                  {selectedGrammar.grammar}
                </h2>
                <button
                  type="button"
                  onClick={() => speak(selectedGrammar.grammar)}
                  className="px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
                >
                  <span>🔊</span>
                  <span>発音</span>
                </button>
              </div>

              <p className="text-base sm:text-lg font-bold text-slate-800">
                {selectedGrammar.meaning}
              </p>
            </div>

            {/* Formation */}
            {selectedGrammar.formation && (
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 block">
                  接続規則 (Formation)
                </span>
                <p className="font-japanese font-bold text-slate-900 text-sm sm:text-base">
                  {selectedGrammar.formation}
                </p>
              </div>
            )}

            {/* Prerequisite Vocab Status */}
            {(() => {
              const lock = evaluateGrammarLockStatus(selectedGrammar, userVocabCards);
              if (lock.totalCount === 0) return null;
              return (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <span>{lock.isUnlocked ? '🔓' : '🔒'}</span>
                      <span>前提語彙マスター状況 (Prerequisite Vocab Status)</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        lock.isUnlocked
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {lock.isUnlocked
                        ? '全語彙安定 (解放済み)'
                        : `${lock.stableCount}/${lock.totalCount} 安定 (${lock.readinessPercent}%)`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {lock.prerequisites.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-japanese font-bold text-slate-900 text-sm">{p.kanji}</span>
                            {p.reading && (
                              <span className="text-[10px] text-slate-400 font-japanese">({p.reading})</span>
                            )}
                          </div>
                          {p.meaning && <p className="text-[10px] text-slate-500 line-clamp-1 italic">{p.meaning}</p>}
                        </div>

                        <div className="text-right shrink-0">
                          {p.isStable ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              ✓ {p.currentInterval}日
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              ⏳ {p.currentInterval}d / 7d
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Usage */}
            {selectedGrammar.usage && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
                  解説・用法 (Usage)
                </span>
                <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
                  {selectedGrammar.usage}
                </p>
              </div>
            )}

            {/* Example Sentences */}
            {((selectedGrammar.grammarExamples && selectedGrammar.grammarExamples.length > 0) || selectedGrammar.example) && (
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  例文 (Example Sentences)
                </span>

                <div className="space-y-2">
                  {[
                    ...(selectedGrammar.grammarExamples || []),
                    selectedGrammar.example
                      ? {
                          japanese: selectedGrammar.example,
                          reading: selectedGrammar.exampleReading,
                          english: selectedGrammar.exampleMeaning,
                        }
                      : null,
                  ]
                    .filter(Boolean)
                    .map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <p className="text-sm sm:text-base font-bold text-slate-900 font-japanese">
                              {ex.japanese}
                            </p>
                            {ex.reading && <p className="text-xs text-slate-500 font-japanese">{ex.reading}</p>}
                            {ex.english && <p className="text-xs text-slate-600 italic">"{ex.english}"</p>}
                          </div>
                          <button
                            type="button"
                            onClick={() => speak(ex.japanese)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-700 transition-all shrink-0"
                            title="Play sentence audio"
                          >
                            🔊
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Common Mistakes */}
            {selectedGrammar.commonMistake && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-800">
                  <span>⚠️ よくある間違い (Common Pitfall)</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-amber-900 font-japanese leading-relaxed">
                  {selectedGrammar.commonMistake}
                </p>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedGrammar(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                閉じる
              </button>

              <div className="flex items-center gap-2">
                {onViewGraph && (
                  <button
                    type="button"
                    onClick={() => {
                      onViewGraph(selectedGrammar.grammar);
                      setSelectedGrammar(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <span>🕸️</span>
                    <span>相関図</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    handleStudySingle(selectedGrammar, 'recognition');
                    setSelectedGrammar(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-black shadow-sm transition-all"
                >
                  この項目をSRSで学習する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

