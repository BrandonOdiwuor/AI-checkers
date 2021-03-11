/**
 * @typedef {1 | -1} Player - Represents the players in the Game
 * 1 for the Human Player and -1 for the computer Player
 */
type Player = 1 | -1;

/**
 * @typedef {[Player, boolean]} Piece - Represents the pieces on the checkers board
 * @member {Player} Player - The player who owns the piece
 * @member {boolean} isKing - Indicates whether the piece has been crowned
 */
type Piece = [Player, boolean];

/**
 * @typedef {[boolean, Piece | null]} Cell - Represents a cell on the checkers board
 * @member {boolean} validCell - a boolean indicating whether the cell is blocked(false) or playable(true)
 * @member {Piece | null} - Indicates whether a cell contains a Piece or isEmpty(null)
 * @member {boolean} isSelected - a boolean indicating whether a cell has been selected
 */
type Cell = [boolean, Piece | null, boolean];

/**
 * @typedef {Cell[][]} Board - Reperesent a checkers board
 */
type Board = Cell[][];

/**
 * @typedef {Array.<[row: number, column: number], isJump: boolean>} -Reperesents a Player move
 */
type Move = [[number, number], boolean][];

/**
 * @interface - Represents the current state of the Board
 */
interface Position {
  /**
   * @property {} Board - The board with the current positioning of Pieces
   */
  board: Board;

  /**
   * @property {} currentPlayer - The player to make the move in the current turn
   */
  currentPlayer: Player;

  /**
   * @property {} captures - The total number of captures by each Player
   */
  captures: [number, number];
}

export { Piece, Board, Move, Position };
