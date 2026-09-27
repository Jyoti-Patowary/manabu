'use client';

import { useState, useCallback } from 'react';
import PitchAccentDisplay from '@/components/PitchAccentDisplay';

export default function ReaderWordModal({
  token,
  userCards = [],
  onAddToSrs,
  onClose,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const speak = useCallback((text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (!token) return null;

  const wordKey = token.base || token.surface;
  const existingCard = (userCards || []).find(
    (c) =>
      c.kanji === wordKey ||
      c.kanji === token.surface ||
      c.reading === token.reading
  );

  const isAlreadyInDeck = Boolean(existingCard) || addedSuccess;

  const handleAdd = async () => {
    if (!onAddToSrs || isAlreadyInDeck) return;
    setIsAdding(true);
    try {
      await onAddToSrs({
        kanji: token.base || token.surface,
        reading: token.reading || '',
        meaning: token.meaning || '',
        content_type: token.type === 'grammar' ? 'grammar' : 'vocab',
        type: token.type === 'grammar' ? 'grammar' : 'vocab',
        jlpt_level: token.jlpt || 'N5',
        partOfSpeech: token.type || 'vocab',
      });
      setAddedSuccess(true);
    } catch (err) {
      console.error('Failed to add to SRS:', err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-100 text-indigo-800">
                {token.jlpt || 'N5'} · {token.type || '単語'}
              </span>
              {existingCard && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ✓ SRS登録済み ({existingCard.interval || 0}日)
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black font-japanese text-slate-950">
                {token.surface}
              </h3>
              {token.base && token.base !== token.surface && (
                <span className="text-xs text-slate-400 font-japanese">
                  [基本形: {token.base}]
                </span>
              )}
            </div>
            {token.reading && (
              <p className="text-sm font-bold text-slate-500 font-japanese">
                {token.reading}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center text-sm font-bold transition-all"
          >
            ✕
          </button>
        </div>

        {/* Meaning & Details */}
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            意味 (Definition)
          </span>
          <p className="text-base font-bold text-slate-900 leading-snug">
            {token.meaning || '意味のデータがありません'}
          </p>
        </div>

        {/* Pitch Accent Display */}
        {token.type !== 'punct' && token.type !== 'particle' && (token.reading || token.surface) && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              アクセント (Pitch Accent)
            </span>
            <PitchAccentDisplay
              word={token.base || token.surface}
              reading={token.reading || token.surface}
              showAudio={false}
              compact={true}
            />
          </div>
        )}

        {/* SRS Status Details if in Deck */}
        {existingCard && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
            <span>SRS 復習間隔: <strong className="text-slate-900">{existingCard.interval || 0}日</strong></span>
            <span>復習回数: <strong className="text-slate-900">{existingCard.repetitions || 0}回</strong></span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => speak(token.surface || token.base)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <span>🔊</span>
            <span>音声再生</span>
          </button>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isAlreadyInDeck || isAdding}
            className={`px-5 py-2.5 rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 transition-all ${
              isAlreadyInDeck
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isAlreadyInDeck ? (
              <>
                <span>✓</span>
                <span>SRS登録済み</span>
              </>
            ) : isAdding ? (
              <span>追加中...</span>
            ) : (
              <>
                <span>＋</span>
                <span>SRSデッキに追加</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

