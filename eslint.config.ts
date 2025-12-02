import { core, nodejs, unbundled } from "@phanect/lint";
import type { Linter } from "eslint";

const configs: Linter.Config[] = [
  {
    ignores: [
      "./**/dist/**",
    ],
  },

  ...core,
  ...nodejs,
  ...unbundled,

  {
    // Do not add `files: [ "*" ],` here.

    languageOptions: {
      parserOptions: {
        projectService: true,
        // TODO Use `project: true` instead if you use `astro` ruleset.
        // project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];

export default configs;
