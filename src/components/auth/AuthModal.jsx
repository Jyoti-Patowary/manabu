'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'signup',
  onSuccess,
}) {
  const { t } = useLanguage();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [targetLevel, setTargetLevel] = useState('N5');
  const [showPlacementQuiz, setShowPlacementQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStep, setQuizStep] = useState(0);

  if (!isOpen) return null;

  // Simple quick placement questions
  const placementQuestions = [
    {
      q: '「水」の読み方は？',
      options: ['みず (mizu)', 'ひ (hi)', 'き (ki)', 'つち (tsuchi)'],
      answer: 0,
      levelIfCorrect: 'N5',
    },
    {
      q: '「食べる」の過去形は？',
      options: ['食べます', '食べた', '食べて', '食べない'],
      answer: 1,
      levelIfCorrect: 'N5',
    },
    {
      q: '「映画（　）見ます」に入る助詞は？',
      options: ['を', 'で', 'に', 'へ'],
      answer: 0,
    },
    {
      q: '「雨が降る（　）、傘を持って行こう」',
      options: ['かもしれないから', 'ところで', 'ばかりで', 'にしては'],
      answer: 0,
      levelIfCorrect: 'N4',
    },
    {
      q: '「プロジェクトは計画（　）進んでいる」',
      options: ['どおりに', 'ばかりに', 'きりに', '向けに'],
      answer: 0,
      levelIfCorrect: 'N3',
    },
  ];

  const handleAnswer = (index) => {
    let newScore = quizScore;
    if (index === placementQuestions[quizStep].answer) {
      newScore += 1;
      setQuizScore(newScore);
    }

    if (quizStep + 1 < placementQuestions.length) {
      setQuizStep(quizStep + 1);
    } else {
      // Completed quiz
      let recommendedLevel = 'N5';
      if (newScore >= 4) recommendedLevel = 'N2';
      else if (newScore >= 3) recommendedLevel = 'N3';
      else if (newScore >= 2) recommendedLevel = 'N4';
      setTargetLevel(recommendedLevel);
      setShowPlacementQuiz(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate instant login/signup and persist to localStorage
    const userProfile = {
      email: email || 'student@manabu.jp',
      targetLevel,
      name: email ? email.split('@')[0] : '日本語学習者',
      signedUpAt: Date.now(),
    };
    try {
      localStorage.setItem('manabu-auth-user', JSON.stringify(userProfile));
    } catch (err) {
      console.error(err);
    }
    onSuccess(userProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-[400px] bg-white rounded-3xl border border-[#E5E5DF] p-6 sm:p-8 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#A1A1AA] hover:text-[#18181B] p-1.5 rounded-lg hover:bg-[#F4F4F0] transition-fast cursor-pointer"
        >
          ✕
        </button>

        {!showPlacementQuiz ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-[#18181B] text-white flex items-center justify-center font-black text-xl mx-auto shadow-xs mb-3">
                学
              </div>
              <h2 className="text-xl font-black text-[#18181B]">
                {mode === 'signup' ? (t('createAccount') || 'アカウント作成') : (t('loginTitle') || 'ログイン')}
              </h2>
              <p className="text-xs text-[#71717A]">
                {mode === 'signup'
                  ? '学習進度とSRSキューをクラウド同期します'
                  : '日課の復習を再開しましょう'}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#71717A] mb-1">
                  {t('emailLabel') || 'メールアドレス'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-name@example.com"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E5E5DF] bg-[#FBFBF9] text-xs font-medium text-[#18181B] outline-none focus:border-[#18181B] focus:bg-white transition-all"
                />
              </div>

              {mode === 'signup' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#71717A]">
                      {t('targetLevel') || '目標のJLPTレベル'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPlacementQuiz(true);
                        setQuizStep(0);
                        setQuizScore(0);
                      }}
                      className="text-[11px] text-[#D94826] font-bold hover:underline cursor-pointer"
                    >
                      {t('takePlacementQuiz') || '判定テストを受ける？'}
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {['N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setTargetLevel(lvl)}
                        className={`py-2 rounded-xl text-xs font-bold transition-fast border cursor-pointer ${
                          targetLevel === lvl
                            ? 'bg-[#18181B] text-white border-[#18181B]'
                            : 'bg-[#FBFBF9] text-[#71717A] border-[#E5E5DF] hover:bg-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#D94826] text-white font-bold text-xs hover:bg-[#BF3B1C] transition-fast shadow-xs cursor-pointer"
            >
              {mode === 'signup' ? (t('startLearning') || '学習を開始する') : (t('loginAndReview') || 'ログインして復習へ')}
            </button>

            <div className="text-center pt-2 border-t border-[#F4F4F0]">
              <button
                type="button"
                onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                className="text-xs text-[#71717A] hover:text-[#18181B] font-medium cursor-pointer"
              >
                {mode === 'signup'
                  ? (t('alreadyHaveAccount') || 'すでにアカウントをお持ちの方はこちら')
                  : (t('needAccount') || '初めてご利用の方はこちらから登録')}
              </button>
            </div>
          </form>
        ) : (
          /* Short 5-Question Placement Quiz */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-[#A1A1AA]">
                レベル判定テスト ({quizStep + 1} / {placementQuestions.length})
              </span>
              <button
                type="button"
                onClick={() => setShowPlacementQuiz(false)}
                className="text-xs text-[#71717A] hover:text-[#18181B]"
              >
                スキップ
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#FBFBF9] border border-[#E5E5DF] text-center py-6">
              <div className="text-base font-bold text-[#18181B] font-japanese">
                {placementQuestions[quizStep].q}
              </div>
            </div>

            <div className="space-y-2">
              {placementQuestions[quizStep].options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAnswer(idx)}
                  className="w-full py-2.5 px-3 rounded-xl border border-[#E5E5DF] bg-white text-xs font-semibold text-[#18181B] hover:bg-[#F4F4F0] hover:border-[#18181B] transition-fast text-left cursor-pointer"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

