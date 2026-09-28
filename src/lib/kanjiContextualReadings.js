/**
 * Kanji Course Contexts System
 *
 * Sourced directly from actual curriculum vocabulary records across Lessons 1-30.
 *
 * CRITICAL ARCHITECTURAL DISTINCTIONS:
 * 1. Dictionary readings (On'yomi, Kun'yomi, standard definitions) remain strictly preserved
 *    in dictionary source data (KANJIDIC2) and are never modified or overwritten.
 * 2. Vocabulary readings represent the complete learner-facing Japanese words taught in each lesson.
 * 3. Course context records link each Kanji character to the actual vocabulary term(s) where
 *    the learner encounters it, preventing stem truncation (e.g. 冷 is contextualized via 冷たい)
 *    and avoiding conflating compound words with individual character readings.
 * 4. Multiple contexts for a single Kanji are preserved as structured arrays rather than
 *    being collapsed into a single string.
 */

export const KANJI_COURSE_CONTEXTS = {
  "一": [
    {
      "lesson": 6,
      "vocabulary": "一",
      "reading": "いち",
      "romaji": "ichi",
      "meaning": "one"
    },
    {
      "lesson": 10,
      "vocabulary": "一",
      "reading": "いち",
      "romaji": "ichi",
      "meaning": "one"
    },
    {
      "lesson": 14,
      "vocabulary": "一緒に",
      "reading": "いっしょに",
      "romaji": "isshoni",
      "meaning": "together"
    },
    {
      "lesson": 14,
      "vocabulary": "一人で",
      "reading": "ひとりで",
      "romaji": "hitoride",
      "meaning": "alone"
    },
    {
      "lesson": 17,
      "vocabulary": "一番",
      "reading": "いちばん",
      "romaji": "ichiban",
      "meaning": "most"
    },
    {
      "lesson": 26,
      "vocabulary": "一度",
      "reading": "いちど",
      "romaji": "ichido",
      "meaning": "once / one time"
    },
    {
      "lesson": 26,
      "vocabulary": "一度も",
      "reading": "いちども",
      "romaji": "ichidomo",
      "meaning": "not even once (with neg)"
    }
  ],
  "二": [
    {
      "lesson": 6,
      "vocabulary": "二",
      "reading": "に",
      "romaji": "ni",
      "meaning": "two"
    },
    {
      "lesson": 10,
      "vocabulary": "二",
      "reading": "に",
      "romaji": "ni",
      "meaning": "two"
    }
  ],
  "三": [
    {
      "lesson": 6,
      "vocabulary": "三",
      "reading": "さん",
      "romaji": "san",
      "meaning": "three"
    },
    {
      "lesson": 10,
      "vocabulary": "三",
      "reading": "さん",
      "romaji": "san",
      "meaning": "three"
    }
  ],
  "日": [
    {
      "lesson": 6,
      "vocabulary": "日",
      "reading": "ひ",
      "romaji": "hi",
      "meaning": "day, sun"
    },
    {
      "lesson": 8,
      "vocabulary": "日本人",
      "reading": "にほんじん",
      "romaji": "nihonjin",
      "meaning": "Japanese person"
    },
    {
      "lesson": 12,
      "vocabulary": "今日",
      "reading": "きょう",
      "romaji": "kyou",
      "meaning": "today"
    },
    {
      "lesson": 12,
      "vocabulary": "明日",
      "reading": "あした",
      "romaji": "ashita",
      "meaning": "tomorrow"
    },
    {
      "lesson": 12,
      "vocabulary": "昨日",
      "reading": "きのう",
      "romaji": "kinou",
      "meaning": "yesterday"
    },
    {
      "lesson": 12,
      "vocabulary": "毎日",
      "reading": "まいにち",
      "romaji": "mainichi",
      "meaning": "every day"
    },
    {
      "lesson": 17,
      "vocabulary": "日本",
      "reading": "にほん",
      "romaji": "nihon",
      "meaning": "Japan"
    }
  ],
  "月": [
    {
      "lesson": 6,
      "vocabulary": "月",
      "reading": "つき",
      "romaji": "tsuki",
      "meaning": "month, moon"
    }
  ],
  "木": [
    {
      "lesson": 6,
      "vocabulary": "木",
      "reading": "き",
      "romaji": "ki",
      "meaning": "tree, wood"
    }
  ],
  "山": [
    {
      "lesson": 6,
      "vocabulary": "山",
      "reading": "やま",
      "romaji": "yama",
      "meaning": "mountain"
    },
    {
      "lesson": 26,
      "vocabulary": "富士山",
      "reading": "ふじさん",
      "romaji": "Fujisan",
      "meaning": "Mount Fuji"
    }
  ],
  "川": [
    {
      "lesson": 6,
      "vocabulary": "川",
      "reading": "かわ",
      "romaji": "kawa",
      "meaning": "river"
    }
  ],
  "人": [
    {
      "lesson": 6,
      "vocabulary": "人",
      "reading": "ひと",
      "romaji": "hito",
      "meaning": "person"
    },
    {
      "lesson": 8,
      "vocabulary": "日本人",
      "reading": "にほんじん",
      "romaji": "nihonjin",
      "meaning": "Japanese person"
    },
    {
      "lesson": 8,
      "vocabulary": "アメリカ人",
      "reading": "あめりかじん",
      "romaji": "amerikajin",
      "meaning": "American person"
    },
    {
      "lesson": 13,
      "vocabulary": "人",
      "reading": "ひと",
      "romaji": "hito",
      "meaning": "person"
    },
    {
      "lesson": 13,
      "vocabulary": "男の人",
      "reading": "おとこのひと",
      "romaji": "otokonohito",
      "meaning": "man"
    },
    {
      "lesson": 13,
      "vocabulary": "女の人",
      "reading": "おんなのひと",
      "romaji": "onnanohito",
      "meaning": "woman"
    },
    {
      "lesson": 14,
      "vocabulary": "一人で",
      "reading": "ひとりで",
      "romaji": "hitoride",
      "meaning": "alone"
    },
    {
      "lesson": 24,
      "vocabulary": "大人",
      "reading": "おとな",
      "romaji": "otona",
      "meaning": "adult"
    }
  ],
  "口": [
    {
      "lesson": 6,
      "vocabulary": "口",
      "reading": "くち",
      "romaji": "kuchi",
      "meaning": "mouth"
    },
    {
      "lesson": 21,
      "vocabulary": "入口",
      "reading": "いりぐち",
      "romaji": "iriguchi",
      "meaning": "entrance"
    },
    {
      "lesson": 21,
      "vocabulary": "出口",
      "reading": "でぐち",
      "romaji": "deguchi",
      "meaning": "exit"
    }
  ],
  "願": [
    {
      "lesson": 7,
      "vocabulary": "お願いします",
      "reading": "おねがいします",
      "romaji": "onegaishimasu",
      "meaning": "Please / I request this"
    },
    {
      "lesson": 7,
      "vocabulary": "よろしくお願いします",
      "reading": "よろしくおねがいします",
      "romaji": "yoroshiku onegaishimasu",
      "meaning": "I look forward to working with you / Nice to meet you"
    },
    {
      "lesson": 21,
      "vocabulary": "お願い",
      "reading": "おねがい",
      "romaji": "onegai",
      "meaning": "request"
    }
  ],
  "初": [
    {
      "lesson": 7,
      "vocabulary": "初めまして",
      "reading": "はじめまして",
      "romaji": "hajimemashite",
      "meaning": "How do you do? / Nice to meet you"
    }
  ],
  "先": [
    {
      "lesson": 7,
      "vocabulary": "先生",
      "reading": "せんせい",
      "romaji": "sensei",
      "meaning": "Teacher / Professor"
    },
    {
      "lesson": 8,
      "vocabulary": "先生",
      "reading": "せんせい",
      "romaji": "sensei",
      "meaning": "teacher"
    },
    {
      "lesson": 22,
      "vocabulary": "先週",
      "reading": "せんしゅう",
      "romaji": "senshuu",
      "meaning": "last week"
    }
  ],
  "生": [
    {
      "lesson": 7,
      "vocabulary": "先生",
      "reading": "せんせい",
      "romaji": "sensei",
      "meaning": "Teacher / Professor"
    },
    {
      "lesson": 8,
      "vocabulary": "学生",
      "reading": "がくせい",
      "romaji": "gakusei",
      "meaning": "student"
    },
    {
      "lesson": 8,
      "vocabulary": "先生",
      "reading": "せんせい",
      "romaji": "sensei",
      "meaning": "teacher"
    }
  ],
  "失": [
    {
      "lesson": 7,
      "vocabulary": "失礼します",
      "reading": "しつれいします",
      "romaji": "shitsurei shimasu",
      "meaning": "Excuse me / Goodbye (polite)"
    }
  ],
  "礼": [
    {
      "lesson": 7,
      "vocabulary": "失礼します",
      "reading": "しつれいします",
      "romaji": "shitsurei shimasu",
      "meaning": "Excuse me / Goodbye (polite)"
    }
  ],
  "私": [
    {
      "lesson": 8,
      "vocabulary": "私",
      "reading": "わたし",
      "romaji": "watashi",
      "meaning": "I"
    }
  ],
  "彼": [
    {
      "lesson": 8,
      "vocabulary": "彼",
      "reading": "かれ",
      "romaji": "kare",
      "meaning": "he"
    },
    {
      "lesson": 8,
      "vocabulary": "彼女",
      "reading": "かのじょ",
      "romaji": "kanojo",
      "meaning": "she"
    }
  ],
  "女": [
    {
      "lesson": 8,
      "vocabulary": "彼女",
      "reading": "かのじょ",
      "romaji": "kanojo",
      "meaning": "she"
    },
    {
      "lesson": 13,
      "vocabulary": "女の人",
      "reading": "おんなのひと",
      "romaji": "onnanohito",
      "meaning": "woman"
    }
  ],
  "学": [
    {
      "lesson": 8,
      "vocabulary": "学生",
      "reading": "がくせい",
      "romaji": "gakusei",
      "meaning": "student"
    },
    {
      "lesson": 11,
      "vocabulary": "学校",
      "reading": "がっこう",
      "romaji": "gakkou",
      "meaning": "school"
    }
  ],
  "会": [
    {
      "lesson": 8,
      "vocabulary": "会社員",
      "reading": "かいしゃいん",
      "romaji": "kaishain",
      "meaning": "company employee"
    },
    {
      "lesson": 14,
      "vocabulary": "会う",
      "reading": "あう",
      "romaji": "au",
      "meaning": "to meet"
    },
    {
      "lesson": 19,
      "vocabulary": "会う",
      "reading": "あう",
      "romaji": "au",
      "meaning": "to meet"
    },
    {
      "lesson": 20,
      "vocabulary": "会社",
      "reading": "かいしゃ",
      "romaji": "kaisha",
      "meaning": "company"
    },
    {
      "lesson": 23,
      "vocabulary": "社会",
      "reading": "しゃかい",
      "romaji": "shakai",
      "meaning": "society"
    }
  ],
  "社": [
    {
      "lesson": 8,
      "vocabulary": "会社員",
      "reading": "かいしゃいん",
      "romaji": "kaishain",
      "meaning": "company employee"
    },
    {
      "lesson": 20,
      "vocabulary": "会社",
      "reading": "かいしゃ",
      "romaji": "kaisha",
      "meaning": "company"
    },
    {
      "lesson": 23,
      "vocabulary": "社会",
      "reading": "しゃかい",
      "romaji": "shakai",
      "meaning": "society"
    },
    {
      "lesson": 26,
      "vocabulary": "神社",
      "reading": "じんじゃ",
      "romaji": "jinja",
      "meaning": "Shinto shrine"
    }
  ],
  "員": [
    {
      "lesson": 8,
      "vocabulary": "会社員",
      "reading": "かいしゃいん",
      "romaji": "kaishain",
      "meaning": "company employee"
    }
  ],
  "本": [
    {
      "lesson": 8,
      "vocabulary": "日本人",
      "reading": "にほんじん",
      "romaji": "nihonjin",
      "meaning": "Japanese person"
    },
    {
      "lesson": 9,
      "vocabulary": "本",
      "reading": "ほん",
      "romaji": "hon",
      "meaning": "book"
    },
    {
      "lesson": 17,
      "vocabulary": "日本",
      "reading": "にほん",
      "romaji": "nihon",
      "meaning": "Japan"
    },
    {
      "lesson": 22,
      "vocabulary": "本当",
      "reading": "ほんとう",
      "romaji": "hontou",
      "meaning": "truth"
    }
  ],
  "友": [
    {
      "lesson": 8,
      "vocabulary": "友達",
      "reading": "ともだち",
      "romaji": "tomodachi",
      "meaning": "friend"
    }
  ],
  "達": [
    {
      "lesson": 8,
      "vocabulary": "友達",
      "reading": "ともだち",
      "romaji": "tomodachi",
      "meaning": "friend"
    }
  ],
  "誰": [
    {
      "lesson": 8,
      "vocabulary": "誰",
      "reading": "だれ",
      "romaji": "dare",
      "meaning": "who"
    },
    {
      "lesson": 14,
      "vocabulary": "誰か",
      "reading": "だれか",
      "romaji": "dareka",
      "meaning": "someone"
    }
  ],
  "何": [
    {
      "lesson": 8,
      "vocabulary": "何",
      "reading": "なに",
      "romaji": "nani",
      "meaning": "what"
    }
  ],
  "名": [
    {
      "lesson": 8,
      "vocabulary": "名前",
      "reading": "なまえ",
      "romaji": "namae",
      "meaning": "name"
    },
    {
      "lesson": 16,
      "vocabulary": "有名",
      "reading": "ゆうめい",
      "romaji": "yuumei",
      "meaning": "famous"
    }
  ],
  "前": [
    {
      "lesson": 8,
      "vocabulary": "名前",
      "reading": "なまえ",
      "romaji": "namae",
      "meaning": "name"
    },
    {
      "lesson": 12,
      "vocabulary": "午前",
      "reading": "ごぜん",
      "romaji": "gozen",
      "meaning": "morning"
    },
    {
      "lesson": 13,
      "vocabulary": "前",
      "reading": "まえ",
      "romaji": "mae",
      "meaning": "in front"
    }
  ],
  "辞": [
    {
      "lesson": 9,
      "vocabulary": "辞書",
      "reading": "じしょ",
      "romaji": "jisho",
      "meaning": "dictionary"
    }
  ],
  "書": [
    {
      "lesson": 9,
      "vocabulary": "辞書",
      "reading": "じしょ",
      "romaji": "jisho",
      "meaning": "dictionary"
    },
    {
      "lesson": 11,
      "vocabulary": "書く",
      "reading": "かく",
      "romaji": "kaku",
      "meaning": "to write"
    },
    {
      "lesson": 11,
      "vocabulary": "図書館",
      "reading": "としょかん",
      "romaji": "toshokan",
      "meaning": "library"
    },
    {
      "lesson": 18,
      "vocabulary": "書く",
      "reading": "かく",
      "romaji": "kaku",
      "meaning": "to write"
    }
  ],
  "傘": [
    {
      "lesson": 9,
      "vocabulary": "傘",
      "reading": "かさ",
      "romaji": "kasa",
      "meaning": "umbrella"
    }
  ],
  "鍵": [
    {
      "lesson": 9,
      "vocabulary": "鍵",
      "reading": "かぎ",
      "romaji": "kagi",
      "meaning": "key"
    }
  ],
  "車": [
    {
      "lesson": 9,
      "vocabulary": "車",
      "reading": "くるま",
      "romaji": "kuruma",
      "meaning": "car"
    },
    {
      "lesson": 25,
      "vocabulary": "自転車",
      "reading": "じてんしゃ",
      "romaji": "jitensha",
      "meaning": "bicycle"
    }
  ],
  "時": [
    {
      "lesson": 9,
      "vocabulary": "時計",
      "reading": "とけい",
      "romaji": "tokei",
      "meaning": "watch"
    },
    {
      "lesson": 12,
      "vocabulary": "時",
      "reading": "じ",
      "romaji": "ji",
      "meaning": "o'clock (hour counter)"
    }
  ],
  "計": [
    {
      "lesson": 9,
      "vocabulary": "時計",
      "reading": "とけい",
      "romaji": "tokei",
      "meaning": "watch"
    }
  ],
  "四": [
    {
      "lesson": 10,
      "vocabulary": "四",
      "reading": "よん",
      "romaji": "yon",
      "meaning": "four"
    }
  ],
  "五": [
    {
      "lesson": 10,
      "vocabulary": "五",
      "reading": "ご",
      "romaji": "go",
      "meaning": "five"
    }
  ],
  "六": [
    {
      "lesson": 10,
      "vocabulary": "六",
      "reading": "ろく",
      "romaji": "roku",
      "meaning": "six"
    }
  ],
  "七": [
    {
      "lesson": 10,
      "vocabulary": "七",
      "reading": "なな",
      "romaji": "nana",
      "meaning": "seven"
    }
  ],
  "八": [
    {
      "lesson": 10,
      "vocabulary": "八",
      "reading": "はち",
      "romaji": "hachi",
      "meaning": "eight"
    }
  ],
  "九": [
    {
      "lesson": 10,
      "vocabulary": "九",
      "reading": "きゅう",
      "romaji": "kyuu",
      "meaning": "nine"
    }
  ],
  "十": [
    {
      "lesson": 10,
      "vocabulary": "十",
      "reading": "じゅう",
      "romaji": "juu",
      "meaning": "ten"
    },
    {
      "lesson": 29,
      "vocabulary": "十分",
      "reading": "じゅうぶん",
      "romaji": "juubun",
      "meaning": "sufficiently / plenty / enough"
    }
  ],
  "百": [
    {
      "lesson": 10,
      "vocabulary": "百",
      "reading": "ひゃく",
      "romaji": "hyaku",
      "meaning": "hundred"
    }
  ],
  "歳": [
    {
      "lesson": 10,
      "vocabulary": "歳",
      "reading": "さい",
      "romaji": "sai",
      "meaning": "years old (age counter)"
    }
  ],
  "財": [
    {
      "lesson": 10,
      "vocabulary": "財布",
      "reading": "さいふ",
      "romaji": "saifu",
      "meaning": "wallet"
    }
  ],
  "布": [
    {
      "lesson": 10,
      "vocabulary": "財布",
      "reading": "さいふ",
      "romaji": "saifu",
      "meaning": "wallet"
    }
  ],
  "家": [
    {
      "lesson": 10,
      "vocabulary": "家族",
      "reading": "かぞく",
      "romaji": "kazoku",
      "meaning": "family"
    },
    {
      "lesson": 11,
      "vocabulary": "家",
      "reading": "いえ",
      "romaji": "ie",
      "meaning": "house"
    }
  ],
  "族": [
    {
      "lesson": 10,
      "vocabulary": "家族",
      "reading": "かぞく",
      "romaji": "kazoku",
      "meaning": "family"
    }
  ],
  "父": [
    {
      "lesson": 10,
      "vocabulary": "父",
      "reading": "ちち",
      "romaji": "chichi",
      "meaning": "father (humble / own)"
    }
  ],
  "母": [
    {
      "lesson": 10,
      "vocabulary": "母",
      "reading": "はは",
      "romaji": "haha",
      "meaning": "mother (humble / own)"
    }
  ],
  "食": [
    {
      "lesson": 11,
      "vocabulary": "食べる",
      "reading": "たべる",
      "romaji": "taberu",
      "meaning": "to eat"
    },
    {
      "lesson": 18,
      "vocabulary": "食べる",
      "reading": "たべる",
      "romaji": "taberu",
      "meaning": "to eat"
    }
  ],
  "飲": [
    {
      "lesson": 11,
      "vocabulary": "飲む",
      "reading": "のむ",
      "romaji": "nomu",
      "meaning": "to drink"
    },
    {
      "lesson": 18,
      "vocabulary": "飲む",
      "reading": "のむ",
      "romaji": "nomu",
      "meaning": "to drink"
    }
  ],
  "読": [
    {
      "lesson": 11,
      "vocabulary": "読む",
      "reading": "よむ",
      "romaji": "yomu",
      "meaning": "to read"
    },
    {
      "lesson": 18,
      "vocabulary": "読む",
      "reading": "よむ",
      "romaji": "yomu",
      "meaning": "to read"
    }
  ],
  "聞": [
    {
      "lesson": 11,
      "vocabulary": "聞く",
      "reading": "きく",
      "romaji": "kiku",
      "meaning": "to hear"
    },
    {
      "lesson": 18,
      "vocabulary": "聞く",
      "reading": "きく",
      "romaji": "kiku",
      "meaning": "to listen"
    },
    {
      "lesson": 23,
      "vocabulary": "新聞",
      "reading": "しんぶん",
      "romaji": "shinbun",
      "meaning": "newspaper"
    }
  ],
  "見": [
    {
      "lesson": 11,
      "vocabulary": "見る",
      "reading": "みる",
      "romaji": "miru",
      "meaning": "to see"
    },
    {
      "lesson": 18,
      "vocabulary": "見る",
      "reading": "みる",
      "romaji": "miru",
      "meaning": "to see"
    },
    {
      "lesson": 23,
      "vocabulary": "意見",
      "reading": "いけん",
      "romaji": "iken",
      "meaning": "opinion"
    },
    {
      "lesson": 28,
      "vocabulary": "見せる",
      "reading": "みせる",
      "romaji": "miseru",
      "meaning": "to show / display"
    }
  ],
  "行": [
    {
      "lesson": 11,
      "vocabulary": "行く",
      "reading": "いく",
      "romaji": "iku",
      "meaning": "to go"
    },
    {
      "lesson": 18,
      "vocabulary": "行く",
      "reading": "いく",
      "romaji": "iku",
      "meaning": "to go"
    },
    {
      "lesson": 25,
      "vocabulary": "旅行",
      "reading": "りょこう",
      "romaji": "ryokou",
      "meaning": "travel / trip"
    },
    {
      "lesson": 25,
      "vocabulary": "飛行機",
      "reading": "ひこうき",
      "romaji": "hikouki",
      "meaning": "airplane"
    }
  ],
  "来": [
    {
      "lesson": 11,
      "vocabulary": "来る",
      "reading": "くる",
      "romaji": "kuru",
      "meaning": "to come"
    },
    {
      "lesson": 18,
      "vocabulary": "来る",
      "reading": "くる",
      "romaji": "kuru",
      "meaning": "to come"
    },
    {
      "lesson": 22,
      "vocabulary": "来週",
      "reading": "らいしゅう",
      "romaji": "raishuu",
      "meaning": "next week"
    },
    {
      "lesson": 23,
      "vocabulary": "将来",
      "reading": "しょうらい",
      "romaji": "shourai",
      "meaning": "future (personal/near)"
    }
  ],
  "帰": [
    {
      "lesson": 11,
      "vocabulary": "帰る",
      "reading": "かえる",
      "romaji": "kaeru",
      "meaning": "to return"
    },
    {
      "lesson": 18,
      "vocabulary": "帰る",
      "reading": "かえる",
      "romaji": "kaeru",
      "meaning": "to return"
    }
  ],
  "飯": [
    {
      "lesson": 11,
      "vocabulary": "ご飯",
      "reading": "ごはん",
      "romaji": "gohan",
      "meaning": "cooked rice"
    }
  ],
  "水": [
    {
      "lesson": 11,
      "vocabulary": "水",
      "reading": "みず",
      "romaji": "mizu",
      "meaning": "water (cold)"
    }
  ],
  "茶": [
    {
      "lesson": 11,
      "vocabulary": "お茶",
      "reading": "おちゃ",
      "romaji": "ocha",
      "meaning": "tea"
    }
  ],
  "校": [
    {
      "lesson": 11,
      "vocabulary": "学校",
      "reading": "がっこう",
      "romaji": "gakkou",
      "meaning": "school"
    }
  ],
  "図": [
    {
      "lesson": 11,
      "vocabulary": "図書館",
      "reading": "としょかん",
      "romaji": "toshokan",
      "meaning": "library"
    }
  ],
  "館": [
    {
      "lesson": 11,
      "vocabulary": "図書館",
      "reading": "としょかん",
      "romaji": "toshokan",
      "meaning": "library"
    },
    {
      "lesson": 21,
      "vocabulary": "美術館",
      "reading": "びじゅつかん",
      "romaji": "bijutsukan",
      "meaning": "art museum"
    }
  ],
  "駅": [
    {
      "lesson": 11,
      "vocabulary": "駅",
      "reading": "えき",
      "romaji": "eki",
      "meaning": "railway station"
    }
  ],
  "起": [
    {
      "lesson": 12,
      "vocabulary": "起きる",
      "reading": "おきる",
      "romaji": "okiru",
      "meaning": "to get up"
    },
    {
      "lesson": 18,
      "vocabulary": "起きる",
      "reading": "おきる",
      "romaji": "okiru",
      "meaning": "to get up"
    }
  ],
  "寝": [
    {
      "lesson": 12,
      "vocabulary": "寝る",
      "reading": "ねる",
      "romaji": "neru",
      "meaning": "to sleep"
    },
    {
      "lesson": 18,
      "vocabulary": "寝る",
      "reading": "ねる",
      "romaji": "neru",
      "meaning": "to sleep"
    }
  ],
  "勉": [
    {
      "lesson": 12,
      "vocabulary": "勉強する",
      "reading": "べんきょうする",
      "romaji": "benkyousuru",
      "meaning": "to study"
    }
  ],
  "強": [
    {
      "lesson": 12,
      "vocabulary": "勉強する",
      "reading": "べんきょうする",
      "romaji": "benkyousuru",
      "meaning": "to study"
    }
  ],
  "今": [
    {
      "lesson": 12,
      "vocabulary": "今日",
      "reading": "きょう",
      "romaji": "kyou",
      "meaning": "today"
    },
    {
      "lesson": 12,
      "vocabulary": "今",
      "reading": "いま",
      "romaji": "ima",
      "meaning": "now"
    },
    {
      "lesson": 22,
      "vocabulary": "今朝",
      "reading": "けさ",
      "romaji": "kesa",
      "meaning": "this morning"
    },
    {
      "lesson": 22,
      "vocabulary": "今晩",
      "reading": "こんばん",
      "romaji": "konban",
      "meaning": "this evening"
    },
    {
      "lesson": 22,
      "vocabulary": "今週",
      "reading": "こんしゅう",
      "romaji": "konshuu",
      "meaning": "this week"
    }
  ],
  "明": [
    {
      "lesson": 12,
      "vocabulary": "明日",
      "reading": "あした",
      "romaji": "ashita",
      "meaning": "tomorrow"
    }
  ],
  "昨": [
    {
      "lesson": 12,
      "vocabulary": "昨日",
      "reading": "きのう",
      "romaji": "kinou",
      "meaning": "yesterday"
    }
  ],
  "毎": [
    {
      "lesson": 12,
      "vocabulary": "毎日",
      "reading": "まいにち",
      "romaji": "mainichi",
      "meaning": "every day"
    }
  ],
  "朝": [
    {
      "lesson": 12,
      "vocabulary": "朝",
      "reading": "あさ",
      "romaji": "asa",
      "meaning": "morning"
    },
    {
      "lesson": 22,
      "vocabulary": "今朝",
      "reading": "けさ",
      "romaji": "kesa",
      "meaning": "this morning"
    }
  ],
  "昼": [
    {
      "lesson": 12,
      "vocabulary": "昼",
      "reading": "ひる",
      "romaji": "hiru",
      "meaning": "noon"
    }
  ],
  "夜": [
    {
      "lesson": 12,
      "vocabulary": "夜",
      "reading": "よる",
      "romaji": "yoru",
      "meaning": "night"
    }
  ],
  "分": [
    {
      "lesson": 12,
      "vocabulary": "分",
      "reading": "ふん",
      "romaji": "fun",
      "meaning": "minute (counter)"
    },
    {
      "lesson": 22,
      "vocabulary": "多分",
      "reading": "たぶん",
      "romaji": "tabun",
      "meaning": "probably"
    },
    {
      "lesson": 29,
      "vocabulary": "十分",
      "reading": "じゅうぶん",
      "romaji": "juubun",
      "meaning": "sufficiently / plenty / enough"
    }
  ],
  "午": [
    {
      "lesson": 12,
      "vocabulary": "午前",
      "reading": "ごぜん",
      "romaji": "gozen",
      "meaning": "morning"
    },
    {
      "lesson": 12,
      "vocabulary": "午後",
      "reading": "ごご",
      "romaji": "gogo",
      "meaning": "afternoon"
    }
  ],
  "後": [
    {
      "lesson": 12,
      "vocabulary": "午後",
      "reading": "ごご",
      "romaji": "gogo",
      "meaning": "afternoon"
    },
    {
      "lesson": 13,
      "vocabulary": "後ろ",
      "reading": "うしろ",
      "romaji": "ushiro",
      "meaning": "behind"
    }
  ],
  "男": [
    {
      "lesson": 13,
      "vocabulary": "男の人",
      "reading": "おとこのひと",
      "romaji": "otokonohito",
      "meaning": "man"
    }
  ],
  "子": [
    {
      "lesson": 13,
      "vocabulary": "子供",
      "reading": "こども",
      "romaji": "kodomo",
      "meaning": "child"
    },
    {
      "lesson": 13,
      "vocabulary": "椅子",
      "reading": "いす",
      "romaji": "isu",
      "meaning": "chair"
    },
    {
      "lesson": 24,
      "vocabulary": "お菓子",
      "reading": "おかし",
      "romaji": "okashi",
      "meaning": "confections"
    },
    {
      "lesson": 24,
      "vocabulary": "帽子",
      "reading": "ぼうし",
      "romaji": "boushi",
      "meaning": "hat"
    }
  ],
  "供": [
    {
      "lesson": 13,
      "vocabulary": "子供",
      "reading": "こども",
      "romaji": "kodomo",
      "meaning": "child"
    }
  ],
  "犬": [
    {
      "lesson": 13,
      "vocabulary": "犬",
      "reading": "いぬ",
      "romaji": "inu",
      "meaning": "dog"
    }
  ],
  "猫": [
    {
      "lesson": 13,
      "vocabulary": "猫",
      "reading": "ねこ",
      "romaji": "neko",
      "meaning": "cat"
    }
  ],
  "机": [
    {
      "lesson": 13,
      "vocabulary": "机",
      "reading": "つくえ",
      "romaji": "tsukue",
      "meaning": "desk"
    }
  ],
  "椅": [
    {
      "lesson": 13,
      "vocabulary": "椅子",
      "reading": "いす",
      "romaji": "isu",
      "meaning": "chair"
    }
  ],
  "部": [
    {
      "lesson": 13,
      "vocabulary": "部屋",
      "reading": "へや",
      "romaji": "heya",
      "meaning": "room"
    }
  ],
  "屋": [
    {
      "lesson": 13,
      "vocabulary": "部屋",
      "reading": "へや",
      "romaji": "heya",
      "meaning": "room"
    }
  ],
  "上": [
    {
      "lesson": 13,
      "vocabulary": "上",
      "reading": "うえ",
      "romaji": "ue",
      "meaning": "above"
    },
    {
      "lesson": 27,
      "vocabulary": "上手",
      "reading": "じょうず",
      "romaji": "jouzu",
      "meaning": "skillful / good at"
    }
  ],
  "下": [
    {
      "lesson": 13,
      "vocabulary": "下",
      "reading": "した",
      "romaji": "shita",
      "meaning": "below"
    },
    {
      "lesson": 27,
      "vocabulary": "下手",
      "reading": "へた",
      "romaji": "heta",
      "meaning": "poor at / unskillful"
    }
  ],
  "中": [
    {
      "lesson": 13,
      "vocabulary": "中",
      "reading": "なか",
      "romaji": "naka",
      "meaning": "inside"
    },
    {
      "lesson": 27,
      "vocabulary": "中国語",
      "reading": "ちゅうごくご",
      "romaji": "chuugokugo",
      "meaning": "Chinese language"
    }
  ],
  "話": [
    {
      "lesson": 14,
      "vocabulary": "話す",
      "reading": "はなす",
      "romaji": "hanasu",
      "meaning": "to talk"
    },
    {
      "lesson": 14,
      "vocabulary": "電話する",
      "reading": "でんわする",
      "romaji": "denwasuru",
      "meaning": "to make a phone call"
    },
    {
      "lesson": 18,
      "vocabulary": "話す",
      "reading": "はなす",
      "romaji": "hanasu",
      "meaning": "to speak"
    },
    {
      "lesson": 20,
      "vocabulary": "電話",
      "reading": "でんわ",
      "romaji": "denwa",
      "meaning": "telephone"
    },
    {
      "lesson": 23,
      "vocabulary": "話",
      "reading": "はなし",
      "romaji": "hanashi",
      "meaning": "talk"
    }
  ],
  "待": [
    {
      "lesson": 14,
      "vocabulary": "待つ",
      "reading": "まつ",
      "romaji": "matsu",
      "meaning": "to wait"
    },
    {
      "lesson": 18,
      "vocabulary": "待つ",
      "reading": "まつ",
      "romaji": "matsu",
      "meaning": "to wait"
    }
  ],
  "買": [
    {
      "lesson": 14,
      "vocabulary": "買う",
      "reading": "かう",
      "romaji": "kau",
      "meaning": "to buy"
    },
    {
      "lesson": 14,
      "vocabulary": "買い物",
      "reading": "かいもの",
      "romaji": "kaimono",
      "meaning": "shopping"
    },
    {
      "lesson": 18,
      "vocabulary": "買う",
      "reading": "かう",
      "romaji": "kau",
      "meaning": "to buy"
    }
  ],
  "電": [
    {
      "lesson": 14,
      "vocabulary": "電話する",
      "reading": "でんわする",
      "romaji": "denwasuru",
      "meaning": "to make a phone call"
    },
    {
      "lesson": 20,
      "vocabulary": "電話",
      "reading": "でんわ",
      "romaji": "denwa",
      "meaning": "telephone"
    }
  ],
  "緒": [
    {
      "lesson": 14,
      "vocabulary": "一緒に",
      "reading": "いっしょに",
      "romaji": "isshoni",
      "meaning": "together"
    }
  ],
  "約": [
    {
      "lesson": 14,
      "vocabulary": "約束",
      "reading": "やくそく",
      "romaji": "yakusoku",
      "meaning": "promise"
    }
  ],
  "束": [
    {
      "lesson": 14,
      "vocabulary": "約束",
      "reading": "やくそく",
      "romaji": "yakusoku",
      "meaning": "promise"
    }
  ],
  "手": [
    {
      "lesson": 14,
      "vocabulary": "手紙",
      "reading": "てがみ",
      "romaji": "tegami",
      "meaning": "letter"
    },
    {
      "lesson": 27,
      "vocabulary": "上手",
      "reading": "じょうず",
      "romaji": "jouzu",
      "meaning": "skillful / good at"
    },
    {
      "lesson": 27,
      "vocabulary": "下手",
      "reading": "へた",
      "romaji": "heta",
      "meaning": "poor at / unskillful"
    },
    {
      "lesson": 27,
      "vocabulary": "苦手",
      "reading": "にがて",
      "romaji": "nigate",
      "meaning": "one's weak point / dislike doing"
    }
  ],
  "紙": [
    {
      "lesson": 14,
      "vocabulary": "手紙",
      "reading": "てがみ",
      "romaji": "tegami",
      "meaning": "letter"
    }
  ],
  "映": [
    {
      "lesson": 14,
      "vocabulary": "映画",
      "reading": "えいが",
      "romaji": "eiga",
      "meaning": "movie"
    }
  ],
  "画": [
    {
      "lesson": 14,
      "vocabulary": "映画",
      "reading": "えいが",
      "romaji": "eiga",
      "meaning": "movie"
    }
  ],
  "店": [
    {
      "lesson": 14,
      "vocabulary": "店",
      "reading": "みせ",
      "romaji": "mise",
      "meaning": "shop"
    }
  ],
  "週": [
    {
      "lesson": 14,
      "vocabulary": "週末",
      "reading": "しゅうまつ",
      "romaji": "shuumatsu",
      "meaning": "weekend"
    },
    {
      "lesson": 22,
      "vocabulary": "今週",
      "reading": "こんしゅう",
      "romaji": "konshuu",
      "meaning": "this week"
    },
    {
      "lesson": 22,
      "vocabulary": "来週",
      "reading": "らいしゅう",
      "romaji": "raishuu",
      "meaning": "next week"
    },
    {
      "lesson": 22,
      "vocabulary": "先週",
      "reading": "せんしゅう",
      "romaji": "senshuu",
      "meaning": "last week"
    }
  ],
  "末": [
    {
      "lesson": 14,
      "vocabulary": "週末",
      "reading": "しゅうまつ",
      "romaji": "shuumatsu",
      "meaning": "weekend"
    }
  ],
  "物": [
    {
      "lesson": 14,
      "vocabulary": "買い物",
      "reading": "かいもの",
      "romaji": "kaimono",
      "meaning": "shopping"
    },
    {
      "lesson": 21,
      "vocabulary": "荷物",
      "reading": "にもつ",
      "romaji": "nimotsu",
      "meaning": "luggage"
    },
    {
      "lesson": 24,
      "vocabulary": "物",
      "reading": "もの",
      "romaji": "mono",
      "meaning": "thing"
    }
  ],
  "公": [
    {
      "lesson": 14,
      "vocabulary": "公園",
      "reading": "こうえん",
      "romaji": "kouen",
      "meaning": "public park"
    }
  ],
  "園": [
    {
      "lesson": 14,
      "vocabulary": "公園",
      "reading": "こうえん",
      "romaji": "kouen",
      "meaning": "public park"
    }
  ],
  "大": [
    {
      "lesson": 15,
      "vocabulary": "大きい",
      "reading": "おおきい",
      "romaji": "ookii",
      "meaning": "big"
    },
    {
      "lesson": 16,
      "vocabulary": "大好き",
      "reading": "だいすき",
      "romaji": "daisuki",
      "meaning": "very fond of"
    },
    {
      "lesson": 16,
      "vocabulary": "大切",
      "reading": "たいせつ",
      "romaji": "taisetsu",
      "meaning": "important"
    },
    {
      "lesson": 16,
      "vocabulary": "大丈夫",
      "reading": "だいじょうぶ",
      "romaji": "daijoubu",
      "meaning": "all right"
    },
    {
      "lesson": 16,
      "vocabulary": "大変",
      "reading": "たいへん",
      "romaji": "taihen",
      "meaning": "tough"
    },
    {
      "lesson": 21,
      "vocabulary": "大声",
      "reading": "おおごえ",
      "romaji": "oogoe",
      "meaning": "loud voice"
    },
    {
      "lesson": 24,
      "vocabulary": "大人",
      "reading": "おとな",
      "romaji": "otona",
      "meaning": "adult"
    }
  ],
  "小": [
    {
      "lesson": 15,
      "vocabulary": "小さい",
      "reading": "ちいさい",
      "romaji": "chiisai",
      "meaning": "small"
    }
  ],
  "高": [
    {
      "lesson": 15,
      "vocabulary": "高い",
      "reading": "たかい",
      "romaji": "takai",
      "meaning": "high"
    }
  ],
  "安": [
    {
      "lesson": 15,
      "vocabulary": "安い",
      "reading": "やすい",
      "romaji": "yasui",
      "meaning": "cheap"
    }
  ],
  "新": [
    {
      "lesson": 15,
      "vocabulary": "新しい",
      "reading": "あたらしい",
      "romaji": "atarashii",
      "meaning": "new"
    },
    {
      "lesson": 23,
      "vocabulary": "新聞",
      "reading": "しんぶん",
      "romaji": "shinbun",
      "meaning": "newspaper"
    }
  ],
  "古": [
    {
      "lesson": 15,
      "vocabulary": "古い",
      "reading": "ふるい",
      "romaji": "furui",
      "meaning": "old (not of people)"
    }
  ],
  "良": [
    {
      "lesson": 15,
      "vocabulary": "良い",
      "reading": "いい",
      "romaji": "ii",
      "meaning": "good"
    }
  ],
  "悪": [
    {
      "lesson": 15,
      "vocabulary": "悪い",
      "reading": "わるい",
      "romaji": "warui",
      "meaning": "bad"
    }
  ],
  "熱": [
    {
      "lesson": 15,
      "vocabulary": "熱い",
      "reading": "あつい",
      "romaji": "atsui",
      "meaning": "hot (thing, drink)"
    },
    {
      "lesson": 28,
      "vocabulary": "熱",
      "reading": "ねつ",
      "romaji": "netsu",
      "meaning": "fever / body temperature"
    }
  ],
  "寒": [
    {
      "lesson": 15,
      "vocabulary": "寒い",
      "reading": "さむい",
      "romaji": "samui",
      "meaning": "cold (weather)"
    }
  ],
  "冷": [
    {
      "lesson": 15,
      "vocabulary": "冷たい",
      "reading": "つめたい",
      "romaji": "tsumetai",
      "meaning": "cold (to touch)"
    }
  ],
  "美": [
    {
      "lesson": 15,
      "vocabulary": "美味しい",
      "reading": "おいしい",
      "romaji": "oishii",
      "meaning": "delicious"
    },
    {
      "lesson": 21,
      "vocabulary": "美術館",
      "reading": "びじゅつかん",
      "romaji": "bijutsukan",
      "meaning": "art museum"
    }
  ],
  "味": [
    {
      "lesson": 15,
      "vocabulary": "美味しい",
      "reading": "おいしい",
      "romaji": "oishii",
      "meaning": "delicious"
    },
    {
      "lesson": 23,
      "vocabulary": "意味",
      "reading": "いみ",
      "romaji": "imi",
      "meaning": "meaning"
    },
    {
      "lesson": 25,
      "vocabulary": "趣味",
      "reading": "しゅみ",
      "romaji": "shumi",
      "meaning": "hobby / pastime"
    }
  ],
  "楽": [
    {
      "lesson": 15,
      "vocabulary": "楽しい",
      "reading": "たのしい",
      "romaji": "tanoshii",
      "meaning": "enjoyable"
    },
    {
      "lesson": 25,
      "vocabulary": "音楽",
      "reading": "おんがく",
      "romaji": "ongaku",
      "meaning": "music"
    }
  ],
  "面": [
    {
      "lesson": 15,
      "vocabulary": "面白い",
      "reading": "おもしろい",
      "romaji": "omoshiroi",
      "meaning": "interesting"
    }
  ],
  "白": [
    {
      "lesson": 15,
      "vocabulary": "面白い",
      "reading": "おもしろい",
      "romaji": "omoshiroi",
      "meaning": "interesting"
    }
  ],
  "忙": [
    {
      "lesson": 15,
      "vocabulary": "忙しい",
      "reading": "いそがしい",
      "romaji": "isogashii",
      "meaning": "busy"
    }
  ],
  "暑": [
    {
      "lesson": 15,
      "vocabulary": "暑い",
      "reading": "あつい",
      "romaji": "atsui",
      "meaning": "hot (weather)"
    }
  ],
  "静": [
    {
      "lesson": 16,
      "vocabulary": "静か",
      "reading": "しずか",
      "romaji": "shizuka",
      "meaning": "quiet"
    },
    {
      "lesson": 21,
      "vocabulary": "静か",
      "reading": "しずか",
      "romaji": "shizuka",
      "meaning": "quiet"
    }
  ],
  "賑": [
    {
      "lesson": 16,
      "vocabulary": "賑やか",
      "reading": "にぎやか",
      "romaji": "nigiyaka",
      "meaning": "lively"
    }
  ],
  "有": [
    {
      "lesson": 16,
      "vocabulary": "有名",
      "reading": "ゆうめい",
      "romaji": "yuumei",
      "meaning": "famous"
    }
  ],
  "親": [
    {
      "lesson": 16,
      "vocabulary": "親切",
      "reading": "しんせつ",
      "romaji": "shinsetsu",
      "meaning": "kind"
    }
  ],
  "切": [
    {
      "lesson": 16,
      "vocabulary": "親切",
      "reading": "しんせつ",
      "romaji": "shinsetsu",
      "meaning": "kind"
    },
    {
      "lesson": 16,
      "vocabulary": "大切",
      "reading": "たいせつ",
      "romaji": "taisetsu",
      "meaning": "important"
    },
    {
      "lesson": 25,
      "vocabulary": "切符",
      "reading": "きっぷ",
      "romaji": "kippu",
      "meaning": "ticket (train/bus)"
    }
  ],
  "元": [
    {
      "lesson": 16,
      "vocabulary": "元気",
      "reading": "げんき",
      "romaji": "genki",
      "meaning": "healthy"
    }
  ],
  "気": [
    {
      "lesson": 16,
      "vocabulary": "元気",
      "reading": "げんき",
      "romaji": "genki",
      "meaning": "healthy"
    },
    {
      "lesson": 23,
      "vocabulary": "天気予報",
      "reading": "てんきよほう",
      "romaji": "tenkiyohou",
      "meaning": "weather forecast"
    },
    {
      "lesson": 28,
      "vocabulary": "病気",
      "reading": "びょうき",
      "romaji": "byouki",
      "meaning": "illness / disease"
    },
    {
      "lesson": 29,
      "vocabulary": "気をつける",
      "reading": "きをつける",
      "romaji": "ki o tsukeru",
      "meaning": "to be careful / take care"
    }
  ],
  "暇": [
    {
      "lesson": 16,
      "vocabulary": "暇",
      "reading": "ひま",
      "romaji": "hima",
      "meaning": "free time"
    }
  ],
  "便": [
    {
      "lesson": 16,
      "vocabulary": "便利",
      "reading": "べんり",
      "romaji": "benri",
      "meaning": "convenient"
    },
    {
      "lesson": 16,
      "vocabulary": "不便",
      "reading": "ふべん",
      "romaji": "fuben",
      "meaning": "inconvenient"
    }
  ],
  "利": [
    {
      "lesson": 16,
      "vocabulary": "便利",
      "reading": "べんり",
      "romaji": "benri",
      "meaning": "convenient"
    }
  ],
  "不": [
    {
      "lesson": 16,
      "vocabulary": "不便",
      "reading": "ふべん",
      "romaji": "fuben",
      "meaning": "inconvenient"
    }
  ],
  "綺": [
    {
      "lesson": 16,
      "vocabulary": "綺麗",
      "reading": "きれい",
      "romaji": "kirei",
      "meaning": "pretty"
    }
  ],
  "麗": [
    {
      "lesson": 16,
      "vocabulary": "綺麗",
      "reading": "きれい",
      "romaji": "kirei",
      "meaning": "pretty"
    }
  ],
  "好": [
    {
      "lesson": 16,
      "vocabulary": "好き",
      "reading": "すき",
      "romaji": "suki",
      "meaning": "liked"
    },
    {
      "lesson": 16,
      "vocabulary": "大好き",
      "reading": "だいすき",
      "romaji": "daisuki",
      "meaning": "very fond of"
    }
  ],
  "嫌": [
    {
      "lesson": 16,
      "vocabulary": "嫌い",
      "reading": "きらい",
      "romaji": "kirai",
      "meaning": "disliked"
    }
  ],
  "丈": [
    {
      "lesson": 16,
      "vocabulary": "大丈夫",
      "reading": "だいじょうぶ",
      "romaji": "daijoubu",
      "meaning": "all right"
    }
  ],
  "夫": [
    {
      "lesson": 16,
      "vocabulary": "大丈夫",
      "reading": "だいじょうぶ",
      "romaji": "daijoubu",
      "meaning": "all right"
    }
  ],
  "簡": [
    {
      "lesson": 16,
      "vocabulary": "簡単",
      "reading": "かんたん",
      "romaji": "kantan",
      "meaning": "simple"
    }
  ],
  "単": [
    {
      "lesson": 16,
      "vocabulary": "簡単",
      "reading": "かんたん",
      "romaji": "kantan",
      "meaning": "simple"
    }
  ],
  "変": [
    {
      "lesson": 16,
      "vocabulary": "大変",
      "reading": "たいへん",
      "romaji": "taihen",
      "meaning": "tough"
    }
  ],
  "番": [
    {
      "lesson": 17,
      "vocabulary": "一番",
      "reading": "いちばん",
      "romaji": "ichiban",
      "meaning": "most"
    },
    {
      "lesson": 20,
      "vocabulary": "番号",
      "reading": "ばんごう",
      "romaji": "bangou",
      "meaning": "number"
    }
  ],
  "少": [
    {
      "lesson": 17,
      "vocabulary": "少し",
      "reading": "すこし",
      "romaji": "sukoshi",
      "meaning": "a little"
    }
  ],
  "全": [
    {
      "lesson": 17,
      "vocabulary": "全然",
      "reading": "ぜんぜん",
      "romaji": "zenzen",
      "meaning": "not at all (with neg)"
    }
  ],
  "然": [
    {
      "lesson": 17,
      "vocabulary": "全然",
      "reading": "ぜんぜん",
      "romaji": "zenzen",
      "meaning": "not at all (with neg)"
    }
  ],
  "世": [
    {
      "lesson": 17,
      "vocabulary": "世界",
      "reading": "せかい",
      "romaji": "sekai",
      "meaning": "world"
    }
  ],
  "界": [
    {
      "lesson": 17,
      "vocabulary": "世界",
      "reading": "せかい",
      "romaji": "sekai",
      "meaning": "world"
    }
  ],
  "季": [
    {
      "lesson": 17,
      "vocabulary": "季節",
      "reading": "きせつ",
      "romaji": "kisetsu",
      "meaning": "season"
    }
  ],
  "節": [
    {
      "lesson": 17,
      "vocabulary": "季節",
      "reading": "きせつ",
      "romaji": "kisetsu",
      "meaning": "season"
    }
  ],
  "春": [
    {
      "lesson": 17,
      "vocabulary": "春",
      "reading": "はる",
      "romaji": "haru",
      "meaning": "spring"
    }
  ],
  "夏": [
    {
      "lesson": 17,
      "vocabulary": "夏",
      "reading": "なつ",
      "romaji": "natsu",
      "meaning": "summer"
    }
  ],
  "秋": [
    {
      "lesson": 17,
      "vocabulary": "秋",
      "reading": "あき",
      "romaji": "aki",
      "meaning": "autumn"
    }
  ],
  "冬": [
    {
      "lesson": 17,
      "vocabulary": "冬",
      "reading": "ふゆ",
      "romaji": "fuyu",
      "meaning": "winter"
    }
  ],
  "入": [
    {
      "lesson": 18,
      "vocabulary": "入る",
      "reading": "はいる",
      "romaji": "hairu",
      "meaning": "to enter"
    },
    {
      "lesson": 21,
      "vocabulary": "入口",
      "reading": "いりぐち",
      "romaji": "iriguchi",
      "meaning": "entrance"
    }
  ],
  "洗": [
    {
      "lesson": 19,
      "vocabulary": "洗う",
      "reading": "あらう",
      "romaji": "arau",
      "meaning": "to wash"
    },
    {
      "lesson": 26,
      "vocabulary": "洗濯",
      "reading": "せんたく",
      "romaji": "sentaku",
      "meaning": "laundry"
    }
  ],
  "立": [
    {
      "lesson": 19,
      "vocabulary": "立つ",
      "reading": "たつ",
      "romaji": "tatsu",
      "meaning": "to stand up"
    }
  ],
  "座": [
    {
      "lesson": 19,
      "vocabulary": "座る",
      "reading": "すわる",
      "romaji": "suwaru",
      "meaning": "to sit down"
    }
  ],
  "取": [
    {
      "lesson": 19,
      "vocabulary": "取る",
      "reading": "とる",
      "romaji": "toru",
      "meaning": "to take"
    }
  ],
  "呼": [
    {
      "lesson": 19,
      "vocabulary": "呼ぶ",
      "reading": "よぶ",
      "romaji": "yobu",
      "meaning": "to call out"
    }
  ],
  "遊": [
    {
      "lesson": 19,
      "vocabulary": "遊ぶ",
      "reading": "あそぶ",
      "romaji": "asobu",
      "meaning": "to play"
    }
  ],
  "歩": [
    {
      "lesson": 19,
      "vocabulary": "歩く",
      "reading": "あるく",
      "romaji": "aruku",
      "meaning": "to walk"
    },
    {
      "lesson": 26,
      "vocabulary": "散歩",
      "reading": "さんぽ",
      "romaji": "sanpo",
      "meaning": "walk / stroll"
    }
  ],
  "泳": [
    {
      "lesson": 19,
      "vocabulary": "泳ぐ",
      "reading": "およぐ",
      "romaji": "oyogu",
      "meaning": "to swim"
    }
  ],
  "急": [
    {
      "lesson": 19,
      "vocabulary": "急ぐ",
      "reading": "いそぐ",
      "romaji": "isogu",
      "meaning": "to hurry"
    }
  ],
  "出": [
    {
      "lesson": 19,
      "vocabulary": "出す",
      "reading": "だす",
      "romaji": "dasu",
      "meaning": "to take out"
    },
    {
      "lesson": 21,
      "vocabulary": "出口",
      "reading": "でぐち",
      "romaji": "deguchi",
      "meaning": "exit"
    },
    {
      "lesson": 28,
      "vocabulary": "提出",
      "reading": "ていしゅつ",
      "romaji": "teishutsu",
      "meaning": "submission / turning in"
    }
  ],
  "借": [
    {
      "lesson": 19,
      "vocabulary": "借りる",
      "reading": "かりる",
      "romaji": "kariru",
      "meaning": "to borrow"
    }
  ],
  "貸": [
    {
      "lesson": 19,
      "vocabulary": "貸す",
      "reading": "かす",
      "romaji": "kasu",
      "meaning": "to lend"
    }
  ],
  "開": [
    {
      "lesson": 19,
      "vocabulary": "開ける",
      "reading": "あける",
      "romaji": "akeru",
      "meaning": "to open (transitive)"
    }
  ],
  "閉": [
    {
      "lesson": 19,
      "vocabulary": "閉める",
      "reading": "しめる",
      "romaji": "shimeru",
      "meaning": "to close (transitive)"
    }
  ],
  "住": [
    {
      "lesson": 20,
      "vocabulary": "住む",
      "reading": "すむ",
      "romaji": "sumu",
      "meaning": "to live"
    },
    {
      "lesson": 20,
      "vocabulary": "住所",
      "reading": "じゅうしょ",
      "romaji": "juusho",
      "meaning": "address"
    }
  ],
  "知": [
    {
      "lesson": 20,
      "vocabulary": "知る",
      "reading": "しる",
      "romaji": "shiru",
      "meaning": "to know"
    }
  ],
  "持": [
    {
      "lesson": 20,
      "vocabulary": "持つ",
      "reading": "もつ",
      "romaji": "motsu",
      "meaning": "to hold"
    }
  ],
  "働": [
    {
      "lesson": 20,
      "vocabulary": "働く",
      "reading": "はたらく",
      "romaji": "hataraku",
      "meaning": "to work"
    }
  ],
  "覚": [
    {
      "lesson": 20,
      "vocabulary": "覚える",
      "reading": "おぼえる",
      "romaji": "oboeru",
      "meaning": "to memorize"
    }
  ],
  "忘": [
    {
      "lesson": 20,
      "vocabulary": "忘れる",
      "reading": "わすれる",
      "romaji": "wasureru",
      "meaning": "to forget"
    }
  ],
  "着": [
    {
      "lesson": 20,
      "vocabulary": "着る",
      "reading": "きる",
      "romaji": "kiru",
      "meaning": "to wear (upper body)"
    }
  ],
  "履": [
    {
      "lesson": 20,
      "vocabulary": "履く",
      "reading": "はく",
      "romaji": "haku",
      "meaning": "to wear (lower body/shoes)"
    }
  ],
  "結": [
    {
      "lesson": 20,
      "vocabulary": "結婚",
      "reading": "けっこん",
      "romaji": "kekkon",
      "meaning": "marriage"
    }
  ],
  "婚": [
    {
      "lesson": 20,
      "vocabulary": "結婚",
      "reading": "けっこん",
      "romaji": "kekkon",
      "meaning": "marriage"
    }
  ],
  "独": [
    {
      "lesson": 20,
      "vocabulary": "独身",
      "reading": "どくしん",
      "romaji": "dokushin",
      "meaning": "single"
    }
  ],
  "身": [
    {
      "lesson": 20,
      "vocabulary": "独身",
      "reading": "どくしん",
      "romaji": "dokushin",
      "meaning": "single"
    }
  ],
  "所": [
    {
      "lesson": 20,
      "vocabulary": "住所",
      "reading": "じゅうしょ",
      "romaji": "juusho",
      "meaning": "address"
    },
    {
      "lesson": 24,
      "vocabulary": "場所",
      "reading": "ばしょ",
      "romaji": "basho",
      "meaning": "place"
    }
  ],
  "号": [
    {
      "lesson": 20,
      "vocabulary": "番号",
      "reading": "ばんごう",
      "romaji": "bangou",
      "meaning": "number"
    }
  ],
  "写": [
    {
      "lesson": 21,
      "vocabulary": "写真",
      "reading": "しゃしん",
      "romaji": "shashin",
      "meaning": "photograph"
    }
  ],
  "真": [
    {
      "lesson": 21,
      "vocabulary": "写真",
      "reading": "しゃしん",
      "romaji": "shashin",
      "meaning": "photograph"
    }
  ],
  "撮": [
    {
      "lesson": 21,
      "vocabulary": "撮る",
      "reading": "とる",
      "romaji": "toru",
      "meaning": "to take (a photo)"
    }
  ],
  "吸": [
    {
      "lesson": 21,
      "vocabulary": "吸う",
      "reading": "すう",
      "romaji": "suu",
      "meaning": "to smoke"
    }
  ],
  "病": [
    {
      "lesson": 21,
      "vocabulary": "病院",
      "reading": "びょういん",
      "romaji": "byouin",
      "meaning": "hospital"
    },
    {
      "lesson": 28,
      "vocabulary": "病気",
      "reading": "びょうき",
      "romaji": "byouki",
      "meaning": "illness / disease"
    }
  ],
  "院": [
    {
      "lesson": 21,
      "vocabulary": "病院",
      "reading": "びょういん",
      "romaji": "byouin",
      "meaning": "hospital"
    }
  ],
  "術": [
    {
      "lesson": 21,
      "vocabulary": "美術館",
      "reading": "びじゅつかん",
      "romaji": "bijutsukan",
      "meaning": "art museum"
    }
  ],
  "声": [
    {
      "lesson": 21,
      "vocabulary": "大声",
      "reading": "おおごえ",
      "romaji": "oogoe",
      "meaning": "loud voice"
    }
  ],
  "窓": [
    {
      "lesson": 21,
      "vocabulary": "窓",
      "reading": "まど",
      "romaji": "mado",
      "meaning": "window"
    }
  ],
  "席": [
    {
      "lesson": 21,
      "vocabulary": "席",
      "reading": "せき",
      "romaji": "seki",
      "meaning": "seat"
    }
  ],
  "荷": [
    {
      "lesson": 21,
      "vocabulary": "荷物",
      "reading": "にもつ",
      "romaji": "nimotsu",
      "meaning": "luggage"
    }
  ],
  "当": [
    {
      "lesson": 22,
      "vocabulary": "本当",
      "reading": "ほんとう",
      "romaji": "hontou",
      "meaning": "truth"
    },
    {
      "lesson": 24,
      "vocabulary": "お弁当",
      "reading": "おべんとう",
      "romaji": "obentou",
      "meaning": "boxed lunch"
    }
  ],
  "嘘": [
    {
      "lesson": 22,
      "vocabulary": "嘘",
      "reading": "うそ",
      "romaji": "uso",
      "meaning": "lie"
    }
  ],
  "多": [
    {
      "lesson": 22,
      "vocabulary": "多分",
      "reading": "たぶん",
      "romaji": "tabun",
      "meaning": "probably"
    }
  ],
  "晩": [
    {
      "lesson": 22,
      "vocabulary": "今晩",
      "reading": "こんばん",
      "romaji": "konban",
      "meaning": "this evening"
    }
  ],
  "宿": [
    {
      "lesson": 22,
      "vocabulary": "宿題",
      "reading": "しゅくだい",
      "romaji": "shukudai",
      "meaning": "homework"
    }
  ],
  "題": [
    {
      "lesson": 22,
      "vocabulary": "宿題",
      "reading": "しゅくだい",
      "romaji": "shukudai",
      "meaning": "homework"
    }
  ],
  "授": [
    {
      "lesson": 22,
      "vocabulary": "授業",
      "reading": "じゅぎょう",
      "romaji": "jugyou",
      "meaning": "class"
    }
  ],
  "業": [
    {
      "lesson": 22,
      "vocabulary": "授業",
      "reading": "じゅぎょう",
      "romaji": "jugyou",
      "meaning": "class"
    }
  ],
  "休": [
    {
      "lesson": 22,
      "vocabulary": "休み",
      "reading": "やすみ",
      "romaji": "yasumi",
      "meaning": "rest"
    },
    {
      "lesson": 28,
      "vocabulary": "休む",
      "reading": "やすむ",
      "romaji": "yasumu",
      "meaning": "to take time off / rest"
    }
  ],
  "思": [
    {
      "lesson": 23,
      "vocabulary": "思う",
      "reading": "おもう",
      "romaji": "omou",
      "meaning": "to think"
    }
  ],
  "言": [
    {
      "lesson": 23,
      "vocabulary": "言う",
      "reading": "いう",
      "romaji": "iu",
      "meaning": "to say"
    },
    {
      "lesson": 23,
      "vocabulary": "言葉",
      "reading": "ことば",
      "romaji": "kotoba",
      "meaning": "word"
    }
  ],
  "考": [
    {
      "lesson": 23,
      "vocabulary": "考える",
      "reading": "かんがえる",
      "romaji": "kangaeru",
      "meaning": "to think over"
    }
  ],
  "意": [
    {
      "lesson": 23,
      "vocabulary": "意見",
      "reading": "いけん",
      "romaji": "iken",
      "meaning": "opinion"
    },
    {
      "lesson": 23,
      "vocabulary": "意味",
      "reading": "いみ",
      "romaji": "imi",
      "meaning": "meaning"
    },
    {
      "lesson": 27,
      "vocabulary": "得意",
      "reading": "とくい",
      "romaji": "tokui",
      "meaning": "one's strength / proud of"
    }
  ],
  "質": [
    {
      "lesson": 23,
      "vocabulary": "質問",
      "reading": "しつもん",
      "romaji": "shitsumon",
      "meaning": "question"
    }
  ],
  "問": [
    {
      "lesson": 23,
      "vocabulary": "質問",
      "reading": "しつもん",
      "romaji": "shitsumon",
      "meaning": "question"
    }
  ],
  "答": [
    {
      "lesson": 23,
      "vocabulary": "答える",
      "reading": "こたえる",
      "romaji": "kotaeru",
      "meaning": "to answer"
    }
  ],
  "雑": [
    {
      "lesson": 23,
      "vocabulary": "雑誌",
      "reading": "ざっし",
      "romaji": "zasshi",
      "meaning": "magazine"
    }
  ],
  "誌": [
    {
      "lesson": 23,
      "vocabulary": "雑誌",
      "reading": "ざっし",
      "romaji": "zasshi",
      "meaning": "magazine"
    }
  ],
  "葉": [
    {
      "lesson": 23,
      "vocabulary": "言葉",
      "reading": "ことば",
      "romaji": "kotoba",
      "meaning": "word"
    }
  ],
  "文": [
    {
      "lesson": 23,
      "vocabulary": "文化",
      "reading": "ぶんか",
      "romaji": "bunka",
      "meaning": "culture"
    }
  ],
  "化": [
    {
      "lesson": 23,
      "vocabulary": "文化",
      "reading": "ぶんか",
      "romaji": "bunka",
      "meaning": "culture"
    }
  ],
  "将": [
    {
      "lesson": 23,
      "vocabulary": "将来",
      "reading": "しょうらい",
      "romaji": "shourai",
      "meaning": "future (personal/near)"
    }
  ],
  "天": [
    {
      "lesson": 23,
      "vocabulary": "天気予報",
      "reading": "てんきよほう",
      "romaji": "tenkiyohou",
      "meaning": "weather forecast"
    }
  ],
  "予": [
    {
      "lesson": 23,
      "vocabulary": "天気予報",
      "reading": "てんきよほう",
      "romaji": "tenkiyohou",
      "meaning": "weather forecast"
    },
    {
      "lesson": 30,
      "vocabulary": "予定",
      "reading": "よてい",
      "romaji": "yotei",
      "meaning": "plan / schedule"
    }
  ],
  "報": [
    {
      "lesson": 23,
      "vocabulary": "天気予報",
      "reading": "てんきよほう",
      "romaji": "tenkiyohou",
      "meaning": "weather forecast"
    }
  ],
  "方": [
    {
      "lesson": 24,
      "vocabulary": "方",
      "reading": "かた",
      "romaji": "kata",
      "meaning": "person (polite)"
    }
  ],
  "料": [
    {
      "lesson": 24,
      "vocabulary": "料理",
      "reading": "りょうり",
      "romaji": "ryouri",
      "meaning": "cooking"
    }
  ],
  "理": [
    {
      "lesson": 24,
      "vocabulary": "料理",
      "reading": "りょうり",
      "romaji": "ryouri",
      "meaning": "cooking"
    },
    {
      "lesson": 28,
      "vocabulary": "無理",
      "reading": "むり",
      "romaji": "muri",
      "meaning": "impossible / overdoing it"
    },
    {
      "lesson": 30,
      "vocabulary": "理由",
      "reading": "りゆう",
      "romaji": "riyuu",
      "meaning": "reason"
    }
  ],
  "弁": [
    {
      "lesson": 24,
      "vocabulary": "お弁当",
      "reading": "おべんとう",
      "romaji": "obentou",
      "meaning": "boxed lunch"
    }
  ],
  "菓": [
    {
      "lesson": 24,
      "vocabulary": "お菓子",
      "reading": "おかし",
      "romaji": "okashi",
      "meaning": "confections"
    }
  ],
  "服": [
    {
      "lesson": 24,
      "vocabulary": "服",
      "reading": "ふく",
      "romaji": "fuku",
      "meaning": "clothes"
    }
  ],
  "靴": [
    {
      "lesson": 24,
      "vocabulary": "靴",
      "reading": "くつ",
      "romaji": "kutsu",
      "meaning": "shoes"
    }
  ],
  "帽": [
    {
      "lesson": 24,
      "vocabulary": "帽子",
      "reading": "ぼうし",
      "romaji": "boushi",
      "meaning": "hat"
    }
  ],
  "眼": [
    {
      "lesson": 24,
      "vocabulary": "眼鏡",
      "reading": "めがね",
      "romaji": "megane",
      "meaning": "glasses"
    }
  ],
  "鏡": [
    {
      "lesson": 24,
      "vocabulary": "眼鏡",
      "reading": "めがね",
      "romaji": "megane",
      "meaning": "glasses"
    }
  ],
  "場": [
    {
      "lesson": 24,
      "vocabulary": "場所",
      "reading": "ばしょ",
      "romaji": "basho",
      "meaning": "place"
    }
  ],
  "町": [
    {
      "lesson": 24,
      "vocabulary": "町",
      "reading": "まち",
      "romaji": "machi",
      "meaning": "town"
    }
  ],
  "道": [
    {
      "lesson": 24,
      "vocabulary": "道",
      "reading": "みち",
      "romaji": "michi",
      "meaning": "road"
    }
  ],
  "作": [
    {
      "lesson": 24,
      "vocabulary": "作る",
      "reading": "つくる",
      "romaji": "tsukuru",
      "meaning": "to make"
    }
  ],
  "脱": [
    {
      "lesson": 24,
      "vocabulary": "脱ぐ",
      "reading": "ぬぐ",
      "romaji": "nugu",
      "meaning": "to take off (clothes, shoes)"
    }
  ],
  "落": [
    {
      "lesson": 24,
      "vocabulary": "落とす",
      "reading": "おとす",
      "romaji": "otosu",
      "meaning": "to drop"
    }
  ],
  "旅": [
    {
      "lesson": 25,
      "vocabulary": "旅行",
      "reading": "りょこう",
      "romaji": "ryokou",
      "meaning": "travel / trip"
    }
  ],
  "観": [
    {
      "lesson": 25,
      "vocabulary": "観光",
      "reading": "かんこう",
      "romaji": "kankou",
      "meaning": "sightseeing / tourism"
    }
  ],
  "光": [
    {
      "lesson": 25,
      "vocabulary": "観光",
      "reading": "かんこう",
      "romaji": "kankou",
      "meaning": "sightseeing / tourism"
    }
  ],
  "土": [
    {
      "lesson": 25,
      "vocabulary": "お土産",
      "reading": "おみやげ",
      "romaji": "omiyage",
      "meaning": "souvenir / local gift"
    }
  ],
  "産": [
    {
      "lesson": 25,
      "vocabulary": "お土産",
      "reading": "おみやげ",
      "romaji": "omiyage",
      "meaning": "souvenir / local gift"
    }
  ],
  "符": [
    {
      "lesson": 25,
      "vocabulary": "切符",
      "reading": "きっぷ",
      "romaji": "kippu",
      "meaning": "ticket (train/bus)"
    }
  ],
  "飛": [
    {
      "lesson": 25,
      "vocabulary": "飛行機",
      "reading": "ひこうき",
      "romaji": "hikouki",
      "meaning": "airplane"
    }
  ],
  "機": [
    {
      "lesson": 25,
      "vocabulary": "飛行機",
      "reading": "ひこうき",
      "romaji": "hikouki",
      "meaning": "airplane"
    }
  ],
  "空": [
    {
      "lesson": 25,
      "vocabulary": "空港",
      "reading": "くうこう",
      "romaji": "kuukou",
      "meaning": "airport"
    }
  ],
  "港": [
    {
      "lesson": 25,
      "vocabulary": "空港",
      "reading": "くうこう",
      "romaji": "kuukou",
      "meaning": "airport"
    }
  ],
  "趣": [
    {
      "lesson": 25,
      "vocabulary": "趣味",
      "reading": "しゅみ",
      "romaji": "shumi",
      "meaning": "hobby / pastime"
    }
  ],
  "音": [
    {
      "lesson": 25,
      "vocabulary": "音楽",
      "reading": "おんがく",
      "romaji": "ongaku",
      "meaning": "music"
    },
    {
      "lesson": 27,
      "vocabulary": "発音",
      "reading": "はつおん",
      "romaji": "hatsuon",
      "meaning": "pronunciation"
    }
  ],
  "歌": [
    {
      "lesson": 25,
      "vocabulary": "歌",
      "reading": "うた",
      "romaji": "uta",
      "meaning": "song"
    },
    {
      "lesson": 25,
      "vocabulary": "歌う",
      "reading": "うたう",
      "romaji": "utau",
      "meaning": "to sing"
    }
  ],
  "欲": [
    {
      "lesson": 25,
      "vocabulary": "欲しい",
      "reading": "ほしい",
      "romaji": "hoshii",
      "meaning": "wanted / desirable"
    }
  ],
  "金": [
    {
      "lesson": 25,
      "vocabulary": "お金",
      "reading": "おかね",
      "romaji": "okane",
      "meaning": "money"
    }
  ],
  "自": [
    {
      "lesson": 25,
      "vocabulary": "自転車",
      "reading": "じてんしゃ",
      "romaji": "jitensha",
      "meaning": "bicycle"
    }
  ],
  "転": [
    {
      "lesson": 25,
      "vocabulary": "自転車",
      "reading": "じてんしゃ",
      "romaji": "jitensha",
      "meaning": "bicycle"
    },
    {
      "lesson": 27,
      "vocabulary": "運転",
      "reading": "うんてん",
      "romaji": "unten",
      "meaning": "driving (a car)"
    }
  ],
  "富": [
    {
      "lesson": 26,
      "vocabulary": "富士山",
      "reading": "ふじさん",
      "romaji": "Fujisan",
      "meaning": "Mount Fuji"
    }
  ],
  "士": [
    {
      "lesson": 26,
      "vocabulary": "富士山",
      "reading": "ふじさん",
      "romaji": "Fujisan",
      "meaning": "Mount Fuji"
    }
  ],
  "登": [
    {
      "lesson": 26,
      "vocabulary": "登る",
      "reading": "のぼる",
      "romaji": "noboru",
      "meaning": "to climb / ascend"
    }
  ],
  "温": [
    {
      "lesson": 26,
      "vocabulary": "温泉",
      "reading": "おんせん",
      "romaji": "onsen",
      "meaning": "hot spring"
    }
  ],
  "泉": [
    {
      "lesson": 26,
      "vocabulary": "温泉",
      "reading": "おんせん",
      "romaji": "onsen",
      "meaning": "hot spring"
    }
  ],
  "泊": [
    {
      "lesson": 26,
      "vocabulary": "泊まる",
      "reading": "とまる",
      "romaji": "tomaru",
      "meaning": "to stay overnight"
    }
  ],
  "乗": [
    {
      "lesson": 26,
      "vocabulary": "乗る",
      "reading": "のる",
      "romaji": "noru",
      "meaning": "to ride / board"
    }
  ],
  "度": [
    {
      "lesson": 26,
      "vocabulary": "一度",
      "reading": "いちど",
      "romaji": "ichido",
      "meaning": "once / one time"
    },
    {
      "lesson": 26,
      "vocabulary": "一度も",
      "reading": "いちども",
      "romaji": "ichidomo",
      "meaning": "not even once (with neg)"
    }
  ],
  "掃": [
    {
      "lesson": 26,
      "vocabulary": "掃除",
      "reading": "そうじ",
      "romaji": "souji",
      "meaning": "cleaning"
    }
  ],
  "除": [
    {
      "lesson": 26,
      "vocabulary": "掃除",
      "reading": "そうじ",
      "romaji": "souji",
      "meaning": "cleaning"
    }
  ],
  "濯": [
    {
      "lesson": 26,
      "vocabulary": "洗濯",
      "reading": "せんたく",
      "romaji": "sentaku",
      "meaning": "laundry"
    }
  ],
  "散": [
    {
      "lesson": 26,
      "vocabulary": "散歩",
      "reading": "さんぽ",
      "romaji": "sanpo",
      "meaning": "walk / stroll"
    }
  ],
  "運": [
    {
      "lesson": 26,
      "vocabulary": "運動",
      "reading": "うんどう",
      "romaji": "undou",
      "meaning": "physical exercise / workout"
    },
    {
      "lesson": 27,
      "vocabulary": "運転",
      "reading": "うんてん",
      "romaji": "unten",
      "meaning": "driving (a car)"
    }
  ],
  "動": [
    {
      "lesson": 26,
      "vocabulary": "運動",
      "reading": "うんどう",
      "romaji": "undou",
      "meaning": "physical exercise / workout"
    }
  ],
  "神": [
    {
      "lesson": 26,
      "vocabulary": "神社",
      "reading": "じんじゃ",
      "romaji": "jinja",
      "meaning": "Shinto shrine"
    }
  ],
  "寺": [
    {
      "lesson": 26,
      "vocabulary": "寺",
      "reading": "てら",
      "romaji": "tera",
      "meaning": "Buddhist temple"
    }
  ],
  "祭": [
    {
      "lesson": 26,
      "vocabulary": "祭り",
      "reading": "まつり",
      "romaji": "matsuri",
      "meaning": "festival"
    }
  ],
  "経": [
    {
      "lesson": 26,
      "vocabulary": "経験",
      "reading": "けいけん",
      "romaji": "keiken",
      "meaning": "experience"
    }
  ],
  "験": [
    {
      "lesson": 26,
      "vocabulary": "経験",
      "reading": "けいけん",
      "romaji": "keiken",
      "meaning": "experience"
    }
  ],
  "弾": [
    {
      "lesson": 27,
      "vocabulary": "弾く",
      "reading": "ひく",
      "romaji": "hiku",
      "meaning": "to play (piano, guitar)"
    }
  ],
  "外": [
    {
      "lesson": 27,
      "vocabulary": "外国語",
      "reading": "がいこくご",
      "romaji": "gaikokugo",
      "meaning": "foreign language"
    }
  ],
  "国": [
    {
      "lesson": 27,
      "vocabulary": "外国語",
      "reading": "がいこくご",
      "romaji": "gaikokugo",
      "meaning": "foreign language"
    },
    {
      "lesson": 27,
      "vocabulary": "中国語",
      "reading": "ちゅうごくご",
      "romaji": "chuugokugo",
      "meaning": "Chinese language"
    }
  ],
  "語": [
    {
      "lesson": 27,
      "vocabulary": "外国語",
      "reading": "がいこくご",
      "romaji": "gaikokugo",
      "meaning": "foreign language"
    },
    {
      "lesson": 27,
      "vocabulary": "英語",
      "reading": "えいご",
      "romaji": "eigo",
      "meaning": "English language"
    },
    {
      "lesson": 27,
      "vocabulary": "中国語",
      "reading": "ちゅうごくご",
      "romaji": "chuugokugo",
      "meaning": "Chinese language"
    }
  ],
  "英": [
    {
      "lesson": 27,
      "vocabulary": "英語",
      "reading": "えいご",
      "romaji": "eigo",
      "meaning": "English language"
    }
  ],
  "通": [
    {
      "lesson": 27,
      "vocabulary": "通じる",
      "reading": "つうじる",
      "romaji": "tsuujiru",
      "meaning": "to be understood / get through"
    }
  ],
  "漢": [
    {
      "lesson": 27,
      "vocabulary": "漢字",
      "reading": "かんじ",
      "romaji": "kanji",
      "meaning": "kanji"
    }
  ],
  "字": [
    {
      "lesson": 27,
      "vocabulary": "漢字",
      "reading": "かんじ",
      "romaji": "kanji",
      "meaning": "kanji"
    }
  ],
  "発": [
    {
      "lesson": 27,
      "vocabulary": "発音",
      "reading": "はつおん",
      "romaji": "hatsuon",
      "meaning": "pronunciation"
    }
  ],
  "得": [
    {
      "lesson": 27,
      "vocabulary": "得意",
      "reading": "とくい",
      "romaji": "tokui",
      "meaning": "one's strength / proud of"
    }
  ],
  "苦": [
    {
      "lesson": 27,
      "vocabulary": "苦手",
      "reading": "にがて",
      "romaji": "nigate",
      "meaning": "one's weak point / dislike doing"
    }
  ],
  "直": [
    {
      "lesson": 27,
      "vocabulary": "直す",
      "reading": "なおす",
      "romaji": "naosu",
      "meaning": "to repair / correct"
    }
  ],
  "練": [
    {
      "lesson": 27,
      "vocabulary": "練習",
      "reading": "れんしゅう",
      "romaji": "renshuu",
      "meaning": "practice / rehearsal"
    }
  ],
  "習": [
    {
      "lesson": 27,
      "vocabulary": "練習",
      "reading": "れんしゅう",
      "romaji": "renshuu",
      "meaning": "practice / rehearsal"
    }
  ],
  "薬": [
    {
      "lesson": 28,
      "vocabulary": "薬",
      "reading": "くすり",
      "romaji": "kusuri",
      "meaning": "medicine"
    }
  ],
  "風": [
    {
      "lesson": 28,
      "vocabulary": "風邪",
      "reading": "かぜ",
      "romaji": "kaze",
      "meaning": "common cold (illness)"
    },
    {
      "lesson": 30,
      "vocabulary": "台風",
      "reading": "たいふう",
      "romaji": "taifuu",
      "meaning": "typhoon"
    }
  ],
  "邪": [
    {
      "lesson": 28,
      "vocabulary": "風邪",
      "reading": "かぜ",
      "romaji": "kaze",
      "meaning": "common cold (illness)"
    }
  ],
  "医": [
    {
      "lesson": 28,
      "vocabulary": "医者",
      "reading": "いしゃ",
      "romaji": "isha",
      "meaning": "doctor / physician"
    }
  ],
  "者": [
    {
      "lesson": 28,
      "vocabulary": "医者",
      "reading": "いしゃ",
      "romaji": "isha",
      "meaning": "doctor / physician"
    }
  ],
  "保": [
    {
      "lesson": 28,
      "vocabulary": "保険証",
      "reading": "ほけんしょう",
      "romaji": "hokenshou",
      "meaning": "health insurance card"
    }
  ],
  "険": [
    {
      "lesson": 28,
      "vocabulary": "保険証",
      "reading": "ほけんしょう",
      "romaji": "hokenshou",
      "meaning": "health insurance card"
    }
  ],
  "証": [
    {
      "lesson": 28,
      "vocabulary": "保険証",
      "reading": "ほけんしょう",
      "romaji": "hokenshou",
      "meaning": "health insurance card"
    }
  ],
  "規": [
    {
      "lesson": 28,
      "vocabulary": "規則",
      "reading": "きそく",
      "romaji": "kisoku",
      "meaning": "rule / regulation"
    }
  ],
  "則": [
    {
      "lesson": 28,
      "vocabulary": "規則",
      "reading": "きそく",
      "romaji": "kisoku",
      "meaning": "rule / regulation"
    }
  ],
  "法": [
    {
      "lesson": 28,
      "vocabulary": "法律",
      "reading": "ほうりつ",
      "romaji": "houritsu",
      "meaning": "law"
    }
  ],
  "律": [
    {
      "lesson": 28,
      "vocabulary": "法律",
      "reading": "ほうりつ",
      "romaji": "houritsu",
      "meaning": "law"
    }
  ],
  "守": [
    {
      "lesson": 28,
      "vocabulary": "守る",
      "reading": "まもる",
      "romaji": "mamoru",
      "meaning": "to obey (rules) / protect"
    }
  ],
  "払": [
    {
      "lesson": 28,
      "vocabulary": "払う",
      "reading": "はらう",
      "romaji": "harau",
      "meaning": "to pay"
    }
  ],
  "渡": [
    {
      "lesson": 28,
      "vocabulary": "渡す",
      "reading": "わたす",
      "romaji": "watasu",
      "meaning": "to hand over / give"
    }
  ],
  "提": [
    {
      "lesson": 28,
      "vocabulary": "提出",
      "reading": "ていしゅつ",
      "romaji": "teishutsu",
      "meaning": "submission / turning in"
    }
  ],
  "期": [
    {
      "lesson": 28,
      "vocabulary": "期限",
      "reading": "きげん",
      "romaji": "kigen",
      "meaning": "deadline / time limit"
    }
  ],
  "限": [
    {
      "lesson": 28,
      "vocabulary": "期限",
      "reading": "きげん",
      "romaji": "kigen",
      "meaning": "deadline / time limit"
    }
  ],
  "無": [
    {
      "lesson": 28,
      "vocabulary": "無理",
      "reading": "むり",
      "romaji": "muri",
      "meaning": "impossible / overdoing it"
    }
  ],
  "体": [
    {
      "lesson": 29,
      "vocabulary": "体",
      "reading": "からだ",
      "romaji": "karada",
      "meaning": "body / physical health"
    }
  ],
  "頭": [
    {
      "lesson": 29,
      "vocabulary": "頭",
      "reading": "あたま",
      "romaji": "atama",
      "meaning": "head / mind"
    }
  ],
  "腹": [
    {
      "lesson": 29,
      "vocabulary": "お腹",
      "reading": "おなか",
      "romaji": "onaka",
      "meaning": "stomach / belly"
    }
  ],
  "痛": [
    {
      "lesson": 29,
      "vocabulary": "痛い",
      "reading": "いたい",
      "romaji": "itai",
      "meaning": "painful / sore"
    }
  ],
  "心": [
    {
      "lesson": 29,
      "vocabulary": "心配",
      "reading": "しんぱい",
      "romaji": "shinpai",
      "meaning": "worry / concern"
    }
  ],
  "配": [
    {
      "lesson": 29,
      "vocabulary": "心配",
      "reading": "しんぱい",
      "romaji": "shinpai",
      "meaning": "worry / concern"
    }
  ],
  "健": [
    {
      "lesson": 29,
      "vocabulary": "健康",
      "reading": "けんこう",
      "romaji": "kenkou",
      "meaning": "health / healthy"
    }
  ],
  "康": [
    {
      "lesson": 29,
      "vocabulary": "健康",
      "reading": "けんこう",
      "romaji": "kenkou",
      "meaning": "health / healthy"
    }
  ],
  "野": [
    {
      "lesson": 29,
      "vocabulary": "野菜",
      "reading": "やさい",
      "romaji": "yasai",
      "meaning": "vegetables"
    }
  ],
  "菜": [
    {
      "lesson": 29,
      "vocabulary": "野菜",
      "reading": "やさい",
      "romaji": "yasai",
      "meaning": "vegetables"
    }
  ],
  "早": [
    {
      "lesson": 29,
      "vocabulary": "早く",
      "reading": "はやく",
      "romaji": "hayaku",
      "meaning": "early / quickly"
    }
  ],
  "睡": [
    {
      "lesson": 29,
      "vocabulary": "睡眠",
      "reading": "すいみん",
      "romaji": "suimin",
      "meaning": "sleep"
    }
  ],
  "眠": [
    {
      "lesson": 29,
      "vocabulary": "睡眠",
      "reading": "すいみん",
      "romaji": "suimin",
      "meaning": "sleep"
    }
  ],
  "甘": [
    {
      "lesson": 29,
      "vocabulary": "甘い",
      "reading": "あまい",
      "romaji": "amai",
      "meaning": "sweet"
    }
  ],
  "辛": [
    {
      "lesson": 29,
      "vocabulary": "辛い",
      "reading": "からい",
      "romaji": "karai",
      "meaning": "spicy / hot"
    }
  ],
  "塩": [
    {
      "lesson": 29,
      "vocabulary": "塩",
      "reading": "しお",
      "romaji": "shio",
      "meaning": "salt"
    }
  ],
  "砂": [
    {
      "lesson": 29,
      "vocabulary": "砂糖",
      "reading": "さとう",
      "romaji": "satou",
      "meaning": "sugar"
    }
  ],
  "糖": [
    {
      "lesson": 29,
      "vocabulary": "砂糖",
      "reading": "さとう",
      "romaji": "satou",
      "meaning": "sugar"
    }
  ],
  "都": [
    {
      "lesson": 30,
      "vocabulary": "都合",
      "reading": "つごう",
      "romaji": "tsugou",
      "meaning": "convenience / circumstances"
    }
  ],
  "合": [
    {
      "lesson": 30,
      "vocabulary": "都合",
      "reading": "つごう",
      "romaji": "tsugou",
      "meaning": "convenience / circumstances"
    },
    {
      "lesson": 30,
      "vocabulary": "間に合う",
      "reading": "まにあう",
      "romaji": "maniau",
      "meaning": "to be in time (for a train/class)"
    }
  ],
  "用": [
    {
      "lesson": 30,
      "vocabulary": "用事",
      "reading": "ようじ",
      "romaji": "youji",
      "meaning": "errand / business to do"
    }
  ],
  "事": [
    {
      "lesson": 30,
      "vocabulary": "用事",
      "reading": "ようじ",
      "romaji": "youji",
      "meaning": "errand / business to do"
    },
    {
      "lesson": 30,
      "vocabulary": "事故",
      "reading": "じこ",
      "romaji": "jiko",
      "meaning": "accident / incident"
    },
    {
      "lesson": 30,
      "vocabulary": "火事",
      "reading": "かじ",
      "romaji": "kaji",
      "meaning": "fire (incident)"
    }
  ],
  "定": [
    {
      "lesson": 30,
      "vocabulary": "予定",
      "reading": "よてい",
      "romaji": "yotei",
      "meaning": "plan / schedule"
    }
  ],
  "遅": [
    {
      "lesson": 30,
      "vocabulary": "遅れる",
      "reading": "おくれる",
      "romaji": "okureru",
      "meaning": "to be late / delayed"
    }
  ],
  "間": [
    {
      "lesson": 30,
      "vocabulary": "間に合う",
      "reading": "まにあう",
      "romaji": "maniau",
      "meaning": "to be in time (for a train/class)"
    }
  ],
  "故": [
    {
      "lesson": 30,
      "vocabulary": "事故",
      "reading": "じこ",
      "romaji": "jiko",
      "meaning": "accident / incident"
    },
    {
      "lesson": 30,
      "vocabulary": "故障",
      "reading": "こしょう",
      "romaji": "koshou",
      "meaning": "breakdown / malfunction"
    }
  ],
  "障": [
    {
      "lesson": 30,
      "vocabulary": "故障",
      "reading": "こしょう",
      "romaji": "koshou",
      "meaning": "breakdown / malfunction"
    }
  ],
  "台": [
    {
      "lesson": 30,
      "vocabulary": "台風",
      "reading": "たいふう",
      "romaji": "taifuu",
      "meaning": "typhoon"
    }
  ],
  "地": [
    {
      "lesson": 30,
      "vocabulary": "地震",
      "reading": "じしん",
      "romaji": "jishin",
      "meaning": "earthquake"
    }
  ],
  "震": [
    {
      "lesson": 30,
      "vocabulary": "地震",
      "reading": "じしん",
      "romaji": "jishin",
      "meaning": "earthquake"
    }
  ],
  "火": [
    {
      "lesson": 30,
      "vocabulary": "火事",
      "reading": "かじ",
      "romaji": "kaji",
      "meaning": "fire (incident)"
    }
  ],
  "由": [
    {
      "lesson": 30,
      "vocabulary": "理由",
      "reading": "りゆう",
      "romaji": "riyuu",
      "meaning": "reason"
    }
  ],
  "原": [
    {
      "lesson": 30,
      "vocabulary": "原因",
      "reading": "げんいん",
      "romaji": "gen'in",
      "meaning": "cause / source"
    }
  ],
  "因": [
    {
      "lesson": 30,
      "vocabulary": "原因",
      "reading": "げんいん",
      "romaji": "gen'in",
      "meaning": "cause / source"
    }
  ],
  "確": [
    {
      "lesson": 30,
      "vocabulary": "確か",
      "reading": "たしか",
      "romaji": "tashika",
      "meaning": "certain / if I recall correctly"
    }
  ],
  "残": [
    {
      "lesson": 30,
      "vocabulary": "残念",
      "reading": "ざんねん",
      "romaji": "zannen",
      "meaning": "unfortunate / regrettable"
    }
  ],
  "念": [
    {
      "lesson": 30,
      "vocabulary": "残念",
      "reading": "ざんねん",
      "romaji": "zannen",
      "meaning": "unfortunate / regrettable"
    }
  ]
};

/**
 * Returns all course vocabulary contexts for a given Kanji character.
 * @param {string} char - The Kanji character (e.g. "冷", "何", "結")
 * @returns {Array<{ lesson: number, vocabulary: string, reading: string, romaji: string, meaning: string }>}
 */
export function getKanjiCourseContexts(char) {
  return KANJI_COURSE_CONTEXTS[char] || [];
}

/**
 * Returns the contextual vocabulary record for a given Kanji character in the context of a specific lesson.
 * If no context exists for the specific lesson, falls back to the introductory context.
 * @param {string} char - The Kanji character
 * @param {number} [lessonOrder] - Optional lesson order number (e.g. 8, 15)
 * @returns {{ lesson: number, vocabulary: string, reading: string, romaji: string, meaning: string } | null}
 */
export function getKanjiContextForLesson(char, lessonOrder = null) {
  const contexts = KANJI_COURSE_CONTEXTS[char];
  if (!contexts || contexts.length === 0) return null;
  if (lessonOrder !== null && lessonOrder !== undefined) {
    const match = contexts.find((c) => c.lesson === Number(lessonOrder));
    if (match) return match;
  }
  return contexts[0];
}

/**
 * Backward-compatible helper returning the primary learner-facing reading and metadata.
 * @param {string} char
 * @param {number} [lessonOrder]
 * @returns {{ reading: string, romaji: string, meaning: string, vocabulary: string, lesson: number } | null}
 */
export function getKanjiLessonReading(char, lessonOrder = null) {
  const ctx = getKanjiContextForLesson(char, lessonOrder);
  if (!ctx) return null;
  return {
    reading: ctx.reading,
    romaji: ctx.romaji,
    meaning: ctx.meaning,
    vocabulary: ctx.vocabulary,
    lesson: ctx.lesson,
  };
}
