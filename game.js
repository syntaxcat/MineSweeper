'use strict';

const NORMAL = '🙂';
const DEAD = '🤯';
const WIN = '😎';
const MOVE = '😲';
const MINE = '💣';
const FLAG = '🚩';

var gBoard;
var gTimer;

//This is an object in which you can keep and update the current game state:
// isOn: Boolean, when true we let the user play
// shownCount: How many cells are shown
// markedCount: How many cells are marked (with a flag)
// secsPassed: How many seconds passed

var gGame = {
	isOn: false,
	// isOver: false,
	firstTurn: true,
	shownCount: 0, //// needed for: checking win
	markedCount: 0, //// needed for: timer
	secsPassed: 0
};

// This is an object by which the board size is set -

var gLevel = {
	SIZE: 4,
	MINES: 2
	// EMPTY: 14
};

// 1 - This is called when page loads - on the body tag!!!
function initGame() {
	gGame.shownCount = 0;
	gGame.isOn = true;
	gGame.firstTurn = true;

	gBoard = buildBoard();
	renderBoard();
}
// TODO:
//Reset life

// 2 - Builds the boardSet mines at random locations Call setMinesNegsCount() Return the created board
// Support 3 levels of the game
// Beginner (4*4 with 2 MINES)
// Medium (8 * 8 with 12 MINES)
// Expert (12 * 12 with 30 MINES)

function boardSize(size, mines) {
	gLevel.SIZE = size;
	gLevel.MINES = mines;
	// gLevel.EMPTY = gLevel.SIZE * gLevel.SIZE - gLevel.MINES;
	initGame();
}

// MODEL -  A Matrix containing cell objects: Each cell:

function buildBoard() {
	var board = [];
	for (var i = 0; i < gLevel.SIZE; i++) {
		board[i] = [];
		for (var j = 0; j < gLevel.SIZE; j++) {
			var cell = {
				minesAroundCount: 4,
				isShown: false, //// needed for: first move isn't a bomb rule..
				isMine: false,
				isMarked: true
			};
			board[i][j] = cell;
		}
	}
	return board;
}

//Count mines around each cell and set the cell's minesAroundCount.
function setMinesNegsCount() {
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[i].length; j++) {
			gBoard[i][j].minesAroundCount = countNeighbors(i, j);
		}
	}
	console.log(gBoard);
}

//Render the board as a <table> to the page
//DOM - HTML

function renderBoard() {
	var strHTML = '';
	for (var i = 0; i < gBoard.length; i++) {
		strHTML += `<tr class="board" >\n`;
		for (var j = 0; j < gBoard[0].length; j++) {
			var cell = gBoard[i][j];
			var className = '';
			if (cell.isShown) {
				className = 'cell';
				cell = cell.isMine ? MINE : cell.minesAroundCount;
			} else {
				className = 'cell';
				cell = '';
			}
			var cellID = 'cell ' + i + ',' + j;
			strHTML += `\t<td class="cell ${className}" oncontextmenu = "cellMarked(this, ${i}, ${j}); return false"
			onclick="cellClicked(this, ${i}, ${j})" id="${cellID}">
				${cell}
				</td>\n`;
		}
		strHTML += `</tr>\n`;
	}
	// console.log(strHTML)
	var elBoard = document.querySelector('.cells');
	elBoard.innerHTML = strHTML;
}

//Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
	var cell = gBoard[i][j];
	// make sure first turn isn't a bomb - TODO--------
	if (gGame.firstTurn) {
		cell.isMine = false;
		// cell.innerHTML !== MINE;
		elCell.innerHTML = cell.minesAroundCount;

		addMinesRandom(gLevel.MINES, { i: i, j: j });
		setMinesNegsCount();

		gGame.firstTurn = false;
	}

	if (cell.isMine) {
		elCell.innerHTML = MINE;
		// gGame.markedCount++;
		// cell.isMarked = true;
	} else {
		elCell.innerHTML = cell.minesAroundCount;
		gGame.shownCount++;
		checkGameOver();
	}

	console.log('Cell clicked: ', elCell, i, j);
	console.log('gGameShownCount', gGame.shownCount);
	// console.log('gGameMarkedCount', gGame.markedCount);
}

function addMinesRandom(minesAmount, firstLocation) {
	console.log(emptyCells());
	var arrEmptyCells = emptyCells();
	for (var i = 0; i < minesAmount; i++) {
		var Idx = getRandomIntInclusive(0, arrEmptyCells.length - 1);
		var location = arrEmptyCells[Idx];
		if (location === firstLocation) continue;
		//update model -
		gBoard[location.i][location.j].isMine = true;
		// 	//update DOM -
		// var elCell = document.getElementById('cell ' + location.i + ',' + location.j);
		// console.log('ELCELL', elCell);
		arrEmptyCells.splice(Idx, 1);
	}
	console.log('GBOARD', gBoard);
}

function emptyCells() {
	var emptyArr = [];
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			var currCell = gBoard[i][j];
			if (!currCell.isMine) {
				emptyArr.push({ i, j });
			}
		}
	}
	return emptyArr;
}

//Called on right click to mark a cell (suspected to be a mine) Search the web (and implement) how to hide the context menu on right click
function cellMarked(elCell) {
	elCell.innerHTML = FLAG;
	gGame.markedCount++;
	console.log(gGame.markedCount++);
}

//Game ends when all mines are marked, and all the other cells are shown
//LOSE: when clicking a mine, all mines should be revealed
// WIN: all the mines are flagged, and all the other cells are shown

function checkGameOver() {
	if (gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES) {
		gGame.isOn = false;
		console.log('GAME OVER');
	}
}

/*When user clicks a cell with no mines around, we need to open
not only that cell, but also its neighbors.///////
NOTE: start with a basic implementation that only opens the non-mine 1st degree neighbors
BONUS: if you have the time later, try to work more like the real algorithm (see description at the Bonuses section below)
*/
function expandShown(board, elCell, i, j) {}
