import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface HighScore {
  score: number;
}

const LEADERBOARD_SIZE = 3;
const DB_DIR = join(homedir(), ".hjkl");
const DB_PATH = join(DB_DIR, "scores.db");

let db: Database | undefined;

function getDatabase(): Database {
  if (db) return db;
  mkdirSync(DB_DIR, { recursive: true });
  db = new Database(DB_PATH);
  db.run(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT 'AAA',
      score INTEGER NOT NULL,
      streak INTEGER NOT NULL,
      completed INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  return db;
}

export function saveScore(score: number, streak: number, completed: number): void {
  if (score === 0) return;
  getDatabase().run("INSERT INTO scores (score, streak, completed) VALUES (?, ?, ?)", [
    score,
    streak,
    completed,
  ]);
}

export function getHighScores(limit = LEADERBOARD_SIZE): HighScore[] {
  return getDatabase()
    .query("SELECT score FROM scores ORDER BY score DESC LIMIT ?")
    .all(limit) as HighScore[];
}
