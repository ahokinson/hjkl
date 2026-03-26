import { onResize, useKeyboard, useTerminalDimensions } from "@opentui/solid";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { GameHeader } from "@/components/GameHeader";
import { NvimGrid } from "@/components/NvimGrid";
import { createGameEngine, type GameMode, PlayState } from "@/game/engine";
import { translateKey } from "@/nvim/bridge";
import { createNvimClient, type NvimClient } from "@/nvim/client";
import { createScreen, type Screen } from "@/nvim/screen";
import { theme } from "@/theme";

const CHROME_HEIGHT = 8;

export function App(props: { mode: GameMode }) {
  const dimensions = useTerminalDimensions();
  const [error, setError] = createSignal("");
  const [client, setClient] = createSignal<NvimClient>();
  const [screen, setScreen] = createSignal<Screen>();
  const [engine, setEngine] = createSignal<ReturnType<typeof createGameEngine>>();

  onMount(async () => {
    try {
      const { width, height } = dimensions();
      const nvimHeight = Math.max(1, height - CHROME_HEIGHT);

      const newScreen = createScreen(width, nvimHeight);
      setScreen(newScreen);

      const newClient = await createNvimClient(width, nvimHeight, (events) => {
        newScreen.processRedrawEvents(events);
      });
      setClient(newClient);

      const newEngine = createGameEngine(newClient, props.mode);
      setEngine(newEngine);

      await newEngine.loadChallenge();
    } catch (startupError) {
      setError(
        `Failed to start neovim: ${startupError instanceof Error ? startupError.message : String(startupError)}`,
      );
    }
  });

  onResize((width, height) => {
    const currentClient = client();
    if (!currentClient) return;
    const nvimHeight = Math.max(1, height - CHROME_HEIGHT);
    currentClient.resize(width, nvimHeight);
  });

  useKeyboard((key) => {
    const currentClient = client();
    const currentEngine = engine();
    if (!currentClient || !currentEngine) return;

    if (key.ctrl && key.name === "q") {
      currentEngine.destroy();
      currentClient.destroy();
      process.exit(0);
    }

    if (currentEngine.game.state === PlayState.GameOver) return;

    const nvimKey = translateKey(key);
    if (nvimKey) {
      currentClient.sendKeys(nvimKey);
      currentEngine.onKeystroke();
    }
  });

  onCleanup(() => {
    const currentEngine = engine();
    const currentClient = client();
    if (currentEngine) currentEngine.destroy();
    if (currentClient) currentClient.destroy();
  });

  return (
    <box flexDirection="column" width="100%" height="100%" bg={theme.base}>
      <Show when={error()}>
        <text fg={theme.red} content={`Error: ${error()}`} />
      </Show>
      <Show when={engine()}>{(resolvedEngine) => <GameHeader game={resolvedEngine().game} />}</Show>
      <Show when={screen()}>{(resolvedScreen) => <NvimGrid screen={resolvedScreen()} />}</Show>
      <Show when={!engine() && !error()}>
        <text fg={theme.subtext0} content=" Starting neovim..." />
      </Show>
    </box>
  );
}
