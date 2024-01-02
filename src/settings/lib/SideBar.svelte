<script lang="ts">
import type {Board} from "../../main/types/Boards";
import {createEventDispatcher} from 'svelte';

export var boards:Array<Board>;
export let focusedid:number;

const dispatch = createEventDispatcher();

function selectBoard(boardid:number){
    dispatch('select',boardid);
}

async function toggleActive(boardid:number,active:boolean){
    let toactive=active?0:1;
    dispatch('toggleactive',{toactive,boardid})

}

function addBoard(){
    dispatch('addboard',{boardname:`Board ${boards.length}`});
}

</script>

<div class="content">
<h1>Soundboards</h1>
<div class="searchbar"></div>
<button on:click={addBoard} class="add">+ Add new Soundboard</button>
<div class="board-list">
{#each boards as board,i}
    <!-- svelte-ignore a11y-missing-attribute -->
    <a id={`board-${board.boardid}`} tabindex="0" role="button" class="board-card {board.boardid==focusedid?'focused':''}" on:click={()=>selectBoard(board.boardid)} on:keydown={(e)=> {if(e.key=='Enter')selectBoard(board.boardid)}}>
        <h3>{board.boardname}</h3>
        <input tabindex="-1" type="checkbox" checked="{board.active}" on:click={(e)=> {e.preventDefault(); toggleActive(board.boardid,board.active)}}>
    </a>
{/each}
</div>

</div>

<style lang="scss">
    
.content {
    padding:20px;
    text-align: left;

    h1 {
        margin-top: 0;
    }

    * {
        text-align: left;
    }

    overflow-y: auto;
    max-height: 100vh;



}

button.add {
    padding: 0;
    background: none;
    color: springgreen;
    box-shadow: none;
}

.board-list {
    display: grid;
    grid-template-columns: 1fr;
    row-gap: 10px;
    margin-top: 10px;
}

.board-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.059);
    border-radius: 5px;
    align-items: center;
    padding: 15px;
    color: white;
    box-sizing: border-box;
    &:hover{
        cursor: pointer;
    }
    h3 {

        margin:0;
        font-size: 1em;
    }
    input {
        margin:0;
    }

    &.focused {
        $green:rgb(0, 255, 47);
        box-shadow: 0 0 10px $green;
        border: 3px  ridge $green;
    }
}

input[type="checkbox"]:checked {
    background-color: springgreen;
}
</style>

