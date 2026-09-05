require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
(async function(){
  try{
    await mongoose.connect(process.env.MONGODB_URI, {serverSelectionTimeoutMS:5000});
    const db = mongoose.connection.db;
    function printDeckSample(deckName){
      return db.collection('collections').findOne({'decks.name': deckName}, {projection:{'decks.$':1}})
        .then(doc=>{
          if(!doc || !doc.decks || !doc.decks[0]){
            console.log(deckName, 'not found');
            return;
          }
          const deck = doc.decks[0];
          console.log('\n==', deckName, 'cards:', (deck.cards||[]).length);
          if((deck.cards||[]).length) console.log(JSON.stringify(deck.cards[0], null, 2));
        });
    }
    await printDeckSample('N5 Kanji');
    await printDeckSample('N5 Grammar');
    await printDeckSample('N5 Vocabs');
    await mongoose.disconnect();
  }catch(e){ console.error(e); process.exit(1); }
})();
