export type WsMessage =  {
    msgtype: "ack" | "dc" | "url" | "loop" | string,
    url?:string,
    state?:number,
    loopState?:number


}