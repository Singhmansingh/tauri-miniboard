// @ts-nocheck
import "../styles.css";
import SettingsApp from "./SettingsApp.svelte";

const app = new SettingsApp({
  target: document.getElementById("app"),
});

export default app;
