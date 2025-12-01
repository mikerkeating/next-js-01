# Story 3A.2.S6: Create Responsive Shell Layout

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Routing Application Shell](./EPIC.md)
- **Depends On**: [S2: Rewrite Configuration Framework](./S2-rewrite-framework.md), [S3: Build SEO Utilities](./S3-seo-utilities.md), [S4: Integrate Analytics](./S4-analytics-integration.md), [S5: Configure CDN Asset References](./S5-cdn-integration.md)
- **Blocks**: [S7: Testing and Documentation](./S7-testing-documentation.md)
- **Runs in Parallel With**: None (integrates all previous stories)

## User Story

**As a** Platform Engineer
**I want** a mobile-responsive shell layout with navigation, header, footer, and content areas
**So that** the routing application provides a consistent, accessible user interface across all viewport sizes (320px - 2560px)

## Acceptance Criteria

- [ ] Shell layout renders correctly across viewport range (320px - 2560px)
- [ ] Navigation component adapts between mobile hamburger menu and desktop horizontal layout
- [ ] Header includes branding, navigation, and user actions with proper spacing
- [ ] Footer contains copyright, links, and social media with responsive stacking
- [ ] Main content area uses proper semantic HTML with landmark regions
- [ ] Lighthouse SEO audit score > 90 on shell pages
- [ ] Lighthouse Accessibility audit score 100 (WCAG 2.1 Level AA compliant)
- [ ] No layout shift issues (CLS score < 0.1)
- [ ] Touch targets meet minimum 44x44px size requirement on mobile
- [ ] Keyboard navigation works for all interactive elements

## Technical Requirements

### Files to Create

| Path                                               | Purpose                                        |
| -------------------------------------------------- | ---------------------------------------------- |
| `apps/routing/src/components/layout/Header.tsx`    | Header component with navigation               |
| `apps/routing/src/components/layout/Footer.tsx`    | Footer component with links and branding       |
| `apps/routing/src/components/layout/MainNav.tsx`   | Main navigation (desktop and mobile)           |
| `apps/routing/src/components/layout/MobileNav.tsx` | Mobile hamburger navigation drawer             |
| `apps/routing/src/components/layout/Container.tsx` | Responsive container with max-width            |
| `apps/routing/src/lib/navigation/nav-config.ts`    | Navigation configuration and route definitions |
| `apps/routing/styles/globals.css`                  | Global styles and Tailwind directives          |
| `apps/routing/tailwind.config.ts`                  | Tailwind CSS configuration                     |
| `apps/routing/tests/layout/Header.test.tsx`        | Unit tests for Header component                |
| `apps/routing/tests/layout/Footer.test.tsx`        | Unit tests for Footer component                |
| `apps/routing/tests/layout/MainNav.test.tsx`       | Unit tests for navigation components           |

### Files to Modify

| Path                             | Changes                                                  |
| -------------------------------- | -------------------------------------------------------- |
| `apps/routing/app/layout.tsx`    | Integrate Header, Footer, and responsive shell structure |
| `apps/routing/app/page.tsx`      | Update home page to use Container component              |
| `apps/routing/package.json`      | Add Tailwind CSS and UI dependencies                     |
| `apps/routing/postcss.config.js` | Configure PostCSS for Tailwind CSS                       |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Navigate to apps/routing
cd apps/routing

# Install Tailwind CSS and dependencies
pnpm add tailwindcss postcss autoprefixer
pnpm add @tailwindcss/typography @tailwindcss/forms
pnpm add class-variance-authority clsx tailwind-merge

# Install UI component primitives
pnpm add lucide-react
pnpm add @radix-ui/react-navigation-menu @radix-ui/react-separator

# Initialize Tailwind CSS config
pnpm dlx tailwindcss init -p --ts
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                | Requirement                                                                      | TAD Reference                                                            |
| ---------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Tailwind Content Paths | Scan app/, src/, components/ directories                                         | [TAD: Technology Stack](/docs/2-technical/2-tad.md#ui--styling)          |
| Breakpoint Strategy    | Mobile-first with sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px) | [TAD: UI Components](/docs/2-technical/2-tad-ui-components.md)           |
| Typography Scale       | Responsive font sizes using clamp() for fluid typography                         | [Coding Standards](/docs/2-technical/references/coding-standards.md)     |
| Color System           | CSS custom properties for theme consistency                                      | [TAD: Technology Stack](/docs/2-technical/2-tad.md#ui--styling)          |
| Container Max Width    | Max 1280px (xl breakpoint) with responsive padding                               | [TAD: UI Components](/docs/2-technical/2-tad-ui-components.md)           |
| Accessibility          | ARIA landmarks, keyboard navigation, focus styles                                | [TAD: Testing](/docs/2-technical/2-tad-testing.md#accessibility-testing) |

**Configuration Rationale**:

- Mobile-first approach ensures optimal experience on smaller devices
- Tailwind CSS v4 provides excellent developer experience with utility-first patterns
- Radix UI primitives ensure accessible, composable navigation components
- Container constraints prevent excessively wide content on large screens
- WCAG 2.1 Level AA compliance ensures inclusive user experience

For complete Tailwind configuration patterns, see: [Tailwind CSS Documentation](https://tailwindcss.com/docs/configuration)

## Test Requirements

### Manual Verification

- [ ] **Viewport Testing**: Open DevTools, test responsive layout at 320px, 768px, 1024px, 1536px, and 2560px widths
- [ ] **Navigation**: Verify mobile hamburger menu appears below md breakpoint and horizontal nav above
- [ ] **Touch Targets**: On mobile viewport, verify all buttons/links meet 44x44px minimum size
- [ ] **Keyboard Navigation**: Tab through all interactive elements and verify visible focus indicators
- [ ] **Lighthouse Audits**: Run Lighthouse for SEO (>90), Accessibility (100), Performance (>90)
- [ ] **Layout Shift**: Monitor CLS score during page load, verify < 0.1

### Automated Tests

- [ ] Unit: `Header.test.tsx` - Header renders with navigation and branding
- [ ] Unit: `Footer.test.tsx` - Footer renders with links and copyright
- [ ] Unit: `MainNav.test.tsx` - Desktop navigation renders links correctly
- [ ] Unit: `MobileNav.test.tsx` - Mobile drawer opens/closes with hamburger button
- [ ] Unit: `Container.test.tsx` - Container applies correct max-width and padding

### Integration Tests

- [ ] Shell layout renders correctly at mobile, tablet, and desktop breakpoints
- [ ] Navigation links integrate with rewrite configuration from S2
- [ ] Analytics integration from S4 tracks navigation clicks
- [ ] CDN assets from S5 render properly in header/footer (logos, icons)
- [ ] SEO meta tags from S3 populate correctly in layout
- [ ] Accessibility tree includes proper landmark regions (header, nav, main, footer)

### Verification Commands

```bash
# Build application
cd apps/routing
pnpm build

# Start development server
pnpm dev

# Run component tests
pnpm vitest run tests/layout

# Run Lighthouse audit (requires server running)
pnpm lighthouse http://localhost:3000 --view

# Run accessibility tests
pnpm test:a11y

# Test responsive breakpoints (manual browser DevTools verification)
# - 320px (iPhone SE)
# - 768px (iPad)
# - 1024px (iPad Pro / small desktop)
# - 1536px (large desktop)
# - 2560px (4K display)
```

## Implementation Notes

### Implementation Sequence

1. **Configure Tailwind CSS**
   - Initialize Tailwind config with content paths
   - Set up PostCSS configuration
   - Create globals.css with Tailwind directives and custom styles
   - Configure responsive breakpoints and design tokens

2. **Build Container Component**
   - Create responsive Container with max-width constraints
   - Add responsive padding (px-4 on mobile, px-6 on tablet, px-8 on desktop)
   - Implement centering and width constraints
   - Export from layout components

3. **Create Header Component**
   - Build header with branding area, navigation, and action buttons
   - Implement sticky header behavior (optional)
   - Add responsive spacing and alignment
   - Integrate with MainNav and MobileNav

4. **Build Navigation Components**
   - Create MainNav for desktop horizontal navigation
   - Build MobileNav with hamburger icon and drawer
   - Implement responsive visibility toggle (hide desktop nav on mobile, vice versa)
   - Add active link highlighting and keyboard navigation

5. **Create Footer Component**
   - Build footer with multi-column layout (desktop) and stacked layout (mobile)
   - Add copyright notice, legal links, social media icons
   - Implement responsive column collapse
   - Use semantic HTML with proper ARIA labels

6. **Integrate into Root Layout**
   - Update app/layout.tsx with Header and Footer components
   - Add proper HTML structure with landmark regions
   - Configure viewport meta tag for responsive behavior
   - Integrate analytics, SEO, and CDN components from previous stories

7. **Add Accessibility Enhancements**
   - Implement skip-to-content link for keyboard users
   - Add ARIA labels and roles for navigation
   - Ensure focus indicators are visible and high contrast
   - Test with keyboard-only navigation

8. **Optimize for Performance**
   - Minimize layout shift with defined image dimensions
   - Use font-display: swap for web fonts
   - Optimize critical CSS rendering
   - Test CLS, LCP, and other Core Web Vitals

### Key Concepts

- **Mobile-First Design**: Start with mobile layout, progressively enhance for larger screens
- **Responsive Breakpoints**: Screen size thresholds where layout adapts (sm: 640px, md: 768px, etc.)
- **Landmark Regions**: Semantic HTML elements (header, nav, main, footer) for accessibility
- **Touch Targets**: Minimum 44x44px clickable area for mobile usability
- **Cumulative Layout Shift (CLS)**: Metric measuring unexpected layout movement during page load
- **Tailwind CSS**: Utility-first CSS framework with predefined classes for rapid development

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: UI Components Architecture](/docs/2-technical/2-tad-ui-components.md)
- [TAD: Accessibility Standards](/docs/2-technical/2-tad-testing.md#accessibility-testing)
- [TAD: Responsive Design Patterns](/docs/2-technical/2-tad-testing.md#visual-regression-testing)

Key pattern notes for this story:

- Use Radix UI primitives for accessible navigation menus
- Implement mobile navigation with dialog/drawer pattern
- Apply Tailwind responsive utilities (hidden md:block, etc.)
- Use CSS Grid or Flexbox for layout with Tailwind classes
- Ensure all interactive elements have focus-visible styles

### Troubleshooting

| Issue                                 | Cause                               | Solution                                                      |
| ------------------------------------- | ----------------------------------- | ------------------------------------------------------------- |
| Mobile menu not opening               | Missing client component directive  | Add "use client" to MobileNav component                       |
| Layout shift during page load         | Images missing width/height         | Use Next.js Image component with explicit dimensions          |
| Navigation not responsive             | Incorrect Tailwind breakpoint usage | Use mobile-first approach: base = mobile, md:, lg: for larger |
| Footer columns not stacking on mobile | Missing responsive grid classes     | Use grid-cols-1 md:grid-cols-3 pattern                        |
| Focus indicators not visible          | Default browser outline removed     | Add custom focus-visible:ring-2 focus-visible:ring-blue-500   |
| Touch targets too small on mobile     | Insufficient padding/height         | Use min-h-[44px] min-w-[44px] or p-3 for adequate sizing      |
| Tailwind classes not applying         | Content paths misconfigured         | Verify tailwind.config.ts includes all component directories  |

### Reference Materials

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Navigation Menu](https://www.radix-ui.com/docs/primitives/components/navigation-menu)
- [MDN: Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Web.dev: Responsive Design Patterns](https://web.dev/patterns/layout/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web.dev: Cumulative Layout Shift](https://web.dev/cls/)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- Tailwind CSS configuration: 45 minutes
- Container and base layout structure: 45 minutes
- Header and navigation components: 1.5 hours
- Mobile navigation drawer: 1 hour
- Footer component: 45 minutes
- Root layout integration: 45 minutes
- Accessibility and testing: 1 hour

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Tailwind CSS as Styling Framework](/docs/2-technical/2-tad.md#ui--styling) - Utility-first CSS approach
- [TAD: shadcn/ui Component Foundation](/docs/2-technical/2-tad-ui-components.md) - Accessible component primitives
- [TAD: WCAG 2.1 Level AA Compliance](/docs/2-technical/2-tad-testing.md#accessibility-testing) - Accessibility requirements
- [ADR-003: Next.js Framework](/docs/2-technical/adr/003-nextjs-framework.md) - Server Components for layouts

### Story-Specific Decisions

#### AD-3A.2.S6.1: Mobile-First Responsive Strategy

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use mobile-first responsive design approach with progressive enhancement for larger viewports.

**Rationale**:

- Mobile traffic represents majority of web usage globally
- Easier to progressively enhance simple layouts than strip down complex ones
- Tailwind CSS defaults to mobile-first methodology
- Ensures optimal mobile experience is never compromised
- Performance benefits from loading minimal CSS for mobile devices

**Consequences**:

- Base styles apply to mobile viewport (320px+)
- Breakpoint modifiers (md:, lg:, xl:) add features for larger screens
- Developers must think mobile-first when designing layouts
- Better mobile performance and user experience
- Consistent with Tailwind CSS best practices

**Alternatives Considered**:

- **Option 1**: Desktop-first with max-width breakpoints - Rejected because it typically results in worse mobile experiences
- **Option 2**: Separate mobile and desktop templates - Rejected due to maintenance overhead and code duplication

#### AD-3A.2.S6.2: Hamburger Navigation Pattern for Mobile

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use hamburger icon with slide-out drawer navigation for mobile viewports instead of bottom tab bar or dropdown menu.

**Rationale**:

- Hamburger menu is widely recognized pattern, minimal learning curve
- Preserves vertical screen space (no persistent bottom bar)
- Allows for more navigation options without cramming into small space
- Supports nested navigation structures if needed in future
- Works well with Radix UI Dialog primitive for accessibility

**Consequences**:

- Navigation requires one extra tap to access on mobile (tap hamburger, then link)
- Drawer component requires client-side JavaScript
- Need to manage drawer open/close state
- Clear, familiar user experience
- Accessible with proper ARIA labels and keyboard support

**Alternatives Considered**:

- **Option 1**: Bottom tab bar navigation - Rejected because it limits number of navigation items and occupies permanent screen space
- **Option 2**: Always-visible compact menu - Rejected because it would clutter mobile UI and reduce content area
- **Option 3**: Dropdown from header - Rejected because it's less intuitive and harder to make accessible

#### AD-3A.2.S6.3: Container Max Width at 1280px

**Scope**: Story-specific (does not affect other stories)

**Decision**: Limit main content container to max-width of 1280px (Tailwind's xl breakpoint) centered on screen.

**Rationale**:

- Prevents excessively long line lengths on ultra-wide displays (>70-80 characters optimal)
- Maintains readable layout without horizontal scrolling
- Aligns with Tailwind's default xl breakpoint for consistency
- Standard practice for modern web applications
- Easier to maintain visual hierarchy with constrained width

**Consequences**:

- Content is centered with white space on sides on screens > 1280px
- Layout remains predictable and readable at all sizes
- May need full-width breakout for certain content types (images, dashboards)
- Consistent with most modern web design patterns

**Alternatives Considered**:

- **Option 1**: No max-width, full fluid layout - Rejected due to poor readability on very wide screens
- **Option 2**: Max-width at 1536px (2xl) - Rejected because line lengths become too long for comfortable reading
- **Option 3**: Max-width at 1024px (lg) - Rejected because it wastes too much space on modern desktop displays

## Out of Scope

The following items are explicitly NOT part of this story:

- **Product-Specific Navigation Items** - Navigation configuration will use placeholder links; actual product routes added in Epic 3B.3
- **User Account Menu** - User authentication UI and account dropdown handled in Epic 2A.7 (Auth Infrastructure)
- **Dark Mode Toggle** - Theme switching deferred to future enhancement
- **Advanced Animations** - Micro-interactions and complex animations beyond basic hover/focus states deferred
- **Search Bar in Header** - Global search functionality deferred to future epic
- **Notification Center** - User notifications and alerts system deferred to future epic
- **Breadcrumb Navigation** - Hierarchical breadcrumbs deferred until product routes are defined (Epic 3B.3)
- **Multi-Language Support** - Internationalization (i18n) deferred to post-MVP
- **Persistent Side Navigation** - Full sidebar layout pattern not required for routing shell; specific apps may add

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S2**: Rewrite Configuration Framework - Navigation links may need to reference configured application routes
- **S3**: Build SEO Utilities - Layout must integrate meta tags and structured data utilities
- **S4**: Integrate Analytics - Layout must include analytics tracking for navigation events
- **S5**: Configure CDN Asset References - Header/footer use optimized images and assets from CDN

### Enables (Unblocks These Stories)

- **S7**: Testing and Documentation - Complete shell layout enables comprehensive E2E testing and documentation
- **Epic 3B.3**: Routing Configuration (Product Routes) - Provides navigation structure for product-specific routes

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview)
- [EPIC.md: Acceptance Criteria](./EPIC.md#acceptance-criteria)
- [TAD: UI Components Architecture](/docs/2-technical/2-tad-ui-components.md)
- [TAD: Technology Stack](/docs/2-technical/2-tad.md#ui--styling)
- [TAD: Testing - Accessibility](/docs/2-technical/2-tad-testing.md#accessibility-testing)
- [TAD: Testing - Visual Regression](/docs/2-technical/2-tad-testing.md#visual-regression-testing)

### ADR References

- [ADR-003: Next.js 16 Framework](/docs/2-technical/adr/003-nextjs-framework.md)
- [ADR-008: shadcn/ui Components](/docs/2-technical/adr/008-shadcn-ui-components.md) (if exists)

### External Documentation

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [Next.js App Router Layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)
- [Web.dev: Responsive Design](https://web.dev/responsive-web-design-basics/)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Google Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)

## Verification Checklist

### Pre-Verification

- [ ] S2 (Rewrite Configuration Framework) completed
- [ ] S3 (Build SEO Utilities) completed
- [ ] S4 (Integrate Analytics) completed
- [ ] S5 (Configure CDN Asset References) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Tailwind CSS v4.x installed

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] TypeScript compiles successfully
- [ ] Layout renders correctly at all required breakpoints (320px - 2560px)
- [ ] Lighthouse SEO score > 90
- [ ] Lighthouse Accessibility score = 100
- [ ] CLS score < 0.1 (no layout shift)
- [ ] Touch targets meet 44x44px minimum on mobile
- [ ] Keyboard navigation works for all interactive elements
- [ ] ARIA landmarks properly defined

### Documentation

- [ ] Component props documented with JSDoc comments
- [ ] Navigation configuration documented
- [ ] Responsive behavior documented in code comments
- [ ] Architecture decisions documented in this story

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description references this story
- [ ] PR title follows format: `feat(3A.2.S6): create responsive shell layout`

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -

## Appendix A: Responsive Breakpoint Reference

| Breakpoint | Min Width | Typical Device | Layout Changes                        |
| ---------- | --------- | -------------- | ------------------------------------- |
| (base)     | 0px       | Mobile phones  | Single column, hamburger nav          |
| sm         | 640px     | Large phones   | Slightly wider containers             |
| md         | 768px     | Tablets        | Horizontal nav, multi-column footer   |
| lg         | 1024px    | Small laptops  | Wider containers, expanded navigation |
| xl         | 1280px    | Desktop        | Max container width, full layout      |
| 2xl        | 1536px    | Large desktop  | Same as xl (content constrained)      |

## Appendix B: Semantic HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Meta tags from S3 -->
  </head>
  <body>
    <!-- Skip to content link (accessibility) -->
    <a href="#main-content" class="sr-only focus:not-sr-only"> Skip to content </a>

    <!-- Header with navigation -->
    <header role="banner">
      <nav role="navigation" aria-label="Main navigation">
        <!-- Navigation links -->
      </nav>
    </header>

    <!-- Main content area -->
    <main id="main-content" role="main">
      <!-- Page content -->
    </main>

    <!-- Footer -->
    <footer role="contentinfo">
      <!-- Footer content -->
    </footer>

    <!-- Analytics from S4 -->
  </body>
</html>
```

## Appendix C: Touch Target Size Guidance

Per WCAG 2.1 Level AA (Success Criterion 2.5.5), all interactive elements should have:

- Minimum touch target size: 44x44 CSS pixels
- Adequate spacing between targets to prevent mis-taps
- Visual feedback on touch/click

**Tailwind implementation**:

```tsx
// Button with adequate touch target
<button className="min-h-[44px] min-w-[44px] p-3">
  Click me
</button>

// Link with adequate touch target
<a href="/about" className="inline-block py-3 px-4">
  About
</a>
```
