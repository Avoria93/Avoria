const firebaseConfig = {"apiKey": "AIzaSyCMnrduDRpUjhFw5XxMdrR4uvHa14OrAnM", "authDomain": "avoriashalyh.firebaseapp.com", "projectId": "avoriashalyh", "storageBucket": "avoriashalyh.firebasestorage.app", "messagingSenderId": "77862184527", "appId": "1:77862184527:web:070b9514c322df959c6c3a", "measurementId": "G-RP38CK8YNT"};


import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const weekDays = ['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];

function monthDocId(year, month){
    const m = String(month+1).padStart(2,'0');
    return `${year}-${m}`;
}

function login(){
    const pwd = document.getElementById('password').value;
    if(pwd === 'Zain1993'){
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        generateAdminCalendar();
    } else { alert('كلمة المرور خاطئة'); }
}

async function ensureMonthDoc(year, month){
    const id = monthDocId(year, month);
    const docRef = doc(db, 'bookings', id);
    const snap = await getDoc(docRef);
    if(!snap.exists()){
        // create empty structure with days
        const lastDay = new Date(year, month+1, 0).getDate();
        const data = { };
        for(let i=1;i<=lastDay;i++){
            data[i.toString()] = { 'صباحي': false, 'مسائي': false, 'مبيت': false };
        }
        await setDoc(docRef, data);
    }
}

function generateAdminCalendar(){
    const adminDiv = document.getElementById('admin-calendar');
    adminDiv.innerHTML='';
    const currentDate = new Date();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
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
            const slotDiv=document.createElement('div');
            slotDiv.className='slot available';
            slotDiv.setAttribute('data-day', i);
            slotDiv.setAttribute('data-slot', slotName);
            slotDiv.innerText=slotName;
            slotDiv.onclick = async ()=>{
                const day = slotDiv.getAttribute('data-day');
                const slot = slotDiv.getAttribute('data-slot');
                const id = monthDocId(year, month);
                const docRef = doc(db, 'bookings', id);
                // toggle locally first
                const willBeBooked = !slotDiv.classList.contains('booked');
                // update firestore: need to update nested field
                const fieldPath = `${day}.${slot}`;
                const obj = {};
                obj[fieldPath] = willBeBooked;
                try{ await updateDoc(docRef, obj); }
                catch(e){
                    // if doc doesn't exist, create with full structure
                    await ensureMonthDoc(year, month);
                    await updateDoc(docRef, obj);
                }
                // UI will update via onSnapshot listener below
            };
            dayDiv.appendChild(slotDiv);
        });
        adminDiv.appendChild(dayDiv);
    }

    // listen to changes for this month
    const id = monthDocId(year,month);
    const docRef = doc(db, 'bookings', id);
    onSnapshot(docRef, (docSnap)=>{
        if(!docSnap.exists()) return;
        const data = docSnap.data();
        for(const [day, slots] of Object.entries(data || {})){
            for(const [slotName, val] of Object.entries(slots || {})){
                const sel = `#admin-calendar .slot[data-day=\"${day}\"][data-slot=\"${slotName}\"]`;
                const el = document.querySelector(sel);
                if(el){
                    if(val){
                        el.classList.remove('available');
                        el.classList.add('booked');
                    } else {
                        el.classList.remove('booked');
                        el.classList.add('available');
                    }
                }
            }
        }
    });
}

window.login = login;
