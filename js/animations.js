// ANIMACIONES

// Rotar tablero
const rotateBoardAnimation = new Animate({
  duration: 500,
  timing: Animate.LINEAR,
  draw: function (n) {
    for (let notation in pieces) {
      let piece = pieces[notation];
      piece.style.transform = "rotate(" + (180 * n)  + "deg)";
    }
    boardE.style.transform = "rotate(" + (180 * n)  + "deg)";
  }
});


// Mover pieza
const movePieceAnimation = new Animate({
  duration: 500,
  timing: Animate.QUAD,
  erase: "out",
  draw: function (n, st) {
    let piece = st.piece;
    let pieceTarget = st.pieceTarget;
        
    piece.x = st.x + (st.vx * n);
    piece.y = st.y + (st.vy * n);
    if (pieceTarget) {
      pieceTarget.style.filter = "opacity(" + (1 - n) + ")";
      pieceTarget.style.transform = 
        "scale(" + (1 - n) + ") " +
        "rotate(" + (360 * n) + "deg)";
    }
    renderPiece(piece);
  },
});
movePieceAnimation.on("end", function () {
  let pieceTarget = movePieceAnimation.statics.pieceTarget;
  if (pieceTarget) {
    pieceTarget.remove();
    pieceTarget = null;
  };
      
  setTimeout(function(){
    if (chess.turn() == "b") {
      // rotar tablero hacia las negras
      rotateBoardAnimation.timing = function (n) {
        return 1 - Animate.CIRC(1 - n);
      }
    }
    else {
      // rotar tablero hacia las blancas
      rotateBoardAnimation.timing = function(n) {
        return - Animate.CIRC(1 - n);
      }
    }
    rotateBoardAnimation.play();
  }, 500);
});
