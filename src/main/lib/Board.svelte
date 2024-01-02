<script lang="ts">
import { createEventDispatcher, onMount } from "svelte";
import { playState, nextPage, page } from '../store';
import type { Keymap } from '../types/Keymap';
import type { Track } from "../types/Track";
import { PlayState } from "../types/PlayState";

    const GRID_SIZE = 3;
    const KEY_MAP: Keymap = {
        '7': 0, '8': 1, '9': 2,
        '4': 3, '5': 4, '6': 5,
        '1': 6, '2': 7, '3': 8,
    };

    let focusedindex:number = 0;
    let currentindex:number = 0;
    let statecolor:string;

    let state:number;
    let currPage:number;

    let TrackList:Array<Track>=[];

    onMount(()=> {
        
        loadPage(0);

        page.subscribe((p)=> currPage=p);
        playState.subscribe((v)=> {
            state = v;
            setStateColor();
        });

    });


    const dispatch=createEventDispatcher<{
        seturl: string,
        pause:null,
        resume:null
    }>();

    // let the main app handle store changes, pass to YT player from parent  
    const pauseTrack = () => dispatch('pause');
    const resumeTrack = () => dispatch('resume');

    const setFocus = (i:number) => focusedindex=i;


    async function loadPage(pg=0){
        TrackList = await nextPage(pg);
    }
    

    function moveFocus(dir:"x"|"y", amt:1|-1){
        switch(dir){
            // move on the x (+1 = right, -1 = left)
            case "x": if(focusedindex + amt < GRID_SIZE**2 && focusedindex + amt >= 0) setFocus(focusedindex+amt); break;

            // move on the y (on a 3x3, -3 = up, + 3 = down)
            case "y": if(focusedindex + amt*GRID_SIZE <GRID_SIZE**2 && focusedindex + amt*GRID_SIZE >= 0) setFocus(focusedindex+amt*GRID_SIZE); break;
        }
    }

    function onPress(index:number){
        if(index<0) return;
        
        if(index==currentindex){
            console.log(index,currentindex);
            switch(state){
                case PlayState.PLAYING: pauseTrack();break;
                case PlayState.PAUSED: resumeTrack();break;
                case PlayState.STOPPED: switchTrack(index);break;
            }
        }

        else {
            switchTrack(index);
        }

        currentindex=index;
        setFocus(index);
    }

    function switchTrack(index:number){
        console.log('switch',currentindex,'to',index);
        let trackurl=TrackList[index].trackurl;
        dispatch("seturl",trackurl);

    }

    function numberPress(key:string){
        focusedindex=parseInt(key);
        
        const mappedindex:number=KEY_MAP[key];

        onPress(mappedindex);
    }


    
        

    function on_key_down(event: KeyboardEvent) {
        if (event.repeat) return;

        const epd = (event:Event) => event.preventDefault();

        switch (event.key) {
            case "ArrowRight": epd(event); moveFocus("x",1); break;
            case "ArrowLeft": epd(event); moveFocus("x",-1); break;
            case "ArrowUp": epd(event); moveFocus("y",-1); break;
            case "ArrowDown": epd(event); moveFocus("y",1); break;

            case "Enter": epd(event); onPress(focusedindex); break;

            //next page
            case "p": epd(event); loadPage(currPage+1); setFocus(0); break;
           
            case "7": case "8": case "9": 
            case "4": case "5": case "6":
            case "1": case "2": case "3":
                epd(event);
                numberPress(event.key);
            break;
        }

    }

    const setStateColor = ()=>{
        switch(state) {
            case PlayState.PLAYING: return statecolor='playing';
            case PlayState.PAUSED: return statecolor='paused';
            case PlayState.BUFFERING: return statecolor='buffering';
            case PlayState.STOPPED: return statecolor='stopped';
            default: return statecolor='';
        }
    }


</script>

<!-- register local keypresses on the miniboard  -->
<svelte:window on:keydown={on_key_down}></svelte:window>

<div class="grid">
{#each TrackList as track,i}
    <button id="btn-{i}"
    style="background-image: url({track.trackimg?track.trackimg:'https://i3.ytimg.com/vi/'+track.trackurl+'/mqdefault.jpg'});"
    class="btn {focusedindex==(i)?'focused':''} {currentindex==i?'current '+statecolor:''} " 
    on:click={()=>{onPress(i);}}><span>{track.tracktitle}</span></button>
 {/each}
</div>

<style lang="scss">
.grid{
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap:5px;
    grid-template-rows: repeat(3,1fr);
    width:100%;
    padding: 0 8px 8px;
}

.grid > .btn {
    background-color: lightslategrey;
    border-radius: 5px;
    transition: background-color ease-out 100ms;
    background-size:cover;
    background-repeat:no-repeat;
    background-position: center;
    filter: brightness(0.5);
    transition: filter ease-out 100ms;
    color: white;
    font-weight: bold;
    font-size: 5vmin;

    span {
        background-color: rgba(0, 0, 0, 0.834);
        line-height: 1em;
        box-sizing: border-box;
        backdrop-filter: blur(100%);
    }
    
}

.focused{
    filter: brightness(1) !important;
}

.buffering {
    box-shadow: 0 0  6px 3px  orange;
}

.playing {
    box-shadow: 0 0 6px 3px green;
}

.paused {
    box-shadow: 0 0 6px 3px red;

}

</style>