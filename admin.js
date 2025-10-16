// admin.js

const firebaseConfig = {"apiKey": "AIzaSyCMnrduDRpUjhFw5XxMdrR4u...7:web:070b9514c322df959c6c3a", "measurementId": "G-RP38CK8YNT"};

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const monthNames = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const weekDays = ['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];

let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth(); // 0-based

let unsubscribeSnapshot = null;

function monthDocId(year, month){
    const m = String(month+1).padStart(2,'0');
    return `${year}-${m}`;
}

function login(){
    const pwd = document.getElementById('password').value;
    if(pwd === 'Zain1993'){
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        generateAdminCalendar(currentYear, currentMonth);
    } else {
        alert('كلمة المرور خاطئة');
    }
}

async function ensureMonthDoc(year, month){
    const id = monthDocId(year, month);
    const docRef = doc(db, 'bookings', id);
    const snap = await getDoc(docRef);
    if(!snap.exists()){
        const lastDay = new Date(year, month+1, 0).getDate();
        const data = { };
        for(let i=1;i<=lastDay;i++){
            data[i.toString()] = { 'صباحي': false, 'مسائي': false, 'مبيت': false };
        }
        await setDoc(docRef, data);
    }
}

export function generateAdminCalendar(year, month){
    const adminDiv = document.getElementById('admin-calendar');
    adminDiv.innerHTML = '';

    // show month-year header
    const monthYear = document.getElementById('month-year');
    if(monthYear) monthYear.innerText = monthNames[month] + ' ' + year;

    const lastDay = new Date(year, month+1, 0).getDate();

    for(let i=1;i<=lastDay;i++){
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        const dayName = weekDays[new Date(year, month, i).getDay()];
        const dateDiv = document.createElement('div');
        dateDiv.className = 'date';
        dateDiv.innerText = dayName + ' ' + i;
        dayDiv.appendChild(dateDiv);

        ['صباحي','مسائي','مبيت'].forEach(slotName=>{
            const slotDiv = document.createElement('div');
            slotDiv.className = 'slot available';
            slotDiv.setAttribute('data-day', i);
            slotDiv.setAttribute('data-slot', slotName);
            slotDiv.innerText = slotName;
            slotDiv.onclick = async ()=>{
                // toggle booked state in firestore
                const day = slotDiv.getAttribute('data-day');
                const slot = slotDiv.getAttribute('data-slot');
                const id = monthDocId(year, month);
                const docRef = doc(db, 'bookings', id);
                const snap = await getDoc(docRef);
                if(!snap.exists()){
                    await ensureMonthDoc(year, month);
                }
                const data = snap.exists() ? snap.data() : {};
                const currentVal = (data && data[day] && data[day][slot]) ? true : false;
                // update only the specific field
                const updateObj = {};
                updateObj[`${day}.${slot}`] = !currentVal;
                await updateDoc(docRef, updateObj).catch(async (e)=>{
                    // if update fails because doc didn't exist, create then update
                    await ensureMonthDoc(year, month);
                    await updateDoc(docRef, updateObj);
                });
                // UI will reflect via onSnapshot listener
            };
            dayDiv.appendChild(slotDiv);
        });

        adminDiv.appendChild(dayDiv);
    }

    // set up realtime listener for this month
    if(unsubscribeSnapshot) unsubscribeSnapshot();
    const docRef = doc(db, 'bookings', monthDocId(year,month));
    unsubscribeSnapshot = onSnapshot(docRef, (docSnap)=>{
        // reset all to available first
        document.querySelectorAll('#admin-calendar .slot').forEach(el=>{
            el.classList.remove('booked');
            el.classList.add('available');
        });
        if(docSnap.exists()){
            const data = docSnap.data();
            for(const [day, slots] of Object.entries(data || {})){
                for(const [slotName, val] of Object.entries(slots || {})){
                    if(val){
                        const sel = `#admin-calendar .slot[data-day="${day}"][data-slot="${slotName}"]`;
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

// navigation
function prevMonth(){
    if(currentMonth === 0){ currentMonth = 11; currentYear -=1; }
    else currentMonth -=1;
    generateAdminCalendar(currentYear, currentMonth);
}

function nextMonth(){
    if(currentMonth === 11){ currentMonth = 0; currentYear +=1; }
    else currentMonth +=1;
    generateAdminCalendar(currentYear, currentMonth);
}

// expose to window for button onclicks
window.prevMonth = prevMonth;
window.nextMonth = nextMonth;
window.login = login;
window.generateAdminCalendar = generateAdminCalendar;

// optional: if you want auto-show current month before login remove this block.
// document.addEventListener('DOMContentLoaded', ()=>{
//     generateAdminCalendar(currentYear, currentMonth);
// });
