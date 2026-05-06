---
description: 'Refactoring workflow for the Vue 3 + PrimeVue + Tailwind project — systematic extraction and restructuring process'
tools: []
---

# Refactoring Guidelines

Systematic workflow for refactoring Vue components in this project.

> **All clean code rules (component conventions, props/emits, naming, types, API fetching, form handling, folder structure) are defined in `.github/chatmodes/cleancode.chatmode.md`.**
> Always apply those rules when refactoring.

---

## When to Refactor

- Component exceeds **200 lines**
- Component has **more than one responsibility** (UI + logic + data fetching)
- Same pattern is **repeated** across components
- `<script setup>` block is **hard to read** (too many concerns mixed)

---

## Refactoring Workflow (ALWAYS FOLLOW THIS ORDER)

### 1. Analysis Phase

- Identify responsibilities: UI rendering, data fetching, business logic, state management
- Find extraction candidates:
  - Repeated UI patterns (action bars, filter panels, list sections)
  - Complex form logic (validation schemas, submission handlers)
  - Data fetching / mutation logic (composable candidates)
  - Business rules and data transformations

#### Pattern Discovery (Scoped Scanning)

**Step 1: Identify Feature Scope**

- Determine the feature from the current file path
  - Example: `components/Projects/ProjectSidebar.vue` → feature: `Projects`

**Step 2: Scan Feature Siblings (Narrow Scope)**

```bash
grep -r "FilterPanel\|SearchBar" src/components/Projects/
grep -r "useProject" src/composables/
```

**Step 3: Check Existing Structure**

- List feature component folder: `src/components/[Feature]/`
- List composables: `src/composables/use[Feature]*.ts`
- List models: `src/models/[feature].ts`

**Anti-Patterns**:

- ❌ Don't scan entire `src/components/` (too broad)
- ❌ Don't consolidate unrelated features

### 2. Extraction Phase (Bottom-Up)

**a) Composables First**

- Extract reusable logic to `src/composables/use[Feature][Concern].ts`
- Candidates: data fetching, filtering/sorting, form state, mutations
- Examples: `useProjectFilters`, `useProjectForm`, `useProjectMutations`
- Keep composables focused — one concern per composable

**b) Sub-Components Second**

- Extract UI pieces to `src/components/[Feature]/[Feature][Part].vue`
- Start with leaf components (search bars, skeleton loaders, cards)
- Then extract container components (filter panels, form dialogs)

**c) Orchestration Last**

- Update main component to compose extracted pieces
- Should become a thin coordinator (<150 lines)
- Focus on layout composition, not logic

### 3. Integration Phase

#### Component Placement Validation

| Scenario                | Decision                 | Location                                         |
| ----------------------- | ------------------------ | ------------------------------------------------ |
| Used 1x, <80 lines      | ❌ Keep inline           | Current component                                |
| Used 1x, >80 lines      | ✅ Extract for clarity   | `components/[Feature]/`                          |
| Used 2x+, same feature  | ✅ Extract for reuse     | `components/[Feature]/`                          |
| Used across features    | ✅ Extract to shared lib | `packages/ui/src/components/`                    |
| Reusable logic (not UI) | ✅ Composable            | `composables/` or `packages/ui/src/composables/` |
| Type / interface        | ✅ Model file            | `models/` or `packages/ui/src/models/`           |

**Anti-Pattern Warnings**:

- ❌ Don't prematurely abstract for "future reuse" — wait for actual second use (WET principle)
- ✅ Do extract to improve readability, even if single-use
- ❌ Don't mix UI components with business logic — separate into composables

**After validation**:

- Fix TypeScript errors from extraction
- Verify props/emits flow correctly
- Check that auto-imports still resolve
- Run tests: `pnpm test`

### 4. Size Targets

- Main page component: <150 lines (layout + composition)
- Sub-components: <100 lines each
- Composables: <80 lines each (split if larger)
- Utility functions: <30 lines each
