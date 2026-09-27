'use client';

import { useState, useMemo } from 'react';
import { getLocalAccount, setLeaderboardOptIn, getWeeklyLeaderboard } from '@/lib/accountEngine';
import { useLanguage } from '@/context/LanguageContext';

export default function AccountModal({ onClose }) {
  const { t } = useLanguage();
  const [account, setAccount] = useState(() => getLocalAccount());
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'exams' | 'leaderboard'

  const leaderboardData = useMemo(() => {
    return getWeeklyLeaderboard(account.xp, account.isLeaderboardOptIn);
  }, [account.xp, account.isLeaderboardOptIn]);

  const handleToggleOptIn = (checked) => {
    setLeaderboardOptIn(checked);
    setAccount((prev) => ({ ...prev, isLeaderboardOptIn: checked }));
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-[#E8E8E2] max-w-xl w-full max-h-[88vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150 text-[#1A1A1A]"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E8E8E2] pb-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-[#D94826]/10 text-[#D94826] border border-[#D94826]/20">
              Account & Progression
            </span>
            <h2 className="text-2xl font-black font-serif-jp tracking-tight">
              アカウント & 学習段位
            </h2>
            <p className="text-xs text-[#71717A]">
              アプリ内の学習経験値（XP）と習熟段位です。（※JLPTレベルとは異なります）
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F5F5F0] hover:bg-[#E8E8E2] text-[#71717A] flex items-center justify-center text-sm font-bold transition-fast cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Hero Level & XP Card */}
        <div className="p-6 rounded-3xl bg-[#FAFAF7] border border-[#E8E8E2] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-[#E8E8E2] flex items-center justify-center text-3xl shadow-xs">
                {account.badge}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#71717A] tracking-wider block">
                  Lv.{account.level} · {account.titleEn}
                </span>
                <h3 className="text-xl font-black font-serif-jp text-[#1A1A1A]">
                  {account.title}
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-[#D94826] font-mono">
                {account.xp}
              </span>
              <span className="text-[11px] text-[#71717A] block">累計 XP</span>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-[#71717A]">
              <span>次の段位まで</span>
              <span className="font-mono font-bold">あと {account.xpToNext} XP</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#E8E8E2] overflow-hidden">
              <div
                className="h-full bg-[#1A1A1A] transition-all duration-500"
                style={{ width: `${account.percentToNext}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E8E8E2] pb-2">
          {[
            { id: 'overview', label: '学習実績' },
            { id: 'exams', label: `模擬試験履歴 (${account.examHistory?.length || 0})` },
            { id: 'leaderboard', label: '週間番付 (Ranking)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-fast cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-[#71717A] hover:text-[#1A1A1A] hover:bg-[#FAFAF7]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h4 className="text-xs font-black text-[#71717A] uppercase tracking-wider">
              XP 獲得ルール
            </h4>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#FAFAF7] border border-[#E8E8E2] flex items-center justify-between">
                <span>SRS カード復習</span>
                <span className="font-bold text-[#15803D]">+10 XP</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAFAF7] border border-[#E8E8E2] flex items-center justify-between">
                <span>レッスン学習</span>
                <span className="font-bold text-[#15803D]">+15 XP</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAFAF7] border border-[#E8E8E2] flex items-center justify-between">
                <span>弱点集中ドリル完了</span>
                <span className="font-bold text-[#15803D]">+25 XP</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAFAF7] border border-[#E8E8E2] flex items-center justify-between">
                <span>JLPT 模擬試験完了</span>
                <span className="font-bold text-[#D94826]">+100 XP</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Exam History */}
        {activeTab === 'exams' && (
          <div className="space-y-3">
            {account.examHistory && account.examHistory.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {account.examHistory.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#E8E8E2] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-black text-[10px] bg-slate-900 text-white">
                          JLPT {ex.level}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ex.passed ? 'bg-emerald-100 text-[#15803D]' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {ex.passed ? '合格' : '不合格'}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#71717A] mt-1 block">
                        {new Date(ex.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-[#1A1A1A] font-mono">
                        {ex.score} / {ex.maxScore}
                      </span>
                      <span className="text-[11px] text-[#71717A] block">{ex.percent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#71717A] bg-[#FAFAF7] rounded-2xl border border-dashed border-[#E8E8E2]">
                まだ模擬試験の受験履歴がありません。
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            {/* Opt-in Toggle */}
            <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#E8E8E2] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#1A1A1A] block">
                  週間番付に参加する (Opt-in Leaderboard)
                </span>
                <span className="text-[11px] text-[#71717A]">
                  オフにすると順位表から非表示になり、完全プライベート学習になります。
                </span>
              </div>

              <input
                type="checkbox"
                checked={account.isLeaderboardOptIn}
                onChange={(e) => handleToggleOptIn(e.target.checked)}
                className="w-5 h-5 accent-[#1A1A1A] rounded cursor-pointer"
              />
            </div>

            {account.isLeaderboardOptIn ? (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {leaderboardData.peers.map((p, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-fast ${
                      p.isSelf
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                        : 'bg-white text-[#1A1A1A] border-[#E8E8E2]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold font-mono text-xs ${
                        p.rank === 1 ? 'bg-amber-400 text-slate-950' : (p.isSelf ? 'bg-white/20' : 'bg-[#FAFAF7]')
                      }`}>
                        {p.rank}
                      </span>
                      <div>
                        <span className="font-bold block">{p.name}</span>
                        <span className={`text-[10px] ${p.isSelf ? 'text-slate-300' : 'text-[#71717A]'}`}>
                          {p.title}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black">{p.xp} XP</span>
                      <span className={`text-[10px] block ${p.isSelf ? 'text-amber-300' : 'text-[#D94826]'}`}>
                        🔥 {p.streak}日
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#71717A] bg-[#FAFAF7] rounded-2xl border border-[#E8E8E2] space-y-2">
                <span>🔒 現在プライベート学習モードです。</span>
                <p className="text-[11px] text-[#A1A1AA]">
                  番付に参加すると、他の学習者と切磋琢磨できます。
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

