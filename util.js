'use strict';

// var gMiliseconds = 0;
var gSeconds = 0;
var gIntervalId;

function startStopWatch() {
	gIntervalId = setInterval(() => {
		// gMiliseconds += 17;
		gSeconds += 1;
		var date = new Date(gSeconds);
		document.getElementById('seconds').innerHTML = `${date.getSeconds()}`;
		// document.getElementById('milliseconds').innerHTML = `${date.getMilliseconds()}`;
	}, 1);
}

function stopTime() {
	clearInterval(gIntervalId);
	// gMiliseconds = 0;
	gSeconds = 0;
}

////// count neighbors -

function countNeighbors(rowIdx, colIdx) {
	var neighborsCount = 0;
	for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
		if (i < 0 || i >= gBoard.length) continue;
		for (var j = colIdx - 1; j <= colIdx + 1; j++) {
			if (j < 0 || j >= gBoard[i].length) continue;
			if (i === rowIdx && j === colIdx) continue;
			if (gBoard[i][j].isMine) neighborsCount++;
		}
	}
	return neighborsCount;
}

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function shuffle(items) {
	var randIdx, keep;
	for (var i = items.length - 1; i > 0; i--) {
		randIdx = getRandomIntInclusive(0, items.length - 1);

		keep = items[i];
		items[i] = items[randIdx];
		items[randIdx] = keep;
	}
	return items;
}
