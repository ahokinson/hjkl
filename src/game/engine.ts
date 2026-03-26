import { createStore } from "solid-js/store";

import { type Snippet, snippets } from "@/data/snippets";
import { type Challenge, ChallengeCategory, getRandomChallenge } from "@/game/challenges";
import { getHighScores, type HighScore, saveScore } from "@/game/leaderboard";
import { calculateScore } from "@/game/scoring";
import type { NvimClient } from "@/nvim/client";

const HINT_MS = 10500;
const SUCCESS_DISPLAY_MS = 1200;
const SNIPPET_RENDER_MS = 50;
const GAME_OVER_DISPLAY_MS = 2000;

export enum GameMode {
  Scored = "scored",
  Endless = "endless",
}

export enum PlayState {
  Playing = "playing",
  Success = "success",
  Loading = "loading",
  GameOver = "gameover",
}

export interface GameState {
  mode: GameMode;
  state: PlayState;
  score: number;
  streak: number;

  completed: number;
  keystrokeCount: number;
  challengeStartTime: number;
  currentChallenge: Challenge;
  lastScore: number;
  showHint: boolean;
  highScores: HighScore[];
}

const EMPTY_CHALLENGE: Challenge = {
  id: "loading",
  instruction: "Loading...",
  snippetIndex: 0,
  initialCursor: [1, 0],
  validate: async () => false,
  idealKeystrokes: 0,
  hint: "",
  category: ChallengeCategory.Navigation,
};

export function createGameEngine(client: NvimClient, mode: GameMode = GameMode.Scored) {
  const [game, setGame] = createStore<GameState>({
    mode,
    state: PlayState.Loading,
    score: 0,
    streak: 0,
    completed: 0,
    keystrokeCount: 0,
    challengeStartTime: Date.now(),
    currentChallenge: EMPTY_CHALLENGE,
    lastScore: 0,
    showHint: false,
    highScores: getHighScores(),
  });

  let hintTimeout: ReturnType<typeof setTimeout> | undefined;
  let successTimeout: ReturnType<typeof setTimeout> | undefined;
  let gameOverTimeout: ReturnType<typeof setTimeout> | undefined;
  let validating = false;
  let hintWasShown = false;

  function resetTimers() {
    if (hintTimeout) clearTimeout(hintTimeout);
    setGame("showHint", false);
    hintWasShown = false;
    hintTimeout = setTimeout(() => {
      setGame("showHint", true);
      hintWasShown = true;
    }, HINT_MS);
  }

  async function resetGame() {
    setGame({ score: 0, streak: 0, completed: 0 });
    await loadChallenge();
  }

  async function loadChallenge() {
    setGame("state", PlayState.Loading);

    const challenge = getRandomChallenge();
    const snippet = snippets[challenge.snippetIndex] as Snippet;

    await client.loadSnippet(snippet.code, snippet.filetype);
    await Bun.sleep(SNIPPET_RENDER_MS);

    await client.setCursor(challenge.initialCursor[0], challenge.initialCursor[1]);

    setGame({
      state: PlayState.Playing,
      currentChallenge: challenge,
      keystrokeCount: 0,
      challengeStartTime: Date.now(),
      showHint: false,
    });

    resetTimers();
  }

  async function onKeystroke() {
    if (game.state !== PlayState.Playing) return;

    setGame("keystrokeCount", (count) => count + 1);

    if (validating) return;
    validating = true;

    try {
      const completed = await game.currentChallenge.validate(client);
      if (completed && game.state === PlayState.Playing) {
        if (hintTimeout) clearTimeout(hintTimeout);

        if (game.mode === GameMode.Endless) {
          setGame({
            state: PlayState.Success,
            lastScore: 0,
            completed: game.completed + 1,
          });
          successTimeout = setTimeout(() => void loadChallenge(), SUCCESS_DISPLAY_MS);
        } else if (hintWasShown) {
          saveScore(game.score, game.streak, game.completed);
          setGame({
            state: PlayState.GameOver,
            highScores: getHighScores(),
          });
          gameOverTimeout = setTimeout(() => void resetGame(), GAME_OVER_DISPLAY_MS);
        } else {
          const elapsed = Date.now() - game.challengeStartTime;
          const points = calculateScore(elapsed, game.streak);

          setGame({
            state: PlayState.Success,
            score: game.score + points,
            lastScore: points,
            streak: game.streak + 1,
            completed: game.completed + 1,
          });

          successTimeout = setTimeout(() => void loadChallenge(), SUCCESS_DISPLAY_MS);
        }
      }
    } finally {
      validating = false;
    }
  }

  function destroy() {
    if (hintTimeout) clearTimeout(hintTimeout);
    if (successTimeout) clearTimeout(successTimeout);
    if (gameOverTimeout) clearTimeout(gameOverTimeout);
  }

  return {
    game,
    loadChallenge,
    onKeystroke,
    destroy,
  };
}
