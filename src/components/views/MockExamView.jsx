'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MOCK_EXAMS, calculateExamScore } from '@/lib/mockExamData';
import { recordMockExamResult } from '@/lib/accountEngine';
import { useLanguage } from '@/context/LanguageContext';

export default function MockExamView({
  initialLevel = 'N5',
  onFinish,
  onBack,
  onAddMissedToQueue,
}) {
  const { t } = useLanguage();
  const [level, setLevel] = useState(initialLevel);
  const [examState, setExamState] = useState('intro'); // 'intro' | 'active' | 'result'
  const [answers, setAnswers] = useState({});
  const [currentSection, setCurrentSection] = useState('vocab'); // 'vocab' | 'grammar' | 'reading' | 'listening'
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3000); // in seconds
  const [examResult, setExamResult] = useState(null);
  const [isPlayingListening, setIsPlayingListening] = useState(false);
  const [enabledSections, setEnabledSections] = useState({
    vocab: true,
    grammar: true,
    reading: true,
    listening: true,
  });
  const [addedToSrsSuccess, setAddedToSrsSuccess] = useState(false);

  const exam = useMemo(() => MOCK_EXAMS[level] || MOCK_EXAMS.N5, [level]);

  // Audio speech synthesis for listening section
  const speak = useCallback((text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      setIsPlayingListening(true);
      utterance.onend = () => setIsPlayingListening(false);
      utterance.onerror = () => setIsPlayingListening(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error(e);
      setIsPlayingListening(false);
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (examState !== 'active') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examState]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const activeSectionKeys = useMemo(() => {
    return ['vocab', 'grammar', 'reading', 'listening'].filter(k => enabledSections[k]);
  }, [enabledSections]);

  const handleStartExam = () => {
    setAnswers({});
    setQuestionIndex(0);
    const firstSec = activeSectionKeys[0] || 'vocab';
    setCurrentSection(firstSec);
    setTimeLeft(exam.durationSeconds || 3000);
    setExamState('active');
  };

  const currentQuestions = exam.sections[currentSection] || [];
  const currentQ = currentQuestions[questionIndex];

  const handleSelectOption = (qId, optionIdx) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  const handleSubmitExam = () => {
    window.speechSynthesis?.cancel();
    const result = calculateExamScore(answers, exam);
    setExamResult(result);
    setExamState('result');

    // Save to user account history & award XP
    recordMockExamResult({
      level,
      score: result.score,
      maxScore: result.maxScore,
      percent: result.percent,
      passed: result.passed,
      sections: result.sections,
    });
  };

  const sectionLabels = {
    vocab: `${t('vocabPillar') || '文字・語彙'} (Vocab)`,
    grammar: `${t('grammarPillar') || '文法'} (Grammar)`,
    reading: `${t('navLibrary') || '読解'} (Reading)`,
    listening: `${t('modeAudio') || '聴解'} (Listening)`,
  };

  // Extract missed questions from exam result
  const missedQuestions = useMemo(() => {
    if (!examResult) return [];
    const missed = [];
    Object.entries(exam.sections).forEach(([secKey, qList]) => {
      qList.forEach(q => {
        const userAns = answers[q.id];
        if (userAns !== q.answerIndex) {
          missed.push({
            ...q,
            section: secKey,
            userAns,
          });
        }
      });
    });
    return missed;
  }, [examResult, answers, exam]);

  const handleBulkAddToSrs = () => {
    if (missedQuestions.length === 0) return;
    const cardsToAdd = missedQuestions.map(q => ({
      id: `mock-missed-${q.id}`,
      kanji: q.question.split('（')[0] || q.question.slice(0, 10),
      reading: q.question,
      meaning: `正解: ${q.options[q.answerIndex]} (JLPT ${level} 模試復習)`,
      content_type: q.section === 'vocab' ? 'Vocabulary' : q.section === 'grammar' ? 'Grammar' : 'Reading',
      jlpt_level: level,
      interval: 0,
      repetitions: 0,
      ease_factor: 2.5,
      dueDate: Date.now(),
    }));

    if (onAddMissedToQueue) {
      onAddMissedToQueue(cardsToAdd);
    }
    setAddedToSrsSuccess(true);
  };

  // 1. SETUP / INTRO SCREEN
  if (examState === 'intro') {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#E5E5DF] p-6 sm:p-10 shadow-xs space-y-6 animate-fadeIn text-[#18181B]">
        <div className="flex items-center justify-between border-b border-[#E5E5DF] pb-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-[#FFF1EE] text-[#D94826] border border-[#FECDCA]">
              {t('mockExamSetup') || 'JLPT Mock Examination Setup'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-japanese tracking-tight">
              JLPT {level} {t('quickExamTitle', { level }) || '総合模擬試験'}
            </h2>
            <p className="text-xs text-[#71717A]">
              {t('mockExamSub') || '本番の試験時間と配点基準に準拠した総合模擬試験です。'}
            </p>
          </div>

          {/* Level Switcher */}
          <div className="flex items-center gap-1 bg-[#FBFBF9] p-1 rounded-xl border border-[#E5E5DF]">
            {['N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevel(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-fast cursor-pointer ${
                  level === lvl
                    ? 'bg-[#18181B] text-white'
                    : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Exam Structure Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3.5 rounded-2xl bg-[#FBFBF9] border border-[#E5E5DF]">
            <span className="text-[10px] text-[#71717A] block">{t('timeLimit') || '制限時間'}</span>
            <span className="text-base font-black text-[#18181B]">
              {Math.round((exam.durationSeconds || 3000) / 60)} min
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FBFBF9] border border-[#E5E5DF]">
            <span className="text-[10px] text-[#71717A] block">{t('maxScore') || '満点'}</span>
            <span className="text-base font-black text-[#18181B]">180</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FBFBF9] border border-[#E5E5DF]">
            <span className="text-[10px] text-[#71717A] block">{t('passingScore') || '合格基準点'}</span>
            <span className="text-base font-black text-[#15803D]">
              ≥ {exam.passingScoreOverall}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FBFBF9] border border-[#E5E5DF]">
            <span className="text-[10px] text-[#71717A] block">{t('sectionalThreshold') || '基準点割れ条件'}</span>
            <span className="text-base font-black text-rose-600">&lt; 19</span>
          </div>
        </div>

        {/* Section Toggles */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-[#71717A] uppercase tracking-wider">
            {t('selectSections') || '受験科目の選択 (Section Toggles)'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {['vocab', 'grammar', 'reading', 'listening'].map((secKey) => {
              const isEnabled = enabledSections[secKey];
              return (
                <button
                  key={secKey}
                  type="button"
                  onClick={() => setEnabledSections(prev => ({ ...prev, [secKey]: !prev[secKey] }))}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-fast flex items-center justify-between cursor-pointer ${
                    isEnabled
                      ? 'bg-white border-[#18181B] text-[#18181B]'
                      : 'bg-[#F4F4F0] border-[#E5E5DF] text-[#A1A1AA]'
                  }`}
                >
                  <span>{sectionLabels[secKey]}</span>
                  <span>{isEnabled ? '✓' : '—'}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 rounded-xl bg-[#F4F4F0] hover:bg-[#E5E5DF] text-[#18181B] text-xs font-bold transition-fast cursor-pointer"
          >
            ← {t('back') || '戻る'}
          </button>
          <button
            type="button"
            onClick={handleStartExam}
            className="flex-2 py-3.5 rounded-xl bg-[#D94826] hover:bg-[#BF3B1C] text-white text-xs font-black transition-fast shadow-xs cursor-pointer"
          >
            {t('beginExam') || '模擬試験を開始する (Begin Exam) →'}
          </button>
        </div>
      </div>
    );
  }

  // 2. RESULTS SCREEN (Overall score, section bar chart, missed questions + "Add to SRS" bulk action)
  if (examState === 'result' && examResult) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#E5E5DF] p-6 sm:p-10 shadow-xs space-y-6 animate-fadeIn text-[#18181B]">
        {/* Pass/Fail Banner */}
        <div
          className={`p-6 rounded-3xl border text-center space-y-2 ${
            examResult.passed
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          <span className="text-4xl block">
            {examResult.passed ? '🎉' : '📝'}
          </span>
          <h2 className="text-2xl font-black font-japanese">
            {examResult.passed ? (t('examPassed') || '合格基準達成 (PASSED)') : (t('examFailed') || '不合格 (NOT PASSED)')}
          </h2>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-black">{examResult.score}</span>
            <span className="text-sm font-semibold opacity-70">/ {examResult.maxScore}</span>
          </div>
          <p className="text-xs max-w-sm mx-auto opacity-80">
            {examResult.passed
              ? 'おめでとうございます！ 総合得点および各科目の基準点をクリアしています。'
              : '総合得点または各科目の基準点（19点）に届きませんでした。弱点項目を集中復習しましょう。'}
          </p>
        </div>

        {/* Section Breakdown Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-[#71717A] uppercase tracking-wider">
            {t('sectionBreakdown') || '分野別得点 (Section Breakdown)'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(examResult.sections).map(([secKey, sec]) => (
              <div
                key={secKey}
                className="p-4 rounded-2xl bg-[#FBFBF9] border border-[#E5E5DF] flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-[#18181B] block">
                    {sectionLabels[secKey] || secKey}
                  </span>
                  <span className="text-[11px] text-[#71717A]">
                    {sec.passedSection ? '✓' : '✕'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#18181B]">
                    {sec.scaledScore}
                  </span>
                  <span className="text-xs text-[#71717A]"> / {sec.scaledMax}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missed Questions & Bulk "Add to SRS Queue" Action */}
        {missedQuestions.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-rose-700 uppercase tracking-wider">
                {t('missedQuestions') || '間違えた問題'} ({missedQuestions.length})
              </h4>

              <button
                type="button"
                disabled={addedToSrsSuccess}
                onClick={handleBulkAddToSrs}
                className="px-3 py-1.5 rounded-xl bg-[#D94826] text-white text-xs font-bold hover:bg-[#BF3B1C] transition-fast shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                {addedToSrsSuccess ? (t('addedToSrs') || '✓ SRSキューに追加済み') : (t('addMissedToSrs') || '間違えた問題をSRSに追加 (Add to SRS)')}
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {missedQuestions.map((q, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#FBFBF9] border border-[#E5E5DF] text-xs space-y-1">
                  <div className="font-bold text-[#18181B]">{q.question}</div>
                  <div className="flex justify-between text-[11px] text-[#71717A]">
                    <span><span className="text-rose-600 font-bold">{q.options[q.userAns] || '未回答'}</span></span>
                    <span>✓ <span className="text-emerald-700 font-bold">{q.options[q.answerIndex]}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleStartExam}
            className="flex-1 py-3 rounded-xl bg-[#F4F4F0] hover:bg-[#E5E5DF] text-[#18181B] text-xs font-bold transition-fast cursor-pointer"
          >
            {t('retakeExam') || 'もう一度受験する'}
          </button>
          <button
            type="button"
            onClick={onFinish || onBack}
            className="flex-1 py-3 rounded-xl bg-[#18181B] hover:bg-[#D94826] text-white text-xs font-bold transition-fast shadow-xs cursor-pointer"
          >
            {t('backToHub') || 'ハブへ戻る'}
          </button>
        </div>
      </div>
    );
  }

  // 3. ACTIVE TEST SCREEN
  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fadeIn text-[#18181B]">
      {/* Top Test Header & Timer */}
      <div className="bg-white rounded-2xl border border-[#E5E5DF] p-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-[#18181B] text-white">
            JLPT {level}
          </span>
          <span className="text-xs font-bold text-[#71717A] hidden sm:inline">
            {sectionLabels[currentSection]}
          </span>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#71717A]">残り時間:</span>
          <span className={`font-mono text-base font-black px-2.5 py-0.5 rounded-lg border ${
            timeLeft < 300 ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' : 'bg-[#FBFBF9] text-[#18181B] border-[#E5E5DF]'
          }`}>
            ⏱ {formatTimer(timeLeft)}
          </span>
        </div>
      </div>

      {/* Section Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {activeSectionKeys.map((secKey) => {
          const isCurrent = currentSection === secKey;
          const questions = exam.sections[secKey] || [];
          const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;

          return (
            <button
              key={secKey}
              type="button"
              onClick={() => {
                setCurrentSection(secKey);
                setQuestionIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-fast shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                isCurrent
                  ? 'bg-[#18181B] text-white border-[#18181B] shadow-xs'
                  : 'bg-white text-[#71717A] border-[#E5E5DF] hover:bg-[#FBFBF9]'
              }`}
            >
              <span>{sectionLabels[secKey].split(' ')[0]}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isCurrent ? 'bg-white/20 text-white' : 'bg-[#F4F4F0] text-[#71717A]'
              }`}>
                {answeredCount}/{questions.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Question Card */}
      {currentQ ? (
        <div className="bg-white rounded-3xl border border-[#E5E5DF] p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E5DF] pb-3 text-xs text-[#71717A]">
            <span className="font-bold">
              第 {questionIndex + 1} 問 / 全 {currentQuestions.length} 問
            </span>
            <span className="font-mono">配点: {currentQ.points} 点</span>
          </div>

          {/* Reading Passage or Audio Dialogue if applicable */}
          {currentQ.passage && (
            <div className="p-4 rounded-2xl bg-[#FBFBF9] border border-[#E5E5DF] text-xs sm:text-sm font-japanese leading-relaxed whitespace-pre-wrap select-text">
              {currentQ.passage}
            </div>
          )}

          {currentQ.audioDialogue && (
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#B45309] flex items-center gap-1.5">
                  <span>🎧</span>
                  <span>聴解音声スクリプト (Listening Audio)</span>
                </span>

                <button
                  type="button"
                  onClick={() => speak(currentQ.audioDialogue)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-fast flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    isPlayingListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-[#18181B] text-white hover:bg-[#D94826]'
                  }`}
                >
                  <span>{isPlayingListening ? '⏹ 停止' : '▶ 音声を聴く'}</span>
                </button>
              </div>

              <p className="text-xs text-[#71717A] italic leading-relaxed whitespace-pre-wrap">
                ボタンを押して会話音声を再生し、下の問いに答えてください。
              </p>
            </div>
          )}

          {/* Question Text */}
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold font-japanese whitespace-pre-wrap leading-relaxed">
              {currentQ.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-2.5 pt-2">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = answers[currentQ.id] === optIdx;

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, optIdx)}
                  className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-fast flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-[#18181B] text-white border-[#18181B] shadow-xs'
                      : 'bg-white hover:bg-[#FBFBF9] text-[#18181B] border-[#E5E5DF]'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 font-mono ${
                    isSelected ? 'bg-white text-[#18181B]' : 'bg-[#FBFBF9] text-[#71717A] border border-[#E5E5DF]'
                  }`}>
                    {optIdx + 1}
                  </span>
                  <span className="font-japanese">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Question Nav Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E5E5DF]">
            <button
              type="button"
              disabled={questionIndex === 0}
              onClick={() => setQuestionIndex(questionIndex - 1)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#71717A] hover:text-[#18181B] transition-fast cursor-pointer disabled:opacity-40"
            >
              {t('prevQuestion') || '← 前の問題'}
            </button>

            {questionIndex + 1 < currentQuestions.length ? (
              <button
                type="button"
                onClick={() => setQuestionIndex(questionIndex + 1)}
                className="px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#D94826] text-white text-xs font-bold transition-fast shadow-xs cursor-pointer"
              >
                {t('nextQuestion') || '次の問題 →'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitExam}
                className="px-5 py-2.5 rounded-xl bg-[#D94826] hover:bg-[#BF3B1C] text-white text-xs font-black transition-fast shadow-xs cursor-pointer"
              >
                {t('submitExam') || '試験を終了して採点する ✓'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 bg-white rounded-3xl border border-[#E5E5DF] text-center text-xs text-[#71717A]">
          この分野の問題がありません
        </div>
      )}
    </div>
  );
}
