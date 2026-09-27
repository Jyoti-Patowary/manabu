'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '../LanguageSwitcher';

export default function LandingPageView({
  onStartFree,
  onLogin,
  onSelectLevel,
  onViewAttribution,
}) {
  const { t } = useLanguage();
  // Animated mini flashcard demo state
  const [flipped, setFlipped] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);

  const demoCards = [
    {
      type: 'Kanji',
      badge: '字 · N5',
      accent: 'text-[#B45309] bg-[#FEF3C7] border-[#FDE68A]',
      front: '食',
      reading: 'ショク · た(べる)',
      meaning: 'Eat, food (9 strokes)',
      sub: '音: ショク, ク訓: た.べる, く.らう',
      interval: '7d',
    },
    {
      type: 'Vocab',
      badge: '語 · N3',
      accent: 'text-[#1E40AF] bg-[#DBEAFE] border-[#BFDBFE]',
      front: '約束',
      reading: 'やくそく [2] (Nakadaka)',
      meaning: 'Promise, appointment',
      sub: '友達と約束がある。(I have an appointment with a friend.)',
      interval: '14d',
    },
    {
      type: 'Grammar',
      badge: '文 · N3',
      accent: 'text-[#15803D] bg-[#DCFCE7] border-[#BBF7D0]',
      front: '〜てしまう',
      reading: 'te shimau',
      meaning: 'Completely do; regretful action',
      sub: 'ケーキを全部食べてしまった。(I ended up eating all the cake.)',
      interval: '21d',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setFlipped((prev) => !prev);
      if (flipped) {
        setDemoIndex((prev) => (prev + 1) % demoCards.length);
      }
    }, 2800);
    return () => clearInterval(timer);
  }, [flipped, demoCards.length]);

  const activeCard = demoCards[demoIndex];

  const levels = [
    {
      id: 'N5',
      title: 'JLPT N5',
      label: 'Beginner (初級)',
      vocab: '800',
      kanji: '103',
      grammar: '80',
      color: 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-300',
    },
    {
      id: 'N4',
      title: 'JLPT N4',
      label: 'Elementary (初中級)',
      vocab: '1,500',
      kanji: '181',
      grammar: '110',
      color: 'border-sky-200 bg-sky-50/50 hover:border-sky-300',
    },
    {
      id: 'N3',
      title: 'JLPT N3',
      label: 'Intermediate (中級)',
      vocab: '3,750',
      kanji: '361',
      grammar: '140',
      color: 'border-amber-200 bg-amber-50/50 hover:border-amber-300',
    },
    {
      id: 'N2',
      title: 'JLPT N2',
      label: 'Upper (上中級)',
      vocab: '6,000',
      kanji: '415',
      grammar: '170',
      color: 'border-violet-200 bg-violet-50/50 hover:border-violet-300',
    },
    {
      id: 'N1',
      title: 'JLPT N1',
      label: 'Advanced (上級)',
      vocab: '10,000',
      kanji: '1,136',
      grammar: '190',
      color: 'border-rose-200 bg-rose-50/50 hover:border-rose-300',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#18181B] flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-[#E5E5DF] bg-[#FFFFFF]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#18181B] text-white flex items-center justify-center font-black text-lg shadow-xs">
              学
            </div>
            <div>
              <span className="font-black text-lg tracking-tight">学ぶ MANABU</span>
              <span className="text-[10px] text-[#71717A] ml-2 hidden sm:inline">JLPT Spaced Repetition</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={onLogin}
              className="text-xs font-bold text-[#71717A] hover:text-[#18181B] px-3 py-2 rounded-lg transition-fast cursor-pointer"
            >
              {t('login') || 'ログイン'}
            </button>
            <button
              onClick={onStartFree}
              className="text-xs font-bold bg-[#D94826] text-white px-4 py-2 rounded-xl hover:bg-[#BF3B1C] transition-fast shadow-xs cursor-pointer"
            >
              {t('startLearningFree') || '無料で始める'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Headline & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E5E5DF] bg-[#FFFFFF] text-xs font-bold text-[#71717A]">
              <span className="w-2 h-2 rounded-full bg-[#D94826]"></span>
              <span>{t('brandSub') || 'SM-2 統合間隔反復エンジン · N5からN1完全対応'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15] text-[#18181B]">
              {t('landingHeroHeadline') || '日本語を本気で身につける、無駄のない反復学習。'}
            </h1>

            <p className="text-base sm:text-lg text-[#71717A] max-w-xl leading-relaxed">
              {t('landingHeroSub') || '漢字・語彙・文法・読解がひとつのSRSキューで結びつく。科学的に証明されたSM-2アルゴリズムで、忘れかけた絶妙なタイミングに復習を届けます。'}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onStartFree}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#D94826] text-white font-bold text-sm hover:bg-[#BF3B1C] transition-fast shadow-sm cursor-pointer"
              >
                <span>{t('startLearningFree') || '今すぐ無料で始める'}</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={onLogin}
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-[#E5E5DF] bg-[#FFFFFF] text-[#18181B] font-bold text-sm hover:bg-[#F4F4F0] transition-fast cursor-pointer"
              >
                {t('loginExisting') || '既存アカウントでログイン'}
              </button>
            </div>

            <div className="flex items-center gap-6 pt-2 text-xs text-[#71717A]">
              <div className="flex items-center gap-1.5">
                <span className="text-[#15803D]">✓</span>
                <span>{t('noHiddenFees') || '登録料・隠し料金なし'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#15803D]">✓</span>
                <span>{t('nativeTtsPitch') || '音声TTS & ピッチアクセント'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#15803D]">✓</span>
                <span>{t('mockExamsIncluded') || 'JLPT模試機能付き'}</span>
              </div>
            </div>
          </div>

          {/* Right: Live Mini Flashcard Demo */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm">
              <div className="text-center mb-2">
                <span className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider">
                  Live Product Preview · SM-2 Deck
                </span>
              </div>

              {/* Animated Card Surface */}
              <div
                className="w-full min-h-[320px] rounded-3xl border border-[#E5E5DF] bg-white p-6 shadow-sm flex flex-col justify-between transition-all duration-300 relative overflow-hidden"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${activeCard.accent}`}>
                    {activeCard.badge}
                  </span>
                  <span className="text-xs font-mono text-[#A1A1AA]">
                    SRS間隔: {activeCard.interval}
                  </span>
                </div>

                {/* Card Center Content */}
                <div className="my-auto text-center py-4">
                  <div className="text-5xl font-black text-[#18181B] mb-2 font-japanese">
                    {activeCard.front}
                  </div>
                  <div className="text-sm font-semibold text-[#71717A]">
                    {activeCard.reading}
                  </div>

                  {flipped && (
                    <div className="mt-4 pt-3 border-t border-[#E5E5DF] space-y-1">
                      <div className="text-sm font-bold text-[#18181B]">{activeCard.meaning}</div>
                      <div className="text-xs text-[#71717A] leading-relaxed">{activeCard.sub}</div>
                    </div>
                  )}
                </div>

                {/* Card Bottom Mock Control */}
                <div className="pt-3 border-t border-[#F4F4F0] flex items-center justify-between text-[11px]">
                  <span className="text-[#A1A1AA]">
                    {flipped ? '次回复習: 14日後' : 'タップで答えを表示'}
                  </span>
                  <div className="flex gap-1">
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 font-bold">難 (Again)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-bold">良 (Good)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: How It Works (3 Steps) */}
      <section className="border-t border-[#E5E5DF] bg-[#FFFFFF] py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#18181B]">
              {t('howItWorks') || '3ステップで確実に定着'}
            </h2>
            <p className="text-sm text-[#71717A] mt-2">
              {t('howItWorksSub') || '詰め込みではなく、忘却曲線を計算した毎日の自然な習慣へ。'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-[#E5E5DF] bg-[#FBFBF9] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#B45309] font-black flex items-center justify-center text-sm border border-[#FDE68A]">
                1
              </div>
              <h3 className="font-bold text-base text-[#18181B]">{t('step1Title') || '1. 学ぶ (Learn)'}</h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                {t('step1Desc') || '漢字の筆順、単語のピッチアクセント、文法の接続ルールを構造的にインプット。'}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#E5E5DF] bg-[#FBFBF9] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#DBEAFE] text-[#1E40AF] font-black flex items-center justify-center text-sm border border-[#BFDBFE]">
                2
              </div>
              <h3 className="font-bold text-base text-[#18181B]">{t('step2Title') || '2. 復習する (Review)'}</h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                {t('step2Desc') || 'SM-2エンジンが最適なインターバルを算出。忘れる寸前のベストタイミングで自動出題。'}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#E5E5DF] bg-[#FBFBF9] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803D] font-black flex items-center justify-center text-sm border border-[#BBF7D0]">
                3
              </div>
              <h3 className="font-bold text-base text-[#18181B]">{t('step3Title') || '3. 追跡する (Track)'}</h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                {t('step3Desc') || '4つの柱別の記憶定着曲線とJLPT合格レディネスで、現在地と合格までの日数を可視化。'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: JLPT Level Overview */}
      <section className="border-t border-[#E5E5DF] py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#18181B]">
                {t('curriculumByLevel') || 'JLPT レベル別カリキュラム'}
              </h2>
              <p className="text-sm text-[#71717A] mt-1">
                {t('curriculumSub') || '基礎のかなから最上級N1まで、体系化されたデータセットを完全収録。'}
              </p>
            </div>
            <button
              onClick={onStartFree}
              className="text-xs font-bold text-[#D94826] hover:underline self-start sm:self-auto cursor-pointer"
            >
              {t('unlockAllLevels') || '全レベルを開放する →'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {levels.map((lvl) => (
              <button
                key={lvl.id}
                onClick={onStartFree}
                className={`p-5 rounded-2xl border ${lvl.color} text-left transition-fast hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between`}
              >
                <div>
                  <div className="text-xs font-extrabold text-[#71717A]">{lvl.title}</div>
                  <div className="font-bold text-sm text-[#18181B] mt-0.5">{lvl.label}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-black/5 text-xs text-[#71717A] space-y-1">
                  <div>{t('vocab') || '単語'}: <span className="font-bold text-[#18181B]">{lvl.vocab}</span></div>
                  <div>{t('kanji') || '漢字'}: <span className="font-bold text-[#18181B]">{lvl.kanji}</span></div>
                  <div>{t('grammar') || '文法'}: <span className="font-bold text-[#18181B]">{lvl.grammar}</span></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Core Differentiators (Manabu's Real Edge) */}
      <section className="border-t border-[#E5E5DF] bg-[#FFFFFF] py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#18181B]">
              {t('whyChooseManabu') || 'Manabuが選ばれる理由'}
            </h2>
            <p className="text-sm text-[#71717A] mt-2">
              {t('howItWorksSub') || '単なるフラッシュカードを超えた、日本語習得のための専用ツール。'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-[#E5E5DF] bg-[#FBFBF9] space-y-2">
              <span className="text-2xl">🕸️</span>
              <h3 className="font-bold text-base text-[#18181B]">{t('graphDifferentiatorTitle') || '関係図 (Relationship Graph)'}</h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                {t('graphDifferentiatorDesc') || '漢字をタップすると使用単語が表示され、単語から文法へドリルダウン。孤立した暗記ではなく、知識を有機的につなげて覚えます。'}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#E5E5DF] bg-[#FBFBF9] space-y-2">
              <span className="text-2xl">📈</span>
              <h3 className="font-bold text-base text-[#18181B]">{t('pitchDifferentiatorTitle') || 'Kanjium ピッチアクセント'}</h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                {t('pitchDifferentiatorDesc') || '平板・頭高・中高・尾高のピッチアクセント高低曲線を視覚化。自然で美しい発音を最初から身につけられます。'}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#E5E5DF] bg-[#FBFBF9] space-y-2">
              <span className="text-2xl">📖</span>
              <h3 className="font-bold text-base text-[#18181B]">{t('readerDifferentiatorTitle') || '多読リーダー & レディネス'}</h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                {t('readerDifferentiatorDesc') || 'レベル別の読本で、知っている単語と復習キューに入っている単語を下線表示。タップで即辞書引き＆SRS追加できます。'}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#E5E5DF] bg-[#FBFBF9] space-y-2">
              <span className="text-2xl">🔒</span>
              <h3 className="font-bold text-base text-[#18181B]">{t('unlockDifferentiatorTitle') || '前提知識に応じたアンロック'}</h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                {t('unlockDifferentiatorDesc') || '文法を学ぶために必要な前提語彙がSRSで定着するまで、文法ポイントを無理に解禁せず段階的にアンロックします。'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E5DF] bg-[#FBFBF9] py-8 text-xs text-[#71717A]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © 2026 学ぶ MANABU. Japanese Language Proficiency Platform.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onViewAttribution} className="hover:text-[#18181B] underline cursor-pointer">
              {t('attributionNotice') || 'オープンデータ権利表記 (Attribution)'}
            </button>
            <button onClick={onStartFree} className="hover:text-[#18181B] cursor-pointer">
              {t('privacyPolicy') || 'プライバシー'}
            </button>
            <button onClick={onStartFree} className="hover:text-[#18181B] cursor-pointer">
              {t('termsOfService') || '利用規約'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

