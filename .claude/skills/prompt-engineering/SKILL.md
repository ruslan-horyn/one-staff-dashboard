---
name: prompt-engineering
description: This skill should be used when the user asks to "create a prompt", "write a prompt", "generate a prompt template", "stwórz prompt", "napisz prompt", or needs to create reusable prompts for AI agents following Claude prompt engineering best practices. Saves prompts to `.ai/promts/` directory.
version: 1.0.0
---

# Prompt Engineering Skill

Create well-structured, reusable prompts following Claude prompt engineering best practices.

## When to Use

- Creating new prompts for repetitive AI tasks
- Writing prompt templates for code generation
- Designing prompts for data analysis or transformation
- Building prompts for documentation or schema synchronization

## Output Location

Save all prompts to: `.ai/promts/[prompt-name].md`

## Prompt Structure Template

Every prompt follows this structure:

```markdown
# [Task Title]

## Context

[Role definition and project context]

## Source Files

[List of files to read/analyze]

## Tasks

### Phase 1: [Analysis/Research]
[Steps for understanding the problem]

### Phase 2: [Implementation/Transformation]
[Steps for executing the task]

### Phase 3: [Validation/Output]
[Steps for verifying results]

## Output Format

[Expected output structure with examples]

## Constraints

[Rules and limitations]
```

## Core Principles

### 1. Clear Role Definition

Start with explicit context about the AI's role:

```markdown
## Context

Expert [domain] developer working with [technology stack].
Project uses:
- [Technology 1]
- [Technology 2]
- [Technology 3]
```

### 2. Explicit File References

List all files the AI should read:

```markdown
## Source Files

### Primary (must read):
- `path/to/file1.ts` - description
- `path/to/file2.ts` - description

### Reference (read as needed):
- `path/to/types.ts` - type definitions
```

### 3. Phased Task Breakdown

Break complex tasks into sequential phases:

```markdown
## Tasks

### Phase 1: Analysis
1. Read all source files
2. Extract [specific information]
3. Identify [patterns/issues]

### Phase 2: Implementation
1. Create [output]
2. Apply [transformations]
3. Validate [constraints]
```

### 4. Concrete Output Examples

Show exact expected format:

```markdown
## Output Format

### Report Structure
| Column A | Column B | Column C |
|----------|----------|----------|
| value1   | value2   | value3   |

### Code Structure
\`\`\`typescript
export const example = z.object({
  field: z.string(),
});
\`\`\`
```

### 5. Explicit Constraints

Define what NOT to do:

```markdown
## Constraints

- DO NOT modify [specific files]
- DO NOT change [specific patterns]
- ONLY update [specific scope]
- Preserve [specific formatting]
```

## Language Guidelines

- Use imperative form: "Read the file", "Extract data", "Generate output"
- Avoid second person: NO "You should...", YES "Start by..."
- Be specific: NO "process the data", YES "parse JSON and extract `name` field"
- Use Polish or English consistently (match user's language)

## Naming Convention

Use descriptive kebab-case names:
- `sync-db-plan-schemas.md` - synchronization prompts
- `generate-zod-schemas.md` - generation prompts
- `create-api-endpoints.md` - creation prompts
- `validate-migrations.md` - validation prompts

## Quick Reference

### Minimal Prompt (~500 words)

For simple, focused tasks:
- Context (2-3 sentences)
- Source files (2-3 files)
- Single task phase
- Output format
- 2-3 constraints

### Standard Prompt (~1500 words)

For moderate complexity:
- Full context section
- Categorized source files
- 2-3 task phases
- Detailed output examples
- Comprehensive constraints

### Comprehensive Prompt (~3000 words)

For complex workflows:
- Extensive context with tech stack
- Multiple file categories
- 3+ task phases with sub-steps
- Multiple output format examples
- Detailed constraints and edge cases

## Additional Resources

### Reference Files

Consult for detailed guidelines:
- **`references/prompt-patterns.md`** - Common prompt patterns and anti-patterns
- **`references/output-formats.md`** - Standard output format templates

### Example Files

Working examples in `examples/`:
- **`sync-schema-example.md`** - Schema synchronization prompt
- **`generate-code-example.md`** - Code generation prompt

## Workflow

1. **Understand the task**: Clarify what repetitive work needs automation
2. **Identify inputs**: List all files and data sources needed
3. **Define outputs**: Specify exact expected format
4. **Structure phases**: Break into logical steps
5. **Add constraints**: Define boundaries and rules
6. **Save to `.ai/promts/`**: Use descriptive filename
