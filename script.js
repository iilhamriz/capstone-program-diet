// Halaman:
// 1 => Pilih Gender
// 2 => Intro
// 3..(2+questions.length) => Pertanyaan ke-1 s/d ke-n
// (2+questions.length+1) => Summary

let currentPage = 1;
let currentQuestionIndex = 0;
let questions = [];
let totalPages = 0;

let userData = {
  gender: "", // akan diisi di page-1
};

window.addEventListener("DOMContentLoaded", () => {
  // Tampilkan page-1
  document.getElementById("page-1").classList.add("active");

  // Load data pertanyaan dari JSON
  fetch("questions.json")
    .then((res) => res.json())
    .then((data) => {
      questions = data;
      // 2 halaman awal (page-1 & 2) + n pertanyaan + 1 summary
      totalPages = 2 + questions.length + 1;
      updateProgressBar();
    })
    .catch((err) => {
      console.error("Error loading questions.json:", err);
    });
});

/**
 * setGender(g):
 * Simpan gender di userData, lalu next page
 */
function setGender(g) {
  userData.gender = g;
  nextPage();
}

/**
 * nextPage():
 * Handle navigasi forward
 */
function nextPage() {
  // 1) Page 1 => Page 2
  if (currentPage === 1) {
    document.getElementById("page-1").classList.remove("active");
    document.getElementById("page-2").style.display = "block";
    document.getElementById("page-2").classList.add("active");
    currentPage = 2;
    updateProgressBar();
    return;
  }

  // 2) Page 2 => question-page (pertanyaan pertama)
  if (currentPage === 2) {
    document.getElementById("page-2").classList.remove("active");
    document.getElementById("page-2").style.display = "none";

    if (questions.length === 0) {
      // Jika tak ada pertanyaan => langsung summary
      currentPage = totalPages;
      document.getElementById("summary-page").style.display = "block";
      showSummary();
    } else {
      // Tampilkan question-page
      currentPage = 3;
      document.getElementById("question-page").style.display = "block";
      renderQuestion(currentQuestionIndex);
    }
    updateProgressBar();
    return;
  }

  // 3) Sedang di question-page
  if (currentPage > 2 && currentPage < totalPages) {
    // Validasi & simpan jawaban
    if (!validateAndSaveAnswer()) return;

    // Next question
    currentQuestionIndex++;
    currentPage++; // Naik satu page agar progress bar naik

    // Cek masih ada pertanyaan?
    if (currentQuestionIndex < questions.length) {
      renderQuestion(currentQuestionIndex);
    } else {
      // Habis => ke summary
      document.getElementById("question-page").style.display = "none";
      currentPage = totalPages;
      document.getElementById("summary-page").style.display = "block";
      showSummary();
    }
    updateProgressBar();
    return;
  }
}

/**
 * previousPage():
 * Handle tombol back
 */
function previousPage() {
  // page-1 => ga bisa mundur
  if (currentPage <= 1) return;

  // jika di summary => balik ke pertanyaan terakhir
  if (currentPage === totalPages) {
    document.getElementById("summary-page").style.display = "none";
    currentPage--;
    currentQuestionIndex = questions.length - 1;
    document.getElementById("question-page").style.display = "block";
    renderQuestion(currentQuestionIndex);
    updateProgressBar();
    return;
  }

  // kalau di question-page
  if (currentPage > 2 && currentPage < totalPages) {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      currentPage--;
      renderQuestion(currentQuestionIndex);
    } else {
      // Balik ke page-2
      document.getElementById("question-page").style.display = "none";
      currentPage = 2;
      document.getElementById("page-2").style.display = "block";
      document.getElementById("page-2").classList.add("active");
    }
    updateProgressBar();
    return;
  }

  // kalau di page-2 => balik ke page-1
  if (currentPage === 2) {
    document.getElementById("page-2").classList.remove("active");
    document.getElementById("page-2").style.display = "none";
    currentPage = 1;
    document.getElementById("page-1").classList.add("active");
    updateProgressBar();
    return;
  }
}

/**
 * renderQuestion(index):
 * Tampilkan pertanyaan ke-index
 */
function renderQuestion(index) {
  const questionData = questions[index];
  const container = document.getElementById("question-container");
  const pageEl = document.getElementById("question-page");

  container.innerHTML = "";
  pageEl.classList.remove("input-type");

  const titleEl = document.createElement("h2");
  titleEl.textContent = questionData.title;
  container.appendChild(titleEl);

  // Cek jika ada jawaban lama
  const savedAnswer = userData[questionData.name];

  if (questionData.type === "multipleChoice") {
    const optionList = document.createElement("div");
    optionList.classList.add("option-list");

    questionData.options.forEach((opt) => {
      const optionItem = document.createElement("div");
      optionItem.classList.add("option-item");

      const radioInput = document.createElement("input");
      radioInput.type = "radio";
      radioInput.name = questionData.name;
      radioInput.value = opt.value;
      radioInput.hidden = true;

      const customRadio = document.createElement("div");
      customRadio.classList.add("custom-radio");

      const labelSpan = document.createElement("span");
      labelSpan.textContent = opt.label;

      // Event
      optionItem.addEventListener("click", () => {
        // unselect group
        const allItems = optionList.querySelectorAll(".option-item");
        allItems.forEach((i) => {
          i.classList.remove("selected");
          const inp = i.querySelector("input[type=radio]");
          if (inp) inp.checked = false;
        });
        // select
        optionItem.classList.add("selected");
        radioInput.checked = true;
      });

      if (savedAnswer && savedAnswer === opt.value) {
        radioInput.checked = true;
        optionItem.classList.add("selected");
      }

      optionItem.appendChild(radioInput);
      optionItem.appendChild(customRadio);
      optionItem.appendChild(labelSpan);
      optionList.appendChild(optionItem);
    });

    container.appendChild(optionList);
  } else if (questionData.type === "input") {
    pageEl.classList.add("input-type");
    const inputEl = document.createElement("input");
    inputEl.type = "number";
    inputEl.id = "question-input";
    inputEl.placeholder = questionData.placeholder || "";

    if (savedAnswer) {
      inputEl.value = savedAnswer;
    }
    container.appendChild(inputEl);
  }
}

/**
 * validateAndSaveAnswer():
 * Pastikan user isi jawaban, simpan ke userData
 */
function validateAndSaveAnswer() {
  const questionData = questions[currentQuestionIndex];
  const name = questionData.name;

  if (questionData.type === "multipleChoice") {
    const checkedRadio = document.querySelector(
      `input[name="${name}"]:checked`
    );
    if (!checkedRadio) {
      alert("Please choose an option first!");
      return false;
    }
    userData[name] = checkedRadio.value;
  } else if (questionData.type === "input") {
    const inputEl = document.getElementById("question-input");
    if (!inputEl.value || Number(inputEl.value) <= 0) {
      alert("Please enter a valid number!");
      return false;
    }
    userData[name] = inputEl.value;
  }

  return true;
}

/**
 * showSummary():
 * Tampilkan ringkasan & berikan kesimpulan
 * berdasarkan BMI dan goal
 */
function showSummary() {
  const summaryDiv = document.getElementById("summary");

  // Tampilkan jawaban user
  let html = `
    <p><strong>Gender:</strong> ${userData.gender}</p>
    <p><strong>Primary Goal:</strong> ${userData.goal || "-"}</p>
    <p><strong>Ideal Body:</strong> ${userData.idealBody || "-"}</p>
    <p><strong>Weight:</strong> ${userData.weight || "-"} kg</p>
    <p><strong>Height:</strong> ${userData.height || "-"} cm</p>
  `;

  // Hitung BMI kalau weight & height terisi
  if (userData.weight && userData.height) {
    const weightKg = parseFloat(userData.weight);
    const heightCm = parseFloat(userData.height);
    const heightM = heightCm / 100.0; // ubah cm ke meter

    const bmi = weightKg / (heightM * heightM);
    const bmiRounded = bmi.toFixed(1); // satu desimal

    // Tentukan kategori BMI
    let category = "";
    if (bmi < 18.5) {
      category = "Underweight";
    } else if (bmi < 25) {
      category = "Normal";
    } else if (bmi < 30) {
      category = "Overweight";
    } else {
      category = "Obese";
    }

    html += `<p><strong>Your BMI:</strong> ${bmiRounded} (${category})</p>`;

    // Beri saran/logika sederhana
    let recommendation = "";
    // Misal:
    if (
      userData.goal === "lose" &&
      (category === "Overweight" || category === "Obese")
    ) {
      recommendation =
        "Based on your BMI, you might benefit from a structured weight loss program.";
    } else if (userData.goal === "lose" && category === "Normal") {
      recommendation =
        "Your BMI is already in the normal range. Make sure to lose weight safely.";
    } else if (userData.goal === "healthier" && category === "Overweight") {
      recommendation =
        "Focus on a balanced diet and regular exercise to reach a healthier BMI.";
    } else if (category === "Underweight") {
      recommendation =
        "Consider consuming more nutritious calories and possibly muscle-building exercises.";
    } else if (category === "Normal") {
      recommendation =
        "Maintain your healthy lifestyle! Keep up the good work.";
    }

    // Tambahkan ke html
    if (recommendation) {
      html += `<p style="margin-top:20px;"><strong>Recommendation:</strong> ${recommendation}</p>`;
    }
  } else {
    html += `<p><em>(BMI not calculated due to missing data.)</em></p>`;
  }

  summaryDiv.innerHTML = html;
}

/**
 * updateProgressBar():
 * Mengatur lebar bar
 */
function updateProgressBar() {
  const header = document.getElementById("header");
  const progressBar = document.getElementById("progress-bar");
  if (!progressBar) return;

  // Page 1 => hide header
  if (currentPage === 1) {
    header.style.display = "none";
    return;
  } else {
    header.style.display = "flex";
  }

  // totalPages => 2 + questions.length + 1
  const steps = totalPages - 1;
  const stepIndex = currentPage - 1;

  let percentage = Math.round((stepIndex / steps) * 100);
  if (percentage < 0) percentage = 0;
  if (percentage > 100) percentage = 100;

  progressBar.style.width = `${percentage}%`;
}
