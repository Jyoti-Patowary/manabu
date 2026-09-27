'use client';

import { useState, useMemo, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  buildRelationshipGraph,
  searchGraphNodes,
} from '@/lib/relationshipGraph';
import PitchAccentDisplay from './PitchAccentDisplay';

export default function RelationshipGraphView({
  initialQuery = '食',
  userVocabCards = [],
  onStudy,
}) {
  const { t } = useLanguage();
  const [currentQuery, setCurrentQuery] = useState(initialQuery);
  const [searchInput, setSearchInput] = useState('');
  const [viewMode, setViewMode] = useState('web'); // 'web' | 'tree'
  const [selectedNode, setSelectedNode] = useState(null);
  const [history, setHistory] = useState([initialQuery]);

  // Audio synthesis
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

  // Compute graph data
  const graph = useMemo(() => {
    return buildRelationshipGraph(currentQuery, userVocabCards);
  }, [currentQuery, userVocabCards]);

  // Search suggestions
  const searchResults = useMemo(() => {
    if (!searchInput.trim()) return [];
    return searchGraphNodes(searchInput);
  }, [searchInput]);

  const handleSelectRoot = (itemOrLabel) => {
    const label = typeof itemOrLabel === 'string' ? itemOrLabel : itemOrLabel.label;
    setCurrentQuery(label);
    setSearchInput('');
    setSelectedNode(null);
    setHistory((prev) => [...prev.slice(-4), label]);
  };

  const handleStudyNode = (node) => {
    if (!onStudy) return;

    let card;
    if (node.type === 'kanji') {
      card = {
        id: `kanji-${node.label}`,
        kanji: node.label,
        reading: node.readings || '',
        meaning: node.meaning || '',
        content_type: 'kanji',
        type: 'kanji',
        jlpt_level: node.level || 'N5',
        strokes: node.strokes || 0,
      };
    } else if (node.type === 'grammar') {
      card = {
        id: `grammar-${node.label}`,
        grammar: node.label,
        meaning: node.meaning || '',
        formation: node.formation || '',
        content_type: 'grammar',
        type: 'grammar',
        jlpt_level: node.level || 'N5',
        example: node.example || '',
      };
    } else {
      card = {
        id: `vocab-${node.label}`,
        kanji: node.label,
        reading: node.reading || '',
        meaning: node.meaning || '',
        content_type: 'vocab',
        type: 'vocab',
        jlpt_level: node.level || 'N5',
        example: node.example || '',
      };
    }

    onStudy(
      {
        id: `deck-graph-${node.id}`,
        name: `相関学習: ${node.label}`,
        cards: [card],
      },
      'recognition'
    );
  };

  // Pre-calculate circular layout coordinates for Web View
  const webLayout = useMemo(() => {
    const centerX = 360;
    const centerY = 300;
    const vocabRadius = 135;
    const grammarRadius = 240;

    const vNodes = graph.vocabNodes || [];
    const gNodes = graph.grammarNodes || [];

    const vocabCoords = vNodes.map((v, i) => {
      const angle = (2 * Math.PI * i) / Math.max(1, vNodes.length) - Math.PI / 2;
      return {
        ...v,
        x: centerX + vocabRadius * Math.cos(angle),
        y: centerY + vocabRadius * Math.sin(angle),
      };
    });

    const grammarCoords = gNodes.map((g, i) => {
      const angle = (2 * Math.PI * i) / Math.max(1, gNodes.length) - Math.PI / 2 + 0.3;
      return {
        ...g,
        x: centerX + grammarRadius * Math.cos(angle),
        y: centerY + grammarRadius * Math.sin(angle),
      };
    });

    return {
      centerX,
      centerY,
      root: { ...graph.rootNode, x: centerX, y: centerY },
      vocabCoords,
      grammarCoords,
    };
  }, [graph]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider mb-1">
              <span>🕸️</span>
              <span>Kanji → Vocab → Grammar</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
              <span>{t('relationshipGraph') || '漢字・語彙・文法 相互リンクマップ'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              漢字から派生する単語、単語が使われる文法構造をインタラクティブに可視化
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('web')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                viewMode === 'web'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>🕸️</span>
              <span>{t('relationshipGraph') || 'ビジュアル相関図'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('tree')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                viewMode === 'tree'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>📑</span>
              <span>ツリー詳細</span>
            </button>
          </div>
        </div>

        {/* Quick Suggestion Roots & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Quick Root Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              おすすめ起点:
            </span>
            {['食', '行', '見', '飲', '勉', '生', '話', '本', '学', '来'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleSelectRoot(item)}
                className={`w-8 h-8 rounded-xl text-xs font-japanese font-black transition-all shrink-0 border ${
                  currentQuery === item
                    ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[240px]">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="漢字・語彙・文法で探索..."
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30 font-medium"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              🔍
            </span>

            {/* Search Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {searchResults.map((res, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectRoot(res)}
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                          res.type === 'kanji'
                            ? 'bg-violet-100 text-violet-800'
                            : res.type === 'grammar'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {res.type}
                      </span>
                      <span className="font-japanese font-bold text-slate-900">{res.label}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                      {res.meaning}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* History Breadcrumbs */}
        {history.length > 1 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 overflow-x-auto no-scrollbar pt-1">
            <span className="font-bold">履歴:</span>
            {history.map((h, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectRoot(h)}
                className="font-japanese font-bold text-slate-600 hover:text-indigo-600 underline underline-offset-2"
              >
                {h} {i < history.length - 1 && <span className="text-slate-300 mx-1">›</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Graph Content Display */}
      {viewMode === 'web' ? (
        /* -------------------------------------------------------------
           DESKTOP RADIAL SVG GRAPH WEB
        ------------------------------------------------------------- */
        <div className="bg-linear-to-b from-slate-900 via-slate-900 to-indigo-950 rounded-3xl p-4 sm:p-8 shadow-xl overflow-hidden relative border border-slate-800 text-white min-h-[580px] flex items-center justify-center select-none">
          {/* Legend */}
          <div className="absolute top-4 left-4 flex items-center gap-3 text-[11px] bg-slate-950/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400 inline-block"></span> 漢字 (Kanji)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span> 語彙 (Vocab)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block"></span> 文法 (Grammar)
            </span>
          </div>

          <div className="w-full max-w-[720px] overflow-x-auto flex justify-center">
            <svg
              viewBox="0 0 720 600"
              className="w-full max-w-[720px] h-[520px] text-xs font-sans"
            >
              {/* Background Orbits */}
              <circle
                cx={webLayout.centerX}
                cy={webLayout.centerY}
                r="135"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray="4 4"
              />
              <circle
                cx={webLayout.centerX}
                cy={webLayout.centerY}
                r="240"
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeDasharray="6 6"
              />

              {/* Links: Root to Vocab */}
              {webLayout.vocabCoords.map((v, i) => (
                <line
                  key={`link-rv-${i}`}
                  x1={webLayout.root.x}
                  y1={webLayout.root.y}
                  x2={v.x}
                  y2={v.y}
                  stroke="rgba(167, 139, 250, 0.45)"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                />
              ))}

              {/* Links: Vocab to Grammar */}
              {webLayout.grammarCoords.map((g, i) => {
                const nearestVocab = webLayout.vocabCoords[i % webLayout.vocabCoords.length] || webLayout.root;
                return (
                  <path
                    key={`link-vg-${i}`}
                    d={`M ${nearestVocab.x} ${nearestVocab.y} Q ${webLayout.centerX} ${webLayout.centerY} ${g.x} ${g.y}`}
                    fill="none"
                    stroke="rgba(192, 132, 252, 0.35)"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Grammar Nodes (Outer Orbit) */}
              {webLayout.grammarCoords.map((g, i) => {
                const isSelected = selectedNode?.id === g.id;
                return (
                  <g
                    key={`node-g-${i}`}
                    onClick={() => setSelectedNode(g)}
                    className="cursor-pointer transition-all group"
                  >
                    <rect
                      x={g.x - 45}
                      y={g.y - 18}
                      width="90"
                      height="36"
                      rx="12"
                      fill={isSelected ? '#9333ea' : '#3b0764'}
                      stroke={g.isStable ? '#34d399' : '#c084fc'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      className="group-hover:fill-purple-700 transition-colors"
                    />
                    <text
                      x={g.x}
                      y={g.y + 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {g.label.length > 7 ? `${g.label.slice(0, 6)}…` : g.label}
                    </text>
                  </g>
                );
              })}

              {/* Vocab Nodes (Inner Orbit) */}
              {webLayout.vocabCoords.map((v, i) => {
                const isSelected = selectedNode?.id === v.id;
                return (
                  <g
                    key={`node-v-${i}`}
                    onClick={() => setSelectedNode(v)}
                    className="cursor-pointer transition-all group"
                  >
                    <circle
                      cx={v.x}
                      cy={v.y}
                      r="32"
                      fill={isSelected ? '#0284c7' : '#082f49'}
                      stroke={v.isStable ? '#34d399' : '#38bdf8'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      className="group-hover:fill-sky-800 transition-colors"
                    />
                    <text
                      x={v.x}
                      y={v.y - 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="12"
                      fontWeight="900"
                      fontFamily="sans-serif"
                    >
                      {v.label}
                    </text>
                    <text
                      x={v.x}
                      y={v.y + 11}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                    >
                      {v.reading || ''}
                    </text>
                  </g>
                );
              })}

              {/* Root Central Node */}
              <g
                onClick={() => setSelectedNode(webLayout.root)}
                className="cursor-pointer group"
              >
                <circle
                  cx={webLayout.root.x}
                  cy={webLayout.root.y}
                  r="46"
                  fill="#4c1d95"
                  stroke="#a78bfa"
                  strokeWidth="3"
                  className="group-hover:fill-violet-800 transition-colors shadow-2xl"
                />
                <circle
                  cx={webLayout.root.x}
                  cy={webLayout.root.y}
                  r="52"
                  fill="none"
                  stroke="rgba(167, 139, 250, 0.4)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <text
                  x={webLayout.root.x}
                  y={webLayout.root.y + 10}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="28"
                  fontWeight="900"
                  fontFamily="serif"
                >
                  {webLayout.root.label}
                </text>
              </g>
            </svg>
          </div>
        </div>
      ) : (
        /* -------------------------------------------------------------
           MOBILE-FIRST TACTILE 3-TIER COLUMN DRILL-DOWN
        ------------------------------------------------------------- */
        <div className="space-y-6">
          {/* Tier 1: Root Card (Washi & Sumi Aesthetic) */}
          <div className="bg-white text-[#1A1A1A] rounded-3xl p-6 shadow-xs border border-[#E8E8E2] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FAFAF7] border border-[#E8E8E2] flex items-center justify-center text-4xl font-serif-jp font-black text-[#1A1A1A]">
                {graph.rootNode.label}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-50 text-[#B45309] border border-amber-200">
                    {graph.rootNode.type} · {graph.rootNode.level}
                  </span>
                  {graph.rootNode.isStable && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-[#15803D] border border-emerald-200">
                      ✓ 安定 ({graph.rootNode.interval}日)
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-[#1A1A1A]">{graph.rootNode.meaning || 'Core Root Item'}</h3>
                {graph.rootNode.readings && (
                  <p className="text-xs text-[#666660] font-serif-jp">
                    読み: {graph.rootNode.readings}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => speak(graph.rootNode.label)}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1A1A1A] transition-fast text-xs flex items-center gap-1.5 font-bold"
              >
                <span>🔊 発音</span>
              </button>
              <button
                type="button"
                onClick={() => handleStudyNode(graph.rootNode)}
                className="px-4 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#D94826] text-white font-bold text-xs shadow-xs transition-fast"
              >
                学習する
              </button>
            </div>
          </div>

          {/* Tier 2: Connected Vocabulary List */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E40AF] inline-block"></span>
                <span>派生語彙 (Connected Vocabulary) · {graph.vocabNodes?.length || 0}語</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">
                タップしてノードを選択または再構築
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(graph.vocabNodes || []).map((v, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedNode(v)}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 transition-fast cursor-pointer flex flex-col justify-between gap-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-serif-jp font-black text-slate-900 text-base">{v.kanji}</h5>
                      <p className="text-xs text-slate-500 font-serif-jp">{v.reading}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      v.isStable ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {v.isStable ? `✓ ${v.interval}d` : `${v.interval}d`}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1 italic">{v.meaning}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(v.kanji);
                      }}
                      className="text-[#1E40AF] font-bold hover:underline"
                    >
                      🔊 再生
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRoot(v.kanji);
                      }}
                      className="text-slate-500 hover:text-slate-900 font-bold"
                    >
                      この単語を展開 →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tier 3: Connected Grammar List */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#15803D] inline-block"></span>
                <span>応用文法 (Linked Grammar Constructions) · {graph.grammarNodes?.length || 0}項目</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">
                語彙と連動する文法パターン
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(graph.grammarNodes || []).map((g, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedNode(g)}
                  className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100 hover:border-emerald-300 transition-fast cursor-pointer flex flex-col justify-between gap-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-serif-jp font-black text-emerald-950 text-base">{g.grammar}</h5>
                      {g.formation && (
                        <span className="text-[10px] text-[#15803D] font-bold font-serif-jp block mt-0.5">
                          {g.formation}
                        </span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-[#15803D]">
                      {g.level || 'N5'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 line-clamp-1">{g.meaning}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-emerald-100 text-[11px]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(g.grammar);
                      }}
                      className="text-[#15803D] font-bold hover:underline"
                    >
                      🔊 発音
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRoot(g.grammar);
                      }}
                      className="text-emerald-900 font-bold hover:underline"
                    >
                      この文法を展開 →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Node Inspector Drawer / Bottom Sheet */}
      {selectedNode && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in"
          onClick={() => setSelectedNode(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-black uppercase ${
                      selectedNode.type === 'kanji'
                        ? 'bg-violet-100 text-violet-800'
                        : selectedNode.type === 'grammar'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {selectedNode.type} · {selectedNode.level || 'N5'}
                  </span>
                  {selectedNode.isStable && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      ✓ 習得済み ({selectedNode.interval}日)
                    </span>
                  )}
                </div>
                <h3 className="text-3xl font-black font-japanese text-slate-900">
                  {selectedNode.label}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  {t('meaningTitle') || '意味 (Meaning)'}
                </span>
                <p className="font-bold text-slate-900 text-base">{selectedNode.meaning}</p>
              </div>

              {selectedNode.reading && (
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    {t('reading') || '読み (Reading)'}
                  </span>
                  <p className="font-bold font-japanese text-slate-800">{selectedNode.reading}</p>
                </div>
              )}

              {/* Pitch Accent Display for Vocabulary Nodes */}
              {selectedNode.type === 'vocab' && (selectedNode.reading || selectedNode.label) && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    {t('pitchAccent') || 'アクセント (Pitch Accent)'}
                  </span>
                  <PitchAccentDisplay
                    word={selectedNode.label}
                    reading={selectedNode.reading || selectedNode.label}
                    showAudio={false}
                    compact={true}
                  />
                </div>
              )}

              {selectedNode.formation && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block mb-1">
                    {t('formationRule') || '接続 (Formation)'}
                  </span>
                  <p className="font-japanese font-bold text-purple-950">{selectedNode.formation}</p>
                </div>
              )}

              {selectedNode.example && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    {t('exampleSentence') || '例文 (Example)'}
                  </span>
                  <p className="font-japanese font-bold text-slate-900">{selectedNode.example}</p>
                  {selectedNode.exampleMeaning && (
                    <p className="text-xs text-slate-500 italic">"{selectedNode.exampleMeaning}"</p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => speak(selectedNode.label)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <span>🔊</span>
                <span>{t('pronounce') || '発音'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectRoot(selectedNode.label)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all"
                >
                  {t('recenterGraph') || 'このノードを中心に再構築'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleStudyNode(selectedNode);
                    setSelectedNode(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm transition-all"
                >
                  {t('studyNow') || 'SRS学習'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

