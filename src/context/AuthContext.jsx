import { createContext, useContext, useEffect, useReducer, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

const initialState = {
  user: null,
  profile: null,
  loading: true,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SESSION_LOADED':
      return { ...state, user: action.user, loading: false }
    case 'PROFILE_LOADED':
      return { ...state, profile: action.profile }
    case 'SIGNED_OUT':
      return { ...state, user: null, profile: null, loading: false }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (!error) dispatch({ type: 'PROFILE_LOADED', profile: data })
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch({ type: 'SESSION_LOADED', user: session?.user ?? null })
      if (session?.user) fetchProfile(session.user.id)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch({ type: 'SESSION_LOADED', user: session?.user ?? null })
      if (session?.user) fetchProfile(session.user.id)
    })

    return () => listener.subscription.unsubscribe()
  }, [fetchProfile])

  const signUp = async ({ email, password, username }) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, username })
      if (profileError) throw profileError
    }
    return data
  }

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    dispatch({ type: 'SIGNED_OUT' })
  }

  const value = {
    ...state,
    isAdmin: state.profile?.role === 'admin',
    signUp,
    signIn,
    signOut,
    refreshProfile: () => state.user && fetchProfile(state.user.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
