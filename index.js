const gameBoard = document.querySelector(".board");
const playerPeices = document.querySelector(".takenPeices#player");
const opponentPeices = document.querySelector(".takenPeices#opponent");

let Pcount = 0, Ocount = 0;
const showOpponent = document.querySelector(".oppo");
const showPlayer = document.querySelector(".play");

let startPos;
let draggedEle;
const width = 8;

let playerGo = "white";

const startPeices = [
    rook, knight, bishop, queen, king, bishop, knight, rook,
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    rook, knight, bishop, queen, king, bishop, knight, rook
];

function createBoard() {
    startPeices.forEach((peice, i) => {
        const square = document.createElement("div");
        square.classList.add("square");
        square.innerHTML = peice;
        if(square.firstChild) {
            square.firstChild.setAttribute("draggable", true);
        }
        square.setAttribute("square-idx", i);
        const row = Math.floor((63-i) / 8) + 1;
        if(row % 2 === 0) {
            square.classList.add(i % 2 === 0 ? "beige" : "brown");
        } else {
            square.classList.add(i % 2 === 0 ? "brown" : "beige");
        }
        if(i <= 15) {
            square.firstChild.classList.add("black");
        }
        if(i >= 48 && i<= 63) {
            square.firstChild.classList.add("white");
        }
        gameBoard.append(square);
    });
}
createBoard();

const squares = gameBoard.querySelectorAll(".square");
squares.forEach((square) => {
    square.addEventListener("dragstart", dragStart);
    square.addEventListener("dragover", dragOver);
    square.addEventListener("drop", dragDrop);
});

function dragStart(e) {
    startPos = e.target.parentNode.getAttribute("square-idx");
    draggedEle = e.target;
}

function dragOver(e) {
    e.preventDefault();
}

function dragDrop(e) {
    e.stopPropagation();
    const correctGo = draggedEle.classList.contains(playerGo);
    const takenbyPlayer = e.target.classList.contains(playerGo);
    const opponentGo = (playerGo === "black" ? "white" : "black");
    const takenbyOpponent = e.target.firstChild && e.target.classList.contains(opponentGo);
    const valid = checkMove(e.target, opponentGo);
    
    if (correctGo) {
        if (takenbyOpponent && !takenbyPlayer && valid) {
            const capturedPiece = e.target.cloneNode(true); // Copy the entire structure

            e.target.parentNode.append(draggedEle);

            if (playerGo === "white") {
                playerPeices.append(capturedPiece);
                switch(e.target.getAttribute("id")) {
                    case "pawn":
                        Pcount += 1;
                        break;
                    case "knight":
                        Pcount += 3;
                        break;
                    case "bishop":
                        Pcount += 3;
                        break;
                    case "rook":
                        Pcount += 6;
                        break;
                    case "queen":
                        Pcount += 9;
                        break;
                }
                //console.log(Pcount, Ocount);
                
            } else {
                opponentPeices.append(capturedPiece);
                switch(e.target.getAttribute("id")) {
                    case "pawn":
                        Ocount += 1;
                        break;
                    case "knight":
                        Ocount += 3;
                        break;
                    case "bishop":
                        Ocount += 3;
                        break;
                    case "rook":
                        Ocount += 6;
                        break;
                    case "queen":
                        Ocount += 9;
                        break;
                }
                //console.log(Pcount, Ocount);
            }

            e.target.remove();
            changePlayer();
            return;
        }
        //console.log(playerGo, "playerGo");
        //console.log(opponentGo, "opponentGo");
    }
   
    if(correctGo && !takenbyPlayer && valid) {
        e.target.append(draggedEle);
        changePlayer();
        return;
    }
}

function checkMove(target, opponentGo) {
    const targetId = Number(target.getAttribute("square-idx")) || Number(target.parentNode.getAttribute("square-idx"));
    const startId = Number(startPos);
    const piece = draggedEle.id;

    switch(piece) {
        case "pawn":
            const starterRow = [48,49,50,51,52,53,54,55];
            if (
                starterRow.includes(startId) && (startId - width*2 === targetId && !document.querySelector(`[square-idx="${startId - width*2}"]`).firstChild || startId - width === targetId && (!document.querySelector(`[square-idx="${startId - width}"]`).firstChild)) ||
                !starterRow.includes(startId) && startId - width === targetId && !document.querySelector(`[square-idx="${startId - width}"]`).firstChild ||
                (startId - width - 1 === targetId && document.querySelector(`[square-idx="${startId - width - 1}"]`).firstChild) ||
                (startId - width + 1 === targetId && document.querySelector(`[square-idx="${startId - width + 1}"]`).firstChild)
            ) {
                return true;
            }
            break;
        case "knight":
            if (
                startId + width*2 + 1 === targetId || startId + width*2 - 1 === targetId || 
                startId - width*2 + 1 === targetId || startId - width*2 - 1 === targetId || 
                startId + width + 2 === targetId || startId + width - 2 === targetId || 
                startId - width + 2 === targetId || startId - width - 2 === targetId
            ) {
                return true;
            }
            break;
        case "bishop":
            if (bishopMove(startId, targetId, width)) {
                return true;
            }
            break;
        case "rook":
            if (rookMove(startId, targetId, width)) {
                return true;
            }
            break;
        case "queen":
            if (bishopMove(startId, targetId, width) || rookMove(startId, targetId, width)){
                return true;
            }
            break;
        case "king":
            if (
                startId - width === targetId || startId - width + 1 === targetId || startId - width - 1 === targetId ||
                startId + width === targetId || startId + width + 1 === targetId || startId + width - 1 === targetId ||
                startId + 1 === targetId || startId - 1 === targetId
            ) {
                console.log(underCheck(opponentGo, targetId));
                
                    if(underCheck(opponentGo, targetId)) {
                        return true;
                    }
                }
            break;
        }
    return false;
}

function changePlayer() {
    if(playerGo === "white") {
        reverseIds();
        playerGo = "black";
        //console.log(playerGo);
    } else {
        revertIds();
        playerGo = "white";
        //console.log(playerGo);
    }
}

function reverseIds() {
    const allSquares = document.querySelectorAll(".square");
    allSquares.forEach((square, i) => {
        square.setAttribute("square-idx", (63 - i));
    });
}

function revertIds() {
    const allSquares = document.querySelectorAll(".square");
    allSquares.forEach((square, i) => {
        square.setAttribute("square-idx", i);
    });
}

function bishopMove(startId, targetId, width) {
    const rowDiff = Math.abs(Math.floor(startId / width) - Math.floor(targetId / width));
    const colDiff = Math.abs((startId % width) - (targetId % width));

        if (rowDiff === colDiff) {
            const rowDir = (targetId - startId) / Math.abs(targetId - startId);
            const colDir = (targetId % width > startId % width) ? 1 : -1;

            let currSquare = startId + (rowDir * width) + colDir;
            while (currSquare !== targetId) {
                if (document.querySelector(`[square-idx="${currSquare}"]`).firstChild) {
                    return false; 
                }
                currSquare = currSquare + (rowDir * width) + colDir;
            }

            return true; 
        }
}

function bishopAttack(startId, targetId, width) {
    const rowDiff = Math.abs(Math.floor(startId / width) - Math.floor(targetId / width));
    const colDiff = Math.abs((startId % width) - (targetId % width));

        if (rowDiff === colDiff) {
            const rowDir = (targetId - startId) / Math.abs(targetId - startId);
            const colDir = (targetId % width > startId % width) ? 1 : -1;

            let currSquare = startId + (rowDir * width) + colDir;
            while (currSquare !== targetId) {
                if (document.querySelector(`[square-idx="${currSquare}"]`).firstChild && !(document.querySelector(`[square-idx="${currSquare}"]`).firstChild.classList.contains(`${playerGo}`) && document.querySelector(`[square-idx="${currSquare}"]`).firstChild.getAttribute("id") === "king")) {
                    return false; 
                }
                currSquare = currSquare + (rowDir * width) + colDir;
            }

            return true; 
        }
}

function rookMove(startId, targetId, width) {
    const rowDiff = Math.abs(Math.floor(startId / width) - Math.floor(targetId / width));
    const colDiff = Math.abs((startId % width) - (targetId % width));

    if(rowDiff === 0 || colDiff === 0) {
        if(rowDiff === 0) {
            const minCol = Math.min((startId % width), (targetId % width));
            const maxCol = Math.max((startId % width), (targetId % width));

            for(let i = minCol + 1; i < maxCol; i++) {
                let currSquare = width * (Math.floor(startId / width)) + i;
                if (document.querySelector(`[square-idx="${currSquare}"]`).firstChild) {
                    return false; 
                }
            }
        } else {
            const minRow = Math.min((Math.floor(startId / width)), (Math.floor(targetId / width)));
            const maxRow = Math.max((Math.floor(startId / width)), (Math.floor(targetId / width)));

            for(let i = minRow + 1; i < maxRow; i++) {
                let currSquare = width * i + (startId % width);
                if (document.querySelector(`[square-idx="${currSquare}"]`).firstChild) {
                    return false; 
                }
            }
        }
    }

    return true;
}

function rookAttack(startId, targetId, width) {
    const rowDiff = Math.abs(Math.floor(startId / width) - Math.floor(targetId / width));
    const colDiff = Math.abs((startId % width) - (targetId % width));

    if(rowDiff === 0 || colDiff === 0) {
        if(rowDiff === 0) {
            const minCol = Math.min((startId % width), (targetId % width));
            const maxCol = Math.max((startId % width), (targetId % width));

            for(let i = minCol + 1; i < maxCol; i++) {
                let currSquare = width * (Math.floor(startId / width)) + i;
                if (document.querySelector(`[square-idx="${currSquare}"]`).firstChild && !(document.querySelector(`[square-idx="${currSquare}"]`).firstChild.classList.contains(`${playerGo}`) && document.querySelector(`[square-idx="${currSquare}"]`).firstChild.getAttribute("id") === "king")) {
                    return false; 
                }
            }
            
            return true;
        } else {
            const minRow = Math.min((Math.floor(startId / width)), (Math.floor(targetId / width)));
            const maxRow = Math.max((Math.floor(startId / width)), (Math.floor(targetId / width)));

            for(let i = minRow + 1; i < maxRow; i++) {
                let currSquare = width * i + (startId % width);
                if (document.querySelector(`[square-idx="${currSquare}"]`).firstChild && !(document.querySelector(`[square-idx="${currSquare}"]`).firstChild.classList.contains(`${playerGo}`) && document.querySelector(`[square-idx="${currSquare}"]`).firstChild.getAttribute("id") === "king")) {
                    return false; 
                }
            }

            return true;
        }
    }

    return false;
}

function possibleMoves(piece, startId, targetId) {
    switch(piece) {
        case "pawn":
            if(
                startId + width - 1 === targetId || startId + width + 1 === targetId
            ) {
                return true;
            }
            break;
        case "knight":
            if(
                startId + width*2 + 1 === targetId || startId + width*2 - 1 === targetId || 
                startId - width*2 + 1 === targetId || startId - width*2 - 1 === targetId || 
                startId + width + 2 === targetId || startId + width - 2 === targetId || 
                startId - width + 2 === targetId || startId - width - 2 === targetId
            ) {
                return true;
            }
            break;
        case "bishop":
            if (bishopAttack(startId, targetId, width)) { // 31, 4, 8 . this is returning false that is why possibleMoves( ) returns false.
                return true;
            }
            break;
        case "rook":
            if (rookAttack(startId, targetId, width)) {
                return true;
            }
        case "queen":
            if (bishopAttack(startId, targetId, width) || rookAttack(startId, targetId, width)) {
                return true;
            }
        case "king":
            if (
                startId - width === targetId || startId - width + 1 === targetId || startId - width - 1 === targetId ||
                startId + width === targetId || startId + width + 1 === targetId || startId + width - 1 === targetId ||
                startId + 1 === targetId || startId - 1 === targetId
            ) {
                return true;
            }
            break;
    }
    return false;
}

function underCheck(opponentGo, targetId) { // targetId is the square the king wants to move to
    const peicesOpponent = document.querySelectorAll(`.${opponentGo}`);

    for (const peice of peicesOpponent) {
        if(possibleMoves(peice.getAttribute("id"), Number(peice.parentNode.getAttribute("square-idx")), targetId)) { // this is returning false for now. this should be true.
            return false;
        }
    }

    return true;
}

setInterval(() => {
    if (Pcount > Ocount) {
        showOpponent.innerHTML = "";
        showPlayer.innerHTML = `+${Math.abs(Pcount - Ocount)}`;
    } else if (Pcount < Ocount) {
        showPlayer.innerHTML = "";
        showOpponent.innerHTML = `+${Math.abs(Pcount - Ocount)}`;
    } else {
        showOpponent.innerHTML = "";
        showPlayer.innerHTML = "";
    }
}, 100);
