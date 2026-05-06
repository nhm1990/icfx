---
description: 'Clean Code guidelines for the Vue 3 + PrimeVue + Tailwind project — component design, conventions, and code quality rules'
tools: []
---

# Clean Code Guidelines

These are the authoritative clean code and component design rules for this project.
For project-specific configuration (auto-imports, PrimeVue setup, i18n, etc.) see `frontend/.github/copilot-instructions.md`.

---

## Vue Component Rules

- **1 component = 1 purpose** (single responsibility)
- **One component per `.vue` file** — extract sub-components to `components/[Feature]/`
- **PascalCase filenames**: `ProjectCard.vue`, `ProjectFormDialog.vue`
- **`<script setup lang="ts">`** — always use Composition API with setup syntax
- **No `<style>` blocks** — use Tailwind CSS utility classes exclusively
- **No plain HTML elements** for inputs/buttons — use PrimeVue components (`Button`, `InputText`, etc.)
- **No barrel exports** (`index.ts`) — auto-imports handle component registration; import directly from source files
- **No inline arrow functions in templates**: define named handlers in `<script setup>`
  - ❌ `@click="() => doSomething()"`
  - ✅ `@click="handleClick"`
- Prefer `handleXYZ` naming for event handlers
- Avoid `.push()` for array building — prefer spread + ternary or `.map()`

### Extract Complex Logic into Named Sub-Functions

- **NEVER write complex inline logic** inside `computed`, `.filter()`, `.sort()`, or `.map()` callbacks
- Extract each distinct concern into a **named helper function** with a descriptive name
- This applies to composables and components alike
- ❌ Wrong: large inline callbacks inside `computed`
  ```typescript
  const filteredItems = computed(() => {
    let result = [...items.value]
    if (query.value) {
      result = result.filter((item) =>
        item.title.toLowerCase().includes(query.value) ||
        item.description.toLowerCase().includes(query.value) ||
        // ... 10 more lines
      )
    }
    if (dateFrom.value || dateTo.value) {
      result = result.filter((item) => {
        const created = extractDate(item.id)
        // ... 15 more lines of date logic
      })
    }
    result.sort((a, b) => { /* ... */ })
    return result
  })
  ```
- ✅ Correct: named sub-functions, `computed` just orchestrates

  ```typescript
  const matchesSearch = (item: ItemDto, query: string): boolean => { ... }
  const matchesFilters = (item: ItemDto): boolean => { ... }
  const isWithinDateRange = (item: ItemDto): boolean => { ... }
  const compareItems = (a: ItemDto, b: ItemDto): number => { ... }

  const filteredItems = computed(() => {
    let result = [...items.value]
    if (query.value) result = result.filter((p) => matchesSearch(p, query.value))
    result = result.filter(matchesFilters)
    if (dateFrom.value || dateTo.value) result = result.filter(isWithinDateRange)
    result.sort(compareItems)
    return result
  })
  ```

- Each sub-function should be **<15 lines**, **pure** (no side effects), and **testable in isolation**

### Extract Named Functions for Conditions and Multi-Step Blocks

- **Complex `if` conditions** and **multi-step logic blocks** MUST be extracted into named functions
  — the call site should read like prose, comments belong in the function's JSDoc, not inline
- ❌ Wrong: inline multi-line condition scattered in business logic
  ```typescript
  if (programmaticCell !== null && programmaticCell.rowIndex === row && programmaticCell.colId === col) { ... }
  ```
- ✅ Correct: self-documenting name, implementation detail hidden
  ```typescript
  if (isProgrammaticEcho(programmaticCell, row, col)) { ... }
  ```
- ❌ Wrong: a 30-line `if/else` block inside a function that already does something else
  ```typescript
  const applyValue = async (...) => {
    // ... setup ...
    if (exposed?.isCustomVueEditor === true) {
      // 10 lines
    } else {
      // 20 lines
    }
  }
  ```
- ✅ Correct: extract each branch as a named function

  ```typescript
  const applyValueToCustomEditor = async (gridApi, exposed, value) => { ... }
  const applyValueToTextEditor = (gridApi, editor, value) => { ... }

  const applyValue = async (...) => {
    // ... setup ...
    if (exposed?.isCustomVueEditor === true) {
      await applyValueToCustomEditor(gridApi, exposed, value)
    } else {
      applyValueToTextEditor(gridApi, editor, value)
    }
  }
  ```

- **Pure helpers** (no side effects on Vue state) belong in `src/models/*.ts`, not in composables
  — composables import and call them, keeping composable logic focused on orchestration

### Props & Emits Conventions

- **Props**: Always define a `Props` interface with `defineProps<Props>()`

  ```vue
  interface Props {
    title: string
    isActive?: boolean
  }
  const props = defineProps<Props>()
  // or with defaults:
  withDefaults(defineProps<Props>(), {
    title: '',
    isActive: false,
  })
  ```

- **Emits**: Always define an `Emit` interface with `defineEmits<Emit>()`, events prefixed with `on`

  ```vue
  interface Emit {
    onUpdate: [value: string]
    onChange: [item: Item]
    onDelete: [id: number]
  }
  const emit = defineEmits<Emit>()

  // Usage:
  emit('onUpdate', 'new value')
  emit('onChange', item)
  ```

  - ✅ Correct: `onUpdate`, `onChange`, `onDelete`, `onSubmit`
  - ❌ Wrong: `update`, `change`, `delete`, `submit`

### `<script setup>` Block Order

ALWAYS structure `<script setup>` blocks in this exact order:

1. **Imports** — external packages, composables, types
2. **Props & Emits** — `defineProps`, `withDefaults`, `defineEmits`
3. **Variables** — `ref`, `reactive`, `computed`, composable returns
4. **Functions** — event handlers, helpers
5. **Watchers** — `watch` / `watchEffect` always at the bottom

```vue
<script setup lang="ts">
// 1. Imports
import { useI18n } from 'vue-i18n'

// 2. Props & Emits
interface Props { ... }
const props = defineProps<Props>()
const emit = defineEmits<{ ... }>()

// 3. Variables
const { t } = useI18n({ useScope: 'global' })
const myRef = ref('')
const myComputed = computed(() => ...)

// 4. Functions
const handleClick = () => { ... }

// 5. Watchers — always last
watch(() => props.value, (val) => { ... })
watchEffect(() => { ... })
</script>
```

### Component Naming: `[Feature][Part].vue`

Within `components/[Feature]/`:

```
components/Projects/
├── ProjectSidebar.vue              # Main sidebar orchestrator
├── ProjectCard.vue                 # Single project card
├── ProjectSearchBar.vue            # Search input
├── ProjectFilterPanel.vue          # Filters (status, date, etc.)
├── ProjectFormDialog.vue           # Dialog orchestrator (uses ProjectForm)
├── ProjectForm.vue                 # Form fields + validation
├── ProjectListSkeleton.vue         # Loading skeleton
```

- Feature name in folder provides context — component name adds specificity
- Cross-feature duplication: each feature owns its own version (WET principle)

---

## TypeScript Types & Interfaces

- **NEVER define interfaces or types inside `.vue` files**
  - ❌ Wrong: `interface FileWithStatus { ... }` inside `<script setup>`
  - ✅ Correct: define in `src/models/*.ts` and import it
  - **Only exception**: Props and Emits interfaces stay inside the component
- Place shared types in `src/models/` with a descriptive filename (e.g., `upload.ts`, `analyzer.ts`)
- Replace ALL `any` types with proper interfaces/types
- Check `src/models/` first for existing types before creating new ones

---

## API Fetching

**NEVER call `fetcher` directly — ALWAYS use the dedicated composables:**

- **GET** → `useFetcher` from `@solis/ui/composables/useFetcher` (SWRV-backed: reactive URL, caching, loading state, revalidation)
  ```ts
  import { useFetcher } from '@solis/ui/composables/useFetcher'
  const url = computed(() => (id.value ? `resource/${id.value}` : null))
  const { data, isLoading, mutate } = useFetcher<MyDto>({ url })
  ```
- **POST** → `usePostData` from `@solis/ui/composables/usePostData`
  ```ts
  import { usePostData } from '@solis/ui/composables/usePostData'
  const { postData, returnMessage, isError, isLoading } = usePostData<ResponseDto>()
  await postData('resource', payload, false) // false = suppress built-in toast
  if (isError.value) return null
  ```
- **PUT** → `usePutData` from `@solis/ui/composables/usePutData`
  ```ts
  import { usePutData } from '@solis/ui/composables/usePutData'
  const { putData, returnMessage, isError, isLoading } = usePutData<ResponseDto>()
  isError.value = false // reset before call if reusing across retries
  await putData('resource/id', payload, false)
  if (isError.value) return false
  ```
- **DELETE** → `useDeleteData` from `@solis/ui/composables/useDeleteData`
  ```ts
  import { useDeleteData } from '@solis/ui/composables/useDeleteData'
  const { deleteData, isError, isLoading } = useDeleteData<ResponseDto>()
  isError.value = false // reset before call if reusing across retries
  await deleteData('resource/id', {}, false)
  if (isError.value) return
  ```
- All mutation composables handle error toasts internally via `showApiError`. Pass `showSnackbarOnSuccess = false` (third argument) when you want custom success handling.
- Use `mutate()` (returned by `useFetcher`) to trigger GET revalidation after a successful mutation.

---

## Form Handling

- **ALWAYS use PrimeVue Forms (`@primevue/forms`) with Yup** for form validation
  - Import `Form` from `@primevue/forms` and use `yupResolver` from `@primevue/forms/resolvers/yup`
  - Define Yup schemas for all form validation logic
  - Use `name` prop on PrimeVue form components (instead of `v-model`) to bind to form state
  - Display validation errors with `<Message>` component using `$form.[fieldName]?.invalid`
  - ❌ Wrong: Manual `v-model` + computed `isFormValid`
  - ✅ Correct:
    ```vue
    <Form v-slot="$form" :initialValues :resolver @submit="onFormSubmit">
      <InputText name="title" placeholder="Title" />
      <Message v-if="$form.title?.invalid" severity="error" size="small" variant="simple">
        {{ $form.title.error?.message }}
      </Message>
      <Button type="submit" label="Save" />
    </Form>
    ```
  - For Select/Dropdown fields that work with objects, use `FormField` with `v-slot="$field"` for more control

---

## Folder Structure

```
apps/solis/src/
├── components/
│   └── [Feature]/                 # PascalCase feature folders
│       ├── [Feature][Part].vue
│       └── ...
├── composables/                   # Reusable logic
│   ├── use[Feature].ts            # Primary data composable
│   ├── use[Feature]Filters.ts     # Filter/sort logic
│   ├── use[Feature]Form.ts        # Form state + validation
│   └── use[Feature]Mutations.ts   # Create/update/delete
├── models/                        # TypeScript types & interfaces
│   ├── project.ts
│   ├── analyzer.ts
│   └── ...
├── pages/                         # File-based routing (German filenames)
│   ├── projects.vue
│   ├── analyzers.vue
│   └── ...
├── stores/                        # Pinia stores (global state)
├── locales/                       # i18n translations (de.json, en.json)
└── layouts/                       # Layout wrappers

packages/ui/src/                   # Shared across apps (truly generic only)
├── components/                    # Generic UI components
├── composables/                   # Generic composables (useFetcher, usePostData, etc.)
├── models/                        # Shared types
└── stores/                        # Shared stores
```

### Code Organization

- Reusable logic → `composables/use[Feature].ts`
- Business logic / data transformations → composables (not components)
- Shared types → `models/[feature].ts`
- Props/Emits interfaces → stay with their component

### When to move to `packages/ui/`

- ✅ Truly generic, feature-agnostic (e.g., `useFetcher`, `useAppToast`, `CenteredLoadingSpinner`)
- ✅ Used (or intended) by multiple apps in the monorepo
- ❌ Feature-specific logic stays in `apps/solis/src/`

---

## Date & Time Handling

- **ALWAYS use `dayjs` for all date/time operations** — never use `new Date()`, `Date.parse()`, or manual string manipulation for dates
  - `dayjs` is already installed in both `apps/solis` and `packages/utils`
  - ❌ Wrong: `new Date(value)`, `Date.parse(str)`, manual regex date parsing
  - ✅ Correct: `dayjs(value)`, `dayjs(value).isValid()`, `dayjs(value).format('YYYY-MM-DD')`
- For date validation: `dayjs(value).isValid()` — handles all ISO formats automatically
- For date normalization (extract date part): `dayjs(value).format('YYYY-MM-DD')`
- For date display formatting: use `formatDate()` from `src/models/date.ts` where possible

---

## After Any Code Changes

1. Fix all ESLint errors (`pnpm lint`)
2. Run tests (`pnpm test`)
3. Verify auto-imports still work (no manual imports for PrimeVue or auto-registered components)
4. Check i18n — **NEVER hardcode user-facing text** in components or model files
   - All user-visible labels must go through `t()` / `$t()` with keys in `de.json` **and** `en.json`
   - Model/utility files (`src/models/`) must store **translation keys** (strings like `'qcCheck.results.ok'`), never translated text — the component resolves them via `t(key)`
   - When adding any new user-facing string, **always** add both `de.json` and `en.json` entries in the same commit
