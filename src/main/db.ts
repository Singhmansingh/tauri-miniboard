import Database from "tauri-plugin-sql-api";
import type { Track } from "./types/Track";


async function get_db(){

    let _db:Database = await Database.load('sqlite:main.db');

    return _db;
}

export async function selectManytoMany(mergetable:string,targettable:string,expression:string,basefield:string,basevalue:number){
    let _db:Database = await get_db();

    let query = `SELECT * from ${mergetable},${targettable} where ${expression} and ${mergetable}.${basefield}=${basevalue}`;
    let res:Array<any> = await _db.select(query);

    return res;
}

async function get(query:string,params:Array<any>=[]){
    let _db:Database = await get_db();
    let res:Array<any> = await _db.select(query,params);

    return res;
}

async function single(query:string,params:Array<any>=[]){
    let _db:Database = await get_db();
    let res:Array<any> = await _db.select(query,params);

    if(res.length>=1) return res[0];
    return null;
}

async function exec(query:string,params:Array<any>){
    let _db:Database = await get_db();
    await _db.execute(query,params);

    return 1;
}

  
export const db = {
    get,
    exec,
    first:single,
    single
}
