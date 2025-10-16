// لوحة تحكم الأدمن - شغالة 100%

// تسجيل الدخول
function login() {
  const pwd = document.getElementById('password').value;
  if (pwd === 'Zain1993') {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    generateAdminCalendar(currentYear, currentMonth);
  } else {
    alert('كلمة المرور خاطئة');
  }
}
window.login = login;

// التاريخ
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
const monthNames = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

// عرض اسم الشهر
function updateMonthLabel() {
  const label = document.getElementById('month-year');
  if (label) label.textContent = monthNames[currentMonth] + ' ' + currentYear;
}

// إنشاء التقويم
function generateAdminCalendar(year = currentYear, month = currentMonth) {
  updateMonthLabel();
  const calendar = document.getElementById('admin-calendar');
  calendar.innerHTML = '';
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNames = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

  let html = '<table><tr>';
  for (let d of dayNames) html += `<th>${d}</th>`;
  html += '</tr><tr>';

  for (let i = 0; i < firstDay; i++) html += '<td></td>';

  for (let d = 1; d <= daysInMonth; d++) {
    html += `<td>${d}</td>`;
    if ((d + firstDay) % 7 === 0) html += '</tr><tr>';
  }

  html += '</tr></table>';
  calendar.innerHTML = html;
}

// التنقل بين الأشهر
function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  generateAdminCalendar(currentYear, currentMonth);
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  generateAdminCalendar(currentYear, currentMonth);
}

window.prevMonth = prevMonth;
window.nextMonth = nextMonth;
