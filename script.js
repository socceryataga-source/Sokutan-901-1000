if (!window.__authOK) {
  // 認証失敗時は何も実行しない
} else {

let quizData = [];
let currentIndex = 0;
let score = 0;
let mode = "order";
let savedSettings = { start: 901, end: 1000, mode: "order" };
const answered = new Map();

const menuScreen = document.getElementById("menuScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");
const startInput = document.getElementById("startInput");
const endInput = document.getElementById("endInput");
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("scoreText");
const wordText = document.getElementById("wordText");
const choicesEl = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");
const finalScore = document.getElementById("finalScore");

document.querySelectorAll(".modeBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".modeBtn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    mode = btn.dataset.mode;
  });
});

document.getElementById("startBtn").addEventListener("click", () => {
  startQuiz(false);
});
document.getElementById("prevBtn").addEventListener("click", prevQuestion);
document.getElementById("nextBtn").addEventListener("click", nextQuestion);
document.getElementById("restartBtn").addEventListener("click", () => startQuiz(true));
document.getElementById("retryRangeBtn").addEventListener("click", resetToMenu);
document.getElementById("backMenuBtn").addEventListener("click", resetToMenu);
document.getElementById("restartFromResultBtn").addEventListener("click", () => startQuiz(true));
document.getElementById("retryRangeFromResultBtn").addEventListener("click", resetToMenu);
document.getElementById("backMenuFromResultBtn").addEventListener("click", resetToMenu);
document.getElementById("speakBtn").addEventListener("click", speakWord);

function startQuiz(useSaved){
  let start = useSaved ? savedSettings.start : parseInt(startInput.value, 10);
  let end = useSaved ? savedSettings.end : parseInt(endInput.value, 10);
  let selectedMode = useSaved ? savedSettings.mode : mode;

  if(Number.isNaN(start) || Number.isNaN(end)){
    alert("開始番号と終了番号を入力してください。");
    return;
  }
  if(start > end){
    alert("開始番号は終了番号以下にしてください。");
    return;
  }

  const filtered = data.filter(item => item.id >= start && item.id <= end);
  if(filtered.length === 0){
    alert("指定範囲にデータがありません。");
    return;
  }

  savedSettings = { start, end, mode: selectedMode };
  startInput.value = start;
  endInput.value = end;

  quizData = [...filtered];
  if(selectedMode === "random"){
    shuffle(quizData);
  }

  currentIndex = 0;
  score = 0;
  answered.clear();

  showScreen("quiz");
  renderQuestion();
}

function renderQuestion(){
  const q = quizData[currentIndex];
  progressText.textContent = `${currentIndex + 1} / ${quizData.length}`;
  scoreText.textContent = `Score: ${score}`;
  wordText.textContent = q.word;
  choicesEl.innerHTML = "";
  feedbackEl.classList.add("hidden");
  feedbackEl.innerHTML = "";

  q.choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choiceBtn";
    btn.textContent = choice;
    btn.disabled = answered.has(q.id);
    btn.addEventListener("click", () => answerQuestion(index));
    choicesEl.appendChild(btn);
  });

  if(answered.has(q.id)){
    const record = answered.get(q.id);
    applyChoiceStyles(record.selectedIndex, q.correct);
    showFeedback(record.selectedIndex === q.correct, q);
  }

  document.getElementById("prevBtn").disabled = currentIndex === 0;
  document.getElementById("nextBtn").textContent = currentIndex === quizData.length - 1 ? "結果へ" : "次へ";
}

function answerQuestion(selectedIndex){
  const q = quizData[currentIndex];
  if(answered.has(q.id)) return;

  const isCorrect = selectedIndex === q.correct;
  answered.set(q.id, { selectedIndex, isCorrect });
  if(isCorrect) score += 1;

  scoreText.textContent = `Score: ${score}`;
  applyChoiceStyles(selectedIndex, q.correct);
  [...choicesEl.children].forEach(btn => btn.disabled = true);
  showFeedback(isCorrect, q);
}

function applyChoiceStyles(selectedIndex, correctIndex){
  [...choicesEl.children].forEach((btn, idx) => {
    btn.classList.remove("correct", "wrong");
    if(idx === correctIndex) btn.classList.add("correct");
    if(idx === selectedIndex && idx !== correctIndex) btn.classList.add("wrong");
  });
}

function showFeedback(isCorrect, q){
  feedbackEl.classList.remove("hidden");
  feedbackEl.innerHTML = `
    <div class="status ${isCorrect ? "ok" : "bad"}">${isCorrect ? "⭕ 正解！" : "❌ 不正解"}</div>
    <div class="answer">正解：${q.choices[q.correct]}</div>
    <div><strong>例文：</strong>${q.sentence}</div>
    <div><strong>和訳：</strong>${q.jp}</div>
  `;
}

function prevQuestion(){
  if(currentIndex > 0){
    currentIndex -= 1;
    renderQuestion();
  }
}

function nextQuestion(){
  if(currentIndex < quizData.length - 1){
    currentIndex += 1;
    renderQuestion();
  } else {
    finalScore.textContent = `${score} / ${quizData.length}`;
    showScreen("result");
  }
}

function resetToMenu(){
  showScreen("menu");
}

function showScreen(name){
  menuScreen.classList.add("hidden");
  quizScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  if(name === "menu") menuScreen.classList.remove("hidden");
  if(name === "quiz") quizScreen.classList.remove("hidden");
  if(name === "result") resultScreen.classList.remove("hidden");
}

function speakWord(){
  if(!quizData.length) return;
  const q = quizData[currentIndex];
  const utter = new SpeechSynthesisUtterance(q.word);
  utter.lang = "en-US";
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

function shuffle(arr){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

}
