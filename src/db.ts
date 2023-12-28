import Database from "tauri-plugin-sql-api";
import type { TrackListType,Track } from "./types/Track";


async function getdb(){

    let db:Database = await Database.load('sqlite:main.db');

    return db;
}


export async function loadTracks(page=0) {


    let db:Database = await getdb();
    const perpage = 9;
    const start = page * perpage;
    console.log(start);
    let res:Array<Track> = await db.select("SELECT * from TRACKS LIMIT $1,$2",[start,perpage]);
    return res;
}

  
