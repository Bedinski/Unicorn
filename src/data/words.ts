export type WordCategory =
  | "animals"
  | "colors"
  | "numbers"
  | "family"
  | "nature"
  | "size"
  | "body"
  | "food";

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
  { hanzi: "马", english: "horse", pinyin: "mǎ", category: "animals" },
  { hanzi: "牛", english: "cow", pinyin: "niú", category: "animals" },
  { hanzi: "羊", english: "sheep", pinyin: "yáng", category: "animals" },
  { hanzi: "兔", english: "rabbit", pinyin: "tù", category: "animals" },

  { hanzi: "红", english: "red", pinyin: "hóng", category: "colors" },
  { hanzi: "蓝", english: "blue", pinyin: "lán", category: "colors" },
  { hanzi: "绿", english: "green", pinyin: "lǜ", category: "colors" },
  { hanzi: "黄", english: "yellow", pinyin: "huáng", category: "colors" },
  { hanzi: "黑", english: "black", pinyin: "hēi", category: "colors" },
  { hanzi: "白", english: "white", pinyin: "bái", category: "colors" },
  { hanzi: "粉", english: "pink", pinyin: "fěn", category: "colors" },

  { hanzi: "一", english: "one", pinyin: "yī", category: "numbers" },
  { hanzi: "二", english: "two", pinyin: "èr", category: "numbers" },
  { hanzi: "三", english: "three", pinyin: "sān", category: "numbers" },
  { hanzi: "四", english: "four", pinyin: "sì", category: "numbers" },
  { hanzi: "五", english: "five", pinyin: "wǔ", category: "numbers" },
  { hanzi: "六", english: "six", pinyin: "liù", category: "numbers" },
  { hanzi: "七", english: "seven", pinyin: "qī", category: "numbers" },
  { hanzi: "八", english: "eight", pinyin: "bā", category: "numbers" },
  { hanzi: "九", english: "nine", pinyin: "jiǔ", category: "numbers" },
  { hanzi: "十", english: "ten", pinyin: "shí", category: "numbers" },

  { hanzi: "爸", english: "dad", pinyin: "bà", category: "family" },
  { hanzi: "妈", english: "mom", pinyin: "mā", category: "family" },
  { hanzi: "哥", english: "big brother", pinyin: "gē", category: "family" },
  { hanzi: "姐", english: "big sister", pinyin: "jiě", category: "family" },

  { hanzi: "水", english: "water", pinyin: "shuǐ", category: "nature" },
  { hanzi: "火", english: "fire", pinyin: "huǒ", category: "nature" },
  { hanzi: "山", english: "mountain", pinyin: "shān", category: "nature" },
  { hanzi: "日", english: "sun", pinyin: "rì", category: "nature" },
  { hanzi: "月", english: "moon", pinyin: "yuè", category: "nature" },
  { hanzi: "天", english: "sky", pinyin: "tiān", category: "nature" },
  { hanzi: "雨", english: "rain", pinyin: "yǔ", category: "nature" },
  { hanzi: "花", english: "flower", pinyin: "huā", category: "nature" },
  { hanzi: "树", english: "tree", pinyin: "shù", category: "nature" },

  { hanzi: "大", english: "big", pinyin: "dà", category: "size" },
  { hanzi: "小", english: "small", pinyin: "xiǎo", category: "size" },

  { hanzi: "手", english: "hand", pinyin: "shǒu", category: "body" },
  { hanzi: "口", english: "mouth", pinyin: "kǒu", category: "body" },
  { hanzi: "目", english: "eye", pinyin: "mù", category: "body" },
  { hanzi: "耳", english: "ear", pinyin: "ěr", category: "body" },

  { hanzi: "米", english: "rice", pinyin: "mǐ", category: "food" },
  { hanzi: "茶", english: "tea", pinyin: "chá", category: "food" },
  { hanzi: "蛋", english: "egg", pinyin: "dàn", category: "food" },
];
