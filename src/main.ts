import { execSync } from "node:child_process";
import { cp, mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { glob } from "glob";
import type { NpmLintConfig } from "./lib.ts";

const cwdPath = process.cwd();
const tmpDirPath = await mkdtemp(join(tmpdir(), "npmlint-"));
const tgzDirPath = await mkdir(join(tmpDirPath, "tgzs"), { recursive: true });
const tmpFixtureDir = join(tmpDirPath, "fixture");
const tmpAppDirPath = join(tmpDirPath, "app");

execSync(`npm pack . --pack-destination "${ tgzDirPath }"`, {
  cwd: cwdPath,
  encoding: "utf-8",
});

const [ tgzFilePath ] = await glob(`${ tgzDirPath }/*.tgz`);

if (!tgzFilePath) {
  throw new Error("Failed to npm pack");
}

await cp(join(cwdPath, "fixture"), tmpFixtureDir, { recursive: true });

// Helper function to run npm commands
function runCommand(command: string, cwd: string): void {
  console.log(`Running: ${ command } in ${ cwd }`);
  execSync(command, {
    cwd,
    stdio: "inherit",
  });
}

runCommand(`npm add ${ tgzFilePath }`, tmpFixtureDir);

const config = await import(join(tmpFixtureDir, "npmlint.config.ts")) as NpmLintConfig;

//
// Generate test js file
//

const appCode = `
  import { ok } from "node:assert";
  import ${ config.defaultExport === true ? "__defaultExportedSymbol," : "" } {${ config.exports.join(", ") }};

  ${
    config.defaultExport === true
      ? "ok(__defaultExportedSymbol, 'The default export is not exported properly.');"
      : ""
  }
  ${
    config.exports
      .map((exportedSymbol) => `ok(${ exportedSymbol }, "${ exportedSymbol } is not exported properly.");`)
      .join("\n")
  }
`.trim();

await Promise.all([
  writeFile(join(tmpAppDirPath, "app.js"), appCode),
  writeFile(join(tmpAppDirPath, "package.json"), JSON.stringify({
    name: "npmlint-test-app",
    version: "0.0.0",
    private: true,
    license: "Apache-2.0",
    type: "module",
    devDependencies: {
      npmlint: "workspace:*",
      tsdown: "0.16.8",
    },
    packageManager: "pnpm@10.24.0",
  })),
]);
