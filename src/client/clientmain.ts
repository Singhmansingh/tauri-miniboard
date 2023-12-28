// @ts-nocheck

import "../styles.css";
import ClientApp from "./clientApp.svelte";

const app = new ClientApp({
  target: document.getElementById("app"),
});

export default app;
