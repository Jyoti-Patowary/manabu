'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '../LanguageSwitcher';

export default function AppShell({
  children,
  currentView,
  onNavigate,
  activeLevel,
  onSelectLevel,
  dueCount = 0,
  streakData,
  accountInfo,
  onOpenAccount,
  onOpenReadiness,
  isLoggedIn = true,
  onOpenAuth,
  onStartReview,
}) {
  const { t } = useLanguage();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const mainNavItems = [
    {
      id: 'dashboard',
      label: t('navDashboard') || 'Dashboard',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      ),
    },
    {
      id: 'course',
      label: t('navCourse') || 'Curriculum',
      badge: '30 Lessons',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <path d="M9 10h6" />
          <path d="M9 14h6" />
          <path d="M9 6h6" />
        </svg>
      ),
    },
    {
      id: 'explore',
      label: t('navExplore') || 'Explore Graph',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      ),
    },
    {
      id: 'library',
      label: t('navLibrary') || 'Reading Library',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <path d="M6 6h10" />
          <path d="M6 10h10" />
        </svg>
      ),
    },
    {
      id: 'progress',
      label: t('navProgress') || 'Progress',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: t('navSettings') || 'Settings',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  const levels = [
    { id: 'kana', label: 'Kana', badge: 'Foundation' },
    { id: 'N5', label: 'JLPT N5', badge: 'Beginner' },
    { id: 'N4', label: 'JLPT N4', badge: 'Elementary' },
    { id: 'N3', label: 'JLPT N3', badge: 'Intermediate' },
    { id: 'N2', label: 'JLPT N2', badge: 'Upper Int.' },
    { id: 'N1', label: 'JLPT N1', badge: 'Advanced' },
  ];

  return (
    <div className="min-h-screen flex bg-[#FBFBF9] text-[#18181B]">
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col border-r border-[#E5E5DF] bg-[#FFFFFF] sticky top-0 h-screen transition-all duration-200 z-30 select-none ${
          isSidebarCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#E5E5DF]">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 group text-left cursor-pointer overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-[#18181B] text-white flex items-center justify-center font-black text-lg shrink-0 group-hover:scale-105 transition-fast shadow-xs">
              学
            </div>
            {!isSidebarCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base tracking-tight text-[#18181B]">学ぶ</span>
                  <span className="text-[10px] font-bold text-[#71717A] tracking-wider uppercase bg-[#F4F4F0] px-1.5 py-0.5 rounded">
                    JLPT
                  </span>
                </div>
                <div className="text-[11px] text-[#A1A1AA] font-medium truncate">Spaced Repetition</div>
              </div>
            )}
          </button>

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg text-[#71717A] hover:bg-[#F4F4F0] hover:text-[#18181B] transition-fast cursor-pointer"
            title={isSidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            <svg className={`w-4 h-4 transition-transform duration-200 ${isSidebarCollapsed ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>

        {/* Primary Review CTA Button (prominent study action) */}
        <div className="p-3 border-b border-[#E5E5DF]">
          <button
            onClick={onStartReview}
            className={`w-full flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#D94826] text-white font-bold hover:bg-[#BF3B1C] transition-fast shadow-xs cursor-pointer ${
              isSidebarCollapsed ? 'px-0' : ''
            }`}
            title={t('startReview') || 'Start Review'}
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            {!isSidebarCollapsed && (
              <span className="truncate text-sm">
                {t('startReview') || 'Start Review'} {dueCount > 0 ? `(${dueCount})` : ''}
              </span>
            )}
          </button>
        </div>

        {/* Navigation Links Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Main 5 Sections */}
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-fast cursor-pointer ${
                    isActive
                      ? 'bg-[#18181B] text-white shadow-2xs'
                      : 'text-[#71717A] hover:bg-[#F4F4F0] hover:text-[#18181B]'
                  } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                  title={item.label}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!isSidebarCollapsed && (
                    <div className="flex items-center justify-between flex-1 truncate">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                          isActive ? 'bg-[#3F3F46] text-white' : 'bg-[#F4F4F0] text-[#71717A]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Study Modes: Drill & Mock Exam */}
          <div className="pt-2 border-t border-[#E5E5DF] space-y-1">
            {!isSidebarCollapsed && (
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-[#A1A1AA]">
                {t('studyModes') || 'Study Modes'}
              </div>
            )}
            <button
              onClick={() => onNavigate('drill')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-fast cursor-pointer ${
                currentView === 'drill'
                  ? 'bg-[#18181B] text-white'
                  : 'text-[#71717A] hover:bg-[#F4F4F0] hover:text-[#18181B]'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              title={t('navDrill') || 'Drill'}
            >
              <span className="text-base shrink-0">🎯</span>
              {!isSidebarCollapsed && <span className="truncate">{t('navDrill') || 'Drill'}</span>}
            </button>

            <button
              onClick={() => onNavigate('exam')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-fast cursor-pointer ${
                currentView === 'exam'
                  ? 'bg-[#18181B] text-white'
                  : 'text-[#71717A] hover:bg-[#F4F4F0] hover:text-[#18181B]'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              title={t('navExam') || 'Mock Exam'}
            >
              <span className="text-base shrink-0">⏱</span>
              {!isSidebarCollapsed && <span className="truncate">{t('navExam') || 'Mock Exam'}</span>}
            </button>
          </div>

          {/* Level Hubs */}
          <div className="pt-2 border-t border-[#E5E5DF] space-y-1">
            {!isSidebarCollapsed && (
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-[#A1A1AA]">
                {t('levelHubs') || 'Level Hubs'}
              </div>
            )}
            {levels.map((lvl) => {
              const isSelected = activeLevel === lvl.id && currentView === 'hub';
              return (
                <button
                  key={lvl.id}
                  onClick={() => onSelectLevel(lvl.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-fast cursor-pointer ${
                    isSelected
                      ? 'bg-[#F4F4F0] text-[#18181B] font-bold'
                      : 'text-[#71717A] hover:bg-[#F4F4F0] hover:text-[#18181B]'
                  } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                  title={lvl.label}
                >
                  <span className="truncate">{isSidebarCollapsed ? lvl.id.toUpperCase() : lvl.label}</span>
                  {!isSidebarCollapsed && (
                    <span className="text-[10px] text-[#A1A1AA] font-mono bg-[#E5E5DF]/50 px-1.5 py-0.2 rounded">
                      {lvl.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer: User Badge, Streak & Language */}
        <div className="p-3 border-t border-[#E5E5DF] space-y-2">
          {/* User Account / Rank Badge */}
          {accountInfo && (
            <button
              onClick={onOpenAccount}
              className={`w-full flex items-center gap-2 p-2 rounded-xl border border-[#E5E5DF] hover:bg-[#F4F4F0] transition-fast text-left cursor-pointer ${
                isSidebarCollapsed ? 'justify-center p-1' : ''
              }`}
              title={accountInfo.title || 'Rank'}
            >
              <div className="w-7 h-7 rounded-lg bg-[#F4F4F0] flex items-center justify-center text-sm shrink-0">
                {accountInfo.badge || '見'}
              </div>
              {!isSidebarCollapsed && (
                <div className="truncate flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#18181B]">{accountInfo.title || 'Apprentice'}</span>
                    <span className="text-[10px] font-mono text-[#D94826] font-bold">Lv.{accountInfo.level || 1}</span>
                  </div>
                  <div className="text-[10px] text-[#A1A1AA] font-mono">{accountInfo.totalXp || 0} XP</div>
                </div>
              )}
            </button>
          )}

          {/* Streak indicator */}
          {streakData && (
            <button
              onClick={onOpenReadiness}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold text-[#D94826] bg-[#FFF1EE] hover:bg-[#FECDCA]/50 transition-fast cursor-pointer ${
                isSidebarCollapsed ? 'justify-center' : ''
              }`}
              title="Streak"
            >
              <span>🔥</span>
              {!isSidebarCollapsed && (
                <span className="truncate">
                  {t('daysStreak', { n: streakData.currentStreak })}
                </span>
              )}
            </button>
          )}

          {!isSidebarCollapsed && (
            <div className="flex items-center justify-between pt-1">
              <LanguageSwitcher />
              <button
                onClick={() => onNavigate('about')}
                className="text-[10px] text-[#A1A1AA] hover:text-[#71717A] underline cursor-pointer"
              >
                {t('credits') || 'Attribution & Licenses'}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        {/* Top Minimal Utility Bar on Mobile & Tablet */}
        <header className="md:hidden sticky top-0 z-20 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E5E5DF] h-14 px-4 flex items-center justify-between">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#18181B] text-white flex items-center justify-center font-black text-sm">
              学
            </div>
            <span className="font-black text-base tracking-tight text-[#18181B]">学ぶ</span>
          </button>

          <div className="flex items-center gap-2">
            {streakData && (
              <button
                onClick={onOpenReadiness}
                className="flex items-center gap-1 text-xs font-bold text-[#D94826] bg-[#FFF1EE] px-2 py-1 rounded-md"
              >
                <span>🔥</span>
                <span>{streakData.currentStreak}</span>
              </button>
            )}

            {accountInfo && (
              <button
                onClick={onOpenAccount}
                className="flex items-center gap-1 text-xs font-bold text-[#18181B] bg-[#F4F4F0] px-2 py-1 rounded-md border border-[#E5E5DF]"
              >
                <span>{accountInfo.badge}</span>
                <span className="font-mono text-[#D94826]">Lv.{accountInfo.level}</span>
              </button>
            )}

            <LanguageSwitcher />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM TAB BAR (5 items: Dashboard, Explore, Review [center, prominent], Library, Profile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E5E5DF] h-16 px-2 flex items-center justify-around shadow-sm select-none">
        {/* 1. Dashboard */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-fast cursor-pointer ${
            currentView === 'dashboard' ? 'text-[#18181B] font-bold' : 'text-[#71717A]'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
          </svg>
          <span className="text-[10px]">{t('home') || 'Home'}</span>
        </button>

        {/* 2. Course */}
        <button
          onClick={() => onNavigate('course')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-fast cursor-pointer ${
            currentView === 'course' ? 'text-[#18181B] font-bold' : 'text-[#71717A]'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M9 10h6" />
            <path d="M9 14h6" />
          </svg>
          <span className="text-[10px]">{t('navCourse') || 'Curriculum'}</span>
        </button>

        {/* 3. Review Action (CENTER, PROMINENT & VISUALLY LARGEST) */}
        <button
          onClick={onStartReview}
          className="relative -top-3 flex flex-col items-center group cursor-pointer"
        >
          <div className="w-13 h-13 rounded-2xl bg-[#D94826] text-white flex items-center justify-center shadow-md group-active:scale-95 transition-fast">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            {dueCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#18181B] text-white text-[9px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                {dueCount > 99 ? '99+' : dueCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-[#D94826] mt-0.5">{t('reviewDue') || 'Review'}</span>
        </button>

        {/* 4. Library */}
        <button
          onClick={() => onNavigate('library')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-fast cursor-pointer ${
            currentView === 'library' ? 'text-[#18181B] font-bold' : 'text-[#71717A]'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
          </svg>
          <span className="text-[10px]">{t('navLibrary') || 'Library'}</span>
        </button>

        {/* 5. Profile / Settings */}
        <button
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-fast cursor-pointer ${
            currentView === 'profile' ? 'text-[#18181B] font-bold' : 'text-[#71717A]'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span className="text-[10px]">{t('navSettings') || 'Settings'}</span>
        </button>
      </nav>
    </div>
  );
}

