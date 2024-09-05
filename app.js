'use strict';

// DOM Elements
const numberbox = document.getElementById("numberbox");
const slider = document.getElementById("slider");
const progressBar = document.getElementById("progress-bar");
const playButton = document.getElementById('play-button');
const pauseButton = document.getElementById("pause-button");

// Queen icon
const queen = '<i class="fas fa-chess-queen" style="color:#000"></i>';

// Predefined number of solutions for different N values
let array = [0, 2, 1, 1, 3, 11, 5, 41, 93];

// Position storage
let pos = {};
let n, speed, tempSpeed, q, Board = 0;

// Initialize speed based on slider value
speed = (100 - slider.value) * 10;
tempSpeed = speed;

// Update speed when slider value changes
slider.oninput = function () {
    progressBar.style.width = this.value + "%";
    speed = slider.value;
    speed = (100 - speed) * 10;
}

// Queen class definition
class Queen {
    constructor() {
        this.position = {}; // Reset position for each Queen instance
        this.uuid = []; // Unique IDs for each board
    }

    // Start solving N-Queens
    async nQueen() {
        Board = 0;
        this.position[`${Board}`] = {};
        numberbox.disabled = true;
        await this.solveQueen(Board, 0, n); // Start solving from the first row
        numberbox.disabled = false;
    }

    // Recursive method to place queens
    async solveQueen(board, r, n) {
        if (r === n) {
            ++Board;
            let table = document.getElementById(`table-${this.uuid[Board]}`);
            for (let k = 0; k < n; ++k) {
                let row = table.firstChild.childNodes[k];
                row.getElementsByTagName("td")[this.position[board][k]].innerHTML = queen;
            }
            this.position[Board] = { ...this.position[board] }; // Clone the current position
            return;
        }

        for (let i = 0; i < n; ++i) {
            await this.delay();
            await this.clearColor(board);
            if (await this.isValid(board, r, i, n)) {
                await this.delay();
                await this.clearColor(board);
                let table = document.getElementById(`table-${this.uuid[board]}`);
                let row = table.firstChild.childNodes[r];
                row.getElementsByTagName("td")[i].innerHTML = queen;

                this.position[board][r] = i;

                if (await this.solveQueen(board, r + 1, n)) {
                    await this.clearColor(board);
                }

                await this.delay();
                board = Board;
                table = document.getElementById(`table-${this.uuid[board]}`);
                row = table.firstChild.childNodes[r];
                row.getElementsByTagName("td")[i].innerHTML = "-";

                delete this.position[`${board}`][`${r}`];
            }
        }
    }

    // Check if a queen can be placed safely at (row, col)
    async isValid(board, r, col, n) {
        const table = document.getElementById(`table-${this.uuid[board]}`);
        const currentRow = table.firstChild.childNodes[r];
        const currentColumn = currentRow.getElementsByTagName("td")[col];
        currentColumn.innerHTML = queen;
        await this.delay();

        // Check column
        for (let i = r - 1; i >= 0; --i) {
            const row = table.firstChild.childNodes[i];
            const column = row.getElementsByTagName("td")[col];
            if (column.innerHTML === queen) {
                column.style.backgroundColor = "#FB5607";
                currentColumn.innerHTML = "-";
                return false;
            }
            column.style.backgroundColor = "#ffca3a";
            await this.delay();
        }

        // Check upper-left diagonal
        for (let i = r - 1, j = col - 1; i >= 0 && j >= 0; --i, --j) {
            const row = table.firstChild.childNodes[i];
            const column = row.getElementsByTagName("td")[j];
            if (column.innerHTML === queen) {
                column.style.backgroundColor = "#FB5607";
                currentColumn.innerHTML = "-";
                return false;
            }
            column.style.backgroundColor = "#ffca3a";
            await this.delay();
        }

        // Check upper-right diagonal
        for (let i = r - 1, j = col + 1; i >= 0 && j < n; --i, ++j) {
            const row = table.firstChild.childNodes[i];
            const column = row.getElementsByTagName("td")[j];
            if (column.innerHTML === queen) {
                column.style.backgroundColor = "#FB5607";
                currentColumn.innerHTML = "-";
                return false;
            }
            column.style.backgroundColor = "#ffca3a";
            await this.delay();
        }
        return true;
    }

    // Clear colors from the board
    async clearColor(board) {
        for (let j = 0; j < n; ++j) {
            const table = document.getElementById(`table-${this.uuid[board]}`);
            const row = table.firstChild.childNodes[j];
            for (let k = 0; k < n; ++k) {
                (j + k) & 1
                    ? (row.getElementsByTagName("td")[k].style.backgroundColor = "#FF9F1C")
                    : (row.getElementsByTagName("td")[k].style.backgroundColor = "#FCCD90");
            }
        }
    }

    // Delay function for animation
    async delay() {
        await new Promise((done) => setTimeout(() => done(), speed));
    }
}

// Event handler for the play button
playButton.onclick = async function visualise() {
    const chessBoard = document.getElementById("n-queen-board");
    const arrangement = document.getElementById("queen-arrangement");

    n = parseInt(numberbox.value, 10); // Ensure n is an integer
    q = new Queen();

    if (n > 8) {
        numberbox.value = "";
        alert("Queen value is too large");
        return;
    } else if (n < 1) {
        numberbox.value = "";
        alert("Queen value is too small");
        return;
    }

    // Remove previous boards
    while (chessBoard.hasChildNodes()) {
        chessBoard.removeChild(chessBoard.firstChild);
    }
    if (arrangement.hasChildNodes()) {
        arrangement.removeChild(arrangement.lastChild);
    }

    // Display number of solutions
    const para = document.createElement("p");
    para.setAttribute("class", "queen-info");
    para.innerHTML = `For ${n}x${n} board, ${array[n] - 1} arrangements are possible.`;
    arrangement.appendChild(para);

    // Add new boards to the DOM
    if (chessBoard.childElementCount === 0) {
        for (let i = 0; i < array[n]; ++i) {
            q.uuid.push(Math.random()); // Generate unique IDs
            let div = document.createElement('div');
            let table = document.createElement('table');
            let header = document.createElement('h4');
            header.innerHTML = `Board ${i + 1} `;
            table.setAttribute("id", `table-${q.uuid[i]}`);
            header.setAttribute("id", `paragraph-${i}`);
            chessBoard.appendChild(div);
            div.appendChild(header);
            div.appendChild(table);
        }
    }

    // Initialize board cells
    for (let k = 0; k < array[n]; ++k) {
        let table = document.getElementById(`table-${q.uuid[k]}`);
        for (let i = 0; i < n; ++i) {
            const row = table.insertRow(i);
            row.setAttribute("id", `Row${i} `);
            for (let j = 0; j < n; ++j) {
                const col = row.insertCell(j);
                (i + j) & 1
                    ? (col.style.backgroundColor = "#FF9F1C")
                    : (col.style.backgroundColor = "#FCCD90");
                col.innerHTML = "-";
                col.style.border = "0.3px solid #373f51";
            }
        }
        await q.clearColor(k);
    }

    // Start solving the N-Queens problem
    await q.nQueen();
};
