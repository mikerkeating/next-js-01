import type { Linter } from "eslint";

export interface ReactLibraryConfigOptions {
  tsconfigRootDir?: string;
}

export function createReactLibraryConfig(options?: ReactLibraryConfigOptions): Linter.Config[];

declare const config: Linter.Config[];
export default config;
