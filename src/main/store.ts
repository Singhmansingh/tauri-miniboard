import { readable, type Readable, writable, type Writable } from 'svelte/store';
import type {Track } from "./types/Track";
import { selectManytoMany,db } from './db';
import { PlayState } from './types/PlayState';
import type { Board } from './types/Boards';

export const playState=writable(PlayState.STOPPED);
export const page:Writable<number> = writable(0);
export const loopAudio:Writable<number>=writable(1);
export const cBoard:Writable<Board>=writable();

const MAXPAGE:number = 2;

export async function nextPage(pg:number=0){

    let _boards:Array<Board> = await db.get('select * from boards where active=1',[]);

    let c= _boards.length;

    if(pg>=c){
        pg=0;
    }

    cBoard.update(()=>_boards[pg]);

    let boardid=_boards[pg].boardid;

    let {tracks} = await getBoardandTracks(boardid);

    page.update(()=> pg);


    return tracks;
}

export async function getBoardandTracks(boardid:number){
    
    let boards:Array<Board> = await db.get('select * from boards where boardid=$1',[boardid]);
    let tracks:Array<Track> = await selectManytoMany('boardtracks','tracks','boardtracks.trackid=tracks.trackid','boardid',boardid);

    return {
        board:boards[0],
        tracks
    }
}


export const getActiveBoards = async () => await db.get('select * from boards where active=1');

const getall = async ()=> {let r= await getBoardandTracks(2); console.log(r);};

getall();
