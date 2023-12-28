// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows",windows_subsystem="windows")

]

use futures_util::StreamExt;
use tokio::net::{TcpListener, TcpStream};

async fn start_server() {
    let addr = "127.0.0.1:8080".to_string();
  
    // Create the event loop and TCP listener we'll accept connections on.
    let try_socket = TcpListener::bind(&addr).await;
    let listener = try_socket.expect("Failed to bind");
  
    while let Ok((stream, _)) = listener.accept().await {
      tokio::spawn(accept_connection(stream));
    }
}

async fn accept_connection(stream: TcpStream) {
let ws_stream = tokio_tungstenite::accept_async(stream)
    .await
    .expect("Error during the websocket handshake occurred");

let (_, mut read) = ws_stream.split();

while let Some(msg) = read.next().await {
    if let Ok(msg) = msg {
        if msg.is_text() {
            println!("{}", msg)
        }
    }
}

}
  

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::async_runtime::spawn(start_server());
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_websocket::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
