document.addEventListener('DOMContentLoaded', function() {
    const bestResults = JSON.parse(localStorage.getItem('bestResults')) || [];
    const cardItem = [
        'angular.jpg',
        'angular.jpg',
        'bootstrap.png',
        'bootstrap.png',
        'css.jpg',
        'css.jpg',
        'html.jpg',
        'html.jpg',
        'jquery.png',
        'jquery.png',
        'js.png',
        'js.png',
        'node.png',
        'node.png',
        'php.png',
        'php.png',
        'react.png',
        'react.png',
        'vue.png',
        'vue.png',
    ];

    let flippedCards = [];
    let matchedCards = [];
    let lockBoard = false;
    let count = 0;
    let timerInterval;
    let seconds = 0;
    let minutes = 0;

    const field = document.querySelector('.field');
    const counter = document.querySelector('#counter');
    const timer = document.querySelector('#timer');
    const modal = document.querySelector('.modal');
    const startButton = document.querySelector('.start-button');
    const modalWin = document.querySelector('.modal-win');
    const time = document.querySelector('#time');
    const countWin =document.querySelector('#count');
    const newGameButton = document.querySelector('.new-game-button');
    const name = document.querySelector('#name');
    const result = document.querySelector('.result-list');
    const resultTitle = document.querySelector('.result h4');

    console.log(name.value);

    function shuffle(array) {
        array.sort(() => Math.random() - 0.5);
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            seconds++;
            if (seconds === 60) {
                seconds = 0;
                minutes++;
            }
            const formattedDate = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            timer.textContent = formattedDate;
            time.textContent = formattedDate;
        }, 1000);
    }

    function createBoard() {
        count = 0;
        shuffle(cardItem);
        cardItem.forEach((cardPath, index) => {
            const card = document.createElement('div');
            card.classList.add('card');

            const imgFront = document.createElement('img');
            imgFront.classList.add('logo');
            imgFront.src = 'assets/img/' + cardPath;

            const imgBack = document.createElement('img');
            imgBack.classList.add('back');
            imgBack.src = 'assets/img/back.avif';

            card.dataset.card = cardPath;
            card.dataset.index = index;
            card.dataset.flipped = 'false';

            card.appendChild(imgFront);
            card.appendChild(imgBack);
            card.addEventListener('click', flipCard);
            field.appendChild(card);
        });
    }

    function flipCard() {
        if (lockBoard || this.dataset.flipped === 'true') return;

        this.dataset.flipped = 'true';
        const logo = this.querySelector('.logo');
        const back = this.querySelector('.back');

        logo.classList.add('rotate');
        back.classList.add('rotate');
        flippedCards.push(this);
        count++;
        counter.textContent = count;
        countWin.textContent = count;

        if (flippedCards.length === 2) {
            lockBoard = true;
            setTimeout(checkForMatch, 500);
        }
    }

    function unflipCard() {
        flippedCards.forEach(card => {
            card.dataset.flipped = 'false';
        });
        flippedCards = [];
    }

    function checkForMatch() {
        const [firstCard, secondCard] = flippedCards;
        const logo1 = firstCard.querySelector('.logo');
        const logo2 = secondCard.querySelector('.logo');
        const back1 = firstCard.querySelector('.back');
        const back2 = secondCard.querySelector('.back');

        if (logo1.src === logo2.src) {
            matchedCards.push(firstCard, secondCard);
            if (matchedCards.length === cardItem.length) {
                clearInterval(timerInterval);
                modalWin.classList.remove('hide');
                const playerName = name.value;
                const totalTimeInSeconds = (minutes * 60) + seconds;
                saveGameData(playerName, count, totalTimeInSeconds);
            }
            resetBoard();
        } else {
            setTimeout(() => {
                logo1.classList.remove('rotate');
                logo2.classList.remove('rotate');
                back1.classList.remove('rotate');
                back2.classList.remove('rotate');
                unflipCard();
                resetBoard();
            }, 1000);
        }
    }

    function resetBoard() {
        [lockBoard, flippedCards] = [false, []];
    }

    function resetTimer() {
        seconds = 0;
        minutes = 0;
        const formattedDate = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        timer.textContent = formattedDate;
    }

    function resetGame() {
        flippedCards = [];
        matchedCards = [];
        lockBoard = false;
        count = 0;
        counter.textContent = count;
        field.innerHTML = '';
        createBoard();
    }

    function saveGameData(playerName, moves, timeInSeconds) {
        const gameData = {
            playerName: playerName,
            moves: moves,
            time: timeInSeconds 
        };
        const bestResults = JSON.parse(localStorage.getItem('bestResults')) || [];

        if (bestResults.length >= 10) {
            const worstResult = bestResults[bestResults.length - 1];

            if(timeInSeconds < worstResult.time || (timeInSeconds === worstResult.time && moves < timeInSeconds < worstResult.moves)) {
                bestResults.pop();
                bestResults.push(gameData);
                bestResults.sort((a, b) => a.time - b.time);
            }
        }
        else {
            bestResults.push(gameData);
            bestResults.sort((a, b) => a.time - b.time);
        }
        localStorage.setItem('bestResults', JSON.stringify(bestResults));
        displayBestResult();
    }

    function displayBestResult() {
        const bestResults = JSON.parse(localStorage.getItem('bestResults')) || [];
    
        resultTitle.textContent = 'Best result:';

        if (bestResults.length > 0) {
            const resultList = document.createElement('ol');

            bestResults.forEach(result => {
                const resultItem = document.createElement('li');
                resultItem.textContent = `${result.playerName}: ${result.moves} moves in ${formatTime(result.time)}`;
                resultList.appendChild(resultItem);
            });
            result.innerHTML = '';
            result.appendChild(resultList);
        } else {
            resultTitle.textContent = 'Best result: No results yet';
        }
    }

    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    startButton.addEventListener('click', () => {
        modal.classList.add('hide');
        startTimer();
    });

    newGameButton.addEventListener('click', () => {
        modalWin.classList.add('hide');
        modal.classList.remove('hide');
        resetTimer();
        resetGame();
    });

    createBoard();
    displayBestResult();
})