// Commitlint configuration for enforcing Conventional Commits
// Uses the @commitlint/config-conventional preset which enforces:
// - type(scope): subject format
// - Standard types: feat, fix, docs, style, refactor, test, build, ci, chore, perf, revert
// - Optional scopes (e.g., feat(auth):, fix(api):)
// - Breaking changes via ! suffix or BREAKING CHANGE: footer
//
// See: https://www.conventionalcommits.org/
// See: docs/2-technical/references/commit-guidelines.md

module.exports = {
  extends: ["@commitlint/config-conventional"],
};
