
// simple admin toggler
document.addEventListener('DOMContentLoaded', ()=>{
  const pw = prompt('أدخل كلمة المرور للدخول إلى لوحة الإدارة (demo):');
  if(pw==='admin'){
    // show admin area if exists
    const admin = document.getElementById('adminArea') || document.getElementById('admin-area') || document.getElementById('admin');
    if(admin) admin.style.display = 'block';
  }
});
