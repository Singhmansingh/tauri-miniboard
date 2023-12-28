<script lang="ts">
import { PlayState } from '../types/PlayState';
import {onDestroy,onMount} from 'svelte';

import {playState,disconnect, url} from './clientstore';
import YoutubePlayer from './lib/YoutubePlayer.svelte';

let playerurl:string; 

let pausePlayer:()=> void;
let resumePlayer:()=> void;
let setPlayerUrl:(url:string)=>void;

function onPause(){ pausePlayer(); }

function onResume(){ resumePlayer(); }

function onSetUrl(url:string){ setPlayerUrl(url); }

playState.subscribe(state => {
    switch(state){
        case PlayState.PLAYING: onResume(); break;
        case PlayState.PAUSED: onPause(); break;
    }
})

onMount(()=>{
    url.subscribe(u => {
        playerurl = u;
        onSetUrl(u);    
    })
})


onDestroy(()=> disconnect());

</script>
<main>
    This is Client Svelte. URL: <a href="https://youtu.be/{playerurl}" target="_blank">https://youtu.be/{playerurl}</a>
    <YoutubePlayer bind:pause={pausePlayer} bind:resume={resumePlayer} bind:setUrl={setPlayerUrl}/>
    <button on:click={disconnect}>Disconnect</button>
</main>