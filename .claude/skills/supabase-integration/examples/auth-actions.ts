/**
 * Authentication Server Actions for Next.js 16 App Router
 * Use with form actions in Client Components
 */

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// =============================================================================
// AUTHENTICATION ACTIONS
// =============================================================================

/**
 * Sign in with email and password
 */
export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Validate inputs
  if (!email || !password) {
    redirect('/login?error=Email and password are required')
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=Invalid credentials')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

/**
 * Sign up new user
 */
export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string

  // Validate inputs
  if (!email || !password || !firstName || !lastName) {
    redirect('/signup?error=All fields are required')
  }

  // Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  })

  if (authError) {
    redirect(`/signup?error=${encodeURIComponent(authError.message)}`)
  }

  // Create profile (if not using a database trigger)
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        role: 'coordinator', // Default role
      })

    if (profileError) {
      console.error('Failed to create profile:', profileError)
      // User is created but profile failed - handle accordingly
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

/**
 * Sign out current user
 */
export async function signout() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Sign out error:', error)
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

// =============================================================================
// PASSWORD MANAGEMENT
// =============================================================================

/**
 * Request password reset email
 */
export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  if (!email) {
    redirect('/forgot-password?error=Email is required')
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
  })

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/forgot-password?success=Check your email for reset link')
}

/**
 * Update password (after reset or from settings)
 */
export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  const newPassword = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!newPassword || !confirmPassword) {
    redirect('/reset-password?error=Password is required')
  }

  if (newPassword !== confirmPassword) {
    redirect('/reset-password?error=Passwords do not match')
  }

  if (newPassword.length < 8) {
    redirect('/reset-password?error=Password must be at least 8 characters')
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard?success=Password updated')
}

// =============================================================================
// PROFILE MANAGEMENT
// =============================================================================

/**
 * Update user profile
 */
export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string

  if (!firstName || !lastName) {
    redirect('/settings?error=Name is required')
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
    })
    .eq('id', user.id)

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/settings?success=Profile updated')
}

// =============================================================================
// ADMIN ACTIONS
// =============================================================================

/**
 * Update user role (admin only)
 */
export async function updateUserRole(formData: FormData) {
  const supabase = await createClient()

  // Check if current user is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentProfile?.role !== 'admin') {
    redirect('/dashboard?error=Unauthorized')
  }

  const userId = formData.get('userId') as string
  const role = formData.get('role') as 'admin' | 'coordinator'

  if (!userId || !role) {
    redirect('/admin/users?error=Invalid request')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) {
    redirect(`/admin/users?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/admin/users', 'page')
  redirect('/admin/users?success=Role updated')
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get current user with profile
 */
export async function getCurrentUser() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    ...user,
    profile,
  }
}

/**
 * Check if current user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return user
}

/**
 * Require admin role - redirect if not admin
 */
export async function requireAdmin() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard?error=Admin access required')
  }

  return user
}
