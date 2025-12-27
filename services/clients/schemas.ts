import { z } from 'zod';

import {
  baseFilterSchema,
  emailSchema,
  phoneSchema,
  sortOrderSchema,
  uuidSchema
} from '@/services/shared/schemas';

// ============================================================================
// Client Schemas
// ============================================================================

/**
 * Schema for creating a new client
 * Used by createClient server action
 */
export const createClientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(255, 'Name must be at most 255 characters'),
  email: emailSchema,
  phone: phoneSchema,
  address: z
    .string()
    .trim()
    .min(1, 'Address is required')
    .max(500, 'Address must be at most 500 characters'),
});

/**
 * Schema for updating an existing client
 * All fields except id are optional
 */
export const updateClientSchema = z.object({
  id: uuidSchema,
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(255, 'Name must be at most 255 characters')
    .optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  address: z
    .string()
    .trim()
    .min(1, 'Address is required')
    .max(500, 'Address must be at most 500 characters')
    .optional(),
});

/**
 * Schema for deleting a client
 * Used by deleteClient server action
 */
export const deleteClientSchema = z.object({
  id: uuidSchema,
});

/**
 * Schema for client ID parameter
 */
export const clientIdSchema = z.object({
  id: uuidSchema,
});

/** Allowed sort fields for clients */
export const clientSortBySchema = z.enum(['name', 'created_at']).optional().default('created_at');

/**
 * Schema for filtering clients list
 * Used by getClients query
 */
export const clientFilterSchema = baseFilterSchema.extend({
  sortBy: clientSortBySchema,
  sortOrder: sortOrderSchema,
  includeDeleted: z.boolean().optional().default(false),
});

// ============================================================================
// Query Configuration
// ============================================================================

/** Searchable columns for clients list (OCP - extend here to add new searchable fields) */
export const CLIENT_SEARCHABLE_COLUMNS = ['name', 'email', 'phone', 'address'] as const;

/** Sortable columns for clients list */
export const CLIENT_SORTABLE_COLUMNS = ['name', 'created_at'] as const;

// ============================================================================
// Type Exports
// ============================================================================

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type DeleteClientInput = z.infer<typeof deleteClientSchema>;
export type ClientIdInput = z.infer<typeof clientIdSchema>;
export type ClientSortBy = z.infer<typeof clientSortBySchema>;
export type ClientFilter = z.infer<typeof clientFilterSchema>;
