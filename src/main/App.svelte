<script lang="ts">
import { onMount } from 'svelte';
import type {Board} from './types/Boards';
import SBoard from './lib/Board.svelte'
import Titlebar from './lib/Titlebar.svelte';
import YoutubePlayer from './lib/YoutubePlayer.svelte'
import {connect,sendURL,sendState,playerConnected} from './ws';
import { cBoard, getActiveBoards, page } from './store';

let playerIsConnected:number;
let cboard:Board;

let pausePlayer:()=> void;
let resumePlayer:()=> void;
let setPlayerUrl:(e:CustomEvent<string>)=> void;

function onSetUrl(e:CustomEvent<string>){ setPlayerUrl(e); sendState(3); sendURL(e.detail);}

function onPause(){ pausePlayer(); sendState(2); }

function onResume(){ resumePlayer(); sendState(1); }

onMount(()=>{
  connect();
  playerConnected.subscribe((v)=>playerIsConnected=v);
  cBoard.subscribe(b => cboard=b);
})


</script>

<main class="container">
  
  <Titlebar playerConnected={playerIsConnected}/>

  <div class="row">
      <SBoard on:seturl={onSetUrl} on:pause={onPause} on:resume={onResume}/>    
    <YoutubePlayer bind:pause={pausePlayer} bind:resume={resumePlayer} bind:setUrl={setPlayerUrl} bind:hasPlayer={playerIsConnected}/>
  </div>

  <div class="row shrink">
    {cboard?.boardname??''}
  </div>
</main>
