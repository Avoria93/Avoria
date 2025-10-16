const firebaseConfig = {"apiKey": "AIzaSyCMnrduDRpUjhFw5XxMdrR4uvHa14OrAnM", "authDomain": "avoriashalyh.firebaseapp.com", "projectId": "avoriashalyh", "storageBucket": "avoriashalyh.firebasestorage.app", "messagingSenderId": "77862184527", "appId": "1:77862184527:web:070b9514c322df959c6c3a", "measurementId": "G-RP38CK8YNT"};


import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth(); // 0-based
const monthNames = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const weekDays = ['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];

let unsubscribeSnapshot = null;

function monthDocId(year, month){
    const m = String(month+1).padStart(2,'0');
    return `${year}-${m}`;
}

export function generateCalendar(year, month){
    const calendarDiv = document.getElementById('calendar');
    calendarDiv.innerHTML = '';
    const monthYear = document.getElementById('month-year');
    monthYear.innerText = monthNames[month] + ' ' + year;
    const lastDay = new Date(year, month+1, 0).getDate();

    for(let i=1; i<=lastDay; i++){
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        const dayName = weekDays[new Date(year, month, i).getDay()];
        const dateDiv = document.createElement('div');
        dateDiv.className = 'date';
        dateDiv.innerText = dayName + ' ' + i;
        dayDiv.appendChild(dateDiv);
        ['صباحي','مسائي','مبيت'].forEach(slotName=>{
            const slotDiv=document.createElement('div');
            slotDiv.className='slot available';
            slotDiv.setAttribute('data-day', i);
            slotDiv.setAttribute('data-slot', slotName);
            slotDiv.innerText=slotName;
            dayDiv.appendChild(slotDiv);
        });
        calendarDiv.appendChild(dayDiv);
    }

    // attach Firestore listener for this month
    if(unsubscribeSnapshot) unsubscribeSnapshot();
    const docRef = doc(db, 'bookings', monthDocId(year,month));
    unsubscribeSnapshot = onSnapshot(docRef, (docSnap)=>{
        // reset all to available
        document.querySelectorAll('#calendar .slot').forEach(el=>{
            el.classList.remove('booked');
            el.classList.add('available');
        });
        if(docSnap.exists()){
            const data = docSnap.data();
            // data format: { "1": { "صباحي": true, "مسائي": true, "مبيت": false }, ... }
            for(const [day, slots] of Object.entries(data || {})){
                for(const [slotName, val] of Object.entries(slots || {})){
                    if(val){
                        const sel = `#calendar .slot[data-day="${day}"][data-slot="${slotName}"]`;
                        const el = document.querySelector(sel);
                        if(el){
                            el.classList.remove('available');
                            el.classList.add('booked');
                        }
                    }
                }
            }
        }
    });
}

function prevMonth(){
    if(currentMonth === 0){ currentMonth = 11; currentYear -=1; }
    else currentMonth -=1;
    generateCalendar(currentYear, currentMonth);
}
function nextMonth(){
    if(currentMonth === 11){ currentMonth = 0; currentYear +=1; }
    else currentMonth +=1;
    generateCalendar(currentYear, currentMonth);
}

// expose controls
window.prevMonth = prevMonth;
window.nextMonth = nextMonth;
window.generateCalendar = generateCalendar;

// initialize
document.addEventListener('DOMContentLoaded', ()=>{
    generateCalendar(currentYear, currentMonth);
});
