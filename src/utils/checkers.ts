import { Piece, Board, Position, Move } from "./types";

const MAX_DEPTH = 8;

const terminal = (position: Position, depth: number): boolean => {
  if (
    depth === MAX_DEPTH ||
    position.captures[0] === 12 ||
    position.captures[1] === 12
  )
    return true;

  return false;
};

const terminalValue = (position: Position): number => {
  let value = 0;
  position.board.forEach(row => {
    row.forEach(cell => {
      if (cell[0] && cell[1]) {
        value +=
          cell[1][0] === position.currentPlayer
            ? cell[1][1]
              ? 5
              : 3
            : cell[1][1]
            ? -5
            : -3;
      }
    });
  });
  return value;
};

const successors = (
  board: Board,
  [row, column]: [number, number]
): [number, number][] => {
  const L: [number, number][] = [];
  const cell = board[row][column];
  if (cell[0] && cell[1]) {
    const player: number = cell[1][0];
    if (row + player >= 0 && row + player <= 7) {
      // Normal piece successors
      if (column - 1 >= 0) L.push([row + player, column - 1]);
      if (column + 1 <= 7) L.push([row + player, column + 1]);
    }
    if (cell[1][1]) {
      // Additional King piece successors
      if (row - player >= 0 && row - player <= 7) {
        if (column - 1 >= 0) L.push([row - player, column - 1]);
        if (column + 1 <= 7) L.push([row - player, column + 1]);
      }
    }
  }
  return L;
};

const getCaptureMove = (
  board: Board,
  [row, column]: [number, number],
  [successorRow, successorColumn]: [number, number]
): [number, number][] => {
  const move: [number, number][] = [];

  move.push([
    row + 2 * (successorRow - row),
    column + 2 * (successorColumn - column)
  ]);

  /*
        Todo: Multiple Jump moves
    
        board[jumpRow][jumpColumn] = board[row][column]; // Move piece to jump grid
        board[row][column] = [true, null];
        board[successorRow][successorColumn] = [true, null]; // Capture oponents piece
    
        successors(board, [jumpRow, jumpColumn]).forEach(successor => {
            if (isJump(board, jumpRow, jumpColumn,[successor[0], successor[1]])) {
                L.push(...jumpMove(board, jumpRow, jumpColumn,[successor[0], successor[1]]))
            }
        })
        */

  return move;
};

/**
 * Determines whether a move from [row, column] to [moveRow, moveColumn]
 * is a valid Jump move
 * @param {Board} board - current board state
 * @param {number} row - The row with the piece to be moved
 * @param {number} column - The column with the piece to be moved
 * @param {number} moveRow - Target row
 * @param {number} moveColumn - Target column
 * @returns a boolean indicating if the move is valid jumpmove
 */
const isCaptureMove = (
  board: Board,
  [row, column]: [number, number],
  [moveRow, moveColumn]: [number, number]
): boolean => {
  if (
    board[row][column][0] &&
    board[row][column][1] != null &&
    board[moveRow][moveColumn][0] &&
    !board[moveRow][moveColumn][1]
  ) {
    const playerPiece = board[row][column][1] as Piece;
    const [captureRow, captureColumn]: [number, number] = [
      (moveRow + row) / 2,
      (moveColumn + column) / 2
    ];
    if (
      row + 2 * playerPiece[0] === moveRow &&
      Math.abs(moveColumn - column) == 2 &&
      board[captureRow][captureColumn][0] &&
      board[captureRow][captureColumn][1] != null
    ) {
      const opponentPiece = board[captureRow][captureColumn][1] as Piece;
      return playerPiece[0] != opponentPiece[0];
    }
  }
  return false;
};

const FindMoveList = (
  board: Board,
  [row, column]: [number, number]
): Move[] => {
  const moves: Move[] = [];

  if (board[row][column][0] && board[row][column][1]) {
    successors(board, [row, column]).forEach(successor => {
      if (isCaptureMove(board, [row, column], successor)) {
        moves.push(
          getCaptureMove(board, [row, column], successor).map(captureMove => [
            [...captureMove],
            true
          ])
        );
      }

      if (
        board[successor[0]][successor[1]][0] &&
        !board[successor[0]][successor[1]][1]
      ) {
        moves.push([[[...successor], false]]);
      }
    });
  }
  return moves;
};

/**
 * Generates the resulting Board position from the Jump move
 * @param position - Original Game state (board position)
 * @param {number} row - The row with the piece to be moved
 * @param {number} column - The column with the piece to be moved
 * @param {number} move - Move to execute
 * @returns new Board positon after executing the jump move
 */
const positionFromCaptureMove = (
  position: Position,
  [row, column]: [number, number],
  move: Move
): Position => {
  const miniMove = move.shift();
  if (miniMove) {
    const [[captureRow, captureColumn]]: [[number, number], boolean] = miniMove;
    const piece: Piece = position.board[row][column][1] as Piece;
    if (captureRow === 7) piece[1] = true; // Crowning king piece
    position.board[captureRow][captureColumn] = [true, piece]; // Move piece to capture cell
    position.board[row][column] = [true, null];
    position.board[(row + captureRow) / 2][(column + captureColumn) / 2] = [
      true,
      null
    ]; // Remove oppnent piece
    if (position.currentPlayer === 1) {
      position.captures[0] += 1;
    } else {
      position.captures[1] += 1;
    }
    return positionFromCaptureMove(position, [captureRow, captureColumn], move);
  } else {
    return position;
  }
};

/**
 * Computes the resulting Board Position(Game state) from proposed move
 * @param {Position} position - current game state
 * @param {number} row - The row with the piece to be moved
 * @param {number} column - The column with the piece to be moved
 * @param {number} move - Move to execute
 * @returns a new Board position after executing the move
 */
const positionFromMove = (
  position: Position,
  [row, column]: [number, number],
  move: Move
): Position => {
  if (
    position.board[row][column][0] &&
    position.board[row][column][1] &&
    (position.board[row][column][1] as Piece)[0] === position.currentPlayer
  ) {
    if (move[0][1]) {
      position = positionFromCaptureMove(position, [row, column], move);
    } else {
      const [moveRow, moveColumn]: [number, number] = [
        move[0][0][0],
        move[0][0][1]
      ];
      const piece: Piece = position.board[row][column][1] as Piece;
      if (moveRow === 7) piece[1] = true; // Crowning king piece
      position.board[moveRow][moveColumn] = [true, piece];
      position.board[row][column] = [true, null];
    }
    position.currentPlayer = position.currentPlayer === 1 ? -1 : 1;
  }
  return position;
};

const legalPositionsFrom = (position: Position): Position[] => {
  const positions: Position[] = [];
  position.board.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      if (cell[0] === false || !cell[1] || cell[1][0] != position.currentPlayer)
        return;
      const moves = FindMoveList(position.board, [rowIndex, columnIndex]);
      moves.forEach(move =>
        positions.push(
          positionFromMove(position, [rowIndex, columnIndex], move)
        )
      );
    });
  });
  return positions;
};

type MinMax = (
  position: Position,
  alpha: number,
  beta: number,
  maximizingPlayer: 1 | -1,
  depth: number
) => number;
const minMax: MinMax = (position, alpha, beta, maximizingPlayer, depth) => {
  if (terminal(position, depth)) return terminalValue(position);

  const successorPositions: Position[] = legalPositionsFrom(position);

  if (position.currentPlayer === maximizingPlayer) {
    successorPositions.forEach(successorPosition => {
      alpha = Math.max(
        alpha,
        minMax(successorPosition, alpha, beta, maximizingPlayer, depth + 1)
      );
      if (alpha >= beta) return alpha;
    });
    return alpha;
  } else {
    successorPositions.forEach(successorPosition => {
      beta = Math.min(
        beta,
        minMax(successorPosition, alpha, beta, maximizingPlayer, depth + 1)
      );
      if (beta <= alpha) return beta;
    });
    return beta;
  }
};

const Max = (positions: Position[], valueFunction: MinMax): Position | null => {
  let [bestPosition, bestVal]: [Position | null, number] = [null, -Infinity];
  positions.forEach(position => {
    const value = valueFunction(
      position,
      -Infinity,
      Infinity,
      position.currentPlayer,
      0
    );
    if (value > bestVal) [bestPosition, bestVal] = [position, value];
  });
  return bestPosition;
};

export const chosenPosition = (position: Position) =>
  Max(legalPositionsFrom(position), minMax);

export const generateBoard = (
  rows: number,
  columns: number,
  playerPieces: number
): Board => {
  const board: Board = [];
  const piecesFilledRows = (playerPieces * 2) / rows;
  for (let row = 0; row < rows; row++) {
    board[row] = [];
    for (let column = 0; column < columns; column++) {
      if (
        (row % 2 === 0 && column % 2 === 0) ||
        (row % 2 != 0 && column % 2 != 0)
      ) {
        if (row < piecesFilledRows) {
          board[row][column] = [true, [1, false]];
        } else if (row >= rows - piecesFilledRows) {
          board[row][column] = [true, [-1, false]];
        } else {
          board[row][column] = [true, null];
        }
      } else {
        board[row][column] = [false, null];
      }
    }
  }
  return board;
};

/**
 * Generates a move and the resulting Board position from
 * the move {[row, column] to [moveRow, moveColumn]}
 * @param position - The state of the Game
 * @param {number} row - The row with the piece to be moved
 * @param {number} column - The column with the piece to be moved
 * @param {number} moveRow - Target row
 * @param {number} moveColumn - Target column
 * @returns new Board position from the move
 */
export const movePiece = (
  position: Position,
  [row, column]: [number, number],
  [moveRow, moveColumn]: [number, number]
): Position => {
  const move: Move = isCaptureMove(
    position.board,
    [row, column],
    [moveRow, moveColumn]
  )
    ? [[[moveRow, moveColumn], true]]
    : [[[moveRow, moveColumn], false]];
  return positionFromMove(position, [row, column], move);
};

/**
 * Checks whether a move from [row, column] to [moveRow, moveColumn] is valid
 *
 * @param {object} position - Current state of the board
 * @param {number} row - The row with the piece to be moved
 * @param {number} column - The column with the piece to be moved
 * @param {number} moveRow - Target row
 * @param {number} moveColumn - Target column
 *
 * @returns Boolean idicating whether a move from
 * [row, column] to [moveRow, moveColumn] is valid
 */
export const moveIsValid = (
  position: Position,
  [row, column]: [number, number],
  [moveRow, moveColumn]: [number, number]
): boolean => {
  if (position.board[row][column][0] && position.board[row][column][1]) {
    if (
      (position.board[row][column][1] as Piece)[0] === position.currentPlayer
    ) {
      if (Math.abs(moveRow - row) == 1 && Math.abs(moveColumn - column) == 1) {
        return (
          position.board[moveRow][moveColumn][0] &&
          !position.board[moveRow][moveColumn][1]
        );
      }
      if (isCaptureMove(position.board, [row, column], [moveRow, moveColumn])) {
        return true;
      }
    }
  }
  return false;
};
