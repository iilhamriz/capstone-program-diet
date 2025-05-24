// Halaman:
// 1 => Pilih Gender
// 2 => Intro
// 3..(2+questions.length) => Pertanyaan ke-1 s/d ke-n
// (2+questions.length+1) => Summary

let currentPage = 1; // Mulai di page 1
let currentQuestionIndex = 0; // Index pertanyaan (0-based) di array questions
let questions = []; // Akan diisi dari questions.json
let totalPages = 0; // total = 2 + questions.length + 1 (summary)

let userData = {
  gender: "",
};

window.addEventListener("DOMContentLoaded", () => {
  // Tampilkan page-1
  document.getElementById("page-1").classList.add("active");

  // Load data pertanyaan dari JSON
  fetch("questions.json")
    .then((res) => res.json())
    .then((data) => {
      questions = data;
      totalPages = 2 + questions.length + 1; // 2 page statis + n pertanyaan + summary
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
 * Handle transisi dari page 1 => 2 => question pages => summary
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

  // 2) Page 2 => Question Page (mulai pertanyaan)
  if (currentPage === 2) {
    document.getElementById("page-2").classList.remove("active");
    document.getElementById("page-2").style.display = "none";

    // Jika tidak ada pertanyaan => langsung summary
    if (questions.length === 0) {
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

  // 3) Jika sedang di question-page (3..(totalPages-1))
  if (currentPage > 2 && currentPage < totalPages) {
    // Validasi & simpan jawaban
    if (!validateAndSaveAnswer()) {
      return; // kalau invalid, stop
    }

    // Maju ke pertanyaan berikutnya
    currentQuestionIndex++;
    currentPage++; // agar progress bar naik

    // Apakah masih ada pertanyaan berikutnya?
    if (currentQuestionIndex < questions.length) {
      renderQuestion(currentQuestionIndex);
    } else {
      // Pertanyaan habis => summary
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
  // Page 1 => tidak bisa mundur lagi
  if (currentPage <= 1) return;

  // Kalau sedang di summary page
  if (currentPage === totalPages) {
    document.getElementById("summary-page").style.display = "none";
    // Mundur 1 page
    currentPage--;
    // Index pertanyaan ke (questions.length-1)
    currentQuestionIndex = questions.length - 1;
    document.getElementById("question-page").style.display = "block";
    renderQuestion(currentQuestionIndex);
    updateProgressBar();
    return;
  }

  // Kalau di halaman question
  if (currentPage > 2 && currentPage < totalPages) {
    // Mundur satu pertanyaan
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

  // Kalau lagi di page-2 => balik ke page-1
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
 * Tampilkan pertanyaan ke-index di #question-container
 * + tambahkan class "input-type" jika type = "input" (untuk styling)
 */
function renderQuestion(index) {
  const questionData = questions[index];
  const container = document.getElementById("question-container");
  const pageEl = document.getElementById("question-page");

  // Bersihkan container
  container.innerHTML = "";
  // Pastikan class "input-type" direset dulu
  pageEl.classList.remove("input-type");

  // Judul pertanyaan
  const titleEl = document.createElement("h2");
  titleEl.textContent = questionData.title;
  container.appendChild(titleEl);

  // Data jawaban yang mungkin sudah ada
  const savedAnswer = userData[questionData.name];

  // Cek type
  if (questionData.type === "multipleChoice") {
    // Buat wrapper
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

      // Event klik => pilih option ini
      optionItem.addEventListener("click", () => {
        // Unselect semua item di group
        const allItems = optionList.querySelectorAll(".option-item");
        allItems.forEach((i) => {
          i.classList.remove("selected");
          const inp = i.querySelector("input[type=radio]");
          if (inp) inp.checked = false;
        });

        // Select yang diklik
        optionItem.classList.add("selected");
        radioInput.checked = true;
      });

      // Jika ada jawaban tersimpan => tandai
      if (savedAnswer && savedAnswer === opt.value) {
        radioInput.checked = true;
        optionItem.classList.add("selected");
      }

      // Gabungkan
      optionItem.appendChild(radioInput);
      optionItem.appendChild(customRadio);
      optionItem.appendChild(labelSpan);
      optionList.appendChild(optionItem);
    });

    container.appendChild(optionList);
  } else if (questionData.type === "input") {
    // Tambahkan class .input-type agar stylingnya aktif
    pageEl.classList.add("input-type");

    // (Opsional) buat paragraf penjelas kalau mau
    // const pEl = document.createElement("p");
    // pEl.textContent = "Silakan masukkan data Anda di bawah:";
    // container.appendChild(pEl);

    // Bikin input
    const inputEl = document.createElement("input");
    inputEl.type = "number";
    inputEl.id = "question-input";
    inputEl.placeholder = questionData.placeholder || "";
    inputEl.style.padding = "8px";
    inputEl.style.fontSize = "16px";

    // Jika ada jawaban tersimpan, isi ke input
    if (savedAnswer) {
      inputEl.value = savedAnswer;
    }

    container.appendChild(inputEl);
  }
}

/**
 * validateAndSaveAnswer():
 * Periksa jawaban user & simpan ke userData
 */
function validateAndSaveAnswer() {
  const questionData = questions[currentQuestionIndex];
  const name = questionData.name;

  if (questionData.type === "multipleChoice") {
    // Cari radio yang dipilih
    const checkedRadio = document.querySelector(
      `input[name="${name}"]:checked`
    );
    if (!checkedRadio) {
      alert("Please choose an option first!");
      return false;
    }
    userData[name] = checkedRadio.value;
    return true;
  } else if (questionData.type === "input") {
    const inputEl = document.getElementById("question-input");
    if (!inputEl.value || Number(inputEl.value) <= 0) {
      alert("Please enter a valid number!");
      return false;
    }
    userData[name] = inputEl.value;
    return true;
  }

  return true;
}

/**
 * showSummary():
 * Tampilkan ringkasan jawaban di #summary
 */
function showSummary() {
  const summaryDiv = document.getElementById("summary");

  // gender dari page-1
  let html = `<p><strong>Gender:</strong> ${userData.gender}</p>`;

  // Tampilkan jawaban lain
  if (userData.goal) {
    html += `<p><strong>Primary Goal:</strong> ${userData.goal}</p>`;
  }
  if (userData.idealBody) {
    html += `<p><strong>Ideal Body:</strong> ${userData.idealBody}</p>`;
  }
  if (userData.weight) {
    html += `<p><strong>Weight:</strong> ${userData.weight} kg</p>`;
  }

  summaryDiv.innerHTML = html;
}

/**
 * updateProgressBar():
 * Menentukan lebar bar berdasarkan currentPage
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

  // totalPages = 2 + questions.length + 1
  // page ke-2 .. totalPages => kita bagi range
  const steps = totalPages - 1; // misal: 6 - 1 = 5
  const stepIndex = currentPage - 1; // misal: page=2 => stepIndex=1

  let percentage = Math.round((stepIndex / steps) * 100);
  if (percentage < 0) percentage = 0;
  if (percentage > 100) percentage = 100;

  progressBar.style.width = `${percentage}%`;
}
