<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import {playState,TrackList,nextPage} from '../store';
    import type { Keymap } from '../types/Keymap';
    export let focused:number = 0;
    export let current:number = 0;

    let state:number;

    const unsubscribe = playState.subscribe((v)=> state = v);

    const dispatch=createEventDispatcher<{
        seturl: string,
        pause:null,
        resume:null
    }>();


    const setFocus = (i:number) => focused=i;
    

    function moveFocus(dir:"x"|"y", amt:1|-1){
        switch(dir){
            case "x": if(focused + amt < 9 && focused + amt >= 0) setFocus(focused+amt); break;
            case "y": if(focused + amt*3 <9 && focused + amt*3 >= 0) setFocus(focused+amt*3); break;
        }
    }

    function onPress(i:number){
        
        if(state==1&&current==focused) pauseTrack(i);
        else if(current!=focused) switchTrack(i);
        else playTrack(i);

        setFocus(i);
    }

    function switchTrack(id:number){
        console.log('switch',current,'to',id);
        current=id;
        dispatch("seturl",$TrackList.tracks[id].trackurl);

    }

    function numberPress(key:string){
        focused=parseInt(key);
        
        const keymap:Keymap = {
            '7':0,'8':1,'9':2,
            '4':3,'5':4,'6':5,
            '1':6,'2':7,'3':8,
        };

        const mappedkey:number=keymap[key];

        onPress(mappedkey);
    }

    function pauseTrack(id:number){
        console.log('pause',id);
        dispatch('pause');

        

    }
    function playTrack(id:number){
        console.log('play',id);
        dispatch('resume');
        current=id;
    }
        
    const epd = (event:Event) => event.preventDefault();

    function on_key_down(event: KeyboardEvent) {
        if (event.repeat) return;


        switch (event.key) {
            case "ArrowRight": epd(event); moveFocus("x",1); break;
            case "ArrowLeft": epd(event); moveFocus("x",-1); break;
            case "ArrowUp": epd(event); moveFocus("y",-1); break;
            case "ArrowDown": epd(event); moveFocus("y",1);break;
            case "Enter": epd(event); onPress(focused); break;
            case "p":epd(event); nextPage();break;
           
            case "7": case "8": case "9": 
            case "4": case "5": case "6":
            case "1": case "2": case "3":
                epd(event);
                numberPress(event.key);
            break;
        }

    }


</script>

<svelte:window on:keydown={on_key_down}></svelte:window>

<div class="grid">
{#each $TrackList.tracks as track, i}
    <button id="btn-{i}"
    style="background-image: url({track.trackimg?track.trackimg:'https://i3.ytimg.com/vi/'+track.trackurl+'/mqdefault.jpg'});"
    class="btn {focused==i?'focused':''} {current==i?'current '+(state==1?'playing':state==2?'paused':''):''}" 
    on:click={()=>{setFocus(i);onPress(i);}}>{track.tracktitle}</button>
 {/each}
</div>

<style>
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
}

.focused{
    filter: brightness(1) !important;
}

.current {
    box-shadow: 0 0 15px 3px orange;
}

.playing {
    box-shadow: 0 0 15px 3px green;
}

.paused {
    box-shadow: 0 0 15px 3px red;

}
</style>