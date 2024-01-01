<script lang="ts">
import type { Options, YouTubePlayer } from 'youtube-player/dist/types';

import YoutubePlayer from "youtube-player";
import { onMount } from 'svelte';

import {loop} from '../clientstore';

let currentURL:string;
let playerElem:any;
let player:YouTubePlayer;
let loopState:number=1;

loop.subscribe(l => loopState=l);

onMount(() => createPlayer());

const options:Options = {
//  see https://developers.google.com/youtube/player_parameters
playerVars: {
    autoplay: 1,
    controls: 0,
    
}
};

export const setUrl = (url:string) => {
    if(player) player.loadVideoById(url);
}


function createPlayer(){
player = YoutubePlayer(playerElem,options);
player.on('stateChange',onstatechange)
}

function resetVideo(){
    if(loopState){
        player.seekTo(0,false);
        resume();
    }

}


export const pause = () => { player.pauseVideo(); }
export const resume = () => { player.playVideo(); }

export function onstatechange(event:{target:any,data:number}){
console.log(event);
switch(event.data){
    case 0:
        resetVideo();
    break;
}

}
</script>

<div>
    <div id="player" bind:this={playerElem}></div>
    </div>
    