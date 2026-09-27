'use client';

import { useState, useCallback } from 'react';
import ReaderWordModal from '@/components/ReaderWordModal';
import { isTokenInSrsQueue } from '@/lib/readingData';
import { useLanguage } from '@/context/LanguageContext';

export default function ReaderView({
  story,
  userCards = [],
  onBack,
  onAddToSrs,
}) {
  const { t } = useLanguage();
  const [furiganaMode, setFuriganaMode] = useState('always'); // 'always' | 'tap' | 'off'
  const [showEnglish, setShowEnglish] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [playingSentenceId, setPlayingSentenceId] = useState(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);

  // Native speech synthesis
  const speak = useCallback((text, id = null) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;

      if (id) {
        setPlayingSentenceId(id);
        utterance.onend = () => setPlayingSentenceId(null);
        utterance.onerror = () => setPlayingSentenceId(null);
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error(e);
      setPlayingSentenceId(null);
    }
  }, []);

  const handlePlayAll = () => {
    if (isPlayingAll) {
      window.speechSynthesis?.cancel();
      setIsPlayingAll(false);
      setPlayingSentenceId(null);
      return;
    }

    const fullText = (story?.sentences || []).map((s) => s.japanese).join(' ');
    setIsPlayingAll(true);
    speak(fullText);
    setTimeout(() => setIsPlayingAll(false), (story?.word_count || 100) * 400);
  };

  if (!story) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      {/* Floating Reading Progress Indicator & Persistent Exit */}
      <div className="sticky top-4 z-20 flex items-center justify-between bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#E5E5DF] shadow-xs">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#71717A] hover:text-[#18181B] transition-fast cursor-pointer"
        >
          <span>←</span>
          <span>{t('backToHub') || 'ライブラリに戻る'}</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#71717A]">
          <span>{story.title}</span>
          <span className="text-[#A1A1AA]">({story.word_count || 100} words)</span>
        </div>
      </div>

      {/* Top Navigation & Settings Bar */}
      <div className="bg-white rounded-3xl border border-[#E5E5DF] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F4F4F0] pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Furigana Mode Switcher */}
            <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setFuriganaMode('always')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] ${
                  furiganaMode === 'always'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Furigana ON"
              >
                {t('furiganaOn') || 'ルビ ON'}
              </button>
              <button
                type="button"
                onClick={() => setFuriganaMode('off')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] ${
                  furiganaMode === 'off'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Furigana OFF"
              >
                {t('furiganaOff') || 'ルビ OFF'}
              </button>
            </div>

            {/* English Translation Toggle */}
            <button
              type="button"
              onClick={() => setShowEnglish(!showEnglish)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                showEnglish
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              EN {showEnglish ? 'ON' : 'OFF'}
            </button>

            {/* Play All Audio */}
            <button
              type="button"
              onClick={handlePlayAll}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                isPlayingAll
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <span>{isPlayingAll ? '⏹' : '▶'}</span>
              <span>{isPlayingAll ? (t('pause') || '停止') : (t('modeAudio') || '全文朗読')}</span>
            </button>
          </div>
        </div>

        {/* Story Title & Meta */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
              {story.jlpt}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {story.category}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              約{story.word_count}語
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-japanese tracking-tight pt-1">
            {story.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 italic">
            "{story.title_en}"
          </p>
        </div>
      </div>

      {/* Reading Document Body */}
      <div className="bg-[#FAF9F5] rounded-3xl border border-amber-900/10 p-6 sm:p-10 shadow-sm space-y-8 text-slate-900">
        <div className="space-y-6 text-lg sm:text-xl leading-[2.6] sm:leading-[2.8] font-japanese font-medium select-text">
          {(story.sentences || []).map((sentence) => {
            const isPlayingThis = playingSentenceId === sentence.id;

            return (
              <div
                key={sentence.id}
                className={`p-3 rounded-2xl transition-all ${
                  isPlayingThis
                    ? 'bg-amber-100/70 shadow-xs ring-1 ring-amber-300'
                    : 'hover:bg-amber-50/60'
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex-1 flex flex-wrap items-baseline gap-x-0.5">
                    {(sentence.tokens || []).map((token, tIdx) => {
                      const isPunct = token.type === 'punct';
                      const isParticle = token.type === 'particle';
                      const srsMatch = isTokenInSrsQueue(token, userCards);

                      if (isPunct) {
                        return (
                          <span key={tIdx} className="text-slate-700">
                            {token.surface}
                          </span>
                        );
                      }

                      return (
                        <button
                          key={tIdx}
                          type="button"
                          onClick={() => setSelectedToken(token)}
                          className={`inline-block text-left transition-all rounded px-0.5 relative group ${
                            isParticle
                              ? 'text-slate-600 hover:text-indigo-700'
                              : 'text-slate-950 hover:text-indigo-700 cursor-pointer font-bold'
                          } ${
                            srsMatch
                              ? 'bg-amber-100/90 text-amber-950 border-b-2 border-amber-400'
                              : 'hover:bg-indigo-50'
                          }`}
                        >
                          {/* Furigana Ruby Rendering */}
                          {furiganaMode === 'always' && token.reading && token.reading !== token.surface ? (
                            <ruby className="ruby-position-over">
                              {token.surface}
                              <rt className="text-[10px] font-medium text-slate-500 select-none">
                                {token.reading}
                              </rt>
                            </ruby>
                          ) : (
                            <span>{token.surface}</span>
                          )}

                          {/* SRS Queue Indicator Dot */}
                          {srsMatch && (
                            <span
                              className="absolute -top-1 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"
                              title="SRS復習中"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Sentence Audio Play Button */}
                  <button
                    type="button"
                    onClick={() => speak(sentence.japanese, sentence.id)}
                    className={`p-1.5 rounded-xl transition-all shrink-0 text-xs ${
                      isPlayingThis
                        ? 'bg-indigo-600 text-white scale-105'
                        : 'bg-white/80 hover:bg-white text-slate-400 hover:text-slate-700 shadow-2xs'
                    }`}
                    title="この一文を再生"
                  >
                    🔊
                  </button>
                </div>

                {/* English Sentence Translation */}
                {showEnglish && sentence.english && (
                  <p className="text-xs sm:text-sm text-slate-500 italic mt-2 font-sans leading-normal border-t border-amber-900/5 pt-1.5">
                    {sentence.english}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend / Reading Guide */}
        <div className="pt-4 border-t border-amber-900/10 flex items-center justify-between flex-wrap gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-200 border-b-2 border-amber-400 inline-block"></span>
              <span>SRS復習中単語 (Active Queue)</span>
            </span>
            <span className="flex items-center gap-1">
              <span>👆</span>
              <span>単語をタップして辞書＆SRS追加</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="font-bold text-slate-700 hover:text-indigo-600"
          >
            読了・一覧へ戻る →
          </button>
        </div>
      </div>

      {/* Tap-to-Lookup & Auto-SRS Modal */}
      {selectedToken && (
        <ReaderWordModal
          token={selectedToken}
          userCards={userCards}
          onAddToSrs={onAddToSrs}
          onClose={() => setSelectedToken(null)}
        />
      )}
    </div>
  );
}

