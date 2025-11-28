# Testing Foundation: Story Resourcing

## Resourcing Table

| Story | Title                               | Primary Role | Secondary Role | Handoff Notes                                                                                                                                                         |
| ----- | ----------------------------------- | ------------ | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1    | Install and Configure Vitest        | DevOps       | -              | No handoff required. DevOps owns test infrastructure configuration, Turborepo pipeline, and workspace setup.                                                          |
| S2    | Configure React Testing Library     | Frontend     | -              | No handoff required. Frontend owns component testing patterns and DOM environment configuration.                                                                      |
| S3    | Set Up Mock Utilities and Factories | Backend      | Frontend       | Backend creates MSW handlers and API mocking infrastructure. Handoff to Frontend for factory review ensuring factories align with frontend data consumption patterns. |
| S4    | Install and Configure Playwright    | DevOps       | -              | No handoff required. DevOps owns E2E infrastructure, browser configuration, and CI artifact management.                                                               |
| S5    | Create @repo/testing Package        | Fullstack    | -              | No handoff required. Fullstack consolidates utilities spanning frontend (RTL, providers) and backend (MSW, factories) into shared package.                            |
| S6    | Configure Coverage Thresholds       | DevOps       | -              | No handoff required. DevOps owns coverage infrastructure, reporting configuration, and threshold enforcement.                                                         |
| S7    | Create E2E Smoke Test Suite         | Fullstack    | -              | No handoff required. Fullstack writes smoke tests validating both API health (backend) and homepage rendering (frontend).                                             |
