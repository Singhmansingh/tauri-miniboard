export type WsMessage =  {
    msgtype: "ack" | "dc" | "url" | string,
    url?:string,
    state?:number
}