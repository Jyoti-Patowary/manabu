import connectDB from '@/lib/mongodb';
import Deck from '@/models/Deck';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type CardStats = {
  type?: string;
  category?: string;
  jlpt?: string;
  interval?: number;
  repetitions?: number;
  easeFactor?: number;
  dueDate?: number;
};

type DeckStats = {
  name: string;
  cards: CardStats[];
};

type BreakdownItem = {
  label: string;
  value: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const TARGET_DATE = new Date('2026-12-06T00:00:00').getTime();

export default async function StatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await connectDB();
  const deck = (await Deck.findById(id).lean()) as DeckStats | null;

  if (!deck) return notFound();

  const now = new Date().getTime();
  const cards = deck.cards || [];
  const totalCards = cards.length;
  const daysUntilExam = Math.max(1, Math.ceil((TARGET_DATE - now) / DAY_MS));

  const newCards = cards.filter((card) => (card.repetitions || 0) === 0).length;
  const matureCards = cards.filter((card) => (card.interval || 0) >= 21).length;
  const youngCards = Math.max(0, totalCards - newCards - matureCards);
  const dueNow = cards.filter((card) => (card.dueDate || 0) <= now && (card.repetitions || 0) > 0).length;
  const dueWeek = cards.filter((card) => {
    const dueDate = card.dueDate || 0;
    return dueDate > now && dueDate <= now + 7 * DAY_MS;
  }).length;

  const minimumCardsPerDay = Math.ceil(newCards / daysUntilExam);
  const completionPercent = getPercent(totalCards - newCards, totalCards);
  const masteryPercent = getPercent(matureCards, totalCards);
  const averageEase = getAverage(cards.map((card) => card.easeFactor || 0).filter(Boolean));
  const averageInterval = getAverage(cards.map((card) => card.interval || 0));
  const dailyNewTarget = Math.max(5, minimumCardsPerDay);
  const bufferDays = dailyNewTarget > 0 ? Math.max(0, daysUntilExam - Math.ceil(newCards / dailyNewTarget)) : 0;

  const typeBreakdown = toBreakdown(cards, (card) => normalizeLabel(card.type || 'other'));
  const jlptBreakdown = toBreakdown(cards, (card) => normalizeJlpt(card.jlpt || '未設定'));
  const categoryBreakdown = toBreakdown(cards, (card) => card.category || '未分類').slice(0, 5);
  const reviewForecast = buildReviewForecast(cards, now);

  return (
    <main className="min-h-screen bg-white px-4 py-6 font-sans text-slate-800">
      <div className="mx-auto w-full max-w-3xl">
        <header className="border-b border-slate-200 pb-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
            >
              <ArrowLeftIcon />
              戻る
            </Link>

            <div className="inline-flex items-center gap-2" aria-label="学ぶ">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-xs font-black text-white shadow-sm">
                学
              </span>
              <span className="text-xl font-black tracking-normal text-slate-950">学ぶ</span>
            </div>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">統計</p>
              <h1 className="mt-1 truncate text-3xl font-black tracking-tight text-slate-950">{deck.name}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                JLPT N3まで {daysUntilExam} 日 · {totalCards} カード
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatPill label="進捗" value={`${completionPercent}%`} />
              <StatPill label="成熟" value={`${masteryPercent}%`} tone="emerald" />
              <StatPill label="復習" value={dueNow} tone="rose" />
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-3 pt-6 md:grid-cols-3">
          <HeroMetric
            label="今日の目安"
            value={minimumCardsPerDay}
            unit="新規 / 日"
            detail={`毎日 ${dailyNewTarget} 枚なら約 ${bufferDays} 日の余裕`}
          />
          <MetricCard label="今すぐ復習" value={dueNow} detail="期限が来ているカード" tone="rose" />
          <MetricCard label="7日以内" value={dueWeek} detail="今週の復習予定" tone="sky" />
        </section>

        <section className="grid grid-cols-1 gap-3 pt-3 md:grid-cols-2">
          <Panel title="記憶ステージ">
            <SegmentedBar
              segments={[
                { label: '成熟', value: matureCards, className: 'bg-emerald-500' },
                { label: '学習中', value: youngCards, className: 'bg-amber-400' },
                { label: '未学習', value: newCards, className: 'bg-slate-300' },
              ]}
              total={totalCards}
            />
            <div className="mt-5 grid grid-cols-3 gap-2">
              <MiniMetric label="成熟" value={matureCards} tone="emerald" />
              <MiniMetric label="学習中" value={youngCards} tone="amber" />
              <MiniMetric label="未学習" value={newCards} />
            </div>
          </Panel>

          <Panel title="復習の質">
            <div className="grid grid-cols-2 gap-2">
              <MiniMetric label="平均Ease" value={averageEase.toFixed(2)} tone="sky" />
              <MiniMetric label="平均間隔" value={`${Math.round(averageInterval)}日`} />
            </div>
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>成熟率</span>
                <span>{masteryPercent}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-slate-950" style={{ width: `${masteryPercent}%` }} />
              </div>
            </div>
          </Panel>
        </section>

        <section className="grid grid-cols-1 gap-3 pt-3 md:grid-cols-2">
          <Panel title="復習予報">
            <div className="space-y-3">
              {reviewForecast.map((item) => (
                <ForecastRow key={item.label} item={item} maxValue={Math.max(...reviewForecast.map((row) => row.value), 1)} />
              ))}
            </div>
          </Panel>

          <Panel title="カード種類">
            <BreakdownList items={typeBreakdown} total={totalCards} />
          </Panel>
        </section>

        <section className="grid grid-cols-1 gap-3 pt-3 pb-10 md:grid-cols-2">
          <Panel title="JLPT">
            <BreakdownList items={jlptBreakdown} total={totalCards} />
          </Panel>

          <Panel title="カテゴリ">
            <BreakdownList items={categoryBreakdown} total={totalCards} emptyText="カテゴリがありません" />
          </Panel>
        </section>
      </div>
    </main>
  );
}

function getPercent(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

function getAverage(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalizeLabel(value: string) {
  const labels: Record<string, string> = {
    vocab: '語彙',
    grammar: '文法',
    kanji: '漢字',
    other: 'その他',
  };

  return labels[value.toLowerCase()] || value;
}

function normalizeJlpt(value: string) {
  return value.replace('JLPT_', '') || '未設定';
}

function toBreakdown(cards: CardStats[], getLabel: (card: CardStats) => string) {
  const counts = new Map<string, number>();

  cards.forEach((card) => {
    const label = getLabel(card);
    counts.set(label, (counts.get(label) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function buildReviewForecast(cards: CardStats[], now: number) {
  const labels = ['今日', '明日', '3日', '7日'];
  const limits = [0, 1, 3, 7];

  return labels.map((label, index) => {
    const start = index === 0 ? 0 : limits[index - 1] * DAY_MS;
    const end = limits[index] * DAY_MS;
    const value = cards.filter((card) => {
      const dueDate = card.dueDate || 0;
      if ((card.repetitions || 0) === 0) return false;
      if (index === 0) return dueDate <= now;
      return dueDate > now + start && dueDate <= now + end;
    }).length;

    return { label, value };
  });
}

function HeroMetric({ label, value, unit, detail }: { label: string; value: number; unit: string; detail: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm md:col-span-1">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-5xl font-black leading-none">{value}</span>
        <span className="pb-1 text-sm font-bold text-slate-300">{unit}</span>
      </div>
      <p className="mt-4 text-xs font-semibold leading-5 text-slate-400">{detail}</p>
    </article>
  );
}

function MetricCard({ label, value, detail, tone = 'slate' }: { label: string; value: number; detail: string; tone?: 'slate' | 'rose' | 'sky' }) {
  const tones = {
    slate: 'text-slate-950 bg-slate-100',
    rose: 'text-rose-700 bg-rose-50',
    sky: 'text-sky-700 bg-sky-50',
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}>
        <ChartIcon />
      </div>
      <p className="mt-4 text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{detail}</p>
    </article>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SegmentedBar({ segments, total }: { segments: { label: string; value: number; className: string }[]; total: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      {segments.map((segment) => (
        <div
          key={segment.label}
          className={`inline-block h-full transition-all ${segment.className}`}
          style={{ width: `${getPercent(segment.value, total)}%` }}
          title={`${segment.label}: ${segment.value}`}
        />
      ))}
    </div>
  );
}

function MiniMetric({ label, value, tone = 'slate' }: { label: string; value: number | string; tone?: 'slate' | 'rose' | 'sky' | 'emerald' | 'amber' }) {
  const tones = {
    slate: 'border-slate-100 bg-slate-50 text-slate-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
    sky: 'border-sky-100 bg-sky-50 text-sky-700',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
  };

  return (
    <div className={`rounded-lg border px-3 py-2 ${tones[tone]}`}>
      <p className="text-xs font-bold">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

function ForecastRow({ item, maxValue }: { item: BreakdownItem; maxValue: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-500">
        <span>{item.label}</span>
        <span>{item.value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-slate-950" style={{ width: `${getPercent(item.value, maxValue)}%` }} />
      </div>
    </div>
  );
}

function BreakdownList({ items, total, emptyText = 'データがありません' }: { items: BreakdownItem[]; total: number; emptyText?: string }) {
  if (items.length === 0) {
    return <p className="text-sm font-semibold text-slate-400">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-bold text-slate-500">
            <span className="truncate">{item.label}</span>
            <span>{item.value}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-slate-950" style={{ width: `${getPercent(item.value, total)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatPill({ label, value, tone = 'slate' }: { label: string; value: number | string; tone?: 'slate' | 'rose' | 'emerald' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600',
    rose: 'bg-rose-50 text-rose-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold ${tones[tone]}`}>
      <span className="text-slate-950">{value}</span>
      {label}
    </span>
  );
}

function ArrowLeftIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.5 19.5h15M7 16v-5M12 16V6M17 16v-8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
