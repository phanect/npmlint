import { defineConfig } from "../src/lib.ts";

export const config = defineConfig({
  defaultExport: true,
  exports: [
    "variable",
    "fn",
    "obj",
  ],
});
