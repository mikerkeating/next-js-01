### Product UI Components Specification (Epic 2B.5)

This section defines the core reusable UI components that power the product interface, enabling consistent UX across multi-tenant contexts with proper permission controls and data visualization.

#### Role Badge Component

**Purpose**: Display user roles with visual distinction across different organizational contexts.

**Props Interface**:
```typescript
interface RoleBadgeProps {
  role: 'internal' | 'product-seller' | 'agency-seller' | 'client';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'subtle';
  showIcon?: boolean;
  className?: string;
}
```

**Behavior**:
- Maps role to semantic color scheme (internal: blue, product-seller: green, agency-seller: purple, client: amber)
- Supports three size variants with appropriate text scaling
- Optional icon prefix using Lucide icons
- Accessible with proper ARIA labels
- Responsive text truncation for long role names

**Implementation Notes**:
- Built on shadcn/ui Badge component
- Uses Tailwind CSS for styling variants
- Exported from `@repo/ui/role-badge`

---

#### Content Card Component

**Purpose**: Display content items with organization context, ownership, and interaction capabilities.

**Props Interface**:
```typescript
interface ContentCardProps {
  content: {
    id: string;
    title: string;
    type: string;
    organizationId: string;
    organizationName: string;
    createdBy: {
      id: string;
      name: string;
      avatarUrl?: string;
    };
    createdAt: Date;
    updatedAt: Date;
  };
  actions?: ContentAction[];
  onSelect?: (contentId: string) => void;
  isSelected?: boolean;
  showOrganization?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

interface ContentAction {
  label: string;
  icon: LucideIcon;
  onClick: (contentId: string) => void;
  variant?: 'default' | 'destructive' | 'secondary';
  requiresPermission?: string;
}
```

**Behavior**:
- Displays content metadata with organization badge
- Shows creator information with avatar
- Renders relative timestamps (e.g., "2 hours ago")
- Supports contextual actions with permission gating
- Hover state reveals full action menu
- Selectable for bulk operations
- Three layout variants: default (card), compact (list), detailed (expanded)

**Implementation Notes**:
- Uses shadcn/ui Card component as base
- Integrates with Permission Gate component for action visibility
- Lazy loads creator avatars
- Exported from `@repo/ui/content-card`

---

#### Permission Gate Component

**Purpose**: Conditionally render UI elements based on user permissions within organization context.

**Props Interface**:
```typescript
interface PermissionGateProps {
  permission: string | string[];
  organizationId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  mode?: 'any' | 'all'; // For multiple permissions
  onUnauthorized?: () => void;
}
```

**Behavior**:
- Evaluates user permissions against required permission(s)
- Supports single permission string or array of permissions
- `mode='any'`: renders if user has ANY of the specified permissions
- `mode='all'`: renders if user has ALL of the specified permissions
- Uses organization context from middleware if organizationId not provided
- Renders children if authorized, fallback component if not
- Optional callback for unauthorized access attempts
- Server component compatible for SSR permission checks

**Implementation Notes**:
- Integrates with `@repo/auth` for permission evaluation
- Uses React Context for organization scope
- Supports both client and server components
- Exported from `@repo/ui/permission-gate`

**Usage Example**:
```typescript
<PermissionGate permission="content.delete" organizationId={orgId}>
  <DeleteButton />
</PermissionGate>
```

---

#### User Role Selector

**Purpose**: Allow administrators to assign or modify user roles within an organization.

**Props Interface**:
```typescript
interface UserRoleSelectorProps {
  userId: string;
  organizationId: string;
  currentRole: 'internal' | 'product-seller' | 'agency-seller' | 'client';
  availableRoles?: ('internal' | 'product-seller' | 'agency-seller' | 'client')[];
  onChange: (newRole: string) => Promise<void>;
  disabled?: boolean;
  showDescription?: boolean;
  variant?: 'dropdown' | 'radio' | 'card';
  className?: string;
}
```

**Behavior**:
- Displays current role with visual indicator
- Shows available roles based on user's permissions
- Provides role descriptions on hover/focus
- Supports three interaction variants:
  - `dropdown`: Compact select menu
  - `radio`: Radio button group
  - `card`: Card-based selection for detailed view
- Optimistic UI updates with rollback on error
- Confirmation dialog for role changes (configurable)
- Disabled state during async operations
- Emits analytics events for role changes

**Implementation Notes**:
- Built on shadcn/ui Select/RadioGroup components
- Integrates with Permission Gate (requires 'organization.manage-roles')
- Uses React Hook Form for validation
- Exported from `@repo/ui/user-role-selector`

---

#### Radar Chart for Maturity Models

**Purpose**: Visualize multi-dimensional maturity assessments across different capability areas.

**Props Interface**:
```typescript
interface RadarChartProps {
  data: RadarDataPoint[];
  dimensions: RadarDimension[];
  size?: number; // Chart diameter in pixels
  maxValue?: number; // Maximum scale value (default: 5)
  showLabels?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  colors?: {
    primary: string;
    secondary?: string;
    comparison?: string;
  };
  comparisonData?: RadarDataPoint[]; // For before/after or benchmark comparison
  onDimensionClick?: (dimensionId: string) => void;
  className?: string;
}

interface RadarDataPoint {
  dimension: string;
  value: number;
  label?: string;
}

interface RadarDimension {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
}
```

**Behavior**:
- Renders interactive radar/spider chart
- Supports 3-8 dimensions for optimal readability
- Interactive hover states show dimension details
- Click handlers for drill-down navigation
- Comparison mode overlays two datasets
- Responsive sizing with maintained aspect ratio
- Accessible with keyboard navigation and ARIA labels
- Export functionality to PNG/SVG

**Implementation Notes**:
- Built with Recharts library
- Custom SVG rendering for precise control
- Uses Tailwind colors with CSS variable support
- Optimized for print/PDF export
- Exported from `@repo/ui/radar-chart`

---

#### Timeline/Progress Visualization

**Purpose**: Display temporal progression, milestones, and status updates in a visual timeline format.

**Props Interface**:
```typescript
interface TimelineProps {
  items: TimelineItem[];
  orientation?: 'vertical' | 'horizontal';
  variant?: 'default' | 'compact' | 'detailed';
  showProgress?: boolean; // Show percentage complete
  currentIndex?: number; // Highlight current item
  onItemClick?: (itemId: string) => void;
  className?: string;
}

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  status: 'completed' | 'in-progress' | 'pending' | 'cancelled';
  icon?: LucideIcon;
  metadata?: Record<string, any>;
  actor?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}
```

**Behavior**:
- Chronological display of events/milestones
- Color-coded status indicators
- Vertical orientation for mobile, horizontal for desktop (responsive)
- Animated entry for new items (real-time updates)
- Expandable items show full details
- Progress indicator shows completion percentage
- Actor avatars for audit trail visualization
- Smooth scroll to specific timeline items

**Implementation Notes**:
- CSS Grid/Flexbox for responsive layout
- Framer Motion for animations
- Virtualization for long timelines (react-window)
- Exported from `@repo/ui/timeline`

---

#### Advanced Search with Faceted Filtering

**Purpose**: Provide powerful search and filtering capabilities with multiple filter dimensions and real-time results.

**Props Interface**:
```typescript
interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  facets: SearchFacet[];
  placeholder?: string;
  defaultFilters?: SearchFilters;
  showResultCount?: boolean;
  resultCount?: number;
  isLoading?: boolean;
  debounceMs?: number; // Default: 300ms
  variant?: 'full' | 'compact' | 'modal';
  className?: string;
}

interface SearchFacet {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'date-range' | 'number-range' | 'toggle';
  options?: FacetOption[];
  defaultValue?: any;
  icon?: LucideIcon;
}

interface FacetOption {
  value: string;
  label: string;
  count?: number; // Number of results with this filter
  icon?: LucideIcon;
}

interface SearchFilters {
  query: string;
  facets: Record<string, any>;
}
```

**Behavior**:
- Real-time search with debouncing
- Multiple filter types: select, multiselect, date ranges, number ranges, toggles
- Filter chips show active filters with quick removal
- Result count updates with filter changes
- Clear all filters button
- Save/load filter presets (localStorage)
- URL sync for shareable filtered views
- Keyboard shortcuts (/ to focus, Esc to clear)
- Mobile-optimized filter drawer

**Implementation Notes**:
- Built on shadcn/ui Input, Select, Popover components
- Uses React Hook Form for filter state
- Integrates with URL query params via next/navigation
- Debouncing via use-debounce hook
- Exported from `@repo/ui/advanced-search`

---

#### Component Testing & Documentation

**Testing Requirements**:
- All components have Vitest unit tests with >90% coverage
- React Testing Library for component behavior testing
- Storybook stories for all variants and states
- Accessibility testing with jest-axe
- Visual regression testing with Chromatic

**Documentation**:
- JSDoc comments for all props and behaviors
- Storybook documentation for usage examples
- README.md in each component directory
- Code examples in docs site (`apps/docs`)

**Accessibility Standards**:
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility (ARIA labels)
- Color contrast ratios meet requirements
- Focus indicators visible

**ADR Reference**: [ADR-008: shadcn/ui as component foundation](adr/008-shadcn-ui-components.md)

---

