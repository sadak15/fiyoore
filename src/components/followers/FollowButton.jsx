import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'

export default function FollowButton({ targetUserId }) {
  const { user } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.id === targetUserId) {
      setLoading(false)
      return
    }
    supabase
      .from('followers')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .maybeSingle()
      .then(({ data }) => {
        setIsFollowing(!!data)
        setLoading(false)
      })
  }, [user, targetUserId])

  if (!user || user.id === targetUserId) return null

  const toggleFollow = async () => {
    setLoading(true)
    try {
      if (isFollowing) {
        await supabase
          .from('followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)
        setIsFollowing(false)
      } else {
        await supabase
          .from('followers')
          .insert({ follower_id: user.id, following_id: targetUserId })
        setIsFollowing(true)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        isFollowing
          ? 'border border-plum-600 text-plum-600 hover:bg-plum-50'
          : 'bg-coral-500 text-white hover:bg-coral-600'
      }`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
