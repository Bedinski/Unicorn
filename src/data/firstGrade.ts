export type StudyCategoryGroup = "High Frequency Words" | "Meizhou Chapters" | "Dictation";

export type StudyCategoryId =
  | "hfw-opposites" | "hfw-family" | "hfw-school-places" | "hfw-taste"
  | "hfw-feelings" | "hfw-school-supplies" | "hfw-weather" | "hfw-colors"
  | "hfw-hobbies" | "hfw-verbs" | "hfw-animals" | "hfw-body-parts" | "hfw-misc"
  | "dictation"
  | "meizhou-1" | "meizhou-2" | "meizhou-3" | "meizhou-4" | "meizhou-5"
  | "meizhou-6" | "meizhou-7" | "meizhou-8" | "meizhou-10";

export interface FirstGradeWord {
  hanzi: string;
  pinyin: string;
  english: string;
  category: StudyCategoryId;
  categories: readonly StudyCategoryId[];
  /** Present only on a weekly writing guide, not in a category master list. */
  weeklyOnly?: boolean;
}

type RawItem = readonly [hanzi: string, pinyin: string, english: string];

export interface StudyCategoryDefinition {
  id: StudyCategoryId;
  label: string;
  group: StudyCategoryGroup;
  emoji: string;
  items: readonly RawItem[];
}

const category = (
  id: StudyCategoryId,
  label: string,
  group: StudyCategoryGroup,
  emoji: string,
  items: readonly RawItem[],
): StudyCategoryDefinition => ({ id, label, group, emoji, items });

/** Date-independent First Grade catalog transcribed from the supplied PDFs. */
export const STUDY_CATEGORIES: readonly StudyCategoryDefinition[] = [
  category("hfw-opposites", "Opposites", "High Frequency Words", "↔️", [
    ["拉", "lā", "pull"], ["推", "tuī", "push"], ["高", "gāo", "tall"], ["矮", "ǎi", "short"],
    ["分", "fēn", "separate"], ["合", "hé", "put together"], ["多", "duō", "many"], ["少", "shǎo", "few"],
    ["黑", "hēi", "black"], ["白", "bái", "white"], ["陰", "yīn", "cloudy"], ["晴", "qíng", "sunny"],
    ["乾淨", "gānjìng", "clean"], ["骯髒", "āngzāng", "dirty"],
  ]),
  category("hfw-family", "Family", "High Frequency Words", "👨‍👩‍👧", [
    ["爺爺", "yéye", "paternal grandfather"], ["奶奶", "nǎinai", "paternal grandmother"],
    ["外公", "wàigōng", "maternal grandfather"], ["外婆", "wàipó", "maternal grandmother"],
    ["叔叔", "shúshu", "uncle"], ["阿姨", "āyí", "aunt"],
  ]),
  category("hfw-school-places", "School Places & Directions", "High Frequency Words", "🏫", [
    ["東", "dōng", "east"], ["南", "nán", "south"], ["西", "xī", "west"], ["北", "běi", "north"],
    ["教室", "jiàoshì", "classroom"], ["圖書館", "túshūguǎn", "library"], ["操場", "cāochǎng", "playground"],
    ["禮堂", "lǐtáng", "auditorium"], ["餐廳", "cāntīng", "cafeteria"], ["食堂", "shítáng", "cafeteria"],
    ["洗手間", "xǐshǒujiān", "restroom"], ["辦公室", "bàngōngshì", "office"],
  ]),
  category("hfw-taste", "Taste", "High Frequency Words", "🍓", [
    ["燙", "tàng", "burning hot"], ["涼", "liáng", "cool"], ["冰", "bīng", "icy"], ["嚐", "cháng", "taste"],
    ["喝", "hē", "drink"], ["酸", "suān", "sour"], ["甜", "tián", "sweet"], ["苦", "kǔ", "bitter"],
    ["辣", "là", "spicy"], ["鹹", "xián", "salty"],
  ]),
  category("hfw-feelings", "Feelings", "High Frequency Words", "😊", [
    ["快樂", "kuàilè", "happy"], ["高興", "gāoxìng", "glad"], ["生氣", "shēngqì", "angry"],
    ["好笑", "hǎoxiào", "funny"], ["害怕", "hàipà", "scared"], ["兇", "xiōng", "mean"],
    ["喜歡", "xǐhuan", "like"], ["想要", "xiǎngyào", "want"],
  ]),
  category("hfw-school-supplies", "School Supplies", "High Frequency Words", "✏️", [
    ["年級", "niánjí", "grade level"], ["橡皮擦", "xiàngpícā", "eraser"], ["紙", "zhǐ", "paper"],
    ["鉛筆", "qiānbǐ", "pencil"], ["蠟筆", "làbǐ", "crayon"], ["剪刀", "jiǎndāo", "scissors"],
    ["白膠", "báijiāo", "white glue"], ["桌子", "zhuōzi", "desk"], ["椅子", "yǐzi", "chair"], ["電腦", "diànnǎo", "computer"],
  ]),
  category("hfw-weather", "Weather", "High Frequency Words", "⛈️", [
    ["下雪", "xiàxuě", "snow"], ["毛毛雨", "máomáoyǔ", "drizzle"], ["打雷", "dǎléi", "thunder"], ["閃電", "shǎndiàn", "lightning"],
  ]),
  category("hfw-colors", "Colors", "High Frequency Words", "🌈", [
    ["深", "shēn", "dark color"], ["淺", "qiǎn", "light color"], ["橘色", "júsè", "orange color"],
    ["橙色", "chéngsè", "orange color (alternate)"], ["棕色", "zōngsè", "brown color"], ["咖啡色", "kāfēisè", "brown color (alternate)"],
  ]),
  category("hfw-hobbies", "Hobbies", "High Frequency Words", "🎨", [
    ["看書", "kànshū", "read"], ["唱歌", "chànggē", "sing"], ["跳舞", "tiàowǔ", "dance"], ["打球", "dǎqiú", "play ball"],
    ["打電腦", "dǎdiànnǎo", "use the computer"], ["打電動玩具", "dǎdiàndòngwánjù", "play video games"],
    ["遊戲", "yóuxì", "game"], ["捉迷藏", "zhuōmícáng", "hide and seek"],
  ]),
  category("hfw-verbs", "Action Words", "High Frequency Words", "🏃", [
    ["用", "yòng", "use"], ["來", "lái", "come"], ["到", "dào", "arrive"], ["回", "huí", "return"], ["描", "miáo", "trace"],
    ["講", "jiǎng", "speak"], ["跑", "pǎo", "run"], ["爬", "pá", "crawl"], ["走", "zǒu", "walk"], ["跳", "tiào", "jump"],
  ]),
  category("hfw-animals", "Animals", "High Frequency Words", "🐾", [
    ["大象", "dàxiàng", "elephant"], ["蛇", "shé", "snake"], ["鼠", "shǔ", "mouse"], ["虎", "hǔ", "tiger"],
    ["雞", "jī", "chicken"], ["鳥", "niǎo", "bird"],
  ]),
  category("hfw-body-parts", "Body Parts", "High Frequency Words", "🖐️", [
    ["頭髮", "tóufǎ", "hair"], ["牙齒", "yáchǐ", "tooth"], ["腳", "jiǎo", "foot"],
    ["肩膀", "jiānbǎng", "shoulder"], ["膝蓋", "xīgài", "knee"], ["嘴巴", "zuǐba", "mouth"],
  ]),
  category("hfw-misc", "Useful Classroom Words", "High Frequency Words", "💬", [
    ["牠", "tā", "it (animal)"], ["歲", "suì", "years old"], ["電影院", "diànyǐngyuàn", "movie theater"],
    ["連一連", "lián yì lián", "connect the matches"], ["圈一圈", "quān yì quān", "circle it"],
    ["名字", "míngzi", "name"], ["您", "nín", "you (respectful)"],
    ["父母", "fùmǔ", "parents"], ["生日", "shēngrì", "birthday"],
  ]),
  category("dictation", "Complete Dictation List", "Dictation", "✍️", [
    ["跟", "gēn", "with; follow"], ["在", "zài", "be at; in progress"], ["再", "zài", "again"], ["因為", "yīnwèi", "because"],
    ["可是", "kěshì", "but"], ["可以", "kěyǐ", "can; may"], ["所以", "suǒyǐ", "therefore"], ["一起", "yìqǐ", "together"],
    ["時候", "shíhou", "time; moment"], ["這裡", "zhèlǐ", "here"], ["裏面", "lǐmiàn", "inside"], ["什麼", "shénme", "what"],
    ["兩", "liǎng", "two (quantity)"], ["個", "ge", "general measure word"], ["跑", "pǎo", "run"], ["跳", "tiào", "jump"],
    ["出去", "chūqù", "go out"], ["回家", "huíjiā", "go home"], ["游泳", "yóuyǒng", "swim"], ["看書", "kànshū", "read a book"],
    ["唱歌", "chànggē", "sing"], ["打球", "dǎqiú", "play ball"], ["來", "lái", "come"], ["去", "qù", "go"], ["走", "zǒu", "walk"], ["到", "dào", "arrive"],
    ["沒有", "méiyǒu", "not have"], ["要", "yào", "want; need"], ["想", "xiǎng", "want; think"], ["給", "gěi", "give"],
    ["寫", "xiě", "write"], ["看", "kàn", "look; read"], ["吃", "chī", "eat"], ["說話", "shuōhuà", "speak; talk"], ["玩", "wán", "play"], ["會", "huì", "can; will"],
    ["學校", "xuéxiào", "school"], ["公園", "gōngyuán", "park"], ["動物", "dòngwù", "animal"], ["名字", "míngzi", "name"], ["東西", "dōngxi", "things"],
    ["玩具", "wánjù", "toys"], ["它", "tā", "it (non-living)"], ["牠", "tā", "it (animal)"], ["他們", "tāmen", "they (male/mixed)"], ["她們", "tāmen", "they (female)"],
    ["果汁", "guǒzhī", "juice"], ["電影", "diànyǐng", "movie"], ["鳥", "niǎo", "bird"], ["狗", "gǒu", "dog"], ["貓", "māo", "cat"], ["兔子", "tùzi", "rabbit"],
    ["冰淇淋", "bīngqílín", "ice cream"], ["巧克力", "qiǎokèlì", "chocolate"], ["蘋果", "píngguǒ", "apple"], ["草莓", "cǎoméi", "strawberry"],
    ["西瓜", "xīguā", "watermelon"], ["香蕉", "xiāngjiāo", "banana"], ["快樂", "kuàilè", "happy"], ["生氣", "shēngqì", "angry"],
    ["很多", "hěnduō", "a lot"], ["很少", "hěnshǎo", "very little"], ["甜", "tián", "sweet"], ["可愛", "kě'ài", "cute"],
  ]),
  category("meizhou-1", "Meizhou Chapter 1", "Meizhou Chapters", "1️⃣", [
    ["牛油", "niúyóu", "butter"], ["馬路", "mǎlù", "road"], ["馬桶", "mǎtǒng", "toilet"], ["鳥巢", "niǎocháo", "bird nest"],
    ["鯊魚", "shāyú", "shark"], ["釣魚", "diàoyú", "fishing"], ["名字", "míngzì", "name"], ["寫字", "xiězì", "write characters"],
    ["女兒", "nǚ'ér", "daughter"], ["兒子", "érzi", "son"], ["分數", "fēnshù", "score; grade"], ["分開", "fēnkāi", "separate"],
    ["門把", "ménbǎ", "doorknob"], ["把手", "bǎshǒu", "handle"], ["又來了", "yòuláile", "came again"], ["合作", "hézuò", "work together"], ["合起來", "héqǐlái", "close together"],
  ]),
  category("meizhou-2", "Meizhou Chapter 2", "Meizhou Chapters", "2️⃣", [
    ["一朵", "yìduǒ", "one flower (measure word)"], ["想想看", "xiǎngxiǎngkàn", "think about it"], ["不要", "búyào", "do not want"],
    ["青菜", "qīngcài", "vegetables"], ["吃飯", "chīfàn", "eat a meal"], ["給你吃", "gěinǐchī", "give you something to eat"],
    ["山羊", "shānyáng", "goat"], ["綿羊", "miányáng", "sheep"], ["語言", "yǔyán", "language"], ["請坐", "qǐngzuò", "please sit"],
    ["請假", "qǐngjià", "take leave; absent"], ["找錢", "zhǎoqián", "change (money)"], ["蛋黃", "dànhuáng", "egg yolk"],
    ["就是你", "jiùshìnǐ", "that is you"], ["說話", "shuōhuà", "speak"], ["說謊", "shuōhuǎng", "tell a lie"],
  ]),
  category("meizhou-3", "Meizhou Chapter 3", "Meizhou Chapters", "3️⃣", [
    ["爸爸", "bàba", "father"], ["可以", "kěyǐ", "can; could"], ["以前", "yǐqián", "long ago"], ["可怕", "kěpà", "scary"],
    ["害怕", "hàipà", "afraid"], ["中午", "zhōngwǔ", "noon"], ["很好", "hěnhǎo", "very good"], ["很大", "hěndà", "very big"],
    ["太大", "tàidà", "too big"], ["牛奶", "niúnǎi", "milk"], ["奶奶", "nǎinai", "paternal grandmother"],
    ["還沒來", "háiméilái", "not here yet"], ["還給", "huángěi", "return something"], ["包子", "bāozi", "steamed bun"],
    ["真好玩", "zhēnhǎowán", "very fun"], ["一個", "yíge", "one (general measure)"],
  ]),
  category("meizhou-4", "Meizhou Chapter 4", "Meizhou Chapters", "4️⃣", [
    ["前面", "qiánmiàn", "in front"], ["開門", "kāimén", "open the door"], ["門鈴", "ménlíng", "doorbell"], ["猜拳", "cāiquán", "rock paper scissors"],
    ["兩個", "liǎngge", "two (count)"], ["兩面", "liǎngmiàn", "two-sided"], ["你們", "nǐmen", "you (plural)"], ["都有", "dōuyǒu", "all have"],
    ["誰的", "shéide", "whose"], ["誰來了", "shéiláile", "who came"], ["老人", "lǎorén", "elderly person"], ["老鼠", "lǎoshǔ", "mouse"],
    ["哥哥", "gēge", "older brother"], ["弟弟", "dìdi", "younger brother"], ["請問", "qǐngwèn", "may I ask"], ["每天", "měitiān", "every day"],
  ]),
  category("meizhou-5", "Meizhou Chapter 5", "Meizhou Chapters", "5️⃣", [
    ["過來", "guòlái", "come over"], ["給你", "gěinǐ", "give to you"], ["送給", "sònggěi", "give as a gift"], ["回家", "huíjiā", "go home"],
    ["回答", "huídá", "answer"], ["家長", "jiāzhǎng", "parents"], ["畫家", "huàjiā", "artist"], ["高速公路", "gāosùgōnglù", "freeway"],
    ["過生日", "guòshēngrì", "celebrate a birthday"], ["書桌", "shūzhuō", "desk"], ["快樂", "kuàilè", "happy"], ["水果", "shuǐguǒ", "fruit"],
    ["果汁", "guǒzhī", "juice"], ["開車", "kāichē", "drive"], ["信用卡", "xìnyòngkǎ", "credit card"], ["信封", "xìnfēng", "envelope"],
  ]),
  category("meizhou-6", "Meizhou Chapter 6", "Meizhou Chapters", "6️⃣", [
    ["黃河", "huánghé", "Yellow River"], ["河馬", "hémǎ", "hippo"], ["有什麼", "yǒushénme", "what is there"], ["這麼多", "zhèmeduō", "so many"],
    ["國歌", "guógē", "national anthem"], ["流汗", "liúhàn", "sweat"], ["海邊", "hǎibiān", "seaside"], ["海豚", "hǎitún", "dolphin"],
    ["從前", "cóngqián", "long ago"], ["遲到", "chídào", "late"], ["到學校", "dàoxuéxiào", "arrive at school"], ["跳得高", "tiàodegāo", "jump high"],
    ["得到", "dédào", "earn; receive"], ["一公里", "yìgōnglǐ", "one kilometer"], ["裡面", "lǐmiàn", "inside"], ["入口", "rùkǒu", "entrance"],
  ]),
  category("meizhou-7", "Meizhou Chapter 7", "Meizhou Chapters", "7️⃣", [
    ["新年", "xīnnián", "New Year"], ["新娘", "xīnniáng", "bride"], ["年級", "niánjí", "grade level"], ["春天", "chūntiān", "spring"],
    ["幾個", "jǐge", "how many"], ["不知道", "bùzhīdào", "do not know"], ["道歉", "dàoqiàn", "apologize"], ["人行道", "rénxíngdào", "sidewalk"],
    ["外套", "wàitào", "coat"], ["外國人", "wàiguórén", "foreigner"], ["再見", "zàijiàn", "goodbye"], ["冬天", "dōngtiān", "winter"],
    ["冬眠", "dōngmián", "hibernate"], ["只要", "zhǐyào", "only want"], ["告狀", "gàozhuàng", "tattle; complain"], ["告訴", "gàosù", "tell"],
  ]),
  category("meizhou-8", "Meizhou Chapter 8", "Meizhou Chapters", "8️⃣", [
    ["爬樹", "páshù", "climb trees"], ["賽跑", "sàipǎo", "race"], ["跳繩", "tiàoshéng", "jump rope"], ["跳舞", "tiàowǔ", "dance"],
    ["跟著走", "gēnzhezǒu", "follow someone"], ["翻跟斗", "fāngēndou", "somersault"], ["起來", "qǐlái", "get up"],
    ["蝸牛", "wōniú", "snail"], ["黑夜", "hēiyè", "nighttime"], ["飛盤", "fēipán", "frisbee"],
  ]),
  category("meizhou-10", "Meizhou Chapter 10", "Meizhou Chapters", "🔟", [
    ["山洞", "shāndòng", "cave"], ["破洞", "pòdòng", "hole"], ["力氣", "lìqi", "strength"], ["用力", "yònglì", "use strength"],
    ["可愛", "kě'ài", "cute"], ["等了很久", "děnglehěnjiǔ", "waited a long time"], ["用功", "yònggōng", "hard-working"], ["住址", "zhùzhǐ", "address"],
    ["笑話", "xiàohuà", "joke"], ["出來", "chūlái", "come out"], ["學生", "xuéshēng", "student"], ["貝殼", "bèiké", "shells"],
    ["一同", "yìtóng", "together"], ["同學", "tóngxué", "classmate"], ["進來", "jìnlái", "come inside"], ["進步", "jìnbù", "make progress"],
  ]),
];

/** Standalone characters shown only on the writing portions of weekly guides. */
export const WEEKLY_DICTATION_ITEMS: readonly RawItem[] = [
  ["是", "shì", "be; is"], ["有", "yǒu", "have"], ["家", "jiā", "home"],
  ["學", "xué", "study"], ["校", "xiào", "school"], ["名", "míng", "name"],
  ["字", "zì", "character"], ["書", "shū", "book"], ["愛", "ài", "love"],
  ["快", "kuài", "fast"], ["樂", "lè", "happy"], ["生", "shēng", "life; birth"],
  ["氣", "qì", "air; energy"], ["所", "suǒ", "place"], ["以", "yǐ", "by; with"],
  ["兔", "tù", "rabbit"], ["子", "zi", "child; suffix"], ["他", "tā", "he"],
  ["們", "men", "plural marker"], ["電", "diàn", "electricity"], ["影", "yǐng", "image"],
  ["具", "jù", "tool; item"], ["唱", "chàng", "sing"], ["歌", "gē", "song"],
  ["打", "dǎ", "hit; play"], ["球", "qiú", "ball"], ["很", "hěn", "very"],
  ["因", "yīn", "cause"], ["為", "wèi", "because; for"], ["可", "kě", "can"],
  ["汁", "zhī", "juice"], ["淋", "lín", "pour; drench"],
];

const wordIndex = new Map<string, FirstGradeWord>();
for (const definition of STUDY_CATEGORIES) {
  for (const [hanzi, pinyin, english] of definition.items) {
    const existing = wordIndex.get(hanzi);
    wordIndex.set(hanzi, existing
      ? { ...existing, categories: [...existing.categories, definition.id] }
      : { hanzi, pinyin, english, category: definition.id, categories: [definition.id] });
  }
}
for (const [hanzi, pinyin, english] of WEEKLY_DICTATION_ITEMS) {
  if (!wordIndex.has(hanzi)) {
    wordIndex.set(hanzi, {
      hanzi,
      pinyin,
      english,
      category: "dictation",
      categories: [],
      weeklyOnly: true,
    });
  }
}

export const FIRST_GRADE_WORDS: readonly FirstGradeWord[] = [...wordIndex.values()];

export function wordsForCategory(id: StudyCategoryId): FirstGradeWord[] {
  const definition = STUDY_CATEGORIES.find((candidate) => candidate.id === id);
  if (!definition) return [];
  return definition.items.map(([hanzi]) => wordIndex.get(hanzi)!).filter(Boolean);
}

export interface FirstGradeWeek {
  id: string;
  number: number;
  title: string;
  description: string;
  sourceGuide: string;
  categoryIds: readonly StudyCategoryId[];
  recognitionHanzi: readonly string[];
  dictationHanzi: readonly string[];
}

/**
 * A timeless learning sequence, not last year's dated test order. High
 * Frequency Word guides retain their source order on odd weeks; Meizhou
 * guides are placed on even weeks in ascending chapter order.
 */
export const FIRST_GRADE_WEEKS: readonly FirstGradeWeek[] = [
  {
    id: "week-01", number: 1, title: "School Places", sourceGuide: "HFW School Locations",
    description: "Places, directions, and school-location dictation", categoryIds: ["hfw-school-places"],
    recognitionHanzi: ["東", "南", "西", "北", "教室", "圖書館", "操場", "禮堂", "餐廳", "食堂", "洗手間", "辦公室"],
    dictationHanzi: ["是", "個", "去", "有", "東", "西"],
  },
  {
    id: "week-02", number: 2, title: "Meizhou Chapter 1", sourceGuide: "MZ Chapter 1",
    description: "Names, family, objects, and writing characters", categoryIds: ["meizhou-1"],
    recognitionHanzi: ["牛油", "馬路", "馬桶", "鳥巢", "鯊魚", "釣魚", "名字", "寫字", "女兒", "兒子", "分數", "分開", "門把", "把手", "又來了", "合作", "合起來"],
    dictationHanzi: ["寫", "名", "字", "會", "看", "書"],
  },
  {
    id: "week-03", number: 3, title: "School Supplies", sourceGuide: "School Supplies HFW",
    description: "The nine classroom objects from the study guide", categoryIds: ["hfw-school-supplies"],
    recognitionHanzi: ["橡皮擦", "紙", "鉛筆", "蠟筆", "剪刀", "白膠", "桌子", "椅子", "電腦"],
    dictationHanzi: ["兩", "來", "走", "學", "校"],
  },
  {
    id: "week-04", number: 4, title: "Meizhou Chapter 2", sourceGuide: "MZ Chapter 2",
    description: "Food, animals, speaking, and key verbs", categoryIds: ["meizhou-2"],
    recognitionHanzi: ["一朵", "想想看", "不要", "青菜", "吃飯", "給你吃", "山羊", "綿羊", "語言", "請坐", "請假", "找錢", "蛋黃", "就是你", "說話", "說謊"],
    dictationHanzi: ["想", "要", "吃", "給"],
  },
  {
    id: "week-05", number: 5, title: "Family & Hobbies", sourceGuide: "HFW Family and Hobbies",
    description: "Family members, favorite activities, and writing pieces", categoryIds: ["hfw-family", "hfw-hobbies"],
    recognitionHanzi: ["爺爺", "奶奶", "外公", "外婆", "叔叔", "阿姨", "看書", "唱歌", "跳舞", "打球", "打電腦", "打電動玩具", "遊戲", "捉迷藏"],
    dictationHanzi: ["玩", "具", "唱", "歌", "打", "球"],
  },
  {
    id: "week-06", number: 6, title: "Meizhou Chapter 3", sourceGuide: "MZ Chapter 3",
    description: "Family, feelings, size, food, and sentence building", categoryIds: ["meizhou-3"],
    recognitionHanzi: ["爸爸", "可以", "以前", "可怕", "害怕", "中午", "很好", "很大", "太大", "牛奶", "奶奶", "還沒來", "還給", "包子", "真好玩", "一個"],
    dictationHanzi: ["很", "因", "為", "可", "是"],
  },
  {
    id: "week-07", number: 7, title: "Taste, Opposites & Feelings", sourceGuide: "HFW Taste and Opposites",
    description: "The exact taste, contrast, and emotion subset on the guide", categoryIds: ["hfw-taste", "hfw-opposites", "hfw-feelings"],
    recognitionHanzi: ["燙", "涼", "冰", "嚐", "喝", "酸", "甜", "苦", "辣", "鹹", "拉", "推", "乾淨", "骯髒", "高", "矮", "多", "少", "陰", "晴", "快樂", "高興", "生氣", "好笑", "害怕", "兇"],
    dictationHanzi: ["在", "再", "甜", "冰", "汁", "淋"],
  },
  {
    id: "week-08", number: 8, title: "Meizhou Chapter 4", sourceGuide: "MZ Chapter 4",
    description: "People, places, questions, animals, and pronouns", categoryIds: ["meizhou-4"],
    recognitionHanzi: ["前面", "開門", "門鈴", "猜拳", "兩個", "兩面", "你們", "都有", "誰的", "誰來了", "老人", "老鼠", "哥哥", "弟弟", "請問", "每天"],
    dictationHanzi: ["所", "以", "狗", "貓", "兔", "子"],
  },
  {
    id: "week-09", number: 9, title: "Action Words", sourceGuide: "Verbs HFW",
    description: "Ten high-frequency verbs and six writing characters", categoryIds: ["hfw-verbs"],
    recognitionHanzi: ["用", "來", "到", "回", "描", "講", "跑", "爬", "走", "跳"],
    dictationHanzi: ["跳", "到", "快", "樂", "生", "氣"],
  },
  {
    id: "week-10", number: 10, title: "Meizhou Chapter 8", sourceGuide: "MZ Chapter 8",
    description: "Movement, games, and action dictation", categoryIds: ["meizhou-8"],
    recognitionHanzi: ["爬樹", "賽跑", "跳繩", "跳舞", "跟著走", "翻跟斗", "起來", "蝸牛", "黑夜", "飛盤"],
    dictationHanzi: ["跟", "走", "跑", "跳", "回", "家"],
  },
  {
    id: "week-11", number: 11, title: "Weather, Body & Useful Words", sourceGuide: "HFW Weather, Body Parts and Others",
    description: "Weather, body parts, classroom directions, and pronouns", categoryIds: ["hfw-weather", "hfw-body-parts", "hfw-misc"],
    recognitionHanzi: ["下雪", "毛毛雨", "打雷", "閃電", "頭髮", "牙齒", "腳", "肩膀", "膝蓋", "嘴巴", "牠", "歲", "電影院", "連一連", "圈一圈", "名字", "您", "父母", "生日"],
    dictationHanzi: ["牠", "他", "們", "電", "影"],
  },
  {
    id: "week-12", number: 12, title: "Meizhou Chapter 10", sourceGuide: "MZ Chapter 10",
    description: "Caves, effort, school, and progress", categoryIds: ["meizhou-10"],
    recognitionHanzi: ["山洞", "破洞", "力氣", "用力", "可愛", "等了很久", "用功", "住址", "笑話", "出來", "學生", "貝殼", "一同", "同學", "進來", "進步"],
    dictationHanzi: ["愛", "用", "學", "來"],
  },
];

export function wordsForWeek(week: FirstGradeWeek): FirstGradeWord[] {
  const ordered = [...week.recognitionHanzi, ...week.dictationHanzi];
  const seen = new Set<string>();
  return ordered.flatMap((hanzi) => {
    if (seen.has(hanzi)) return [];
    seen.add(hanzi);
    const word = wordIndex.get(hanzi);
    return word ? [word] : [];
  });
}
