const quizContainer = document.getElementById("quiz-container");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const timeText = document.getElementById("time");
const startBtn = document.getElementById("start-btn");

let progress = 0;
let timeSpent = 0;
let timer;

const tasks = [
  { id: 1, questions: 5 },
  { id: 2, questions: 5 },
];
let currentTask = 0;

startBtn.addEventListener("click", () => {
  startBtn.style.display = "none";
  startQuiz();
});

function startQuiz() {
  currentTask++;
  let answers = [];
  quizContainer.innerHTML = `<h3>Task ${currentTask}</h3>`;
  for (let i = 1; i <= tasks[currentTask - 1].questions; i++) {
    quizContainer.innerHTML += `
      <div>
        <p>Câu ${i}: 2 + 2 = ?</p>
        <input type="radio" name="q${i}" value="3" />3
        <input type="radio" name="q${i}" value="4" />4
        <input type="radio" name="q${i}" value="5" />5
      </div>`;
  }
  quizContainer.innerHTML += `<button id="submit-btn">Nộp bài</button>`;
  startTimer();
  document.getElementById("submit-btn").onclick = submitQuiz;
}

function startTimer() {
  timer = setInterval(() => {
    timeSpent++;
    timeText.textContent = `Thời gian làm bài: ${timeSpent} giây`;
  }, 1000);
}

async function submitQuiz() {
  clearInterval(timer);

  progress = currentTask === 1 ? 50 : 100;
  progressBar.style.width = `${progress}%`;
  progressText.textContent = `Tiến trình: ${progress}%`;

  const data = { task: `quiz${currentTask}`, progress, timeSpent };

  await fetch("/api/course/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  alert(`Đã gửi kết quả Task ${currentTask}`);

  if (currentTask < tasks.length) startQuiz();
}
