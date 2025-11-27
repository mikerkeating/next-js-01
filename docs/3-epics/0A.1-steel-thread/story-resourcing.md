# Story Resourcing - Epic 0A.1: Steel Thread

This document identifies the engineering roles required for each story in the Steel Thread epic.

## Resourcing Table

| Story | Primary Role | Secondary Role | Hand-off |
|-------|-------------|----------------|----------|
| S1: Create GitHub Repository with Branch Protection | engineer-devops | engineer-security | DevOps creates repo and protection rules → Security reviews branch protection config and access controls |
| S2: Create Minimal Next.js 16 Application | engineer-fullstack | — | — |
| S3: Configure Vercel Project Integration | engineer-devops | — | — |
| S4: Implement Health Check Endpoint | engineer-backend | — | — |
| S5: Configure Environment Variables | engineer-backend | engineer-devops | Backend implements type-safe env config → DevOps configures Vercel env variables |
| S6: Create Playwright Smoke Test Suite | engineer-qa | — | — |
| S7: Setup GitHub Actions CI Workflow | engineer-devops | engineer-qa | DevOps creates CI workflow → QA validates E2E test integration and configuration |
| S8: Document Deployment Process | engineer-documentation | engineer-devops | DevOps reviews documentation for technical accuracy → Documentation finalizes based on feedback |

## Role Summary

| Role | Primary Stories | Secondary Stories |
|------|-----------------|-------------------|
| engineer-devops | S1, S3, S7 | S5, S8 |
| engineer-backend | S4, S5 | — |
| engineer-fullstack | S2 | — |
| engineer-qa | S6 | S7 |
| engineer-security | — | S1 |
| engineer-documentation | S8 | — |
