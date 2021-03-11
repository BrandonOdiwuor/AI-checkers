<template>
  <div class="board">
    <div v-for="(row, rowIndex) in position.board" :key="rowIndex">
      <div
        v-for="(cell, columnIndex) in row"
        :key="columnIndex"
        class="cell"
        :class="{
          activeCell: cell[0],
          selectedCell: cell[2]
        }"
        @click="selectCell(rowIndex, columnIndex)"
      >
        <div
          class="piece"
          :class="{
            isRed: cell[0] && cell[1] && cell[1][0] === 1,
            isBlack: cell[0] && cell[1] && cell[1][0] === -1
          }"
        >
          <!-- {{ rowIndex }}, {{ columnIndex }} -->
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, ref, Ref } from "vue";
import { Piece, Position } from "../utils/types";
import { generateBoard, movePiece, moveIsValid } from "../utils/checkers";
export default {
  setup() {
    let position: Position = reactive({
      board: generateBoard(8, 8, 12),
      currentPlayer: 1,
      captures: [0, 0]
    });
    // let board: Board = reactive(generateBoard(8, 8, 12));
    const [selectedRow, selectedColumn]: [Ref<number>, Ref<number>] = [
      ref(-1),
      ref(-1)
    ];

    function selectCell(row: number, column: number) {
      if (selectedRow.value >= 0 && selectedColumn.value >= 0) {
        if (row === selectedRow.value && column === selectedColumn.value) {
          [selectedRow.value, selectedColumn.value] = [-1, -1];
          position.board[row][column][2] = false;
        } else if (
          moveIsValid(
            position,
            [selectedRow.value, selectedColumn.value],
            [row, column]
          )
        ) {
          position = movePiece(
            position,
            [selectedRow.value, selectedColumn.value],
            [row, column]
          );
          console.log(
            "current player: ",
            position.currentPlayer === 1 ? "white" : "black"
          );
          [selectedRow.value, selectedColumn.value] = [-1, -1];
        }
      } else {
        if (
          position.board[row][column][0] &&
          position.board[row][column][1] &&
          (position.board[row][column][1] as Piece)[0] ===
            position.currentPlayer
        ) {
          [selectedRow.value, selectedColumn.value] = [row, column];
          position.board[row][column][2] = true;
        }
      }
    }

    return { position, selectCell };
  }
};
</script>
