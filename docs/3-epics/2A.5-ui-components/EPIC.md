# Epic 2A.5: UI Component Library (Generic)

> **To create stories for this epic:** Define the epic scope and acceptance criteria first, then break down into stories following the [story template](../../0-process/references/story-details-template.md). Each story should be independently implementable and testable.

## Context

- **PRD Reference**: [PRD: Feature M.3 - Organization-Specific Content Views](/docs/1-product/1-prd.md#feature-m3-organization-specific-content-views)
- **TAD Reference**: [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture)
- **Phase**: 2A - Core Platform Packages (Week 2)
- **Type**: Foundation

## Dependencies

### Requires (Must Complete First)

| Epic | Title | Reason |
|------|-------|--------|
| 2A.3 | [Observability Package](../2A.3-observability/EPIC.md) | Error boundary integration for component error handling |
| 2A.4 | [Analytics Infrastructure](../2A.4-analytics-infra/EPIC.md) | Component tracking utilities and `data-component-id` patterns |

### Blocks (Enables These Epics)

| Epic | Title | What This Provides |
|------|-------|-------------------|
| 2A.6 | [Middleware Package](../2A.6-middleware/EPIC.md) | UI components may be used in middleware configuration |
| 2B.5 | [Product UI Components](../2B.5-product-ui/EPIC.md) | Generic components as foundation for product-specific composite components |
| 3A.2 | [Routing Application Shell](../3A.2-routing-shell/EPIC.md) | Layout and navigation components |
| 3B.4 | [Documentation Application](../3B.4-docs-app/EPIC.md) | Generic UI components for documentation interface |
| 3B.5 | [Demo & Marketing Application](../3B.5-demo-marketing/EPIC.md) | Marketing-ready component library |
| 3B.6 | [Authenticated Tools Application](../3B.6-tools/EPIC.md) | UI components for authenticated application interfaces |

### Can Run in Parallel With

| Epic | Title | Notes |
|------|-------|-------|
| 2A.2 | [Database Infrastructure](../2A.2-database-infra/EPIC.md) | Independent infrastructure; no data dependencies |
| 2A.4 | [Analytics Infrastructure](../2A.4-analytics-infra/EPIC.md) | Component tracking integration can be added after initial implementation |

## Overview

This epic establishes the generic UI component library for the platform, built on shadcn/ui and Tailwind CSS. The `@repo/ui` package provides accessible, customizable, and well-documented components that form the foundation for all application interfaces. This epic focuses exclusively on generic components — product-specific components like Organisation Switcher and Role Badge are deferred to Epic 2B.5.

**Key Deliverables:**

- `@repo/ui` package with shadcn/ui CLI configured
- Tailwind CSS v4 theme tokens integrated with design system
- Core components: Button, Input, Select, Card, Dialog, Dropdown Menu, Tabs, Toast, Avatar, Badge, Skeleton, Spinner/Loading
- `data-component-id` props on all components for analytics tracking
- Error boundary integration for graceful error handling
- Accessibility compliance (WCAG 2.1 AA) with axe-core tests
- Storybook documentation for each component

## Acceptance Criteria

> **Note**: Epic acceptance criteria should be high-level outcomes. Story-level criteria provide the detailed verification.

- [ ] Developers can import components from `@repo/ui` in any application within the monorepo
- [ ] shadcn/ui CLI is configured and can be used to add new components
- [ ] Tailwind theme tokens are defined and shared across all applications
- [ ] All 12 core components are implemented with full variant support
- [ ] Every component has `data-component-id` prop for analytics integration
- [ ] Components gracefully handle errors via integrated error boundaries
- [ ] axe-core accessibility tests pass for all components (WCAG 2.1 AA)
- [ ] All components support keyboard navigation and have proper ARIA labels
- [ ] Storybook is deployed with stories for each component variant
- [ ] Test suite achieves 80% coverage for component utilities
- [ ] All stories complete and verified
- [ ] Documentation updated with component usage examples

## Stories

| ID | Title | Size | Status | Depends On | Blocks |
|----|-------|------|--------|------------|--------|
| S1 | [Create @repo/ui Package Structure](./S1-package-structure.md) | S | ⬜ | - | S2, S3, S4 |
| S2 | [Configure shadcn/ui CLI and Tailwind Theme](./S2-shadcn-tailwind-setup.md) | M | ⬜ | S1 | S3, S4, S5 |
| S3 | [Implement Form Components](./S3-form-components.md) | M | ⬜ | S2 | S6, S7 |
| S4 | [Implement Layout Components](./S4-layout-components.md) | M | ⬜ | S2 | S6, S7 |
| S5 | [Implement Feedback Components](./S5-feedback-components.md) | M | ⬜ | S2 | S6, S7 |
| S6 | [Add Accessibility and Error Boundary Integration](./S6-accessibility-error-boundaries.md) | M | ⬜ | S3, S4, S5 | S7 |
| S7 | [Configure Storybook and Write Documentation](./S7-storybook-docs.md) | M | ⬜ | S3, S4, S5, S6 | - |

**Status Legend**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

## Story Dependency Graph

```
S1 (Package structure)
 │
 └──→ S2 (shadcn/ui + Tailwind setup)
       │
       ├──→ S3 (Form components: Button, Input, Select)
       │     │
       ├──→ S4 (Layout components: Card, Dialog, Dropdown, Tabs)
       │     │
       └──→ S5 (Feedback components: Toast, Avatar, Badge, Skeleton, Spinner)
             │
             └───────────┬────────────────┘
                         ↓
                   S6 (Accessibility + Error boundaries)
                         ↓
                   S7 (Storybook + Documentation)
```

**Parallel Execution Notes:**

- S3, S4, and S5 can run in parallel after S2 completes
- S6 requires all component stories (S3, S4, S5) to complete
- S7 requires S6 for complete accessibility testing documentation

## Technical Constraints

### Required Patterns

- **Component Architecture**: All components built on shadcn/ui primitives per [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)
- **Analytics Integration**: All components must accept `data-component-id` prop per [TAD: Analytics Infrastructure](/docs/2-technical/2-tad.md#analytics--observability)
- **Error Handling**: Interactive components must integrate with error boundaries per [TAD: Observability](/docs/2-technical/2-tad.md#observability-architecture)
- **Monorepo Package**: Package must follow `@repo/*` naming convention per [ADR-001](/docs/2-technical/adr/001-monorepo-turborepo.md)
- **Accessibility**: All components must pass WCAG 2.1 Level AA per [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture)

### Technology Decisions

| Decision | Choice | Reference |
|----------|--------|-----------|
| Component Library | shadcn/ui | [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling) |
| Styling Framework | Tailwind CSS v4 | [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling) |
| Icon Library | Lucide React | [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling) |
| Component Documentation | Storybook | [TAD: Development Tools](/docs/2-technical/2-tad.md#development-tools) |
| Accessibility Testing | axe-core | [TAD: Testing Architecture](/docs/2-technical/2-tad.md#testing-architecture) |

### Constraints

- **Generic Components Only**: This epic covers infrastructure only; product-specific components (Organisation Switcher, Role Badge, etc.) are in Epic 2B.5
- **No Product Logic**: Components must be stateless regarding business logic; state management handled by consuming applications
- **Tree-Shakeable Exports**: Each component must be individually importable to minimize bundle size
- **Server Component Compatible**: Components must work with React Server Components where applicable
- **Theme-Aware**: All components must respect light/dark mode theme preferences

## Out of Scope

The following items are explicitly NOT part of this epic:

- **Organisation Switcher** - Deferred to Epic 2B.5 (Product UI Components)
- **Role Badge** - Deferred to Epic 2B.5 (Product UI Components)
- **Role-based components** - Deferred to Epic 2B.5 (Product UI Components)
- **Permission Gate component** - Deferred to Epic 2B.5 (Product UI Components)
- **Product-specific composite components** - Deferred to Epic 2B.5
- **Radar chart for maturity models** - Deferred to Epic 2B.5 (requires product context)
- **Timeline/progress visualization** - Deferred to Epic 2B.5 (requires product context)
- **Advanced search with faceted filtering** - Deferred to Epic 2B.5 (requires product context)
- **Custom form builder components** - Complex forms handled in application layer
- **Data grid/table component** - Evaluate third-party solutions if needed in applications

## Actions or Decisions Required

> **Note**: Flag decisions that need resolution before or during implementation.

| Decision | Options | Impact | Status |
|----------|---------|--------|--------|
| shadcn/ui registry | Default vs Custom registry | Component version control | ✅ Resolved: Default registry |
| Dark mode implementation | CSS variables vs Tailwind dark mode | Theme switching approach | ✅ Resolved: Tailwind CSS v4 native dark mode |
| Toast notification position | Top-right vs Bottom-right | UX consistency | ⬜ Open |
| Form validation library | React Hook Form vs Formik | Component integration | ✅ Resolved: React Hook Form per TAD |

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| shadcn/ui component conflicts with existing styles | Low | Medium | Use CSS containment; scope component styles |
| Tailwind v4 breaking changes | Low | Medium | Pin version; test upgrades carefully |
| Accessibility compliance gaps | Medium | High | Run axe-core in CI; conduct manual accessibility review |
| Component API changes during development | Medium | Low | Define component interfaces upfront; use TypeScript strictly |
| Storybook build complexity | Low | Low | Configure proper webpack/vite for monorepo |
| Bundle size concerns | Medium | Medium | Implement tree-shaking; monitor with bundlephobia |

## Estimated Effort

| Metric | Value |
|--------|-------|
| Total Stories | 7 |
| Total Hours | 32-48h |
| Calendar Days | 4-5 days |
| Parallel Tracks | 3 |

### Story Breakdown

| Size | Count | Hours |
|------|-------|-------|
| XS (1-2h) | 0 | 0h |
| S (2-4h) | 1 | 2-4h |
| M (4-8h) | 6 | 24-48h |
| L (8-16h) | 0 | 0h |

## References

### Internal Documentation

- [PRD: Feature M.3 - Organization-Specific Content Views](/docs/1-product/1-prd.md#feature-m3-organization-specific-content-views)
- [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)
- [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture)
- [TAD: Testing Architecture](/docs/2-technical/2-tad.md#testing-architecture)
- [Roadmap: Phase 2A](/docs/1-product/3-roadmap.md#phase-2a-core-platform-packages-week-2)
- [Canonical Technology Versions](/docs/2-technical/references/canonical-versions.md)
- [Product UI Components Specification](/docs/2-technical/2-tad-ui-components.md)

### ADRs

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)

### External Documentation

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [Storybook Documentation](https://storybook.js.org/docs)
- [React Aria Components](https://react-spectrum.adobe.com/react-aria/)
- [axe-core Accessibility Testing](https://github.com/dequelabs/axe-core)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Status

- **State**: Not Started
- **Started**: -
- **Completed**: -
- **Stories Complete**: 0/7
