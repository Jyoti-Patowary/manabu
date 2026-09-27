'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { cleanRomajiSlug, createKanaCard } from '@/lib/kanaData';

export const GOJUON_ROWS = [
  {
    name: 'あ行 (A-row)',
    items: [
      { h: 'あ', k: 'ア', r: 'a' },
      { h: 'い', k: 'イ', r: 'i' },
      { h: 'う', k: 'ウ', r: 'u' },
      { h: 'え', k: 'エ', r: 'e' },
      { h: 'お', k: 'オ', r: 'o' },
    ],
  },
  {
    name: 'か行 (Ka-row)',
    items: [
      { h: 'か', k: 'カ', r: 'ka' },
      { h: 'き', k: 'キ', r: 'ki' },
      { h: 'く', k: 'ク', r: 'ku' },
      { h: 'け', k: 'ケ', r: 'ke' },
      { h: 'こ', k: 'コ', r: 'ko' },
    ],
  },
  {
    name: 'さ行 (Sa-row)',
    items: [
      { h: 'さ', k: 'サ', r: 'sa' },
      { h: 'し', k: 'シ', r: 'shi' },
      { h: 'す', k: 'ス', r: 'su' },
      { h: 'せ', k: 'セ', r: 'se' },
      { h: 'そ', k: 'ソ', r: 'so' },
    ],
  },
  {
    name: 'た行 (Ta-row)',
    items: [
      { h: 'た', k: 'タ', r: 'ta' },
      { h: 'ち', k: 'チ', r: 'chi' },
      { h: 'つ', k: 'ツ', r: 'tsu' },
      { h: 'て', k: 'テ', r: 'te' },
      { h: 'と', k: 'ト', r: 'to' },
    ],
  },
  {
    name: 'な行 (Na-row)',
    items: [
      { h: 'な', k: 'ナ', r: 'na' },
      { h: 'に', k: 'ニ', r: 'ni' },
      { h: 'ぬ', k: 'ヌ', r: 'nu' },
      { h: 'ね', k: 'ネ', r: 'ne' },
      { h: 'の', k: 'ノ', r: 'no' },
    ],
  },
  {
    name: 'は行 (Ha-row)',
    items: [
      { h: 'は', k: 'ハ', r: 'ha' },
      { h: 'ひ', k: 'ヒ', r: 'hi' },
      { h: 'ふ', k: 'フ', r: 'fu' },
      { h: 'へ', k: 'ヘ', r: 'he' },
      { h: 'ほ', k: 'ホ', r: 'ho' },
    ],
  },
  {
    name: 'ま行 (Ma-row)',
    items: [
      { h: 'ま', k: 'マ', r: 'ma' },
      { h: 'み', k: 'ミ', r: 'mi' },
      { h: 'む', k: 'ム', r: 'mu' },
      { h: 'め', k: 'メ', r: 'me' },
      { h: 'も', k: 'モ', r: 'mo' },
    ],
  },
  {
    name: 'や行 (Ya-row)',
    items: [
      { h: 'や', k: 'ヤ', r: 'ya' },
      null,
      { h: 'ゆ', k: 'ユ', r: 'yu' },
      null,
      { h: 'よ', k: 'ヨ', r: 'yo' },
    ],
  },
  {
    name: 'ら行 (Ra-row)',
    items: [
      { h: 'ら', k: 'ラ', r: 'ra' },
      { h: 'り', k: 'リ', r: 'ri' },
      { h: 'る', k: 'ル', r: 'ru' },
      { h: 'れ', k: 'レ', r: 're' },
      { h: 'ろ', k: 'ロ', r: 'ro' },
    ],
  },
  {
    name: 'わ行 (Wa-row)',
    items: [
      { h: 'わ', k: 'ワ', r: 'wa' },
      null,
      null,
      null,
      { h: 'を', k: 'ヲ', r: 'wo (o)' },
    ],
  },
  {
    name: 'ん (N)',
    items: [
      { h: 'ん', k: 'ン', r: 'n' },
      null,
      null,
      null,
      null,
    ],
  },
];

export const DAKUON_ROWS = [
  {
    name: 'が行 (Ga-row)',
    items: [
      { h: 'が', k: 'ガ', r: 'ga' },
      { h: 'ぎ', k: 'ギ', r: 'gi' },
      { h: 'ぐ', k: 'グ', r: 'gu' },
      { h: 'げ', k: 'ゲ', r: 'ge' },
      { h: 'ご', k: 'ゴ', r: 'go' },
    ],
  },
  {
    name: 'ざ行 (Za-row)',
    items: [
      { h: 'ざ', k: 'ザ', r: 'za' },
      { h: 'じ', k: 'ジ', r: 'ji' },
      { h: 'ず', k: 'ズ', r: 'zu' },
      { h: 'ぜ', k: 'ゼ', r: 'ze' },
      { h: 'ぞ', k: 'ゾ', r: 'zo' },
    ],
  },
  {
    name: 'だ行 (Da-row)',
    items: [
      { h: 'だ', k: 'ダ', r: 'da' },
      { h: 'ぢ', k: 'ヂ', r: 'ji (dji)' },
      { h: 'づ', k: 'ヅ', r: 'zu (dzu)' },
      { h: 'で', k: 'デ', r: 'de' },
      { h: 'ど', k: 'ド', r: 'do' },
    ],
  },
  {
    name: 'ば行 (Ba-row)',
    items: [
      { h: 'ば', k: 'バ', r: 'ba' },
      { h: 'び', k: 'ビ', r: 'bi' },
      { h: 'ぶ', k: 'ブ', r: 'bu' },
      { h: 'べ', k: 'ベ', r: 'be' },
      { h: 'ぼ', k: 'ボ', r: 'bo' },
    ],
  },
  {
    name: 'ぱ行 (Pa-row 半濁音)',
    items: [
      { h: 'ぱ', k: 'パ', r: 'pa' },
      { h: 'ぴ', k: 'ピ', r: 'pi' },
      { h: 'ぷ', k: 'プ', r: 'pu' },
      { h: 'ぺ', k: 'ペ', r: 'pe' },
      { h: 'ぽ', k: 'ポ', r: 'po' },
    ],
  },
];

export const YOON_ROWS = [
  {
    name: 'きゃ〜 (Kya / Sha / Cha)',
    items: [
      { h: 'きゃ', k: 'キャ', r: 'kya' },
      { h: 'きゅ', k: 'キュ', r: 'kyu' },
      { h: 'きょ', k: 'キョ', r: 'kyo' },
    ],
  },
  {
    name: 'しゃ〜 (Sha / Shu / Sho)',
    items: [
      { h: 'しゃ', k: 'シャ', r: 'sha' },
      { h: 'しゅ', k: 'シュ', r: 'shu' },
      { h: 'しょ', k: 'ショ', r: 'sho' },
    ],
  },
  {
    name: 'ちゃ〜 (Cha / Chu / Cho)',
    items: [
      { h: 'ちゃ', k: 'チャ', r: 'cha' },
      { h: 'ちゅ', k: 'チュ', r: 'chu' },
      { h: 'ちょ', k: 'チョ', r: 'cho' },
    ],
  },
  {
    name: 'にゃ〜 (Nya / Nyu / Nyo)',
    items: [
      { h: 'にゃ', k: 'ニャ', r: 'nya' },
      { h: 'にゅ', k: 'ニュ', r: 'nyu' },
      { h: 'にょ', k: 'ニョ', r: 'nyo' },
    ],
  },
  {
    name: 'ひゃ〜 (Hya / Hyu / Hyo)',
    items: [
      { h: 'ひゃ', k: 'ヒャ', r: 'hya' },
      { h: 'ひゅ', k: 'ヒュ', r: 'hyu' },
      { h: 'ひょ', k: 'ヒョ', r: 'hyo' },
    ],
  },
  {
    name: 'みゃ〜 (Mya / Myu / Myo)',
    items: [
      { h: 'みゃ', k: 'ミャ', r: 'mya' },
      { h: 'みゅ', k: 'ミュ', r: 'myu' },
      { h: 'みょ', k: 'ミョ', r: 'myo' },
    ],
  },
  {
    name: 'りゃ〜 (Rya / Ryu / Ryo)',
    items: [
      { h: 'りゃ', k: 'リャ', r: 'rya' },
      { h: 'りゅ', k: 'リュ', r: 'ryu' },
      { h: 'りょ', k: 'リョ', r: 'ryo' },
    ],
  },
  {
    name: 'ぎゃ〜 (Gya / Gyu / Gyo)',
    items: [
      { h: 'ぎゃ', k: 'ギャ', r: 'gya' },
      { h: 'ぎゅ', k: 'ギュ', r: 'gyu' },
      { h: 'ぎょ', k: 'ギョ', r: 'gyo' },
    ],
  },
  {
    name: 'じゃ〜 (Ja / Ju / Jo)',
    items: [
      { h: 'じゃ', k: 'ジャ', r: 'ja' },
      { h: 'じゅ', k: 'ジュ', r: 'ju' },
      { h: 'じょ', k: 'ジョ', r: 'jo' },
    ],
  },
  {
    name: 'びゃ〜 (Bya / Byu / Byo)',
    items: [
      { h: 'びゃ', k: 'ビャ', r: 'bya' },
      { h: 'びゅ', k: 'ビュ', r: 'byu' },
      { h: 'びょ', k: 'ビョ', r: 'byo' },
    ],
  },
  {
    name: 'ぴゃ〜 (Pya / Pyu / Pyo)',
    items: [
      { h: 'ぴゃ', k: 'ピャ', r: 'pya' },
      { h: 'ぴゅ', k: 'ピュ', r: 'pyu' },
      { h: 'ぴょ', k: 'ピョ', r: 'pyo' },
    ],
  },
];

export default function KanaChart({ onStudyKana, defaultScript = 'hiragana' }) {
  const { t } = useLanguage();
  const [scriptType, setScriptType] = useState(defaultScript); // 'hiragana', 'katakana', 'both'
  const [section, setSection] = useState('gojuon'); // 'gojuon', 'dakuon', 'yoon'
  const [showRomaji, setShowRomaji] = useState(true);
  const [drillMode, setDrillMode] = useState('recognition'); // 'recognition' | 'production' | 'audio'
  const [activeSound, setActiveSound] = useState(null);
  const [masteredCards, setMasteredCards] = useState(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem('manabu-kana-mastered');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const speak = useCallback((text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
      setActiveSound(text);
      setTimeout(() => setActiveSound(null), 500);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const currentRows = section === 'gojuon' 
    ? GOJUON_ROWS 
    : (section === 'dakuon' ? DAKUON_ROWS : YOON_ROWS);

  const sectionTotalCount = useMemo(() => {
    let count = 0;
    currentRows.forEach(row => {
      row.items.forEach(item => {
        if (item) count++;
      });
    });
    return scriptType === 'both' ? count * 2 : count;
  }, [currentRows, scriptType]);

  const sectionMasteredCount = useMemo(() => {
    let count = 0;
    currentRows.forEach(row => {
      row.items.forEach(item => {
        if (!item) return;
        const slug = cleanRomajiSlug(item.r);
        if (scriptType === 'both') {
          if (masteredCards.has(`kana-${slug}-hiragana`)) count++;
          if (masteredCards.has(`kana-${slug}-katakana`)) count++;
        } else if (scriptType === 'katakana') {
          if (masteredCards.has(`kana-${slug}-katakana`)) count++;
        } else {
          if (masteredCards.has(`kana-${slug}-hiragana`)) count++;
        }
      });
    });
    return count;
  }, [currentRows, scriptType, masteredCards]);

  const handleMarkSectionMastered = () => {
    const next = new Set(masteredCards);
    currentRows.forEach(row => {
      row.items.forEach(item => {
        if (!item) return;
        const slug = cleanRomajiSlug(item.r);
        if (scriptType === 'both') {
          next.add(`kana-${slug}-hiragana`);
          next.add(`kana-${slug}-katakana`);
        } else if (scriptType === 'katakana') {
          next.add(`kana-${slug}-katakana`);
        } else {
          next.add(`kana-${slug}-hiragana`);
        }
      });
    });
    setMasteredCards(next);
    try {
      localStorage.setItem('manabu-kana-mastered', JSON.stringify(Array.from(next)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleStudyCurrentSection = () => {
    if (!onStudyKana) return;

    // Collect all cards in current section using canonical unified schema
    const cards = [];
    currentRows.forEach(row => {
      row.items.forEach(item => {
        if (!item) return;
        const itemWithSection = { ...item, section };
        if (scriptType === 'both') {
          cards.push(createKanaCard(itemWithSection, 'hiragana'));
          cards.push(createKanaCard(itemWithSection, 'katakana'));
        } else {
          cards.push(createKanaCard(itemWithSection, scriptType));
        }
      });
    });

    if (cards.length > 0) {
      onStudyKana(
        {
          id: `kana-practice-${scriptType}-${section}`,
          name: `${scriptType === 'katakana' ? 'カタカナ' : (scriptType === 'both' ? 'かな' : 'ひらがな')} (${section === 'gojuon' ? '五十音' : (section === 'dakuon' ? '濁音' : '拗音')})`,
          cards,
        },
        drillMode
      );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-sm space-y-6 animate-in fade-in duration-300">
      
      {/* Header: Title, Controls, Study Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider mb-1">
            <span>あ/ア</span>
            <span>基礎モジュール・カナ完全表 (No JLPT Level)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            ひらがな・カタカナ完全五十音 (Kana Module)
          </h2>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span>タップしてネイティブ音声再生</span>
            <span>•</span>
            <span className="font-bold text-indigo-600">
              習得状況: {sectionMasteredCount}/{sectionTotalCount} ({sectionTotalCount > 0 ? Math.round((sectionMasteredCount / sectionTotalCount) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Review Mode Selector */}
          <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setDrillMode('recognition')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] ${
                drillMode === 'recognition'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="文字から読みを想起"
            >
              👁️ 認識
            </button>
            <button
              type="button"
              onClick={() => setDrillMode('production')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] ${
                drillMode === 'production'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="ローマ字から文字を想起"
            >
              ✍️ 想起
            </button>
            <button
              type="button"
              onClick={() => setDrillMode('audio')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] ${
                drillMode === 'audio'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="音声から文字を想起"
            >
              🔊 音声
            </button>
          </div>

          {/* Romaji toggle */}
          <button
            onClick={() => setShowRomaji(!showRomaji)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
              showRomaji
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            ローマ字 {showRomaji ? 'ON' : 'OFF'}
          </button>

          {/* Mark Section Mastered Button */}
          <button
            type="button"
            onClick={handleMarkSectionMastered}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer shadow-xs"
            title="この表のすべての仮名を一度に習得済みにマーク"
          >
            ✓ すべて習得済みにする
          </button>

          {/* Study Section Button */}
          {onStudyKana && (
            <button
              onClick={handleStudyCurrentSection}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <span>{drillMode === 'production' ? '想起で練習' : (drillMode === 'audio' ? '音声で練習' : '認識で練習')}</span>
              <span>→</span>
            </button>
          )}
        </div>
      </div>

      {/* Script Type Selector (Hiragana vs Katakana vs Both) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setScriptType('hiragana')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              scriptType === 'hiragana'
                ? 'bg-white text-rose-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            あ ひらがな (Hiragana)
          </button>
          <button
            onClick={() => setScriptType('katakana')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              scriptType === 'katakana'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            ア カタカナ (Katakana)
          </button>
          <button
            onClick={() => setScriptType('both')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              scriptType === 'both'
                ? 'bg-white text-slate-950 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            あ/ア 両方 (Both)
          </button>
        </div>

        {/* Section Tabs: Gojuon, Dakuon, Yoon */}
        <div className="flex items-center gap-1">
          {[
            { id: 'gojuon', label: '清音 (五十音 46音)' },
            { id: 'dakuon', label: '濁音・半濁音 (25音)' },
            { id: 'yoon', label: '拗音 (33音)' },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSection(sec.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                section === sec.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="space-y-4">
        {/* Vowel Column Headers for Gojuon & Dakuon */}
        {section !== 'yoon' && (
          <div className="grid grid-cols-5 gap-2 text-center text-xs font-black text-slate-400 max-w-2xl mx-auto px-1">
            <span className="bg-slate-100/80 py-1 rounded-lg">a (あ段)</span>
            <span className="bg-slate-100/80 py-1 rounded-lg">i (い段)</span>
            <span className="bg-slate-100/80 py-1 rounded-lg">u (う段)</span>
            <span className="bg-slate-100/80 py-1 rounded-lg">e (え段)</span>
            <span className="bg-slate-100/80 py-1 rounded-lg">o (お段)</span>
          </div>
        )}

        {/* Yoon Column Headers */}
        {section === 'yoon' && (
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-black text-slate-400 max-w-xl mx-auto px-1">
            <span className="bg-slate-100/80 py-1 rounded-lg">-ya (ゃ / ャ)</span>
            <span className="bg-slate-100/80 py-1 rounded-lg">-yu (ゅ / ュ)</span>
            <span className="bg-slate-100/80 py-1 rounded-lg">-yo (ょ / ョ)</span>
          </div>
        )}

        {/* Kana Rows */}
        <div className="space-y-3">
          {currentRows.map((row) => (
            <div key={row.name} className={`mx-auto ${section === 'yoon' ? 'max-w-xl' : 'max-w-2xl'}`}>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-1">
                {row.name}
              </div>

              <div className={`grid gap-2 ${section === 'yoon' ? 'grid-cols-3' : 'grid-cols-5'}`}>
                {row.items.map((item, idx) => {
                  if (!item) {
                    return (
                      <div
                        key={idx}
                        className="h-16 sm:h-20 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200/60 flex items-center justify-center text-slate-300 font-bold select-none text-xs"
                      >
                        —
                      </div>
                    );
                  }

                  const isPlaying = activeSound === item.h || activeSound === item.k;
                  const slug = cleanRomajiSlug(item.r);
                  const isMastered = scriptType === 'both'
                    ? (masteredCards.has(`kana-${slug}-hiragana`) && masteredCards.has(`kana-${slug}-katakana`))
                    : (scriptType === 'katakana' ? masteredCards.has(`kana-${slug}-katakana`) : masteredCards.has(`kana-${slug}-hiragana`));

                  return (
                    <button
                      key={item.r}
                      type="button"
                      onClick={() => speak(scriptType === 'katakana' ? item.k : item.h)}
                      className={`group relative h-16 sm:h-20 rounded-2xl border p-1 sm:p-2 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer select-none active:scale-95 ${
                        isPlaying
                          ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400 shadow-md scale-105'
                          : isMastered
                          ? 'bg-emerald-50/40 border-emerald-200/90 hover:border-emerald-400 hover:shadow-md'
                          : 'bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5'
                      }`}
                      title={`${item.r} - クリックして再生${isMastered ? ' (習得済み)' : ''}`}
                    >
                      {/* Mastered Indicator */}
                      {isMastered && (
                        <span className="absolute top-1 right-1 text-[9px] font-black text-emerald-700 bg-emerald-100 rounded-full w-4 h-4 flex items-center justify-center border border-emerald-300 shadow-2xs">
                          ✓
                        </span>
                      )}

                      {/* Character Display */}
                      <div className="flex items-center gap-1 font-japanese">
                        {scriptType === 'hiragana' && (
                          <span className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-rose-600 transition-colors">
                            {item.h}
                          </span>
                        )}
                        {scriptType === 'katakana' && (
                          <span className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {item.k}
                          </span>
                        )}
                        {scriptType === 'both' && (
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl sm:text-2xl font-black text-rose-600">
                              {item.h}
                            </span>
                            <span className="text-base sm:text-lg font-bold text-indigo-600">
                              {item.k}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Romaji Subtitle */}
                      {showRomaji && (
                        <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 group-hover:text-slate-700 uppercase tracking-wide mt-0.5">
                          {item.r}
                        </span>
                      )}

                      {/* Subtle Speaker icon on hover */}
                      <span className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 transition-opacity">
                        🔊
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Notes on Kana Learning */}
      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-500">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="font-bold text-slate-900 block mb-1">ひらがな (Hiragana)</span>
          和語・文法助詞・送り仮名に使われる、日本語学習の最も重要な基本文字（46音）。
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="font-bold text-slate-900 block mb-1">カタカナ (Katakana)</span>
          外来語、擬音語、生物名、強調したい言葉に使われる直線的な文字（46音）。
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="font-bold text-slate-900 block mb-1">濁音・拗音 (Variations)</span>
          「゛」(濁点)、「゜」(半濁点)、小さな「ゃ・ゅ・ょ」を組み合わせて作る合計104の音。
        </div>
      </div>
    </div>
  );
}

