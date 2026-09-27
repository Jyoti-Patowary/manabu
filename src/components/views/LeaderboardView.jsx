'use client';

import { useState } from 'react';
import { getWeeklyLeaderboard, getLocalAccount, toggleLeaderboardOptIn } from '@/lib/accountEngine';
import { useLanguage } from '@/context/LanguageContext';

export default function LeaderboardView() {
  const { t } = useLanguage();
  const [account, setAccount] = useState(() => getLocalAccount());
  const [leaderboardData, setLeaderboardData] = useState(() =>
    getWeeklyLeaderboard(account.xp, account.isLeaderboardOptIn)
  );

  const handleToggleOptIn = () => {
    const updated = toggleLeaderboardOptIn();
    setAccount(updated);
    setLeaderboardData(getWeeklyLeaderboard(updated.xp, updated.isLeaderboardOptIn));
  };

  const peers = leaderboardData?.peers || [];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6 animate-fadeIn pb-24 text-[#18181B]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5DF] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#FFF1EE] text-[#D94826] text-[10px] font-bold border border-[#FECDCA]">
            <span>🏆 {t('leaderboardTitle') || '週間番付 · Weekly Leaderboard'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight mt-1 font-japanese">
            {t('leaderboardTitle')?.split('·')[0]?.trim() || '学習番付'}
          </h1>
        </div>

        {/* Weekly Reset Indicator */}
        <div className="text-right text-xs text-[#71717A] bg-[#F4F4F0] px-3 py-1.5 rounded-xl border border-[#E5E5DF]">
          <span className="font-mono">{t('resetsInDays', { n: 4 }) || 'リセットまで: あと 4 日'}</span>
        </div>
      </div>

      {/* Prominent Privacy Opt-Out Toggle at Top */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-2xs flex items-center justify-between">
        <div>
          <div className="font-bold text-xs text-[#18181B]">
            {t('leaderboardPrivacy') || 'ランキングへの参加設定'}
          </div>
          <div className="text-[11px] text-[#71717A]">
            {account.isLeaderboardOptIn
              ? '現在、週間番付に公開参加しています'
              : '非公開モードです（他のユーザーからあなたの記録は見えません）'}
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleOptIn}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-fast cursor-pointer ${
            account.isLeaderboardOptIn
              ? 'bg-[#18181B] text-white hover:bg-[#D94826]'
              : 'bg-[#F4F4F0] text-[#71717A] hover:bg-[#E5E5DF] hover:text-[#18181B]'
          }`}
        >
          {account.isLeaderboardOptIn ? (t('makePrivate') || '非公開にする') : (t('joinLeaderboard') || '番付に参加する')}
        </button>
      </div>

      {/* Ranked List */}
      <div className="rounded-3xl border border-[#E5E5DF] bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#F4F4F0] flex items-center justify-between text-xs font-bold text-[#71717A]">
          <span>{t('rankUser') || '順位 / 学習者'}</span>
          <span>{t('xpRank') || '獲得XP / 段位'}</span>
        </div>

        <div className="divide-y divide-[#F4F4F0]">
          {peers.length > 0 ? (
            peers.map((user, idx) => {
              const isSelf = user.isSelf || user.name === account.username;
              const rankMedals = ['🥇', '🥈', '🥉'];
              const medal = rankMedals[idx] || `${idx + 1}`;

              return (
                <div
                  key={idx}
                  className={`p-4 flex items-center justify-between transition-colors ${
                    isSelf ? 'bg-[#FFF1EE]/50 font-bold' : 'hover:bg-[#FBFBF9]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-sm font-black font-mono">
                      {medal}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-[#F4F4F0] text-[#18181B] flex items-center justify-center text-sm font-bold border border-[#E5E5DF]">
                      {user.badge || '学'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {isSelf && (
                          <span className="text-[10px] bg-[#D94826] text-white px-1.5 py-0.2 rounded font-mono">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#71717A]">{user.title}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-black text-sm text-[#18181B]">
                      {user.xp.toLocaleString()} XP
                    </div>
                    <div className="text-[10px] font-mono text-[#D94826] font-bold">
                      {user.streak ? `🔥 ${user.streak}` : ''}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-[#71717A] space-y-2">
              <p>非公開モードに設定されています。</p>
              <button
                type="button"
                onClick={handleToggleOptIn}
                className="text-[#D94826] font-bold underline cursor-pointer"
              >
                {t('joinLeaderboard') || '週間番付に参加して順位を確認する'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

