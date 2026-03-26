export default [
  {
    filetype: "python",
    code: `from dataclasses import dataclass, field
from typing import Optional
import asyncio
import json

@dataclass
class Config:
    host: str = "localhost"
    port: int = 8080
    debug: bool = False
    workers: int = 4
    max_connections: int = 100
    timeout: float = 30.0

@dataclass
class Connection:
    reader: asyncio.StreamReader
    writer: asyncio.StreamWriter
    addr: str
    active: bool = True

class Server:
    def __init__(self, config: Config):
        self.config = config
        self.connections: dict[str, Connection] = {}
        self._running = False

    async def start(self):
        self._running = True
        server = await asyncio.start_server(
            self._handle_client,
            self.config.host,
            self.config.port,
        )
        print(f"Listening on {self.config.host}:{self.config.port}")
        async with server:
            await server.serve_forever()

    async def _handle_client(self, reader, writer):
        addr = writer.get_extra_info("peername")
        conn = Connection(reader=reader, writer=writer, addr=str(addr))
        self.connections[conn.addr] = conn

        try:
            while conn.active:
                data = await asyncio.wait_for(
                    reader.readline(),
                    timeout=self.config.timeout,
                )
                if not data:
                    break
                message = data.decode().strip()
                response = self._process(message)
                writer.write(json.dumps(response).encode() + b"\\n")
                await writer.drain()
        except asyncio.TimeoutError:
            print(f"Connection {addr} timed out")
        finally:
            del self.connections[conn.addr]
            writer.close()
            await writer.wait_closed()

    def _process(self, message: str) -> dict:
        try:
            payload = json.loads(message)
            action = payload.get("action", "")
            if action == "ping":
                return {"status": "pong"}
            elif action == "stats":
                return {"connections": len(self.connections)}
            else:
                return {"error": f"Unknown action: {action}"}
        except json.JSONDecodeError:
            return {"error": "Invalid JSON"}

    async def shutdown(self):
        self._running = False
        for conn in self.connections.values():
            conn.active = False
            conn.writer.close()
        self.connections.clear()

if __name__ == "__main__":
    config = Config(host="0.0.0.0", port=9000, debug=True)
    asyncio.run(Server(config).start())`,
  },
];
