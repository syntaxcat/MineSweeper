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
	// Reset game state
	clearInterval(gTimer);
	gTimer = null;
	gSeconds = 0;

	// Reset game object
	gGame = {
		isOn: false,
		firstTurn: true,
		shownCount: 0,
		markedCount: 0,
		secsPassed: 0
	};

	// Reset UI
	document.querySelector('#btn').innerText = NORMAL;
	document.querySelector('#seconds').textContent = '000';
	document.getElementById('flag-counter').textContent = gLevel.MINES.toString().padStart(3, '0');
	document.querySelector('.lives').innerHTML = LIFE.repeat(gLevel.LIVES);
	document.getElementById('bomb-counter').textContent = gLevel.MINES.toString();

	// Remove visual feedback classes
	document.body.classList.remove('game-won', 'game-lost');

	// Rebuild and render fresh board
	gBoard = buildBoard();
	renderBoard();

	// Allow new game to start
	gGame.isOn = true;
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
	return Array(gLevel.SIZE).fill().map((_, i) =>
		Array(gLevel.SIZE).fill().map((_, j) => ({
			minesAroundCount: 0,
			isShown: false,
			isMine: false,
			isMarked: false
		}))
	);
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
		strHTML += `<tr class="board">\n`;
		for (var j = 0; j < gBoard[0].length; j++) {
			var cell = gBoard[i][j];
			var className = cell.isShown ? 'cell' : '';
			var cellID = `cell-${i}-${j}`;

			strHTML += `
                <td class="${className}" 
                    data-value="${cell.minesAroundCount}"
                    oncontextmenu="cellMarked(this, ${i}, ${j}); return false" 
                    onclick="cellClicked(this, ${i}, ${j})" 
                    id="${cellID}"
                >
                    ${cell.isShown ? (cell.isMine ? MINE : cell.minesAroundCount || '') : ''}
                </td>\n`;
		}
		strHTML += `</tr>\n`;
	}

	var elBoard = document.querySelector('.cells');
	elBoard.innerHTML = strHTML;
	elBoard.className = `cells cells-${gBoard.length}-${gBoard.length}`;

	// Add touch events AFTER rendering
	for (let i = 0; i < gBoard.length; i++) {
		for (let j = 0; j < gBoard[i].length; j++) {
			const elCell = document.getElementById(`cell-${i}-${j}`);
			addTouchEvents(elCell, i, j);
		}
	}
}


function addTouchEvents(elCell, i, j) {
	let pressTimer;
	let isLongPress = false;

	elCell.addEventListener('touchstart', (e) => {
		e.preventDefault(); // ✨ Stops selection popup
		isLongPress = false;

		pressTimer = setTimeout(() => {
			isLongPress = true;
			cellMarked(elCell, i, j);
		}, 500);
	});

	elCell.addEventListener('touchend', (e) => {
		e.preventDefault(); // ✨ Stops selection popup
		clearTimeout(pressTimer);
		if (!isLongPress) {
			cellClicked(elCell, i, j);
		}
	});
}

//Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
	if (!gGame.isOn) return;

	var cell = gBoard[i][j];
	if (cell.isShown || cell.isMarked) return;

	if (gGame.firstTurn) {
		startStopWatch();
		addMinesRandom(gLevel.MINES, { i, j });
		setMinesNegsCount();
		gGame.firstTurn = false;
	}

	if (cell.isMine) {
		// Hit a mine
		elCell.innerHTML = MINE;
		cell.isShown = true;
		checkGameOver(i, j);
		return;
	}

	// Reveal cell
	revealCell(i, j);

	// Check win
	checkGameOver(i, j);
}

// function revealCell(i, j) {
// 	const cell = gBoard[i][j];
// 	const elCell = document.getElementById(`cell-${i}-${j}`);

// 	if (cell.isShown || cell.isMine) return;

// 	cell.isShown = true;
// 	gGame.shownCount++;
// 	elCell.classList.add('cell');

// 	if (cell.minesAroundCount === 0) {
// 		// elCell.innerHTML = '&nbsp;'; // keeps height consistent
// 		elCell.innerHTML = '';
// 	elCell.removeAttribute('data-value');
// 		// elCell.removeAttribute('data-value'); // ✅ remove it
// 		expandShown(gBoard, i, j);
// 	} else {
// 		elCell.innerHTML = cell.minesAroundCount;
// 		elCell.setAttribute('data-value', cell.minesAroundCount);
// 	}
// }

function revealCell(i, j) {
	const cell = gBoard[i][j];
	const elCell = document.getElementById(`cell-${i}-${j}`);

	if (cell.isShown || cell.isMine) return;

	cell.isShown = true;
	gGame.shownCount++;
	elCell.classList.add('cell');

	if (cell.minesAroundCount === 0) {
		elCell.innerHTML = '&nbsp;';
		elCell.removeAttribute('data-value');
		expandShown(gBoard, i, j);
	} else {
		elCell.innerHTML = cell.minesAroundCount;
		elCell.setAttribute('data-value', cell.minesAroundCount);
	}
}

function addMinesRandom(minesAmount, firstLocation) {
	var arrEmptyCells = emptyCells();
	for (var i = 0; i < minesAmount; i++) {
		if (arrEmptyCells.length === 0) break; // Safety check
		var Idx = getRandomIntInclusive(0, arrEmptyCells.length - 1);
		var location = arrEmptyCells[Idx];

		// Properly compare coordinates
		if (location.i === firstLocation.i && location.j === firstLocation.j) {
			arrEmptyCells.splice(Idx, 1);
			i--; // Retry this iteration
			continue;
		}

		gBoard[location.i][location.j].isMine = true;
		arrEmptyCells.splice(Idx, 1);
	}
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
	const cell = gBoard[i][j];

	// Prevent flagging revealed cells
	if (cell.isShown) return;

	// Enforce flag limit = mine count
	if (!cell.isMarked && gGame.markedCount >= gLevel.MINES) {
		// alert('No more flags available!');
		showToast('🚫 No more flags available!');
		return;
	}

	if (cell.isMarked) {
		// Remove flag
		elCell.innerHTML = '';
		cell.isMarked = false;
		gGame.markedCount--;
	} else {
		// Place flag
		elCell.innerHTML = FLAG;
		cell.isMarked = true;
		gGame.markedCount++;
		elCell.blur(); // remove focus only when placing flag
	}

	const remainingFlags = gLevel.MINES - gGame.markedCount;
	document.getElementById('flag-counter').textContent =
		remainingFlags.toString().padStart(3, '0');

	document.getElementById('flag-counter').style.color =
		remainingFlags === 0 ? 'limegreen' : 'red';
}

function checkGameOver(i, j) {
	const cell = gBoard[i][j];
	const totalCells = gLevel.SIZE * gLevel.SIZE;
	const requiredRevealed = totalCells - gLevel.MINES;

	// Win conditions
	const isAllNonMinesRevealed = gGame.shownCount === requiredRevealed;
	const areAllMinesFlagged = gBoard.flat().every(cell =>
		(cell.isMine && cell.isMarked) || (!cell.isMine && !cell.isMarked)
	);

	if (isAllNonMinesRevealed) {
		// Win handling
		gGame.isOn = false;
		document.querySelector('#btn').innerText = WIN;
		stopTime();

		// Visual feedback
		document.body.classList.add('game-won');
		setTimeout(() => {
			// alert('🎉 Congratulations! You won! 🎉');
			showToast('🎉 Congratulations!\nYou won!', 4000);
		}, 100);
		return;
	}

	// Lose condition
	if (cell.isMine) {
		gLifeCount--;
		document.querySelector('.lives').innerText = LIFE.repeat(gLifeCount);

		// Decrease the visible bomb count
		const elBombCounter = document.getElementById('bomb-counter');
		let bombCount = parseInt(elBombCounter.textContent);
		elBombCounter.textContent = Math.max(0, bombCount - 1); // prevent negative numbers


		if (gLifeCount === 0) {
			// Final death handling
			document.querySelector('#btn').innerText = DEAD;
			gGame.isOn = false;
			revealAllMines();
			stopTime();

			// Visual feedback
			document.body.classList.add('game-lost');
			setTimeout(() => {
				// alert('💥 Game Over! Try again! 💥');
				showToast('💥 Game Over!\nTry again! 💥', 4000);
			}, 100);
		}
	}
}

// Helper function to reveal all mines
function revealAllMines() {
	gBoard.forEach((row, i) => {
		row.forEach((cell, j) => {
			if (cell.isMine) {
				const cellEl = document.querySelector(`#cell-${i}-${j}`);
				cellEl.innerHTML = MINE;
				cellEl.classList.add('mine-revealed');
			}
		});
	});
}

function expandShown(board, rowIdx, colIdx) {
	for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
		if (i < 0 || i >= board.length) continue;
		for (var j = colIdx - 1; j <= colIdx + 1; j++) {
			if (j < 0 || j >= board[i].length) continue;
			if (i === rowIdx && j === colIdx) continue;

			const cell = board[i][j];
			const cellEl = document.getElementById(`cell-${i}-${j}`);

			if (!cell.isShown && !cell.isMine) {
				revealCell(i, j);
				// Recursive expansion for empty cells
				if (cell.minesAroundCount === 0) {
					expandShown(board, i, j);
				}
			}
		}
	}
}

function showToast(message, duration = 2500) {
	const toast = document.getElementById('toast');
	toast.textContent = message;
	toast.classList.remove('hidden');

	// Force reflow to trigger transition
	void toast.offsetWidth;

	toast.classList.add('show');

	setTimeout(() => {
		toast.classList.remove('show');
		setTimeout(() => {
			toast.classList.add('hidden');
		}, 300);
	}, duration);
}