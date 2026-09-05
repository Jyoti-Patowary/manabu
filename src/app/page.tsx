import connectDB from '@/lib/mongodb';
import Collection from '@/models/Collection';
import AnkiClient from '@/components/AnkiClient';
import { normalizeCollectionsForClient } from '@/lib/normalizeCollections';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  await connectDB();

  const collections = await Collection.find({}).sort({ createdAt: 1 }).lean();
  const structuredCollections = normalizeCollectionsForClient(collections || []);

  return <AnkiClient initialCollections={structuredCollections} />;
}