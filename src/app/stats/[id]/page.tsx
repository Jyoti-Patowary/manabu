import connectDB from '@/lib/mongodb';
import Deck from '@/models/Deck';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function StatsPage({ params }: { params: Promise<{ id: string }> }) {
  // 2. Await the params before destructuring
  const { id } = await params;
  
  await connectDB();
  const deck = await Deck.findById(id).lean();
  
  if (!deck) return notFound();

  // Pacing & Mastery Math
  const targetDate = new Date('2026-12-06').getTime();
  const now = Date.now();
  const daysUntilExam = Math.max(1, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24)));

  const totalCardsCount = deck.cards.length || 0;
  const newCardsCount = deck.cards.filter((c: any) => c.repetitions === 0).length || 0;
  const maturedCardsCount = deck.cards.filter((c: any) => c.interval >= 21).length || 0; 
  const learningCardsCount = totalCardsCount - newCardsCount - maturedCardsCount;
  
  const dueTodayCount = deck.cards.filter((c: any) => c.dueDate <= now && c.repetitions > 0).length || 0;

  // The absolute minimum you must do per day to finish the deck before the exam
  const minimumCardsPerDay = Math.ceil(newCardsCount / daysUntilExam);

  return (
    <div className="max-w-md mx-auto px-4 py-6 font-sans text-slate-800 min-h-screen bg-slate-50">
      <Link href="/" className="text-blue-600 font-medium text-sm inline-flex items-center gap-1 active:opacity-75 mb-6">
        &larr; Back to Dashboard
      </Link>
      
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">{deck.name} Stats</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          JLPT N3 Target: Dec 6, 2026 (<span className="text-blue-600 font-bold">{daysUntilExam} days away</span>)
        </p>
      </div>

      <div className="space-y-5 pb-8">
        {/* Metric 1: Minimum Exam Pacing */}
        <div className="bg-blue-600 text-white rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🔥</div>
          <h3 className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-2">Minimum Target Pace</h3>
          <div className="flex items-end gap-3">
            <span className="text-6xl font-black">{minimumCardsPerDay}</span>
            <span className="text-sm font-semibold text-blue-100 pb-2">new cards / day</span>
          </div>
          <p className="text-xs text-blue-200 mt-3 font-medium">
            You must learn at least this many new cards daily to finish before your Dec 6 exam. Pushing past this number builds a safety buffer.
          </p>
        </div>

        {/* Metric 2: Deck Mastery */}
        <div className="border border-slate-200 bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Memory Retention</h3>
          
          <div className="h-4 w-full bg-slate-100 rounded-full flex overflow-hidden mb-5">
            <div style={{ width: `${(maturedCardsCount / totalCardsCount) * 100 || 0}%` }} className="bg-emerald-500 h-full transition-all" />
            <div style={{ width: `${(learningCardsCount / totalCardsCount) * 100 || 0}%` }} className="bg-amber-400 h-full transition-all" />
            <div style={{ width: `${(newCardsCount / totalCardsCount) * 100 || 0}%` }} className="bg-slate-200 h-full transition-all" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-black text-emerald-600">{maturedCardsCount}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Matured</p>
            </div>
            <div className="border-x border-slate-100">
              <p className="text-2xl font-black text-amber-500">{learningCardsCount}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Learning</p>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-400">{newCardsCount}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Unseen</p>
            </div>
          </div>
        </div>

        {/* Metric 3: Due Today */}
        <div className="border border-slate-200 bg-white rounded-3xl p-6 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Due Right Now</h3>
            <p className="text-sm font-medium text-slate-600">Cards waiting in your queue</p>
          </div>
          <span className="text-4xl font-black text-rose-500">{dueTodayCount}</span>
        </div>
      </div>
    </div>
  );
}