import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    main: "src/index.ts",
  },
  format: [ "esm" ],

  dts: true,
  sourcemap: false,

  treeshake: true,
  minify: false,
  clean: true,
});
