# Setup shadcn/ui for One Staff Dashboard

## Context

Senior frontend developer setting up shadcn/ui component library for an internal business dashboard application.

**Project Stack:**
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Biome (linter/formatter)
- pnpm package manager
- Path alias: `@/*` maps to project root

**Design Requirements:**
- Style: `new-york` (professional look for business dashboard)
- Theme: Custom teal primary color
- Dark mode: Class-based switching with `next-themes`
- Color format: `oklch` (modern color space for Tailwind v4)

## Source Files

### Primary (must read):
- `app/globals.css` - Current CSS configuration
- `components.json` - shadcn/ui config (will be created)
- `lib/utils/cn.ts` - Utility for className merging

### Reference:
- `tsconfig.json` - Path aliases configuration
- `package.json` - Current dependencies

## Tasks

### Phase 1: Initialize shadcn/ui

1. Run the shadcn/ui init command:

```bash
pnpm dlx shadcn@latest init
```

2. When prompted, select these options:
   - Style: `new-york`
   - Base color: `slate`
   - CSS variables: `yes`
   - React Server Components: `yes`

3. Verify `components.json` was created with correct paths:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils/cn",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

**Note:** For Tailwind CSS v4, the `config` field should be empty - configuration is handled in `globals.css`.

### Phase 2: Install Required Dependencies

```bash
# Animation library for shadcn components
pnpm add tw-animate-css

# Dark mode support
pnpm add next-themes
```

### Phase 3: Configure Custom Theme Colors

Replace `app/globals.css` with the complete color palette using `oklch` format:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(0.9842 0.0034 247.8575);
  --foreground: oklch(0.1363 0.0364 259.2010);
  --card: oklch(1.0000 0 0);
  --card-foreground: oklch(0.1363 0.0364 259.2010);
  --popover: oklch(1.0000 0 0);
  --popover-foreground: oklch(0.1363 0.0364 259.2010);
  --primary: oklch(0.7038 0.1230 182.5025);
  --primary-foreground: oklch(1.0000 0 0);
  --secondary: oklch(0.9288 0.0126 255.5078);
  --secondary-foreground: oklch(0.1363 0.0364 259.2010);
  --muted: oklch(0.9683 0.0069 247.8956);
  --muted-foreground: oklch(0.5544 0.0407 257.4166);
  --accent: oklch(0.9288 0.0126 255.5078);
  --accent-foreground: oklch(0.1363 0.0364 259.2010);
  --destructive: oklch(0.6368 0.2078 25.3313);
  --destructive-foreground: oklch(0.9842 0.0034 247.8575);
  --border: oklch(0.9288 0.0126 255.5078);
  --input: oklch(0.9288 0.0126 255.5078);
  --ring: oklch(0.7107 0.0351 256.7878);
  --chart-1: oklch(0.5854 0.2041 277.1173);
  --chart-2: oklch(0.6559 0.2118 354.3084);
  --chart-3: oklch(0.7686 0.1647 70.0804);
  --chart-4: oklch(0.6959 0.1491 162.4796);
  --chart-5: oklch(0.6268 0.2325 303.9004);
  --sidebar: oklch(1.0000 0 0);
  --sidebar-foreground: oklch(0.1363 0.0364 259.2010);
  --sidebar-primary: oklch(0.7038 0.1230 182.5025);
  --sidebar-primary-foreground: oklch(1.0000 0 0);
  --sidebar-accent: oklch(0.9288 0.0126 255.5078);
  --sidebar-accent-foreground: oklch(0.1363 0.0364 259.2010);
  --sidebar-border: oklch(0.9288 0.0126 255.5078);
  --sidebar-ring: oklch(0.7107 0.0351 256.7878);
  --font-sans: sans-serif;
  --font-serif: serif;
  --font-mono: monospace;
  --radius: 0.5rem;
  --shadow-x: 0;
  --shadow-y: 0;
  --shadow-blur: 0;
  --shadow-spread: 0;
  --shadow-opacity: 0;
  --shadow-color: 0 0 0;
  --shadow-2xs: 0 0 0 0 hsl(0 0 0 / 0.00);
  --shadow-xs: 0 0 0 0 hsl(0 0 0 / 0.00);
  --shadow-sm: 0 0 0 0 hsl(0 0 0 / 0.00), 0 1px 2px -1px hsl(0 0 0 / 0.00);
  --shadow: 0 0 0 0 hsl(0 0 0 / 0.00), 0 1px 2px -1px hsl(0 0 0 / 0.00);
  --shadow-md: 0 0 0 0 hsl(0 0 0 / 0.00), 0 2px 4px -1px hsl(0 0 0 / 0.00);
  --shadow-lg: 0 0 0 0 hsl(0 0 0 / 0.00), 0 4px 6px -1px hsl(0 0 0 / 0.00);
  --shadow-xl: 0 0 0 0 hsl(0 0 0 / 0.00), 0 8px 10px -1px hsl(0 0 0 / 0.00);
  --shadow-2xl: 0 0 0 0 hsl(0 0 0 / 0.00);
  --tracking-normal: normal;
  --spacing: 0.25rem;
}

.dark {
  --background: oklch(0.1363 0.0364 259.2010);
  --foreground: oklch(0.9842 0.0034 247.8575);
  --card: oklch(0.1363 0.0364 259.2010);
  --card-foreground: oklch(0.9842 0.0034 247.8575);
  --popover: oklch(0.1363 0.0364 259.2010);
  --popover-foreground: oklch(0.9842 0.0034 247.8575);
  --primary: oklch(0.7038 0.1230 182.5025);
  --primary-foreground: oklch(0.1363 0.0364 259.2010);
  --secondary: oklch(0.2795 0.0368 260.0310);
  --secondary-foreground: oklch(0.9842 0.0034 247.8575);
  --muted: oklch(0.2795 0.0368 260.0310);
  --muted-foreground: oklch(0.7107 0.0351 256.7878);
  --accent: oklch(0.2795 0.0368 260.0310);
  --accent-foreground: oklch(0.9842 0.0034 247.8575);
  --destructive: oklch(0.6368 0.2078 25.3313);
  --destructive-foreground: oklch(0.9842 0.0034 247.8575);
  --border: oklch(0.3717 0.0392 257.2870);
  --input: oklch(0.3717 0.0392 257.2870);
  --ring: oklch(0.5544 0.0407 257.4166);
  --chart-1: oklch(0.5854 0.2041 277.1173);
  --chart-2: oklch(0.6559 0.2118 354.3084);
  --chart-3: oklch(0.7686 0.1647 70.0804);
  --chart-4: oklch(0.6959 0.1491 162.4796);
  --chart-5: oklch(0.6268 0.2325 303.9004);
  --sidebar: oklch(0.2077 0.0398 265.7549);
  --sidebar-foreground: oklch(0.9842 0.0034 247.8575);
  --sidebar-primary: oklch(0.7038 0.1230 182.5025);
  --sidebar-primary-foreground: oklch(0.1363 0.0364 259.2010);
  --sidebar-accent: oklch(0.3717 0.0392 257.2870);
  --sidebar-accent-foreground: oklch(0.9842 0.0034 247.8575);
  --sidebar-border: oklch(0.3717 0.0392 257.2870);
  --sidebar-ring: oklch(0.5544 0.0407 257.4166);
  --font-sans: sans-serif;
  --font-serif: serif;
  --font-mono: monospace;
  --radius: 0.5rem;
  --shadow-x: 0;
  --shadow-y: 0;
  --shadow-blur: 0;
  --shadow-spread: 0;
  --shadow-opacity: 0;
  --shadow-color: 0 0 0;
  --shadow-2xs: 0 0 0 0 hsl(0 0 0 / 0.00);
  --shadow-xs: 0 0 0 0 hsl(0 0 0 / 0.00);
  --shadow-sm: 0 0 0 0 hsl(0 0 0 / 0.00), 0 1px 2px -1px hsl(0 0 0 / 0.00);
  --shadow: 0 0 0 0 hsl(0 0 0 / 0.00), 0 1px 2px -1px hsl(0 0 0 / 0.00);
  --shadow-md: 0 0 0 0 hsl(0 0 0 / 0.00), 0 2px 4px -1px hsl(0 0 0 / 0.00);
  --shadow-lg: 0 0 0 0 hsl(0 0 0 / 0.00), 0 4px 6px -1px hsl(0 0 0 / 0.00);
  --shadow-xl: 0 0 0 0 hsl(0 0 0 / 0.00), 0 8px 10px -1px hsl(0 0 0 / 0.00);
  --shadow-2xl: 0 0 0 0 hsl(0 0 0 / 0.00);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);

  --tracking-tighter: calc(var(--tracking-normal) - 0.05em);
  --tracking-tight: calc(var(--tracking-normal) - 0.025em);
  --tracking-normal: var(--tracking-normal);
  --tracking-wide: calc(var(--tracking-normal) + 0.025em);
  --tracking-wider: calc(var(--tracking-normal) + 0.05em);
  --tracking-widest: calc(var(--tracking-normal) + 0.1em);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    letter-spacing: var(--tracking-normal);
  }
}
```

### Phase 4: Install Essential Components

Run these commands to add base components:

```bash
# All at once (recommended)
pnpm dlx shadcn@latest add button input label textarea card separator dialog dropdown-menu popover tooltip select checkbox radio-group table badge avatar alert sonner skeleton sidebar breadcrumb
```

Or install individually:

```bash
# Core form components
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add label
pnpm dlx shadcn@latest add textarea

# Layout components
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add separator

# Overlay components
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add popover
pnpm dlx shadcn@latest add tooltip

# Selection components
pnpm dlx shadcn@latest add select
pnpm dlx shadcn@latest add checkbox
pnpm dlx shadcn@latest add radio-group

# Data display
pnpm dlx shadcn@latest add table
pnpm dlx shadcn@latest add badge
pnpm dlx shadcn@latest add avatar

# Feedback
pnpm dlx shadcn@latest add alert
pnpm dlx shadcn@latest add sonner
pnpm dlx shadcn@latest add skeleton

# Navigation (for dashboard sidebar)
pnpm dlx shadcn@latest add sidebar
pnpm dlx shadcn@latest add breadcrumb
```

### Phase 5: Configure Dark Mode Provider

1. Create theme provider at `components/providers/theme-provider.tsx`:

```tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
};
```

2. Add provider to root layout `app/layout.tsx`:

```tsx
import { ThemeProvider } from '@/components/providers/theme-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

3. Create theme toggle component at `components/ui/mode-toggle.tsx`:

```tsx
'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ModeToggle = () => {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

### Phase 6: Create Barrel Export

Update `components/ui/index.ts` to export all components:

```typescript
// Core
export { Button, buttonVariants } from './button';
export { Input } from './input';
export { Label } from './label';
export { Textarea } from './textarea';

// Layout
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
export { Separator } from './separator';

// Overlay
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';

// Theme
export { ModeToggle } from './mode-toggle';

// ... add remaining exports as components are added
```

### Phase 7: Verify Installation

1. Run development server:

```bash
pnpm dev
```

2. Create a test component to verify everything works:

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ModeToggle } from '@/components/ui/mode-toggle';

export const TestComponents = () => {
  return (
    <div className="p-8 space-y-4">
      <ModeToggle />
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </CardContent>
      </Card>
    </div>
  );
};
```

3. Verify:
   - Components render correctly
   - Primary teal color displays properly (`oklch(0.7038 0.1230 182.5025)`)
   - Dark mode toggle works
   - No console errors

## Output Format

After completing setup, the project should have:

```
components/
├── ui/
│   ├── button.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── mode-toggle.tsx
│   ├── select.tsx
│   ├── table.tsx
│   ├── ... (other components)
│   └── index.ts
├── providers/
│   └── theme-provider.tsx
components.json
```

## Constraints

- DO NOT modify existing component logic, only add new shadcn components
- DO NOT use ESLint or Prettier comments - project uses Biome
- DO NOT install lucide-react separately - shadcn/ui handles it automatically
- ONLY use pnpm for package management
- PRESERVE existing path alias configuration (@/*)
- USE oklch format for all color values (Tailwind v4 standard)
- FOLLOW new-york style conventions for consistent look
- For Tailwind CSS v4, leave `tailwind.config` empty in `components.json`

## Troubleshooting

### Tailwind CSS v4 Compatibility

If encountering issues:

1. Ensure `@import "tailwindcss"` is at the top of `globals.css`
2. Add `@import "tw-animate-css";` after tailwindcss import
3. Use `@custom-variant dark (&:is(.dark *));` for dark mode
4. Use `@theme inline` block for custom properties

### Component Import Errors

If components fail to import:

1. Verify `tsconfig.json` has correct path mapping
2. Check `components.json` aliases match project structure
3. Restart TypeScript server in IDE

### Dark Mode Not Working

1. Ensure `suppressHydrationWarning` is on `<html>` tag
2. Verify `attribute="class"` in ThemeProvider
3. Check `.dark` class styles are defined in globals.css
4. Verify `@custom-variant dark (&:is(.dark *));` is present
