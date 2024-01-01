<script lang="ts">
import { appWindow } from '@tauri-apps/api/window'
import {loopAudio} from '../store';
    import { sendLoopState } from '../ws';
    import { WebviewWindow } from '@tauri-apps/api/window'
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
      <img
        src="https://api.iconify.design/mdi:gear.svg"
        alt="minimize"
      />
    </div>
    <div tabindex="-1" class="titlebar-button" role="button" id="titlebar-external" title="loop audio" on:keydown={e => {if(e.key=='Enter') toggleLoopAudio();}} on:click={toggleLoopAudio}>
      {#if audioLoop}
        <img
          src="https://api.iconify.design/mdi:repeat.svg?color=green"
          alt="minimize"
        />
      {:else}
        <img
          src="https://api.iconify.design/mdi:repeat.svg?color=red"
          alt="minimize"
        />
      {/if}
    </div>
    {#if playerConnected}
    <div class="titlebar-button" style="pointer-events: none !important;" role="button" id="titlebar-external" title="player connected">
      <img
        src="https://api.iconify.design/mdi:volume.svg?color=green"
        alt="minimize"
      />
    </div>
    {/if}
  </div>
  
    <a tabindex="0" class="titlebar-button" role="button" id="titlebar-minimize" on:keydown={(e)=>e.key=="Enter"?minimize():null} on:click={minimize}>
      <img
        src="https://api.iconify.design/mdi:window-minimize.svg"
        alt="minimize"
      />
    </a>
    <a tabindex="0" class="titlebar-button" role="button" on:keydown={(e)=>e.key=="Enter"?maximize():null} id="titlebar-maximize" on:click={maximize}>
      <img
        src="https://api.iconify.design/mdi:window-maximize.svg"
        alt="maximize"
      />
    </a>
    <a tabindex="0" class="titlebar-button" role="button" id="titlebar-close" on:keydown={(e)=>e.key=="Enter"?close():null}  on:click={close}>
      <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
    </a>
  </div>