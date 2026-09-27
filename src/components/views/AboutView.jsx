'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function AboutView({ onBack }) {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-8 animate-fadeIn pb-24 text-[#18181B]">
      {/* Header */}
      <div className="border-b border-[#E5E5DF] pb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase text-[#D94826] bg-[#FFF1EE] px-2.5 py-0.5 rounded-full border border-[#FECDCA]">
            Origin & Legal Attribution
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight mt-1 font-japanese">
            {t('aboutTitle') || '学ぶについて & 権利表記'}
          </h1>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="text-xs font-bold text-[#71717A] hover:text-[#18181B] px-3 py-1.5 rounded-xl border border-[#E5E5DF] hover:bg-[#F4F4F0] cursor-pointer"
          >
            ← {t('back') || '戻る'}
          </button>
        )}
      </div>

      {/* "Why I Built This" Section */}
      <div className="rounded-3xl border border-[#E5E5DF] bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-black text-[#18181B] font-japanese">
          {t('whyIBuiltThis') || '開発の背景 (Why I Built This)'}
        </h2>
        <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed">
          接客業（Hospitality）の現場からプログラミングの世界へ進み、日本語能力試験（JLPT）の学習を続ける中で、既存の単語帳やフラッシュカードアプリに物足りなさを感じていました。
        </p>
        <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed">
          単語を覚えるだけでは文法がわからず、文法を暗記しても漢字の筆順やピッチアクセントがあやふやになる——知識がバラバラに孤立していたのです。そこで、漢字・語彙・文法・読解がすべて有機的にリンクし、科学的なSM-2アルゴリズムで忘却曲線に合わせて復習できる、静かで無駄のない学習プラットフォームとして「学ぶ (MANABU)」を開発しました。
        </p>
      </div>

      {/* Required Open-Source Legal Attribution (CC BY-SA) */}
      <div className="rounded-3xl border border-[#E5E5DF] bg-white p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-black text-[#18181B] font-japanese">
            {t('openDataAttribution') || 'オープンデータ帰属表示 (Attribution & Licenses)'}
          </h2>
          <p className="text-xs text-[#71717A] mt-1">
            本アプリは、オープンライセンスで提供されている優れた言語学データプロジェクトを活用しています。
          </p>
        </div>

        <div className="space-y-4 text-xs text-[#71717A]">
          <div className="p-4 rounded-2xl bg-[#FBFBF9] border border-[#E5E5DF] space-y-1">
            <div className="flex items-center justify-between">
              <strong className="text-[#18181B]">EDRDG (JMdict & KANJIDIC2)</strong>
              <span className="font-mono text-[10px] bg-[#E5E5DF] px-2 py-0.5 rounded">CC BY-SA 3.0</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              日本語辞典データおよび漢字情報は、Electronic Dictionary Research and Development Group の作成した JMdict および KANJIDIC2 に基づいています。
            </p>
            <a
              href="https://www.edrdg.org/"
              target="_blank"
              rel="noreferrer"
              className="text-[#1E40AF] underline text-[11px] inline-block pt-1"
            >
              edrdg.org →
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-[#FBFBF9] border border-[#E5E5DF] space-y-1">
            <div className="flex items-center justify-between">
              <strong className="text-[#18181B]">KanjiVG Project (Ulrich Apel)</strong>
              <span className="font-mono text-[10px] bg-[#E5E5DF] px-2 py-0.5 rounded">CC BY-SA 3.0</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              漢字の筆順ベクターデータおよび画数情報は、Ulrich Apel 氏および KanjiVG プロジェクトの成果物を使用しています。
            </p>
            <a
              href="https://kanjivg.tagaini.net/"
              target="_blank"
              rel="noreferrer"
              className="text-[#1E40AF] underline text-[11px] inline-block pt-1"
            >
              kanjivg.tagaini.net →
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-[#FBFBF9] border border-[#E5E5DF] space-y-1">
            <div className="flex items-center justify-between">
              <strong className="text-[#18181B]">Kanjium Project (Toshiro Mifune)</strong>
              <span className="font-mono text-[10px] bg-[#E5E5DF] px-2 py-0.5 rounded">Open License</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              日本語単語のピッチアクセント高低データは、Kanjium プロジェクトのアクセント辞書を参照しています。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FBFBF9] border border-[#E5E5DF] space-y-1">
            <div className="flex items-center justify-between">
              <strong className="text-[#18181B]">elzup / jlpt-word-list</strong>
              <span className="font-mono text-[10px] bg-[#E5E5DF] px-2 py-0.5 rounded">MIT License</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              JLPT N5〜N1 の語彙選定およびレベル分類テーブルを使用しています。
            </p>
          </div>
        </div>
      </div>

      {/* Contact Link */}
      <div className="text-center text-xs text-[#71717A] pt-4">
        ご意見・不具合のご報告は{' '}
        <a href="mailto:support@manabu.jp" className="text-[#18181B] font-bold underline">
          support@manabu.jp
        </a>{' '}
        までお寄せください。
      </div>
    </div>
  );
}

