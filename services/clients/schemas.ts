import { z } from 'zod';

import {
  uuidSchema,
  optionalEmailSchema,
  optionalPhoneSchema,
  baseFilterSchema,
  sortOrderSchema,
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
  email: optionalEmailSchema,
  phone: optionalPhoneSchema,
  address: z
    .string()
    .trim()
    .min(1, 'Address cannot be empty')
    .max(500, 'Address must be at most 500 characters')
    .optional()
    .nullable(),
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
  email: optionalEmailSchema,
  phone: optionalPhoneSchema,
  address: z
    .string()
    .trim()
    .min(1, 'Address cannot be empty')
    .max(500, 'Address must be at most 500 characters')
    .optional()
    .nullable(),
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
export const clientSortBySchema = z.enum(['name', 'created_at']).optional().default('name');

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
// Type Exports
// ============================================================================

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type DeleteClientInput = z.infer<typeof deleteClientSchema>;
export type ClientIdInput = z.infer<typeof clientIdSchema>;
export type ClientSortBy = z.infer<typeof clientSortBySchema>;
export type ClientFilter = z.infer<typeof clientFilterSchema>;
