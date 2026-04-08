'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import type { PaginatedResult } from '@/services/shared/pagination';
import {
	applyPaginationToQuery,
	DEFAULT_PAGE_SIZE,
	paginateResult,
} from '@/services/shared/pagination';
import type { Tables } from '@/types/database';
import { createAction } from '../shared/action-wrapper';
import {
	type DeactivateUserInput,
	deactivateUserSchema,
	type InviteCoordinatorInput,
	inviteCoordinatorSchema,
	type UpdateProfileInput,
	type UserFilter,
	updateProfileSchema,
	userFilterSchema,
} from './schemas';

// ============================================================================
// Types
// ============================================================================

export interface UserProfile {
	id: string;
	first_name: string;
	last_name: string;
	role: 'admin' | 'coordinator';
	organization_id: string;
	created_at: string;
	email?: string;
	is_banned?: boolean;
}

export type Profile = Tables<'profiles'>;

// ============================================================================
// Queries
// ============================================================================

/**
 * Retrieves a paginated list of users in the current user's organization.
 * Enriches profiles with email and ban status from auth.users via admin client.
 */
export const getUsers = createAction<UserFilter, PaginatedResult<UserProfile>>(
	async (input, { supabase, user }) => {
		const {
			page = 1,
			pageSize = DEFAULT_PAGE_SIZE,
			search,
			sortBy = 'name',
			sortOrder = 'asc',
		} = input;

		// Get user's organization
		const { data: profile } = await supabase
			.from('profiles')
			.select('organization_id')
			.eq('id', user.id)
			.single();

		if (!profile) throw new Error('Profile not found');

		// Build count query
		let countQuery = supabase
			.from('profiles')
			.select('*', { count: 'exact', head: true })
			.eq('organization_id', profile.organization_id);

		if (search) {
			countQuery = countQuery.or(
				`first_name.ilike.%${search}%,last_name.ilike.%${search}%`
			);
		}

		// Build data query
		let dataQuery = supabase
			.from('profiles')
			.select('*')
			.eq('organization_id', profile.organization_id);

		if (search) {
			dataQuery = dataQuery.or(
				`first_name.ilike.%${search}%,last_name.ilike.%${search}%`
			);
		}

		if (sortBy === 'name') {
			dataQuery = dataQuery.order('first_name', {
				ascending: sortOrder === 'asc',
			});
		} else {
			dataQuery = dataQuery.order('created_at', {
				ascending: sortOrder === 'asc',
			});
		}

		dataQuery = applyPaginationToQuery(dataQuery, page, pageSize);

		const [countResult, dataResult] = await Promise.all([
			countQuery,
			dataQuery,
		]);

		if (countResult.error) throw countResult.error;
		if (dataResult.error) throw dataResult.error;

		// Enrich profiles with email and banned status from auth admin
		const adminClient = createAdminClient();
		const profiles = dataResult.data ?? [];
		const enrichedProfiles: UserProfile[] = await Promise.all(
			profiles.map(async (p) => {
				const { data: authUser } = await adminClient.auth.admin.getUserById(
					p.id
				);
				return {
					...p,
					email: authUser?.user?.email ?? '',
					is_banned: !!authUser?.user?.banned_until,
				};
			})
		);

		return paginateResult(
			enrichedProfiles,
			countResult.count ?? 0,
			page,
			pageSize
		);
	},
	{ schema: userFilterSchema }
);

/**
 * Retrieves the current user's own profile.
 */
export const getCurrentProfile = createAction<void, Profile>(
	async (_input, { supabase, user }) => {
		const { data, error } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', user.id)
			.single();

		if (error) throw error;
		return data;
	}
);

// ============================================================================
// Mutations
// ============================================================================

/**
 * Invites a coordinator to the organization via Supabase admin invite.
 * Passes organization_id, role, first_name, last_name in invite metadata
 * so the handle_new_user trigger can create the profile correctly.
 */
export const inviteCoordinator = createAction<
	InviteCoordinatorInput,
	{ id: string }
>(
	async (input, { supabase, user }) => {
		// Get inviter's organization
		const { data: profile } = await supabase
			.from('profiles')
			.select('organization_id')
			.eq('id', user.id)
			.single();

		if (!profile) throw new Error('Profile not found');

		const adminClient = createAdminClient();
		const { data, error } = await adminClient.auth.admin.inviteUserByEmail(
			input.email,
			{
				data: {
					organization_id: profile.organization_id,
					role: 'coordinator',
					first_name: input.firstName,
					last_name: input.lastName,
				},
			}
		);

		if (error) throw error;
		return { id: data.user.id };
	},
	{ schema: inviteCoordinatorSchema }
);

/**
 * Deactivates a user by banning them for ~100 years (effectively forever).
 */
export const deactivateUser = createAction<DeactivateUserInput, { id: string }>(
	async (input, { supabase: _supabase }) => {
		const adminClient = createAdminClient();
		const { error } = await adminClient.auth.admin.updateUserById(
			input.userId,
			{
				ban_duration: '876000h', // ~100 years
			}
		);

		if (error) throw error;
		return { id: input.userId };
	},
	{ schema: deactivateUserSchema }
);

/**
 * Reactivates a banned user by removing the ban.
 */
export const reactivateUser = createAction<DeactivateUserInput, { id: string }>(
	async (input, { supabase: _supabase }) => {
		const adminClient = createAdminClient();
		const { error } = await adminClient.auth.admin.updateUserById(
			input.userId,
			{
				ban_duration: 'none',
			}
		);

		if (error) throw error;
		return { id: input.userId };
	},
	{ schema: deactivateUserSchema }
);

/**
 * Updates the current user's own profile (first/last name).
 */
export const updateProfile = createAction<UpdateProfileInput, Profile>(
	async (input, { supabase, user }) => {
		const updates: Partial<{ first_name: string; last_name: string }> = {};
		if (input.firstName) updates.first_name = input.firstName;
		if (input.lastName) updates.last_name = input.lastName;

		const { data, error } = await supabase
			.from('profiles')
			.update(updates)
			.eq('id', user.id)
			.select()
			.single();

		if (error) throw error;
		return data;
	},
	{ schema: updateProfileSchema }
);
