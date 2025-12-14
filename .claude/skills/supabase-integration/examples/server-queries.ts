/**
 * Server-side Supabase query patterns for Next.js 16 App Router
 * These examples run in Server Components and Route Handlers
 */

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

// Type aliases for cleaner code
type Client = Database['public']['Tables']['clients']['Row']
type WorkLocation = Database['public']['Tables']['work_locations']['Row']
type Position = Database['public']['Tables']['positions']['Row']
type TemporaryWorker = Database['public']['Tables']['temporary_workers']['Row']
type Assignment = Database['public']['Tables']['assignments']['Row']

// =============================================================================
// BASIC QUERIES
// =============================================================================

/**
 * Fetch all active clients (excluding soft-deleted)
 */
export async function getActiveClients(): Promise<Client[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .is('deleted_at', null)
    .order('name')

  if (error) throw new Error(`Failed to fetch clients: ${error.message}`)
  return data ?? []
}

/**
 * Fetch single client by ID
 */
export async function getClientById(id: string): Promise<Client | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(`Failed to fetch client: ${error.message}`)
  }
  return data
}

// =============================================================================
// QUERIES WITH RELATIONS
// =============================================================================

/**
 * Fetch work locations with their parent client
 */
export async function getWorkLocationsWithClient() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('work_locations')
    .select(`
      *,
      client:clients(id, name)
    `)
    .is('deleted_at', null)
    .order('name')

  if (error) throw new Error(`Failed to fetch locations: ${error.message}`)
  return data ?? []
}

/**
 * Fetch positions with location and client info
 */
export async function getPositionsWithHierarchy() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('positions')
    .select(`
      *,
      work_location:work_locations(
        id,
        name,
        client:clients(id, name)
      )
    `)
    .is('deleted_at', null)
    .eq('is_active', true)
    .order('name')

  if (error) throw new Error(`Failed to fetch positions: ${error.message}`)
  return data ?? []
}

/**
 * Fetch assignment with all related entities
 */
export async function getAssignmentWithDetails(assignmentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      worker:temporary_workers(id, first_name, last_name, phone),
      position:positions(
        id,
        name,
        work_location:work_locations(
          id,
          name,
          client:clients(id, name)
        )
      ),
      creator:profiles!created_by(id, first_name, last_name)
    `)
    .eq('id', assignmentId)
    .single()

  if (error) throw new Error(`Failed to fetch assignment: ${error.message}`)
  return data
}

// =============================================================================
// FILTERED QUERIES
// =============================================================================

/**
 * Fetch active assignments for a specific worker
 */
export async function getWorkerActiveAssignments(workerId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      position:positions(
        name,
        work_location:work_locations(name, client:clients(name))
      )
    `)
    .eq('worker_id', workerId)
    .in('status', ['scheduled', 'active'])
    .order('start_at', { ascending: true })

  if (error) throw new Error(`Failed to fetch assignments: ${error.message}`)
  return data ?? []
}

/**
 * Fetch assignments for a date range
 */
export async function getAssignmentsByDateRange(startDate: Date, endDate: Date) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      worker:temporary_workers(first_name, last_name),
      position:positions(name, work_location:work_locations(name))
    `)
    .gte('start_at', startDate.toISOString())
    .lte('start_at', endDate.toISOString())
    .order('start_at')

  if (error) throw new Error(`Failed to fetch assignments: ${error.message}`)
  return data ?? []
}

// =============================================================================
// SEARCH QUERIES
// =============================================================================

/**
 * Search workers by name or phone (uses GIN index with pg_trgm)
 */
export async function searchWorkers(query: string, limit = 20) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('temporary_workers')
    .select('*')
    .is('deleted_at', null)
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,phone.ilike.%${query}%`)
    .limit(limit)
    .order('last_name')

  if (error) throw new Error(`Failed to search workers: ${error.message}`)
  return data ?? []
}

// =============================================================================
// RPC FUNCTION CALLS
// =============================================================================

/**
 * Check if worker is available at a specific time
 */
export async function checkWorkerAvailability(
  workerId: string,
  checkDatetime: Date
): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('is_worker_available', {
    p_worker_id: workerId,
    p_check_datetime: checkDatetime.toISOString(),
  })

  if (error) throw new Error(`Failed to check availability: ${error.message}`)
  return data ?? false
}

/**
 * Get hours report for a date range
 */
export async function getHoursReport(
  startDate: Date,
  endDate: Date,
  clientId?: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_hours_report', {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
    ...(clientId && { p_client_id: clientId }),
  })

  if (error) throw new Error(`Failed to get hours report: ${error.message}`)
  return data ?? []
}

/**
 * End an assignment
 */
export async function endAssignment(assignmentId: string, endAt?: Date) {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('end_assignment', {
    p_assignment_id: assignmentId,
    ...(endAt && { p_end_at: endAt.toISOString() }),
  })

  if (error) throw new Error(`Failed to end assignment: ${error.message}`)
  return data
}

/**
 * Cancel a scheduled assignment
 */
export async function cancelAssignment(assignmentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('cancel_assignment', {
    p_assignment_id: assignmentId,
  })

  if (error) throw new Error(`Failed to cancel assignment: ${error.message}`)
  return data
}

// =============================================================================
// MUTATION EXAMPLES
// =============================================================================

/**
 * Create a new assignment
 */
export async function createAssignment(input: {
  workerId: string
  positionId: string
  startAt: Date
  endAt?: Date
}) {
  const supabase = await createClient()

  // Get current user ID for created_by
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('assignments')
    .insert({
      worker_id: input.workerId,
      position_id: input.positionId,
      start_at: input.startAt.toISOString(),
      end_at: input.endAt?.toISOString(),
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to create assignment: ${error.message}`)
  return data
}

/**
 * Soft delete a client (admin only)
 */
export async function softDeleteClient(clientId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('clients')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', clientId)

  if (error) throw new Error(`Failed to delete client: ${error.message}`)
}

/**
 * Create a new worker
 */
export async function createWorker(input: {
  firstName: string
  lastName: string
  phone: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('temporary_workers')
    .insert({
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone, // Will be normalized by trigger
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('A worker with this phone number already exists')
    }
    throw new Error(`Failed to create worker: ${error.message}`)
  }
  return data
}
