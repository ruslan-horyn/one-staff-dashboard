# Frontend Anti-Patterns

> Code review blockers — violations of these rules should be caught and fixed before merge.

## Data & State

| # | Anti-Pattern | Fix |
|---|-------------|-----|
| AP-01 | `useState` + `useEffect` to sync server data | Server component owns data. After mutation call `router.refresh()`. No client state for server data. |
| AP-02 | `useState` per form field | `useForm` + `zod` + `Controller` |
| AP-10 | `useState` duplicating server/query data | Use data directly from server component props |

## Components

| # | Anti-Pattern | Fix |
|---|-------------|-----|
| AP-03 | Template literal for conditional className | `cn()` utility |
| AP-04 | Hardcoded hex color / magic number | Design tokens / Tailwind config |
| AP-05 | Inline `style={{}}` (except dynamic values) | Tailwind `className` |
| AP-06 | `export default` | Named export: `export const Component = ...` |
| AP-07 | `React.FC<Props>` | Arrow function: `export const Foo = (props: Props) => ...` |
| AP-08 | Page/screen with business logic or data fetching | Extract to hooks. Page = pure composition (#10 Screen as Coordinator). |
| AP-11 | Button enabled during mutation | `disabled` or `loading` prop must reflect `isPending` |

## Hooks

| # | Anti-Pattern | Fix |
|---|-------------|-----|
| AP-09 | Inline query keys outside factory | Extract to dedicated file |
| AP-12 | Hook handling multiple business domains | Split into focused hooks, one per domain. Validate with Hook Scope table. |

## Callbacks & Functions

| # | Anti-Pattern | Fix |
|---|-------------|-----|
| AP-13 | Wrapper callback that only calls another function | Pass function reference directly |

### AP-13 Examples

```typescript
// ❌ WRONG — wrapper that only invokes another function
const onSuccess = useCallback(() => {
  modal.close();
}, [modal]);
useCreateClient({ onSuccess });

// ✅ RIGHT — pass reference directly
useCreateClient({ onSuccess: modal.close });
```

```typescript
// ❌ WRONG — wrapper calling two functions
useCreateClient({
  onSuccess: () => { modal.close(); refreshData(); }
});

// ✅ RIGHT — design API with separate callback slots
useCreateClient({
  onSuccess: refreshData,
  onSettled: modal.close,
});

// ✅ ALSO RIGHT — if API supports array of callbacks
useCreateClient({
  onSuccess: [refreshData, modal.close],
});
```

**Rule:** Only create a wrapper when there is actual transformation, branching, or argument mapping. `() => fn()` is always wrong.

## Hook Scope Validation

When creating a new hook, every element inside must be justified by the hook's name.

| Hook name | Allowed | NOT allowed |
|-----------|---------|-------------|
| `use<Entity>` (query) | Data fetching, derive state from query | Form logic, mutations, navigation |
| `use<Verb><Entity>` (action) | Single mutation, cache invalidation, toast | Data display logic, form state |
| `use<Feature>Form` (interaction) | `useForm`, zod schema, `handleSubmit`, reset | Data fetching, mutations*, unrelated state |

*Interaction hooks receive mutation as injected dependency (`onSubmit`), they don't import or call server actions directly.
