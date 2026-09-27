'use client';

import { useState } from 'react';

export default function AttributionFooter() {
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  return (
    <>
      <footer className="mt-16 border-t border-[#E8E8E2] py-8 text-center text-xs text-[#71717A] space-y-2">
        <div className="flex items-center justify-center gap-4 flex-wrap font-medium">
          <span>© {new Date().getFullYear()} 学ぶ MANABU</span>
          <span>·</span>
          <button
            type="button"
            onClick={() => setShowLicenseModal(true)}
            className="hover:text-[#1A1A1A] underline underline-offset-4 cursor-pointer"
          >
            オープンデータと著作権表示 (Attribution & Licenses)
          </button>
        </div>

        <p className="text-[11px] text-[#A1A1AA] max-w-xl mx-auto leading-relaxed">
          This application uses data from the EDRDG (JMdict, KANJIDIC2) and KanjiVG projects, distributed under Creative Commons Attribution-ShareAlike licenses.
        </p>
      </footer>

      {/* Attribution & License Modal */}
      {showLicenseModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
          onClick={() => setShowLicenseModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-[#E8E8E2] max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-start justify-between border-b border-[#E8E8E2] pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-[#D94826] bg-[#FFF1EE] px-2 py-0.5 rounded border border-[#FECDCA]">
                  Legal Attribution
                </span>
                <h3 className="text-xl font-black text-[#1A1A1A] font-japanese">
                  オープンデータおよびライセンス表示
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowLicenseModal(false)}
                className="w-8 h-8 rounded-full bg-[#F5F5F0] hover:bg-[#E8E8E2] text-[#71717A] flex items-center justify-center text-sm font-bold transition-fast cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#1A1A1A] leading-relaxed">
              {/* JMdict */}
              <div className="p-4 rounded-2xl bg-[#FBFBF9] border border-[#E8E8E2] space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm">JMdict (Japanese-English Dictionary)</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DBEAFE] text-[#1E40AF]">
                    CC BY-SA 3.0 / 4.0
                  </span>
                </div>
                <p className="text-[#71717A]">
                  This site uses the JMdict dictionary file. This file is the property of the Electronic Dictionary Research and Development Group (EDRDG), and is used in conformance with the Group's license.
                </p>
                <a
                  href="https://www.edrdg.org/jmdict/j_jmdict.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1E40AF] font-bold hover:underline inline-block text-[11px]"
                >
                  EDRDG JMdict Project Page →
                </a>
              </div>

              {/* KANJIDIC2 */}
              <div className="p-4 rounded-2xl bg-[#FBFBF9] border border-[#E8E8E2] space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm">KANJIDIC2 (Kanji Database)</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#B45309]">
                    CC BY-SA 3.0 / 4.0
                  </span>
                </div>
                <p className="text-[#71717A]">
                  This site uses the KANJIDIC dictionary file. This file is the property of the Electronic Dictionary Research and Development Group (EDRDG), and is used in conformance with the Group's license.
                </p>
                <a
                  href="https://www.edrdg.org/wiki/index.php/KANJIDIC_Project"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#B45309] font-bold hover:underline inline-block text-[11px]"
                >
                  KANJIDIC Project Page →
                </a>
              </div>

              {/* KanjiVG */}
              <div className="p-4 rounded-2xl bg-[#FBFBF9] border border-[#E8E8E2] space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm">KanjiVG (Stroke Order Vector Data)</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DCFCE7] text-[#15803D]">
                    CC BY-SA 3.0
                  </span>
                </div>
                <p className="text-[#71717A]">
                  Kanji stroke order vector graphics are copyright © 2009-2024 Ulrich Apel and released under the Creative Commons Attribution-Share Alike 3.0 license.
                </p>
                <a
                  href="https://kanjivg.tagaini.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#15803D] font-bold hover:underline inline-block text-[11px]"
                >
                  KanjiVG Official Site →
                </a>
              </div>

              {/* JLPT Word List & Kanjium */}
              <div className="p-4 rounded-2xl bg-[#FBFBF9] border border-[#E8E8E2] space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm">Vocabulary & Pitch Accent Data</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F1F5F9] text-[#475569]">
                    MIT / Open Source
                  </span>
                </div>
                <p className="text-[#71717A]">
                  JLPT vocabulary classification and Tokyo pitch accent patterns are adapted from elzup/jlpt-word-list (MIT) and the Kanjium open pitch dictionary by mifunetoshiro.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E8E8E2] flex justify-end">
              <button
                type="button"
                onClick={() => setShowLicenseModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-bold transition-fast cursor-pointer"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

