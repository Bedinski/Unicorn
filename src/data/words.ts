export type WordCategory =
  | "animals"
  | "colors"
  | "numbers"
  | "family"
  | "nature"
  | "size";

export interface Word {
  hanzi: string;
  english: string;
  pinyin: string;
  category: WordCategory;
}

export const WORDS: readonly Word[] = [
  { hanzi: "猫", english: "cat", pinyin: "māo", category: "animals" },
  { hanzi: "狗", english: "dog", pinyin: "gǒu", category: "animals" },
  { hanzi: "鱼", english: "fish", pinyin: "yú", category: "animals" },
  { hanzi: "鸟", english: "bird", pinyin: "niǎo", category: "animals" },

  { hanzi: "红", english: "red", pinyin: "hóng", category: "colors" },
  { hanzi: "蓝", english: "blue", pinyin: "lán", category: "colors" },
  { hanzi: "绿", english: "green", pinyin: "lǜ", category: "colors" },
  { hanzi: "黄", english: "yellow", pinyin: "huáng", category: "colors" },

  { hanzi: "一", english: "one", pinyin: "yī", category: "numbers" },
  { hanzi: "二", english: "two", pinyin: "èr", category: "numbers" },
  { hanzi: "三", english: "three", pinyin: "sān", category: "numbers" },

  { hanzi: "爸", english: "dad", pinyin: "bà", category: "family" },
  { hanzi: "妈", english: "mom", pinyin: "mā", category: "family" },

  { hanzi: "水", english: "water", pinyin: "shuǐ", category: "nature" },
  { hanzi: "火", english: "fire", pinyin: "huǒ", category: "nature" },
  { hanzi: "山", english: "mountain", pinyin: "shān", category: "nature" },
  { hanzi: "日", english: "sun", pinyin: "rì", category: "nature" },
  { hanzi: "月", english: "moon", pinyin: "yuè", category: "nature" },

  { hanzi: "大", english: "big", pinyin: "dà", category: "size" },
  { hanzi: "小", english: "small", pinyin: "xiǎo", category: "size" },
];
