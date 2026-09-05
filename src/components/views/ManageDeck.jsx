import { useState } from 'react';
import { addCard, deleteCard, addBulkCards } from '@/app/actions';

export default function ManageDeck({ activeDeck, setView, initialFilter = '' }) {
  const [newKanji, setNewKanji] = useState('');
  const [newReading, setNewReading] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  
  // Set default category for Quick Add, and Pre-fill the Search query!
  const [newCategory, setNewCategory] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState(initialFilter); 
  const [jsonInput, setJsonInput] = useState('');

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newReading.trim() || !newMeaning.trim()) return;

    await addCard(activeDeck.id, {
      type: 'vocab',
      kanji: newKanji,
      reading: newReading,
      meaning: newMeaning,
      category: newCategory
    });

    setNewKanji(''); setNewReading(''); setNewMeaning(''); setNewCategory('');
    window.location.reload();
  };

  const handleDeleteCard = async (cardId) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    await deleteCard(activeDeck.id, cardId);
    window.location.reload();
  };

  const handleJsonPaste = async () => {
    if (!jsonInput.trim()) return;
    try {
      let parsedData = JSON.parse(jsonInput);
      if (!Array.isArray(parsedData) && !parsedData.cards) parsedData = [parsedData];

      const res = await addBulkCards(activeDeck.id, parsedData);
      if (res?.error) alert(res.error);
      else if (res?.success) {
        alert(`Successfully imported ${res.count} cards!`);
        setJsonInput('');
        window.location.reload();
      }
    } catch (error) {
      alert("Invalid JSON format.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        let parsedData = JSON.parse(event.target.result);
        if (!Array.isArray(parsedData) && !parsedData.cards) parsedData = [parsedData];

        const res = await addBulkCards(activeDeck.id, parsedData);
        if (res?.success) {
          alert(`Successfully imported ${res.count} cards!`);
          window.location.reload();
        }
      } catch (error) {
        alert("Invalid JSON format in file.");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const filteredCards = activeDeck?.cards.filter(card => {
    const query = searchQuery.toLowerCase();
    return (
      (card.kanji || '').toLowerCase().includes(query) ||
      (card.reading || '').toLowerCase().includes(query) ||
      (card.grammar || '').toLowerCase().includes(query) ||
      (card.meaning || '').toLowerCase().includes(query)
    );
  }) || [];

  return (
    <div>
      <button onClick={() => setView('dashboard')} className="text-blue-600 font-medium text-sm mb-4 inline-flex items-center gap-1 active:opacity-75">&larr; Back to Decks</button>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 truncate max-w-[220px]">{activeDeck.name}</h2>
        <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">{activeDeck.cards.length} Cards</span>
      </div>

      {/* Bulk JSON Import */}
      <div className="border border-slate-200 p-4 rounded-2xl mb-6 bg-slate-50 shadow-sm">
        <div className="mb-3 flex justify-between items-end">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Bulk Import (JSON)</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Paste raw JSON or upload a file</p>
          </div>
          <label className="bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold py-1.5 px-3 rounded-lg text-xs cursor-pointer transition border border-slate-300">
            Upload .json
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
        <textarea
          placeholder='[\n  {\n    "kanji": "私",\n    "reading": "わたし",\n    "meaning": "I; me"\n  }\n]'
          value={jsonInput}
          onChange={e => setJsonInput(e.target.value)}
          className="w-full border border-slate-300 bg-white p-3 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-none mb-3"
        />
        <button onClick={handleJsonPaste} className="bg-slate-800 active:bg-slate-900 text-white font-semibold py-2.5 rounded-xl w-full text-sm shadow-sm transition disabled:opacity-50" disabled={!jsonInput.trim()}>
          Import Pasted Data
        </button>
      </div>

      {/* Add Card Form */}
      <form onSubmit={handleAddCard} className="border border-slate-200 p-4 rounded-2xl mb-6 space-y-3 bg-white shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <input type="text" placeholder="Kanji (Optional)" value={newKanji} onChange={e => setNewKanji(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="text" placeholder="Reading (Hiragana)" value={newReading} onChange={e => setNewReading(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div className="grid grid-cols-1 gap-2">
          <input type="text" placeholder="Category (e.g., Office, Time, Grammar)" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <textarea placeholder="Meaning (English)" value={newMeaning} onChange={e => setNewMeaning(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 h-16 resize-none" required />
        <button type="submit" className="bg-blue-600 active:bg-blue-700 text-white font-semibold py-2.5 rounded-xl w-full text-sm shadow-sm transition">Add Card Manually</button>
      </form>

      {/* Search Bar */}
      <div className="mb-4 mt-6">
        <input
          type="text"
          placeholder="Search kanji, reading, or meaning..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full border border-slate-200 bg-white p-3 rounded-xl text-base outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* Cards List */}
      <div className="space-y-3 pb-6">
        {filteredCards.length === 0 ? (
          <p className="text-center text-slate-400 py-8 text-sm">No cards found.</p>
        ) : (
          filteredCards.map(card => (
            <div key={card.id} className="border border-slate-200 bg-white p-4 rounded-xl shadow-sm flex flex-col gap-3">
             <div className="grid grid-cols-1 gap-2">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">
                      {card.type === 'grammar' ? 'Grammar' : 'Japanese'}
                    </span>
                    <p className={`font-bold ${card.type === 'grammar' ? 'text-lg text-purple-700' : 'text-base text-slate-900'}`}>
                      {card.type === 'grammar' ? card.grammar : card.kanji} 
                      {card.type === 'vocab' && card.kanji && card.reading ? <span className="text-sm font-normal text-slate-500 ml-1">({card.reading})</span> : (card.type === 'vocab' ? card.reading : null)}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end max-w-[120px]">
                    {card.category && <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded">{card.category}</span>}
                    {card.jlpt && <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">{card.jlpt}</span>}
                  </div>
                </div>
                
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">Meaning</span>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">{card.meaning}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                <div className="flex gap-2 text-[11px] text-slate-500 font-medium">
                  <span>Rep: {card.repetitions}</span><span>•</span><span>Int: {card.interval}d</span>
                </div>
                <button onClick={() => handleDeleteCard(card.id)} className="text-rose-500 active:text-rose-700 text-xs font-semibold p-1">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}