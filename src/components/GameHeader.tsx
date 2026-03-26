import { useTerminalDimensions } from "@opentui/solid";
import { createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { GameMode, type GameState, PlayState } from "@/game/engine";
import { DECAY_MS, FULL_SCORE_MS, streakMultiplier } from "@/game/scoring";
import { lerpColor, theme } from "@/theme";

interface GameHeaderProps {
  game: GameState;
}

const TOTAL_MS = FULL_SCORE_MS + DECAY_MS;
const TIMER_TICK_MS = 50;
const STREAK_HIGHLIGHT_THRESHOLD = 3;
const SCORE_PAD_WIDTH = 5;
const SHIMMER_SPEED = 0.003;
const SHIMMER_PHASE_OFFSET = 1.2;
const BANNER_HEIGHT = 6;
const BANNER_MARGIN_LEFT = 2;
const SECTION_GAP = 3;
const BAR_PADDING = 2;

export function GameHeader(props: GameHeaderProps) {
  const dimensions = useTerminalDimensions();
  const [tick, setTick] = createSignal(0);

  onMount(() => {
    const interval = setInterval(() => setTick((value) => value + 1), TIMER_TICK_MS);
    onCleanup(() => clearInterval(interval));
  });

  const elapsed = createMemo(() => {
    tick();
    if (props.game.state !== PlayState.Playing) return 0;
    return Date.now() - props.game.challengeStartTime;
  });

  const barWidth = createMemo(() => dimensions().width - BAR_PADDING);

  const timeBar = createMemo(() => {
    const width = barWidth();
    if (props.game.state === PlayState.Success) return { filled: width, color: theme.green };
    if (props.game.state === PlayState.GameOver) return { filled: 0, color: theme.red };
    if (props.game.state === PlayState.Loading) return { filled: width, color: theme.surface2 };
    const elapsedMs = elapsed();
    if (elapsedMs <= FULL_SCORE_MS) {
      return { filled: width, color: theme.green };
    }
    if (elapsedMs <= TOTAL_MS) {
      const remaining = 1 - (elapsedMs - FULL_SCORE_MS) / DECAY_MS;
      const filled = Math.max(0, Math.round(width * remaining));
      const color = lerpColor(theme.red, theme.green, remaining);
      return { filled, color };
    }
    return { filled: 0, color: theme.red };
  });

  const multiplier = createMemo(() => streakMultiplier(props.game.streak));

  function shimmerColor(index: number): string {
    tick();
    const time = Date.now() * SHIMMER_SPEED;
    const phase = time + index * SHIMMER_PHASE_OFFSET;
    const ratio = (Math.sin(phase) + 1) / 2;
    if (index === 0) {
      return lerpColor(theme.yellow, theme.rosewater, ratio);
    }
    return lerpColor(theme.blue, theme.mauve, ratio);
  }

  return (
    <box flexDirection="column">
      <box flexDirection="row" height={BANNER_HEIGHT}>
        <box width={BANNER_MARGIN_LEFT} />

        <ascii_font
          text="HJKL"
          font="block"
          color={[theme.blue, theme.mauve, theme.pink, theme.peach]}
        />

        <box width={SECTION_GAP} />

        <Show
          when={props.game.mode === GameMode.Scored}
          fallback={
            <box flexDirection="column">
              <box height={1} />
              <box height={1} />
              <text fg={theme.overlay0} content="  ENDLESS" />
              <box height={1} />
              <text fg={theme.subtext0} content={`  ${props.game.completed} completed`} />
              <box height={1} />
            </box>
          }
        >
          <box flexDirection="column">
            <box height={1} />
            <text fg={theme.text} content={`  ${props.game.score} pts`} />
            <box height={1} />
            <text
              fg={
                props.game.streak >= STREAK_HIGHLIGHT_THRESHOLD
                  ? theme.peach
                  : props.game.streak > 0
                    ? theme.green
                    : theme.subtext0
              }
              content={props.game.streak > 0 ? `  ${multiplier().toFixed(2)}x` : "  ──"}
            />
            <box height={1} />
          </box>

          <box width={SECTION_GAP} />

          <Show when={props.game.highScores.length > 0}>
            <box flexDirection="column">
              <box height={1} />
              <For each={props.game.highScores}>
                {(entry, index) => {
                  const scoreString = String(entry.score);
                  const padding = " ".repeat(Math.max(0, SCORE_PAD_WIDTH - scoreString.length));
                  return <text fg={shimmerColor(index())} content={`${padding}${scoreString}`} />;
                }}
              </For>
            </box>
          </Show>
        </Show>

        <box flexGrow={1} />
      </box>

      <box flexDirection="row" height={1}>
        <Show when={props.game.state === PlayState.GameOver}>
          <text fg={theme.base} bg={theme.red} content={` ${props.game.score} pts `} />
          <text fg={theme.red} content=" GAME OVER " />
          <box flexGrow={1} />
        </Show>
        <Show when={props.game.state === PlayState.Success}>
          <text fg={theme.base} bg={theme.green} content={` +${props.game.lastScore} `} />
          <text fg={theme.green} content=" Complete! " />
          <box flexGrow={1} />
        </Show>
        <Show
          when={props.game.state === PlayState.Playing || props.game.state === PlayState.Loading}
        >
          <text fg={theme.yellow} content=" > " />
          <text fg={theme.text} content={props.game.currentChallenge.instruction} />
          <box flexGrow={1} />
        </Show>
      </box>

      <box flexDirection="row" height={1}>
        <Show
          when={timeBar().filled > 0}
          fallback={<text fg={theme.lavender} content={` ${props.game.currentChallenge.hint}`} />}
        >
          <text fg={theme.surface2} content=" " />
          <text fg={timeBar().color} content={"━".repeat(timeBar().filled)} />
          <text fg={theme.surface0} content={"━".repeat(barWidth() - timeBar().filled)} />
          <text fg={theme.surface2} content=" " />
        </Show>
      </box>
    </box>
  );
}
