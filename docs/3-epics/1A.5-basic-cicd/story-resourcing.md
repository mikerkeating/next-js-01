# Story Resourcing - Epic 1A.5: Basic CI/CD Pipeline

## Resourcing Table

| Story | Title                                            | Primary Role | Secondary Role | Hand-off Notes                                                                                                                           |
| ----- | ------------------------------------------------ | ------------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| S1    | Create PR Workflow with Quality Checks           | devops       | —              | N/A                                                                                                                                      |
| S2    | Configure Turborepo Filtering for CI             | devops       | —              | N/A                                                                                                                                      |
| S3    | Add Coverage Reporting to PRs                    | devops       | qa             | N/A                                                                                                                                      |
| S4    | Integrate Preview Deployment and E2E Smoke Tests | qa           | devops         | QA creates E2E smoke tests and Playwright configuration; DevOps integrates into CI workflow and configures preview deployment automation |
| S5    | Create Main Branch Workflow                      | devops       | —              | N/A                                                                                                                                      |
| S6    | Configure Branch Protection Rules                | devops       | —              | N/A                                                                                                                                      |
| S7    | Set Up Dependabot and Security Scanning          | devops       | security       | N/A                                                                                                                                      |

## Role Distribution Summary

| Role     | As Primary             | As Secondary |
| -------- | ---------------------- | ------------ |
| devops   | S1, S2, S3, S5, S6, S7 | S4           |
| qa       | S4                     | S3           |
| security | —                      | S7           |
