# ICFx Project — Copilot Instructions

## General Rules

- **Always consider chatmode files** in `.github/` — apply rules from `refactoring.chatmode.md` (and any other `*.chatmode.md`) when relevant to the task.
- Use **Tailwind CSS v4** utility classes instead of scoped CSS. Only use `<style scoped>` for things Tailwind cannot express (e.g., complex SVG paint properties, CSS transitions with `v-enter`/`v-leave`).
- Use **arrow functions** (`const fn = () => {}`) instead of `function` declarations.
- Follow **Vue 3 Composition API** with `<script setup lang="ts">`.
- Extract logic into composables (`src/composables/`) when a component exceeds ~150 lines of script.
- Use **TypeScript** strict types — no `any` except where required by library APIs.

## Project Stack

- Vue 3.5 + TypeScript ~6.0
- Vite 8 with `@tailwindcss/vite` plugin
- D3.js (d3-shape, d3-scale, d3-interpolate)
- @iconify/vue for icons
- Tailwind CSS v4.2

## File Structure

```
src/
  components/     — Vue SFC components
  composables/    — Reusable logic (useXxx.ts)
  utils/          — Pure helper functions
  types.ts        — Shared TypeScript interfaces
  App.vue         — Root app shell
```

## Code Conventions

- Props: `defineProps<{ ... }>()` (type-only, no runtime validation)
- Emits: `defineEmits<{ ... }>()` (type-only)
- Refs: `ref()` for local state, `computed()` for derived
- Naming: camelCase for variables/functions, PascalCase for components/types
- Exports: named exports from composables/utils, default export only for Vue components
