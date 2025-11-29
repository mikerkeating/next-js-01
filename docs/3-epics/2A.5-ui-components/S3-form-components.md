# Story 2A.5.S3: Implement Form Components

> **To implement this story:** Read the Technical Requirements, create the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [UI Component Library (Generic)](./EPIC.md)
- **Depends On**: [S2 - Configure shadcn/ui CLI and Tailwind Theme](./S2-shadcn-tailwind-setup.md)
- **Blocks**: [S6 - Add Accessibility and Error Boundary Integration](./S6-accessibility-error-boundaries.md), [S7 - Configure Storybook and Write Documentation](./S7-storybook-docs.md)
- **Runs in Parallel With**: [S4 - Implement Layout Components](./S4-layout-components.md), [S5 - Implement Feedback Components](./S5-feedback-components.md)

## User Story

**As a** developer building forms in any application
**I want** accessible, fully-typed form components (Button, Input, Select, Checkbox, Radio, Label, Form)
**So that** I can build consistent, user-friendly forms with validation, error handling, and proper accessibility

## Acceptance Criteria

- [ ] Button component implemented with all variants (default, destructive, outline, secondary, ghost, link) and sizes (default, sm, lg, icon)
- [ ] Input component implemented with support for types (text, email, password, number, etc.), disabled state, error state, and leading/trailing icons
- [ ] Select component implemented with single and multi-select support, disabled state, error state, and placeholder
- [ ] Checkbox component implemented with indeterminate state, disabled state, and proper label association
- [ ] Radio Group component implemented with disabled state and proper keyboard navigation
- [ ] Label component implemented with proper for/htmlFor association and required indicator
- [ ] Form components (Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage) integrated with React Hook Form
- [ ] All components accept `data-component-id` prop for analytics tracking
- [ ] All components properly typed with TypeScript interfaces exported
- [ ] Components are tree-shakeable with individual exports
- [ ] All components follow WCAG 2.1 AA accessibility standards with proper ARIA attributes
- [ ] Each component has comprehensive unit tests with >80% coverage

## Technical Requirements

### Files to Create

| Path                                              | Purpose                                      |
| ------------------------------------------------- | -------------------------------------------- |
| `packages/ui/src/components/ui/button.tsx`        | Button component with variants               |
| `packages/ui/src/components/ui/input.tsx`         | Input field component                        |
| `packages/ui/src/components/ui/select.tsx`        | Select dropdown component                    |
| `packages/ui/src/components/ui/checkbox.tsx`      | Checkbox component                           |
| `packages/ui/src/components/ui/radio-group.tsx`   | Radio button group component                 |
| `packages/ui/src/components/ui/label.tsx`         | Form label component                         |
| `packages/ui/src/components/ui/form.tsx`          | Form wrapper with React Hook Form integration|
| `packages/ui/src/components/ui/textarea.tsx`      | Textarea component                           |
| `packages/ui/src/components/ui/switch.tsx`        | Toggle switch component                      |
| `packages/ui/src/hooks/use-form.ts`               | Type-safe form hook wrapper                  |
| `packages/ui/src/components/__tests__/button.test.tsx`     | Button component tests          |
| `packages/ui/src/components/__tests__/input.test.tsx`      | Input component tests           |
| `packages/ui/src/components/__tests__/select.test.tsx`     | Select component tests          |
| `packages/ui/src/components/__tests__/checkbox.test.tsx`   | Checkbox component tests        |
| `packages/ui/src/components/__tests__/form.test.tsx`       | Form integration tests          |

### Files to Modify

| Path                            | Changes                                         |
| ------------------------------- | ----------------------------------------------- |
| `packages/ui/src/index.ts`      | Export all form components                      |
| `packages/ui/package.json`      | Add React Hook Form and validation dependencies |
| `packages/ui/README.md`         | Add form components usage documentation         |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# In packages/ui directory
pnpm add react-hook-form @hookform/resolvers zod
pnpm add @radix-ui/react-checkbox @radix-ui/react-label @radix-ui/react-select @radix-ui/react-radio-group @radix-ui/react-switch @radix-ui/react-slot
pnpm add -D @testing-library/react @testing-library/user-event @testing-library/jest-dom vitest jsdom
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.

| Setting                  | Requirement                                      | TAD Reference                                                                      |
| ------------------------ | ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Component variants       | Use `class-variance-authority` for variant logic | [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)                        |
| Form validation          | Integrate with React Hook Form + Zod            | [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture) |
| Analytics tracking       | All components accept `data-component-id` prop  | [TAD: Analytics Infrastructure](/docs/2-technical/2-tad.md#analytics--observability) |
| Accessibility            | All components use Radix UI primitives          | [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture) |
| Error state styling      | Use destructive variant tokens                  | [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)                        |

**Configuration Rationale**: Radix UI provides unstyled, accessible primitives. React Hook Form offers performant form state management. Zod enables type-safe validation schemas. See [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture) for complete integration patterns.

## Test Requirements

### Manual Verification

- [ ] **Button Variants**: Render all button variants and sizes - verify visual appearance matches design system
- [ ] **Form Validation**: Submit form with invalid data - verify error messages display correctly
- [ ] **Keyboard Navigation**: Tab through form fields - verify focus order and visual indicators
- [ ] **Select Accessibility**: Navigate Select with keyboard (Arrow keys, Enter, Esc) - verify proper behavior
- [ ] **Checkbox States**: Toggle checkbox between checked, unchecked, indeterminate - verify visual feedback
- [ ] **Error States**: Trigger validation errors - verify error styling and ARIA attributes
- [ ] **Analytics Tracking**: Verify `data-component-id` appears in rendered DOM for all components

### Automated Tests

- [ ] Unit: `button.test.tsx` - Test all variants render correctly, click handlers fire, disabled state prevents interaction
- [ ] Unit: `input.test.tsx` - Test value changes, error states, disabled state, ref forwarding
- [ ] Unit: `select.test.tsx` - Test option selection, keyboard navigation, disabled state
- [ ] Unit: `checkbox.test.tsx` - Test checked state, indeterminate state, onChange handler
- [ ] Unit: `form.test.tsx` - Test form submission, validation, error display, field registration
- [ ] Integration: Form components work together in complete form scenario with validation

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
# Create test file importing Button, Input, etc.
```

## Implementation Notes

### Implementation Sequence

1. **Install Radix UI Primitives and React Hook Form**
   - Add all required dependencies listed above
   - Verify versions match canonical-versions.md

2. **Implement Button Component**
   - Use `class-variance-authority` for variant management
   - Define variants: default, destructive, outline, secondary, ghost, link
   - Define sizes: default, sm, lg, icon
   - Add `data-component-id` prop
   - Forward refs for proper DOM access
   - Export ButtonProps interface

3. **Implement Input Component**
   - Use Radix UI Slot for icon composition
   - Support all HTML input types
   - Add error state styling
   - Support disabled state
   - Add `data-component-id` prop
   - Forward refs and expose input element

4. **Implement Select Component**
   - Use @radix-ui/react-select primitive
   - Support placeholder text
   - Add error state styling
   - Support disabled state
   - Implement keyboard navigation
   - Add `data-component-id` prop

5. **Implement Checkbox, Radio Group, Label, Switch**
   - Use respective Radix UI primitives
   - Ensure proper ARIA associations
   - Add disabled and error states
   - Support indeterminate state for Checkbox
   - Add `data-component-id` props

6. **Implement Form Components with React Hook Form**
   - Create FormProvider wrapper
   - Implement FormField for field registration
   - Create FormItem, FormLabel, FormControl for layout
   - Add FormDescription and FormMessage for hints/errors
   - Integrate with Zod for validation schemas

7. **Write Comprehensive Tests**
   - Test each component in isolation
   - Test form integration scenarios
   - Test accessibility (ARIA attributes)
   - Test keyboard navigation
   - Verify analytics props are applied

8. **Update Package Exports and Documentation**
   - Add all components to index.ts barrel export
   - Update README with usage examples
   - Document common form patterns

### Key Concepts

- **Radix UI Primitives**: Unstyled, accessible component primitives that handle complex interaction patterns (keyboard nav, ARIA, focus management)
- **Class Variance Authority (CVA)**: Type-safe variant definition enabling consistent component APIs across the library
- **React Hook Form**: Performant form library using uncontrolled components and refs to minimize re-renders
- **Zod Validation**: Type-safe schema validation with automatic TypeScript inference
- **Compound Components**: Form components work together as a compositional API (FormField wraps FormItem, FormLabel, FormControl, FormMessage)
- **Ref Forwarding**: All components forward refs to underlying DOM elements for imperative access when needed

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.

Reference the TAD for form component patterns:

- [TAD: UI Components Architecture - Form Components](/docs/2-technical/2-tad.md#ui-components-architecture)
- [TAD: UI & Styling - Component Variants](/docs/2-technical/2-tad.md#ui--styling)

Key pattern notes for this story:

- Use `forwardRef` with proper TypeScript generics for all interactive components
- Apply `cn()` utility for conditional class merging in all components
- Always spread `data-component-id` and other data attributes onto root element
- Use Radix UI `asChild` prop for composition where applicable
- Export both the component and its props interface for consumer type safety

### Troubleshooting

| Issue                                          | Cause                                   | Solution                                              |
| ---------------------------------------------- | --------------------------------------- | ----------------------------------------------------- |
| Select dropdown not positioning correctly      | Missing @radix-ui/react-popper          | Verify Radix Select includes Popper, check z-index   |
| Form validation not triggering                 | Field not registered with React Hook Form | Ensure FormField wraps input with proper name prop |
| TypeScript errors on ref forwarding            | Incorrect generic types                 | Use `React.forwardRef<HTMLButtonElement, ButtonProps>` pattern |
| Checkbox indeterminate state not visible       | CSS not applied                         | Verify indeterminate styling in checkbox.tsx         |
| Analytics `data-component-id` not appearing    | Prop not spread onto root element       | Add `{...props}` or explicit data attribute spread   |
| Keyboard navigation not working in Select      | Missing Radix UI keyboard handlers      | Ensure using Radix Select, not native `<select>`    |

### Reference Materials

- [shadcn/ui Form Documentation](https://ui.shadcn.com/docs/components/form)
- [React Hook Form Documentation](https://react-hook-form.com/get-started)
- [Radix UI Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction)
- [Zod Documentation](https://zod.dev/)
- [class-variance-authority Documentation](https://cva.style/docs)
- [WCAG Form Guidelines](https://www.w3.org/WAI/tutorials/forms/)

## Estimated Effort

**Size**: M (6-8h)

**Breakdown**:

- Button, Input, Label components: 1.5h
- Select, Checkbox, Radio Group, Switch components: 2h
- Form components with React Hook Form integration: 2h
- Testing (unit and integration): 1.5h
- Documentation and exports: 1h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture) - Rationale for Radix UI primitives and accessibility requirements
- [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling) - Component variant system using CVA
- [Epic 2A.5: Technology Decisions](./EPIC.md#technology-decisions) - Form validation library choice (React Hook Form)

### Story-Specific Decisions

#### AD-2A.5.S3.1: Include Switch Component in Form Components Story

**Scope**: Story-specific (component grouping decision)

**Decision**: Include Switch component in this story alongside Checkbox and Radio Group, even though it's not explicitly mentioned in Epic story titles.

**Rationale**:

- Switch is a form input primitive, semantically related to Checkbox
- Switch uses similar Radix UI patterns as other form components
- Often used in forms alongside other inputs
- Small component, minimal implementation effort
- Better grouped with form components than layout or feedback components

**Consequences**:

- Slightly larger story scope, but still within M-size estimate
- More complete form component library immediately available
- Developers don't need to wait for future stories to use switches

**Alternatives Considered**:

- **Defer to S5 (Feedback components)** - Rejected because Switch is not feedback; it's an input control
- **Create separate story** - Rejected because overhead of separate story not justified for small component

## Out of Scope

The following items are explicitly NOT part of this story:

- **Textarea with rich text editing** - Plain textarea only; rich text editor deferred to future epic if needed
- **Advanced multi-step form wizard** - Handled at application layer using these primitives
- **Form auto-save functionality** - Handled at application layer
- **Custom validation rules beyond Zod** - Applications can extend Zod schemas as needed
- **File upload input component** - Complex component deferred to future epic if needed
- **Date/time picker components** - Complex components deferred to future epic if needed
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

- [shadcn/ui Button Component](https://ui.shadcn.com/docs/components/button)
- [shadcn/ui Form Component](https://ui.shadcn.com/docs/components/form)
- [shadcn/ui Input Component](https://ui.shadcn.com/docs/components/input)
- [shadcn/ui Select Component](https://ui.shadcn.com/docs/components/select)
- [shadcn/ui Checkbox Component](https://ui.shadcn.com/docs/components/checkbox)
- [Radix UI Documentation](https://www.radix-ui.com/primitives)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)

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

- [ ] All form components have proper ARIA labels
- [ ] Keyboard navigation works for all interactive components
- [ ] Focus indicators visible and meet contrast requirements
- [ ] Error states announced to screen readers
- [ ] Label associations correct (htmlFor matches input id)

### Documentation

- [ ] All component props interfaces exported and documented with JSDoc
- [ ] README.md updated with form component usage examples
- [ ] Code comments explain complex logic
- [ ] Common form patterns documented

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] Commit message follows pattern: `feat(2A.5.S3): implement form components`

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
