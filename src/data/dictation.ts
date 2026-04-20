export interface DictationEntry {
  hanzi: string;
  english: string;
  pinyin: string;
  isBonus?: boolean;
  /** Assessment week this entry is introduced, ISO start date. */
  weekStart: string;
}

/**
 * The 52 Chinese Characters Dictation Words (中文字) — single characters and
 * short compounds students are expected to write. Ordering matches the class
 * handout; weekStart aligns entries with the weekly assessment schedule.
 */
export const DICTATION: readonly DictationEntry[] = [
  // Week of 2/9/26
  { hanzi: "大", english: "big", pinyin: "dà", weekStart: "2026-02-09" },
  { hanzi: "小", english: "small", pinyin: "xiǎo", weekStart: "2026-02-09" },
  { hanzi: "日", english: "day", pinyin: "rì", weekStart: "2026-02-09" },
  { hanzi: "月", english: "month", pinyin: "yuè", weekStart: "2026-02-09" },
  { hanzi: "上", english: "on/up", pinyin: "shàng", weekStart: "2026-02-09" },
  { hanzi: "下", english: "under", pinyin: "xià", weekStart: "2026-02-09" },
  { hanzi: "左", english: "left", pinyin: "zuǒ", weekStart: "2026-02-09" },
  { hanzi: "右", english: "right", pinyin: "yòu", weekStart: "2026-02-09" },

  // Week of 2/23/26
  { hanzi: "中", english: "middle", pinyin: "zhōng", weekStart: "2026-02-23" },
  { hanzi: "水", english: "water", pinyin: "shuǐ", weekStart: "2026-02-23" },
  { hanzi: "天", english: "day", pinyin: "tiān", weekStart: "2026-02-23" },
  { hanzi: "人", english: "people", pinyin: "rén", weekStart: "2026-02-23" },
  { hanzi: "木", english: "wood", pinyin: "mù", weekStart: "2026-02-23" },
  { hanzi: "口", english: "mouth", pinyin: "kǒu", weekStart: "2026-02-23" },
  { hanzi: "山", english: "mountain", pinyin: "shān", weekStart: "2026-02-23" },
  { hanzi: "土", english: "earth", pinyin: "tǔ", weekStart: "2026-02-23" },

  // Week of 3/9/26
  { hanzi: "女", english: "female", pinyin: "nǚ", weekStart: "2026-03-09" },
  { hanzi: "好", english: "good", pinyin: "hǎo", weekStart: "2026-03-09" },
  { hanzi: "火", english: "fire", pinyin: "huǒ", weekStart: "2026-03-09" },
  { hanzi: "石", english: "stone", pinyin: "shí", weekStart: "2026-03-09" },
  { hanzi: "的", english: "'s", pinyin: "de", weekStart: "2026-03-09" },
  { hanzi: "是", english: "be/is", pinyin: "shì", weekStart: "2026-03-09" },
  { hanzi: "田", english: "field", pinyin: "tián", weekStart: "2026-03-09" },
  { hanzi: "力", english: "force", pinyin: "lì", weekStart: "2026-03-09" },

  // Week of 3/23/26
  { hanzi: "耳", english: "ear", pinyin: "ěr", weekStart: "2026-03-23", isBonus: true },
  { hanzi: "門", english: "door", pinyin: "mén", weekStart: "2026-03-23", isBonus: true },
  { hanzi: "心", english: "heart", pinyin: "xīn", weekStart: "2026-03-23" },
  { hanzi: "子", english: "child", pinyin: "zǐ", weekStart: "2026-03-23" },
  { hanzi: "可", english: "can", pinyin: "kě", weekStart: "2026-03-23" },
  { hanzi: "以", english: "can", pinyin: "yǐ", weekStart: "2026-03-23" },
  { hanzi: "白", english: "white", pinyin: "bái", weekStart: "2026-03-23" },
  { hanzi: "不", english: "not", pinyin: "bù", weekStart: "2026-03-23" },

  // Week of 4/13/26
  { hanzi: "我", english: "I", pinyin: "wǒ", weekStart: "2026-04-13" },
  { hanzi: "你", english: "you", pinyin: "nǐ", weekStart: "2026-04-13" },
  { hanzi: "牛", english: "cow", pinyin: "niú", weekStart: "2026-04-13" },
  { hanzi: "羊", english: "sheep", pinyin: "yáng", weekStart: "2026-04-13" },
  { hanzi: "兔", english: "rabbit", pinyin: "tù", weekStart: "2026-04-13", isBonus: true },
  { hanzi: "狗", english: "dog", pinyin: "gǒu", weekStart: "2026-04-13", isBonus: true },
  { hanzi: "吃", english: "eat", pinyin: "chī", weekStart: "2026-04-13" },

  // Week of 4/27/26
  { hanzi: "去", english: "go", pinyin: "qù", weekStart: "2026-04-27" },
  { hanzi: "要", english: "wants", pinyin: "yào", weekStart: "2026-04-27", isBonus: true },
  { hanzi: "有", english: "have", pinyin: "yǒu", weekStart: "2026-04-27" },
  { hanzi: "看", english: "see", pinyin: "kàn", weekStart: "2026-04-27", isBonus: true },
  { hanzi: "玩", english: "play", pinyin: "wán", weekStart: "2026-04-27", isBonus: true },
  { hanzi: "會", english: "can", pinyin: "huì", weekStart: "2026-04-27", isBonus: true },
  { hanzi: "年", english: "years", pinyin: "nián", weekStart: "2026-04-27" },

  // Week of 5/11/26
  { hanzi: "文", english: "language", pinyin: "wén", weekStart: "2026-05-11" },
  { hanzi: "早", english: "morning", pinyin: "zǎo", weekStart: "2026-05-11" },
  { hanzi: "這是", english: "this is", pinyin: "zhè shì", weekStart: "2026-05-11", isBonus: true },
  { hanzi: "今天", english: "today", pinyin: "jīntiān", weekStart: "2026-05-11" },
  { hanzi: "明天", english: "tomorrow", pinyin: "míngtiān", weekStart: "2026-05-11" },
  { hanzi: "朋友", english: "friend", pinyin: "péngyǒu", weekStart: "2026-05-11" },
];
