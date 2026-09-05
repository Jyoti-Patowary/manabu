import { useState } from 'react';
import { updateCardProgress } from '@/app/actions';

export default function StudySession({ queue, deckId, setView }) {
  const [studyQueue, setStudyQueue] = useState(queue);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (studyQueue.length === 0) {
    return (
      <div className="text-center flex flex-col items-center justify-center min-h-[70dvh] px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-10 max-w-sm w-full">
          <div className="text-7xl mb-6 drop-shadow-md">🎉</div>
          <h2 className="text-3xl font-black mb-3 text-slate-900 tracking-tight">All caught up!</h2>
          <p className="text-slate-500 text-sm mb-10 font-medium leading-relaxed">Your brain is expanding. Check back later for more reviews.</p>
          <button onClick={() => setView('dashboard')} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-base px-8 py-4 rounded-2xl transition-transform active:scale-95 w-full shadow-xl shadow-slate-900/20">
            Back to Desk
          </button>
        </div>
      </div>
    );
  }

  const currentCard = studyQueue[currentCardIndex];
  const cardType = currentCard?.type || 'vocab';

  const handleReview = async (rating) => {
    await updateCardProgress(deckId, currentCard.id, rating);

    let updatedQueue = [...studyQueue];
    if (rating === 1) updatedQueue.push(currentCard);

    if (currentCardIndex + 1 < updatedQueue.length) {
      setStudyQueue(updatedQueue);
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      setView('dashboard');
      window.location.reload();
    }
  };

  const speakJapanese = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85; 
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col min-h-[85dvh] justify-between w-full animate-in slide-in-from-right-8 duration-300 overflow-auto">
      
      {/* Top Navigation & Progress */}
      <div className="flex justify-between items-center mb-4 px-4 mt-4 sm:px-0">
        <button onClick={() => setView('dashboard')} className="text-slate-400 hover:text-slate-700 font-bold text-sm transition-colors flex items-center gap-1.5 active:scale-95">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
          Desk
        </button>
        <div className="bg-slate-100 text-slate-500 font-extrabold text-[11px] uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">
          {currentCardIndex + 1} / {studyQueue.length}
        </div>
      </div>

      {/* The Physical Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className={`relative flex-1 flex flex-col px-4 py-10 mx-2 sm:mx-0 sm:p-10 rounded-[2rem] cursor-pointer transition-all duration-500 ease-out shadow-2xl ${
          !isFlipped 
            ? 'bg-gradient-to-br from-white to-slate-50/90 border border-slate-100 shadow-slate-200/70 active:scale-[0.98]' 
            : 'bg-white border-[1.5px] border-slate-100 shadow-slate-200/50 active:scale-[0.99]'
        }`}
        style={{
          maxHeight: 'calc(100vh - 220px)',
          overflow: 'auto'
        }}
      >
        {/* Card Badges */}
        <div className="flex justify-between items-start w-full mb-6 px-1">
          <div className="flex gap-2 flex-wrap">
            <span className="text-[10px] font-extrabold text-white bg-slate-900 px-3 py-1.5 rounded-full shadow-md shadow-slate-900/20">
              {currentCard.jlpt || 'Vocab'}
            </span>
            {currentCard.category && (
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                {currentCard.category}
              </span>
            )}
          </div>
          {isFlipped && currentCard.partOfSpeech && (
            <span className="text-[10px] font-bold text-slate-400 border border-slate-200 px-3 py-1.5 rounded-full">
              {currentCard.partOfSpeech}
            </span>
          )}
        </div>

        {/* Card Content */}
        <div className="flex-1 flex flex-col justify-center w-full">
          {!isFlipped ? (
            // --- FRONT OF CARD (PURE JAPANESE ONLY) ---
            <div className="text-center transform transition-transform hover:scale-105 duration-300 w-full px-1">
              <h2 className={`font-black tracking-tight drop-shadow-sm leading-tight break-words ${cardType === 'grammar' ? 'text-5xl sm:text-6xl text-purple-600 mb-8' : 'text-7xl sm:text-[5rem] text-slate-900 mb-0'}`}>
                {cardType === 'grammar' ? currentCard.grammar : (currentCard.kanji || currentCard.reading)}
              </h2>
              
              <div className="mt-10 flex justify-center">
                <span className="bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-full animate-pulse border border-slate-200/50">
                  Tap anywhere to flip
                </span>
              </div>
            </div>
            ) : (
            // --- BACK OF CARD (REVEAL EVERYTHING) ---
            <div className="text-left w-full space-y-6 pb-10 pr-2 custom-scrollbar animate-in fade-in zoom-in-95 duration-300">
              
              <div className="pb-5 border-b-2 border-slate-50">
                {/* Kanji/Grammar Header */}
                <h2 className={`font-black tracking-tight leading-tight break-words mb-2 ${cardType === 'grammar' ? 'text-4xl sm:text-5xl text-purple-600' : 'text-5xl sm:text-6xl text-slate-900'}`}>
                  {cardType === 'grammar' ? currentCard.grammar : (currentCard.kanji || currentCard.reading)}
                </h2>

                {/* English Meaning */}
                <p className="text-2xl font-bold text-blue-600 leading-snug">{currentCard.meaning}</p>

                {/* Detailed Reading Info (Kana & Romaji) */}
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  {currentCard.kanji && currentCard.reading && (
                    <span className="text-lg font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                      {currentCard.reading}
                    </span>
                  )}
                  {currentCard.romaji && (
                    <span className="text-sm font-medium tracking-widest uppercase text-slate-400">
                      {currentCard.romaji}
                    </span>
                  )}
                </div>
              </div>

              {/* GRAMMAR DETAILS */}
              {cardType === 'grammar' && (
                <div className="space-y-6">
                  {currentCard.formation && (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 block mb-2">Formation</span>
                      <p className="text-sm sm:text-base font-mono font-bold text-slate-700">{currentCard.formation}</p>
                    </div>
                  )}
                  
                  {currentCard.usage && (
                    <p className="text-base font-medium text-slate-600 leading-relaxed border-l-4 border-purple-200 pl-4 py-1">
                      {currentCard.usage}
                    </p>
                  )}

                  {currentCard.grammarExamples?.length > 0 && (
                    <div className="space-y-4 mt-6">
                      <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">Examples</span>
                      {currentCard.grammarExamples.map((ex, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/50">
                          <p className="text-lg font-bold text-slate-800 leading-snug">{ex.japanese}</p>
                          <p className="text-xs font-bold text-slate-400 mb-2">{ex.reading}</p>
                          <p className="text-sm italic font-medium text-slate-600">{ex.english}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    {currentCard.negative && (
                      <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                        <span className="text-[9px] uppercase tracking-widest font-extrabold text-rose-400 block mb-1.5">Negative</span>
                        <p className="text-sm text-rose-700 font-bold break-words">{currentCard.negative}</p>
                      </div>
                    )}
                    {currentCard.past && (
                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                        <span className="text-[9px] uppercase tracking-widest font-extrabold text-emerald-400 block mb-1.5">Past</span>
                        <p className="text-sm text-emerald-700 font-bold break-words">{currentCard.past}</p>
                      </div>
                    )}
                    {currentCard.pastNegative && (
                      <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 col-span-2">
                        <span className="text-[9px] uppercase tracking-widest font-extrabold text-purple-400 block mb-1.5">Past Negative</span>
                        <p className="text-sm text-purple-700 font-bold break-words">{currentCard.pastNegative}</p>
                      </div>
                    )}
                  </div>
                  
                  {currentCard.formalAlternative && (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mt-4">
                      <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 block mb-2">Formal Alternative</span>
                      <p className="text-base font-bold text-slate-800">{currentCard.formalAlternative}</p>
                    </div>
                  )}

                  {currentCard.commonMistake && (
                    <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 mt-4 flex gap-3 items-start">
                      <span className="text-xl">⚠️</span>
                      <p className="text-sm font-bold text-amber-900 leading-relaxed">{currentCard.commonMistake}</p>
                    </div>
                  )}
                </div>
              )}

              {/* VOCAB DETAILS */}
              {cardType === 'vocab' && (
                <div className="space-y-6">
                  {currentCard.example && (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
                      <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 block mb-1">Example</span>
                      <p className="text-lg font-bold text-slate-800 leading-snug">{currentCard.example}</p>
                      <p className="text-xs font-bold text-slate-400">{currentCard.exampleReading}</p>
                      <p className="text-sm font-medium italic text-slate-600 mt-3">{currentCard.exampleMeaning}</p>
                    </div>
                  )}

                  {currentCard.tags?.length > 0 && (
                    <div className="flex gap-2.5 flex-wrap pt-3">
                      {currentCard.tags.map((tag, idx) => (
                        <span key={idx} className="bg-white border border-slate-200 text-slate-400 font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Audio Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            const textToRead = currentCard.example || currentCard.kanji || currentCard.reading || currentCard.grammar;
            speakJapanese(textToRead);
          }}
          className="absolute bottom-6 right-5 sm:right-6 bg-white border border-slate-100 w-14 h-14 flex items-center justify-center rounded-full text-2xl shadow-xl shadow-slate-200/60 hover:bg-blue-50 hover:scale-110 active:scale-95 transition-all z-10"
        >
          🔊
        </button>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 px-4 mb-6 sm:px-0">
        {isFlipped ? (
          <div className="grid grid-cols-3 gap-3 animate-in slide-in-from-bottom-4 duration-300">
            <button onClick={() => handleReview(1)} className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-black py-4 sm:py-5 rounded-[1.5rem] shadow-sm transition-transform active:scale-95 text-base sm:text-lg">Again</button>
            <button onClick={() => handleReview(2)} className="bg-amber-100 hover:bg-amber-200 text-amber-700 font-black py-4 sm:py-5 rounded-[1.5rem] shadow-sm transition-transform active:scale-95 text-base sm:text-lg">Good</button>
            <button onClick={() => handleReview(3)} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-black py-4 sm:py-5 rounded-[1.5rem] shadow-sm transition-transform active:scale-95 text-base sm:text-lg">Easy</button>
          </div>
        ) : (
          <button onClick={() => setIsFlipped(true)} className="bg-slate-900 hover:bg-slate-800 text-white font-bold tracking-wide py-5 w-full rounded-[1.5rem] shadow-xl shadow-slate-900/20 transition-transform active:scale-95 text-lg">
            Reveal Answer
          </button>
        )}
      </div>
    </div>
  );
}