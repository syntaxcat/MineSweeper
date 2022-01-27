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
	firstTurn: true,
	shownCount: 0, // needed for: checking win
	markedCount: 0, // needed for: timer
	secsPassed: 0
};

var gLevel = {
	SIZE: 4,
	MINES: 2
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
	document.querySelector('h2 span').innerText = mines;
	stopTime();
	initGame();
}

// MODEL -  A Matrix containing cell objects: Each cell:

function buildBoard() {
	var board = [];
	for (var i = 0; i < gLevel.SIZE; i++) {
		board[i] = [];
		for (var j = 0; j < gLevel.SIZE; j++) {
			var cell = {
				minesAroundCount: 0,
				isShown: false, //// needed for: first move isn't a bomb rule..
				isMine: false,
				isMarked: false
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
	if (cell.isShown) return;
	// make sure first turn isn't a bomb - TODO--------
	if (gGame.firstTurn) {
		startStopWatch();
		cell.isMine = false;
		cell.isShown = true;
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
		if (!cell.minesAroundCount) {
			expandShown(gBoard, i, j);
		} else {
			gGame.shownCount++;
		}
	}
	cell.isShown = true;
	checkGameOver(i, j);
	console.log('Cell clicked: ', elCell, i, j);
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
			if (!currCell.isMine && !currCell.isShown) {
				emptyArr.push({ i, j });
			}
		}
	}
	return emptyArr;
}

//Called on right click to mark a cell (suspected to be a mine) Search the web (and implement) how to hide the context menu on right click
function cellMarked(elCell, i, j) {
	var cell = gBoard[i][j];
	if (cell.isMarked) {
		elCell.innerHTML = '';
		cell.isMarked = false;
		gGame.markedCount--;
		return;
	}
	cell.isMarked = true;
	elCell.innerHTML = FLAG;
	gGame.markedCount++;
	console.log(gGame.markedCount++);
}

function checkGameOver(i, j) {
	// WIN: all the mines are flagged, and all the other cells are shown
	if (gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES) {
		gGame.isOn = false;
		console.log('YOU WON!');
		stopTime();
	}
	//LOSE: when clicking a mine, all mines should be revealed
	if (gBoard[i][j].isMine) {
		gGame.isOn = false;
		console.log('GAME OVER!YOU LOST');
		stopTime();
	}
}

/*When user clicks a cell with no mines around, we need to open
not only that cell, but also its neighbors.///////
NOTE: start with a basic implementation that only opens the non-mine 1st degree neighbors
BONUS: if you have the time later, try to work more like the real algorithm (see description at the Bonuses section below)
*/
function expandShown(board, rowIdx, colIdx) {
	for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
		if (i < 0 || i >= gBoard.length) continue;
		for (var j = colIdx - 1; j <= colIdx + 1; j++) {
			if (j < 0 || j >= gBoard[i].length) continue;
			if (i === rowIdx && j === colIdx) continue;
			//update Model -
			board[i][j].isShown = true;
			gGame.shownCount++;
			//update DOM -
			document.getElementById('cell ' + i + ',' + j).innerHTML = board[i][j].minesAroundCount;
		}
	}
}
