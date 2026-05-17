const subjects = ["语文", "数学", "英语", "物理", "化学", "道法", "历史"];
const storageKey = "examMistakeBookQuestions";

let questions = loadQuestions();
let currentSubject = "";
let selectedImageData = "";

const homeView = document.querySelector("#homeView");
const subjectView = document.querySelector("#subjectView");
const detailView = document.querySelector("#detailView");
const subjectGrid = document.querySelector("#subjectGrid");
const subjectTitle = document.querySelector("#subjectTitle");
const subjectCount = document.querySelector("#subjectCount");
const questionList = document.querySelector("#questionList");
const emptyMessage = document.querySelector("#emptyMessage");
const questionForm = document.querySelector("#questionForm");
const showFormBtn = document.querySelector("#showFormBtn");
const cancelFormBtn = document.querySelector("#cancelFormBtn");
const backHomeBtn = document.querySelector("#backHomeBtn");
const backSubjectBtn = document.querySelector("#backSubjectBtn");
const imageInput = document.querySelector("#imageInput");
const imagePreview = document.querySelector("#imagePreview");

const typeInput = document.querySelector("#typeInput");
const knowledgeInput = document.querySelector("#knowledgeInput");
const reasonInput = document.querySelector("#reasonInput");
const solutionInput = document.querySelector("#solutionInput");
const statusInput = document.querySelector("#statusInput");

renderHome();

showFormBtn.addEventListener("click", () => {
  questionForm.classList.remove("hidden");
  showFormBtn.classList.add("hidden");
});

cancelFormBtn.addEventListener("click", resetForm);
backHomeBtn.addEventListener("click", showHome);
backSubjectBtn.addEventListener("click", () => showSubject(currentSubject));

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) {
    selectedImageData = "";
    imagePreview.classList.add("hidden");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    selectedImageData = reader.result;
    imagePreview.src = selectedImageData;
    imagePreview.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

questionForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!selectedImageData) {
    alert("请先上传题目图片。");
    return;
  }

  const question = {
    id: Date.now().toString(),
    subject: currentSubject,
    type: typeInput.value,
    image: selectedImageData,
    knowledge: knowledgeInput.value.trim(),
    reason: reasonInput.value.trim(),
    solution: solutionInput.value.trim(),
    status: statusInput.value,
    createdAt: new Date().toISOString()
  };

  questions.unshift(question);
  saveQuestions();
  resetForm();
  renderSubjectQuestions();
});

function renderHome() {
  subjectGrid.innerHTML = "";

  subjects.forEach((subject) => {
    const count = questions.filter((question) => question.subject === subject).length;
    const button = document.createElement("button");
    button.className = "subject-card";
    button.innerHTML = `
      <strong>${subject}</strong>
      <span>${count} 道错题</span>
    `;
    button.addEventListener("click", () => showSubject(subject));
    subjectGrid.appendChild(button);
  });
}

function showHome() {
  currentSubject = "";
  homeView.classList.remove("hidden");
  subjectView.classList.add("hidden");
  detailView.classList.add("hidden");
  backHomeBtn.classList.add("hidden");
  resetForm();
  renderHome();
}

function showSubject(subject) {
  currentSubject = subject;
  homeView.classList.add("hidden");
  subjectView.classList.remove("hidden");
  detailView.classList.add("hidden");
  backHomeBtn.classList.remove("hidden");
  subjectTitle.textContent = `${subject}错题`;
  resetForm();
  renderSubjectQuestions();
}

function renderSubjectQuestions() {
  const subjectQuestions = questions.filter((question) => question.subject === currentSubject);
  subjectCount.textContent = `共 ${subjectQuestions.length} 道错题`;
  questionList.innerHTML = "";
  emptyMessage.classList.toggle("hidden", subjectQuestions.length > 0);

  subjectQuestions.forEach((question) => {
    const item = document.createElement("article");
    item.className = "question-item";
    item.innerHTML = `
      <img class="question-thumb" src="${question.image}" alt="题目缩略图">
      <div class="question-info">
        <h3>${question.type} · ${question.knowledge}</h3>
        <p>添加时间：${formatTime(question.createdAt)}</p>
        <span class="status">${question.status}</span>
      </div>
      <button class="ghost-button" type="button">查看详情</button>
    `;
    item.querySelector("button").addEventListener("click", () => showDetail(question.id));
    questionList.appendChild(item);
  });
}

function showDetail(id) {
  const question = questions.find((item) => item.id === id);
  if (!question) {
    alert("没有找到这道错题。");
    showSubject(currentSubject);
    return;
  }

  currentSubject = question.subject;
  homeView.classList.add("hidden");
  subjectView.classList.add("hidden");
  detailView.classList.remove("hidden");
  backHomeBtn.classList.remove("hidden");

  document.querySelector("#detailMeta").textContent = `${question.subject} · ${question.type}`;
  document.querySelector("#detailImage").src = question.image;
  document.querySelector("#detailSubject").textContent = question.subject;
  document.querySelector("#detailType").textContent = question.type;
  document.querySelector("#detailKnowledge").textContent = question.knowledge;
  document.querySelector("#detailReason").textContent = question.reason;
  document.querySelector("#detailSolution").textContent = question.solution;
  document.querySelector("#detailStatus").textContent = question.status;
  document.querySelector("#detailCreatedAt").textContent = formatTime(question.createdAt);
}

function resetForm() {
  questionForm.reset();
  questionForm.classList.add("hidden");
  showFormBtn.classList.remove("hidden");
  selectedImageData = "";
  imagePreview.removeAttribute("src");
  imagePreview.classList.add("hidden");
}

function loadQuestions() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.warn("读取本地错题失败，已使用空列表。", error);
    return [];
  }
}

function saveQuestions() {
  localStorage.setItem(storageKey, JSON.stringify(questions));
}

function formatTime(value) {
  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
