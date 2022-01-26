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
	shownCount: 0,
	markedCount: 0,
	secsPassed: 0
};

// This is an object by which the board size is set (in this case: 4x4 board and how many mines to put)-

var gLevel = {
	SIZE: 4,
	MINES: 2
};

// 1 - This is called when page loads - on the body tag!!!
function initGame() {
	gBoard = buildBoard();
	setMinesNegsCount();
	addMinesRandom(gLevel.MINES);
	renderBoard();
}
// TODO:
//Reset board
//Reset life

// 2 - Builds the boardSet mines at random locations Call setMinesNegsCount() Return the created board
// Support 3 levels of the game
// Beginner (4*4 with 2 MINES)
// Medium (8 * 8 with 12 MINES)
// Expert (12 * 12 with 30 MINES)
// MODEL -  A Matrix containing cell objects: Each cell:

function buildBoard() {
	var board = [];
	for (var i = 0; i < gLevel.SIZE; i++) {
		board[i] = [];
		for (var j = 0; j < gLevel.SIZE; j++) {
			var cell = {
				minesAroundCount: 4,
				isShown: false,
				isMine: false,
				isMarked: true
			};
			board[i][j] = cell;
		}
	}
	// board[0][2].isMine = true;
	// board[2][3].isMine = true;
	// console.table(board);
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
	setMinesNegsCount();
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
			strHTML += `\t<td class="cell ${className}"
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
	if (cell.isMine) {
		elCell.innerHTML = MINE;
	} else {
		elCell.innerHTML = cell.minesAroundCount;
	}
	console.log('Cell clicked: ', elCell, i, j);
}

function boardSize(size, mines) {
	// var elHearts = document.querySelector('header p');
	// difficulty ? (elHearts.innerText = '❤️❤️❤️') : (elHearts.innerText = '❤️');
	gLevel.SIZE = size;
	gLevel.MINES = mines;
	initGame();
}

function addMinesRandom(minesAmount) {
	console.log(emptyCells());
	var arrEmptyCells = emptyCells();
	for (var i = 0; i < minesAmount; i++) {
		var Idx = getRandomIntInclusive(0, arrEmptyCells.length - 1);
		var location = arrEmptyCells[Idx];
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
function cellMarked(elCell) {}

//Game ends when all mines are marked, and all the other cells are shown
//Game ends when:
//LOSE: when clicking a mine, all mines should be revealed o WIN: all the mines are flagged, and all the other cells are shown

function checkGameOver() {}

/*When user clicks a cell with no mines around, we need to open
not only that cell, but also its neighbors.///////
NOTE: start with a basic implementation that only opens the non-mine 1st degree neighbors
BONUS: if you have the time later, try to work more like the real algorithm (see description at the Bonuses section below)
*/
function expandShown(board, elCell, i, j) {}
