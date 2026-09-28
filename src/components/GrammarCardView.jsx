import React, { useState, useMemo } from 'react';
import { generateClozePrompt } from '@/lib/grammarData';
import { evaluateGrammarLockStatus } from '@/lib/dependencyGraph';
import PrerequisiteBadge from '@/components/PrerequisiteBadge';

export default function GrammarCardView({
  card,
  isFlipped = false,
  reviewMode = 'recognition', // 'recognition' | 'production' | 'audio'
  onPlaySpeech,
  isPlayingAudio = false,
  userVocabCards = [],
  t = (key) => key,
}) {
  const [playingSentenceIdx, setPlayingSentenceIdx] = useState(null);

  const lockStatus = useMemo(
    () => evaluateGrammarLockStatus(card, userVocabCards),
    [card, userVocabCards]
  );

  if (!card) return null;

  const cloze = generateClozePrompt(card);

  const handlePlaySentence = (text, idx) => {
    if (!onPlaySpeech) return;
    setPlayingSentenceIdx(idx);
    onPlaySpeech(text);
    setTimeout(() => {
      setPlayingSentenceIdx(null);
    }, 2500);
  };

  // -------------------------------------------------------------
  // FRONT OF CARD
  // -------------------------------------------------------------
  if (!isFlipped) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center space-y-6">
        {/* Meta badges */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-200">
            {card.jlpt_level || card.jlpt || 'N5'} 文法
          </span>
          {card.category && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {card.category}
            </span>
          )}
          <PrerequisiteBadge lockStatus={lockStatus} compact />
        </div>

        {/* Mode-Specific Front Display */}
        {reviewMode === 'recognition' && (
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 font-japanese tracking-wide">
              {card.grammar}
            </h2>
            {card.formation && (
              <div className="inline-block px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs sm:text-sm border border-purple-100 font-japanese">
                <span className="opacity-70 mr-1.5 font-sans">接続:</span> {card.formation}
              </div>
            )}
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              この文法の意味とニュアンスを思い出してください
            </p>
          </div>
        )}

        {reviewMode === 'production' && (
          <div className="space-y-4 max-w-lg w-full px-2">
            <div className="space-y-1">
              <span className="text-xs uppercase font-extrabold tracking-wider text-purple-600 block">
                Target Meaning / 意味
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {card.meaning}
              </h3>
            </div>

            {cloze?.clozeSentence && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-left space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-amber-800">
                  <span>穴埋め (Fill in the blank)</span>
                  {card.formation && <span className="opacity-75 font-japanese text-[11px]">{card.formation}</span>}
                </div>
                <p className="text-lg sm:text-xl font-black text-slate-900 font-japanese leading-relaxed">
                  {cloze.clozeSentence}
                </p>
                {cloze.english && (
                  <p className="text-xs text-slate-600 italic">
                    "{cloze.english}"
                  </p>
                )}
              </div>
            )}

            <p className="text-xs text-slate-400 font-medium">
              空欄に入る適切な文法・接続を思い出してください
            </p>
          </div>
        )}

        {reviewMode === 'audio' && (
          <div className="space-y-5">
            <div className="w-20 h-20 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-sm animate-pulse">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-base font-bold text-slate-800">
                音声を聞いて文法と意味を判断してください
              </p>
              <p className="text-xs text-slate-500">
                (Click speaker below or press Space if needed to replay)
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // BACK OF CARD (REVEALED)
  // -------------------------------------------------------------
  const allExamples = [
    ...(card.grammarExamples || []),
    card.example && !card.grammarExamples?.some((e) => e.japanese === card.example)
      ? { japanese: card.example, reading: card.exampleReading, english: card.exampleMeaning }
      : null,
  ].filter(Boolean);

  return (
    <div className="text-left space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Grammar Pattern & Meaning */}
      <div className="border-b border-slate-100 pb-4 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-200">
              {card.jlpt_level || card.jlpt || 'N5'}
            </span>
            {card.category && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {card.category}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handlePlaySentence(card.grammar, 'pattern')}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-all"
            title="Play pattern pronunciation"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <span>音声再生</span>
          </button>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-purple-800 font-japanese tracking-tight">
          {card.grammar}
        </h2>
        <p className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
          {card.meaning}
        </p>
      </div>

      {/* Structural Formation Formula */}
      {card.formation && (
        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-purple-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>接続構造 (Formation)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-purple-100 font-japanese font-bold text-slate-900 text-sm sm:text-base">
            {card.formation}
          </div>
        </div>
      )}

      {/* Why It Is Used Callout */}
      {(card.whyItIsUsed || card.content?.whyItIsUsed) && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
            <span>💡</span>
            <span>Why Japanese Uses This Structure</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-amber-950 leading-relaxed">
            {card.whyItIsUsed || card.content?.whyItIsUsed}
          </p>
        </div>
      )}

      {/* Word Breakdown if available */}
      {(card.wordBreakdown || card.content?.wordBreakdown)?.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
            構成要素 (Component Breakdown)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(card.wordBreakdown || card.content?.wordBreakdown).map((item, bIdx) => (
              <span
                key={bIdx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800"
              >
                <strong className="font-japanese">{item.japanese}</strong>
                <span className="text-slate-500">({item.literal})</span>
                {item.role && <span className="text-[10px] text-purple-700 font-medium">[{item.role}]</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Usage & Nuance Explanation */}
      {(card.usage || card.content?.explanation) && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
            解説・ニュアンス (Usage & Nuance)
          </span>
          <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-line">
            {card.usage || card.content?.explanation}
          </p>
        </div>
      )}

      {/* Interactive Example Sentences with native TTS */}
      {allExamples.length > 0 && (
        <div className="space-y-2.5">
          <span className="text-[11px] uppercase font-black tracking-wider text-slate-400 block">
            例文 (Example Sentences with native audio)
          </span>

          <div className="space-y-2">
            {allExamples.map((ex, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-purple-200 transition-all shadow-2xs space-y-1.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <p className="text-base sm:text-lg font-bold text-slate-900 font-japanese leading-snug">
                      {ex.japanese}
                    </p>
                    {ex.reading && (
                      <p className="text-xs text-slate-500 font-japanese">
                        {ex.reading}
                      </p>
                    )}
                    {ex.english && (
                      <p className="text-xs sm:text-sm font-medium text-slate-600 italic">
                        "{ex.english}"
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePlaySentence(ex.japanese, idx)}
                    className={`p-2 rounded-lg transition-all shrink-0 ${
                      playingSentenceIdx === idx
                        ? 'bg-purple-600 text-white scale-105'
                        : 'bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-700'
                    }`}
                    title="Play sentence audio"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Mistake Warning */}
      {card.commonMistake && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-800">
            <span>⚠️</span>
            <span>よくある間違い (Common Pitfall)</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-amber-900 font-japanese leading-relaxed">
            {card.commonMistake}
          </p>
        </div>
      )}

      {/* Formal / Casual Register Variations */}
      {card.formalAlternative && (
        <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100/80 flex items-center justify-between text-xs">
          <span className="font-bold text-purple-700">丁寧・フォーマル表現:</span>
          <span className="font-japanese font-black text-purple-900 text-sm">{card.formalAlternative}</span>
        </div>
      )}

      {/* Prerequisite Vocab Intelligence Panel */}
      {lockStatus.totalCount > 0 && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>{lockStatus.isUnlocked ? '🔓' : '🔒'}</span>
              <span>前提語彙マスター状況 (Prerequisite Vocab Status)</span>
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                lockStatus.isUnlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {lockStatus.isUnlocked
                ? '全語彙安定 (解放済み)'
                : `${lockStatus.stableCount}/${lockStatus.totalCount} 安定 (7日以上)`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {lockStatus.prerequisites.map((p, idx) => (
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
      )}

      {/* "Why This Card" SRS Intelligence Math Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span>SRS 間隔: <strong className="text-slate-700">{card.interval || 0}日</strong></span>
        <span>復習回数: <strong className="text-slate-700">{card.repetitions || 0}回</strong></span>
        <span>Ease Factor: <strong className="text-slate-700">{(card.ease_factor || card.easeFactor || 2.5).toFixed(2)}</strong></span>
      </div>
    </div>
  );
}

