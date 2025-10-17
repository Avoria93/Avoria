
// script.js - optimized visitor page
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCMnrduDRpUjhFw5XxMdrR4uvHa14OrAnM",
  authDomain: "avoriashalyh.firebaseapp.com",
  projectId: "avoriashalyh",
  storageBucket: "avoriashalyh.firebasestorage.app",
  messagingSenderId: "77862184527",
  appId: "1:77862184527:web:070b9514c322df959c6c3a",
  measurementId: "G-RP38CK8YNT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const monthNames = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const weekDays = ['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

const calendarContainer = document.getElementById('calendar');
const monthLabel = document.getElementById('month-label');

function renderCalendar(year, month, data) {
  calendarContainer.innerHTML = '';
  monthLabel.textContent = `${monthNames[month]} ${year}`;

  let firstDay = new Date(year, month, 1).getDay();
  let daysInMonth = new Date(year, month + 1, 0).getDate();

  // تعبئة التقويم
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.classList.add('empty');
    calendarContainer.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.classList.add('day-cell');

    const dateKey = `${year}-${month + 1}-${day}`;
    const isBooked = data && data[dateKey];

    cell.textContent = day;
    if (isBooked) cell.classList.add('booked');

    calendarContainer.appendChild(cell);
  }
}

function loadMonth(year, month) {
  const docRef = doc(db, "calendar", `${year}-${month + 1}`);
  onSnapshot(docRef, (snapshot) => {
    const data = snapshot.exists() ? snapshot.data() : {};
    renderCalendar(year, month, data);
  });
}

// التنقل بين الأشهر
document.getElementById('prev-month').addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  loadMonth(currentYear, currentMonth);
});

document.getElementById('next-month').addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  loadMonth(currentYear, currentMonth);
});

// تحميل الشهر الحالي بالبداية
loadMonth(currentYear, currentMonth);
