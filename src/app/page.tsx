import connectDB from '@/lib/mongodb';
import Collection from '@/models/Collection';
import AnkiClient from '@/components/AnkiClient';
import { normalizeCollectionsForClient } from '@/lib/normalizeCollections';
import { getDefaultCollections } from '@/lib/defaultCollections';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let structuredCollections: any[] = [];
  let initialCurriculum: any[] = [];
  let initialDueCards: any[] = [];

  try {
    await connectDB();
    const collections = await Collection.find({}).sort({ createdAt: 1 }).lean();
    structuredCollections = normalizeCollectionsForClient(collections || []);

    const { getOrCreateDefaultUser, getCurriculumLessons, getDueUserCards } = await import('@/lib/courseEngine.js');
    const { user } = await getOrCreateDefaultUser();
    const lessons = await getCurriculumLessons(user._id);
    const dueCards = await getDueUserCards(user._id);
    initialCurriculum = JSON.parse(JSON.stringify(lessons || []));
    initialDueCards = JSON.parse(JSON.stringify(dueCards || []));
  } catch (error: any) {
    console.warn('MongoDB initial data note:', error?.message);
  }

  if (!structuredCollections || structuredCollections.length === 0) {
    structuredCollections = getDefaultCollections();
  }

  return (
    <AnkiClient
      initialCollections={structuredCollections}
      initialCurriculum={initialCurriculum}
      initialDueCards={initialDueCards}
    />
  );
}