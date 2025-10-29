const video = document.getElementById("courseVideo");
const progressBar = document.getElementById("progressBar");
const statusText = document.getElementById("statusText");

// Giả lập API URL (đổi theo backend của bạn)
const API_URL = "http://localhost:4000/api/course-progress";

// Khi video đã sẵn sàng
video.addEventListener("loadedmetadata", () => {
  statusText.textContent = "Sẵn sàng xem video";
});

// Cập nhật tiến trình theo thời gian thực
video.addEventListener("timeupdate", async () => {
  const percent = (video.currentTime / video.duration) * 100;
  progressBar.style.width = `${percent}%`;

  // Cập nhật trạng thái theo thời gian thực
  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task: "video",
      progress: percent.toFixed(2),
      completed: false,
      timestamp: new Date().toISOString(),
    }),
  });
});

// Khi xem hết video
video.addEventListener("ended", async () => {
  progressBar.style.width = "100%";
  statusText.textContent = "✅ Hoàn thành khóa học!";

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task: "video",
      progress: 100,
      completed: true,
      timestamp: new Date().toISOString(),
    }),
  });
});
