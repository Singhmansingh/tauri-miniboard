<script lang="ts">
import type { Options, YouTubePlayer } from 'youtube-player/dist/types';

import YoutubePlayer from "youtube-player";
import { onMount } from 'svelte';
import {playState,loopAudio} from '../store';
import {PlayState} from '../types/PlayState';

export var hasPlayer:number;

  let playerElem:any;
  let player:YouTubePlayer;
  let islooped:number;

  onMount(() => {
    createPlayer();
    loopAudio.subscribe(l => islooped=l);
  });

  const options:Options = {
    //  see https://developers.google.com/youtube/player_parameters
    playerVars: {
      autoplay: 1,
    }
  };

  function createPlayer(){
    player = YoutubePlayer(playerElem,options);
    player.on('stateChange',onstatechange)
  }

  function resetVideo(){
    if(islooped){
      player.seekTo(0,false);
      resume();
    }
    else {
      playState.update(()=> PlayState.STOPPED);
    }

  }

  export function setUrl(e:CustomEvent<string>){
    player.loadVideoById(e.detail);
 
  }

  export const pause = () => { player.pauseVideo(); }
  export const resume = () => { player.playVideo(); }

  export function onstatechange(event:{target:any,data:number}){
    console.log(event);
    switch(event.data){
      case PlayState.STOPPED:
          resetVideo();
      break;
    }

    playState.set(event.data);

    if(hasPlayer) player.setVolume(0);
    else player.setVolume(100);
  }
</script>

<div style="display:none;">
    <div id="player" bind:this={playerElem}></div>
  </div>
