'use client';

import { useState } from 'react';
import { getLocalAccount, saveLocalAccount } from '@/lib/accountEngine';
import { useLanguage } from '@/context/LanguageContext';

export default function SettingsView({
  onBack,
  onResetData,
}) {
  const { t } = useLanguage();
  const [account, setAccount] = useState(() => getLocalAccount());
  const [name, setName] = useState(account.name || '日本語学習者');
  const [targetLevel, setTargetLevel] = useState(account.targetLevel || 'N5');
  const [examDate, setExamDate] = useState('2026-12-06');
  const [sessionLength, setSessionLength] = useState('20');
  const [furiganaDefault, setFuriganaDefault] = useState('always');
  const [dailyReminder, setDailyReminder] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      ...account,
      name,
      targetLevel,
      examDate,
      preferences: {
        sessionLength: parseInt(sessionLength, 10),
        furiganaDefault,
        dailyReminder,
        reducedMotion,
      },
    };
    saveLocalAccount(updated);
    setAccount(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportData = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(account, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `manabu-backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error(e);
      alert('データのエクスポートに失敗しました');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-8 animate-fadeIn pb-24 text-[#18181B]">
      {/* Top Header */}
      <div className="border-b border-[#E5E5DF] pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">
          {t('settingsTitle') || 'アカウント & 学習設定'}
        </h1>
        <p className="text-xs text-[#71717A] mt-1">
          日々の学習セッションや表示、プライバシー環境をカスタマイズします。
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Basics */}
        <div className="rounded-3xl border border-[#E5E5DF] bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider">
            {t('profileBasics') || '1. プロフィール基本情報'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-[#71717A] mb-1">
                {t('username') || 'ユーザー名'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5DF] bg-[#FBFBF9] font-medium outline-none focus:border-[#18181B] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#71717A] mb-1">
                {t('targetLevel') || '目標JLPTレベル'}
              </label>
              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5DF] bg-[#FBFBF9] font-medium outline-none focus:border-[#18181B] transition-all"
              >
                {['N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    JLPT {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#71717A] mb-1">
                {t('examDate') || '目標試験日'}
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5DF] bg-[#FBFBF9] font-medium outline-none focus:border-[#18181B] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Study Preferences */}
        <div className="rounded-3xl border border-[#E5E5DF] bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider">
            {t('studyEnvironment') || '2. 学習環境・表示設定'}
          </h2>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-[#18181B]">{t('defaultSessionSize') || '1セッションの標準カード数'}</div>
                <div className="text-[11px] text-[#71717A]">復習セッションごとの上限枚数</div>
              </div>
              <select
                value={sessionLength}
                onChange={(e) => setSessionLength(e.target.value)}
                className="h-9 px-3 rounded-xl border border-[#E5E5DF] bg-[#FBFBF9] font-bold"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-[#18181B]">{t('furiganaDefault') || 'ふりがな（ルビ）のデフォルト'}</div>
                <div className="text-[11px] text-[#71717A]">読解やフラッシュカードでの表示設定</div>
              </div>
              <select
                value={furiganaDefault}
                onChange={(e) => setFuriganaDefault(e.target.value)}
                className="h-9 px-3 rounded-xl border border-[#E5E5DF] bg-[#FBFBF9] font-bold"
              >
                <option value="always">ON</option>
                <option value="tap">TAP</option>
                <option value="off">OFF</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-[#18181B]">{t('dailyReminders') || '毎日の学習リマインダー通知'}</div>
                <div className="text-[11px] text-[#71717A]">連続学習（ストリーク）維持の通知</div>
              </div>
              <input
                type="checkbox"
                checked={dailyReminder}
                onChange={(e) => setDailyReminder(e.target.checked)}
                className="w-4 h-4 rounded text-[#D94826] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-[#18181B]">{t('reducedMotion') || 'アニメーションの軽減 (Reduced Motion)'}</div>
                <div className="text-[11px] text-[#71717A]">カード反転やスタンプ演出を最小限に</div>
              </div>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="w-4 h-4 rounded text-[#D94826] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-600">
            {savedSuccess ? (t('settingsSaved') || '✓ 設定を保存しました') : ''}
          </span>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#D94826] text-white font-bold text-xs hover:bg-[#BF3B1C] transition-fast shadow-xs cursor-pointer"
          >
            {t('saveSettings') || '設定を保存する'}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="rounded-3xl border border-rose-200 bg-rose-50/40 p-6 space-y-4">
          <h2 className="text-sm font-bold text-rose-800 uppercase tracking-wider">
            {t('dangerZone') || '3. データ管理 & デンジャーゾーン'}
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-[#18181B]">{t('exportData') || '学習履歴データのエクスポート'}</div>
                <div className="text-[11px] text-[#71717A]">JSON</div>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                className="px-3.5 py-1.5 rounded-xl border border-[#E5E5DF] bg-white font-bold text-[#18181B] hover:bg-[#F4F4F0] cursor-pointer"
              >
                {t('exportData') || 'エクスポート'}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-rose-200/50">
              <div>
                <div className="font-bold text-rose-700">{t('resetProgress') || '学習進度の完全リセット'}</div>
                <div className="text-[11px] text-[#71717A]">SRS / XP</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('本当に学習履歴を初期化しますか？この操作は取り消せません。')) {
                    onResetData?.();
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 cursor-pointer"
              >
                {t('resetProgress') || 'リセット'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

