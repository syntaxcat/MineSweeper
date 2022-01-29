'use strict';

const NORMAL = '🙂';
const DEAD = '🤯';
const WIN = '😎';
const MINE = '💣';
const FLAG = '🚩';
const LIFE = '❤️';

var gBoard;
var gTimer;
var gLifeCount;

var gGame = {
	isOn: false,
	firstTurn: true,
	shownCount: 0, // needed for: checking win
	markedCount: 0, // needed for: timer
	secsPassed: 0
};

var gLevel = {
	SIZE: 4,
	MINES: 2,
	LIVES: 1
};

function initGame() {
	gLifeCount = gLevel.LIVES;
	document.querySelector('.lives').innerText = LIFE.repeat(gLevel.LIVES);
	document.querySelector('#btn').innerText = NORMAL;
	gGame.shownCount = 0;
	gGame.isOn = true;
	gGame.firstTurn = true;
	gSeconds = 0;
	document.querySelector('#seconds').innerText = '000';
	gBoard = buildBoard();
	renderBoard();
}

function boardSize(size, mines, lives) {
	gLevel.SIZE = size;
	gLevel.MINES = mines;
	gLevel.LIVES = lives;
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
				isShown: false, // needed for: first move isn't a bomb rule..
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
				// cell = cell.isMine ? MINE : cell.minesAroundCount;
				// if (cell.isMine === MINE) {
				// 	className = 'mine';
				// } else {
				// 	className = 'neighbors';
				// }
			} else {
				cell = '';
			}
			var cellID = 'cell-' + i + '-' + j;
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
	elBoard.className = `cells cells-${gBoard.length}-${gBoard.length}`;
}

//Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
	if (gGame.isOn === false) return;
	elCell.style.backgroundColor = '#fde2e4';
	var cell = gBoard[i][j];
	if (cell.isShown) return;
	// make sure first turn isn't a bomb -
	if (gGame.firstTurn) {
		startStopWatch();
		cell.isMine = false;
		cell.isShown = true;
		elCell.innerHTML = cell.minesAroundCount;
		if (elCell.innerHTML === '0') {
			elCell.innerHTML = '';
		}
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
		if (elCell.innerHTML === '0') {
			elCell.innerHTML = '';
		}
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
	var cell = gBoard[i][j];
	// WIN: all the mines are flagged, and all the other cells are shown
	if (gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES) {
		gGame.isOn = false;
		document.querySelector('#btn').innerText = WIN;
		stopTime();
	}
	//LOSE: when clicking a mine, all mines should be revealed
	if (gBoard[i][j].isMine) {
		gLifeCount--;
		document.querySelector('.lives').innerText = LIFE.repeat(gLifeCount);
		cell.isShown = true;
		if (gLifeCount === 0) {
			document.querySelector('#btn').innerText = DEAD;
			gGame.isOn = false;
			for (var i = 0; i < gBoard.length; i++) {
				for (var j = 0; j < gBoard[i].length; j++) {
					if (gBoard[i][j].isMine) {
						document.querySelector(`${'#cell-' + i + '-' + j}`).innerText = MINE;
					}
				}
			}
			stopTime();
		}
	}
}

function expandShown(board, rowIdx, colIdx) {
	for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
		if (i < 0 || i >= gBoard.length) continue;
		for (var j = colIdx - 1; j <= colIdx + 1; j++) {
			if (j < 0 || j >= gBoard[i].length) continue;
			if (i === rowIdx && j === colIdx) continue;
			//update Model -
			board[i][j].isShown = true;
			var cellEl = document.getElementById('cell-' + i + '-' + j);
			cellEl.style.backgroundColor = '#fde2e4';
			gGame.shownCount++;
			//update DOM -
			cellEl.innerHTML = board[i][j].minesAroundCount;
			if (board[i][j].minesAroundCount === 0) {
				cellEl.innerHTML = '';
			}
		}
	}
}
