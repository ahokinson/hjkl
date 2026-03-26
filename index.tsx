import { render } from "@opentui/solid";
import { App } from "@/App";
import { GameMode } from "@/game/engine";

const mode = process.argv.includes("--endless") ? GameMode.Endless : GameMode.Scored;

render(() => <App mode={mode} />);
