# Story 2A.5.S5: Implement Feedback Components

> **To implement this story:** Read the Technical Requirements, create the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [UI Component Library (Generic)](./EPIC.md)
- **Depends On**: [S2 - Configure shadcn/ui CLI and Tailwind Theme](./S2-shadcn-tailwind-setup.md)
- **Blocks**: [S6 - Add Accessibility and Error Boundary Integration](./S6-accessibility-error-boundaries.md), [S7 - Configure Storybook and Write Documentation](./S7-storybook-docs.md)
- **Runs in Parallel With**: [S3 - Implement Form Components](./S3-form-components.md), [S4 - Implement Layout Components](./S4-layout-components.md)

## User Story

**As a** developer building application interfaces
**I want** accessible feedback components (Toast, Avatar, Badge, Skeleton, Spinner)
**So that** I can provide visual feedback, display user information, show loading states, and communicate status to users with proper accessibility

## Acceptance Criteria

- [ ] Toast component implemented with variants (default, destructive, success, warning), positions (top-left, top-right, bottom-left, bottom-right), and dismiss functionality
- [ ] Avatar component implemented with image support, fallback initials, loading state, and size variants (xs, sm, md, lg, xl)
- [ ] Badge component implemented with variants (default, secondary, outline, destructive, success, warning) and size variants (sm, md, lg)
- [ ] Skeleton component implemented with customizable shapes (text, circle, rectangle) and animation options
- [ ] Spinner component implemented with size variants (xs, sm, md, lg, xl) and configurable colors
- [ ] All components accept `data-component-id` prop for analytics tracking
- [ ] All components properly typed with TypeScript interfaces exported
- [ ] Components are tree-shakeable with individual exports
- [ ] All components follow WCAG 2.1 AA accessibility standards with proper ARIA attributes
- [ ] Toast notifications are announced to screen readers with appropriate ARIA live regions
- [ ] Avatar component provides proper alt text and fallback handling
- [ ] Loading states (Skeleton, Spinner) have appropriate ARIA labels and live regions
- [ ] Each component has comprehensive unit tests with >80% coverage

## Technical Requirements

### Files to Create

| Path                                                          | Purpose                                   |
| ------------------------------------------------------------- | ----------------------------------------- |
| `packages/ui/src/components/ui/toast.tsx`                     | Toast notification component              |
| `packages/ui/src/components/ui/toaster.tsx`                   | Toast container/manager component         |
| `packages/ui/src/components/ui/use-toast.ts`                  | Toast hook for programmatic notifications |
| `packages/ui/src/components/ui/avatar.tsx`                    | Avatar component with fallback            |
| `packages/ui/src/components/ui/badge.tsx`                     | Badge component with variants             |
| `packages/ui/src/components/ui/skeleton.tsx`                  | Skeleton loading placeholder              |
| `packages/ui/src/components/ui/spinner.tsx`                   | Spinner loading indicator                 |
| `packages/ui/src/components/__tests__/toast.test.tsx`         | Toast component tests                     |
| `packages/ui/src/components/__tests__/avatar.test.tsx`        | Avatar component tests                    |
| `packages/ui/src/components/__tests__/badge.test.tsx`         | Badge component tests                     |
| `packages/ui/src/components/__tests__/skeleton.test.tsx`      | Skeleton component tests                  |
| `packages/ui/src/components/__tests__/spinner.test.tsx`       | Spinner component tests                   |

### Files to Modify

| Path                       | Changes                                      |
| -------------------------- | -------------------------------------------- |
| `packages/ui/src/index.ts` | Export all feedback components and hooks     |
| `packages/ui/package.json` | Add Radix UI toast dependencies              |
| `packages/ui/README.md`    | Add feedback components usage documentation  |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# In packages/ui directory
pnpm add @radix-ui/react-toast @radix-ui/react-avatar
pnpm add -D @testing-library/react @testing-library/user-event @testing-library/jest-dom vitest jsdom
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.

| Setting                    | Requirement                                           | TAD Reference                                                                      |
| -------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Component variants         | Use `class-variance-authority` for variant logic      | [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)                        |
| Accessibility compliance   | WCAG 2.1 Level AA with ARIA live regions             | [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture) |
| Analytics tracking         | All components accept `data-component-id` prop        | [TAD: Analytics Infrastructure](/docs/2-technical/2-tad.md#analytics--observability) |
| Component styling          | Tailwind CSS v4 with theme tokens                     | [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)                        |

**Configuration Rationale**:
- `class-variance-authority` enables type-safe variant management with automatic class merging
- ARIA live regions ensure screen readers announce toast notifications and loading state changes
- The `data-component-id` prop enables consistent analytics tracking across all applications
- Tailwind theme tokens ensure visual consistency with the design system

## Test Requirements

### Manual Verification

- [ ] **Toast Display**: Trigger toast notifications in different positions and verify they appear correctly, stack appropriately, and auto-dismiss after specified duration
- [ ] **Toast Screen Reader**: Use screen reader to verify toast messages are announced with appropriate priority (polite for info, assertive for errors)
- [ ] **Avatar Fallback**: Test avatar with broken image URL to verify fallback initials display correctly with proper contrast
- [ ] **Avatar Loading**: Verify loading state shows appropriate placeholder before image loads
- [ ] **Badge Variants**: Verify all badge variants (default, secondary, outline, destructive, success, warning) display with correct colors and contrast ratios
- [ ] **Skeleton Animation**: Verify skeleton pulse animation runs smoothly and respects user's prefers-reduced-motion setting
- [ ] **Spinner Animation**: Verify spinner rotates smoothly at appropriate speed and respects prefers-reduced-motion
- [ ] **Keyboard Navigation**: Verify toast close buttons are keyboard accessible (Tab to focus, Enter/Space to dismiss)

### Automated Tests

- [ ] Unit: `toast.test.tsx` - Toast rendering, variants, positions, auto-dismiss, manual dismiss
- [ ] Unit: `use-toast.test.tsx` - Toast hook functionality, queue management, duplicate handling
- [ ] Unit: `avatar.test.tsx` - Image rendering, fallback behavior, size variants, loading state
- [ ] Unit: `badge.test.tsx` - All variants render correctly, size variants, custom className
- [ ] Unit: `skeleton.test.tsx` - Shape variants, animation toggle, custom dimensions
- [ ] Unit: `spinner.test.tsx` - Size variants, color customization, ARIA labels

### Integration Tests

- [ ] Toast notifications integrate with error boundaries - verify errors trigger appropriate toast messages
- [ ] Toast queue management - verify multiple toasts stack/queue correctly and don't exceed viewport limits
- [ ] Avatar lazy loading - verify images load efficiently and don't block page rendering
- [ ] Skeleton components integrate with suspense boundaries for loading states

### Verification Commands

```bash
# Run component tests
pnpm --filter @repo/ui test

# Run tests with coverage
pnpm --filter @repo/ui test:coverage

# Run accessibility tests
pnpm --filter @repo/ui test -- --testNamePattern="accessibility"

# Type check
pnpm --filter @repo/ui type-check

# Lint components
pnpm --filter @repo/ui lint

# Build package
pnpm --filter @repo/ui build

# Verify exports
node -e "const ui = require('./packages/ui/dist'); console.log(Object.keys(ui));"
```

## Implementation Notes

### Implementation Sequence

1. **Toast Notification System**
   - Create toast component with Radix UI Toast primitive
   - Implement toaster container component with portal rendering
   - Build `useToast` hook for programmatic toast management
   - Add toast queue logic to prevent viewport overflow
   - Configure ARIA live regions for screen reader announcements

2. **Avatar Component**
   - Create avatar component with Radix UI Avatar primitive
   - Implement image loading with fallback to initials
   - Add loading state skeleton
   - Support size variants (xs, sm, md, lg, xl)
   - Ensure proper alt text handling

3. **Badge Component**
   - Create badge component using `class-variance-authority`
   - Implement semantic color variants with theme tokens
   - Add size variants
   - Ensure sufficient color contrast (WCAG AA)

4. **Skeleton Component**
   - Create skeleton component with pulse animation
   - Support shape variants (text, circle, rectangle)
   - Respect `prefers-reduced-motion` media query
   - Make dimensions fully customizable

5. **Spinner Component**
   - Create spinner with SVG or CSS animation
   - Implement size variants
   - Add color customization via Tailwind theme
   - Include ARIA live region for loading announcements

### Key Concepts

- **Toast Queue Management**: Multiple toasts should stack vertically without exceeding viewport, with automatic dismissal maintaining queue order
- **ARIA Live Regions**: Toast notifications use `role="status"` (polite) for info/success and `role="alert"` (assertive) for errors/warnings
- **Fallback Strategy**: Avatar component cascades from image → initials → default icon with graceful transitions
- **Reduced Motion**: Loading animations must respect `prefers-reduced-motion: reduce` by using static alternatives
- **Color Contrast**: All badge variants must meet WCAG 2.1 AA contrast ratios (4.5:1 for normal text, 3:1 for large text)

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.

Reference the TAD for implementation patterns:

- [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)
- [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture)

Key pattern notes for this story:

- Use Radix UI primitives for Toast and Avatar to handle complex accessibility requirements automatically
- Implement toast hook with reducer pattern for queue state management
- Use `class-variance-authority` for variant management with TypeScript inference
- Avatar fallback should compute initials from display name (first letter of first/last name)
- Skeleton animations should use CSS `animation-play-state: paused` when prefers-reduced-motion is detected

### Troubleshooting

| Issue                                              | Cause                                          | Solution                                                              |
| -------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------- |
| Toasts not announcing to screen reader             | Missing ARIA live region or incorrect role     | Ensure Toast.Root has `role="status"` or `role="alert"` attribute     |
| Avatar images not loading                          | CORS issues or missing error handling          | Add `crossOrigin` prop and implement onError handler for fallback     |
| Skeleton animation causing motion sickness         | Animation runs regardless of user preference   | Wrap animation CSS in `@media (prefers-reduced-motion: no-preference)` query |
| Badge colors don't meet contrast requirements      | Insufficient contrast between bg and text      | Use contrast checker; adjust Tailwind color tokens in theme config    |
| Multiple toasts overlap or exceed viewport         | No queue limit enforcement                     | Implement max toast limit (e.g., 5) with FIFO removal logic           |
| Spinner not visible on certain backgrounds         | Fixed color doesn't work on all backgrounds    | Accept color prop and use currentColor for automatic inheritance      |

### Reference Materials

- [Radix UI Toast Documentation](https://www.radix-ui.com/primitives/docs/components/toast)
- [Radix UI Avatar Documentation](https://www.radix-ui.com/primitives/docs/components/avatar)
- [WCAG 2.1 ARIA Live Regions](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [WebAIM: Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [shadcn/ui Toast Component](https://ui.shadcn.com/docs/components/toast)
- [shadcn/ui Avatar Component](https://ui.shadcn.com/docs/components/avatar)
- [shadcn/ui Badge Component](https://ui.shadcn.com/docs/components/badge)
- [shadcn/ui Skeleton Component](https://ui.shadcn.com/docs/components/skeleton)

## Estimated Effort

**Size**: M (4-8h)

**Breakdown**:

- Toast system (toast, toaster, useToast hook): 2h
- Avatar component with fallback logic: 1h
- Badge component with variants: 1h
- Skeleton component: 0.5h
- Spinner component: 0.5h
- Unit tests for all components: 2h
- Integration tests and manual verification: 1h

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling) - Tailwind CSS v4, shadcn/ui component foundation
- [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture) - WCAG 2.1 AA compliance, analytics integration
- [TAD: Testing Architecture](/docs/2-technical/2-tad.md#testing-architecture) - Vitest unit testing, >80% coverage requirement

### Story-Specific Decisions

#### AD-2A.5.S5.1: Toast Queue Limit

**Scope**: Story-specific (isolated to Toast component implementation)

**Decision**: Implement a maximum of 5 concurrent toasts visible on screen, with FIFO (first-in-first-out) removal when limit is exceeded.

**Rationale**:

- Prevents viewport overflow on mobile devices
- Reduces cognitive load for users when multiple notifications fire
- Industry standard (GitHub, Linear, Vercel use 3-5 toast limits)
- Ensures screen reader users aren't overwhelmed with announcements

**Consequences**:

- Toast messages may be missed if more than 5 fire in rapid succession
- Developers must design systems to batch or prioritize notifications
- Queue management adds complexity to toast hook implementation

**Alternatives Considered**:

- **Unlimited toasts with scrolling container**: Rejected because it creates poor UX and accessibility issues with screen readers
- **Toast count of 3**: Rejected as too restrictive for complex application scenarios (e.g., batch operations with multiple success/error messages)

#### AD-2A.5.S5.2: Avatar Initials Algorithm

**Scope**: Story-specific (isolated to Avatar component fallback logic)

**Decision**: Generate initials from display name by taking the first letter of the first word and first letter of the last word (e.g., "John Doe" → "JD", "Alice" → "A").

**Rationale**:

- Matches user expectations from common platforms (Gmail, Slack, Linear)
- Handles both full names and single names gracefully
- Remains readable at small avatar sizes (single letter or two letters)
- Avoids middle name complexity

**Consequences**:

- Users with hyphenated last names or multiple first names may see unexpected initials
- Non-Latin character sets (CJK, Arabic) may display differently than expected
- Single-word names show only one initial

**Alternatives Considered**:

- **First two letters of first name**: Rejected because "JO" for "John" is less recognizable than "JD" for "John Doe"
- **Custom initial prop**: Considered but deferred; can be added later if needed without breaking change

## Out of Scope

The following items are explicitly NOT part of this story:

- **Progress Bar Component** - Deferred to future story if needed; spinner covers basic loading states
- **Alert/Callout Component** - Different from Toast; deferred to future UI component story
- **Notification Center/Inbox** - Toast is ephemeral; persistent notifications require different component (deferred to product-specific features)
- **Custom Toast Sounds** - Audio notifications not required for MVP; deferred to accessibility enhancements
- **Toast Persistence** - Toasts are ephemeral; persistent storage not in scope
- **Avatar Group Component** - Overlapping avatar stacks deferred to future story
- **Animated Badge** - Static badges only; animated indicators (pulse/ping) deferred to future enhancements
- **Skeleton Theme Customization** - Uses default pulse animation; theme variants deferred

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S2**: [Configure shadcn/ui CLI and Tailwind Theme](./S2-shadcn-tailwind-setup.md) - Tailwind theme tokens, shadcn/ui CLI, and `cn()` utility must be configured

### Enables (Unblocks These Stories)

- **S6**: [Add Accessibility and Error Boundary Integration](./S6-accessibility-error-boundaries.md) - Requires all components (including feedback components) to exist before adding accessibility tests and error boundary integration
- **S7**: [Configure Storybook and Write Documentation](./S7-storybook-docs.md) - Requires all components to exist before creating comprehensive Storybook stories

## References

### Epic & TAD References

- [EPIC.md: UI Component Library (Generic)](./EPIC.md)
- [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)
- [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture)
- [TAD: Testing Architecture](/docs/2-technical/2-tad.md#testing-architecture)
- [TAD: Analytics Infrastructure](/docs/2-technical/2-tad.md#analytics--observability)

### ADR References

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)

### External Documentation

- [Radix UI Toast](https://www.radix-ui.com/primitives/docs/components/toast)
- [Radix UI Avatar](https://www.radix-ui.com/primitives/docs/components/avatar)
- [WCAG 2.1 Status Messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [class-variance-authority](https://cva.style/docs)

## Verification Checklist

### Pre-Verification

- [ ] S2 (shadcn/ui and Tailwind setup) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] `@repo/ui` package exists with proper TypeScript configuration

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm --filter @repo/ui lint`)
- [ ] Types compile successfully (`pnpm --filter @repo/ui type-check`)
- [ ] Tests written and passing (`pnpm --filter @repo/ui test`)
- [ ] Coverage > 80% for new components (`pnpm --filter @repo/ui test:coverage`)
- [ ] All components accept `data-component-id` prop
- [ ] All components properly exported from `packages/ui/src/index.ts`
- [ ] WCAG 2.1 AA accessibility requirements met (color contrast, ARIA labels, keyboard navigation)
- [ ] Animations respect `prefers-reduced-motion` setting

### Documentation

- [ ] Code comments where logic isn't self-evident (especially toast queue management, avatar fallback logic)
- [ ] README.md updated with usage examples for all feedback components
- [ ] TypeScript interfaces exported and documented with JSDoc comments
- [ ] Component props documented with examples

### Git Hygiene

- [ ] Conventional commit message used (e.g., `feat(ui): implement feedback components`)
- [ ] No unrelated changes included
- [ ] PR description includes component preview screenshots or GIFs

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
