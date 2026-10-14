// quest.js
// The roleplay chat page: quest.html?id=zh-kopi-01

import { db } from "../firebase.js";
import { doc, getDoc, collection, query, where, getDocs, addDoc, runTransaction, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {
  API_BASE, DEMO_MODE, LANGUAGES, SPEECH_LANG,
  $, el, levelInfo, sgDate, getUser, loadUserData, renderTopbar, showPageError
} from "./shared.js";

/* =====================================================================
    1. STATE
    ===================================================================== */
const questId = new URLSearchParams(location.search).get("id");

let user = null;          // Firebase user
let userData = {};        // their document in "users"
let quest = null;         // this quest's document in "quests"
let lang = "zh";

const messages = [];      // the whole conversation: { role: "npc" | "user", text }
const mistakes = [];      // corrections made during this quest
const goalsMet = new Set();
let sending = false;
let finished = false;
let usingFallback = DEMO_MODE;

const DIFFICULTY = ["", "Easy", "Medium", "Hard"];

const PLACEHOLDER = {
  zh: "Type in 华语, or mix in some English",
  ms: "Taip dalam Bahasa Melayu, atau campur sikit English",
  ta: "Type in Tamil (or romanised), mix in English if you need"
};

/* =====================================================================
    2. TALKING TO THE AI
    ---------------------------------------------------------------------
    The backend's POST /chat should reply with JSON like this:
    {
      "reply": "好，少糖。还要什么吗？",          // the NPC's next line
      "translation": "Hǎo, shǎo táng... · Okay, less sugar. Anything else?",
      "correction": {                               // or null if no mistake
        "wrong": "我要一个咖啡",
        "right": "我要一杯咖啡",
        "why": "Drinks use 杯 (bēi), not 个.",
        "tag": "Measure words"   // Measure words | Tones | Word order | Vocabulary | General
      },
      "goalsMet": [0, 1]                            // indexes of goals now completed
    }
    ===================================================================== */
async function getReply(userText) {
  if (!usingFallback) {
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ questId: quest.id, messages })
      });
      if (!res.ok) throw new Error(`Backend replied ${res.status}`);
      return await res.json();
    } catch (err) {
      // If the backend is down, keep the demo going with practice replies
      console.warn("AI backend not reachable, switching to practice mode:", err);
      usingFallback = true;
      $("demoBadge").hidden = false;
      addSystemNote("AI buddy is offline, so you're in practice mode for now.");
    }
  }
  return practiceReply(userText);
}

/* ---------- Practice mode (works without a backend) ---------- */

const PRACTICE_REPLIES = {
  zh: [
    { text: "好的，没问题！还有呢？", sub: "Hǎo de, méi wèntí! Hái yǒu ne? · Okay, no problem! What else?" },
    { text: "哦，这样啊！然后呢？", sub: "Ó, zhèyàng a! Ránhòu ne? · Oh, I see! And then?" },
    { text: "好，好！你说得很好哦。", sub: "Hǎo, hǎo! Nǐ shuō de hěn hǎo o. · Good, good! You speak well." },
    { text: "谢谢你！下次再来啊！", sub: "Xièxie nǐ! Xià cì zài lái a! · Thank you! Come again next time!" }
  ],
  ms: [
    { text: "Baik, boleh! Ada lagi?", sub: "Okay, can! Anything else?" },
    { text: "Oh, begitu! Lepas tu?", sub: "Oh, I see! And then?" },
    { text: "Bagus! Cakap kamu bagus.", sub: "Great! You speak well." },
    { text: "Terima kasih! Datang lagi ya!", sub: "Thank you! Come again!" }
  ],
  ta: [
    { text: "சரி, ஓகே! வேற என்ன?", sub: "Sari, okay! Vera enna? · Okay! What else?" },
    { text: "ஓ, அப்படியா! அப்புறம்?", sub: "O, appadiyaa! Appuram? · Oh, really! And then?" },
    { text: "நல்லா பேசுறீங்க!", sub: "Nalla pesureenga! · You speak well!" },
    { text: "நன்றி! மறுபடியும் வாங்க!", sub: "Nandri! Marupadiyum vaanga! · Thank you! Come again!" }
  ]
};

// English phrases learners often mix in, and what to say instead
const SWAPS = [
  { english: /\bthank(s| you)\b/i, zh: "谢谢 (xièxie)", ms: "terima kasih", ta: "நன்றி (nandri)" },
  { english: /\bhow much\b/i, zh: "多少钱 (duōshao qián)", ms: "berapa harganya", ta: "எவ்வளவு (evvalavu)" },
  { english: /\bless (sugar|sweet)\b/i, zh: "少糖 (shǎo táng)", ms: "kurang manis", ta: "சர்க்கரை குறைவா (sarkkarai kuraiva)" },
  { english: /\bhappy new year\b/i, zh: "新年快乐 (xīnnián kuàilè)", ms: "Selamat Tahun Baru", ta: "புத்தாண்டு வாழ்த்துகள் (puthaandu vaazhthukal)" },
  { english: /\bhow are you\b/i, zh: "你好吗 (nǐ hǎo ma)", ms: "apa khabar", ta: "எப்படி இருக்கீங்க (eppadi irukkeenga)" },
  { english: /\bi('m| am) (a )?student|\bstill studying\b/i, zh: "我还在读书 (wǒ hái zài dúshū)", ms: "saya masih belajar", ta: "நான் படிக்கிறேன் (naan padikkiren)" }
];

function practiceCorrection(text) {
  // Mandarin measure word: drinks use 杯, not 个
  if (lang === "zh" && /一个\s*(咖啡|kopi|茶|teh|milo|美禄)/i.test(text)) {
    return {
      wrong: text,
      right: text.replace("一个", "一杯"),
      why: "Drinks use 杯 (bēi), not 个 (gè). Uncle still understood you, so well done!",
      tag: "Measure words"
    };
  }

  // Code-switching nudge: swap a common English phrase for the Mother Tongue one
  for (const swap of SWAPS) {
    if (swap.english.test(text)) {
      const phrase = text.match(swap.english)[0];
      return {
        wrong: text,
        right: `Instead of "${phrase}", try: ${swap[lang]}`,
        why: `Mixing English is totally fine! Next time, try swapping in the ${LANGUAGES[lang]} phrase.`,
        tag: "Vocabulary"
      };
    }
  }
  return null;
}

function practiceReply(text) {
  const userTurns = messages.filter((m) => m.role === "user").length;   // includes this message
  const list = PRACTICE_REPLIES[lang] || PRACTICE_REPLIES.zh;
  const pick = list[Math.min(userTurns - 1, list.length - 1)];

  // Practice mode ticks off one goal per reply, in order
  const goalCount = (quest.goals || []).length;
  const met = [];
  for (let i = 0; i < Math.min(userTurns, goalCount); i++) met.push(i);

  return new Promise((resolve) => {
    setTimeout(() => resolve({
      reply: pick.text,
      translation: pick.sub,
      correction: practiceCorrection(text),
      goalsMet: met
    }), 700);   // short pause so it feels like the NPC is "typing"
  });
}

/* =====================================================================
    3. DRAWING THE CHAT
    ===================================================================== */
const chatLog = $("chatLog");

function scrollDown() {
  chatLog.scrollTop = chatLog.scrollHeight;
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const line = new SpeechSynthesisUtterance(text);
  line.lang = SPEECH_LANG[lang];
  line.rate = 0.9;
  speechSynthesis.speak(line);
}

function addNpcMessage(text, sub) {
  const wrap = el("div", "msg msg-npc");
  wrap.append(el("div", "bubble", text));

  const subRow = el("div", "msg-sub");
  if ("speechSynthesis" in window) {
    const btn = el("button", "speak-btn", "🔊");
    btn.type = "button";
    btn.setAttribute("aria-label", "Hear this line");
    btn.addEventListener("click", () => speak(text));
    subRow.append(btn);
  }
  if (sub) subRow.append(el("span", "", sub));
  wrap.append(subRow);

  chatLog.append(wrap);
  scrollDown();
}

function addUserMessage(text) {
  const wrap = el("div", "msg msg-user");
  wrap.append(el("div", "bubble", text));
  chatLog.append(wrap);
  scrollDown();
}

function addTip(c) {
  const box = el("div", "tip");
  box.append(
    el("span", "tip-label", "SMALL TIP"),
    el("span", "tip-wrong", c.wrong),
    el("span", "tip-right", c.right),
    el("span", "tip-why", c.why)
  );
  chatLog.append(box);
  scrollDown();
}

function addSystemNote(text) {
  chatLog.append(el("div", "system-note", text));
  scrollDown();
}

function showTyping() {
  const wrap = el("div", "msg msg-npc typing");
  wrap.id = "typing";
  const bubble = el("div", "bubble");
  bubble.append(el("i"), el("i"), el("i"));
  wrap.append(bubble);
  chatLog.append(wrap);
  scrollDown();
}

function hideTyping() {
  const t = $("typing");
  if (t) t.remove();
}

/* =====================================================================
    4. QUEST DETAILS (left side)
    ===================================================================== */
function renderQuest() {
  document.title = `Quest SG — ${quest.title}`;
  $("questDifficulty").textContent = DIFFICULTY[quest.difficulty] || "Quest";
  $("questXp").textContent = `+${quest.xpReward || 0} XP`;
  $("questTitle").textContent = quest.title;
  $("questLocal").textContent = quest.titleLocal || "";
  $("questScenario").textContent = quest.scenario || "";
  $("npcName").textContent = quest.npcName || "Your partner";
  $("npcRole").textContent = quest.npcRole || "";
  $("chatName").textContent = quest.npcName || "Your partner";
  $("npcInitial").textContent = (quest.npcName || "?").charAt(0).toUpperCase();
  $("msgInput").placeholder = PLACEHOLDER[lang];
  $("demoBadge").hidden = !usingFallback;

  // Goals checklist
  $("goalList").replaceChildren(...(quest.goals || []).map((goal, i) => {
    const li = el("li", "goal");
    li.id = `goal-${i}`;
    li.append(el("span", "goal-check", "✓"), el("span", "", goal));
    return li;
  }));

  // Useful words: tap one to add it to the reply box
  $("vocabList").replaceChildren(...(quest.vocab || []).map((v) => {
    const btn = el("button", "vocab-btn");
    btn.type = "button";
    btn.append(el("strong", "", v.word));
    btn.append(el("small", "", v.romanisation ? `${v.romanisation} · ${v.meaning}` : v.meaning));
    btn.addEventListener("click", () => {
      const input = $("msgInput");
      input.value = input.value ? `${input.value} ${v.word}` : v.word;
      input.focus();
    });
    return btn;
  }));
}

function updateGoals(indexes) {
  (indexes || []).forEach((i) => {
    if (goalsMet.has(i)) return;
    goalsMet.add(i);
    const li = $(`goal-${i}`);
    if (li) li.classList.add("done");
  });

  const total = (quest.goals || []).length;
  const hint = $("goalHint");
  if (total > 0 && goalsMet.size >= total) {
    hint.textContent = "All goals done! Finish the quest to collect your XP.";
    hint.className = "small ready";
  } else {
    hint.textContent = `${goalsMet.size} of ${total} goals done`;
    hint.className = "small muted";
  }
}

/* =====================================================================
    5. SENDING A MESSAGE
    ===================================================================== */
async function sendMessage(text) {
  text = text.trim();
  if (!text || sending || finished) return;

  sending = true;
  $("sendBtn").disabled = true;
  $("msgInput").value = "";

  messages.push({ role: "user", text });
  addUserMessage(text);
  showTyping();

  try {
    const result = await getReply(text);
    hideTyping();

    if (result.correction) {
      mistakes.push(result.correction);
      addTip(result.correction);
    }
    messages.push({ role: "npc", text: result.reply });
    addNpcMessage(result.reply, result.translation);
    updateGoals(result.goalsMet);
  } catch (err) {
    hideTyping();
    console.error(err);
    addSystemNote("Something went wrong. Try sending that again.");
  } finally {
    sending = false;
    $("sendBtn").disabled = false;
    $("finishBtn").disabled = finished;
    $("msgInput").focus();
  }
}

$("composer").addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage($("msgInput").value);
});

/* =====================================================================
    6. VOICE INPUT (Chrome / Edge only; hidden elsewhere)
    ===================================================================== */
function setUpMic() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return;            // browser can't do it, keep the mic hidden

  const mic = $("micBtn");
  mic.hidden = false;
  let rec = null;

  mic.addEventListener("click", () => {
    if (rec) { rec.stop(); return; }   // tap again to stop

    rec = new Recognition();
    rec.lang = SPEECH_LANG[lang];
    rec.interimResults = true;

    rec.onresult = (event) => {
      let said = "";
      for (const r of event.results) said += r[0].transcript;
      $("msgInput").value = said;      // the user can check and edit it before sending
    };
    rec.onerror = (event) => {
      if (event.error === "not-allowed") addSystemNote("Allow microphone access in your browser to speak.");
    };
    rec.onend = () => {
      mic.classList.remove("listening");
      mic.setAttribute("aria-label", "Speak your reply");
      rec = null;
    };

    mic.classList.add("listening");
    mic.setAttribute("aria-label", "Stop listening");
    rec.start();
  });
}

/* =====================================================================
    7. FINISHING THE QUEST
    ---------------------------------------------------------------------
    For the hackathon this updates Firestore straight from the browser.
    Later, move it to the backend (POST /progress/complete) so users
    can't give themselves XP from the browser console.
    ===================================================================== */
async function finishQuest() {
  if (finished) return;
  finished = true;
  const btn = $("finishBtn");
  btn.disabled = true;
  btn.textContent = "Saving…";

  try {
    const userRef = doc(db, "users", user.uid);

    // A transaction means two quick clicks can't add XP twice
    const result = await runTransaction(db, async (tx) => {
      const snap = await tx.get(userRef);
      const data = snap.exists() ? snap.data() : {};
      const completed = data.completedQuests || {};
      const alreadyDone = !!completed[quest.id];

      // Streak: today again = same, yesterday = +1, longer gap = back to 1
      const today = sgDate();
      const yesterday = sgDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
      let streak = data.streak || 0;
      if (data.lastActiveDate === today) streak = Math.max(streak, 1);
      else if (data.lastActiveDate === yesterday) streak += 1;
      else streak = 1;

      const xpEarned = alreadyDone ? 0 : (quest.xpReward || 0);
      const xp = (data.xp || 0) + xpEarned;

      tx.set(userRef, {
        xp,
        level: levelInfo(xp).level,
        streak,
        lastActiveDate: today,
        completedQuests: { [quest.id]: true }       // merge adds this quest to the map
      }, { merge: true });

      return { xpEarned, xp, streak, alreadyDone, completed: { ...completed, [quest.id]: true } };
    });

    // Save this quest's mistakes to the user's mistake log
    await Promise.all(mistakes.map((m) => addDoc(collection(db, "users", user.uid, "mistakes"), {
      wrong: m.wrong,
      right: m.right,
      why: m.why,
      tag: m.tag || "General",
      questId: quest.id,
      questTitle: quest.title,
      language: lang,
      fixed: false,
      createdAt: serverTimestamp()
    })));

    // Update the top bar straight away
    $("xpNum").textContent = result.xp;
    $("streakNum").textContent = result.streak;

    await showComplete(result);
    btn.textContent = "Quest finished";
  } catch (err) {
    console.error(err);
    finished = false;
    btn.disabled = false;
    btn.textContent = "Finish quest";
    addSystemNote(err.code === "permission-denied"
      ? "Couldn't save: Firestore blocked it. Check your security rules."
      : "Couldn't save your progress. Check your connection and try again.");
  }
}

$("finishBtn").addEventListener("click", finishQuest);

async function showComplete(result) {
  const info = levelInfo(result.xp);
  const total = (quest.goals || []).length;

  $("doneTitle").textContent = `${quest.npcName || "Your partner"} is impressed!`;
  $("doneSub").textContent = result.alreadyDone
    ? "You've done this quest before, so no extra XP this time. Great practice though!"
    : `You finished "${quest.title}".`;
  $("doneXp").textContent = `+${result.xpEarned}`;
  $("doneStreak").textContent = `${result.streak} ${result.streak === 1 ? "day" : "days"}`;
  $("doneGoals").textContent = `${goalsMet.size} / ${total}`;
  $("doneLevel").textContent = `Level ${info.level} · ${info.title}`;
  $("doneLevelHint").textContent = `${info.toNext} XP to level ${info.level + 1}`;
  $("doneBar").style.width = "0%";

  // Up to 3 mistakes to remember
  const box = $("rememberBox");
  box.hidden = mistakes.length === 0;
  $("rememberList").replaceChildren(...mistakes.slice(0, 3).map((m) => {
    const li = el("li");
    li.append(el("span", "tip-wrong", m.wrong), el("span", "tip-right", m.right));
    return li;
  }));

  // Next quest = first one in this language that isn't done yet
  try {
    const snap = await getDocs(query(collection(db, "quests"), where("language", "==", lang)));
    const next = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => a.order - b.order)
      .find((q) => !result.completed[q.id]);
    const nextBtn = $("nextQuestBtn");
    if (next) {
      nextBtn.href = `quest.html?id=${encodeURIComponent(next.id)}`;
      nextBtn.textContent = "Next quest";
    } else {
      nextBtn.href = "homepage.html";
      nextBtn.textContent = "All done! Back to board";
    }
  } catch (err) {
    console.error(err);
  }

  $("doneDialog").showModal();
  requestAnimationFrame(() => { $("doneBar").style.width = `${info.percent}%`; });
}

/* =====================================================================
    8. START
    ===================================================================== */
async function start() {
  if (!questId) {
    showPageError("No quest was picked. Go back to the quest board and choose one.");
    return;
  }

  try {
    user = await getUser();
    userData = await loadUserData(user.uid);
    renderTopbar(user, userData);

    const snap = await getDoc(doc(db, "quests", questId));
    if (!snap.exists()) {
      showPageError("We couldn't find that quest. Go back to the quest board and pick another one.");
      return;
    }
    quest = { id: snap.id, ...snap.data() };
    lang = LANGUAGES[quest.language] ? quest.language : "zh";
  } catch (err) {
    showPageError(err.code === "permission-denied"
      ? "Firestore blocked this page. Check your security rules."
      : "Couldn't load the quest. Check your connection and refresh the page.", err);
    return;
  }

  $("questLayout").hidden = false;
  renderQuest();
  updateGoals([]);
  setUpMic();

  // The NPC speaks first
  messages.push({ role: "npc", text: quest.openingLine });
  addNpcMessage(quest.openingLine, "");
  $("finishBtn").disabled = false;
  $("msgInput").focus();
}

start();