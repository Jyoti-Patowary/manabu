#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const connectDB = require('../src/lib/mongodb.js').default || require('../src/lib/mongodb.js');

async function clearDb() {
  console.log('Connecting to MongoDB...');
  const mongoose = await connectDB();

  try {
    const db = mongoose.connection.db;
    const collections = ['collections', 'decks'];
    for (const name of collections) {
      try {
        const col = db.collection(name);
        const res = await col.deleteMany({});
        console.log(`Deleted ${res.deletedCount || 0} documents from collection: ${name}`);
      } catch (err) {
        // If collection doesn't exist, continue
        if (err.codeName === 'NamespaceNotFound' || /ns not found/.test(String(err))) {
          console.log(`Collection not found: ${name}`);
        } else {
          throw err;
        }
      }
    }
  } catch (err) {
    console.error('Error while clearing DB:', err);
    process.exitCode = 2;
  } finally {
    process.exit();
  }
}

if (require.main === module) {
  const confirm = process.argv.includes('--yes') || process.argv.includes('-y');
  if (!confirm) {
    console.log('This will DELETE all documents in the `collections` and `decks` collections.');
    console.log('If you are sure, re-run with --yes or -y to proceed.');
    process.exit(0);
  }
  clearDb();
}

module.exports = clearDb;
