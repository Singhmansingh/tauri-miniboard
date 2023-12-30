import { readable, type Readable, writable, type Writable } from 'svelte/store';
import type { TrackListType } from "./types/Track";
import { loadTracks } from './db';
import { PlayState } from './types/PlayState';

export const playState=writable(PlayState.STOPPED);
export const page:Writable<number> = writable(0);
export const loopAudio:Writable<number>=writable(1);

const MAXPAGE:number = 1;

export const TrackList:Writable<TrackListType> = writable({
    listname:"main",
    platform:"youtube",
    tracks:[]
})

export async function nextPage(pg:number=0){
    
    if(pg>MAXPAGE) {
        page.update(()=> 0);
        pg=0;
    } else {
        page.update(()=> pg);
    }

    console.log(pg);
    let tracks=await loadTracks(pg);
    
   

    TrackList.update((tl)=>{
        
        return {
            listname:tl.listname,
            platform:tl.platform,
            tracks
        }
    });

}