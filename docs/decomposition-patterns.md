# Decomposition Patterns Catalog

> Referenced by: implementation plans, code reviews, story creation
> Purpose: When creating or reviewing stories, use this catalog to choose the right decomposition pattern.
> Use the Decision Tree at the bottom to navigate to the right pattern.

---

## Backend Patterns

| # | Pattern | Description | When to Use |
|---|---------|-------------|-------------|
| 1 | **Facade** | Thin service delegates to focused sub-services, preserves original interface. | File has >2 responsibilities, callers in many modules (>3). |
| 2 | **Domain Service Hierarchy** | Complex domain split by phase/operation, not by entity. | Domain has different lifecycle phases (query vs command vs async). |
| 3 | **Extract & Move** | Methods moved to new file, imports updated directly. No facade wrapper. | Callers in 1-2 files, facade overhead not justified. |
| 4 | **Cross-Cutting Service** | Dedicated service for cross-cutting concern. | Notification/socket/logging logic grows and is reused across domains. |
| 5 | **Scheduled Task Service** | Cron/interval methods extracted to dedicated service. | File has mix of synchronous logic and scheduled operations. |
| 6 | **Validation + Atomic Transaction** | Validate outside transaction, then atomic update with row lock. | Race conditions possible (payout, accept job, retry). |
| 14 | **CQRS** | Explicit Query Service + Command Service split. | Domain has many read and write operations with different data shaping. |
| 15 | **Strategy Pattern** | Interface + multiple implementations. | Multiple variants of same operation (payment providers, notification channels). |
| 16 | **Event Emitter / Observer** | Service emits event, subscribers react independently. | Action triggers many side effects (notification + socket + audit). |
| 17 | **Guard / Gate Pattern** | Validation as reusable guard. Declarative, composable. | Same validation needed across multiple endpoints. |
| 18 | **Middleware / Interceptor** | Cross-cutting HTTP logic applied at framework level. | Every endpoint needs same transformation (error mapping, logging, timing). |
| 19 | **Adapter Pattern** | Wraps external SDK behind own interface. | External API integration (Stripe, geocoding, push provider). |
| 20 | **Builder Pattern** | Step-by-step construction of complex objects. Fluent API. | Building complex DTOs, queries with many filters. |
| 21 | **Aggregate Service / Orchestrator** | Service orchestrates multiple domain services. No business logic of its own. | Operation touches many domains simultaneously. |
| 22 | **Repository / Data Access** | Complex queries extracted to dedicated layer. | Service has >5 complex queries with joins, aggregations. |
| 23 | **Mapper / Transformer** | Entity -> DTO mapping logic in separate file. | Service has >2 toDto() / toResponse() methods that grow. |
| 24 | **Feature Module Split** | Large module split into sub-modules with own scope. | Module has >5 providers and >2 controllers. |

## Frontend Patterns

| # | Pattern | Description | When to Use |
|---|---------|-------------|-------------|
| 7 | **Query Hook** | `use<Entity>` — read-only, returns server data, no mutations. | Every data fetching operation. |
| 8 | **Action Hook** | `use<Verb><Entity>` — single write operation. | Every mutation (create, update, delete). |
| 9 | **Interaction Hook** | `use<Feature>Form` — form + zod schema + mutation glue. | Every form that submits data. |
| 10 | **Screen as Coordinator** | Screen = pure composition, zero logic. | Always — screen never has business logic or data fetching. |
| 11 | **API Service Layer** | Plain object with typed methods, no `use` prefix. One per entity. | Every HTTP endpoint / server action group. |
| 12 | **Socket Lifecycle Hook** | useEffect cleanup + reconnection handling + message buffering. | Every WebSocket connection. |
| 13 | **Pure Utility Functions** | Stateless calculations extracted from hooks. No side effects. | Logic without side effects that is reusable across features. |
| 25 | **Compound Component** | Parent + children sharing context. | Complex UI with many variants sharing state. |
| 26 | **Render Props / Slot Pattern** | Component accepts children/render function. | Reusable component with customizable interior. |
| 27 | **Context + Provider** | Shared state for component subtree without prop drilling. | Many components need same state. |
| 28 | **Error Boundary Component** | Component catches render errors in subtree. | Screen section can fail independently. |

---

## Naming Convention per Pattern

| # | Pattern | File Naming Rule |
|---|---------|-----------------|
| 1 | Facade | `<domain>.service.ts` (keeps original name) |
| 2 | Domain Service Hierarchy | `<domain>-<phase>.service.ts` |
| 3 | Extract & Move | `<responsibility>.service.ts` |
| 4 | Cross-Cutting Service | `<domain>-<concern>.service.ts` |
| 5 | Scheduled Task Service | `<domain>-scheduler.service.ts` |
| 7-9 | Hooks (Query/Action/Interaction) | `use<Entity>.ts` / `use<Verb><Entity>.ts` / `use<Feature>Form.ts` |
| 10 | Screen | `<Feature>Screen.tsx` or `page.tsx` (Next.js) |
| 11 | API Service | `<entity>Service.ts` or `<entity>/actions.ts` (Next.js server actions) |
| 13 | Pure Utility | `<domain>Utils.ts` |
| 14 | CQRS | `queries.ts` + `mutations.ts` |
| 19 | Adapter | `<provider>.adapter.ts` |
| 20 | Builder | `<entity>.builder.ts` |
| 22 | Repository | `<entity>.repository.ts` |
| 23 | Mapper | `<entity>.mapper.ts` |
| 25 | Compound Component | `<Component>.tsx` + `<Component>.<Part>.tsx` |
| 27 | Context + Provider | `<Feature>Context.tsx` |
| 28 | Error Boundary | `<Section>ErrorBoundary.tsx` |

---

## Hook Scope Validation

Every element inside the hook must be justified by the hook's name.

| Hook name | Allowed | NOT allowed |
|-----------|---------|-------------|
| `use<Entity>` (query) | data fetching, derive state from query | Form logic, mutations, navigation |
| `use<Verb><Entity>` (action) | single mutation, cache invalidation | Data display logic, form state, unrelated state |
| `use<Feature>Form` (interaction) | useForm, zod schema, handleSubmit, reset | Data fetching, socket, unrelated state |

---

## Anti-Patterns (FORBIDDEN — Code Review Blockers)

| # | Anti-Pattern | Fix |
|---|-------------|-----|
| AP-01 | `useState` + `useEffect` for server data | Server component owns data, `router.refresh()` after mutation |
| AP-02 | `useState` per form field | `useForm` + `zod` + `Controller` |
| AP-03 | Template literal for conditional className | `cn()` utility |
| AP-04 | Hardcoded hex color / magic number | Design tokens |
| AP-05 | Inline `style={{}}` (except allowed cases) | Tailwind `className` |
| AP-06 | `export default` | Named export: `export const Component = ...` |
| AP-07 | `React.FC<Props>` | Arrow function: `export const Foo = (props: Props) => ...` |
| AP-08 | Screen/page with business logic or data fetching | Extract to hook, page = pure composition |
| AP-09 | Inline query keys outside factory | Extract to dedicated file |
| AP-10 | `useState` duplicating server/query data | Use data directly from server component props |
| AP-11 | Button enabled during mutation | `disabled` must reflect `isPending` |
| AP-12 | Hook handling multiple business domains | Split into focused hooks, one per domain |
| AP-13 | Wrapper callback that only calls another function | Pass function reference directly (see below) |

### AP-13: Wrapper Callback Anti-Pattern

```typescript
// ❌ WRONG — unnecessary wrapper that only calls another function
const onSuccess = useCallback(() => {
  modal.close();
  onMutationSuccess();
}, [modal, onMutationSuccess]);

useCreateClient({ onSuccess: () => { modal.close(); onMutationSuccess(); } });

// ✅ RIGHT — pass references directly, compose at call site
useCreateClient({ onSuccess: [modal.close, onMutationSuccess] });
// or design hooks to accept multiple callbacks
useCreateClient({ onSuccess: onMutationSuccess, onSettled: modal.close });
```

When a callback only invokes another function without transformation, pass the reference directly. Creating `() => fn()` wrappers adds indirection, hurts readability, and creates unnecessary closures. If you need to call multiple functions, design the API to accept an array or separate callback slots rather than wrapping.

---

## Decision Tree — Choosing the Right Pattern

```
1. IS THIS NEW LOGIC?
   +-- Is it a new responsibility (no file owns it)?
        |-- YES -> go to question 2
        +-- NO -> MODIFY existing file

2. HOW MANY CALLERS DOES THE SOURCE FILE HAVE?
   |-- Many (>3 modules import it) -> #1 Facade
   |-- Few (1-2 files) -> #3 Extract & Move
   +-- Zero (brand new feature) -> CREATE new file

3. WHAT TYPE OF OPERATION?
   |-- Read-only queries -> #14 CQRS (queries.ts)
   |-- State transitions / mutations -> #14 CQRS (mutations.ts)
   |-- Orchestration of multiple domains -> #21 Orchestrator
   +-- CRUD of single entity -> CRUD Factory

4. IS THIS A CROSS-CUTTING CONCERN?
   |-- Notifications -> #4 Cross-Cutting Service
   |-- Reusable validation -> #17 Guard / Gate
   +-- Logging / metrics -> #18 Interceptor

5. IS THIS AN EXTERNAL API INTEGRATION?
   |-- Single provider -> #19 Adapter
   |-- Multiple providers -> #15 Strategy
   +-- Multiple side effects from one event -> #16 Event Emitter

6. IS THIS DATA TRANSFORMATION?
   |-- Entity <-> DTO (>2 mappings) -> #23 Mapper
   |-- Complex object with many options -> #20 Builder
   +-- Complex queries (>5 in service) -> #22 Repository

7. FRONTEND — WHAT TYPE OF COMPONENT?
   |-- Data fetching -> #7 Query Hook (or server component in Next.js)
   |-- Mutation -> #8 Action Hook
   |-- Form -> #9 Interaction Hook
   |-- Mega-component with >10 props -> #25 Compound Component
   |-- Shared state without prop drilling -> #27 Context + Provider
   |-- Section can fail independently -> #28 Error Boundary
   |-- Stateless calculation -> #13 Pure Utility
   +-- Screen/page -> #10 Screen as Coordinator (always)
```
