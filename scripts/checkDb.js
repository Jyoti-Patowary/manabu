require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
(async function(){
  try{
    await mongoose.connect(process.env.MONGODB_URI, {serverSelectionTimeoutMS:5000});
    const db = mongoose.connection.db;
    const cols = await db.listCollections().toArray();
    console.log('Collections:', cols.map(c=>c.name).join(', '));
    const cursor = db.collection('collections').find({});
    const all = await cursor.toArray();
    if(!all.length){ console.log('No collection documents found.'); await mongoose.disconnect(); return; }
    for(const c of all){
      console.log('\nCollection:', c.name, 'decks:', (c.decks||[]).length);
      for(const d of (c.decks||[])){
        console.log('  - Deck:', d.name, 'cards:', (d.cards||[]).length);
        const sample = (d.cards||[])[0] || null;
        if(sample) console.log('    sample keys:', Object.keys(sample).slice(0,40));
      }
    }
    await mongoose.disconnect();
  }catch(e){ console.error('DB check error:', e.message); process.exit(1); }
})();
