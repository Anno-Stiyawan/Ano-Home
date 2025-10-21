// ======= CONFIG =======
const DEFAULTS = {
  qyaraLoginUrl: "https://contoh-login.qyara.net/login",
  routerosUrl: "http://192.168.88.1/",
  mikhmonUrl: "http://192.168.88.2/mikhmon/"
};
function loadConfig(){
  try{ const raw = localStorage.getItem('anno_pro_config');
    return raw ? {...DEFAULTS, ...JSON.parse(raw)} : {...DEFAULTS};
  }catch{ return {...DEFAULTS}; }
}
function saveConfig(cfg){ localStorage.setItem('anno_pro_config', JSON.stringify(cfg)); }
function byId(id){ return document.getElementById(id); }

// Theme toggle
const toggleMode = byId('toggleMode');
toggleMode?.addEventListener('click', ()=>{
  document.body.classList.toggle('light');
  toggleMode.textContent = document.body.classList.contains('light') ? 'Light' : 'Dark';
});

// Clock + greeting
function updateClock(){
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  byId('clock').textContent = `${hh}:${mm}`;
  const hari = now.toLocaleDateString('id-ID',{weekday:'long'});
  const tanggal = now.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'});
  byId('date').textContent = `${hari}, ${tanggal}`;
  const h = now.getHours();
  let greet = 'Selamat Malam';
  if (h>=4 && h<11) greet='Selamat Pagi';
  else if (h>=11 && h<15) greet='Selamat Siang';
  else if (h>=15 && h<18) greet='Selamat Sore';
  byId('hello').textContent = `${greet}, Ano Stiyawan`;
}
updateClock(); setInterval(updateClock, 30*1000);

// Weather (Open-Meteo + Nominatim)
async function loadWeather(){
  const elText = byId('w-text'), elTemp = byId('w-temp'), elPlace = byId('w-place');
  const map = {0:'Cerah',1:'Cerah Berawan',2:'Berawan',3:'Mendung',45:'Berkabut',48:'Berkabut',
    51:'Gerimis Ringan',53:'Gerimis',55:'Gerimis Lebat',56:'Gerimis Beku',57:'Gerimis Beku',
    61:'Hujan Ringan',63:'Hujan Sedang',65:'Hujan Lebat',66:'Hujan Beku Ringan',67:'Hujan Beku Lebat',
    71:'Salju Ringan',73:'Salju',75:'Salju Lebat',80:'Hujan Lokal Ringan',81:'Hujan Lokal',82:'Hujan Lokal Lebat',
    95:'Badai Petir',96:'Badai Petir + Hujan Es Ringan',99:'Badai Petir + Hujan Es Lebat'};
  const wt = c => map[c] || 'Cuaca';

  if(!navigator.geolocation){ elText.textContent='Geolokasi tidak didukung'; return; }
  try{
    const pos = await new Promise((res, rej)=>navigator.geolocation.getCurrentPosition(res, rej, {enableHighAccuracy:true, timeout:10000}));
    const {latitude, longitude} = pos.coords;
    const resp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`);
    const data = await resp.json();
    elText.textContent = wt(data.current.weather_code);
    elTemp.textContent = `${Math.round(data.current.temperature_2m)}°C`;
    try{
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`, {headers:{'Accept-Language':'id-ID'}});
      const j = await r.json();
      elPlace.textContent = j.address?.city || j.address?.town || j.address?.village || j.display_name?.split(',')[0] || '';
    }catch{}
  }catch{ elText.textContent='Lokasi ditolak/gagal'; }
}
loadWeather();

// Quick buttons
function renderQuickLinks(cfg){
  const box = byId('quickLinks'); box.innerHTML = '';
  const links = [
    {label:'Qyara Login', url: cfg.qyaraLoginUrl, primary:true},
    {label:'RouterOS', url: cfg.routerosUrl},
    {label:'Mikhmon', url: cfg.mikhmonUrl},
    {label:'Gmail', url:'https://mail.google.com/'},
    {label:'Drive', url:'https://drive.google.com/'},
    {label:'Maps', url:'https://maps.google.com/'},
  ];
  for(const l of links){
    const a = document.createElement('a');
    a.href = l.url; a.target = '_blank'; a.rel = 'noopener';
    a.className = l.primary ? '' : 'alt';
    a.textContent = l.label;
    box.appendChild(a);
  }
}
renderQuickLinks(loadConfig());

// Settings dialog
const dlg = document.getElementById('settings');
document.getElementById('openSettings')?.addEventListener('click', ()=>{
  const cfg = loadConfig();
  byId('cfg-qyara').value = cfg.qyaraLoginUrl;
  byId('cfg-routeros').value = cfg.routerosUrl;
  byId('cfg-mikhmon').value = cfg.mikhmonUrl;
  dlg.showModal();
});
document.getElementById('saveSettings')?.addEventListener('click', (e)=>{
  e.preventDefault();
  const cfg = {
    qyaraLoginUrl: byId('cfg-qyara').value || DEFAULTS.qyaraLoginUrl,
    routerosUrl: byId('cfg-routeros').value || DEFAULTS.routerosUrl,
    mikhmonUrl: byId('cfg-mikhmon').value || DEFAULTS.mikhmonUrl
  };
  saveConfig(cfg);
  renderQuickLinks(cfg);
  dlg.close();
});
