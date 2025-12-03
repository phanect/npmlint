export type NpmLintConfig = {
  exports: string[];
  defaultExport: boolean;
};

export const defineConfig = (config: NpmLintConfig) => config;
