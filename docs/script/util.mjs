let selectedNumber = null;
let currentSudokuSolution = [];

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isResume = urlParams.get('resume');

    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        setupHomePage();
    } else if (window.location.pathname.endsWith('game.html')) {
        if (isResume) {
            loadSavedGame();
        } else {
            const difficulty = localStorage.getItem('sudokuDifficulty');
            if (difficulty) {
                generateSudoku(difficulty);
            }
        }

        document.getElementById('generate-btn').addEventListener('click', () => {
            const difficulty = localStorage.getItem('sudokuDifficulty');
            if (difficulty) {
                generateSudoku(difficulty);
            }
        });

        setupNumberButtons();
    }
});

function setupHomePage() {
    document.querySelectorAll('.new-game').forEach(button => {
        button.addEventListener('click', (event) => {
            const difficulty = event.target.getAttribute('data-difficulty');
            localStorage.setItem('sudokuDifficulty', difficulty);
            window.location.href = 'game.html';
        });
    });

    const resumeButton = document.getElementById('resume-game');
    if (localStorage.getItem('savedSudoku')) {
        resumeButton.addEventListener('click', () => {
            window.location.href = 'game.html?resume=true';
        });
    } else {
        resumeButton.disabled = true;
    }
}

async function generateSudoku(difficulty) {
    try {
        const response = await fetch('https://sudoku-api.vercel.app/api/dosuku?query={newboard(limit:5){grids{value,solution,difficulty},results,message}}');
        const data = await response.json();

        const sudokuGrid = data.newboard.grids.find(grid => grid.difficulty.toLowerCase() === difficulty);
        if (!sudokuGrid) {
            throw new Error(`No ${difficulty} puzzle found`);
        }

        currentSudokuSolution = sudokuGrid.solution; // Save the solution for later validation

        const container = document.getElementById('sudoku-container');
        container.innerHTML = ''; // Clear previous grid

        sudokuGrid.value.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellElement = document.createElement('div');
                cellElement.classList.add('cell');
                cellElement.textContent = cell !== 0 ? cell : ''; // Display number or empty cell

                if (cell !== 0) {
                    cellElement.classList.add('locked'); // Mark pre-generated cells as locked
                } else {
                    cellElement.addEventListener('click', () => handleCellClick(cellElement, rowIndex, colIndex));
                }

                container.appendChild(cellElement);
            });
        });

        saveGame(sudokuGrid.value);
    } catch (error) {
        console.error('Error generating Sudoku:', error);
    }
}

function setupNumberButtons() {
    const numberButtonsContainer = document.getElementById('number-buttons');
    numberButtonsContainer.innerHTML = ''; // Clear previous buttons

    for (let i = 1; i <= 9; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.addEventListener('click', () => handleNumberButtonClick(i));
        numberButtonsContainer.appendChild(button);
    }

    const eraserButton = document.createElement('button');
    eraserButton.textContent = 'Eraser';
    eraserButton.addEventListener('click', handleEraserButtonClick);
    numberButtonsContainer.appendChild(eraserButton);
}

function handleNumberButtonClick(number) {
    selectedNumber = number;
    console.log(`Selected number: ${number}`);
}

function handleEraserButtonClick() {
    selectedNumber = '';
    console.log('Selected eraser');
}

function handleCellClick(cellElement, rowIndex, colIndex) {
    if (selectedNumber !== null) {
        cellElement.textContent = selectedNumber;

        if (selectedNumber !== currentSudokuSolution[rowIndex][colIndex] && selectedNumber !== '') {
            cellElement.classList.add('incorrect');
        } else {
            cellElement.classList.remove('incorrect');
        }

        console.log(`Assigned number ${selectedNumber} to cell at row ${rowIndex}, column ${colIndex}`);
    }
}

function saveGame(sudokuGrid) {
    localStorage.setItem('savedSudoku', JSON.stringify(sudokuGrid));
}

function loadSavedGame() {
    const savedSudoku = JSON.parse(localStorage.getItem('savedSudoku'));

    if (savedSudoku) {
        const container = document.getElementById('sudoku-container');
        container.innerHTML = ''; // Clear previous grid

        savedSudoku.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellElement = document.createElement('div');
                cellElement.classList.add('cell');
                cellElement.textContent = cell !== 0 ? cell : ''; // Display number or empty cell

                if (cell !== 0) {
                    cellElement.classList.add('locked'); // Mark pre-generated cells as locked
                } else {
                    cellElement.addEventListener('click', () => handleCellClick(cellElement, rowIndex, colIndex));
                }

                container.appendChild(cellElement);
            });
        });
    } else {
        console.error('No saved game found');
    }
}
