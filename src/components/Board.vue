<template>
  <div>
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
              isWhite: cell[0] && cell[1] && cell[1][0] === 1,
              isBlack: cell[0] && cell[1] && cell[1][0] === -1
            }"
          >
            {{ rowIndex }}, {{ columnIndex }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, ref, Ref } from "vue";
import { Position } from "../utils/types";
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
        if (
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
        }
        [selectedRow.value, selectedColumn.value] = [-1, -1];
      } else {
        [selectedRow.value, selectedColumn.value] = [row, column];
        position.board[row][column][2] = true;
      }
    }

    return { position, selectCell };
  }
};
</script>

<style>
.activeCell {
  background-color: gray;
}
.board {
  display: grid;
  grid-template-columns: auto auto auto auto auto auto auto auto;
  justify-content: center;
}

.board > div {
  /* border: 1px solid #777; */
  /* box-shadow: 0 10px 6px -6px #777; */
  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);
}

.cell {
  padding: 1em;
}

.piece {
  height: 2.5em;
  width: 2.5em;
  border-radius: 50%;
  /* background-color: black; */
}

.isWhite {
  background-color: white;
  box-shadow: 0 1.5px 3px black;
}

.isBlack {
  background-color: black;
  box-shadow: 0 1.5px 3px white;
}

.selectedCell {
  background-color: green;
}
</style>
