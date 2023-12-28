import { readable, type Readable, writable, type Writable } from 'svelte/store';
import type { TrackListType } from "./types/Track";
import { loadTracks } from './db';
import { PlayState } from './types/PlayState';

export const playState=writable(PlayState.STOPPED)

let page = 0;

let tracks = await loadTracks(page);

export const TrackList:Writable<TrackListType> = writable({
    listname:"main",
    platform:"youtube",
    tracks
})

export async function nextPage(){
    page++;
    if(page>1) page=0;
    let tracks=await loadTracks(page);
    
    TrackList.update((tl)=>{
        
        return {
            listname:tl.listname,
            platform:tl.platform,
            tracks
        }
    });

}