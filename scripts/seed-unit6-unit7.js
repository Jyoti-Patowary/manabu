import GrammarPoint from '../src/models/GrammarPoint.js';
import VocabEntry from '../src/models/VocabEntry.js';
import ExampleSentence from '../src/models/ExampleSentence.js';

// ====================================================
// UNIT 6: Lessons 25, 26, 27
// ====================================================
export async function seedUnit6(lessonDocs) {
  console.log('Seeding Unit 6: Lessons 25, 26, 27 (Desires, Experience, Ability)...');

  const l25 = lessonDocs[25];
  const l26 = lessonDocs[26];
  const l27 = lessonDocs[27];

  // ----------------------------------------------------
  // LESSON 25: Desires & Wants (〜たい, ほしい, 〜たがる)
  // ----------------------------------------------------
  const l25g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l25._id, order: 1 },
    {
      $set: {
        categoryType: 'grammar',
        title: 'Expressing Personal Desires (〜たい)',
        pattern: '[Verb ます-stem] + たい / たくない / たかった / たくなかった',
        formation: 'Drop ます from polite verb and attach たい: 食べる → 食べたい, 飲む → 飲みたい, 行く → 行きたい, する → したい, 来る → 来たい (きたい). Inflects like an い-adjective.',
        courseLevel: 'N5 Core',
        politenessLevel: 'Polite (〜たいです) & Casual (〜たい)',
        literalMeaning: 'Want to / Desire to do [Verb]',
        naturalMeaning: 'I want to [Verb]',
        whyItIsUsed: 'In Japanese, desires are internal psychological states rather than actions. Once you attach 〜たい to a verb stem, the resulting word functions and inflects grammatically like an い-adjective (たい, たくない, たかった, たくなかった). Furthermore, because it describes an internal emotional state, standard Japanese syntax permits marking the object with either を (objective focus) or が (desire focus): 水を飲みたい / 水が飲みたい.',
        wordBreakdown: [
          { japanese: '日本', reading: 'にほん', romaji: 'nihon', literal: 'Japan', role: 'Destination noun' },
          { japanese: 'へ', reading: 'え', romaji: 'e', literal: 'towards', role: 'Direction particle' },
          { japanese: '行き', reading: 'いき', romaji: 'iki', literal: 'go', role: 'Verb stem' },
          { japanese: 'たい', reading: 'たい', romaji: 'tai', literal: 'want to', role: 'Desire suffix' },
          { japanese: 'です', reading: 'です', romaji: 'desu', literal: 'is (polite)', role: 'Polite cushion' },
        ],
        explanation: 'Expresses the speaker\'s desire to perform an action.\n\n1. Morphological Transformation: Verb stem + たい creates a pseudo い-adjective. Negative: 〜たくない; Past: 〜たかった; Past Negative: 〜たくなかった.\n2. Particle Flexibility: The direct object of the original verb can be marked with either を or が (e.g. 水を飲みたいです ↔ 水が飲みたいです).\n3. Person Restriction: 〜たい expresses immediate internal feelings; it can only be used for the 1st person ("I want") or 2nd person in direct questions ("Do you want to?"). It CANNOT directly declare a 3rd person\'s desire.',
        usage: 'Use to express personal aspirations, travel plans, food choices, or leisure wishes.',
        whenToUse: 'Use when stating what you personally want to do, or asking what your conversational partner wants to do.',
        whenNotToUse: 'Do not use directly for third persons (*田中さんは行きたいです is unnatural; use 行きたがっている or 行きたいと言っています).',
        nuance: 'Marking the object with が highlights the desired item itself (水が飲みたい = "It is water that I want to drink").',
        beginnerTip: 'Treat 〜たい exactly like an い-adjective: drop い and add くない for negative!',
        commonMistakes: [
          { incorrect: '田中さんは日本へ行きたいです。', correct: '田中さんは日本へ行きたがっています。', explanation: 'Japanese avoids declaring another person\'s internal feelings directly. Use 〜たがっている for third persons.' },
        ],
        comparison: {
          target: 'First-Person (~たい) vs. Third-Person (~たがる)',
          comparisonPoints: [
            { label: '1st Person', itemA: '私は行きたい (I want to go - internal sensation)', itemB: '田中さんは行きたがっている (Tanaka wants to go - observed behavior)', explanation: '〜たい reflects direct internal consciousness; 3rd persons require outward behavioral observation.' },
          ],
        },
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l25g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l25._id, order: 2 },
    {
      $set: {
        categoryType: 'grammar',
        title: 'Desiring Objects (ほしい - Hoshii)',
        pattern: '[Noun] + が ほしい / ほしくない',
        formation: 'Noun + が + 欲しい (い-adjective). Negative: 欲しくない. Past: 欲しかった. Polite: 欲しいです.',
        courseLevel: 'N5 Core',
        literalMeaning: '[Noun] is desired / wanted',
        naturalMeaning: 'I want [Noun]',
        whyItIsUsed: 'While 〜たい expresses the desire to perform an action (want to DO), ほしい expresses the desire to possess a concrete entity (want a THING). Because ほしい is an adjective describing the quality of an object being desirable, the desired noun takes subject/focus particle が.',
        wordBreakdown: [
          { japanese: '新しい', reading: 'あたらしい', romaji: 'atarashii', literal: 'new', role: 'い-adjective' },
          { japanese: '自転車', reading: 'じてんしゃ', romaji: 'jitensha', literal: 'bicycle', role: 'Object noun' },
          { japanese: 'が', reading: 'が', romaji: 'ga', literal: 'subject focus', role: 'Particle' },
          { japanese: '欲しい', reading: 'ほしい', romaji: 'hoshii', literal: 'desired', role: 'い-adjective' },
          { japanese: 'です', reading: 'です', romaji: 'desu', literal: 'is (polite)', role: 'Copula' },
        ],
        explanation: 'Used when the speaker wants a tangible object, money, free time, or friends.\n\n1. Target Particle: The desired noun is marked with が (新しい車が欲しいです).\n2. Contrast with たい: 〜たい attaches to verbs (本を読みたい); ほしい attaches to nouns (本がほしい).\n3. 3rd Person Form: Just like 〜たい, ほしい cannot directly describe another person; use ほしがっている for 3rd persons.',
        usage: 'Use when expressing desire for possessions, gifts, or conditions.',
        whenToUse: 'Use to state things you wish you owned or received.',
        whenNotToUse: 'Do not use when offering something politely to a superior (use いかがですか instead of 欲しいですか).',
        nuance: 'Directly asking a superior 欲しいですか can sound blunt or presumptuous in Japanese etiquette.',
        beginnerTip: 'Remember: ほしい is for NOUNS, 〜たい is for VERBS!',
        commonMistakes: [
          { incorrect: '車を欲しいです。', correct: '車が欲しいです。', explanation: 'ほしい is an adjective, so the desired item is marked with particle が, not を.' },
        ],
        comparison: {
          target: 'Noun Desire (ほしい) vs. Action Desire (~たい)',
          comparisonPoints: [
            { label: 'Category', itemA: 'カメラが欲しい (I want a camera - Noun)', itemB: '写真を撮りたい (I want to take photos - Verb action)', explanation: 'ほしい expresses possession of an object; 〜たい expresses performance of an action.' },
          ],
        },
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l25g3 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l25._id, order: 3 },
    {
      $set: {
        categoryType: 'grammar',
        title: 'Third-Person Desires (〜たがる / ほしがる)',
        pattern: '[Verb ます-stem] + たがる / たがっている | [Noun] + を ほしがる',
        formation: 'Drop ます and append たがる (Godan verb conjugating like 作る). Progressive form: 〜たがっている.',
        courseLevel: 'N5 Core',
        literalMeaning: 'Shows signs of wanting to [Verb] / [Noun]',
        naturalMeaning: 'He/she wants to [Verb] / [Noun]',
        whyItIsUsed: 'Japanese epistemology draws a firm line between subjective internal experience (which only the self can feel) and objective external observation. The suffix 〜がる means "shows outward signs of feeling". Hence, 行きたがる means "acts like they want to go", which is polite, linguistically accurate, and culturally humble.',
        explanation: 'Used to describe the observable desires of third persons (children, friends, colleagues).\n\n1. Grammatical Shift: Conjugates as a regular Godan verb ending in る (たがる → たがらない → たがった).\n2. Object Particle Shift: With 〜たがる, the object particle reverts strictly to を (e.g. ジュースを飲みたがっている, never が).\n3. Reporting Alternative: Another natural way to report third-person desires is using quotation: 〜たいと言っています (He says he wants to...).',
        usage: 'Use when explaining why a friend or child is acting in a certain way.',
        whenToUse: 'Use when describing visible wants of another person.',
        whenNotToUse: 'Never use 〜たがる to describe your own desires (*私は行きたがる is incorrect).',
        nuance: 'The progressive 〜たがっている is the most natural form for describing current observable desires.',
        beginnerTip: 'Think of 〜がる as "acting like" or "showing signs of".',
        commonMistakes: [
          { incorrect: '子供がお菓子が欲しがっている。', correct: '子供がお菓子を欲しがっている。', explanation: 'With ほしがる and たがる, the target takes particle を, not が.' },
        ],
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l25Vocab = [
    { kanji: '旅行', kana: 'りょこう', romaji: 'ryokou', meanings: ['travel', 'trip'], naturalMeaning: 'travel / trip', literalMeaning: 'travel journey', pos: ['noun', 'suru verb'], seq: 1550920, cat: 'travel' },
    { kanji: '観光', kana: 'かんこう', romaji: 'kankou', meanings: ['sightseeing', 'tourism'], naturalMeaning: 'sightseeing / tourism', literalMeaning: 'viewing light/glory', pos: ['noun', 'suru verb'], seq: 1210210, cat: 'travel' },
    { kanji: 'お土産', kana: 'おみやげ', romaji: 'omiyage', meanings: ['souvenir', 'local specialty gift'], naturalMeaning: 'souvenir / local gift', literalMeaning: 'honorable product of the land', pos: ['noun'], seq: 1205620, cat: 'travel' },
    { kanji: 'ホテル', kana: 'ホテル', romaji: 'hoteru', meanings: ['hotel'], naturalMeaning: 'hotel', pos: ['noun'], seq: 1129520, cat: 'travel' },
    { kanji: '切符', kana: 'きっぷ', romaji: 'kippu', meanings: ['ticket'], naturalMeaning: 'ticket (train/bus)', literalMeaning: 'cut tally', pos: ['noun'], seq: 1388650, cat: 'travel' },
    { kanji: '飛行機', kana: 'ひこうき', romaji: 'hikouki', meanings: ['airplane'], naturalMeaning: 'airplane', literalMeaning: 'flying craft machine', pos: ['noun'], seq: 1489670, cat: 'transport' },
    { kanji: '空港', kana: 'くうこう', romaji: 'kuukou', meanings: ['airport'], naturalMeaning: 'airport', literalMeaning: 'sky harbor', pos: ['noun'], seq: 1238470, cat: 'transport' },
    { kanji: 'パスポート', kana: 'パスポート', romaji: 'pasupooto', meanings: ['passport'], naturalMeaning: 'passport', pos: ['noun'], seq: 1098550, cat: 'travel' },
    { kanji: '趣味', kana: 'しゅみ', romaji: 'shumi', meanings: ['hobby', 'pastime'], naturalMeaning: 'hobby / pastime', literalMeaning: 'taste / inclination', pos: ['noun'], seq: 1318040, cat: 'leisure' },
    { kanji: '音楽', kana: 'おんがく', romaji: 'ongaku', meanings: ['music'], naturalMeaning: 'music', literalMeaning: 'sound of joy', pos: ['noun'], seq: 1184980, cat: 'leisure' },
    { kanji: '歌', kana: 'うた', romaji: 'uta', meanings: ['song'], naturalMeaning: 'song', pos: ['noun'], seq: 1587660, cat: 'leisure' },
    { kanji: '歌う', kana: 'うたう', romaji: 'utau', meanings: ['to sing'], naturalMeaning: 'to sing', pos: ['godan verb'], seq: 1587670, cat: 'verbs' },
    { kanji: 'ギター', kana: 'ギター', romaji: 'gitaa', meanings: ['guitar'], naturalMeaning: 'guitar', pos: ['noun'], seq: 1042730, cat: 'leisure' },
    { kanji: '欲しい', kana: 'ほしい', romaji: 'hoshii', meanings: ['wanted', 'desired'], naturalMeaning: 'wanted / desirable', pos: ['i-adjective'], seq: 1538350, cat: 'adjectives' },
    { kanji: 'お金', kana: 'おかね', romaji: 'okane', meanings: ['money'], naturalMeaning: 'money', literalMeaning: 'honorable gold/metal', pos: ['noun'], seq: 1204640, cat: 'daily' },
    { kanji: '自転車', kana: 'じてんしゃ', romaji: 'jitensha', meanings: ['bicycle', 'bike'], naturalMeaning: 'bicycle', literalMeaning: 'self-turning vehicle', pos: ['noun'], seq: 1308890, cat: 'transport' },
  ];

  const l25VocabDocs = [];
  for (const v of l25Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, kanji: v.kanji, lessonId: l25._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          naturalMeaning: v.naturalMeaning,
          literalMeaning: v.literalMeaning,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: v.cat,
          romaji: v.romaji,
          jlptLevel: 'N5',
          courseLevel: 'N5 Core',
        },
      },
      { upsert: true, new: true }
    );
    l25VocabDocs.push(doc);
  }

  await VocabEntry.deleteMany({
    lessonId: l25._id,
    kanji: { $nin: l25Vocab.map((v) => v.kanji) },
  });

  const s251_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12501 },
    {
      $set: {
        japanese: '今年の夏休みは、友達と日本へ旅行に行きたいです。',
        furigana: 'ことしの なつやすみは、ともだちと にほんへ りょこうに いきたいです。',
        romaji: 'Kotoshi no natsuyasumi wa, tomodachi to Nihon e ryokou ni ikitai desu.',
        english: 'This summer vacation, I want to go on a trip to Japan with my friend.',
        naturalEnglish: 'This summer vacation, I want to travel to Japan with my friend.',
        breakdown: [
          { japanese: '旅行に行き', reading: 'りょこうにいき', romaji: 'ryokou ni iki', english: 'go on trip', role: 'Verb stem' },
          { japanese: 'たいです', reading: 'たいです', romaji: 'tai desu', english: 'want to (polite)', role: 'Desire suffix' },
        ],
        grammarNote: '〜たい attaches to verb stem 行き to express personal travel aspiration.',
        relatedGrammarId: l25g1._id,
        relatedVocabIds: [l25VocabDocs[0]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s251_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12502 },
    {
      $set: {
        japanese: '新しい自転車が欲しいですが、今はお金がありません。',
        furigana: 'あたらしい じてんしゃが ほしいですが、いまは おかねが ありません。',
        romaji: 'Atarashii jitensha ga hoshii desu ga, ima wa okane ga arimasen.',
        english: 'I want a new bicycle, but right now I don\'t have money.',
        naturalEnglish: 'I want a new bicycle, but I don\'t have money right now.',
        breakdown: [
          { japanese: '自転車が', reading: 'じてんしゃが', romaji: 'jitensha ga', english: 'bicycle (object of desire)', role: 'Target' },
          { japanese: '欲しいですが', reading: 'ほしいですが', romaji: 'hoshii desu ga', english: 'want, but...', role: 'Desire + Conjunction' },
        ],
        grammarNote: 'Desired object 自転車 takes particle が before ほしい.',
        relatedGrammarId: l25g2._id,
        relatedVocabIds: [l25VocabDocs[13]._id, l25VocabDocs[14]._id, l25VocabDocs[15]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s251_3 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12503 },
    {
      $set: {
        japanese: '弟はギターを習いたがっています。',
        furigana: 'おとうとは ギターを ならいたがっています。',
        romaji: 'Otouto wa gitaa o naraitagatte imasu.',
        english: 'My younger brother is showing signs of wanting to learn guitar.',
        naturalEnglish: 'My younger brother wants to learn to play the guitar.',
        breakdown: [
          { japanese: 'ギターを', reading: 'ギターを', romaji: 'gitaa o', english: 'guitar', role: 'Object' },
          { japanese: '習いたがっています', reading: 'ならいたがっています', romaji: 'naraitagatte imasu', english: 'wants to learn (3rd person)', role: 'Predicate' },
        ],
        grammarNote: '3rd person younger brother takes 〜たがっている with object particle を.',
        relatedGrammarId: l25g3._id,
        relatedVocabIds: [l25VocabDocs[12]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l25g1._id, { $set: { exampleSentenceIds: [s251_1._id] } });
  await GrammarPoint.findByIdAndUpdate(l25g2._id, { $set: { exampleSentenceIds: [s251_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l25g3._id, { $set: { exampleSentenceIds: [s251_3._id] } });

  // ----------------------------------------------------
  // LESSON 26: Past Experience & Listing Actions (〜たことがある, 〜たり〜たりする)
  // ----------------------------------------------------
  const l26g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l26._id, order: 1 },
    {
      $set: {
        categoryType: 'grammar',
        title: 'Past Lifetime Experience (〜たことがある)',
        pattern: '[Verb Plain Past (〜た)] + ことがある / ことがない',
        formation: 'Plain past verb (た-form) + ことがある. Negative: たことがない. Question: たことがありますか.',
        courseLevel: 'N5 Core',
        literalMeaning: 'The historical occasion/fact of having done [Verb] exists',
        naturalMeaning: 'I have had the experience of [Verb]-ing',
        whyItIsUsed: 'Japanese sharply distinguishes between a simple past event (昨日映画を見た - I watched a movie yesterday) and a lifetime existential experience (富士山に登ったことがある - I have climbed Mt. Fuji before). The word こと nominalizes the completed action ("the fact of climbing"), and ある declares that this milestone exists in your life resume.',
        wordBreakdown: [
          { japanese: '富士山に', reading: 'ふじさんに', romaji: 'Fujisan ni', literal: 'Mt. Fuji (target)', role: 'Location' },
          { japanese: '登った', reading: 'のぼった', romaji: 'nobotta', literal: 'climbed', role: 'Plain past verb' },
          { japanese: 'こと', reading: 'こと', romaji: 'koto', literal: 'tangible fact/matter', role: 'Nominalizer' },
          { japanese: 'が', reading: 'が', romaji: 'ga', literal: 'subject particle', role: 'Particle' },
          { japanese: 'あります', reading: 'あります', romaji: 'arimasu', literal: 'exists', role: 'Polite existence' },
        ],
        explanation: 'Used to ask about or state life experiences.\n\n1. General Lifetime Scope: Refers to whether an action has ever occurred at any point in one\'s past.\n2. Incompatible with Specific Recent Times: Never use with time adverbs like 昨日 (yesterday) or 先週 (last week).\n3. Emphatic Negation: Add も (一度も〜たことがない) to mean "have never done even once in my life".',
        usage: 'Use when sharing personal achievements, travel history, or asking conversation starters.',
        whenToUse: 'Use when discussing lifetime milestones (e.g. have you ever eaten fugu?).',
        whenNotToUse: 'Do not use for routine daily schedules (*今朝朝ご飯を食べたことがある is unnatural; just say 食べました).',
        nuance: 'Expresses whether an event exists on your experiential track record.',
        beginnerTip: 'Think of ことがある as: "There is an occasion in my past where I did this."',
        commonMistakes: [
          { incorrect: '昨日すしを食べたことがある。', correct: '昨日すしを食べました。', explanation: 'Do not use ことがある with specific recent past days like 昨日.' },
        ],
        comparison: {
          target: 'Lifetime Experience (~たことがある) vs. Simple Past (~た)',
          comparisonPoints: [
            { label: 'Time Scope', itemA: '日本へ行ったことがある (Lifetime experience: have been to Japan)', itemB: '去年日本へ行った (Specific historical event: went last year)', explanation: 'ことがある marks life milestones without tying them to a specific calendar moment.' },
          ],
        },
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l26g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l26._id, order: 2 },
    {
      $set: {
        categoryType: 'grammar',
        title: 'Non-Exhaustive Listing of Actions (〜たり〜たりする)',
        pattern: '[Verb A 〜た] + り + [Verb B 〜た] + りする',
        formation: 'Take the plain past 〜た form of each verb, append り, and conclude the clause with する (e.g. 掃除したり洗濯したりします). Tense and politeness are determined by the final する.',
        courseLevel: 'N5 Core',
        literalMeaning: 'Doing things like A, doing things like B, and so forth',
        naturalMeaning: 'Do things like A and B (among other activities)',
        whyItIsUsed: 'When listing actions with the て-form (V1て、V2て), Japanese implies that the actions took place in a strict, exhaustive chronological sequence. When you want to give illustrative examples of activities you did on a weekend without implying you only did those two things or did them in that exact order, 〜たり〜たりする is required.',
        wordBreakdown: [
          { japanese: '掃除したり', reading: 'そうじしたり', romaji: 'souji shitari', literal: 'doing cleaning and such', role: 'Representative action A' },
          { japanese: '洗濯したり', reading: 'せんたくしたり', romaji: 'sentaku shitari', literal: 'doing laundry and such', role: 'Representative action B' },
          { japanese: 'しました', reading: 'しました', romaji: 'shimashita', literal: 'did (past polite)', role: 'Auxiliary closing verb' },
        ],
        explanation: 'Creates a non-exhaustive sample of actions among many others.\n\n1. Tense at the End: The verbs before り remain in the 〜たり form regardless of past or future; the final する carries the sentence tense (〜たりします for habitual/future; 〜たりしました for past).\n2. Symmetry: Usually pairs two or three actions, followed by する.\n3. Also applies to adjectives (寒かったり暑かったりする - sometimes cold, sometimes hot).',
        usage: 'Use when describing how you spent your weekend, holiday, or leisure time.',
        whenToUse: 'Use when mentioning representative sample activities.',
        whenNotToUse: 'Do not use when the precise chronological sequence of steps is crucial (e.g. recipes or directions).',
        nuance: 'Implies: "I did things like this, among other activities that I won\'t bother listing exhaustively."',
        beginnerTip: 'Always remember to finish the whole sentence with する / します / しました!',
        commonMistakes: [
          { incorrect: '本を読んだり、音楽を聴いた。 (forgetting する)', correct: '本を読んだり、音楽を聴いたりした。', explanation: 'Every 〜たり pattern must include the concluding verb する.' },
        ],
        comparison: {
          target: 'Sequential (~て) vs. Representative (~たり~たりする)',
          comparisonPoints: [
            { label: 'Exhaustiveness', itemA: '朝ご飯を食べて、学校へ行きました (Ate, THEN went to school - strict order)', itemB: '散歩したり本を読んだりしました (Walked, read books, among other things)', explanation: '〜て lists chronological chains; 〜たり samples non-exhaustive activities.' },
          ],
        },
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l26Vocab = [
    { kanji: '富士山', kana: 'ふじさん', romaji: 'Fujisan', meanings: ['Mt. Fuji'], naturalMeaning: 'Mount Fuji', pos: ['proper noun'], seq: 1000601, cat: 'places' },
    { kanji: '登る', kana: 'のぼる', romaji: 'noboru', meanings: ['to climb', 'to ascend'], naturalMeaning: 'to climb / ascend', pos: ['godan verb'], seq: 1466020, cat: 'verbs' },
    { kanji: '温泉', kana: 'おんせん', romaji: 'onsen', meanings: ['hot spring', 'onsen'], naturalMeaning: 'hot spring', literalMeaning: 'warm fountain', pos: ['noun'], seq: 1186710, cat: 'leisure' },
    { kanji: '泊まる', kana: 'とまる', romaji: 'tomaru', meanings: ['to stay at (hotel, inn)'], naturalMeaning: 'to stay overnight', pos: ['godan verb'], seq: 1474470, cat: 'verbs' },
    { kanji: '乗る', kana: 'のる', romaji: 'noru', meanings: ['to ride', 'to board (train, bus)'], naturalMeaning: 'to ride / board', pos: ['godan verb'], seq: 1342670, cat: 'verbs' },
    { kanji: '一度', kana: 'いちど', romaji: 'ichido', meanings: ['once', 'one time'], naturalMeaning: 'once / one time', pos: ['adverb', 'noun'], seq: 1162460, cat: 'time' },
    { kanji: '一度も', kana: 'いちども', romaji: 'ichidomo', meanings: ['never (with negative)', 'not even once'], naturalMeaning: 'not even once (with neg)', pos: ['adverb'], seq: 1000602, cat: 'adverbs' },
    { kanji: 'スキー', kana: 'スキー', romaji: 'sukii', meanings: ['skiing', 'ski'], naturalMeaning: 'skiing', pos: ['noun', 'suru verb'], seq: 1064880, cat: 'sports' },
    { kanji: '掃除', kana: 'そうじ', romaji: 'souji', meanings: ['cleaning', 'sweeping'], naturalMeaning: 'cleaning', pos: ['noun', 'suru verb'], seq: 1378340, cat: 'daily' },
    { kanji: '洗濯', kana: 'せんたく', romaji: 'sentaku', meanings: ['laundry', 'washing clothes'], naturalMeaning: 'laundry', pos: ['noun', 'suru verb'], seq: 1389810, cat: 'daily' },
    { kanji: '散歩', kana: 'さんぽ', romaji: 'sanpo', meanings: ['walk', 'stroll'], naturalMeaning: 'walk / stroll', pos: ['noun', 'suru verb'], seq: 1300950, cat: 'leisure' },
    { kanji: '運動', kana: 'うんどう', romaji: 'undou', meanings: ['exercise', 'physical motion'], naturalMeaning: 'physical exercise / workout', literalMeaning: 'movement of luck/matter', pos: ['noun', 'suru verb'], seq: 1172810, cat: 'sports' },
    { kanji: '神社', kana: 'じんじゃ', romaji: 'jinja', meanings: ['Shinto shrine'], naturalMeaning: 'Shinto shrine', literalMeaning: 'god association', pos: ['noun'], seq: 1332840, cat: 'culture' },
    { kanji: '寺', kana: 'てら', romaji: 'tera', meanings: ['Buddhist temple'], naturalMeaning: 'Buddhist temple', pos: ['noun'], seq: 1316650, cat: 'culture' },
    { kanji: '祭り', kana: 'まつり', romaji: 'matsuri', meanings: ['festival'], naturalMeaning: 'festival', pos: ['noun'], seq: 1279140, cat: 'culture' },
    { kanji: '経験', kana: 'けいけん', romaji: 'keiken', meanings: ['experience'], naturalMeaning: 'experience', literalMeaning: 'passing through verification', pos: ['noun', 'suru verb'], seq: 1243160, cat: 'daily' },
  ];

  const l26VocabDocs = [];
  for (const v of l26Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, kanji: v.kanji, lessonId: l26._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          naturalMeaning: v.naturalMeaning,
          literalMeaning: v.literalMeaning,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: v.cat,
          romaji: v.romaji,
          jlptLevel: 'N5',
          courseLevel: 'N5 Core',
        },
      },
      { upsert: true, new: true }
    );
    l26VocabDocs.push(doc);
  }

  await VocabEntry.deleteMany({
    lessonId: l26._id,
    kanji: { $nin: l26Vocab.map((v) => v.kanji) },
  });

  const s261_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12601 },
    {
      $set: {
        japanese: '私は一度も富士山に登ったことがありません。',
        furigana: 'わたしは いちども ふじさんに のぼったことが ありません。',
        romaji: 'Watashi wa ichidomo Fujisan ni nobotta koto ga arimasen.',
        english: 'I have never climbed Mt. Fuji even once in my life.',
        naturalEnglish: 'I have never climbed Mount Fuji even once.',
        breakdown: [
          { japanese: '登ったことがありません', reading: 'のぼったことがありません', romaji: 'nobotta koto ga arimasen', english: 'have never climbed', role: 'Predicate' },
        ],
        grammarNote: '登った (past) + ことがありません expresses lifetime negative experience.',
        relatedGrammarId: l26g1._id,
        relatedVocabIds: [l26VocabDocs[0]._id, l26VocabDocs[1]._id, l26VocabDocs[6]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s261_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12602 },
    {
      $set: {
        japanese: '休みの日は、掃除したり洗濯したりして、部屋をきれいにします。',
        furigana: 'やすみの ひは、そうじしたり せんたくしたりして、へやを きれいにします。',
        romaji: 'Yasumi no hi wa, souji shitari sentaku shitari shite, heya o kirei ni shimasu.',
        english: 'On days off, I clean, do laundry, and make my room clean.',
        naturalEnglish: 'On my days off, I do things like cleaning and laundry to tidy up my room.',
        breakdown: [
          { japanese: '掃除したり', reading: 'そうじしたり', romaji: 'souji shitari', english: 'doing cleaning and such', role: 'Action A' },
          { japanese: '洗濯したりして', reading: 'せんたくしたりして', romaji: 'sentaku shitari shite', english: 'doing laundry and such', role: 'Action B + te-link' },
        ],
        grammarNote: '〜たり〜たり connects representative weekend tasks non-exhaustively.',
        relatedGrammarId: l26g2._id,
        relatedVocabIds: [l26VocabDocs[8]._id, l26VocabDocs[9]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l26g1._id, { $set: { exampleSentenceIds: [s261_1._id] } });
  await GrammarPoint.findByIdAndUpdate(l26g2._id, { $set: { exampleSentenceIds: [s261_2._id] } });

  // ----------------------------------------------------
  // LESSON 27: Ability & The Potential Form (可能形, 〜ことができる)
  // ----------------------------------------------------
  const l27g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l27._id, order: 1 },
    {
      $set: {
        categoryType: 'grammar',
        title: 'The Potential Verb Conjugation (可能形)',
        pattern: 'Godan: -u → -eる | Ichidan: drop る + られる | Irregular: する → できる, 来る → こられる',
        formation: 'Group 1 (Godan): 読む → 読める, 書く → 書ける, 話す → 話せる, 泳ぐ → 泳げる. Group 2 (Ichidan): 食べる → 食べられる, 見る → 見られる. Group 3 (Irreg): する → できる, くる → こられる.',
        courseLevel: 'N4 Foundation',
        literalMeaning: 'Is able to be [Verb]-ed / Capacity state',
        naturalMeaning: 'can [Verb] / able to [Verb]',
        whyItIsUsed: 'The Japanese potential form transforms an active, willful action into an intransitive description of capacity or possibility. Because the verb now describes the presence of an ability rather than the direct impact of an agent upon a target, the direct object particle を predominantly shifts to subject/focus particle が: 日本語を話す (I speak Japanese) → 日本語が話せる (I can speak Japanese / Japanese is speakable by me).',
        wordBreakdown: [
          { japanese: '日本語', reading: 'にほんご', romaji: 'Nihongo', literal: 'Japanese language', role: 'Target noun' },
          { japanese: 'が', reading: 'が', romaji: 'ga', literal: 'subject focus', role: 'Particle' },
          { japanese: '話せます', reading: 'はなせます', romaji: 'hanasemasu', literal: 'can speak (polite)', role: 'Potential verb' },
        ],
        explanation: 'Enables verbs to express capability, potential, or situational opportunity.\n\n1. Conjugation Rules:\n• Godan: Change final -u vowel to -e and add る (話す → 話せる).\n• Ichidan: Replace る with られる (食べる → 食べられる).\n• Irregular: する becomes できる; くる becomes こられる.\n2. Particle Shift: The direct object particle を usually shifts to が (漢字が読める).\n3. All potential verbs conjugate as Ichidan verbs (読める → 読めない → 読めます).',
        usage: 'Use to state languages you speak, instruments you play, sports you can do, or foods you can eat.',
        whenToUse: 'Use to declare your skills or ask someone if they can perform a task.',
        whenNotToUse: 'Do not confuse with passive verbs (which share the られる ending for Ichidan verbs).',
        nuance: 'Shifting を to が emphasizes that the language or skill is accessible to your capacity.',
        beginnerTip: 'Once a verb is converted to potential form, it always inflects like a Group 2 (Ichidan) verb!',
        commonMistakes: [
          { incorrect: '英語を話せます (less natural in standard formal contexts)', correct: '英語が話せます', explanation: 'Potential verbs predominantly take particle が for the target of ability.' },
        ],
        comparison: {
          target: 'Potential Form vs. Plain Action',
          comparisonPoints: [
            { label: 'Action vs. Ability', itemA: '漢字を書きます (I write kanji - voluntary action)', itemB: '漢字が書けます (I can write kanji - internal ability)', explanation: 'Action takes を; potential form describes capability and takes が.' },
          ],
        },
        jlptLevel: 'N4',
      },
    },
    { upsert: true, new: true }
  );

  const l27g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l27._id, order: 2 },
    {
      $set: {
        categoryType: 'grammar',
        title: 'Stating Ability with 〜ことができる',
        pattern: '[Verb Dictionary Form] + ことができる',
        formation: 'Dictionary form verb + こと (nominalizer) + ができる (is possible). Polite: ことができます.',
        courseLevel: 'N4 Foundation',
        literalMeaning: 'The act of [Verb]-ing is possible',
        naturalMeaning: 'can do [Verb] / capable of [Verb]',
        whyItIsUsed: 'Provides a regular, non-inflected alternative to potential verb conjugation. It is especially useful in formal contexts, official instructions, and when stating situational permissions (e.g. ここで写真を撮ることができます - You may take photos here).',
        explanation: 'Nominalizes any verb using こと and appends ができる.\n\n1. Grammatical Regularity: Works uniformly with all verbs without memorizing Godan vowel shifts.\n2. Formal Situations: Standard in public signage, museum rules, and business manuals.\n3. Preserves Original Particles: Unlike the potential conjugation which shifts を to が, 〜ことができる preserves the verb\'s original object particle (ピアノを弾くことができる).',
        usage: 'Use when reading public regulations or when speaking in formal presentations.',
        whenToUse: 'Use for official permission or regular statements of ability.',
        whenNotToUse: 'In fast casual conversation with friends, the short potential form (話せる) is much more natural.',
        nuance: 'Slightly more formal, objective, and deliberate than the conjugated potential form.',
        beginnerTip: 'Keep the original particle intact: [Noun + を + Verb辞書形] + ことができます.',
        comparison: {
          target: 'Conjugated Potential (話せる) vs. Analytical Form (話すことができる)',
          comparisonPoints: [
            { label: 'Register & Style', itemA: '日本語が話せる (Natural spoken ability)', itemB: '日本語を話すことができる (Formal / Analytical / Official)', explanation: 'Both convey ability; the conjugated form is common in speech, while ことができる is standard in formal prose.' },
          ],
        },
        jlptLevel: 'N4',
      },
    },
    { upsert: true, new: true }
  );

  const l27Vocab = [
    { kanji: '運転', kana: 'うんてん', romaji: 'unten', meanings: ['driving', 'operation'], naturalMeaning: 'driving (a car)', literalMeaning: 'carrying and turning', pos: ['noun', 'suru verb'], seq: 1172770, cat: 'transport' },
    { kanji: '弾く', kana: 'ひく', romaji: 'hiku', meanings: ['to play (string instrument, piano)'], naturalMeaning: 'to play (piano, guitar)', pos: ['godan verb'], seq: 1486790, cat: 'verbs' },
    { kanji: 'ピアノ', kana: 'ピアノ', romaji: 'piano', meanings: ['piano'], naturalMeaning: 'piano', pos: ['noun'], seq: 1102980, cat: 'music' },
    { kanji: '外国語', kana: 'がいこくご', romaji: 'gaikokugo', meanings: ['foreign language'], naturalMeaning: 'foreign language', literalMeaning: 'outside country language', pos: ['noun'], seq: 1207130, cat: 'languages' },
    { kanji: '英語', kana: 'えいご', romaji: 'eigo', meanings: ['English language'], naturalMeaning: 'English language', literalMeaning: 'heroic language', pos: ['noun'], seq: 1177690, cat: 'languages' },
    { kanji: '中国語', kana: 'ちゅうごくご', romaji: 'chuugokugo', meanings: ['Chinese language'], naturalMeaning: 'Chinese language', literalMeaning: 'middle kingdom language', pos: ['noun'], seq: 1423400, cat: 'languages' },
    { kanji: '通じる', kana: 'つうじる', romaji: 'tsuujiru', meanings: ['to be understood', 'to get through', 'to lead to'], naturalMeaning: 'to be understood / get through', pos: ['ichidan verb'], seq: 1447020, cat: 'verbs' },
    { kanji: '漢字', kana: 'かんじ', romaji: 'kanji', meanings: ['kanji', 'Chinese characters'], naturalMeaning: 'kanji', literalMeaning: 'Han characters', pos: ['noun'], seq: 1211110, cat: 'languages' },
    { kanji: '発音', kana: 'はつおん', romaji: 'hatsuon', meanings: ['pronunciation'], naturalMeaning: 'pronunciation', literalMeaning: 'emitting sound', pos: ['noun', 'suru verb'], seq: 1478710, cat: 'languages' },
    { kanji: '上手', kana: 'じょうず', romaji: 'jouzu', meanings: ['skillful', 'good at'], naturalMeaning: 'skillful / good at', literalMeaning: 'upper hand', pos: ['na-adjective', 'noun'], seq: 1341330, cat: 'adjectives' },
    { kanji: '下手', kana: 'へた', romaji: 'heta', meanings: ['unskillful', 'poor at'], naturalMeaning: 'poor at / unskillful', literalMeaning: 'lower hand', pos: ['na-adjective', 'noun'], seq: 1528640, cat: 'adjectives' },
    { kanji: '得意', kana: 'とくい', romaji: 'tokui', meanings: ["one's strong point", 'good at'], naturalMeaning: "one's strength / proud of", literalMeaning: 'acquiring will', pos: ['na-adjective', 'noun'], seq: 1438900, cat: 'adjectives' },
    { kanji: '苦手', kana: 'にがて', romaji: 'nigate', meanings: ["one's weak point", 'poor at'], naturalMeaning: "one's weak point / dislike doing", literalMeaning: 'bitter hand', pos: ['na-adjective', 'noun'], seq: 1269090, cat: 'adjectives' },
    { kanji: 'できる', kana: 'できる', romaji: 'dekiru', meanings: ['to be able to do', 'can do'], naturalMeaning: 'can do / is possible', pos: ['ichidan verb'], seq: 1008320, cat: 'verbs' },
    { kanji: '直す', kana: 'なおす', romaji: 'naosu', meanings: ['to fix', 'to repair', 'to correct'], naturalMeaning: 'to repair / correct', pos: ['godan verb'], seq: 1453210, cat: 'verbs' },
    { kanji: '練習', kana: 'れんしゅう', romaji: 'renshuu', meanings: ['practice', 'rehearsal'], naturalMeaning: 'practice / rehearsal', literalMeaning: 'drilling habits', pos: ['noun', 'suru verb'], seq: 1561080, cat: 'skills' },
  ];

  const l27VocabDocs = [];
  for (const v of l27Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, kanji: v.kanji, lessonId: l27._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          naturalMeaning: v.naturalMeaning,
          literalMeaning: v.literalMeaning,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: v.cat,
          romaji: v.romaji,
          jlptLevel: 'N4',
          courseLevel: 'N4 Foundation',
        },
      },
      { upsert: true, new: true }
    );
    l27VocabDocs.push(doc);
  }

  await VocabEntry.deleteMany({
    lessonId: l27._id,
    kanji: { $nin: l27Vocab.map((v) => v.kanji) },
  });

  const s271_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12701 },
    {
      $set: {
        japanese: '毎日練習したので、難しい漢字も読めるようになりました。',
        furigana: 'まいにち れんしゅうしたので、むずかしい かんじも よめるように なりました。',
        romaji: 'Mainichi renshuu shita node, muzukashii kanji mo yomeru you ni narimashita.',
        english: 'Because I practiced every day, I became able to read difficult kanji too.',
        naturalEnglish: 'Because I practiced daily, I am now able to read difficult kanji as well.',
        breakdown: [
          { japanese: '読める', reading: 'よめる', romaji: 'yomeru', english: 'can read (potential)', role: 'Potential verb' },
        ],
        grammarNote: '読む (Godan) inflects to 読める (potential) showing acquired capability.',
        relatedGrammarId: l27g1._id,
        relatedVocabIds: [l27VocabDocs[7]._id, l27VocabDocs[15]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s271_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12702 },
    {
      $set: {
        japanese: '母は英語を上手に話すことができます。',
        furigana: 'ははは えいごを じょうずに はなすことが できます。',
        romaji: 'Haha wa Eigo o jouzu ni hanasu koto ga dekimasu.',
        english: 'My mother can speak English skillfully.',
        naturalEnglish: 'My mother can speak English fluently.',
        breakdown: [
          { japanese: '話すことが', reading: 'はなすことが', romaji: 'hanasu koto ga', english: 'the act of speaking', role: 'Nominalized clause' },
          { japanese: 'できます', reading: 'できます', romaji: 'dekimasu', english: 'is possible', role: 'Ability predicate' },
        ],
        grammarNote: 'Verb 辞書形 + ことができる establishes polite formal capability.',
        relatedGrammarId: l27g2._id,
        relatedVocabIds: [l27VocabDocs[4]._id, l27VocabDocs[9]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l27g1._id, { $set: { exampleSentenceIds: [s271_1._id] } });
  await GrammarPoint.findByIdAndUpdate(l27g2._id, { $set: { exampleSentenceIds: [s271_2._id] } });

  console.log('✓ Unit 6 lessons (25-27), grammar points, and Tatoeba pairs seeded successfully.');
}

// ====================================================
// UNIT 7: Lessons 28, 29, 30
// ====================================================
export async function seedUnit7(lessonDocs) {
  console.log('Seeding Unit 7: Lessons 28, 29, 30 (Obligation, Advice, Explanation)...');

  const l28 = lessonDocs[28];
  const l29 = lessonDocs[29];
  const l30 = lessonDocs[30];

  // ----------------------------------------------------
  // LESSON 28: Obligation & Absence (〜なければならない, 〜なくてもいい)
  // ----------------------------------------------------
  const l28g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l28._id, order: 1 },
    {
      $set: {
        categoryType: 'grammar',
        title: 'Expressing Obligation (〜なければならない / 〜ないといけない)',
        pattern: '[Verb ない-stem] + なければならない / ないといけない',
        formation: 'Drop い from negative plain form (ない): 書かない → 書かなければならない (formal) / 書かないといけない (conversational). Polite: 〜なければなりません / 〜ないといけません.',
        courseLevel: 'N4 Foundation',
        literalMeaning: 'If one does not [Verb], it will not do / will not become right',
        naturalMeaning: 'must [Verb] / have to [Verb]',
        whyItIsUsed: 'Japanese avoids blunt imperative commands ("You must do this!"). Instead, obligation is philosophically expressed through a conditional double negative: "If you do not do X, things will not progress favorably." なければ (if not done) + ならない (it will not do). This linguistic modesty allows Japanese speakers to convey strong necessity while maintaining conversational decorum.',
        wordBreakdown: [
          { japanese: '薬を', reading: 'くすりを', romaji: 'kusuri o', literal: 'medicine (object)', role: 'Target' },
          { japanese: '飲まなければ', reading: 'のまなければ', romaji: 'nomanakereba', literal: 'if not drink', role: 'Negative conditional' },
          { japanese: 'なりません', reading: 'なりません', romaji: 'narimasen', literal: 'it will not do (polite)', role: 'Negative consequence' },
        ],
        explanation: 'Communicates obligations, duties, laws, and health necessities.\n\n1. The Double Negative Architecture: なければ (if not) + ならない (does not become right).\n2. Register Variations:\n• 〜なければなりません: Standard formal, objective rules, doctors to patients.\n• 〜ないといけません: Common spoken necessity, immediate personal duty.\n• 〜なきゃ / 〜なくちゃ: Highly casual colloquial abbreviations with peers.\n3. Applies equally to affirmative duties (must go) and negative prohibitions (must not do: 〜てはいけない).',
        usage: 'Use when talking about deadlines, legal obligations, doctor instructions, and daily chores.',
        whenToUse: 'Use when you or someone else has no choice but to do an action.',
        whenNotToUse: 'Do not use aggressively toward customers or clients; use softer requests like 〜てください or お願いいたします.',
        nuance: '〜なければならない implies an objective, external obligation; 〜ないといけない feels like a personal, pressing duty.',
        beginnerTip: 'Break it down mentally: "If I don\'t do it, no good!"',
        commonMistakes: [
          { incorrect: '行くなければならない (forgetting negative stem)', correct: '行かなければならない', explanation: 'Drop い from 行かない to get the stem 行かな- before adding ければ.' },
        ],
        comparison: {
          target: 'Formal (~なければならない) vs. Spoken (~ないといけない)',
          comparisonPoints: [
            { label: 'Register', itemA: '規則を守らなければなりません (Formal rule: must obey rules)', itemB: '早く帰らないといけない (Conversational: I have to head home now)', explanation: 'Both express "must"; 〜なければならない sounds official, while 〜ないといけない sounds practical and personal.' },
          ],
        },
        jlptLevel: 'N4',
      },
    },
    { upsert: true, new: true }
  );

  const l28g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l28._id, order: 2 },
    {
      $set: {
        categoryType: 'grammar',
        title: 'Absence of Obligation (〜なくてもいい)',
        pattern: '[Verb ない-stem] + くてもいい',
        formation: 'Drop い from negative plain form (ない), attach くてもいい: 行かない → 行かなくてもいい (Even if you don\'t go, it is fine). Polite: 〜なくてもいいです.',
        courseLevel: 'N4 Foundation',
        literalMeaning: 'Even if one does not [Verb], it is good',
        naturalMeaning: 'do not have to [Verb] / need not [Verb]',
        whyItIsUsed: 'Built on the permissive structure 〜てもいい ("it is okay to..."). By applying it to the negative stem, it literally means: "Even in the case where you do not perform the action, the situation remains acceptable." This relieves obligation without commanding.',
        wordBreakdown: [
          { japanese: '今日', reading: 'きょう', romaji: 'kyou', literal: 'today', role: 'Time' },
          { japanese: '払わなくても', reading: 'はらわなくても', romaji: 'harawanakutemo', literal: 'even if not pay', role: 'Negative permissive' },
          { japanese: 'いいです', reading: 'いいです', romaji: 'ii desu', literal: 'is fine/good', role: 'Approval' },
        ],
        explanation: 'Communicates that an action is optional or unnecessary.\n\n1. Formation: Verb ない stem + くてもいい.\n2. Contrast with Prohibition: 〜てはいけない means "must NOT do" (forbidden); 〜なくてもいい means "do NOT HAVE to do" (optional).\n3. Reassuring Tone: Frequently used to relieve anxiety or reassure someone that something is not mandatory.',
        usage: 'Use to tell friends, students, or visitors that something is optional.',
        whenToUse: 'Use when lifting an obligation or giving permission to skip a step.',
        whenNotToUse: 'Do not confuse with prohibition (〜てはいけない).',
        nuance: 'Provides relief and flexibility: "No need to worry about doing it."',
        beginnerTip: 'Think of it as: "Even without doing it, it\'s all good!"',
        comparison: {
          target: 'Absence of Obligation (~なくてもいい) vs. Prohibition (~てはいけない)',
          comparisonPoints: [
            { label: 'Freedom vs. Rule', itemA: '来なくてもいい (You don\'t have to come - optional)', itemB: '来てはいけない (You must not come - forbidden)', explanation: '〜なくてもいい gives freedom; 〜てはいけない forbids the action.' },
          ],
        },
        jlptLevel: 'N4',
      },
    },
    { upsert: true, new: true }
  );

  const l28Vocab = [
    { kanji: '薬', kana: 'くすり', romaji: 'kusuri', meanings: ['medicine', 'pharmaceuticals'], naturalMeaning: 'medicine', pos: ['noun'], seq: 1530960, cat: 'medical' },
    { kanji: '熱', kana: 'ねつ', romaji: 'netsu', meanings: ['fever', 'temperature', 'heat'], naturalMeaning: 'fever / body temperature', literalMeaning: 'heat', pos: ['noun'], seq: 1461940, cat: 'medical' },
    { kanji: '風邪', kana: 'かぜ', romaji: 'kaze', meanings: ['cold (illness)'], naturalMeaning: 'common cold (illness)', literalMeaning: 'wind evil', pos: ['noun'], seq: 1500730, cat: 'medical' },
    { kanji: '病気', kana: 'びょうき', romaji: 'byouki', meanings: ['illness', 'disease', 'sickness'], naturalMeaning: 'illness / disease', literalMeaning: 'sick energy', pos: ['noun'], seq: 1493030, cat: 'medical' },
    { kanji: '医者', kana: 'いしゃ', romaji: 'isha', meanings: ['doctor', 'physician'], naturalMeaning: 'doctor / physician', literalMeaning: 'medicine person', pos: ['noun'], seq: 1160350, cat: 'people' },
    { kanji: '休む', kana: 'やすむ', romaji: 'yasumu', meanings: ['to rest', 'to take time off', 'to be absent'], naturalMeaning: 'to take time off / rest', pos: ['godan verb'], seq: 1221770, cat: 'verbs' },
    { kanji: '保険証', kana: 'ほけんしょう', romaji: 'hokenshou', meanings: ['health insurance card'], naturalMeaning: 'health insurance card', literalMeaning: 'protection certificate', pos: ['noun'], seq: 1509140, cat: 'medical' },
    { kanji: '規則', kana: 'きそく', romaji: 'kisoku', meanings: ['rule', 'regulation'], naturalMeaning: 'rule / regulation', literalMeaning: 'standard rule', pos: ['noun'], seq: 1238800, cat: 'society' },
    { kanji: '法律', kana: 'ほうりつ', romaji: 'houritsu', meanings: ['law'], naturalMeaning: 'law', literalMeaning: 'method statute', pos: ['noun'], seq: 1524310, cat: 'society' },
    { kanji: '守る', kana: 'まもる', romaji: 'mamoru', meanings: ['to protect', 'to obey (rules)', 'to keep (promises)'], naturalMeaning: 'to obey (rules) / protect', pos: ['godan verb'], seq: 1332760, cat: 'verbs' },
    { kanji: '払う', kana: 'はらう', romaji: 'harau', meanings: ['to pay'], naturalMeaning: 'to pay', pos: ['godan verb'], seq: 1478140, cat: 'verbs' },
    { kanji: '渡す', kana: 'わたす', romaji: 'watasu', meanings: ['to hand over', 'to deliver'], naturalMeaning: 'to hand over / give', pos: ['godan verb'], seq: 1550180, cat: 'verbs' },
    { kanji: '見せる', kana: 'みせる', romaji: 'miseru', meanings: ['to show', 'to display'], naturalMeaning: 'to show / display', pos: ['ichidan verb'], seq: 1270270, cat: 'verbs' },
    { kanji: '提出', kana: 'ていしゅつ', romaji: 'teishutsu', meanings: ['submission', 'handing in'], naturalMeaning: 'submission / turning in', literalMeaning: 'presenting out', pos: ['noun', 'suru verb'], seq: 1427500, cat: 'daily' },
    { kanji: '期限', kana: 'きげん', romaji: 'kigen', meanings: ['deadline', 'time limit'], naturalMeaning: 'deadline / time limit', literalMeaning: 'period limit', pos: ['noun'], seq: 1238820, cat: 'daily' },
    { kanji: '無理', kana: 'むり', romaji: 'muri', meanings: ['impossible', 'overdoing it', 'unreasonable'], naturalMeaning: 'impossible / overdoing it', literalMeaning: 'without logic', pos: ['na-adjective', 'noun'], seq: 1536640, cat: 'adjectives' },
  ];

  const l28VocabDocs = [];
  for (const v of l28Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, kanji: v.kanji, lessonId: l28._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          naturalMeaning: v.naturalMeaning,
          literalMeaning: v.literalMeaning,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: v.cat,
          romaji: v.romaji,
          jlptLevel: 'N4',
          courseLevel: 'N4 Foundation',
        },
      },
      { upsert: true, new: true }
    );
    l28VocabDocs.push(doc);
  }

  await VocabEntry.deleteMany({
    lessonId: l28._id,
    kanji: { $nin: l28Vocab.map((v) => v.kanji) },
  });

  const s281_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12801 },
    {
      $set: {
        japanese: '熱があるので、病院へ行って薬をもらわなければなりません。',
        furigana: 'ねつが あるので、びょういんへ いって くすりを もらわなければ なりません。',
        romaji: 'Netsu ga aru node, byouin e itte kusuri o morawanakereba narimasen.',
        english: 'Because I have a fever, I must go to the hospital and get medicine.',
        naturalEnglish: 'Since I have a fever, I have to go to the hospital and get medicine.',
        breakdown: [
          { japanese: 'もらわなければなりません', reading: 'もらわなければなりません', romaji: 'morawanakereba narimasen', english: 'must receive/get', role: 'Obligation predicate' },
        ],
        grammarNote: 'Negative conditional form もらわなければ + なりません expresses health necessity.',
        relatedGrammarId: l28g1._id,
        relatedVocabIds: [l28VocabDocs[0]._id, l28VocabDocs[1]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s281_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12802 },
    {
      $set: {
        japanese: '明日は日曜日ですから、早く起きなくてもいいです。',
        furigana: 'あしたは にちようびですから、はやく おきなくても いいです。',
        romaji: 'Ashita wa nichiyoubi desu kara, hayaku okinakutemo ii desu.',
        english: 'Because tomorrow is Sunday, you don\'t have to wake up early.',
        naturalEnglish: 'Since tomorrow is Sunday, I don\'t have to wake up early.',
        breakdown: [
          { japanese: '起きなくてもいいです', reading: 'おきなくてもいいです', romaji: 'okinakutemo ii desu', english: 'do not have to wake up', role: 'Absence of obligation' },
        ],
        grammarNote: '〜なくてもいい relieves obligation on weekends.',
        relatedGrammarId: l28g2._id,
        relatedVocabIds: [l28VocabDocs[5]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l28g1._id, { $set: { exampleSentenceIds: [s281_1._id] } });
  await GrammarPoint.findByIdAndUpdate(l28g2._id, { $set: { exampleSentenceIds: [s281_2._id] } });

  // ----------------------------------------------------
  // LESSON 29: Advice & Recommendations (〜たほうがいい, 〜ないほうがいい)
  // ----------------------------------------------------
  const l29g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l29._id, order: 1 },
    {
      $set: {
        categoryType: 'grammar',
        title: 'Giving Affirmative Advice (〜たほうがいい)',
        pattern: '[Verb Plain Past (〜た)] + ほうがいい',
        formation: 'Plain past form (た-form) + ほうがいい (polite: ほうがいいです): 病院へ行ったほうがいい.',
        courseLevel: 'N4 Foundation',
        literalMeaning: 'The alternative/side of having done [Verb] is better',
        naturalMeaning: 'You had better [Verb] / It is advisable to [Verb]',
        whyItIsUsed: 'The noun ほう (方) means "direction" or "alternative" in a comparison. Using the past tense 〜た presents the recommended action as an already completed, concrete scenario compared against all other hypothetical options. "Between doing it and not doing it, the side where it is already done is superior." Because it strongly recommends a specific path, use with care when speaking to superiors.',
        wordBreakdown: [
          { japanese: 'もっと', reading: 'もっと', romaji: 'motto', literal: 'more', role: 'Adverb' },
          { japanese: '野菜を', reading: 'やさいを', romaji: 'yasai o', literal: 'vegetables', role: 'Object' },
          { japanese: '食べた', reading: 'たべた', romaji: 'tabeta', literal: 'ate', role: 'Past plain verb' },
          { japanese: 'ほうがいいです', reading: 'ほうがいいです', romaji: 'hou ga ii desu', literal: 'alternative is good', role: 'Advice formula' },
        ],
        explanation: 'Provides strong, concrete recommendations to someone facing a dilemma or health issue.\n\n1. Past Tense Mechanism: Always takes the past 〜た form for affirmative advice (薬を飲んだほうがいい).\n2. Strength of Advice: This is direct advice; if speaking to a superior or boss, soften with indirect phrasing like 〜てはいかがでしょうか.\n3. Comparison Root: Literally compares two paths (doing vs not doing) and selects the positive path.',
        usage: 'Use when advising friends, family, or colleagues on health, study habits, or travel.',
        whenToUse: 'Use to offer sincere practical guidance.',
        whenNotToUse: 'Do not use carelessly with superiors, as it implies you know what is better for them.',
        nuance: 'Clear and proactive: "If I were in your shoes, I would definitely do this."',
        beginnerTip: 'Remember: affirmative advice takes the PAST form (たほうがいい)!',
        commonMistakes: [
          { incorrect: '野菜を食べるほうがいい (present tense)', correct: '野菜を食べたほうがいい (past tense)', explanation: 'Affirmative advice requires the past 〜た form in standard Japanese.' },
        ],
        comparison: {
          target: 'Affirmative Advice (~たほうがいい) vs. Negative Advice (~ないほうがいい)',
          comparisonPoints: [
            { label: 'Tense Form', itemA: '早く寝たほうがいい (Affirmative: past た form)', itemB: '夜更かししないほうがいい (Negative: present ない form)', explanation: 'Affirmative advice uses past 〜た; negative advice uses present 〜ない.' },
          ],
        },
        jlptLevel: 'N4',
      },
    },
    { upsert: true, new: true }
  );

  const l29g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l29._id, order: 2 },
    {
      $set: {
        categoryType: 'grammar',
        title: 'Giving Negative Advice (〜ないほうがいい)',
        pattern: '[Verb Plain Negative (〜ない)] + ほうがいい',
        formation: 'Plain negative form (ない-form) + ほうがいい: 無理をしないほうがいい. Polite: 〜ないほうがいいです.',
        courseLevel: 'N4 Foundation',
        literalMeaning: 'The alternative of NOT doing [Verb] is better',
        naturalMeaning: 'You had better not [Verb] / It is best not to [Verb]',
        whyItIsUsed: 'In contrast to affirmative advice, negative advice pairs directly with the present negative 〜ない (NOT the past 〜なかった). "The choice of remaining without doing this action is the better course."',
        wordBreakdown: [
          { japanese: '無理を', reading: 'むりを', romaji: 'muri o', literal: 'impossible effort', role: 'Object' },
          { japanese: 'しない', reading: 'しない', romaji: 'shinai', literal: 'do not do', role: 'Negative plain' },
          { japanese: 'ほうがいいです', reading: 'ほうがいいです', romaji: 'hou ga ii desu', literal: 'side is better', role: 'Advice formula' },
        ],
        explanation: 'Used to advise someone against a harmful or counter-productive action.\n\n1. Present Negative Attachment: Attach directly to the plain negative form (飲まないほうがいい, 行かないほうがいい).\n2. Gentle Dissuasion: Warns against risks like overworking, eating too much salt, or staying up late.\n3. Common Contexts: Health warnings, lifestyle guidance, and safety advice.',
        usage: 'Use when cautioning someone not to strain themselves or make an error.',
        whenToUse: 'Use to steer someone away from an unwise choice.',
        whenNotToUse: 'Do not use past negative (*しなかったほうがいい means "it would have been better if you hadn\'t done it", expressing regret, not advice!).',
        nuance: 'Caring, protective advice against detrimental actions.',
        beginnerTip: 'Affirmative is 〜たほうがいい, but Negative is 〜ないほうがいい!',
        commonMistakes: [
          { incorrect: '無理をしなかったほうがいい (using past negative for advice)', correct: '無理をしないほうがいい', explanation: '〜しなかったほうがいい expresses regret about a past mistake ("you shouldn\'t have done that"), not forward-looking advice.' },
        ],
        jlptLevel: 'N4',
      },
    },
    { upsert: true, new: true }
  );

  const l29Vocab = [
    { kanji: '体', kana: 'からだ', romaji: 'karada', meanings: ['body', 'health'], naturalMeaning: 'body / physical health', pos: ['noun'], seq: 1428230, cat: 'body' },
    { kanji: '頭', kana: 'あたま', romaji: 'atama', meanings: ['head', 'mind', 'brain'], naturalMeaning: 'head / mind', pos: ['noun'], seq: 1468160, cat: 'body' },
    { kanji: 'お腹', kana: 'おなか', romaji: 'onaka', meanings: ['stomach', 'belly'], naturalMeaning: 'stomach / belly', pos: ['noun'], seq: 1002230, cat: 'body' },
    { kanji: '痛い', kana: 'いたい', romaji: 'itai', meanings: ['painful', 'sore', 'hurting'], naturalMeaning: 'painful / sore', pos: ['i-adjective'], seq: 1453280, cat: 'body' },
    { kanji: '心配', kana: 'しんぱい', romaji: 'shinpai', meanings: ['worry', 'concern', 'anxiety'], naturalMeaning: 'worry / concern', literalMeaning: 'heart distribution', pos: ['na-adjective', 'noun', 'suru verb'], seq: 1373970, cat: 'emotions' },
    { kanji: '健康', kana: 'けんこう', romaji: 'kenkou', meanings: ['health', 'healthy'], naturalMeaning: 'health / healthy', literalMeaning: 'strong peace', pos: ['na-adjective', 'noun'], seq: 1245030, cat: 'medical' },
    { kanji: '野菜', kana: 'やさい', romaji: 'yasai', meanings: ['vegetable'], naturalMeaning: 'vegetables', literalMeaning: 'field greens', pos: ['noun'], seq: 1391620, cat: 'food' },
    { kanji: '気をつける', kana: 'きをつける', romaji: 'ki o tsukeru', meanings: ['to be careful', 'to pay attention', 'to take care'], naturalMeaning: 'to be careful / take care', literalMeaning: 'to attach spirit/mind', pos: ['ichidan verb'], seq: 1000603, cat: 'verbs' },
    { kanji: '早く', kana: 'はやく', romaji: 'hayaku', meanings: ['early', 'quickly', 'soon'], naturalMeaning: 'early / quickly', pos: ['adverb'], seq: 1477790, cat: 'time' },
    { kanji: 'ゆっくり', kana: 'ゆっくり', romaji: 'yukkuri', meanings: ['slowly', 'leisurely', 'at ease'], naturalMeaning: 'slowly / leisurely / at ease', pos: ['adverb'], seq: 1014380, cat: 'adverbs' },
    { kanji: '十分', kana: 'じゅうぶん', romaji: 'juubun', meanings: ['enough', 'sufficient', 'plenty'], naturalMeaning: 'sufficiently / plenty / enough', literalMeaning: 'ten parts (full)', pos: ['na-adjective', 'adverb', 'noun'], seq: 1327170, cat: 'quantity' },
    { kanji: '睡眠', kana: 'すいみん', romaji: 'suimin', meanings: ['sleep'], naturalMeaning: 'sleep', literalMeaning: 'sleep slumber', pos: ['noun', 'suru verb'], seq: 1379370, cat: 'health' },
    { kanji: '甘い', kana: 'あまい', romaji: 'amai', meanings: ['sweet', 'sugary', 'lenient'], naturalMeaning: 'sweet', pos: ['i-adjective'], seq: 1188040, cat: 'food' },
    { kanji: '辛い', kana: 'からい', romaji: 'karai', meanings: ['spicy', 'hot', 'salty'], naturalMeaning: 'spicy / hot', pos: ['i-adjective'], seq: 1345470, cat: 'food' },
    { kanji: '塩', kana: 'しお', romaji: 'shio', meanings: ['salt'], naturalMeaning: 'salt', pos: ['noun'], seq: 1177000, cat: 'food' },
    { kanji: '砂糖', kana: 'さとう', romaji: 'satou', meanings: ['sugar'], naturalMeaning: 'sugar', literalMeaning: 'sand sugar', pos: ['noun'], seq: 1287170, cat: 'food' },
  ];

  const l29VocabDocs = [];
  for (const v of l29Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, kanji: v.kanji, lessonId: l29._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          naturalMeaning: v.naturalMeaning,
          literalMeaning: v.literalMeaning,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: v.cat,
          romaji: v.romaji,
          jlptLevel: 'N4',
          courseLevel: 'N4 Foundation',
        },
      },
      { upsert: true, new: true }
    );
    l29VocabDocs.push(doc);
  }

  await VocabEntry.deleteMany({
    lessonId: l29._id,
    kanji: { $nin: l29Vocab.map((v) => v.kanji) },
  });

  const s291_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12901 },
    {
      $set: {
        japanese: '頭が痛いなら、無理をしないで早く寝たほうがいいですよ。',
        furigana: 'あたまが いたたいなら、むりを しないで はやく ねたほうが いいですよ。',
        romaji: 'Atama ga itai nara, muri o shinaide hayaku neta hou ga ii desu yo.',
        english: 'If you have a headache, you shouldn\'t push yourself and had better go to sleep early.',
        naturalEnglish: 'If your head hurts, you shouldn\'t overdo it and had better get to sleep early.',
        breakdown: [
          { japanese: '無理をしないで', reading: 'むりをしないで', romaji: 'muri o shinaide', english: 'without pushing yourself', role: 'Negative condition' },
          { japanese: '寝たほうがいい', reading: 'ねたほうがいい', romaji: 'neta hou ga ii', english: 'better to sleep', role: 'Affirmative advice' },
        ],
        grammarNote: '寝た (past) + ほうがいい advises affirmative sleep; 無理をしないで counsels against strain.',
        relatedGrammarId: l29g1._id,
        relatedVocabIds: [l29VocabDocs[0]._id, l29VocabDocs[1]._id, l29VocabDocs[3]._id, l29VocabDocs[8]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s291_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12902 },
    {
      $set: {
        japanese: '健康のために、甘いものを食べすぎないほうがいいです。',
        furigana: 'けんこうの ために、あまいものを たべすぎないほうが いいです。',
        romaji: 'Kenkou no tame ni, amai mono o tabesuginai hou ga ii desu.',
        english: 'For the sake of your health, you had better not eat too many sweets.',
        naturalEnglish: 'For your health, it\'s best not to eat too many sugary foods.',
        breakdown: [
          { japanese: '食べすぎないほうがいい', reading: 'たべすぎないほうがいい', romaji: 'tabesuginai hou ga ii', english: 'had better not overeat', role: 'Negative advice' },
        ],
        grammarNote: 'Negative form 食べすぎない + ほうがいい advises against excessive consumption.',
        relatedGrammarId: l29g2._id,
        relatedVocabIds: [l29VocabDocs[5]._id, l29VocabDocs[12]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l29g1._id, { $set: { exampleSentenceIds: [s291_1._id] } });
  await GrammarPoint.findByIdAndUpdate(l29g2._id, { $set: { exampleSentenceIds: [s291_2._id] } });

  // ----------------------------------------------------
  // LESSON 30: Explanation & Conjecture (〜んです, 〜かもしれない, 〜でしょう)
  // ----------------------------------------------------
  const l30g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l30._id, order: 1 },
    {
      $set: {
        categoryType: 'grammar',
        title: 'The Explanatory Mode (〜んです / 〜のだ)',
        pattern: 'Verbs/い-adj: [Plain Form] + んです | Nouns/な-adj: [Stem] + なんです',
        formation: '食べる → 食べるんです, 痛い → 痛いんです, 休み → 休みなんです, 暇 → 暇なんです. Conversational contraction of 〜のです.',
        courseLevel: 'N4 Core',
        literalMeaning: 'It is the case that [Proposition]',
        naturalMeaning: 'The reason is that... / You see, ...',
        whyItIsUsed: 'One of the defining features of natural Japanese conversation. Rather than merely stating bare facts, 〜んです wraps the statement into a shared explanatory context. When asking questions (どうしたんですか - "What happened?"), it shows empathetic curiosity about background causes. When answering (頭が痛いんです - "I have a headache, you see"), it explains why you are grimacing or taking leave.',
        wordBreakdown: [
          { japanese: '電車が', reading: 'でんしゃが', romaji: 'densha ga', literal: 'train', role: 'Subject' },
          { japanese: '遅れた', reading: 'おくれた', romaji: 'okureta', literal: 'was delayed', role: 'Past plain verb' },
          { japanese: 'んです', reading: 'んです', romaji: 'n desu', literal: 'is the explanation', role: 'Explanatory wrapper' },
        ],
        explanation: 'Encloses statements within an explanatory framework.\n\n1. Inquiring (〜んですか): Asks for explanation based on what you observe (e.g. seeing someone packing luggage: 旅行に行くんですか - "Are you going on a trip?").\n2. Explaining (〜んです): Offers underlying reasons (e.g. arriving late: 事故があったんです - "There was an accident, you see").\n3. Noun / な-adjective Rule: Always use な instead of だ before んです (病気なんです, not 病気だんです).',
        usage: 'Use whenever explaining motives, excuses, causes, or inquiring about someone\'s situation.',
        whenToUse: 'Use when an explanation is expected, requested, or contextually relevant.',
        whenNotToUse: 'Do not use when simply stating disconnected objective neutral facts (e.g. news broadcasts use standard だ/です).',
        nuance: 'Creates interpersonal warmth and engagement by contextualizing why something occurred.',
        beginnerTip: 'Remember the bridge rule: Nouns and な-adjectives take なんです!',
        commonMistakes: [
          { incorrect: '雨だんです (Noun + だ + んです)', correct: '雨なんです (Noun + な + んです)', explanation: 'だ changes to な before んです/のです.' },
        ],
        comparison: {
          target: 'Factual Statement (です) vs. Explanatory Wrapper (〜んです)',
          comparisonPoints: [
            { label: 'Tone & Purpose', itemA: '頭が痛いです (Bare report: I have a headache)', itemB: '頭が痛いんです (Explanatory: I have a headache, you see - explains why I am leaving)', explanation: '〜んです signals that this fact serves as the background reason for current actions.' },
          ],
        },
        jlptLevel: 'N4',
      },
    },
    { upsert: true, new: true }
  );

  const l30g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l30._id, order: 2 },
    {
      $set: {
        categoryType: 'grammar',
        title: 'Expressing Possibility (〜かもしれない)',
        pattern: '[Plain Form] + かもしれない / かもしれません (drop だ for nouns/な-adj)',
        formation: 'Directly attach to plain forms: 雨が降るかもしれない, 休みかもしれない, 忙しいかもしれない. Drop だ for nouns/な-adjectives.',
        courseLevel: 'N4 Core',
        literalMeaning: 'It cannot be known whether [Proposition] (from 知れない)',
        naturalMeaning: 'might / may [Verb/Adjective/Noun]',
        whyItIsUsed: 'Expresses approximately a 50% chance of an event occurring. Derived from か (question) + も (even) + 知れない (cannot be known), meaning "one cannot even know if it might happen". It is a humble, open conjecture.',
        wordBreakdown: [
          { japanese: '約束に', reading: 'やくそくに', romaji: 'yakusoku ni', literal: 'to appointment', role: 'Target' },
          { japanese: '間に合わない', reading: 'まにあわない', romaji: 'maniawanai', literal: 'will not be in time', role: 'Negative plain' },
          { japanese: 'かもしれません', reading: 'かもしれません', romaji: 'kamoshiremasen', literal: 'might (polite)', role: 'Possibility suffix' },
        ],
        explanation: 'Indicates that something is possible without high certainty.\n\n1. Probability: Around 50-50 (might happen, might not).\n2. Attachment: Attaches directly to plain forms without だ.\n3. Casual Short Form: Commonly shortened to かも in everyday speech between friends.',
        usage: 'Use when foreseeing possible delays, weather shifts, or uncertainties.',
        whenToUse: 'Use when you suspect an outcome but cannot guarantee it.',
        whenNotToUse: 'Do not use when you are certain (use でしょう or に違いない instead).',
        nuance: 'Non-committal and cautious: "There is a realistic chance this might happen."',
        beginnerTip: 'In casual conversation, native speakers love shortening this to just かも!',
        comparison: {
          target: 'Possibility (~かもしれない - 50%) vs. Probability (~でしょう - 80%)',
          comparisonPoints: [
            { label: 'Confidence Level', itemA: '雨が降るかもしれない (Might rain - 50% chance)', itemB: '雨が降るでしょう (Probably will rain - 75-80% confidence)', explanation: 'かもしれない expresses open possibility; でしょう expresses reasonable probability.' },
          ],
        },
        jlptLevel: 'N4',
      },
    },
    { upsert: true, new: true }
  );

  const l30g3 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l30._id, order: 3 },
    {
      $set: {
        categoryType: 'grammar',
        title: 'Polite Conjecture (〜でしょう / 〜だろう)',
        pattern: '[Plain Form] + でしょう / だろう (drop だ for nouns/な-adj)',
        formation: 'Attach to plain forms: 明日は晴れるでしょう (polite) / 明日は晴れるだろう (casual). Nouns and な-adjectives attach directly without だ.',
        courseLevel: 'N4 Core',
        literalMeaning: 'It is probably the case that [Proposition]',
        naturalMeaning: 'probably / I suppose / right?',
        whyItIsUsed: 'Conveys approximately 70-80% confidence in a statement or weather forecast, softening the assertion and inviting the listener to share the supposition.',
        wordBreakdown: [
          { japanese: '明日は', reading: 'あしたは', romaji: 'ashita wa', literal: 'tomorrow', role: 'Topic' },
          { japanese: '台風が', reading: 'たいふうが', romaji: 'taifuu ga', literal: 'typhoon', role: 'Subject' },
          { japanese: '来るでしょう', reading: 'くるでしょう', romaji: 'kuru deshou', literal: 'will probably come', role: 'Conjecture predicate' },
        ],
        explanation: 'Expresses reasonable probability or seeks soft confirmation.\n\n1. Forecast Style: Ubiquitous in professional weather forecasts (明日は良い天気になるでしょう).\n2. Confirmation Tone: Spoken with rising intonation, it functions like English tag questions: "Isn\'t that right?" (いいでしょう？).\n3. Register: でしょう is polite; だろう is plain/casual.',
        usage: 'Use in weather predictions, polite suppositions, and friendly agreements.',
        whenToUse: 'Use when you are fairly confident but want to stay courteous and non-dogmatic.',
        whenNotToUse: 'Do not use when declaring direct undisputed personal facts about yourself.',
        nuance: 'Polite and objective: presents a likely scenario for mutual consideration.',
        beginnerTip: 'Notice the intonation: falling tone = "probably"; rising tone = "right?"',
        jlptLevel: 'N4',
      },
    },
    { upsert: true, new: true }
  );

  const l30Vocab = [
    { kanji: '都合', kana: 'つごう', romaji: 'tsugou', meanings: ['convenience', 'circumstances', 'schedule'], naturalMeaning: 'convenience / circumstances', literalMeaning: 'joining capital', pos: ['noun'], seq: 1443650, cat: 'society' },
    { kanji: '用事', kana: 'ようじ', romaji: 'youji', meanings: ['errand', 'business to attend to'], naturalMeaning: 'errand / business to do', literalMeaning: 'used matter', pos: ['noun'], seq: 1546940, cat: 'daily' },
    { kanji: '予定', kana: 'よてい', romaji: 'yotei', meanings: ['plan', 'schedule'], naturalMeaning: 'plan / schedule', literalMeaning: 'previous determination', pos: ['noun', 'suru verb'], seq: 1548680, cat: 'daily' },
    { kanji: '遅れる', kana: 'おくれる', romaji: 'okureru', meanings: ['to be late', 'to be delayed'], naturalMeaning: 'to be late / delayed', pos: ['ichidan verb'], seq: 1435880, cat: 'verbs' },
    { kanji: '間に合う', kana: 'まにあう', romaji: 'maniau', meanings: ['to be in time', 'to serve the purpose'], naturalMeaning: 'to be in time (for a train/class)', literalMeaning: 'to match the interval', pos: ['godan verb'], seq: 1530230, cat: 'verbs' },
    { kanji: '事故', kana: 'じこ', romaji: 'jiko', meanings: ['accident', 'incident'], naturalMeaning: 'accident / incident', literalMeaning: 'matter cause', pos: ['noun'], seq: 1302830, cat: 'society' },
    { kanji: '故障', kana: 'こしょう', romaji: 'koshou', meanings: ['breakdown', 'out of order', 'malfunction'], naturalMeaning: 'breakdown / malfunction', literalMeaning: 'cause hindrance', pos: ['noun', 'suru verb'], seq: 1280360, cat: 'daily' },
    { kanji: '台風', kana: 'たいふう', romaji: 'taifuu', meanings: ['typhoon'], naturalMeaning: 'typhoon', literalMeaning: 'great wind', pos: ['noun'], seq: 1412030, cat: 'weather' },
    { kanji: '地震', kana: 'じしん', romaji: 'jishin', meanings: ['earthquake'], naturalMeaning: 'earthquake', literalMeaning: 'earth quake', pos: ['noun'], seq: 1310930, cat: 'weather' },
    { kanji: '火事', kana: 'かじ', romaji: 'kaji', meanings: ['fire (conflagration)'], naturalMeaning: 'fire (incident)', literalMeaning: 'fire matter', pos: ['noun'], seq: 1195320, cat: 'society' },
    { kanji: '理由', kana: 'りゆう', romaji: 'riyuu', meanings: ['reason', 'cause'], naturalMeaning: 'reason', literalMeaning: 'logic reason', pos: ['noun'], seq: 1555510, cat: 'abstract' },
    { kanji: '原因', kana: 'げんいん', romaji: 'gen\'in', meanings: ['cause', 'origin'], naturalMeaning: 'cause / source', literalMeaning: 'source cause', pos: ['noun', 'suru verb'], seq: 1238460, cat: 'abstract' },
    { kanji: 'きっと', kana: 'きっと', romaji: 'kitto', meanings: ['surely', 'undoubtedly', 'certainly'], naturalMeaning: 'surely / almost certainly', pos: ['adverb'], seq: 1003780, cat: 'adverbs' },
    { kanji: 'もしかしたら', kana: 'もしかしたら', romaji: 'moshikashitara', meanings: ['perhaps', 'possibly'], naturalMeaning: 'perhaps / by any chance', pos: ['adverb'], seq: 1000604, cat: 'adverbs' },
    { kanji: '確か', kana: 'たしか', romaji: 'tashika', meanings: ['certain', 'sure', 'if I remember right'], naturalMeaning: 'certain / if I recall correctly', pos: ['na-adjective', 'adverb'], seq: 1464730, cat: 'adverbs' },
    { kanji: '残念', kana: 'ざんねん', romaji: 'zannen', meanings: ['regrettable', 'unfortunate', 'disappointing'], naturalMeaning: 'unfortunate / regrettable', literalMeaning: 'leftover thought', pos: ['na-adjective', 'noun'], seq: 1297590, cat: 'adjectives' },
  ];

  const l30VocabDocs = [];
  for (const v of l30Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, kanji: v.kanji, lessonId: l30._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          naturalMeaning: v.naturalMeaning,
          literalMeaning: v.literalMeaning,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: v.cat,
          romaji: v.romaji,
          jlptLevel: 'N4',
          courseLevel: 'N4 Core',
        },
      },
      { upsert: true, new: true }
    );
    l30VocabDocs.push(doc);
  }

  await VocabEntry.deleteMany({
    lessonId: l30._id,
    kanji: { $nin: l30Vocab.map((v) => v.kanji) },
  });

  const s301_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 13001 },
    {
      $set: {
        japanese: '事故で電車が遅れたので、会議に間に合わなかったんです。',
        furigana: 'じこで でんしゃが おくれたので、かいぎに まにあわなかったんです。',
        romaji: 'Jiko de densha ga okureta node, kaigi ni maniawanakatta n desu.',
        english: 'Because the train was delayed due to an accident, I didn\'t make it in time for the meeting (explanatory mode).',
        naturalEnglish: 'You see, the train was delayed by an accident, so I couldn\'t make it to the meeting in time.',
        breakdown: [
          { japanese: '間に合わなかったんです', reading: 'まにあわなかったんです', romaji: 'maniawanakatta n desu', english: 'could not make it in time (explanatory)', role: 'Explanatory predicate' },
        ],
        grammarNote: '〜んです provides the contextual justification for being late.',
        relatedGrammarId: l30g1._id,
        relatedVocabIds: [l30VocabDocs[3]._id, l30VocabDocs[4]._id, l30VocabDocs[5]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s301_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 13002 },
    {
      $set: {
        japanese: '台風が近づいていますから、午後は強い雨が降るかもしれません。',
        furigana: 'たいふうが ちかづいていますから、ごごは つよい あめが ふるかもしれません。',
        romaji: 'Taifuu ga chikazuite imasu kara, gogo wa tsuyoi ame ga furu kamoshiremasen.',
        english: 'Because a typhoon is approaching, it might rain heavily in the afternoon.',
        naturalEnglish: 'Since a typhoon is approaching, it might rain hard this afternoon.',
        breakdown: [
          { japanese: '降るかもしれません', reading: 'ふるかもしれません', romaji: 'furu kamoshiremasen', english: 'might fall (rain)', role: 'Possibility predicate' },
        ],
        grammarNote: '降る + かもしれません conveys cautious possibility based on approaching weather.',
        relatedGrammarId: l30g2._id,
        relatedVocabIds: [l30VocabDocs[7]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s301_3 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 13003 },
    {
      $set: {
        japanese: '明日はきっと天気が良くなるでしょう。',
        furigana: 'あしたは きっと てんきが よくなるでしょう。',
        romaji: 'Ashita wa kitto tenki ga yoku naru deshou.',
        english: 'The weather will surely become good tomorrow (polite forecast conjecture).',
        naturalEnglish: 'Tomorrow the weather will surely improve.',
        breakdown: [
          { japanese: '良くなるでしょう', reading: 'よくなるでしょう', romaji: 'yoku naru deshou', english: 'will probably become good', role: 'Conjecture predicate' },
        ],
        grammarNote: 'Conjecture suffix 〜でしょう paired with adverb きっと expresses confident prediction.',
        relatedGrammarId: l30g3._id,
        relatedVocabIds: [l30VocabDocs[12]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l30g1._id, { $set: { exampleSentenceIds: [s301_1._id] } });
  await GrammarPoint.findByIdAndUpdate(l30g2._id, { $set: { exampleSentenceIds: [s301_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l30g3._id, { $set: { exampleSentenceIds: [s301_3._id] } });

  console.log('✓ Unit 7 lessons (28-30), grammar points, and Tatoeba pairs seeded successfully.');
}
