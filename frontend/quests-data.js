// quests-data.js
// Seed data for the Firestore "quests" collection.
// One document per quest. The document ID is the "id" field below.

export const quests = [
  // ======================= MANDARIN (zh) =======================
  {
    id: "zh-kopi-01",
    language: "zh",
    order: 1,
    title: "Order kopi at the hawker centre",
    titleLocal: "在小贩中心点咖啡",
    difficulty: 1,
    xpReward: 50,
    npcName: "Kopi Uncle",
    npcRole: "A friendly kopitiam uncle in his 50s. Busy but kind. Replies in short, simple Mandarin with a little Singlish.",
    scenario: "You are at a hawker centre drink stall. Order a coffee the way you like it and pay.",
    openingLine: "欢迎光临！要喝什么？",
    goals: ["Order a coffee", "Say how you want it (e.g. less sugar)", "Ask the price"],
    vocab: [
      { word: "咖啡", romanisation: "kāfēi", meaning: "coffee" },
      { word: "少糖", romanisation: "shǎo táng", meaning: "less sugar" },
      { word: "多少钱", romanisation: "duōshao qián", meaning: "how much" },
      { word: "谢谢", romanisation: "xièxie", meaning: "thank you" }
    ]
  },
  {
    id: "zh-cny-02",
    language: "zh",
    order: 2,
    title: "Survive CNY visiting",
    titleLocal: "春节拜年大作战",
    difficulty: 2,
    xpReward: 80,
    npcName: "Auntie Mei",
    npcRole: "A talkative auntie at a CNY gathering. Asks nosy questions (work, salary, marriage) in a warm way. Simple Mandarin.",
    scenario: "You arrive at a relative's house for Chinese New Year. Greet everyone and handle the questions politely.",
    openingLine: "新年快乐！快进来坐，吃点年糕。你现在做什么工作啊？",
    goals: ["Give a CNY greeting", "Answer a question about your work or studies", "Politely change the topic"],
    vocab: [
      { word: "新年快乐", romanisation: "xīnnián kuàilè", meaning: "Happy New Year" },
      { word: "恭喜发财", romanisation: "gōngxǐ fācái", meaning: "wishing you prosperity" },
      { word: "红包", romanisation: "hóngbāo", meaning: "red packet" },
      { word: "我还在读书", romanisation: "wǒ hái zài dúshū", meaning: "I'm still studying" }
    ]
  },
  {
    id: "zh-ahma-03",
    language: "zh",
    order: 3,
    title: "Chat with Ah Ma",
    titleLocal: "和阿嬷聊天",
    difficulty: 1,
    xpReward: 60,
    npcName: "Ah Ma",
    npcRole: "A loving grandmother who mostly speaks Mandarin and worries about whether you have eaten. Speaks slowly.",
    scenario: "You visit your grandmother on a weekend. She wants to know how you have been.",
    openingLine: "你来啦！吃饭了没有？",
    goals: ["Say whether you have eaten", "Ask how she is", "Say something you did this week"],
    vocab: [
      { word: "吃饭了吗", romanisation: "chīfàn le ma", meaning: "have you eaten?" },
      { word: "我很好", romanisation: "wǒ hěn hǎo", meaning: "I'm fine" },
      { word: "身体好吗", romanisation: "shēntǐ hǎo ma", meaning: "are you keeping well?" },
      { word: "想你", romanisation: "xiǎng nǐ", meaning: "missed you" }
    ]
  },

  // ======================= MALAY (ms) =======================
  {
    id: "ms-kopi-01",
    language: "ms",
    order: 1,
    title: "Order kopi at the hawker centre",
    titleLocal: "Pesan kopi di gerai makan",
    difficulty: 1,
    xpReward: 50,
    npcName: "Pak Cik Kopi",
    npcRole: "A friendly drinks stall uncle. Speaks simple casual Malay with a little Singlish.",
    scenario: "You are at a hawker centre drink stall. Order a coffee the way you like it and pay.",
    openingLine: "Selamat pagi! Nak minum apa?",
    goals: ["Order a coffee", "Say how you want it (e.g. less sweet)", "Ask the price"],
    vocab: [
      { word: "kopi", romanisation: "", meaning: "coffee" },
      { word: "kurang manis", romanisation: "", meaning: "less sweet" },
      { word: "berapa harganya", romanisation: "", meaning: "how much is it" },
      { word: "terima kasih", romanisation: "", meaning: "thank you" }
    ]
  },
  {
    id: "ms-raya-02",
    language: "ms",
    order: 2,
    title: "Hari Raya visiting",
    titleLocal: "Beraya di rumah saudara",
    difficulty: 2,
    xpReward: 80,
    npcName: "Mak Long",
    npcRole: "A cheerful aunt hosting Hari Raya open house. Offers lots of food and asks when you will get married or find a job. Simple Malay.",
    scenario: "You visit a relative's home during Hari Raya. Greet the host, accept food, and answer her questions.",
    openingLine: "Selamat Hari Raya! Jemputlah masuk, makan ketupat dan rendang. Kamu kerja di mana sekarang?",
    goals: ["Give a Hari Raya greeting", "Accept or politely refuse food", "Answer a question about work or studies"],
    vocab: [
      { word: "Selamat Hari Raya", romanisation: "", meaning: "Happy Hari Raya" },
      { word: "maaf zahir dan batin", romanisation: "", meaning: "forgive me, outwardly and inwardly" },
      { word: "sedap", romanisation: "", meaning: "delicious" },
      { word: "saya masih belajar", romanisation: "", meaning: "I'm still studying" }
    ]
  },
  {
    id: "ms-nenek-03",
    language: "ms",
    order: 3,
    title: "Chat with Nenek",
    titleLocal: "Berbual dengan Nenek",
    difficulty: 1,
    xpReward: 60,
    npcName: "Nenek",
    npcRole: "A loving grandmother who speaks Malay slowly and worries whether you have eaten.",
    scenario: "You visit your grandmother on a weekend. She wants to know how you have been.",
    openingLine: "Eh, dah sampai! Dah makan ke belum?",
    goals: ["Say whether you have eaten", "Ask how she is", "Say something you did this week"],
    vocab: [
      { word: "dah makan", romanisation: "", meaning: "already eaten" },
      { word: "apa khabar", romanisation: "", meaning: "how are you" },
      { word: "sihat", romanisation: "", meaning: "healthy / well" },
      { word: "rindu", romanisation: "", meaning: "miss (someone)" }
    ]
  },

  // ======================= TAMIL (ta) =======================
  {
    id: "ta-kopi-01",
    language: "ta",
    order: 1,
    title: "Order coffee at the hawker centre",
    titleLocal: "ஹாக்கர் சென்டரில் காபி வாங்குங்கள்",
    difficulty: 1,
    xpReward: 50,
    npcName: "Anna (Drinks Uncle)",
    npcRole: "A friendly drinks stall owner. Speaks simple spoken Tamil with a little Singlish.",
    scenario: "You are at a hawker centre drink stall. Order a coffee the way you like it and pay.",
    openingLine: "வணக்கம்! என்ன வேணும்?",
    goals: ["Order a coffee", "Say how you want it (e.g. less sugar)", "Ask the price"],
    vocab: [
      { word: "காபி", romanisation: "kaapi", meaning: "coffee" },
      { word: "சர்க்கரை குறைவா", romanisation: "sarkkarai kuraiva", meaning: "less sugar" },
      { word: "எவ்வளவு", romanisation: "evvalavu", meaning: "how much" },
      { word: "நன்றி", romanisation: "nandri", meaning: "thank you" }
    ]
  },
  {
    id: "ta-deepavali-02",
    language: "ta",
    order: 2,
    title: "Deepavali visiting",
    titleLocal: "தீபாவளி விருந்தினர் வருகை",
    difficulty: 2,
    xpReward: 80,
    npcName: "Athai",
    npcRole: "A warm aunt hosting Deepavali visitors. Offers murukku and sweets and asks about your studies or job. Simple spoken Tamil.",
    scenario: "You visit a relative's home during Deepavali. Greet the host, accept snacks, and answer her questions.",
    openingLine: "தீபாவளி நல்வாழ்த்துகள்! உள்ள வாங்க, முறுக்கு சாப்பிடுங்க. நீ இப்போ என்ன பண்ற?",
    goals: ["Give a Deepavali greeting", "Accept or politely refuse snacks", "Answer a question about work or studies"],
    vocab: [
      { word: "தீபாவளி நல்வாழ்த்துகள்", romanisation: "Deepavali nalvaazhthukal", meaning: "Happy Deepavali" },
      { word: "முறுக்கு", romanisation: "murukku", meaning: "murukku (snack)" },
      { word: "இனிப்பு", romanisation: "inippu", meaning: "sweet" },
      { word: "நான் படிக்கிறேன்", romanisation: "naan padikkiren", meaning: "I am studying" }
    ]
  },
  {
    id: "ta-paati-03",
    language: "ta",
    order: 3,
    title: "Chat with Paati",
    titleLocal: "பாட்டியுடன் பேசுங்கள்",
    difficulty: 1,
    xpReward: 60,
    npcName: "Paati",
    npcRole: "A loving grandmother who speaks Tamil slowly and worries whether you have eaten.",
    scenario: "You visit your grandmother on a weekend. She wants to know how you have been.",
    openingLine: "வா கண்ணு! சாப்பிட்டியா?",
    goals: ["Say whether you have eaten", "Ask how she is", "Say something you did this week"],
    vocab: [
      { word: "சாப்பிட்டேன்", romanisation: "saappitten", meaning: "I have eaten" },
      { word: "எப்படி இருக்கீங்க", romanisation: "eppadi irukkeenga", meaning: "how are you" },
      { word: "நல்லா இருக்கேன்", romanisation: "nalla irukken", meaning: "I'm fine" },
      { word: "உங்களைப் பார்க்க ஆசை", romanisation: "ungalai paarkka aasai", meaning: "wanted to see you" }
    ]
  }
];