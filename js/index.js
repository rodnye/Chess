
let cellStyle = ["#ffbd61", "#333333"]; // color de cada casilla del tablero
let focusCellsColors = ["none", "#0000ff", "#ff0000"];
let piecesSrc = {
  "path": "img/standar",
  "p": "/peón.png",
  "r": "/torre.png",
  "k": "/rey.png",
  "q": "/dama.png",
  "n": "/caballo.png",
  "b": "/alfil.png"
}

// MOTOR DEL JUEGO
let chess = new Chess(); // nueva partida
let pieces = {}; // piezas en juego y su posición
let focusCellsList = []; // casillas activas y seleccionadas
let lastSelectedCell = null; // casilla seleccionada ppr el usuario

// EVENTO INICIALIZAR
function OnStart () {
  
  // elementos
  hitAreaE = document.getElementById("game-hit-area");
  boardE = document.getElementById("game-board");
  turnE = document.getElementById("show-turn");
  
  // dimenciones del tablero
  BOARD_WIDTH = boardE.clientWidth;
  BOARD_HEIGHT = boardE.clientHeight;
  
  // generar tablero
  let canvas = document.createElement("canvas");
  let board = chess.board();
  canvas.width = 50 * 8;
  canvas.height = 50 * 8;
  let ctx = canvas.getContext("2d");
  
  for (let y = 0; y < 8; y++) {
    let row = board[y];
    let rowE = document.createElement("div");
    rowE.setAttribute("class", "row");
    
    for (let x = 0; x < 8; x++) {
      // crear celda hitArea
      let celE = document.createElement("div");
      celE.dataset.x = x;
      celE.dataset.y = y;
      celE.dataset.notation = axisToNotation(x, y);
      celE.onclick = OnSelectCell;
      rowE.appendChild(celE);
      
      // crear pieza si hay en la celda
      let cel = row[x];
      if (cel) {
        let piece = document.createElement("div");
        let img = document.createElement("img");
        
        piece.setAttribute("class", "piece");
        piece.x = 12.5 * x;
        piece.y = 12.5 * y;
        renderPiece(piece);
        img.src = piecesSrc.path + piecesSrc[cel.type];
        
        if (cel.color == "b") img.style.filter = "brightness(30%)";
        
        piece.appendChild(img);
        boardE.appendChild(piece);
        pieces[celE.dataset.notation] = piece;
      }
      
      
      ctx.fillStyle = cellStyle[((x % 2) + (y % 2)) % 2];
      ctx.fillRect(x * 50, y * 50, 50, 50);
    }
    hitAreaE.appendChild(rowE);
  }
  
  boardE.style.background = "url(" + canvas.toDataURL() + ")";
  boardE.style.backgroundSize = "100% 100%";
  canvas = ctx = null;
  
}

// EVENTO AL SELECCIONAR UNA CASILLA
function OnSelectCell (event) {
  let cel = event.target;
  let celX = parseInt(cel.dataset.x);
  let celY = parseInt(cel.dataset.y);
  let celNotation = cel.dataset.notation;
  
  
  // si es una celda enfocada
  // MOVER
  if ((cel.dataset.focus||"none") != "none") {
    clearFocusCells();
    
    let lastCelNotation = lastSelectedCell.dataset.notation;
    let piece = pieces[lastCelNotation];
    let pieceTarget = pieces[celNotation];
    delete pieces[lastCelNotation]; // remover última posición
    pieces[celNotation] = piece; // asignar nueva posición
    
    // animación de movimiento
    movePieceAnimation.statics = {
      x: piece.x, 
      y: piece.y,
      vx: (12.5 * celX) - piece.x,
      vy: (12.5 * celY) - piece.y,
      piece: piece,
      pieceTarget: pieceTarget
    };
    movePieceAnimation.play();
    
    chess.move({from:lastCelNotation, to:celNotation});
  }
  
  // si no es una casilla enfocada, enfocar
  else {
    clearFocusCells();
    for (let notation of chess.moves({square: celNotation})) {
      let pos = notationToAxis(notation);
      let target = pieces[minifyNotation(notation)];
      setFocusCell(getCell(pos.x, pos.y), target? 2 : 1);
    }
  }
  
  lastSelectedCell = cel;
}


// renderizar pieza
function renderPiece (piece) {
  let style = piece.style;
  style.left = piece.x + "%";
  style.top = piece.y + "%";
}

// obtener casilla
function getCell (x, y) {
  return hitAreaE.children[y].children[x];
}

// activar casilla
function setFocusCell (cel, type) {
  cel.style.background = focusCellsColors[type];
  cel.dataset.focus = 
    type == 1 ? "movement" :
    type == 2 ? "capture" : 
    type == 3 ? "special" : "none";
  if (type) focusCellsList.push(cel);
}

// desactivar todas las casillas
function clearFocusCells () {
  for (let cel of focusCellsList) setFocusCell(cel, 0);
  focusCellsList = [];
}

// simplificar posicion de ajedrez
function minifyNotation (notation) {
  return notation.match(/(.{2})\+*$/g)[0];
}

// convertir posicion de ajedrez a xy
function notationToAxis (notation) {
  notation = minifyNotation(notation);
  let chars = "abcdefgh87654321";
  return {
    x: chars.indexOf(notation[0]),
    y: chars.indexOf(notation[1]) - 8
  };
}

// convertir xy a posicion de ajedrez
function axisToNotation (x, y) {
  let chars = "abcdefgh87654321";
  return chars.charAt(x) + chars.charAt(y + 8);
}