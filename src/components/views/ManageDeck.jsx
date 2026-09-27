'use client';

import { useState } from 'react';
import { addCard, deleteCard, addBulkCards } from '@/app/actions';
import { useLanguage } from '@/context/LanguageContext';

export default function ManageDeck({ activeDeck, setView, initialFilter = '' }) {
  const { t } = useLanguage();
  const [newType, setNewType] = useState('vocab');
  const [newKanji, setNewKanji] = useState('');
  const [newReading, setNewReading] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newCategory, setNewCategory] = useState(initialFilter);
  const [newJlpt, setNewJlpt] = useState('N5');
  const [searchQuery, setSearchQuery] = useState(initialFilter); 
  const [jsonInput, setJsonInput] = useState('');
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newReading.trim() && !newKanji.trim()) return;

    try {
      setIsSubmitting(true);
      await addCard(activeDeck.id, {
        type: newType,
        kanji: newKanji.trim(),
        reading: newReading.trim(),
        meaning: newMeaning.trim(),
        category: newCategory.trim(),
        jlpt: newJlpt,
      });

      setNewKanji('');
      setNewReading('');
      setNewMeaning('');
      setNewCategory('');
      window.location.reload();
    } catch (err) {
      console.error('Failed to add card:', err);
      alert('Error adding card.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    try {
      await deleteCard(activeDeck.id, cardId);
      window.location.reload();
    } catch (err) {
      console.error('Failed to delete card:', err);
      alert('Error deleting card.');
    }
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

  const filteredCards = (activeDeck?.cards || []).filter(card => {
    const query = searchQuery.toLowerCase();
    return (
      (card.kanji || '').toLowerCase().includes(query) ||
      (card.reading || '').toLowerCase().includes(query) ||
      (card.grammar || '').toLowerCase().includes(query) ||
      (card.meaning || '').toLowerCase().includes(query) ||
      (card.category || '').toLowerCase().includes(query) ||
      (card.jlpt || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('dashboard')}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors"
            title={t('back')}
          >
            ←
          </button>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('deckSettingsTitle')}</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{activeDeck.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl">
            {activeDeck.cards?.length || 0} {t('cards')}
          </span>
          <button
            onClick={() => setIsBulkOpen(!isBulkOpen)}
            className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl transition-colors shadow-xs"
          >
            {isBulkOpen ? t('closeBulkImport') : t('bulkImportJson')}
          </button>
        </div>
      </div>

      {/* Bulk JSON Import */}
      {isBulkOpen && (
        <div className="border border-slate-200 p-5 rounded-2xl bg-white shadow-sm space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('bulkImportJson')}</h3>
              <p className="text-xs text-slate-500">{t('bulkImportDesc')}</p>
            </div>
            <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-3 rounded-xl text-xs cursor-pointer transition border border-slate-200 shadow-xs">
              {t('selectJsonFile')}
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            placeholder={`[\n  {\n    "type": "vocab",\n    "kanji": "日本語",\n    "reading": "にほんご",\n    "meaning": "Japanese language",\n    "jlpt": "N5",\n    "category": "language"\n  }\n]`}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl text-xs font-mono outline-none focus:border-slate-900 focus:bg-white h-32 resize-none"
          />

          <button
            onClick={handleJsonPaste}
            disabled={!jsonInput.trim()}
            className="w-full py-2.5 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-xs"
          >
            {t('importDataButton')}
          </button>
        </div>
      )}

      {/* Add Card Form */}
      <form onSubmit={handleAddCard} className="border border-slate-200 p-5 rounded-2xl space-y-4 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">{t('addNewCard')}</h2>
          <div className="flex items-center gap-1">
            {['vocab', 'kanji', 'grammar'].map((tt) => (
              <button
                key={tt}
                type="button"
                onClick={() => setNewType(tt)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  newType === tt ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tt === 'vocab' ? t('vocabPillar') : (tt === 'kanji' ? t('kanjiPillar') : t('grammarPillar'))}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              {newType === 'grammar' ? 'Grammar Point' : t('kanjiLabel')}
            </label>
            <input
              type="text"
              placeholder={newType === 'grammar' ? '〜ている' : '食べる'}
              value={newKanji}
              onChange={(e) => setNewKanji(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-xl text-xs outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              {t('readingLabel')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="たべる"
              value={newReading}
              onChange={(e) => setNewReading(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-xl text-xs outline-none focus:border-slate-900 focus:bg-white"
              required={newType !== 'grammar'}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('jlptLevelSelect')}</label>
            <select
              value={newJlpt}
              onChange={(e) => setNewJlpt(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-xl text-xs outline-none focus:border-slate-900 focus:bg-white font-bold"
            >
              <option value="N5">JLPT N5 ({t('beginner')})</option>
              <option value="N4">JLPT N4 ({t('elementary')})</option>
              <option value="N3">JLPT N3 ({t('intermediate')})</option>
              <option value="N2">JLPT N2 ({t('upperIntermediate')})</option>
              <option value="N1">JLPT N1 ({t('advanced')})</option>
              <option value="">None</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('categoryLabel')}</label>
            <input
              type="text"
              placeholder="e.g. Daily, Travel, Food"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-xl text-xs outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            {t('meaningLabel')} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="to eat"
            value={newMeaning}
            onChange={(e) => setNewMeaning(e.target.value)}
            className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-xl text-xs outline-none focus:border-slate-900 focus:bg-white"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? 'Adding...' : t('addCardButton')}
        </button>
      </form>

      {/* Cards List Section with Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">
            {t('registeredCards')} ({filteredCards.length})
          </h2>

          <div className="relative sm:w-72">
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="space-y-2.5 pb-12">
          {filteredCards.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
              {t('noCardsFound')}
            </div>
          ) : (
            filteredCards.map((card) => (
              <div
                key={card.id}
                className="bg-white border border-slate-200/90 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
                    {card.type === 'grammar' ? '文' : (card.type === 'kanji' ? '字' : '語')}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-slate-950 text-base font-japanese">
                        {card.type === 'grammar' ? card.grammar : (card.kanji || card.reading)}
                      </span>
                      {card.kanji && card.reading && (
                        <span className="text-xs text-slate-500 font-semibold font-japanese">
                          ({card.reading})
                        </span>
                      )}
                      {card.jlpt && (
                        <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          {card.jlpt}
                        </span>
                      )}
                      {card.category && (
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {card.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">{card.meaning}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-2">
                    <span>{t('repetitionsCount')}: {card.repetitions || 0}</span>
                    <span>•</span>
                    <span>{t('intervalCount')}: {card.interval || 0}d</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="text-rose-500 hover:text-rose-700 text-xs font-bold p-1 transition-colors cursor-pointer"
                  >
                    {t('deleteCard')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}