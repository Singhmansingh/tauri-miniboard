<script lang="ts">
import { PlayState } from '../types/PlayState';
import {onDestroy} from 'svelte';

import {playState,disconnect} from './clientstore';
import YoutubePlayer from './lib/YoutubePlayer.svelte';



let playerurl:string; 

let pausePlayer:()=> void;
let resumePlayer:()=> void;
let setPlayerUrl:(e:string)=> void;

function onSetUrl(e:string){ setPlayerUrl(e);}

function onPause(){ pausePlayer(); }

function onResume(){ resumePlayer(); }

playState.subscribe(state => {
    switch(state){
        case PlayState.PLAYING: onResume(); break;
        case PlayState.PAUSED: onPause(); break;
    }
})

onDestroy(()=> disconnect());

</script>
<main>
    This is Client Svelte. URL: {playerurl}
    <YoutubePlayer bind:pause={pausePlayer} bind:resume={resumePlayer}/>
    <button on:click={disconnect}>Disconnect</button>
</main>