export default [
  {
    filetype: "typescript",
    code: `import { createSignal, createEffect } from "solid-js";
import { render } from "solid-js/web";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
}

function App() {
  const [users, setUsers] = createSignal<User[]>([]);
  const [search, setSearch] = createSignal("");

  const filteredUsers = () =>
    users().filter((u) =>
      u.name.toLowerCase().includes(search().toLowerCase())
    );

  createEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  });

  return (
    <div class="container">
      <input
        placeholder="Search users..."
        value={search()}
        onInput={(e) => setSearch(e.target.value)}
      />
      <ul>
        {filteredUsers().map((user) => (
          <li>{user.name} ({user.email})</li>
        ))}
      </ul>
    </div>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  },
  {
    filetype: "typescript",
    code: `const API_BASE = "https://api.example.com/v2";

interface RequestConfig {
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

async function request<T>(path: string, config: RequestConfig): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    config.timeout ?? 5000
  );

  try {
    const response = await fetch(\`\${API_BASE}\${path}\`, {
      method: config.method,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: config.body ? JSON.stringify(config.body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }

    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getUsers() {
  return request<{ users: User[] }>("/users", { method: "GET" });
}

export async function createUser(data: Omit<User, "id">) {
  return request<User>("/users", { method: "POST", body: data });
}

export async function deleteUser(id: number) {
  return request<void>(\`/users/\${id}\`, { method: "DELETE" });
}`,
  },
  {
    filetype: "typescript",
    code: `class EventEmitter<Events extends Record<string, any[]>> {
  private listeners = new Map<keyof Events, Set<Function>>();

  on<K extends keyof Events>(event: K, fn: (...args: Events[K]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(fn);
    return () => this.off(event, fn);
  }

  off<K extends keyof Events>(event: K, fn: (...args: Events[K]) => void) {
    this.listeners.get(event)?.delete(fn);
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]) {
    this.listeners.get(event)?.forEach((fn) => fn(...args));
  }

  once<K extends keyof Events>(event: K, fn: (...args: Events[K]) => void) {
    const unsub = this.on(event, (...args) => {
      unsub();
      fn(...args);
    });
    return unsub;
  }
}

interface GameEvents {
  start: [];
  score: [points: number, player: string];
  end: [winner: string, finalScore: number];
  error: [message: string];
}

const game = new EventEmitter<GameEvents>();

game.on("score", (points, player) => {
  console.log(\`\${player} scored \${points} points!\`);
});

game.once("end", (winner, score) => {
  console.log(\`Game over! \${winner} wins with \${score}\`);
});

game.emit("start");
game.emit("score", 100, "Alice");
game.emit("score", 250, "Bob");
game.emit("end", "Bob", 350);`,
  },
  {
    filetype: "typescript",
    code: `type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

function parseJSON<T>(input: string): Result<T, string> {
  try {
    return ok(JSON.parse(input) as T);
  } catch (e) {
    return err(\`Failed to parse JSON: \${(e as Error).message}\`);
  }
}

function validateAge(age: unknown): Result<number, string> {
  if (typeof age !== "number") {
    return err("Age must be a number");
  }
  if (age < 0 || age > 150) {
    return err("Age must be between 0 and 150");
  }
  return ok(age);
}

function processUserInput(raw: string): Result<{ name: string; age: number }, string> {
  const parsed = parseJSON<{ name?: string; age?: unknown }>(raw);
  if (!parsed.ok) return parsed;

  const { name, age } = parsed.value;
  if (!name || typeof name !== "string") {
    return err("Name is required and must be a string");
  }

  const validAge = validateAge(age);
  if (!validAge.ok) return validAge;

  return ok({ name, age: validAge.value });
}

const result = processUserInput('{"name": "Alice", "age": 30}');
if (result.ok) {
  console.log(\`Welcome, \${result.value.name}!\`);
} else {
  console.error(result.error);
}`,
  },
  {
    filetype: "typescript",
    code: `import { describe, expect, it, beforeEach, mock } from "bun:test";

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

class TodoStore {
  private items: Map<string, TodoItem> = new Map();
  private nextId = 1;

  add(title: string): TodoItem {
    const item: TodoItem = {
      id: String(this.nextId++),
      title: title.trim(),
      completed: false,
      createdAt: new Date(),
    };
    this.items.set(item.id, item);
    return item;
  }

  toggle(id: string): boolean {
    const item = this.items.get(id);
    if (!item) return false;
    item.completed = !item.completed;
    return true;
  }

  remove(id: string): boolean {
    return this.items.delete(id);
  }

  getAll(): TodoItem[] {
    return Array.from(this.items.values());
  }

  getCompleted(): TodoItem[] {
    return this.getAll().filter((item) => item.completed);
  }

  getPending(): TodoItem[] {
    return this.getAll().filter((item) => !item.completed);
  }

  clear(): void {
    this.items.clear();
    this.nextId = 1;
  }
}

describe("TodoStore", () => {
  let store: TodoStore;

  beforeEach(() => {
    store = new TodoStore();
  });

  it("should add items", () => {
    const item = store.add("Buy milk");
    expect(item.title).toBe("Buy milk");
    expect(item.completed).toBe(false);
  });

  it("should toggle completion", () => {
    const item = store.add("Exercise");
    store.toggle(item.id);
    expect(store.getCompleted()).toHaveLength(1);
  });
});`,
  },
  {
    filetype: "typescript",
    code: `type Middleware<T> = (ctx: T, next: () => Promise<void>) => Promise<void>;

class Pipeline<T> {
  private middlewares: Middleware<T>[] = [];

  use(fn: Middleware<T>): this {
    this.middlewares.push(fn);
    return this;
  }

  async execute(context: T): Promise<void> {
    let index = 0;

    const next = async (): Promise<void> => {
      if (index >= this.middlewares.length) return;
      const middleware = this.middlewares[index++]!;
      await middleware(context, next);
    };

    await next();
  }
}

interface HttpContext {
  path: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
  status: number;
  response: unknown;
}

const app = new Pipeline<HttpContext>();

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(\`\${ctx.method} \${ctx.path} -> \${ctx.status} (\${ms}ms)\`);
});

app.use(async (ctx, next) => {
  const token = ctx.headers["authorization"];
  if (!token && ctx.path !== "/login") {
    ctx.status = 401;
    ctx.response = { error: "Unauthorized" };
    return;
  }
  await next();
});

app.use(async (ctx, next) => {
  if (ctx.path === "/users" && ctx.method === "GET") {
    ctx.status = 200;
    ctx.response = { users: ["Alice", "Bob"] };
  } else {
    ctx.status = 404;
    ctx.response = { error: "Not found" };
  }
});`,
  },
];
