import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase admin client with service role key.
 * Used for admin operations like user invites and deactivation.
 * MUST only be used server-side.
 */
export function createAdminClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !supabaseServiceRoleKey) {
		throw new Error('Missing Supabase admin configuration');
	}

	return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
}
