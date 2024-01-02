<script lang="ts">
import { appWindow } from '@tauri-apps/api/window'
import {loopAudio} from '../store';
    import { sendLoopState } from '../ws';
    import { WebviewWindow } from '@tauri-apps/api/window'
import {shell} from '@tauri-apps/api';
export var playerConnected:number = 0;
let audioLoop:number = 0;

loopAudio.subscribe((l) => audioLoop = l);

function minimize(){
    appWindow.minimize();
}

function maximize(){
    appWindow.toggleMaximize();
}

function close(){
    appWindow.close();
}

function openClient(){
  shell.open('http://localhost:1420/client.html')
}

function toggleLoopAudio(){
  loopAudio.update(()=>{
    if(audioLoop==0) return 1;
    else return 0
  });

  sendLoopState(audioLoop);

}




function openSettings(){
  const webview = new WebviewWindow('theUniqueLabel', {
  url: 'settings.html',
})
  console.log('openning settings')
  webview.once('tauri://created', function () {
  // webview window successfully created
})

webview.once('tauri://error', function (e) {
  // an error occurred during webview window creation
  console.log(e);
})
}

</script>

<div data-tauri-drag-region class="titlebar">
  <div class="left">
    <div tabindex="-1" class="titlebar-button" role="button" id="titlebar-external" title="settings" on:keydown={e => {if(e.key=='Enter') openSettings();}} on:click={openSettings}>
      <i class="fa-solid fa-gear"></i>
    </div>
    <div tabindex="-1" class="titlebar-button" role="button" id="titlebar-external" title="loop audio" on:keydown={e => {if(e.key=='Enter') toggleLoopAudio();}} on:click={toggleLoopAudio}>
      <i class="fa-solid fa-repeat {audioLoop?'on':'off'}"></i>
    </div>
    <div tabindex="-1" class="titlebar-button" role="button" id="titlebar-external" title="player connected" on:keydown={e => {if(e.key=='Enter') openClient();}} on:click={openClient}>
    {#if playerConnected}
      <i class="fa-solid fa-tower-broadcast on"></i>
    {:else}
      <i class="fa-solid fa-tower-broadcast off"></i>
    {/if}
    
    </div>
  </div>
  
    <a tabindex="0" class="titlebar-button" role="button" id="titlebar-minimize" on:keydown={(e)=>e.key=="Enter"?minimize():null} on:click={minimize}>
      <i class="fa-solid fa-minus"></i>
    </a>
    <a tabindex="0" class="titlebar-button" role="button" on:keydown={(e)=>e.key=="Enter"?maximize():null} id="titlebar-maximize" on:click={maximize}>
      <i class="fa-regular fa-square"></i>
    </a>
    <a tabindex="0" class="titlebar-button" role="button" id="titlebar-close" on:keydown={(e)=>e.key=="Enter"?close():null}  on:click={close}>
      <i class="fa-solid fa-xmark"></i>
    </a>
  </div>

  <style lang="scss">

    i {
      color: black;
      font-size: 0.7em;
      &:hover {
        cursor: pointer;
      }
    }

    .on {
      color: green;
    }
    .off {
      color: black;
    }
  </style>