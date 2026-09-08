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
      return { ...state, user: action.user, profile: state.user?.id === action.user?.id ? state.profile : null, loading: !!action.user }
    case 'PROFILE_LOADED':
      return state.user?.id === action.userId ? { ...state, profile: action.profile, loading: false } : state
    case 'SIGNED_OUT':
      return { ...state, user: null, profile: null, loading: false }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    dispatch({ type: 'PROFILE_LOADED', profile: data ?? null, userId })
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
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username } } })
    if (error) throw error
    return data
  }

  const signIn = async ({ identifier, password }) => {
    const login = identifier.trim()
    if (!login) throw new Error('Enter your username or email.')
    if (login.includes('@')) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: login, password })
      if (error) throw error
      return data
    }

    const { data, error } = await supabase.functions.invoke('username-login', {
      body: { username: login, password },
    })
    if (error) {
      let message = 'Username sign-in is unavailable. Please try your email.'
      if (error.context instanceof Response) {
        const result = await error.context.json().catch(() => null)
        if (typeof result?.error === 'string') message = result.error
      }
      throw new Error(message)
    }
    if (!data?.access_token || !data?.refresh_token) {
      throw new Error('Unable to sign in. Please try again.')
    }
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: data.access_token, refresh_token: data.refresh_token,
    })
    if (sessionError) throw sessionError
    return sessionData
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
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
