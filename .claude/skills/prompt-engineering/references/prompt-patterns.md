# Prompt Patterns and Anti-Patterns

## Effective Patterns

### Pattern 1: Source of Truth Declaration

Establish which files are authoritative:

```markdown
### Source of Truth

Migrations are the source of truth for database schema.
- `supabase/migrations/*.sql` - AUTHORITATIVE
- `docs/db-plan.md` - DERIVED (update to match migrations)
- `types/database.ts` - AUTO-GENERATED (do not modify)
```

**When to use:** Schema sync, documentation updates, type generation

### Pattern 2: Comparison Table Format

Structure comparisons clearly:

```markdown
## Output Format

### Discrepancy Report

| Location | Expected | Actual | Action |
|----------|----------|--------|--------|
| file.ts:15 | `string \| null` | `string` | Change to nullable |
```

**When to use:** Validation, auditing, synchronization tasks

### Pattern 3: Progressive Analysis

Build understanding step by step:

```markdown
### Phase 1: Discovery
1. List all files matching pattern `services/*/schemas.ts`
2. For each file, extract schema names

### Phase 2: Analysis
1. For each schema, map fields to database columns
2. Identify type mismatches

### Phase 3: Report
1. Generate discrepancy table
2. Prioritize by severity
```

**When to use:** Complex analysis requiring multiple passes

### Pattern 4: Conditional Branching

Handle different scenarios:

```markdown
## Constraints

### If field is nullable in DB:
- Schema must use `.optional()` or `.nullable()`
- Type must include `| null`

### If field has DEFAULT in DB:
- Schema for INSERT can mark as `.optional()`
- Schema for UPDATE should keep as optional
```

**When to use:** Tasks with multiple valid paths

### Pattern 5: Example-Driven Specification

Show don't tell:

```markdown
## Expected Transformation

### Input (from migration):
\`\`\`sql
email VARCHAR(255) NULL
\`\`\`

### Output (Zod schema):
\`\`\`typescript
email: z.string().email().optional().nullable()
\`\`\`
```

**When to use:** Code transformation, format conversion

## Anti-Patterns to Avoid

### Anti-Pattern 1: Vague Instructions

❌ **Bad:**
```markdown
Analyze the code and fix any issues.
```

✅ **Good:**
```markdown
Compare Zod schema field optionality with database NULL constraints.
Report fields where schema allows null but DB requires NOT NULL.
```

### Anti-Pattern 2: Missing File Paths

❌ **Bad:**
```markdown
Read the schema files and migration files.
```

✅ **Good:**
```markdown
### Files to Read:
- `services/clients/schemas.ts`
- `supabase/migrations/20251209220746_tables.sql`
```

### Anti-Pattern 3: Implicit Assumptions

❌ **Bad:**
```markdown
Update the types to match the database.
```

✅ **Good:**
```markdown
Update TypeScript types to match database constraints:
- `NOT NULL` column → required field (no `?`)
- Nullable column → optional field with `| null`
- `DEFAULT` value → optional in create, required in response
```

### Anti-Pattern 4: No Output Format

❌ **Bad:**
```markdown
Generate a report of the findings.
```

✅ **Good:**
```markdown
## Output Format

### Summary Section
- Total schemas analyzed: [N]
- Discrepancies found: [N]
- Files requiring changes: [list]

### Detail Section
For each discrepancy:
| Schema | Field | Issue | Fix |
```

### Anti-Pattern 5: Unbounded Scope

❌ **Bad:**
```markdown
Review and improve all the code.
```

✅ **Good:**
```markdown
## Scope
- ONLY files in `services/*/schemas.ts`
- ONLY Zod validation schemas
- DO NOT modify `types/database.ts`
- DO NOT create new files
```

## Domain-Specific Patterns

### Database Schema Prompts

```markdown
## Database Mapping Rules

| PostgreSQL Type | Zod Validator | TypeScript Type |
|-----------------|---------------|-----------------|
| VARCHAR(n) | `z.string().max(n)` | `string` |
| TEXT | `z.string()` | `string` |
| UUID | `z.string().uuid()` | `string` |
| BOOLEAN | `z.boolean()` | `boolean` |
| TIMESTAMPTZ | `z.string().datetime()` | `string` |
| JSONB | `z.record(z.unknown())` | `Record<string, unknown>` |
```

### Code Generation Prompts

```markdown
## Code Style Requirements

- Use `const` arrow functions for components
- Export types alongside schemas
- Add JSDoc comments for public APIs
- Follow existing naming conventions in codebase
```

### Validation Prompts

```markdown
## Validation Checklist

For each item, mark as:
- ✅ Passed
- ❌ Failed (with reason)
- ⚠️ Warning (needs review)
```

## Composition Techniques

### Merging Multiple Concerns

```markdown
## Task: Sync and Validate

### Step 1: Sync (from sync-db-plan-schemas.md)
[Import relevant sections]

### Step 2: Validate (from validate-schemas.md)
[Import relevant sections]

### Step 3: Report Combined Results
[Unified output format]
```

### Parameterized Prompts

```markdown
## Configuration

Replace these placeholders before use:
- `{{MODULE}}` - Target module name (e.g., "clients")
- `{{TABLE}}` - Database table name (e.g., "clients")
- `{{SCHEMA_PATH}}` - Path to schema file
```
