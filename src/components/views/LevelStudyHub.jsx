'use client';

import { useState, useMemo, useCallback } from 'react';
import { getKanjiByLevel } from '@/lib/kanjiData';
import { getGrammarByLevel } from '@/lib/grammarData';
import { useLanguage } from '@/context/LanguageContext';
import PitchAccentDisplay from '@/components/PitchAccentDisplay';
import GrammarLessonModal from '@/components/lessons/GrammarLessonModal';
import KanjiLessonModal from '@/components/lessons/KanjiLessonModal';

export default function LevelStudyHub({
  level = 'N5',
  userCards = [],
  onStartStudy,
  onStartDrill,
  onStartMockExam,
  onViewGraph,
}) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('kanji'); // 'kanji' | 'vocab' | 'grammar'
  const [search, setSearch] = useState('');
  const [selectedGrammarLesson, setSelectedGrammarLesson] = useState(null);
  const [selectedKanjiLesson, setSelectedKanjiLesson] = useState(null);

  // Audio speech synthesis
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

  // 1. Kanji Data for this Level
  const kanjiList = useMemo(() => {
    return getKanjiByLevel(level);
  }, [level]);

  // 2. Grammar Data for this Level
  const grammarList = useMemo(() => {
    return getGrammarByLevel(level);
  }, [level]);

  // 3. Vocab Data for this Level (from userCards or fallback)
  const vocabList = useMemo(() => {
    const list = userCards.filter((c) => {
      const type = c.content_type || c.type || 'vocab';
      const cLvl = (c.jlpt_level || c.jlpt || '').toUpperCase();
      return type === 'vocab' && (cLvl === level.toUpperCase() || cLvl.includes(level.replace('N', '')));
    });

    if (list.length > 0) return list;

    // Fallback if cards not yet in user queue
    return [
      { kanji: '私', reading: 'わたし', meaning: 'I, me', jlpt: level },
      { kanji: '学生', reading: 'がくせい', meaning: 'student', jlpt: level },
      { kanji: '先生', reading: 'せんせい', meaning: 'teacher, master', jlpt: level },
      { kanji: '日本', reading: 'にほん', meaning: 'Japan', jlpt: level },
      { kanji: '本', reading: 'ほん', meaning: 'book', jlpt: level },
      { kanji: '友達', reading: 'ともだち', meaning: 'friend', jlpt: level },
      { kanji: '今日', reading: 'きょう', meaning: 'today', jlpt: level },
      { kanji: '明日', reading: 'あした', meaning: 'tomorrow', jlpt: level },
      { kanji: '学校', reading: 'がっこう', meaning: 'school', jlpt: level },
      { kanji: '食べる', reading: 'たべる', meaning: 'to eat', jlpt: level },
      { kanji: '飲む', reading: 'のむ', meaning: 'to drink', jlpt: level },
      { kanji: '行く', reading: 'いく', meaning: 'to go', jlpt: level },
    ];
  }, [userCards, level]);

  // Compute mastery stats for this level
  const stats = useMemo(() => {
    const levelCards = userCards.filter((c) => {
      const cLvl = (c.jlpt_level || c.jlpt || '').toUpperCase();
      return cLvl === level.toUpperCase() || cLvl.includes(level.replace('N', ''));
    });

    const total = levelCards.length || (kanjiList.length + grammarList.length + vocabList.length);
    const stable = levelCards.filter((c) => (c.interval || 0) >= 7).length;
    const learning = levelCards.filter((c) => (c.interval || 0) > 0 && (c.interval || 0) < 7).length;
    const masteryPercent = total > 0 ? Math.round(((stable + learning * 0.5) / total) * 100) : 0;

    return { total, stable, learning, masteryPercent };
  }, [userCards, level, kanjiList.length, grammarList.length, vocabList.length]);

  // Filtered lists by search
  const filteredKanji = useMemo(() => {
    if (!search.trim()) return kanjiList;
    const q = search.trim().toLowerCase();
    return kanjiList.filter((k) =>
      k.kanji.includes(q) ||
      (Array.isArray(k.meanings) ? k.meanings.some((m) => m.toLowerCase().includes(q)) : k.meaning?.toLowerCase().includes(q))
    );
  }, [kanjiList, search]);

  const filteredGrammar = useMemo(() => {
    if (!search.trim()) return grammarList;
    const q = search.trim().toLowerCase();
    return grammarList.filter((g) =>
      g.grammar.toLowerCase().includes(q) ||
      g.meaning.toLowerCase().includes(q)
    );
  }, [grammarList, search]);

  const filteredVocab = useMemo(() => {
    if (!search.trim()) return vocabList;
    const q = search.trim().toLowerCase();
    return vocabList.filter((v) =>
      (v.kanji && v.kanji.toLowerCase().includes(q)) ||
      (v.reading && v.reading.toLowerCase().includes(q)) ||
      (v.meaning && v.meaning.toLowerCase().includes(q))
    );
  }, [vocabList, search]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-[#1A1A1A]">
      {/* Level Hub Hero Card */}
      <div className="bg-white rounded-3xl border border-[#E8E8E2] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#E8E8E2] pb-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-[#1A1A1A] text-white">
                JLPT {level} Study Hub
              </span>
              <span className="text-xs font-bold text-[#71717A]">
                語彙・漢字・文法 総合学習
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-serif-jp tracking-tight text-[#1A1A1A]">
              JLPT {level} マスターハブ
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed">
              {level} 合格に必要な漢字（{kanjiList.length}字）、文法（{grammarList.length}項目）、重要語彙（{vocabList.length}語）を完全網羅。レッスン・SRS復習・ドリル・模擬試験を統合しています。
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onStartStudy && onStartStudy({ level })}
              className="px-4 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#D94826] text-white text-xs font-black transition-fast shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <span>⛩️ 本日のSRS復習を開始</span>
              <span>→</span>
            </button>
            <button
              type="button"
              onClick={() => onStartDrill && onStartDrill({ level, type: activeTab })}
              className="px-4 py-2 rounded-xl bg-[#FAFAF7] hover:bg-amber-50 text-[#B45309] border border-amber-200 text-xs font-bold transition-fast cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>🎯 弱点集中ドリル</span>
            </button>
            <button
              type="button"
              onClick={() => onStartMockExam && onStartMockExam({ level })}
              className="px-4 py-2 rounded-xl bg-[#FAFAF7] hover:bg-slate-100 text-[#1A1A1A] border border-[#E8E8E2] text-xs font-bold transition-fast cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>⏱ 模擬試験を受ける</span>
            </button>
          </div>
        </div>

        {/* Level Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#E8E8E2]">
            <span className="text-[10px] text-[#71717A] block">漢字収録数</span>
            <span className="text-base font-black text-[#B45309] font-mono">{kanjiList.length} 字</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#E8E8E2]">
            <span className="text-[10px] text-[#71717A] block">文法項目数</span>
            <span className="text-base font-black text-[#15803D] font-mono">{grammarList.length} 項目</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#E8E8E2]">
            <span className="text-[10px] text-[#71717A] block">語彙総数</span>
            <span className="text-base font-black text-[#1E40AF] font-mono">{vocabList.length} 語</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#E8E8E2]">
            <span className="text-[10px] text-[#71717A] block">総合定着度</span>
            <span className="text-base font-black text-[#D94826] font-mono">{stats.masteryPercent}%</span>
          </div>
        </div>
      </div>

      {/* Content Navigation & Search */}
      <div className="bg-white rounded-2xl border border-[#E8E8E2] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'kanji', label: `漢字 (${kanjiList.length})`, color: 'text-[#B45309]' },
            { id: 'vocab', label: `語彙 (${vocabList.length})`, color: 'text-[#1E40AF]' },
            { id: 'grammar', label: `文法 (${grammarList.length})`, color: 'text-[#15803D]' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setSearch('');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-fast cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'bg-[#FAFAF7] text-[#71717A] hover:bg-[#E8E8E2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${activeTab === 'kanji' ? '漢字や意味' : activeTab === 'vocab' ? '単語や読み' : '文法パターン'}を検索...`}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border border-[#E8E8E2] bg-[#FAFAF7] text-[#1A1A1A] outline-hidden focus:bg-white focus:border-[#1A1A1A] transition-fast"
          />
          <span className="absolute left-2.5 top-2 text-[#71717A] text-xs">🔍</span>
        </div>
      </div>

      {/* Pillar Tab 1: KANJI GRID */}
      {activeTab === 'kanji' && (
        <div className="bg-white rounded-3xl border border-[#E8E8E2] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E8E2] pb-3 text-xs text-[#71717A]">
            <span className="font-bold">漢字一覧 ({filteredKanji.length} 字)</span>
            <span className="text-[11px]">タップすると筆順レッスンと書取練習が開きます</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {filteredKanji.map((k) => (
              <button
                key={`${k.kanji}-${k.unicode}`}
                type="button"
                onClick={() => setSelectedKanjiLesson(k)}
                className="p-3 rounded-2xl bg-[#FAFAF7] border border-[#E8E8E2] hover:border-[#B45309] hover:bg-amber-50/30 transition-fast flex flex-col items-center justify-between text-center group cursor-pointer relative"
              >
                <span className="absolute top-1.5 right-1.5 text-[9px] font-mono text-[#71717A] bg-white px-1 rounded border border-[#E8E8E2]">
                  {k.stroke_count}画
                </span>

                <span className="text-3xl font-black font-serif-jp text-[#1A1A1A] group-hover:text-[#B45309] transition-colors my-1">
                  {k.kanji}
                </span>

                <span className="text-[10px] font-bold text-[#71717A] truncate w-full">
                  {Array.isArray(k.meanings) ? k.meanings[0] : k.meaning}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pillar Tab 2: VOCABULARY LIST */}
      {activeTab === 'vocab' && (
        <div className="bg-white rounded-3xl border border-[#E8E8E2] p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#E8E8E2] pb-3 text-xs text-[#71717A]">
            <span className="font-bold">語彙一覧 ({filteredVocab.length} 語)</span>
            <span className="text-[11px]">タップで発音・頭高/平板アクセントを確認</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredVocab.map((v, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#E8E8E2] flex flex-col justify-between gap-2 hover:border-[#1E40AF]/40 transition-fast"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-black font-serif-jp text-[#1A1A1A]">
                      {v.kanji || v.reading}
                    </h4>
                    {v.reading && v.reading !== v.kanji && (
                      <p className="text-xs text-[#71717A] font-serif-jp">{v.reading}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => speak(v.kanji || v.reading)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#1A1A1A]"
                  >
                    🔊
                  </button>
                </div>

                <p className="text-xs text-[#71717A] font-medium line-clamp-1">{v.meaning}</p>

                {v.reading && (
                  <div className="pt-1 border-t border-[#E8E8E2]/60">
                    <PitchAccentDisplay
                      word={v.kanji || v.reading}
                      reading={v.reading}
                      compact={true}
                      showAudio={false}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pillar Tab 3: GRAMMAR LIST */}
      {activeTab === 'grammar' && (
        <div className="bg-white rounded-3xl border border-[#E8E8E2] p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#E8E8E2] pb-3 text-xs text-[#71717A]">
            <span className="font-bold">文法項目一覧 ({filteredGrammar.length} 項目)</span>
            <span className="text-[11px]">タップで接続・ニュアンス解説・例文レッスンが開きます</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredGrammar.map((g, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedGrammarLesson(g)}
                className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#E8E8E2] hover:border-[#15803D] hover:bg-emerald-50/20 transition-fast cursor-pointer flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-start justify-between">
                  <h4 className="text-base font-black font-serif-jp text-[#1A1A1A]">
                    {g.grammar}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-[#15803D]">
                    {g.category || '文法'}
                  </span>
                </div>

                <p className="text-xs text-[#71717A] line-clamp-2">
                  {g.meaning}
                </p>

                {g.formation && (
                  <p className="text-[11px] font-mono text-[#15803D] bg-white px-2 py-1 rounded-lg border border-[#E8E8E2] truncate">
                    {g.formation}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-[#E8E8E2]/60 text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(g.grammar);
                    }}
                    className="text-slate-400 hover:text-[#1A1A1A] font-bold"
                  >
                    🔊 音声
                  </button>
                  <span className="text-[#15803D] font-bold">
                    レッスンを見る →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grammar Lesson Modal */}
      {selectedGrammarLesson && (
        <GrammarLessonModal
          grammarPoint={selectedGrammarLesson}
          onClose={() => setSelectedGrammarLesson(null)}
          onStartDrill={(item) => onStartDrill && onStartDrill({ level, type: 'grammar', item })}
        />
      )}

      {/* Kanji Lesson Modal */}
      {selectedKanjiLesson && (
        <KanjiLessonModal
          kanjiItem={selectedKanjiLesson}
          level={level}
          onClose={() => setSelectedKanjiLesson(null)}
          onStartDrill={(item) => onStartDrill && onStartDrill({ level, type: 'kanji', item })}
          onViewGraph={onViewGraph}
        />
      )}
    </div>
  );
}

