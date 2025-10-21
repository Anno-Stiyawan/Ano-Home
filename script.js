// Quick background preview without editing CSS file (not persistent)
const bgPicker = document.getElementById('bgPicker');
const resetBg = document.getElementById('resetBg');

function setBgFromObjectURL(url){
  document.documentElement.style.setProperty('--bg-image', `url('${url}')`);
}
bgPicker?.addEventListener('change', (e)=>{
  const file = e.target.files?.[0];
  if(!file) return;
  const url = URL.createObjectURL(file);
  setBgFromObjectURL(url);
});

resetBg?.addEventListener('click', ()=>{
  document.documentElement.style.removeProperty('--bg-image');
});

// Allow changing title text by clicking the big logo
document.querySelector('.logo')?.addEventListener('click', ()=>{
  const current = document.querySelector('.logo').textContent.trim();
  const name = prompt('Ganti nama utama:', current || 'ANNO STIYAWAN');
  if(name){
    document.querySelector('.logo').textContent = name;
    document.querySelector('.brand').textContent = name;
  }
});
