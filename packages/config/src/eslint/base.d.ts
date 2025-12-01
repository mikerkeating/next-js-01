import type { Linter } from "eslint";

export interface BaseConfigOptions {
  tsconfigRootDir?: string;
}

export function createBaseConfig(options?: BaseConfigOptions): Linter.Config[];

declare const config: Linter.Config[];
export default config;
