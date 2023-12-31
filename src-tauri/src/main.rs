// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows",windows_subsystem="windows")

]

use std::{
    collections::HashMap,
    env,
    net::SocketAddr,
    sync::{Arc, Mutex},
};

use futures_channel::mpsc::{unbounded, UnboundedSender};
use futures_util::{future, pin_mut, stream::TryStreamExt, StreamExt};

use tokio::net::{TcpListener, TcpStream};
use tokio_tungstenite::tungstenite::protocol::Message;

type Tx = UnboundedSender<Message>;
type PeerMap = Arc<Mutex<HashMap<SocketAddr, Tx>>>;

use std::fs;
use std::io::Read;
use std::net::TcpListener as stdTcpListener;
use std::net::TcpStream as stdTcpStream;
use std::io::prelude::*;

async fn start_server() {
    let addr = env::args().nth(1).unwrap_or_else(|| "127.0.0.1:8833".to_string());

    let state = PeerMap::new(Mutex::new(HashMap::new()));
  
    // Create the event loop and TCP listener we'll accept connections on.
    let try_socket = TcpListener::bind(&addr).await;
    let listener = try_socket.expect("Failed to bind");

    println!("Listening on: {}", addr);
  
    while let Ok((stream, addr)) = listener.accept().await {
        tokio::spawn(handle_connection(state.clone(), stream, addr));
    }
}

async fn handle_connection(peer_map: PeerMap, raw_stream: TcpStream, addr: SocketAddr) {
    println!("Incoming TCP connection from: {}", addr);

    let ws_stream = tokio_tungstenite::accept_async(raw_stream)
        .await
        .expect("Error during the websocket handshake occurred");
    println!("WebSocket connection established: {}", addr);

    // Insert the write part of this peer to the peer map.
    let (tx, rx) = unbounded();
    peer_map.lock().unwrap().insert(addr, tx);

    let (outgoing, incoming) = ws_stream.split();

    let broadcast_incoming = incoming.try_for_each(|msg| {
        println!("Received a message from {}: {}", addr, msg.to_text().unwrap());
        let peers = peer_map.lock().unwrap();

        // We want to broadcast the message to everyone except ourselves.
        let broadcast_recipients =
            peers.iter().filter(|(peer_addr, _)| peer_addr != &&addr).map(|(_, ws_sink)| ws_sink);

        for recp in broadcast_recipients {
            recp.unbounded_send(msg.clone()).unwrap();
        }

        future::ok(())
    });

    let receive_from_others = rx.map(Ok).forward(outgoing);



    pin_mut!(broadcast_incoming, receive_from_others);
    future::select(broadcast_incoming, receive_from_others).await;


    // todo: broadcast disconnect back to miniboard
    println!("{} disconnected", &addr);
    peer_map.lock().unwrap().remove(&addr);
    
}
  
async fn start_tcp_server() {
    let addr = env::args().nth(1).unwrap_or_else(|| "127.0.0.1:8844".to_string());

    // Create the event loop and TCP listener we'll accept connections on.
    let try_socket = stdTcpListener::bind(&addr);
    let listener = try_socket.expect("Failed to bind");

    println!("Listening on: {}", addr);
  
    while let Ok((stream, _)) = listener.accept() {
        tokio::spawn(handle_tcp_connection(stream));
    }
}

async fn handle_tcp_connection(mut stream: stdTcpStream){
    let mut buffer = [0;1024];
    stream.read(&mut buffer).unwrap();

    // let get = b"GET / HTTP/1.1\r\n";

    let (status_line, filename) = ("HTTP/1.1 200 OK","client.html");

    let contents = "
    <!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\" />
  <link rel=\"icon\" type=\"image/svg+xml\" href=\"/vite.svg\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <script src=\"https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js\"></script>
  <title>Client</title>
</head>

<body>
  <div id=\"state\"></div>
  <div id=\"player\"></div>
  
  <script>

    $(()=>{
      $('#state').data('loopState',1);
      registerWebsocket();
    })

    var player;
    var ws;

    var tag = document.createElement('script');

    tag.src = \"https://www.youtube.com/iframe_api\";

    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


    function onYouTubeIframeAPIReady() {
      player = new YT.Player('player', { 
        videoId: 'nQLJNCDa4GA',
        playerVars: { 'autoplay': 1,'playsinline': 1 },
        events: { 'onStateChange': onPlayerStateChange }
      });
    }

    function setState(state=-1){
      
      switch(state){
        case 2: pause(); break;
        case 1: resume(); break;
      }

      $('#state').data('playerState',state);


    }

    function setUrl(url='') {
      $('#state').data('url',url);
      if(player) player.loadVideoById(url);
    }

    const pause = () => { player.pauseVideo(); }
    const resume = () => { player.playVideo(); }

    function onPlayerStateChange(event) {
      switch(event.data){
          case 0: resetVideo(); break;
      }
    }

    function resetVideo(){
    let loopState = $('#state').data('loopState');
    if(loopState){
        player.seekTo(0,false);
        resume();
    }
    }

    const log = (msg) => console.log(msg);

    function registerWebsocket(){
    let ws = new WebSocket('ws://127.0.0.1:8833');

    ws.onopen = function(ev) { log('Connection established'); ws.send(JSON.stringify({msgtype:'ack'})); }
    ws.onclose = function(ev) { log('Disconnected'); ws.send(JSON.stringify({msgtype:'dc'})); }
    ws.onmessage = function(ev) { log('Message received'); handle_message(JSON.parse(ev.data));}

    function handle_message(msg){
      console.log(msg);
        switch(msg.msgtype){
            case 'url':  setUrl(msg.url); break;
            case 'state': setState(msg.state); break;
            case 'loop': $('#state').data('loopState',msg.loopState??1); break;

        }
    }

    }

  </script>
</body>
</html>";

    let response = format!(
        "{}\r\nContent-Length: {}\r\n\r\n{}",
        status_line,
        contents.len(),
        contents
    );

    stream.write(response.as_bytes()).unwrap();
    stream.flush().unwrap();


}



// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::async_runtime::spawn(start_server());
    tauri::async_runtime::spawn(start_tcp_server());
    

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_websocket::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");


}
