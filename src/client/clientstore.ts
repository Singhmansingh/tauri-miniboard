import { readable, type Readable, writable, type Writable } from 'svelte/store';
import type { WsMessage } from '../types/WsMessage';


export enum WS_STATE {
    CONNECTING = -1,
    FAILED = 0,
    CONNECTED = 1
}

export const url:Writable<string> = writable('');

export const playState=writable(-1)

let ws:WebSocket = new WebSocket('ws://127.0.0.1:8081');

ws.onopen = function(ev){
    console.log('WS connection established')
    ws.send(JSON.stringify({msgtype:'ack'}));
}

ws.onclose = function(e){
    disconnect();
}

export function disconnect(){
    ws.send(JSON.stringify({msgtype:'dc'}))
}


ws.onmessage = function(e){
    const reader = new FileReader();

    reader.onload = function() {
        let res = reader.result?.toString() || '{}';
      let data = JSON.parse(res);
      handle_message(data);
    };

    reader.readAsText(e.data);
}

function handle_message(msg:WsMessage){
    switch(msg.msgtype){
        case 'url':
            console.log(msg.url);
            url.update(()=> msg.url??'');
        break;

        case 'state':
            console.log(msg.state)
            playState.update(()=> msg.state??-1);
        break;

    }
}