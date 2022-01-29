'use strict';

var gSeconds = 0;

function startStopWatch() {
	console.log('start');
	gTimer = setInterval(() => {
		gSeconds += 1;
		document.getElementById('seconds').innerHTML = gSeconds.toString().padStart(3, 0);
	}, 1000);
}

function stopTime() {
	clearInterval(gTimer);
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
