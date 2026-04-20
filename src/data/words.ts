export type WordCategory =
  | "pronouns"
  | "family"
  | "classroom"
  | "school"
  | "animals"
  | "senses"
  | "numbers"
  | "colors"
  | "pointing"
  | "body_parts"
  | "places"
  | "dates"
  | "weather"
  | "opposites"
  | "verbs"
  | "feelings"
  | "greetings";

export interface Word {
  hanzi: string;
  english: string;
  pinyin: string;
  category: WordCategory;
  isBonus?: boolean;
}

export const WORDS: readonly Word[] = [
  // pronouns
  { hanzi: "你", english: "you", pinyin: "nǐ", category: "pronouns" },
  { hanzi: "我", english: "I", pinyin: "wǒ", category: "pronouns" },
  { hanzi: "他", english: "he", pinyin: "tā", category: "pronouns" },
  { hanzi: "她", english: "she", pinyin: "tā", category: "pronouns" },
  { hanzi: "我們", english: "we", pinyin: "wǒmen", category: "pronouns", isBonus: true },

  // family
  { hanzi: "爸爸", english: "father", pinyin: "bàba", category: "family" },
  { hanzi: "媽媽", english: "mother", pinyin: "māma", category: "family" },
  { hanzi: "姐姐", english: "older sister", pinyin: "jiějie", category: "family" },
  { hanzi: "妹妹", english: "younger sister", pinyin: "mèimei", category: "family" },
  { hanzi: "哥哥", english: "older brother", pinyin: "gēge", category: "family" },
  { hanzi: "弟弟", english: "younger brother", pinyin: "dìdi", category: "family" },
  { hanzi: "家人", english: "family", pinyin: "jiārén", category: "family", isBonus: true },

  // classroom
  { hanzi: "男生", english: "boy", pinyin: "nánshēng", category: "classroom" },
  { hanzi: "女生", english: "girl", pinyin: "nǚshēng", category: "classroom" },
  { hanzi: "學生", english: "student", pinyin: "xuéshēng", category: "classroom", isBonus: true },
  { hanzi: "書包", english: "school bag", pinyin: "shūbāo", category: "classroom", isBonus: true },
  { hanzi: "加", english: "plus", pinyin: "jiā", category: "classroom", isBonus: true },

  // school
  { hanzi: "日期", english: "date", pinyin: "rìqī", category: "school" },
  { hanzi: "名字", english: "name", pinyin: "míngzì", category: "school" },
  { hanzi: "校長", english: "principal", pinyin: "xiàozhǎng", category: "school", isBonus: true },
  { hanzi: "老師", english: "teacher", pinyin: "lǎoshī", category: "school" },
  { hanzi: "年", english: "year", pinyin: "nián", category: "school" },
  { hanzi: "中文", english: "Chinese", pinyin: "Zhōngwén", category: "school" },
  { hanzi: "英文", english: "English", pinyin: "yīngwén", category: "school" },
  { hanzi: "數學", english: "math", pinyin: "shùxué", category: "school", isBonus: true },
  { hanzi: "課", english: "class", pinyin: "kè", category: "school", isBonus: true },

  // animals
  { hanzi: "狗", english: "dog", pinyin: "gǒu", category: "animals" },
  { hanzi: "貓", english: "cat", pinyin: "māo", category: "animals", isBonus: true },
  { hanzi: "牛", english: "cow", pinyin: "niú", category: "animals" },
  { hanzi: "兔", english: "rabbit", pinyin: "tù", category: "animals" },
  { hanzi: "馬", english: "horse", pinyin: "mǎ", category: "animals", isBonus: true },
  { hanzi: "羊", english: "sheep", pinyin: "yáng", category: "animals" },
  { hanzi: "魚", english: "fish", pinyin: "yú", category: "animals", isBonus: true },

  // senses
  { hanzi: "吃", english: "eat", pinyin: "chī", category: "senses" },
  { hanzi: "聽", english: "hear", pinyin: "tīng", category: "senses", isBonus: true },
  { hanzi: "聞", english: "smell", pinyin: "wén", category: "senses", isBonus: true },
  { hanzi: "看", english: "look", pinyin: "kàn", category: "senses" },
  { hanzi: "摸", english: "touch", pinyin: "mō", category: "senses", isBonus: true },

  // numbers
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
  { hanzi: "百", english: "hundred", pinyin: "bǎi", category: "numbers", isBonus: true },
  { hanzi: "零", english: "zero", pinyin: "líng", category: "numbers", isBonus: true },

  // colors
  { hanzi: "紅色", english: "red", pinyin: "hóngsè", category: "colors" },
  { hanzi: "黃色", english: "yellow", pinyin: "huángsè", category: "colors", isBonus: true },
  { hanzi: "藍色", english: "blue", pinyin: "lánsè", category: "colors", isBonus: true },
  { hanzi: "綠色", english: "green", pinyin: "lǜsè", category: "colors", isBonus: true },
  { hanzi: "白色", english: "white", pinyin: "báisè", category: "colors" },
  { hanzi: "黑色", english: "black", pinyin: "hēisè", category: "colors" },

  // pointing
  { hanzi: "那是", english: "that is", pinyin: "nàshì", category: "pointing", isBonus: true },
  { hanzi: "這是", english: "this is", pinyin: "zhèshì", category: "pointing" },

  // body parts
  { hanzi: "耳朵", english: "ear", pinyin: "ěrduo", category: "body_parts" },
  { hanzi: "鼻子", english: "nose", pinyin: "bízi", category: "body_parts", isBonus: true },
  { hanzi: "眼睛", english: "eye", pinyin: "yǎnjing", category: "body_parts", isBonus: true },
  { hanzi: "頭", english: "head", pinyin: "tóu", category: "body_parts", isBonus: true },

  // places
  { hanzi: "公園", english: "park", pinyin: "gōngyuán", category: "places", isBonus: true },
  { hanzi: "家", english: "home", pinyin: "jiā", category: "places" },
  { hanzi: "學校", english: "school", pinyin: "xuéxiào", category: "places", isBonus: true },
  { hanzi: "朋友的家", english: "friend's home", pinyin: "péngyǒu de jiā", category: "places" },
  { hanzi: "超市", english: "supermarket", pinyin: "chāoshì", category: "places", isBonus: true },

  // dates
  { hanzi: "今天是", english: "today is", pinyin: "jīntiān shì", category: "dates" },
  { hanzi: "明天是", english: "tomorrow is", pinyin: "míngtiān shì", category: "dates" },
  { hanzi: "昨天是", english: "yesterday was", pinyin: "zuótiān shì", category: "dates", isBonus: true },
  { hanzi: "星期", english: "week", pinyin: "xīngqí", category: "dates" },
  { hanzi: "一週", english: "one week", pinyin: "yīzhōu", category: "dates" },

  // weather
  { hanzi: "晴天", english: "sunny", pinyin: "qíngtiān", category: "weather", isBonus: true },
  { hanzi: "下雨", english: "raining", pinyin: "xiàyǔ", category: "weather" },
  { hanzi: "陰天", english: "cloudy", pinyin: "yīntiān", category: "weather", isBonus: true },
  { hanzi: "太陽", english: "sun", pinyin: "tàiyáng", category: "weather", isBonus: true },
  { hanzi: "月亮", english: "moon", pinyin: "yuèliang", category: "weather", isBonus: true },
  { hanzi: "星星", english: "star", pinyin: "xīngxīng", category: "weather", isBonus: true },

  // opposites (split into individual entries)
  { hanzi: "大", english: "big", pinyin: "dà", category: "opposites" },
  { hanzi: "小", english: "small", pinyin: "xiǎo", category: "opposites" },
  { hanzi: "上", english: "up", pinyin: "shàng", category: "opposites" },
  { hanzi: "下", english: "down", pinyin: "xià", category: "opposites" },
  { hanzi: "左", english: "left", pinyin: "zuǒ", category: "opposites" },
  { hanzi: "右", english: "right", pinyin: "yòu", category: "opposites" },
  { hanzi: "前", english: "front", pinyin: "qián", category: "opposites", isBonus: true },
  { hanzi: "後", english: "back", pinyin: "hòu", category: "opposites", isBonus: true },
  { hanzi: "高", english: "high", pinyin: "gāo", category: "opposites", isBonus: true },
  { hanzi: "低", english: "low", pinyin: "dī", category: "opposites", isBonus: true },
  { hanzi: "熱", english: "hot", pinyin: "rè", category: "opposites", isBonus: true },
  { hanzi: "冷", english: "cold", pinyin: "lěng", category: "opposites", isBonus: true },
  { hanzi: "長", english: "long", pinyin: "cháng", category: "opposites", isBonus: true },
  { hanzi: "短", english: "short", pinyin: "duǎn", category: "opposites", isBonus: true },
  { hanzi: "裡", english: "inside", pinyin: "lǐ", category: "opposites", isBonus: true },
  { hanzi: "外", english: "outside", pinyin: "wài", category: "opposites", isBonus: true },
  { hanzi: "多", english: "more", pinyin: "duō", category: "opposites" },
  { hanzi: "少", english: "less", pinyin: "shǎo", category: "opposites" },
  { hanzi: "可以", english: "can", pinyin: "kěyǐ", category: "opposites" },
  { hanzi: "不可以", english: "cannot", pinyin: "bùkěyǐ", category: "opposites" },
  { hanzi: "是", english: "yes", pinyin: "shì", category: "opposites" },
  { hanzi: "不是", english: "no", pinyin: "bùshì", category: "opposites" },

  // verbs
  { hanzi: "說", english: "speak", pinyin: "shuō", category: "verbs" },
  { hanzi: "寫", english: "write", pinyin: "xiě", category: "verbs", isBonus: true },
  { hanzi: "畫", english: "draw", pinyin: "huà", category: "verbs", isBonus: true },
  { hanzi: "玩", english: "play", pinyin: "wán", category: "verbs" },
  { hanzi: "去", english: "go", pinyin: "qù", category: "verbs" },
  { hanzi: "有", english: "have", pinyin: "yǒu", category: "verbs" },

  // feelings
  { hanzi: "開心", english: "happy", pinyin: "kāixīn", category: "feelings" },
  { hanzi: "喜歡", english: "like", pinyin: "xǐhuan", category: "feelings", isBonus: true },
  { hanzi: "愛", english: "love", pinyin: "ài", category: "feelings", isBonus: true },
  { hanzi: "會", english: "can (ability)", pinyin: "huì", category: "feelings", isBonus: true },

  // greetings
  { hanzi: "你好", english: "hello", pinyin: "nǐhǎo", category: "greetings" },
  { hanzi: "再見", english: "bye", pinyin: "zàijiàn", category: "greetings", isBonus: true },
];

export const CATEGORY_LABELS: Record<WordCategory, string> = {
  pronouns: "Pronouns",
  family: "Family",
  classroom: "Classroom",
  school: "School",
  animals: "Animals",
  senses: "Senses",
  numbers: "Numbers",
  colors: "Colors",
  pointing: "Pointing",
  body_parts: "Body Parts",
  places: "Places",
  dates: "Dates",
  weather: "Weather",
  opposites: "Opposites",
  verbs: "Verbs",
  feelings: "Feelings",
  greetings: "Greetings",
};
