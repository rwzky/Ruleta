// app.js - versión simple con nombres fijos
console.log('Ruleta: script cargado');
const $ = (sel) => document.querySelector(sel);

const elWheel = $("#wheel");
const elWinner = $("#winner");
const elWinnerImg = $("#winnerImg");
const elList = $("#list");
const elCount = $("#count");
const elStatus = $("#status");

const btnSpin = $("#btnSpin");
const btnReset = $("#btnReset");

const NAMES_INIT = [
  'diki','dylan','keso','nousy','pepe','pipoplox','pingu','rwzky','shiro','sooya'
];

let names = [...NAMES_INIT];
let spinning = false;
let currentRotation = 0;

// Default colors for slices (can be customized per person later)
const COLORS = [
  '#ff8a80', '#ffcc80', '#fff59d', '#c8e6c9', '#80deea', '#b39ddb', '#ffab91', '#90caf9', '#f48fb1', '#c5e1a5'
];

// map name -> color (persistent while app runs)
const colorMap = {};
function ensureColorMap(){
  names.forEach((name, i) => {
    if (!colorMap[name]) colorMap[name] = COLORS[i % COLORS.length];
  });
}

const POINTER_ANGLE = 270; // top of the wheel

function setInitialRotation(){
  const n = names.length;
  if (!n) return;
  const segment = 360 / n;
  const center0 = segment * 0 + segment/2;
  // rotation so that names[0] center is at pointer
  const init = (POINTER_ANGLE - center0 + 360) % 360;
  currentRotation = init;
  elWheel.style.transition = 'transform 0.6s ease';
  elWheel.style.transform = `rotate(${currentRotation}deg)`;
}

function setStatus(msg){ elStatus.textContent = msg || ''; }

function renderList(){
  elList.innerHTML = '';
  names.forEach(n => { const li = document.createElement('li'); li.textContent = n; elList.appendChild(li); });
  elCount.textContent = String(names.length);
}

function renderWheelTags(){
  // clean previous tags and separators
  elWheel.querySelectorAll('.tag, .separator').forEach(t => t.remove());
  const n = names.length;
  if (n === 0) { elWheel.style.background = ''; return; }
  const radius = Math.min(130, elWheel.clientWidth/2 - 20);

  // ensure mapping name->color
  ensureColorMap();

  // Build conic-gradient from colorMap so each slice has its unique color
  const segment = 360 / n;
  const parts = [];
  for (let i=0;i<n;i++){
    const start = i * segment;
    const end = (i + 1) * segment;
    const color = colorMap[names[i]] || COLORS[i % COLORS.length];
    parts.push(`${color} ${start}deg ${end}deg`);
  }
  elWheel.style.background = `conic-gradient(${parts.join(',')})`;

  // Tags: place label near middle of slice (radial center)
  const radiusMid = Math.round(radius * 0.5);
  for (let i=0;i<n;i++){
    const angleCenter = (i + 0.5) * segment;
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.textContent = names[i];
    // rotate to slice center, move outward to middle, counter-rotate to keep text horizontal, then center the element
    tag.style.transform = `rotate(${angleCenter}deg) translate(${radiusMid}px) rotate(${-angleCenter}deg) translate(-50%,-50%)`;
    elWheel.appendChild(tag);
    // separator line overlay for crisp border
    const sep = document.createElement('div');
    sep.className = 'separator';
    const angle = i * segment;
    sep.style.transform = `rotate(${angle}deg)`;
    elWheel.appendChild(sep);
  }

  // ensure the wheel is initially aligned so names[0] is at the pointer
  // only set initial alignment when not spinning
  if (!spinning) setInitialRotation();
}

function pickWinnerIndex(n){ return Math.floor(Math.random()*n); }

function spin(){
  if (spinning) return;
  if (names.length === 0){ setStatus('No quedan nombres. Reinicia para volver a empezar.'); return; }
  setStatus('');
  spinning = true; btnSpin.disabled = true;

  const n = names.length;
  const winnerIndex = pickWinnerIndex(n);

  const segment = 360 / n;
  const centerAngle = winnerIndex * segment + segment/2;
  const extraTurns = 5 + Math.floor(Math.random()*3);
  // compute on-screen angle of the slice center considering current rotation
  const currentMod = ((currentRotation % 360) + 360) % 360;
  const onScreenCenter = (centerAngle + currentMod) % 360;
  const delta = (POINTER_ANGLE - onScreenCenter + 360) % 360;
  const target = extraTurns*360 + delta;
  currentRotation += target;

  elWheel.style.transition = 'transform 3.2s cubic-bezier(.2,.8,.2,1)';
  elWheel.style.transform = `rotate(${currentRotation}deg)`;

  window.setTimeout(()=>{
    const winner = names[winnerIndex];
    elWinner.textContent = winner;
    // Intentamos cargar imagen desde img/{name}.png, si no existe, se oculta
    elWinnerImg.src = `img/${winner}.jpg`;
    elWinnerImg.alt = winner;
    elWinnerImg.style.display = '';

    // eliminar al ganador
    names.splice(winnerIndex,1);
    renderList();
    renderWheelTags();

    spinning = false; btnSpin.disabled = false;
    if (names.length === 0) setStatus('Se agotaron los nombres. Pulsa Reiniciar.');
  }, 3300);
}

function resetAll(){
  names = [...NAMES_INIT];
  spinning = false; btnSpin.disabled = false; currentRotation = 0;
  elWheel.style.transition = 'transform 0.6s ease';
  elWheel.style.transform = `rotate(0deg)`;
  elWinner.textContent = '—';
  elWinnerImg.style.display = 'none';
  renderList(); renderWheelTags(); setStatus('Reiniciado.');
}

// Eventos
btnSpin.addEventListener('click', spin);
btnReset.addEventListener('click', resetAll);

// Inicio
renderList(); renderWheelTags();
