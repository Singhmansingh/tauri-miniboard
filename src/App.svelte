<script lang="ts">
import Board from './lib/Board.svelte'
import Titlebar from './lib/Titlebar.svelte';
import YoutubePlayer from './lib/YoutubePlayer.svelte'
import {connect,sendURL,sendState,playerConnected} from './ws';

connect();

let playerIsConnected:number;

playerConnected.subscribe((v)=>playerIsConnected=v);

let pausePlayer:()=> void;
let resumePlayer:()=> void;
let setPlayerUrl:(e:CustomEvent<string>)=> void;

function onSetUrl(e:CustomEvent<string>){ setPlayerUrl(e); sendState(3); sendURL(e.detail);}

function onPause(){ pausePlayer(); sendState(2); }

function onResume(){ resumePlayer(); sendState(1); }




</script>

<main class="container">
  
  <Titlebar playerConnected={playerIsConnected}/>

  <div class="row">
      <Board on:seturl={onSetUrl} on:pause={onPause} on:resume={onResume}/>    
    <YoutubePlayer bind:pause={pausePlayer} bind:resume={resumePlayer} bind:setUrl={setPlayerUrl} bind:hasPlayer={playerIsConnected}/>
  </div>
</main>
