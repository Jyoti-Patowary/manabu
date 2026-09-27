'use client';

import { useState, useMemo } from 'react';
import KanjiCanvas from '../KanjiCanvas';
import { useLanguage } from '../../context/LanguageContext';

export default function LessonSetView({
  setInfo,
  contentType, // 'vocab' | 'kanji' | 'grammar'
  items = [],
  allVocabCards = [],
  onBack,
  onStartDrill,
}) {
  const { t } = useLanguage();
  const [activeKanjiIndex, setActiveKanjiIndex] = useState(0);
  const [expandedVocabIndex, setExpandedVocabIndex] = useState(null);
  const [showFurigana, setShowFurigana] = useState(true);

  // Audio pronunciation helper
  const speakJapanese = (text) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error(e);
    }
  };

  const currentKanji = items[activeKanjiIndex] || null;

  // Dynamically derive compound words for active Kanji from vocabulary pool
  const activeKanjiCompounds = useMemo(() => {
    if (!currentKanji) return [];

    // 1. Explicit examples in card
    if (Array.isArray(currentKanji.wordExamples) && currentKanji.wordExamples.length > 0) {
      return currentKanji.wordExamples.map(w => ({
        word: typeof w === 'string' ? w : `${w.japanese || w.word} (${w.reading || ''})`,
        meaning: w.meaning || w.english || '',
      }));
    }
    if (Array.isArray(currentKanji.compounds) && currentKanji.compounds.length > 0) {
      return currentKanji.compounds;
    }

    // 2. Discover compound words from vocab pool that contain this kanji
    const char = currentKanji.kanji || currentKanji.name || '';
    if (!char) return [];

    const matches = (allVocabCards || []).filter(v => 
      v.kanji && v.kanji.includes(char) && v.kanji.length > 1
    );

    if (matches.length > 0) {
      return matches.slice(0, 4).map(m => ({
        word: `${m.kanji} (${m.reading})`,
        meaning: m.meaning,
        raw: m.kanji,
      }));
    }

    // 3. Fallback: on/kun reading examples
    const list = [];
    if (currentKanji.onyomi) {
      list.push({
        word: `【音】${currentKanji.kanji} (${currentKanji.onyomi})`,
        meaning: currentKanji.meaning,
        raw: currentKanji.kanji,
      });
    }
    if (currentKanji.kunyomi) {
      list.push({
        word: `【訓】${currentKanji.kanji} (${currentKanji.kunyomi})`,
        meaning: currentKanji.meaning,
        raw: currentKanji.kanji,
      });
    }
    return list;
  }, [currentKanji, allVocabCards]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fadeIn pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E5DF]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-[#71717A] hover:text-[#18181B] p-1.5 rounded-lg hover:bg-[#F4F4F0] transition-fast cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>{t('backToHub') || 'ハブへ戻る'}</span>
        </button>

        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
            {t('lessonSetLabel', { count: items.length }) || `Lesson Set (${items.length} items)`}
          </div>
          <h1 className="text-lg font-black text-[#18181B]">{setInfo.title}</h1>
        </div>
      </div>

      {/* 1. VOCABULARY LESSON: Real cards with dynamic example sentences and audio */}
      {contentType === 'vocab' && (
        <div className="space-y-3">
          {items.map((word, idx) => {
            const isExpanded = expandedVocabIndex === idx;
            const exJp = word.example || word.exampleJapanese || '';
            const exReading = word.exampleReading || '';
            const exMeaning = word.exampleMeaning || word.exampleEnglish || '';

            return (
              <div
                key={word.id || idx}
                onClick={() => setExpandedVocabIndex(isExpanded ? null : idx)}
                className={`p-4 rounded-2xl border transition-fast cursor-pointer ${
                  isExpanded
                    ? 'border-[#1E40AF] bg-[#DBEAFE]/15 shadow-xs'
                    : 'border-[#E5E5DF] bg-white hover:border-[#BFDBFE]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-3">
                    <span className="text-xl font-black text-[#18181B] font-japanese">
                      {word.kanji || word.name || word.reading}
                    </span>
                    <span className="text-xs font-semibold text-[#71717A]">
                      {word.reading}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#18181B] text-right">
                      {word.meaning || word.english}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakJapanese(word.reading || word.kanji || word.name);
                      }}
                      className="p-1.5 rounded-lg bg-[#F4F4F0] hover:bg-[#DBEAFE] text-[#1E40AF] transition-fast cursor-pointer"
                      title={t('pronounce') || '発音を聞く'}
                    >
                      🔊
                    </button>
                  </div>
                </div>

                {/* Expanded Dynamic Example Sentence */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#BFDBFE]/40 text-xs text-[#71717A] space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-[#1E40AF]">{t('exampleSentence') || '例文 (Example Sentence)'}:</div>
                      {exJp && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakJapanese(exJp);
                          }}
                          className="px-2 py-0.5 rounded text-[11px] bg-white border border-[#BFDBFE] text-[#1E40AF] hover:bg-[#DBEAFE]"
                        >
                          🔊 {t('playAudio') || '音声'}
                        </button>
                      )}
                    </div>
                    {exJp ? (
                      <div className="space-y-0.5">
                        <div className="text-sm font-japanese font-bold text-[#18181B] leading-relaxed">
                          {exJp}
                        </div>
                        {exReading && (
                          <div className="text-xs text-[#71717A] font-japanese">
                            {exReading}
                          </div>
                        )}
                        {exMeaning && (
                          <div className="text-xs text-[#52525B]">
                            {exMeaning}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs italic text-[#A1A1AA]">
                        {word.kanji || word.reading} を使った日常会話の基本表現です。
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 2. KANJI LESSON: Dynamic single-kanji canvas, stroke order, readings, and real compounds */}
      {contentType === 'kanji' && (
        <div className="space-y-6">
          {items.length > 0 && currentKanji && (
            <div className="bg-white rounded-3xl border border-[#E5E5DF] p-6 sm:p-8 shadow-xs space-y-6">
              {/* Pagination controls */}
              <div className="flex items-center justify-between text-xs text-[#71717A] border-b border-[#F4F4F0] pb-3">
                <span className="font-mono font-bold">
                  Kanji {activeKanjiIndex + 1} / {items.length}
                </span>

                <div className="flex gap-1">
                  <button
                    disabled={activeKanjiIndex === 0}
                    onClick={() => setActiveKanjiIndex(prev => Math.max(0, prev - 1))}
                    className="px-3 py-1 rounded-lg border border-[#E5E5DF] disabled:opacity-30 hover:bg-[#F4F4F0] transition-fast cursor-pointer"
                  >
                    {t('previous') || '前へ'}
                  </button>
                  <button
                    disabled={activeKanjiIndex === items.length - 1}
                    onClick={() => setActiveKanjiIndex(prev => Math.min(items.length - 1, prev + 1))}
                    className="px-3 py-1 rounded-lg border border-[#E5E5DF] disabled:opacity-30 hover:bg-[#F4F4F0] transition-fast cursor-pointer"
                  >
                    {t('next') || '次へ'}
                  </button>
                </div>
              </div>

              {/* Main Kanji Focus Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left: Kanji Canvas & Stroke Order */}
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#FBFBF9] border border-[#E5E5DF]">
                  <KanjiCanvas kanji={currentKanji.kanji || currentKanji.name} />
                  <span className="text-[11px] text-[#A1A1AA] mt-2">
                    {t('strokes') || '画数'}: {currentKanji.strokes || currentKanji.stroke_count || '—'} {t('strokesUnit') || '画'}
                  </span>
                </div>

                {/* Right: Readings & Meaning */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded">
                      {t('meaningTitle') || 'Meaning'}
                    </span>
                    <h2 className="text-2xl font-black text-[#18181B] mt-1">
                      {currentKanji.meaning || currentKanji.english}
                    </h2>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-[#F4F4F0] space-y-1">
                      <span className="font-bold text-[#71717A] text-[10px] uppercase">{t('onyomi') || "音読み (On'yomi)"}</span>
                      <div className="font-japanese font-bold text-base text-[#18181B]">
                        {currentKanji.onyomi || currentKanji.reading || '—'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F4F4F0] space-y-1">
                      <span className="font-bold text-[#71717A] text-[10px] uppercase">{t('kunyomi') || "訓読み (Kun'yomi)"}</span>
                      <div className="font-japanese font-bold text-base text-[#18181B]">
                        {currentKanji.kunyomi || '—'}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Compound Words (熟語) */}
                  <div className="space-y-1.5 pt-2">
                    <span className="font-bold text-xs text-[#18181B]">{t('commonCompounds') || '代表的な熟語 (Compounds)'}</span>
                    <div className="text-xs text-[#71717A] space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {activeKanjiCompounds.length > 0 ? (
                        activeKanjiCompounds.map((cp, cIdx) => (
                          <div key={cIdx} className="flex justify-between items-center p-2 rounded-lg bg-[#FBFBF9] border border-[#E5E5DF]">
                            <span className="font-bold text-[#18181B] font-japanese">{cp.word}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-[#71717A]">{cp.meaning}</span>
                              <button
                                type="button"
                                onClick={() => speakJapanese(cp.raw || cp.word)}
                                className="p-1 rounded bg-white text-[#71717A] hover:text-[#18181B]"
                              >
                                🔊
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-xs italic text-[#A1A1AA] bg-[#FBFBF9] rounded-lg">
                          該当する代表的熟語を検索中
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. GRAMMAR LESSON: Dynamic pattern, structure diagram, example sentences, nuance callout */}
      {contentType === 'grammar' && (
        <div className="space-y-6">
          {items.map((grammar, idx) => {
            const examples = (Array.isArray(grammar.grammarExamples) && grammar.grammarExamples.length > 0)
              ? grammar.grammarExamples
              : (grammar.example ? [{
                  japanese: grammar.example,
                  reading: grammar.exampleReading || '',
                  english: grammar.exampleMeaning || grammar.meaning || '',
                }] : []);

            const nuanceText = grammar.commonMistake
              ? `【注意点】${grammar.commonMistake} ${grammar.formalAlternative ? `(改まった表現: 「${grammar.formalAlternative}」)` : ''}`
              : (grammar.usage || grammar.nuance || (grammar.formalAlternative ? `【改まった表現】${grammar.formalAlternative}` : ''));

            return (
              <div
                key={grammar.id || idx}
                className="bg-white rounded-3xl border border-[#E5E5DF] p-6 sm:p-8 shadow-xs space-y-5"
              >
                {/* Pattern Name */}
                <div className="flex items-center justify-between border-b border-[#F4F4F0] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded">
                      Grammar Pattern
                    </span>
                    <h2 className="text-2xl font-black text-[#18181B] font-japanese mt-1">
                      {grammar.grammar || grammar.pattern || grammar.name || grammar.kanji}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowFurigana(!showFurigana)}
                    className="text-xs font-bold text-[#71717A] hover:text-[#18181B] px-2.5 py-1 rounded-lg border border-[#E5E5DF]"
                  >
                    {showFurigana ? (t('furiganaOn') || 'ふりがな: ON') : (t('furiganaOff') || 'ふりがな: OFF')}
                  </button>
                </div>

                {/* Dynamic Structure Diagram */}
                <div className="p-4 rounded-2xl bg-[#DCFCE7]/30 border border-[#BBF7D0] space-y-1">
                  <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider">
                    {t('formationRule') || '接続・構文 (Formation Rule)'}
                  </span>
                  <div className="text-sm font-mono font-bold text-[#15803D]">
                    {grammar.formation || grammar.structure || '[接続ルール] 基本形'}
                  </div>
                  <div className="text-xs text-[#71717A] mt-1">
                    {t('meaningLabel') || '意味'}: {grammar.meaning || grammar.english}
                  </div>
                </div>

                {/* Dynamic Example Sentences */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#18181B]">{t('exampleSentence') || '例文 (Example Sentences)'}</span>
                  <div className="space-y-2 text-xs text-[#71717A]">
                    {examples.length > 0 ? (
                      examples.map((ex, exIdx) => (
                        <div key={exIdx} className="p-3 rounded-xl bg-[#FBFBF9] border border-[#E5E5DF] flex items-center justify-between gap-3">
                          <div className="space-y-0.5 flex-1">
                            <div className="text-sm font-japanese font-bold text-[#18181B] leading-relaxed">
                              {ex.japanese}
                            </div>
                            {showFurigana && ex.reading && (
                              <div className="text-xs text-[#71717A] font-japanese">
                                {ex.reading}
                              </div>
                            )}
                            {ex.english && (
                              <div className="text-xs text-[#52525B]">
                                {ex.english}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => speakJapanese(ex.japanese)}
                            className="p-1.5 rounded-lg bg-white border border-[#E5E5DF] text-[#18181B] hover:bg-[#F4F4F0] shrink-0"
                            title="発音を聞く"
                          >
                            🔊
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 rounded-xl bg-[#FBFBF9] border border-[#E5E5DF] text-xs italic text-[#A1A1AA]">
                        {grammar.grammar} の基本的な活用例文です。
                      </div>
                    )}
                  </div>
                </div>

                {/* Dynamic Nuance / Common Confusion Box */}
                {nuanceText && (
                  <div className="p-3.5 rounded-2xl bg-[#FFF1EE] border border-[#FECDCA] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#D94826]">
                      <span>💡</span>
                      <span>{t('nuanceCallout') || 'ニュアンス・使い分け (Nuance & Contrast)'}</span>
                    </div>
                    <p className="text-xs text-[#71717A] leading-relaxed">
                      {nuanceText}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Persistent Bottom Bar: "Start Drill" Button */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-white/90 backdrop-blur-md border-t border-[#E5E5DF]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-xs text-[#71717A]">
            {t('drillReadyHint') || 'レッスン完了後に直接ドリルを開始できます'}
          </div>
          <button
            onClick={() => onStartDrill(items)}
            className="px-6 py-3 rounded-xl bg-[#D94826] text-white font-bold text-xs sm:text-sm hover:bg-[#BF3B1C] transition-fast shadow-xs cursor-pointer flex items-center gap-2"
          >
            <span>{t('startDrillForSet') || 'このセットのドリルを開始 (Start Drill)'}</span>
            <span>🎯</span>
          </button>
        </div>
      </div>
    </div>
  );
}
