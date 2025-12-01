import type { Linter } from "eslint";

export interface NextjsConfigOptions {
  tsconfigRootDir?: string;
}

export function createNextjsConfig(options?: NextjsConfigOptions): Linter.Config[];

declare const config: Linter.Config[];
export default config;
