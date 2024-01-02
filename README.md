# Miniboard

Soundboard controller to play Youtube videos to a browser interface. Built to be used with apps like [Kenku FM](https://github.com/owlbear-rodeo/kenku-fm). Built using Tauri + Rust + Svelte (TS).

This is a lite version of my Soundboard utility, built with Electron. This app only supports Youtube videos currently.  

## How it works

9 button always on top window is displayed. Each button references a youtube video id. Navigate using either the number pad, arrows, or mouse. The track will play on loop when selected. Press again to pause.

To play through browser, open at http://localhost:1420/client.html. Audio will automatically be routed from the miniboard to the browser.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).


rename "main.db.example" to "main.db" and place in tauri data folder (ex. %appdata%/roaming/com.tauri.dev)