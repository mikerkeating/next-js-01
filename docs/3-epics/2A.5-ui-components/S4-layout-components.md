# Story 2A.5.S4: Implement Layout Components

> **To implement this story:** Read the Technical Requirements, create the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [UI Component Library (Generic)](./EPIC.md)
- **Depends On**: [S2 - Configure shadcn/ui CLI and Tailwind Theme](./S2-shadcn-tailwind-setup.md)
- **Blocks**: [S6 - Add Accessibility and Error Boundary Integration](./S6-accessibility-error-boundaries.md), [S7 - Configure Storybook and Write Documentation](./S7-storybook-docs.md)
- **Runs in Parallel With**: [S3 - Implement Form Components](./S3-form-components.md), [S5 - Implement Feedback Components](./S5-feedback-components.md)

## User Story

**As a** developer building application interfaces
**I want** accessible, composable layout components (Card, Dialog, Dropdown Menu, Tabs, Popover, Sheet)
**So that** I can structure content, manage overlays, and create interactive navigation patterns with proper accessibility and responsive behavior

## Acceptance Criteria

- [ ] Card component implemented with header, content, footer composition and variants (default, elevated, outline)
- [ ] Dialog component implemented with overlay, animations, focus trapping, and close on outside click/escape
- [ ] Dropdown Menu component implemented with keyboard navigation, submenus, separators, and checkbox/radio items
- [ ] Tabs component implemented with keyboard navigation, accessible ARIA attributes, and variants (default, pills, underline)
- [ ] Popover component implemented with positioning, trigger behavior, and proper portal rendering
- [ ] Sheet component implemented as slide-in panel with positions (top, right, bottom, left) and overlay
- [ ] All components accept `data-component-id` prop for analytics tracking
- [ ] All components properly typed with TypeScript interfaces exported
- [ ] Components are tree-shakeable with individual exports
- [ ] All components follow WCAG 2.1 AA accessibility standards with proper ARIA attributes
- [ ] Keyboard navigation works for all interactive components (Arrow keys, Enter, Escape, Tab)
- [ ] Focus management handles properly (focus trap in Dialog/Sheet, return focus on close)
- [ ] Each component has comprehensive unit tests with >80% coverage

## Technical Requirements

### Files to Create

| Path                                                       | Purpose                                    |
| ---------------------------------------------------------- | ------------------------------------------ |
| `packages/ui/src/components/ui/card.tsx`                   | Card layout component with composition     |
| `packages/ui/src/components/ui/dialog.tsx`                 | Modal dialog component with overlay        |
| `packages/ui/src/components/ui/dropdown-menu.tsx`          | Dropdown menu with submenus                |
| `packages/ui/src/components/ui/tabs.tsx`                   | Tab navigation component                   |
| `packages/ui/src/components/ui/popover.tsx`                | Popover positioning component              |
| `packages/ui/src/components/ui/sheet.tsx`                  | Slide-in sheet/drawer component            |
| `packages/ui/src/components/ui/separator.tsx`              | Visual divider component                   |
| `packages/ui/src/components/__tests__/card.test.tsx`       | Card component tests                       |
| `packages/ui/src/components/__tests__/dialog.test.tsx`     | Dialog component tests                     |
| `packages/ui/src/components/__tests__/dropdown-menu.test.tsx` | Dropdown menu tests                     |
| `packages/ui/src/components/__tests__/tabs.test.tsx`       | Tabs component tests                       |
| `packages/ui/src/components/__tests__/popover.test.tsx`    | Popover component tests                    |
| `packages/ui/src/components/__tests__/sheet.test.tsx`      | Sheet component tests                      |

### Files to Modify

| Path                       | Changes                                      |
| -------------------------- | -------------------------------------------- |
| `packages/ui/src/index.ts` | Export all layout components                 |
| `packages/ui/package.json` | Add Radix UI overlay/menu dependencies       |
| `packages/ui/README.md`    | Add layout components usage documentation    |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# In packages/ui directory
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-popover @radix-ui/react-separator
pnpm add -D @testing-library/react @testing-library/user-event @testing-library/jest-dom vitest jsdom
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.

| Setting                    | Requirement                                           | TAD Reference                                                                      |
| -------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Component variants         | Use `class-variance-authority` for variant logic      | [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)                        |
| Overlay positioning        | Use Radix UI Popper for dropdown/popover positioning  | [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture) |
| Focus management           | All overlay components must trap focus                | [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture) |
| Analytics tracking         | All components accept `data-component-id` prop        | [TAD: Analytics Infrastructure](/docs/2-technical/2-tad.md#analytics--observability) |
| Animations                 | Use Tailwind CSS transitions for enter/exit           | [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)                        |
| Portal rendering           | Use Radix UI Portal for overlay components            | [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture) |

**Configuration Rationale**: Radix UI provides accessible primitives with built-in overlay management, focus trapping, and keyboard navigation. Portal rendering ensures overlays render above all other content regardless of DOM hierarchy. See [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture) for complete integration patterns.

## Test Requirements

### Manual Verification

- [ ] **Card Composition**: Render cards with various combinations of header, content, footer - verify proper spacing and borders
- [ ] **Dialog Focus Trap**: Open dialog and press Tab - verify focus stays within dialog until closed
- [ ] **Dropdown Menu Navigation**: Open dropdown and use Arrow keys - verify item selection and submenu expansion
- [ ] **Tabs Keyboard Navigation**: Use Arrow keys to navigate tabs - verify proper ARIA attributes and panel display
- [ ] **Popover Positioning**: Open popover near viewport edges - verify it repositions to stay visible
- [ ] **Sheet Slide Animation**: Open sheet from different positions (top, right, bottom, left) - verify smooth animations
- [ ] **Escape Key Handling**: Press Escape in Dialog/Sheet/Dropdown - verify components close and return focus
- [ ] **Outside Click**: Click outside Dialog/Popover/Dropdown - verify components close as expected
- [ ] **Analytics Tracking**: Verify `data-component-id` appears in rendered DOM for all components

### Automated Tests

- [ ] Unit: `card.test.tsx` - Test card composition (CardHeader, CardContent, CardFooter), variants, className merging
- [ ] Unit: `dialog.test.tsx` - Test dialog open/close, focus trap, escape key, outside click, ARIA attributes
- [ ] Unit: `dropdown-menu.test.tsx` - Test menu items, submenus, keyboard navigation, checkbox/radio items
- [ ] Unit: `tabs.test.tsx` - Test tab selection, keyboard navigation, ARIA attributes, panel visibility
- [ ] Unit: `popover.test.tsx` - Test popover trigger, positioning, close behavior, controlled/uncontrolled modes
- [ ] Unit: `sheet.test.tsx` - Test sheet positions, overlay, focus trap, animations, close behavior
- [ ] Integration: Layout components work together (Card with Dialog trigger, Tabs with Dropdown menus)

### Verification Commands

```bash
# Install dependencies
cd packages/ui && pnpm install

# Build components
pnpm build

# Run unit tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Type check
pnpm typecheck

# Lint check
pnpm lint

# Test importing components from another package
cd ../../apps/demo && pnpm add @repo/ui
# Create test file importing Card, Dialog, etc.
```

## Implementation Notes

### Implementation Sequence

1. **Install Radix UI Overlay Primitives**
   - Add all required dependencies listed above
   - Verify versions match canonical-versions.md

2. **Implement Card Component**
   - Create compound components: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
   - Define variants: default, elevated (shadow), outline (border)
   - Use CSS Grid/Flexbox for internal layout
   - Add `data-component-id` prop
   - Export all sub-components and interfaces

3. **Implement Dialog Component**
   - Use @radix-ui/react-dialog primitive
   - Create compound components: Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
   - Implement focus trap with Radix primitive
   - Add overlay with semi-transparent background
   - Configure close on Escape and outside click
   - Add enter/exit animations with Tailwind transitions
   - Ensure proper ARIA attributes (aria-labelledby, aria-describedby)

4. **Implement Dropdown Menu Component**
   - Use @radix-ui/react-dropdown-menu primitive
   - Create components: DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuShortcut
   - Implement keyboard navigation (Arrow keys, Enter, Space)
   - Support icons in menu items
   - Add visual indicators for checkboxes and radio items
   - Configure positioning with Radix Popper

5. **Implement Tabs Component**
   - Use @radix-ui/react-tabs primitive
   - Create compound components: Tabs, TabsList, TabsTrigger, TabsContent
   - Define variants: default, pills, underline
   - Implement keyboard navigation (Arrow keys, Home, End)
   - Ensure proper ARIA attributes (role="tablist", aria-selected)
   - Support controlled and uncontrolled modes
   - Add smooth transitions between tab panels

6. **Implement Popover and Sheet Components**
   - Popover: Use @radix-ui/react-popover for positioned content
   - Sheet: Build on Dialog primitive with slide-in animations
   - Sheet positions: top, right (default), bottom, left
   - Configure positioning strategy and collision detection
   - Add `data-component-id` props

7. **Implement Separator Component**
   - Simple divider component for use in menus and layouts
   - Support horizontal and vertical orientations
   - Use proper ARIA role="separator"

8. **Write Comprehensive Tests**
   - Test each component in isolation
   - Test keyboard navigation and focus management
   - Test accessibility (ARIA attributes, focus trap)
   - Test animations and transitions
   - Test controlled vs uncontrolled modes
   - Verify analytics props are applied

9. **Update Package Exports and Documentation**
   - Add all components to index.ts barrel export
   - Update README with usage examples
   - Document common layout patterns

### Key Concepts

- **Compound Components**: Components designed to work together as a compositional API (e.g., CardHeader + CardContent + CardFooter)
- **Focus Trap**: Pattern that constrains keyboard focus within a component (Dialog, Sheet) until dismissed
- **Portal Rendering**: Technique to render overlays outside the DOM hierarchy to avoid z-index issues
- **Radix UI Primitives**: Unstyled, accessible primitives handling complex interaction patterns (focus management, keyboard navigation, ARIA attributes)
- **Popper Positioning**: Intelligent positioning system that adjusts overlay placement to keep content visible within viewport
- **Controlled vs Uncontrolled**: Components support both controlled (parent manages state) and uncontrolled (internal state) modes

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.

Reference the TAD for layout component patterns:

- [TAD: UI Components Architecture - Layout Components](/docs/2-technical/2-tad.md#ui-components-architecture)
- [TAD: UI & Styling - Component Variants](/docs/2-technical/2-tad.md#ui--styling)

Key pattern notes for this story:

- Use `forwardRef` for all root components to enable ref access
- Apply `cn()` utility for conditional class merging with proper variant handling
- Always spread `data-component-id` onto root elements
- Use Radix UI `asChild` pattern for flexible composition
- Implement compound components with proper TypeScript generics
- Export both components and their props interfaces

### Troubleshooting

| Issue                                          | Cause                                   | Solution                                              |
| ---------------------------------------------- | --------------------------------------- | ----------------------------------------------------- |
| Dialog not closing on outside click            | Missing onInteractOutside handler       | Verify DialogContent has proper Radix props          |
| Dropdown menu not positioning correctly        | z-index conflict or portal issue        | Ensure DropdownMenuContent uses Portal, check z-index |
| Focus not trapped in Dialog                    | Missing Radix Dialog primitive features | Use @radix-ui/react-dialog, not custom implementation |
| Tabs keyboard navigation not working           | Missing ARIA attributes or event handlers | Verify using Radix Tabs primitive correctly         |
| Sheet animation stuttering                     | CSS transition conflicts                | Use Tailwind animate classes, avoid conflicting transitions |
| Popover appears off-screen                     | Missing collision detection config      | Configure Radix Popover collisionPadding and side    |
| Card spacing inconsistent                      | Missing padding or gap utilities        | Use consistent Tailwind spacing (p-6, gap-4)         |
| Analytics `data-component-id` not appearing    | Prop not spread onto root element       | Add explicit data attribute spread to compound root  |

### Reference Materials

- [shadcn/ui Card Component](https://ui.shadcn.com/docs/components/card)
- [shadcn/ui Dialog Component](https://ui.shadcn.com/docs/components/dialog)
- [shadcn/ui Dropdown Menu Component](https://ui.shadcn.com/docs/components/dropdown-menu)
- [shadcn/ui Tabs Component](https://ui.shadcn.com/docs/components/tabs)
- [shadcn/ui Popover Component](https://ui.shadcn.com/docs/components/popover)
- [shadcn/ui Sheet Component](https://ui.shadcn.com/docs/components/sheet)
- [Radix UI Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)
- [Radix UI Dropdown Menu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu)
- [Radix UI Tabs](https://www.radix-ui.com/primitives/docs/components/tabs)
- [WCAG Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WCAG Menu Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu/)

## Estimated Effort

**Size**: M (6-8h)

**Breakdown**:

- Card and Separator components: 1h
- Dialog and Sheet components (with focus management): 2h
- Dropdown Menu component (with submenus and variants): 2h
- Tabs and Popover components: 1.5h
- Testing (unit and integration): 1.5h
- Documentation and exports: 1h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture) - Rationale for Radix UI primitives and accessibility requirements
- [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling) - Component variant system using CVA
- [Epic 2A.5: Technology Decisions](./EPIC.md#technology-decisions) - Accessibility testing with axe-core

### Story-Specific Decisions

#### AD-2A.5.S4.1: Include Sheet Component as Dialog Variant

**Scope**: Story-specific (implementation pattern decision)

**Decision**: Implement Sheet component as a separate component built on Dialog primitive, rather than as a Dialog variant.

**Rationale**:

- Sheet has distinct animation patterns (slide from edges) vs Dialog (fade/scale from center)
- Sheet typically used for different UX patterns (side panels, mobile navigation) than Dialog (confirmations, forms)
- Separate component provides clearer API and better TypeScript inference
- shadcn/ui treats Sheet and Dialog as separate components
- Implementation cost is minimal (Sheet reuses Dialog primitives)

**Consequences**:

- Developers have explicit, semantically clear components for different overlay patterns
- Slightly larger bundle size, but components are tree-shakeable
- More exports in package index, but better discoverability

**Alternatives Considered**:

- **Sheet as Dialog variant** - Rejected because animation and positioning logic differs significantly
- **Combine into single Overlay component** - Rejected because it would create overly complex API with too many props

#### AD-2A.5.S4.2: Include Separator in Layout Components Story

**Scope**: Story-specific (component grouping decision)

**Decision**: Include Separator component in this story alongside other layout components.

**Rationale**:

- Separator is commonly used with Dropdown Menu (DropdownMenuSeparator)
- Simple component, minimal implementation effort
- Semantically fits with layout/structure components
- Better grouped with layout than feedback components

**Consequences**:

- Complete set of dropdown menu sub-components available immediately
- Separator available for other layout uses (Card sections, navigation)
- Minimal impact on story size

**Alternatives Considered**:

- **Defer to separate story** - Rejected because overhead not justified for simple component
- **Include in S3 (Forms)** - Rejected because Separator is not a form component

## Out of Scope

The following items are explicitly NOT part of this story:

- **Accordion component** - Deferred to future epic if needed (expand/collapse pattern)
- **Navigation Menu with mega menus** - Complex navigation patterns handled at application layer
- **Drawer component distinct from Sheet** - Sheet component covers drawer use case
- **Tooltip component** - Deferred to S5 (Feedback Components) as it provides user feedback
- **Context Menu (right-click menu)** - Deferred to future epic if needed
- **Command Palette** - Complex search/command pattern deferred to future epic
- **Resizable panels** - Advanced layout feature deferred to future epic if needed
- **Storybook stories** - Deferred to S7 (Configure Storybook and Write Documentation)
- **Error boundary integration** - Deferred to S6 (Add Accessibility and Error Boundary Integration)
- **Accessibility audit with axe-core** - Deferred to S6 (Add Accessibility and Error Boundary Integration)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S2**: [Configure shadcn/ui CLI and Tailwind Theme](./S2-shadcn-tailwind-setup.md) - Requires shadcn/ui CLI configuration and theme tokens to be in place before adding components

### Enables (Unblocks These Stories)

- **S6**: [Add Accessibility and Error Boundary Integration](./S6-accessibility-error-boundaries.md) - Provides components to test accessibility and error boundary integration
- **S7**: [Configure Storybook and Write Documentation](./S7-storybook-docs.md) - Provides components to document in Storybook

## References

### Epic & TAD References

- [EPIC.md: UI Component Library (Generic)](./EPIC.md)
- [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture)
- [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)
- [TAD: Analytics Infrastructure](/docs/2-technical/2-tad.md#analytics--observability)

### External Documentation

- [shadcn/ui Components Documentation](https://ui.shadcn.com/docs/components)
- [Radix UI Primitives Documentation](https://www.radix-ui.com/primitives)
- [WCAG ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Tailwind CSS Transitions](https://tailwindcss.com/docs/transition-property)

## Verification Checklist

### Pre-Verification

- [ ] S2 (shadcn/ui CLI and Tailwind Theme) completed and verified
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] shadcn/ui CLI configured and operational
- [ ] Tailwind CSS theme tokens defined

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm lint` passes)
- [ ] Types compile successfully (`pnpm typecheck` passes)
- [ ] Build succeeds (`pnpm build` produces dist/ output)
- [ ] Tests written and passing (`pnpm test` passes)
- [ ] Coverage >80% for new components (`pnpm test:coverage`)
- [ ] All components individually importable (tree-shakeable)

### Accessibility

- [ ] All overlay components properly trap focus
- [ ] Keyboard navigation works (Arrow keys, Enter, Escape, Tab)
- [ ] Focus returns to trigger element when overlay closes
- [ ] All interactive elements have proper ARIA attributes
- [ ] Focus indicators visible and meet contrast requirements
- [ ] Screen reader announcements work correctly (dialog/menu opened/closed)

### Documentation

- [ ] All component props interfaces exported and documented with JSDoc
- [ ] README.md updated with layout component usage examples
- [ ] Code comments explain compound component patterns
- [ ] Common layout patterns documented

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] Commit message follows pattern: `feat(2A.5.S4): implement layout components`

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
