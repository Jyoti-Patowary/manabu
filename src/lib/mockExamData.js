/**
 * src/lib/mockExamData.js
 * Comprehensive JLPT Mock Exam Simulation Bank (N5 to N1):
 * - Sections:
 *   1. vocab (文字・語彙): Kanji reading, orthography, contextual fit
 *   2. grammar (文法): Form selection, sentence unscrambling (*), cloze
 *   3. reading (読解): Short/medium passage comprehension
 *   4. listening (聴解): Spoken Japanese audio cues & dialogues with question prompts
 * - Scoring & official JLPT pass criteria evaluation
 */

export const JLPT_EXAM_DURATIONS = {
  N5: 50 * 60, // 50 mins in seconds
  N4: 60 * 60,
  N3: 70 * 60,
  N2: 80 * 60,
  N1: 90 * 60,
};

export const MOCK_EXAMS = {
  N5: {
    level: 'N5',
    title: 'JLPT N5 総合模擬試験 (Full Mock Exam)',
    durationSeconds: 3000, // 50 mins
    passingScoreOverall: 80, // out of 180 (approx 44%)
    passingScoreSection: 19, // out of 60 per section
    sections: {
      vocab: [
        {
          id: 'n5-v1',
          question: '次の下線の言葉の読み方を一つ選んでください。\n毎朝、新聞を__読みます__。',
          options: ['のみます', 'よみます', 'たべます', 'ききます'],
          correctIndex: 1,
          explanation: '「読」は「よ（みます）」と読みます。新聞を読む＝read the newspaper。',
          points: 10,
        },
        {
          id: 'n5-v2',
          question: '次の下線の言葉の読み方を一つ選んでください。\n机の上に__本__があります。',
          options: ['き', 'ほん', 'みず', 'かね'],
          correctIndex: 1,
          explanation: '「本」は「ほん」と読みます。',
          points: 10,
        },
        {
          id: 'n5-v3',
          question: '次の言葉の漢字を一つ選んでください。\n昨日はあめが__ふりました__。',
          options: ['降りました', '吹きました', '晴れました', '曇りました'],
          correctIndex: 0,
          explanation: '雨が降る＝雨がふります。漢字は「降」です。',
          points: 10,
        },
        {
          id: 'n5-v4',
          question: '文の（　）に入れるのに最もよいものを一つ選んでください。\n図書館はとても（　）です。',
          options: ['にぎやか', 'しずか', 'あかるい', 'たかい'],
          correctIndex: 1,
          explanation: '図書館は本を読む場所なので「静か（しずか）」が最も適切です。',
          points: 15,
        },
        {
          id: 'n5-v5',
          question: '文の（　）に入れるのに最もよいものを一つ選んでください。\nきのう、デパートで新しい靴を（　）。',
          options: ['かいました', 'たべました', 'いきました', 'のみました'],
          correctIndex: 0,
          explanation: '靴を買う（かいました）が自然な文脈です。',
          points: 15,
        },
      ],
      grammar: [
        {
          id: 'n5-g1',
          question: '（　）に入れるのに最もよいものを一つ選んでください。\nわたしは明日、京都（　）行きます。',
          options: ['を', 'へ', 'で', 'から'],
          correctIndex: 1,
          explanation: '移動の目的地・方向を示す助詞は「へ」または「に」を用います。',
          points: 15,
        },
        {
          id: 'n5-g2',
          question: '（　）に入れるのに最もよいものを一つ選んでください。\nこの部屋には誰も（　）。',
          options: ['います', 'いません', 'あります', 'ありません'],
          correctIndex: 1,
          explanation: '人を数えるので「いる」、否定語「誰も」と呼応して「いません」になります。',
          points: 15,
        },
        {
          id: 'n5-g3',
          question: '正しい文になるように並べ替えて、★に入るものを一つ選んでください。\nあしたは　__　__　★　__　映画を見ます。',
          options: ['友達', 'と', 'いっしょに', '新宿で'],
          correctIndex: 2,
          explanation: '正しい語順:「友達 (0) と (1) ★いっしょに (2) 新宿で (3) 映画を見ます」。★は「いっしょに」。',
          points: 15,
        },
        {
          id: 'n5-g4',
          question: '（　）に入れるのに最もよいものを一つ選んでください。\nすみませんが、写真を（　）ください。',
          options: ['とって', 'とる', 'とり', 'とった'],
          correctIndex: 0,
          explanation: '依頼表現「〜てください」は動詞のて形に接続します。「撮って（とって）ください」。',
          points: 15,
        },
      ],
      reading: [
        {
          id: 'n5-r1',
          passage: '【読解文】\n田中さんの日曜日の予定です。\n田中さんは朝８時に起きて、パンと卵を食べます。９時から１１時まで日本語の勉強をします。午後２時に友達と駅で会って、公園を散歩します。夜７時に家へ帰って晩ご飯を食べます。',
          question: '田中さんは午後２時に何をしますか。',
          options: [
            '日本語の勉強をします。',
            'パンと卵を食べます。',
            '友達と駅で会って散歩します。',
            '家へ帰って晩ご飯を食べます。',
          ],
          correctIndex: 2,
          explanation: '「午後２時に友達と駅で会って、公園を散歩します」と明記されています。',
          points: 30,
        },
        {
          id: 'n5-r2',
          passage: '【お知らせ】\nさくら日本語学校の学生へ\n来週の月曜日は祝日のため、授業はありません。火曜日から通常の授業を行います。宿題は火曜日の朝９時までに先生に提出してください。',
          question: '学生は宿題をいつ出さなければなりませんか。',
          options: [
            '月曜日の朝９時まで',
            '火曜日の朝９時まで',
            '火曜日の午後５時まで',
            'いつでもよい',
          ],
          correctIndex: 1,
          explanation: '「宿題は火曜日の朝９時までに先生に提出してください」とあります。',
          points: 30,
        },
      ],
      listening: [
        {
          id: 'n5-l1',
          audioDialogue: '男の人と女の人が話しています。男の人は何時に来ますか。\n男：「明日のパーティー、何時からですか。」\n女：「６時からです。でも、準備があるから３０分前に来てください。」\n男：「わかりました。５時半に行きますね。」',
          question: '男の人は何時に来ますか。',
          options: ['５時', '５時３０分', '６時', '６時３０分'],
          correctIndex: 1,
          explanation: 'パーティーは６時ですが、準備のため３０分前の「５時３０分」に来ることになりました。',
          points: 30,
        },
        {
          id: 'n5-l2',
          audioDialogue: '女の人が喫茶店で注文しています。女の人は何を頼みましたか。\n店員：「いらっしゃいませ。ご注文は何になさいますか。」\n女：「アイスコーヒーと、チーズケーキを一つお願いします。」\n店員：「かしこまりました。少々お待ちください。」',
          question: '女の人が頼んだものはどれですか。',
          options: ['ホットコーヒーとチョコレートケーキ', 'アイスコーヒーとチーズケーキ', '紅茶とチーズケーキ', 'アイスティーとサンドイッチ'],
          correctIndex: 1,
          explanation: '「アイスコーヒーと、チーズケーキを一つ」と注文しています。',
          points: 30,
        },
      ],
    },
  },
  N3: {
    level: 'N3',
    title: 'JLPT N3 総合模擬試験 (Intermediate Mock Exam)',
    durationSeconds: 4200, // 70 mins
    passingScoreOverall: 95, // out of 180
    passingScoreSection: 19,
    sections: {
      vocab: [
        {
          id: 'n3-v1',
          question: '次の下線の言葉の読み方を一つ選んでください。\n彼女は責任を持って仕事を__果たした__。',
          options: ['かたした', 'はたした', 'みたした', 'もたらした'],
          correctIndex: 1,
          explanation: '「果たす」は「はたす（果たした）」と読みます。義務や責任を遂行すること。',
          points: 15,
        },
        {
          id: 'n3-v2',
          question: '次の言葉の類義語（最も近い意味の言葉）を一つ選んでください。\n会議の資料をあらかじめ__配布__しておいてください。',
          options: ['くばって', 'あつめて', 'なおして', 'すてて'],
          correctIndex: 0,
          explanation: '「配布する」は「配る（くばる）」と同じ意味です。',
          points: 15,
        },
        {
          id: 'n3-v3',
          question: '文の（　）に入れるのに最もよいものを一つ選んでください。\n雨が降った（　）、試合は中止になった。',
          options: ['せいで', 'おかげで', 'ために', 'くせに'],
          correctIndex: 0,
          explanation: '好ましくない結果（試合中止）の原因を表すので「せいで」が適切です。',
          points: 15,
        },
        {
          id: 'n3-v4',
          question: '下線の言葉の使い方が最も適切なものを一つ選んでください。\n【ぎっしり】',
          options: [
            '本棚には本がぎっしり並んでいる。',
            '彼はぎっしり走って疲れた。',
            '明日の天気はぎっしり晴れるでしょう。',
            'このスープはぎっしり熱い。',
          ],
          correctIndex: 0,
          explanation: '「ぎっしり」は隙間なく詰まっている様子を表します。',
          points: 15,
        },
      ],
      grammar: [
        {
          id: 'n3-g1',
          question: '（　）に入れるのに最もよいものを一つ選んでください。\n先生に（　）とおりに発音の練習をした。',
          options: ['言った', '言われた', '言わせた', '言う'],
          correctIndex: 1,
          explanation: '先生から指示を受けた側なので受身形「言われたとおりに」が自然です。',
          points: 15,
        },
        {
          id: 'n3-g2',
          question: '（　）に入れるのに最もよいものを一つ選んでください。\nダイエット中なので、甘いものは食べない（　）にしている。',
          options: ['わけ', 'はず', 'こと', 'よう'],
          correctIndex: 2,
          explanation: '習慣や自己のルールを表す表現は「〜ことにしている」です。',
          points: 15,
        },
        {
          id: 'n3-g3',
          question: '正しい文になるように並べ替えて、★に入るものを一つ選んでください。\nどんなに　__　__　★　__　あきらめてはいけない。',
          options: ['困難が', 'あっても', '途中で', '決して'],
          correctIndex: 3,
          explanation: '語順:「どんなに 困難が(0) あっても(1) 途中で(2) ★決して(3) あきらめてはいけない」または「決して(3) 途中で(2)」。★は「決して」。',
          points: 15,
        },
        {
          id: 'n3-g4',
          question: '（　）に入れるのに最もよいものを一つ選んでください。\n彼はまるで何でも（　）ような顔をしている。',
          options: ['知っている', '知った', '知られる', '知らされた'],
          correctIndex: 0,
          explanation: '「まるで〜ような」は比喩を表し、状態の継続「知っているような」が接続します。',
          points: 15,
        },
      ],
      reading: [
        {
          id: 'n3-r1',
          passage: '【読解文】\n近年、電子書籍の普及が進んでいるが、紙の本を好む読者も依然として多い。ある調査によると、紙の本の魅力として「手触りやページのめくりやすさ」「読み進めた量が視覚的にわかること」が挙げられている。一方、電子書籍は「何冊でも軽々と持ち歩ける点」「文字サイズを自由に変更できる点」で高く評価されている。このように、どちらか一方が他方を駆逐するのではなく、目的や場所に応じて両方を使い分ける読書スタイルが定着しつつある。',
          question: '筆者の考えとして最も適切なものはどれか。',
          options: [
            '電子書籍は紙の本に比べて読書効率が落ちる。',
            '紙の本はいずれ電子書籍に完全に取って代わられる。',
            '読者は状況や用途に応じて電子書籍と紙の本を併用している。',
            '文字サイズの変更ができる電子書籍のほうが優れている。',
          ],
          correctIndex: 2,
          explanation: '最終文「目的や場所に応じて両方を使い分ける読書スタイルが定着しつつある」と合致。',
          points: 30,
        },
        {
          id: 'n3-r2',
          passage: '【社内連絡】\n各位\n来月より、社内システムのセキュリティ強化に伴い、全社員のログインパスワードを2段階認証に変更します。設定マニュアルは本日中にメールにて配信しますので、各自来週金曜日までに初期設定を完了させてください。期限内に設定が行われない場合、社内ネットワークへのアクセスが一時停止されます。',
          question: 'この文章で社員がしなければならないことは何か。',
          options: [
            '本日中に社内ネットワークのアクセスを停止する。',
            '来週金曜日までに2段階認証の初期設定を行う。',
            '各自新しいセキュリティマニュアルを作成する。',
            '来月までパスワードの変更を行わないようにする。',
          ],
          correctIndex: 1,
          explanation: '「各自来週金曜日までに初期設定を完了させてください」と明記されています。',
          points: 30,
        },
      ],
      listening: [
        {
          id: 'n3-l1',
          audioDialogue: '会社で上司と部下の女性が話しています。女性はこの後まず何をしますか。\n上司：「佐藤さん、昨日の企画書の修正、終わった？」\n女：「はい、大体の修正は済みましたが、予算の確認がまだです。」\n上司：「そうか。じゃあ経理の田中さんに電話して予算の確定を先に頼んでくれ。そのあとで印刷して会議室に持ってきて。」\n女：「承知しました。すぐ経理部に連絡します。」',
          question: '女性はこの後、まず何をしますか。',
          options: ['企画書を印刷する', '会議室へ行く', '経理の田中さんに連絡する', '企画書を書き直す'],
          correctIndex: 2,
          explanation: '上司が「先に頼んでくれ」と指示し、女性が「すぐ経理部に連絡します」と答えています。',
          points: 30,
        },
        {
          id: 'n3-l2',
          audioDialogue: '大学で留学生と先生が話しています。留学生は面接の時、何に注意しなければなりませんか。\n留学生：「先生、明日の奨学金の面接、とても緊張しています。」\n先生：「大丈夫だよ。志望理由はしっかり書けているからね。ただ、早口にならないように、面接官の目を見てゆっくり話すことを心がけなさい。」\n留学生：「はい、落ち着いて話すように気をつけます。」',
          question: '留学生が注意すべきことは何ですか。',
          options: ['志望理由を書き直すこと', '面接官の目を見てゆっくり話すこと', 'できるだけ多くの資格をアピールすること', 'メモを見ながら話すこと'],
          correctIndex: 1,
          explanation: '先生が「早口にならないように、面接官の目を見てゆっくり話すことを心がけなさい」とアドバイスしています。',
          points: 30,
        },
      ],
    },
  },
};

/**
 * Calculates exam results with section breakdowns and pass/fail determination
 */
export function calculateExamScore(answers = {}, exam) {
  if (!exam || !exam.sections) {
    return { score: 0, maxScore: 180, percent: 0, passed: false, sections: {} };
  }

  const sectionScores = {};
  let totalScore = 0;
  let totalMax = 0;

  Object.entries(exam.sections).forEach(([secKey, questions]) => {
    let secScore = 0;
    let secMax = 0;

    questions.forEach((q) => {
      secMax += q.points || 10;
      if (answers[q.id] === q.correctIndex) {
        secScore += q.points || 10;
      }
    });

    // Scale section score to 60 points max (standard JLPT sectional scoring)
    const scaledScore = secMax > 0 ? Math.round((secScore / secMax) * 60) : 0;
    const passedSection = scaledScore >= (exam.passingScoreSection || 19);

    sectionScores[secKey] = {
      rawScore: secScore,
      rawMax: secMax,
      scaledScore,
      scaledMax: 60,
      percent: secMax > 0 ? Math.round((secScore / secMax) * 100) : 0,
      passedSection,
    };

    totalScore += scaledScore;
    totalMax += 60;
  });

  const overallPercent = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
  const passedOverall = totalScore >= (exam.passingScoreOverall || 90);
  const passedAllSections = Object.values(sectionScores).every((s) => s.passedSection);
  const passed = passedOverall && passedAllSections;

  return {
    score: totalScore,
    maxScore: totalMax,
    percent: overallPercent,
    passed,
    sections: sectionScores,
  };
}

