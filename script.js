const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

let score = 0;
let gameOver = false;

// Farben für Tetris-Steine
const COLORS = {
  I: 'blue',
  O: 'yellow',
  T: 'purple',
  L: 'orange',
  J: 'red',
  S: 'green',
  Z: 'black'
};

// Tetris-Formen
const SHAPES = {
  I: [[1,1,1,1]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1]],
  L: [[1,0,0],[1,1,1]],
  J: [[0,0,1],[1,1,1]],
  S: [[0,1,1],[1,1,0]],
  Z: [[1,1,0],[0,1,1]]
};

// Spielbrett initialisieren
let board = Array.from({length: ROWS}, () => Array(COLS).fill(''));

// Aktuelle Figur
let current = randomPiece();
current.x = Math.floor(COLS/2) - Math.floor(current.shape[0].length/2);
current.y = 0;

// Zufällige Figur
function randomPiece() {
  const types = Object.keys(SHAPES);
  const type = types[Math.floor(Math.random()*types.length)];
  return {type: type, shape: SHAPES[type], x: 0, y:0};
}

// Zeichnen
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Board zeichnen
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      if(board[r][c]){
        ctx.fillStyle = board[r][c];
        ctx.fillRect(c*BLOCK_SIZE,r*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(c*BLOCK_SIZE,r*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
      }
    }
  }

  // Aktuelle Figur zeichnen
  current.shape.forEach((row,i)=>{
    row.forEach((val,j)=>{
      if(val){
        ctx.fillStyle = COLORS[current.type];
        ctx.fillRect((current.x+j)*BLOCK_SIZE,(current.y+i)*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
        ctx.strokeStyle = 'white';
        ctx.strokeRect((current.x+j)*BLOCK_SIZE,(current.y+i)*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
      }
    });
  });
}

// Kollision prüfen
function collision(xOffset,yOffset,shape=current.shape) {
  for(let r=0;r<shape.length;r++){
    for(let c=0;c<shape[r].length;c++){
      if(shape[r][c]){
        let newX = current.x+c+xOffset;
        let newY = current.y+r+yOffset;
        if(newX<0 || newX>=COLS || newY>=ROWS) return true;
        if(board[newY][newX]) return true;
      }
    }
  }
  return false;
}

// Figur festsetzen
function merge() {
  current.shape.forEach((row,i)=>{
    row.forEach((val,j)=>{
      if(val){
        board[current.y+i][current.x+j] = COLORS[current.type];
      }
    });
  });
}

// Reihe löschen
function clearRows() {
  let lines = 0;
  for(let r=ROWS-1;r>=0;r--){
    if(board[r].every(cell=>cell!=='') ){
      board.splice(r,1);
      board.unshift(Array(COLS).fill(''));
      lines++;
      r++;
    }
  }
  score += lines*50;
  document.getElementById('score').innerText = `Punkte: ${score}`;
}

// Figur rotieren
function rotate() {
  let newShape = current.shape[0].map((_,i)=>current.shape.map(row=>row[i]).reverse());
  if(!collision(0,0,newShape)) current.shape = newShape;
}

// Figur fallen lassen
function drop() {
  if(!collision(0,1)){
    current.y++;
  } else {
    merge();
    clearRows();
    current = randomPiece();
    current.x = Math.floor(COLS/2) - Math.floor(current.shape[0].length/2);
    current.y = 0;
    if(collision(0,0)){
      alert(`Game Over! Punkte: ${score}`);
      gameOver = true;
    }
  }
}

// Steuerung
document.addEventListener('keydown', e=>{
  if(gameOver) return;
  if(e.key==='ArrowLeft' && !collision(-1,0)) current.x--;
  if(e.key==='ArrowRight' && !collision(1,0)) current.x++;
  if(e.key==='ArrowDown') drop();
  if(e.key==='ArrowUp') rotate();
  if(e.key===' ') {
    while(!collision(0,1)) current.y++;
    drop();
  }
});

// Spiel Loop
function update() {
  if(!gameOver){
    drop();
    draw();
    setTimeout(update,500);
  }
}

update();
