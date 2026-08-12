import { supabase } from './supabase'

export type AdminAccessStatus = {
  isAuthenticated: boolean
  isAdmin: boolean
  userId: string | null
  message: string | null
}

export async function getAdminAccessStatus(): Promise<AdminAccessStatus> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      isAuthenticated: false,
      isAdmin: false,
      userId: null,
      message: 'not_authenticated',
    }
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin')

  if (adminError) {
    console.error('Admin check error:', adminError)

    return {
      isAuthenticated: true,
      isAdmin: false,
      userId: user.id,
      message: 'admin_check_failed',
    }
  }

  return {
    isAuthenticated: true,
    isAdmin: isAdmin === true,
    userId: user.id,
    message: isAdmin === true ? null : 'access_denied',
  }
}

export async function signOutAdmin() {
  await supabase.auth.signOut()
}