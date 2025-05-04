let currentPage = 1;
const totalPages = 5;

window.addEventListener("DOMContentLoaded", () => {
  // Halaman 1 aktif
  document.getElementById("page-1").classList.add("active");

  // Set up click event untuk setiap opsi
  const allOptions = document.querySelectorAll(".option-item");
  allOptions.forEach((item) => {
    item.addEventListener("click", () => handleSelect(item));
  });

  // Awal: update progress bar
  updateProgressBar();
});

/**
 * handleSelect(item)
 * - Check radio di item tsb
 * - Uncheck radio lain se-group
 * - .selected => border & lingkaran hijau
 */
function handleSelect(item) {
  const radio = item.querySelector('input[type="radio"]');
  if (!radio) return;

  // Unselect group
  const sameGroupItems = document.querySelectorAll(
    `[data-group="${item.getAttribute("data-group")}"]`
  );
  sameGroupItems.forEach((i) => {
    i.classList.remove("selected");
    const r = i.querySelector('input[type="radio"]');
    if (r) r.checked = false;
  });

  // Check radio ini & tandai .selected
  radio.checked = true;
  item.classList.add("selected");
}

/** nextPage() dengan validasi minimal 1 pilihan di page 3 */
function nextPage() {
  if (currentPage === 2) {
    // tidak ada validasi
  } else if (currentPage === 3) {
    const selectedGoal = document.querySelector('input[name="goal"]:checked');
    if (!selectedGoal) {
      alert("Please choose your primary goal first!");
      return;
    }
  }

  // Sembunyikan page sekarang
  document.getElementById(`page-${currentPage}`).classList.remove("active");

  currentPage++;
  if (currentPage > totalPages) currentPage = totalPages;

  document.getElementById(`page-${currentPage}`).classList.add("active");

  // Update progress bar
  updateProgressBar();
}

/** submitLastPage(): validasi page4 => butuh 1 di group idealBody */
function submitLastPage() {
  const selectedBody = document.querySelector(
    'input[name="idealBody"]:checked'
  );
  if (!selectedBody) {
    alert("Please choose your ideal body first!");
    return;
  }
  alert("Quiz Selesai!");
}

/** previousPage(): kembali satu halaman */
function previousPage() {
  if (currentPage <= 1) return;

  document.getElementById(`page-${currentPage}`).classList.remove("active");
  currentPage--;
  document.getElementById(`page-${currentPage}`).classList.add("active");

  updateProgressBar();
}

/** updateProgressBar: atur lebar bar sesuai halaman */
function updateProgressBar() {
  const header = document.getElementById("header");
  const progressBar = document.getElementById("progress-bar");
  if (!progressBar) return;

  if (currentPage === 1) {
    header.style.display = "none";
  } else {
    header.style.display = "flex";
    const stepCount = totalPages - 2; // kita hitung dari halaman 2 sampai 4
    const progressIndex = currentPage - 2; // halaman 2 = index 0
    const percentage = Math.round((progressIndex / stepCount) * 100);
    progressBar.style.width = `${percentage}%`;
  }
}
