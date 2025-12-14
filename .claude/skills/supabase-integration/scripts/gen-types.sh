#!/bin/bash
# Generate TypeScript types from Supabase database schema
# Run this after making changes to the database schema

set -e

echo "Generating TypeScript types from Supabase schema..."

# Ensure the output directory exists
mkdir -p lib/supabase

# Generate types from local Supabase instance
pnpm supabase gen types typescript --local > lib/supabase/database.types.ts

echo "Types generated at lib/supabase/database.types.ts"

# Optional: Format the generated file
if command -v prettier &> /dev/null; then
  echo "Formatting with prettier..."
  prettier --write lib/supabase/database.types.ts
fi

echo "Done!"
