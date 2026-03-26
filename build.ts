import { createSolidTransformPlugin } from "@/preload.ts";

const result = await Bun.build({
  entrypoints: ["./index.tsx"],
  outdir: "./bin",
  target: "bun",
  plugins: [createSolidTransformPlugin()],
  naming: "hjkl.js",
});

if (!result.success) {
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

const compile = Bun.spawn(
  ["bun", "build", "--compile", "./bin/hjkl.js", "--outfile", "./bin/hjkl"],
  {
    stdout: "inherit",
    stderr: "inherit",
  },
);
const exitCode = await compile.exited;
if (exitCode !== 0) process.exit(exitCode);

await Bun.file("./bin/hjkl.js").delete();
