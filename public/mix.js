const section = document.getElementById("section");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const timeText = document.getElementById("time");
const nextBtn = document.getElementById("next-btn");

let phase = 0; // 0: video, 1: quiz
let progress = 0;
let timeSpent = 0;
let timer;

nextBtn.addEventListener("click", () => {
  nextBtn.style.display = "none";
  startPhase();
});

function startTimer() {
  timer = setInterval(() => {
    timeSpent++;
    timeText.textContent = `Thời gian học: ${timeSpent} giây`;
  }, 1000);
}

function startPhase() {
  clearInterval(timer);
  startTimer();

  if (phase === 0) {
    // Giai đoạn học video
    section.innerHTML = `
      <h2>Bước 1: Xem video</h2>
      <iframe width="560" height="315"
        src="https://www.youtube.com/embed/2Ji-clqUYnA"
        frameborder="0" allowfullscreen></iframe>
      <br><button id="done-video">Hoàn thành video</button>
    `;

    document.getElementById("done-video").onclick = async () => {
      progress = 50;
      progressBar.style.width = "50%";
      progressText.textContent = "Tiến trình: 50%";
      await sendProgress("video");

      phase = 1;
      startPhase();
    };
  } else {
    // Giai đoạn làm quiz
    section.innerHTML = `
      <h2>Bước 2: Làm quiz</h2>
      <p>2 + 2 = ?</p>
      <input type="radio" name="q" value="3">3
      <input type="radio" name="q" value="4">4
      <button id="submit-quiz">Nộp bài</button>
    `;

    document.getElementById("submit-quiz").onclick = async () => {
      progress = 100;
      progressBar.style.width = "100%";
      progressText.textContent = "Tiến trình: 100%";
      clearInterval(timer);
      await sendProgress("quiz");
      alert("Hoàn tất khóa học!");
    };
  }
}

async function sendProgress(task) {
  await fetch("/api/course/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, progress, timeSpent }),
  });
}
