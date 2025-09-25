// Sudoku Logik & UI ausgelagert aus index.html
const boardEl = document.getElementById('board');
const diffSel = document.getElementById('difficulty');
const newBtn = document.getElementById('new');
const pencilBtn = document.getElementById('pencil');
const eraseBtn = document.getElementById('erase');
const hintBtn = document.getElementById('hint');
const mistakesEl = document.getElementById('mistakes');
const timerEl = document.getElementById('timer');

let cells = [];
let given = new Array(81).fill(false);
let grid = new Array(81).fill(0);
let solution = new Array(81).fill(0);
let notes = Array.from({length:81},()=> new Set());
let selected = -1;
let pencil = false;
let mistakes = 0;
let timerId = null, startTime = null;

const R = idx => Math.floor(idx/9);
const C = idx => idx%9;
const B = (r,c) => Math.floor(r/3)*3 + Math.floor(c/3);
function peersOf(i){
  const r = R(i), c = C(i);
  const s = new Set();
  for(let k=0;k<9;k++){ s.add(r*9+k); s.add(k*9+c); }
  const br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
  for(let rr=br;rr<br+3;rr++) for(let cc=bc;cc<bc+3;cc++) s.add(rr*9+cc);
  s.delete(i); return [...s];
}

function buildBoard(){
  boardEl.innerHTML=''; cells = [];
  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      const i = r*9+c;
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.setAttribute('role','gridcell');
      cell.setAttribute('aria-label',`Zelle ${r+1},${c+1}`);
      cell.addEventListener('click', ()=> select(i));
      cells.push(cell); boardEl.appendChild(cell);
    }
  }
}

function render(){
  cells.forEach((cell,i)=>{
    cell.classList.toggle('selected', i===selected);
    cell.classList.toggle('given', given[i]);
    cell.classList.remove('conflict','same');
    cell.innerHTML='';
    const v = grid[i];
    if(v){ cell.textContent = v; }
    else if(notes[i].size){
      const wrap = document.createElement('div'); wrap.className='notes';
      for(let n=1;n<=9;n++){
        const s = document.createElement('div'); s.className='note'; s.textContent = notes[i].has(n)? n:''; wrap.appendChild(s);
      }
      cell.appendChild(wrap);
    }
  });
  if(selected!==-1 && grid[selected]){
    const val = grid[selected];
    cells.forEach((cell,i)=>{ if(grid[i]===val) cell.classList.add('same'); });
  }
  updateConflicts();
}

function updateConflicts(){
  cells.forEach(c=>c.classList.remove('conflict'));
  for(let i=0;i<81;i++){
    if(!grid[i]) continue;
    for(const j of peersOf(i)){
      if(grid[j]===grid[i]){ cells[i].classList.add('conflict'); cells[j].classList.add('conflict'); }
    }
  }
}

function select(i){ selected = i; render(); }

function inputNumber(n){
  if(selected===-1 || given[selected]) return;
  if(pencil){
    if(notes[selected].has(n)) notes[selected].delete(n); else notes[selected].add(n);
  } else {
    if(grid[selected]===n){ grid[selected]=0; }
    else { grid[selected]=n; notes[selected].clear(); }
    if(solution[selected] && n!==0 && n!==solution[selected]) mistakes++;
    mistakesEl.textContent = mistakes;
    for(const j of peersOf(selected)) notes[j].delete(n);
  }
  render();
  checkWin();
}

function erase(){
  if(selected===-1 || given[selected]) return;
  grid[selected]=0; notes[selected].clear(); render();
}

function togglePencil(){ pencil=!pencil; pencilBtn.classList.toggle('secondary', pencil); }

function keyHandler(e){
  if(e.key==='p' || e.key==='P'){ togglePencil(); return; }
  if(selected===-1) return;
  if(e.key>='1'&&e.key<='9'){ inputNumber(parseInt(e.key,10)); }
  else if(e.key==='Backspace' || e.key==='Delete'){ erase(); }
  else if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){
    e.preventDefault();
    let r=R(selected), c=C(selected);
    if(e.key==='ArrowUp') r=(r+8)%9; if(e.key==='ArrowDown') r=(r+1)%9; if(e.key==='ArrowLeft') c=(c+8)%9; if(e.key==='ArrowRight') c=(c+1)%9;
    select(r*9+c);
  }
}
document.addEventListener('keydown', keyHandler);
[...document.querySelectorAll('.num')].forEach(b=> b.addEventListener('click', ()=> inputNumber(parseInt(b.dataset.n,10))));
eraseBtn.addEventListener('click', erase);
pencilBtn.addEventListener('click', togglePencil);

function startTimer(){
  stopTimer(); startTime = Date.now();
  timerId = setInterval(()=>{
    const s = Math.floor((Date.now()-startTime)/1000);
    const m = String(Math.floor(s/60)).padStart(2,'0');
    const r = String(s%60).padStart(2,'0');
    timerEl.textContent = `${m}:${r}`;
  }, 1000);
}
function stopTimer(){ if(timerId){ clearInterval(timerId); timerId=null; } }

function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }

function findEmpty(g){ for(let i=0;i<81;i++) if(!g[i]) return i; return -1; }
function isValid(g, pos, val){
  const r=R(pos), c=C(pos);
  for(let k=0;k<9;k++){ if(g[r*9+k]===val) return false; if(g[k*9+c]===val) return false; }
  const br=Math.floor(r/3)*3, bc=Math.floor(c/3)*3;
  for(let rr=br; rr<br+3; rr++) for(let cc=bc; cc<bc+3; cc++) if(g[rr*9+cc]===val) return false;
  return true;
}

function solve(g){
  const i = findEmpty(g); if(i===-1) return true;
  const nums = shuffle([1,2,3,4,5,6,7,8,9]);
  for(const v of nums){ if(isValid(g,i,v)){ g[i]=v; if(solve(g)) return true; g[i]=0; } }
  return false;
}

function countSolutions(g, limit=2){
  const i = findEmpty(g); if(i===-1) return 1;
  let cnt=0; const nums=[1,2,3,4,5,6,7,8,9];
  for(const v of nums){ if(isValid(g,i,v)){ g[i]=v; cnt += countSolutions(g, limit); if(cnt>=limit) { g[i]=0; return cnt; } g[i]=0; } }
  return cnt;
}

function generateFull(){
  const g = new Array(81).fill(0);
  for(let b=0;b<3;b++){
    const nums = shuffle([1,2,3,4,5,6,7,8,9]);
    for(let r=0;r<3;r++) for(let c=0;c<3;c++) g[(b*3+r)*9 + (b*3+c)] = nums[r*3+c];
  }
  solve(g); return g;
}

function digHoles(full, difficulty){
  const targets = { easy: 40, medium: 32, hard: 26, expert: 22 };
  const clues = targets[difficulty] ?? 32;
  const puzzle = full.slice();
  const positions = shuffle([...Array(81).keys()]);
  let removed = 0; const maxRemove = 81 - clues;
  for(const i of positions){
    if(removed>=maxRemove) break; const backup = puzzle[i]; puzzle[i]=0;
    const tmp = puzzle.slice();
    if(countSolutions(tmp,2)===1){ removed++; } else { puzzle[i]=backup; }
  }
  return puzzle;
}

function newPuzzle(){
  const full = generateFull();
  solution = full.slice();
  const puzzle = digHoles(full, diffSel.value);
  grid = puzzle.slice();
  given = grid.map(v=> v!==0);
  notes = Array.from({length:81},()=> new Set());
  mistakes = 0; mistakesEl.textContent = '0';
  selected = grid.findIndex(v=> v===0); if(selected===-1) selected=0;
  render(); startTimer();
}

function hint(){
  const empties = grid.map((v,i)=> v===0? i : -1).filter(i=> i!==-1);
  if(!empties.length) return;
  const i = empties[Math.floor(Math.random()*empties.length)];
  grid[i] = solution[i]; given[i]=false;
  notes[i].clear(); select(i); render(); checkWin();
}

function checkWin(){
  if(grid.every((v,i)=> v===solution[i])){
    stopTimer();
    cells.forEach(c=> c.style.background = 'color-mix(in oklab, var(--valid) 18%, transparent)');
    setTimeout(()=> alert('🎉 Gelöst! Stark gemacht.'), 10);
  }
}

newBtn.addEventListener('click', newPuzzle);
hintBtn.addEventListener('click', hint);

buildBoard(); newPuzzle();
