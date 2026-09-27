# DATA SOURCES & ATTRIBUTIONS

This document lists the open-source and public datasets utilized by Manabu for vocabulary, kanji, grammar references, and example sentences.

---

## 1. JMdict (Japanese-English Electronic Dictionary)
- **Source**: Electronic Dictionary Research and Development Group (EDRDG)
- **Author**: Jim Breen and the EDRDG team
- **URL**: [https://www.edrdg.org/jmdict/j_jmdict.html](https://www.edrdg.org/jmdict/j_jmdict.html)
- **License**: Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)
- **Usage**: Source of canonical Japanese headwords, kanji/kana orthography, English glosses, parts of speech, and JMdict sequence numbers (`jmdictSeq`).

---

## 2. KANJIDIC2 (Japanese Kanji Dictionary Database)
- **Source**: Electronic Dictionary Research and Development Group (EDRDG)
- **Author**: Jim Breen and the EDRDG team
- **URL**: [https://www.edrdg.org/wiki/index.php/KANJIDIC_Project](https://www.edrdg.org/wiki/index.php/KANJIDIC_Project)
- **License**: Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)
- **Usage**: Kanji characters, On'yomi and Kun'yomi readings, English meanings, stroke counts, radical components, and educational school grades.

---

## 3. Tatoeba Project (Example Sentence Pairs)
- **Source**: Tatoeba.org community database
- **URL**: [https://tatoeba.org/](https://tatoeba.org/)
- **License**: Creative Commons Attribution 2.0 France (CC BY 2.0 FR)
- **Usage**: Japanese-English example sentence pairs mapped to specific vocabulary entries (`relatedVocabIds`) and grammar points (`relatedGrammarId`) with corresponding Tatoeba sentence IDs (`tatoebaId`).

---

## 4. JLPT Open-Data Reference Tags (Secondary Metadata)
- **Source**: Open-source JLPT vocabulary and kanji frequency lists
- **License**: MIT / Creative Commons
- **Usage**: Used strictly as secondary search/filtering tags (`jlptLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'`). Never used as the primary organizing structure for curriculum lessons.

---

## 5. Tae Kim's Guide to Japanese Grammar
- **Source**: "A Guide to Japanese Grammar" by Tae Kim
- **URL**: [http://www.guidetojapanese.org/learn/](http://www.guidetojapanese.org/learn/)
- **License**: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported (CC BY-NC-SA 3.0)
- **Usage**: Used as structural reference for pedagogical sequencing of grammatical concepts. All explanations and formulations written within Manabu are originally synthesized.
