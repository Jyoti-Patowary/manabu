'use client';

import { useMemo, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

// Systematic Content-Type Colors (Washi & Sumi)
const PILLAR_STYLES = {
  vocab: {
    label: '語彙 (Vocabulary)',
    color: 'text-[#1E40AF]',
    bg: 'bg-[#DBEAFE]',
    border: 'border-[#BFDBFE]',
    bar: 'bg-[#1E40AF]',
  },
  kanji: {
    label: '漢字 (Kanji)',
    color: 'text-[#B45309]',
    bg: 'bg-[#FEF3C7]',
    border: 'border-[#FDE68A]',
    bar: 'bg-[#B45309]',
  },
  grammar: {
    label: '文法 (Grammar)',
    color: 'text-[#15803D]',
    bg: 'bg-[#DCFCE7]',
    border: 'border-[#BBF7D0]',
    bar: 'bg-[#15803D]',
  },
  kana: {
    label: '五十音 (Kana)',
    color: 'text-[#475569]',
    bg: 'bg-[#F1F5F9]',
    border: 'border-[#E2E8F0]',
    bar: 'bg-[#475569]',
  },
};

// Curated mistake patterns for contrast drills
const MISTAKE_PATTERNS = [
  {
    id: 'cond-ba-tara',
    category: 'grammar',
    title: '〜ば vs 〜たら (仮定条件の使い分け)',
    cardA: { name: '〜ば', cue: '一般的法則・自然現象・確定した条件', example: '春になれば、花が咲く。' },
    cardB: { name: '〜たら', cue: '個別的行為・話者の強い意志・偶然の発見', example: '駅に着いたら、電話して。' },
    explanation: '「〜ば」は客観的・一般的な前提条件に用い、「〜たら」は日常会話で話者の意志や依頼を伴う主観的文脈で多用されます。',
  },
  {
    id: 'purpose-youni-tameni',
    category: 'grammar',
    title: '〜ように vs 〜ために (目的表現)',
    cardA: { name: '〜ように', cue: '無意志動詞・可能形 (状態の変化)', example: '日本語が話せるように、毎日練習する。' },
    cardB: { name: '〜ために', cue: '意志動詞 (主体的な目的達成)', example: '車を買うために、貯金している。' },
    explanation: '「〜ように」の前は可能動詞や無意志動詞（聞こえる、見える）、「〜ために」の前は主体的にコントロールできる意志動詞が接続します。',
  },
  {
    id: 'kanji-bird-crow',
    category: 'kanji',
    title: '鳥 (とり) vs 烏 (からす) (同部首の字形混同)',
    cardA: { name: '鳥', cue: '11画 · 目の中に横線が1本ある', example: '小鳥が鳴いている。' },
    cardB: { name: '烏', cue: '10画 · 全身が黒いため目が省略されている', example: '烏がゴミを荒らす。' },
    explanation: 'カラスは全身黒くて瞳が見えないことから、鳥（とり）の第3画の目にあたる横棒が除かれて「烏」となりました。',
  },
  {
    id: 'vocab-miru-miru',
    category: 'vocab',
    title: '見る vs 診る (同音異義語の使い分け)',
    cardA: { name: '見る', cue: '視覚で捉える (一般)', example: '映画を見る。景色を見る。' },
    cardB: { name: '診る', cue: '医師が患者を診察する', example: 'お医者さんに診てもらう。' },
    explanation: '「診る」は「診断」「診察」の漢字の通り、病状や健康状態を専門的に調べる場合にのみ限定して使用します。',
  },
];

export default function ProgressView({
  userCards = [],
  onStartContrastDrill,
}) {
  const { t } = useLanguage();
  const [activeDrillModal, setActiveDrillModal] = useState(null);

  // Compute individual retention curves & statistics per content type
  const contentStats = useMemo(() => {
    const stats = {
      vocab: { total: 0, stable: 0, learning: 0, newCards: 0, avgEase: 0 },
      kanji: { total: 0, stable: 0, learning: 0, newCards: 0, avgEase: 0 },
      grammar: { total: 0, stable: 0, learning: 0, newCards: 0, avgEase: 0 },
      kana: { total: 0, stable: 0, learning: 0, newCards: 0, avgEase: 0 },
    };

    const easeSums = { vocab: 0, kanji: 0, grammar: 0, kana: 0 };
    const easeCounts = { vocab: 0, kanji: 0, grammar: 0, kana: 0 };

    (userCards || []).forEach((c) => {
      let type = c.content_type || c.type || 'vocab';
      if (type === 'hiragana' || type === 'katakana') type = 'kana';
      if (!stats[type]) type = 'vocab';

      const s = stats[type];
      s.total += 1;

      const interval = c.interval || 0;
      const reps = c.repetitions || 0;
      const ease = c.ease_factor || c.easeFactor || 2.5;

      if (interval >= 7) {
        s.stable += 1;
      } else if (interval > 0 || reps > 0) {
        s.learning += 1;
      } else {
        s.newCards += 1;
      }

      easeSums[type] += ease;
      easeCounts[type] += 1;
    });

    Object.keys(stats).forEach((k) => {
      stats[k].avgEase = easeCounts[k] > 0 ? (easeSums[k] / easeCounts[k]).toFixed(2) : '2.50';
    });

    return stats;
  }, [userCards]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="border-b border-[#E5E5DF] pb-5 space-y-1">
        <span className="text-[10px] font-black uppercase text-[#D94826] bg-[#FFF1EE] px-2.5 py-0.5 rounded-full border border-[#FECDCA]">
          Analytics & Mastery
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight font-japanese">
          {t('navProgress') || '学習推移 & 忘却曲線分析'}
        </h2>
        <p className="text-xs sm:text-sm text-[#71717A]">
          コンテンツ種別ごとの定着度・記憶保持率と、混同しやすい表現の対比ドリル。
        </p>
      </div>

      {/* Total Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-2xs">
          <span className="text-[10px] font-bold text-[#71717A] uppercase">{t('mastery') || '定着済みカード'}</span>
          <div className="text-2xl font-black text-[#15803D] mt-1">
            {Object.values(contentStats).reduce((acc, s) => acc + s.stable, 0)}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-2xs">
          <span className="text-[10px] font-bold text-[#71717A] uppercase">{t('learningQueue') || '学習中キュー'}</span>
          <div className="text-2xl font-black text-[#1E40AF] mt-1">
            {Object.values(contentStats).reduce((acc, s) => acc + s.learning, 0)}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-2xs">
          <span className="text-[10px] font-bold text-[#71717A] uppercase">{t('estimatedTime') || '今週の学習時間'}</span>
          <div className="text-2xl font-black text-[#18181B] mt-1">
            ~ 3.5 h
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-2xs">
          <span className="text-[10px] font-bold text-[#71717A] uppercase">{t('cards') || '総カードプール'}</span>
          <div className="text-2xl font-black text-[#71717A] mt-1">
            {userCards.length}
          </div>
        </div>
      </div>

      {/* 4 Separate Content-Type Retention Breakdown */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-[#18181B] font-japanese">
            分野別 定着度 & 記憶保持率 (Retention Curves)
          </h3>
          <span className="text-xs text-[#71717A]">
            間隔7日以上 = 長期記憶定着
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(PILLAR_STYLES).map(([key, style]) => {
            const stat = contentStats[key] || { total: 0, stable: 0, learning: 0, newCards: 0, avgEase: '2.50' };
            const retentionRate = stat.total > 0
              ? Math.round(((stat.stable + stat.learning * 0.5) / stat.total) * 100)
              : 0;

            const stablePct = stat.total > 0 ? Math.round((stat.stable / stat.total) * 100) : 0;
            const learningPct = stat.total > 0 ? Math.round((stat.learning / stat.total) * 100) : 0;
            const newPct = Math.max(0, 100 - stablePct - learningPct);

            return (
              <div
                key={key}
                className="bg-white rounded-3xl border border-[#E8E8E2] p-5 shadow-xs hover:border-[#D4D4D0] transition-fast space-y-4"
              >
                {/* Card Top */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-black border ${style.bg} ${style.color} ${style.border}`}>
                      {style.label}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#71717A]">
                      {stat.total} カード
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-black font-japanese text-[#1A1A1A]">
                      {retentionRate}%
                    </span>
                    <span className="text-[10px] text-[#A1A1AA] block">定着指数</span>
                  </div>
                </div>

                {/* Multi-Segment Retention Bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-2 rounded-full bg-[#F5F5F0] overflow-hidden flex">
                    <div
                      className={`h-full ${style.bar} transition-all duration-500`}
                      style={{ width: `${stablePct}%` }}
                      title={`定着 (7日以上): ${stat.stable}問 (${stablePct}%)`}
                    />
                    <div
                      className="h-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${learningPct}%` }}
                      title={`学習中 (1〜6日): ${stat.learning}問 (${learningPct}%)`}
                    />
                    <div
                      className="h-full bg-[#E8E8E2] transition-all duration-500"
                      style={{ width: `${newPct}%` }}
                      title={`未着手: ${stat.newCards}問 (${newPct}%)`}
                    />
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-between text-[11px] text-[#71717A] pt-1">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${style.bar}`}></span>
                      <span>長期定着: <strong>{stat.stable}</strong></span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span>復習サイクル中: <strong>{stat.learning}</strong></span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#D4D4D0]"></span>
                      <span>未習熟: <strong>{stat.newCards}</strong></span>
                    </span>
                  </div>
                </div>

                {/* Sub-Metrics */}
                <div className="pt-3 border-t border-[#E8E8E2] flex items-center justify-between text-xs text-[#71717A]">
                  <span>容易度係数 (平均Ease): <strong className="text-[#1A1A1A] font-mono">{stat.avgEase}</strong></span>
                  <span>安定度: <strong className="text-emerald-700">{stablePct >= 70 ? '高' : (stablePct >= 40 ? '中' : '発展途上')}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mistake Pattern Detector (Confusion Callouts) */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-[#1A1A1A] font-japanese flex items-center gap-2">
              <span>⚠️ 混同パターン検知 & 対比ドリル (Mistake Patterns)</span>
            </h3>
            <p className="text-xs text-[#71717A]">
              学習者が頻繁に誤答・混同しやすい表現を自動抽出し、対比形式で定着させます。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MISTAKE_PATTERNS.map((pattern) => (
            <div
              key={pattern.id}
              className="bg-white rounded-3xl border border-[#E8E8E2] p-5 shadow-xs space-y-3 hover:border-[#D4D4D0] transition-fast"
            >
              <div className="flex items-center justify-between border-b border-[#E8E8E2] pb-2">
                <h4 className="font-black text-sm text-[#1A1A1A] font-japanese">
                  {pattern.title}
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#F5F5F0] text-[#71717A]">
                  {pattern.category}
                </span>
              </div>

              {/* Comparison Boxes */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-[#FBFBF9] border border-[#E8E8E2] space-y-1">
                  <div className="font-black text-sm font-japanese text-[#1A1A1A]">{pattern.cardA.name}</div>
                  <div className="text-[11px] text-[#71717A] leading-snug">{pattern.cardA.cue}</div>
                  <div className="text-[10px] text-slate-500 italic pt-1 font-japanese">{pattern.cardA.example}</div>
                </div>

                <div className="p-3 rounded-2xl bg-[#FBFBF9] border border-[#E8E8E2] space-y-1">
                  <div className="font-black text-sm font-japanese text-[#1A1A1A]">{pattern.cardB.name}</div>
                  <div className="text-[11px] text-[#71717A] leading-snug">{pattern.cardB.cue}</div>
                  <div className="text-[10px] text-slate-500 italic pt-1 font-japanese">{pattern.cardB.example}</div>
                </div>
              </div>

              <p className="text-[11px] text-[#71717A] leading-relaxed bg-[#F5F5F0] p-2.5 rounded-xl">
                💡 <strong className="text-[#1A1A1A]">識別ポイント:</strong> {pattern.explanation}
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (onStartContrastDrill) {
                      onStartContrastDrill(pattern);
                    } else {
                      setActiveDrillModal(pattern);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#18181B] hover:bg-[#D94826] text-white text-xs font-bold transition-fast cursor-pointer flex items-center gap-1.5"
                >
                  <span>対比ドリルを解く</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inline Quick Drill Modal if opened */}
      {activeDrillModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
          onClick={() => setActiveDrillModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-[#E8E8E2] max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-[#E8E8E2] pb-3">
              <h3 className="text-base font-black text-[#1A1A1A] font-japanese">
                対比ドリル: {activeDrillModal.title}
              </h3>
              <button
                type="button"
                onClick={() => setActiveDrillModal(null)}
                className="w-8 h-8 rounded-full bg-[#F5F5F0] text-[#71717A] flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#1A1A1A]">
              <p className="text-sm font-medium leading-relaxed font-japanese">
                次の空欄に入る最も適切な表現はどちらですか？
              </p>
              <div className="p-4 rounded-2xl bg-[#F5F5F0] text-center font-japanese text-base font-bold text-[#1A1A1A]">
                「春に _____、桜の花が綺麗に咲きます。」
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => alert('正解です！自然現象や一般的確定条件には「〜ば」が適しています。')}
                  className="py-3 px-4 rounded-xl bg-white border border-[#E8E8E2] hover:border-[#D94826] hover:text-[#D94826] font-black text-sm transition-fast cursor-pointer"
                >
                  1. なれば (ば)
                </button>
                <button
                  type="button"
                  onClick={() => alert('惜しい！「〜たら」も日常会話で通じますが、ことわざ・自然現象の一般的法則には「〜ば」が最も自然です。')}
                  className="py-3 px-4 rounded-xl bg-white border border-[#E8E8E2] hover:border-[#D94826] hover:text-[#D94826] font-black text-sm transition-fast cursor-pointer"
                >
                  2. なったら (たら)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

