import { useAuth } from '../context/AuthContext'
import ProductImage from '../components/products/ProductImage'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { supabase } from '../lib/supabaseClient'
import FollowButton from '../components/followers/FollowButton'
import ProductCard from '../components/products/ProductCard'

export default function ProfilePage() {
  const { username } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [counts, setCounts] = useState({ followers: 0, following: 0 })
  const [products, setProducts] = useState([])

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()
      .then(async ({ data }) => {
        if (!data) return
        setProfile(data)

        const [{ count: followers }, { count: following }, { data: prods }] = await Promise.all([
          supabase
            .from('followers')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', data.id),
          supabase
            .from('followers')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', data.id),
          supabase.from('products').select('*').eq('owner_id', data.id),
        ])

        setCounts({ followers: followers ?? 0, following: following ?? 0 })
        setProducts(prods ?? [])
      })
  }, [username])

  if (!profile) return <p className="mx-auto max-w-6xl px-4 py-10 text-plum-400">Loading…</p>

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full bg-plum-100">
          {(
            <ProductImage src={profile.avatar_url} alt={profile.username} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-2xl text-plum-900">@{profile.username}</h1>
          <p className="text-sm text-plum-400">
            {counts.followers} followers · {counts.following} following
          </p>
        </div>
        {user?.id === profile.id ? <Link to="/account/profile" className="rounded-full border border-plum-100 px-4 py-2 text-sm">Edit profile</Link> : <FollowButton targetUserId={profile.id} />}
      </div>

      {profile.bio && <p className="mt-4 text-plum-600">{profile.bio}</p>}

      <h2 className="mt-10 font-display text-xl text-plum-900">Storefront</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
