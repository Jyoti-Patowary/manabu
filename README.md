# 学ぶ Manabu — JLPT Flashcard App with Spaced Repetition

A custom-built, full-stack flashcard app for studying Japanese vocabulary, 
kanji, and grammar for the JLPT — built as a personal Anki-style SRS tool, 
optimized for mobile study sessions.

🔗 **Live app:** [manabu-beta.vercel.app](https://manabu-beta.vercel.app) 
*(optimized for mobile — best viewed on a phone browser)*

## Key Features

- **Spaced Repetition System (SM-2 algorithm)** — `Again` / `Good` / `Easy` 
  review buttons calculate intervals, repetitions, and ease factors so 
  cards resurface right before you're likely to forget them
- **Virtual category decks** — automatically groups large vocab sets 
  (900+ N5 words) into clean sub-categories (Daily Life, People, etc.) 
  for bite-sized study sessions
- **Native Japanese text-to-speech** — built-in audio pronunciation on 
  every flashcard
- **Live JLPT exam countdown** — ticking down to exam day, keeping study 
  pace visible
- **Server Actions for data mutations** — `updateCardProgress`, 
  `addBulkCards`, and similar operations run securely on the server 
  while the UI stays fast and responsive on the client

## Tech stack
- **Frontend:** Next.js (App Router), TypeScript
- **Backend:** Next.js Server Actions
- **Database:** MongoDB + Mongoose
- **Deployment:** Vercel

## Running locally
\`\`\`bash
npm install
npm run dev
\`\`\`
Open http://localhost:3000 — note the UI is designed mobile-first, so 
use your browser's device emulation (or an actual phone) for the 
intended experience.

## Why I built this
Studying for the JLPT, I wanted an SRS tool tailored to my own vocab 
lists and pace rather than adapting Anki's generic interface — so I 
built the scheduling algorithm, deck structure, and review flow myself.
