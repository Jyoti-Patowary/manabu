import React from 'react';

/**
 * Visual badge to distinguish Katakana loanwords (外来語) of foreign origin
 */
export default function LoanwordBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs ${className}`}
      title="Foreign loanword (外来語) transcribed in Katakana"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
      <span>Loanword</span>
    </span>
  );
}
