// Einfaches Sudoku-Grid mit Beispielzahlen
const sudoku = [
  [5, 3, '', '', 7, '', '', '', ''],
  [6, '', '', 1, 9, 5, '', '', ''],
  ['', 9, 8, '', '', '', '', 6, ''],
  [8, '', '', '', 6, '', '', '', 3],
  [4, '', '', 8, '', 3, '', '', 1],
  [7, '', '', '', 2, '', '', '', 6],
  ['', 6, '', '', '', '', 2, 8, ''],
  ['', '', '', 4, 1, 9, '', '', 5],
  ['', '', '', '', 8, '', '', 7, 9]
];

function createSudokuGrid(board) {
  const table = document.createElement('table');
  table.className = 'sudoku-grid';
  for (let r = 0; r < 9; r++) {
    const tr = document.createElement('tr');
    for (let c = 0; c < 9; c++) {
      const td = document.createElement('td');
      td.textContent = board[r][c];
      if (board[r][c] !== '') td.className = 'fixed';
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  return table;
}

const app = document.getElementById('app');
app.innerHTML = '';
app.appendChild(createSudokuGrid(sudoku));
