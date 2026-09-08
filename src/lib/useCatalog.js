import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
export default function useCatalog() {
 const [state, setState] = useState({ categories: [], products: [], loading: true, error: '' })
 useEffect(() => { let active = true
 Promise.all([supabase.from('categories').select('*').order('sort_order').order('name'), supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false })]).then(([c,p]) => { if(active) setState({categories:c.data ?? [], products:p.data ?? [], loading:false, error:c.error?.message || p.error?.message || ''}) }).catch(e => {if(active) setState(s => ({...s, loading:false,error:e.message}))})
 return () => {active=false}
 }, [])
 return state
}