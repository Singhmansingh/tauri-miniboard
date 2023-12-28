import WebSocket, { type Message } from "tauri-plugin-websocket-api";
import { type Writable, writable } from "svelte/store";
import type { WsMessage } from "./types/WsMessage";

var ws:WebSocket;

export const playerConnected:Writable<number> = writable(0);

function _updateResponse(returnValue: Message) {

  ///@ts-ignore
  const binaryArray = new Uint8Array(returnValue.data);

  // Create a TextDecoder instance with the desired encoding (e.g., 'utf-8')
  const textDecoder = new TextDecoder('utf-8');

  // Convert the binary array to a string
  const resultString = JSON.parse(textDecoder.decode(binaryArray));

  handle_message(resultString);

}

export async function connect() {
    try {
      ws = await WebSocket.connect("ws://127.0.0.1:8081").then((r) => {
        console.log('ws Connected')
        return r;
      });
    } catch (e) {
      console.log('ws failed:',e)
    }
    ws.addListener(_updateResponse);
  }

export async function sendURL(url:string){
    ws.send(JSON.stringify({msgtype:'url', url}));
}

export async function sendState(state:number){
  ws.send(JSON.stringify({msgtype:'state', state}));
}

function handle_message(data:WsMessage){
  switch(data.msgtype){
    case 'ack':
      console.log('Audio will play through player');
      playerConnected.update(()=> 1);
    break;
    case 'dc':
      console.log('player disconnected');
      playerConnected.update(()=>0);
    break;
  }
}