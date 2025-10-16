
// simple responsive calendar script (ES module)
const calendarEl = document.getElementById('calendar');
const monthYearEl = document.getElementById('month-year');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

// sample bookings to demonstrate layout
let bookings = {}; // format: 'YYYY-MM-DD': [{time:'10:00', name:'Ali'}]

function buildCalendar(month, year){
  calendarEl.innerHTML = '';
  monthYearEl.textContent = new Date(year, month).toLocaleString('ar-EG', {month:'long', year:'numeric'});
  // create day headers
  const weekDays = ['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'];
  const header = document.createElement('div');
  header.className = 'weekdays';
  weekDays.forEach(d=>{
    const el = document.createElement('div');
    el.className = 'weekday';
    el.textContent = d;
    header.appendChild(el);
  });
  calendarEl.appendChild(header);

  // first day index (Saturday-based)
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7; // convert Sun=0..Sat=6 to Sat=0..
  const daysInMonth = new Date(year, month+1, 0).getDate();

  // grid container
  const grid = document.createElement('div');
  grid.className = 'grid';
  // fill blanks
  for(let i=0;i<startDay;i++){
    const cell = document.createElement('div'); cell.className='day empty'; grid.appendChild(cell);
  }
  for(let d=1; d<=daysInMonth; d++){
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const cell = document.createElement('div');
    cell.className='day';
    const dateDiv = document.createElement('div'); dateDiv.className='date'; dateDiv.textContent = d;
    cell.appendChild(dateDiv);
    // slots example
    const slot = document.createElement('div');
    slot.className='slot available';
    slot.textContent = 'احجز';
    slot.setAttribute('role','button');
    slot.addEventListener('click', ()=> openBooking(dateStr));
    cell.appendChild(slot);
    // show booking if exists
    if(bookings[dateStr]){
      bookings[dateStr].forEach(b=>{
        const bdiv = document.createElement('div');
        bdiv.className='slot booked';
        bdiv.textContent = `${b.time} - ${b.name}`;
        cell.appendChild(bdiv);
      });
    }
    grid.appendChild(cell);
  }
  calendarEl.appendChild(grid);
}

function openBooking(dateStr){
  const name = prompt('الاسم للاحتفاظ بالحجز على '+dateStr+ ' (إترك فارغ للإلغاء)');
  if(!name) return;
  const time = prompt('الوقت (مثال: 10:00)');
  if(!time) return;
  bookings[dateStr] = bookings[dateStr] || [];
  bookings[dateStr].push({time, name});
  buildCalendar(currentMonth, currentYear);
}

// navigation
prevBtn.addEventListener('click', ()=>{ currentMonth--; if(currentMonth<0){ currentMonth=11; currentYear--; } buildCalendar(currentMonth,currentYear); });
nextBtn.addEventListener('click', ()=>{ currentMonth++; if(currentMonth>11){ currentMonth=0; currentYear++; } buildCalendar(currentMonth,currentYear); });

// responsive: touch swipe
let touchStartX = null;
calendarEl.addEventListener('touchstart', (e)=>{ touchStartX = e.changedTouches[0].screenX; }, {passive:true});
calendarEl.addEventListener('touchend', (e)=>{ if(touchStartX===null) return; let dx = e.changedTouches[0].screenX - touchStartX; if(Math.abs(dx)>50){ if(dx<0){ nextBtn.click(); } else { prevBtn.click(); } } touchStartX = null; }, {passive:true});

buildCalendar(currentMonth, currentYear);
