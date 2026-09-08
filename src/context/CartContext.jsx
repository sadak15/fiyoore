import { createContext, useContext, useEffect, useReducer } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

const initialState = { items: [], loading: false }

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, items: action.items, loading: false }
    case 'ADD_OR_UPDATE_ITEM': {
      const existing = state.items.find((i) => i.product_id === action.item.product_id)
      const items = existing
        ? state.items.map((i) => (i.product_id === action.item.product_id ? action.item : i))
        : [...state.items, action.item]
      return { ...state, items }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.product_id !== action.productId) }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      dispatch({ type: 'CLEAR_CART' })
      return
    }
    supabase
      .from('cart_items')
      .select('id, product_id, quantity, products(name, price, image_url, stock)')
      .eq('user_id', user.id)
      .then(({ data }) => dispatch({ type: 'SET_CART', items: data ?? [] }))
  }, [user])

  const addItem = async (productId, quantity = 1) => {
    if (!user) throw new Error('Sign in to add items to your cart')
    const { data, error } = await supabase
      .from('cart_items')
      .upsert(
        { user_id: user.id, product_id: productId, quantity },
        { onConflict: 'user_id,product_id' }
      )
      .select('id, product_id, quantity, products(name, price, image_url, stock)')
      .single()
    if (error) throw error
    dispatch({ type: 'ADD_OR_UPDATE_ITEM', item: data })
  }

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) return removeItem(productId)
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .select('id, product_id, quantity, products(name, price, image_url, stock)')
      .single()
    if (error) throw error
    dispatch({ type: 'ADD_OR_UPDATE_ITEM', item: data })
  }

  const removeItem = async (productId) => {
    const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', productId)
    if (error) throw error
    dispatch({ type: 'REMOVE_ITEM', productId })
  }

  const clearCart = async () => {
    await supabase.from('cart_items').delete().eq('user_id', user.id)
    dispatch({ type: 'CLEAR_CART' })
  }

  const refreshCart = async () => {
    const { data, error } = await supabase.from('cart_items').select('id, product_id, quantity, products(name, price, image_url, stock)').eq('user_id', user.id)
    if (error) throw error
    dispatch({ type: 'SET_CART', items: data ?? [] })
  }

  const total = state.items.reduce(
    (sum, i) => sum + (i.products?.price ?? 0) * i.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{ ...state, total, addItem, updateQuantity, removeItem, clearCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
