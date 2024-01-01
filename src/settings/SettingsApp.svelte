<script lang="ts">
import { onMount } from "svelte";
import type { Board } from "../main/types/Boards";
import SideBar from "./lib/SideBar.svelte";
import type { Track } from "../main/types/Track";
import { db,selectManytoMany } from "../main/db";


let boards:Array<Board> = [];

let currentBoard:Board|undefined;

var focusedboardid:number;
var focusedtrack:Track|null;

async function getBoards(){
    boards = await db.get('select * from boards order by active desc,boardkey',[]);
}


function onSelect(e:CustomEvent<number>){
    focusedboardid = e.detail;
    refreshBoardTrackList(focusedboardid);    
}

async function refreshBoardTrackList(boardid:number){
    tracks = await selectManytoMany('boardtracks','tracks','boardtracks.trackid=tracks.trackid','boardid',focusedboardid);
    currentBoard = boards.filter(b => b.boardid==focusedboardid)[0]
    fillEmptyTracks();

}

let tracks:Array<Track|null> = [];

onMount(async ()=>{
    await getBoards()
});

function fillEmptyTracks(){
    while(tracks.length<9){
        tracks.push(null)
    }
}

function selectTrack(trackid:number){
    focusedtrack=tracks.filter((t) => t?.trackid==trackid)[0];
}

async function updateTrack(trackid:number|undefined){

    let newtitle=(document.getElementById('tracktitle') as HTMLInputElement).value;
    let newurl=(document.getElementById('trackurl') as HTMLInputElement).value;
    let newimg=(document.getElementById('trackimg') as HTMLInputElement).value;

    await db.exec('update tracks set tracktitle=$1,trackurl=$2,trackimg=$3 where trackid=$4',[newtitle,newurl,newimg,trackid]);
    await getBoards();

    focusedboardid=currentBoard?.boardid??-1;
    refreshBoardTrackList(focusedboardid);


}

function newTrack(){
    (document.getElementById('tracktitle') as HTMLInputElement).value='';
    (document.getElementById('trackurl') as HTMLInputElement).value='';
    (document.getElementById('trackimg') as HTMLInputElement).value='';
    focusedboardid=-1;
    focusedtrack=null;



}

async function addTrack(boardid:number){
    let newtitle=(document.getElementById('tracktitle') as HTMLInputElement).value;
    let newurl=(document.getElementById('trackurl') as HTMLInputElement).value;
    let newimg=(document.getElementById('trackimg') as HTMLInputElement).value;

    await db.exec('insert into tracks(tracktitle,trackurl,trackimg) values($1,$2,$3)',[newtitle,newurl,newimg])

    let rs:Track = await db.first('select trackid from tracks order by trackid desc limit 1;',[]);
    let trackid=rs.trackid;
    
    await db.exec('insert into boardtracks(boardid,trackid) values($1,$2)',[boardid,trackid]);

    focusedboardid=boardid;
    refreshBoardTrackList(boardid);

    (document.getElementById('tracktitle') as HTMLInputElement).value='';
    (document.getElementById('trackurl') as HTMLInputElement).value='';
    (document.getElementById('trackimg') as HTMLInputElement).value='';
}

async function removeTrack(){
    let trackid = focusedtrack?.trackid
    let boardid = currentBoard?.boardid

    if(!trackid||!boardid) return console.log('failed to remove track from board');

    await db.exec('delete from boardtracks where trackid=$1 and boardid=$2',[trackid,boardid]);

    refreshBoardTrackList(boardid);

}

async function toggleActive(e:CustomEvent<{boardid:number,toactive:number}>){
    await db.exec('update boards set active=$1 where boardid=$2',[e.detail.toactive,e.detail.boardid]);
    await getBoards();
}

async function addBoard(e:CustomEvent<{boardname:string}>){
    await db.exec('insert into boards(boardname,boardkey) values ($1,$1)',[e.detail.boardname]);
    getBoards();
}

async function updateBoardTitle(){
    let boardid=currentBoard?.boardid;
    let newtitle=(document.getElementById('heading-title') as HTMLInputElement).value;

    await db.exec('update boards set boardname=$1 where boardid=$2',[newtitle,boardid]);
    await getBoards();

    focusedboardid=-1;
    await getBoards();

}

async function deleteBoard(){
    let boardid=currentBoard?.boardid;

    let oboard:Board =  await db.single('select * from boards where boardid=$1',[boardid]);

    if(!boardid||oboard.active) return console.log('failed to delete board. board is active');

    await db.exec('delete from boardtracks where boardid=$1',[boardid]);
    await db.exec('delete from boards where boardid=$1',[boardid]);

    await getBoards();
    focusedboardid=-1;
    currentBoard=undefined;

}

</script>

<main class="has-sidebar">
    <aside>
        <SideBar bind:boards={boards} on:addboard={addBoard} on:select={onSelect} focusedid={focusedboardid} on:toggleactive={toggleActive}/>
    </aside>
    <section>
        <div class="header">
            {#if currentBoard}
            <input placeholder="Board Name" id="heading-title" on:change={()=>updateBoardTitle()} class="heading" value={currentBoard?.boardname??''}>
            <button style="display: inline;" on:click={()=>deleteBoard()}>Delete</button>
            {/if}
        </div>

        <div class="track-grid">
            {#if currentBoard}
            {#each tracks as track }
                {#if track}    
                <button class="track {focusedtrack?.trackid==track.trackid?'focused':''}" 
                on:click={()=>{if(track)selectTrack(track.trackid)}}
                style="background-image: url({track.trackimg?track.trackimg:'https://i3.ytimg.com/vi/'+track.trackurl+'/mqdefault.jpg'});"
                ><div class="tint"></div><span>{track.tracktitle}</span></button>
            
                {:else}
                    <div tabindex="0" role="button" class="track empty" on:keydown={()=>{}} on:click={newTrack}><span>Add Track</span></div>
                {/if}
            {/each}
            {/if}

        </div>
        <div class="data">
                <label for="tracktitle">Title:</label><input id="tracktitle" value="{focusedtrack?.tracktitle??''}"/>
                <label for="trackurl">URL:</label><input id="trackurl" value="{focusedtrack?.trackurl??''}"/>
                <label for="trackurl">Image:</label><input id="trackimg" value="{focusedtrack?.trackimg??''}"/>
                {#if !focusedtrack}
                    <input type="button" value="add" on:click={()=> currentBoard?addTrack(currentBoard?.boardid):null}/>
                {:else}
                    <div class="button-controls">
                        <input type="button" value="save" on:click={()=> updateTrack(focusedtrack?.trackid)}/>
                        <input type="button" value="delete" on:click={()=> removeTrack()}/>

                    </div>

                {/if}
        </div>

    </section>


</main>

<style lang="scss">

    .header {

        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px 10px;
        .heading {
            margin: 0 !important;
            flex:1;
            margin:0;
            background: none;
            text-align: center;
            flex-shrink: 1;
            font-family: inherit;
            font-size: 1.5rem;
            color: white;
            margin-bottom: 10px;
            margin-top: 30px;
            border: none;
        }
        button {
            flex-shrink: 1;
            padding: 0;
            background: none;
            color: red;
            margin: 0;
        }
    }

  

    main {
        overflow-y: hidden;
        height: 100%;
        
    }
    .has-sidebar{
        display: grid;
        grid-template-columns: 250px 4fr;
        height: 100%;
        overflow: hidden;
    }

    aside {
        background-color: lightslategray;
    }

    section {
        display: grid;
        grid-template-rows: min-content 5fr min-content;

    }

    .data {
        background-color: rgba(112, 128, 144, 0.512);
        display: grid;
        padding: 5px;
        padding: 1em;
        grid-template-columns: min-content 1fr;
        gap:0.5em;
    }

    .track-grid {
        display: grid;
        grid-template-columns: repeat(3,1fr);
        grid-template-rows: repeat(3,1fr);
        padding:20px;
        box-sizing: border-box;
        gap: 20px;

        
    }

    .track {
        background-color: rgb(36, 42, 47);
        border-radius: 5px;
        font-family: inherit;
        font-size: 1.4rem;
        display: grid;
        align-items: center;
        text-align: center;
        color: inherit;
        border: none;
        background-size:cover;
        background-repeat:no-repeat;
        background-position: center;
        overflow: hidden;

        box-sizing: border-box;
        position: relative;

        &.focused {
            box-shadow: 0 0 10px 5px green !important;
        }

        &:hover {
            border: 2px solid white;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.375);

        }

        .tint {
            position: absolute;
            background-color: rgba(0, 0, 0, 0.8);
            width: 100%;
            height: 100%;
            z-index: 0;
            transition: border ease-out 50ms;
            
        }
        



        span {
            z-index: 3;
            pointer-events: none;
        }
    }

    .track.empty {
        background:rgba(0,0,0,0);
        border: 2px dashed white;

    }

    .button-controls {
        display: flex;
        gap: 0.2em;
        grid-column: span 2;
        input {
            flex-shrink: 1;
        }
    }

</style>