<script lang="ts">
import { appWindow } from '@tauri-apps/api/window'

export var playerConnected:number = 0;

function minimize(){
    appWindow.minimize();
}

function maximize(){
    appWindow.toggleMaximize();
}

function close(){
    appWindow.close();
}
</script>

<div data-tauri-drag-region class="titlebar">
  {#if playerConnected}
  <div class="titlebar-button left" role="button" id="titlebar-external" title="player connected">
    <img
      src="https://api.iconify.design/mdi:volume.svg?color=green"
      alt="minimize"
    />
  </div>
  {/if}
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