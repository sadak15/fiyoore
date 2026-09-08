import { useState } from 'react'
import { Link } from 'react-router'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import ProductImage from '../components/products/ProductImage'

export default function EditProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  if (!profile) return <section className="store-container py-10"><p role="alert">Your profile could not be loaded. Please refresh the page.</p></section>
  return <ProfileForm key={user.id} user={user} profile={profile} refreshProfile={refreshProfile} />
}

function ProfileForm({ user, profile, refreshProfile }) {
  const [form, setForm] = useState({ username: profile.username, bio: profile.bio || '', avatar_url: profile.avatar_url || '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const busy = saving || uploading

  async function upload(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const types = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
    if (!types[file.type] || file.size > 5 * 1024 * 1024) return toast.error('Choose a JPEG, PNG or WebP up to 5 MB.')
    setUploading(true)
    try {
      const path = user.id + '/' + crypto.randomUUID() + '.' + types[file.type]
      const { error } = await supabase.storage.from('avatars').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setForm(current => ({ ...current, avatar_url: data.publicUrl }))
      toast.success('Photo uploaded. Save changes to update your profile.')
    } catch (error) { toast.error(error.message) }
    finally { setUploading(false) }
  }

  async function save(event) {
    event.preventDefault()
    if (busy) return
    if (!form.username.trim()) return toast.error('Enter a username.')
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({
        username: form.username.trim(), bio: form.bio.trim(), avatar_url: form.avatar_url || null,
      }).eq('id', user.id).select('id').single()
      if (error) throw error
      await refreshProfile()
      toast.success('Profile updated')
    } catch (error) { toast.error(error.code === '23505' ? 'That username is already taken. Choose another.' : error.message) }
    finally { setSaving(false) }
  }

  return (
    <section className="profile-editor">
      <h1 className="font-display text-3xl">Edit profile</h1>
      <p className="mt-2 text-sm text-plum-400">Update how you appear to other shoppers.</p>
      <form onSubmit={save} className="admin-editor">
        <div className="profile-photo-editor">
          <ProductImage src={form.avatar_url} alt="Profile preview" />
          <div>
            <label className="admin-field">Profile photo
              <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={upload} />
            </label>
            <p className="upload-help mt-2">{uploading ? 'Uploading...' : 'JPEG, PNG or WebP, up to 5 MB.'}</p>
            {form.avatar_url && <button type="button" className="upload-remove mt-2" disabled={busy} onClick={() => setForm(current => ({ ...current, avatar_url: '' }))}>Remove photo</button>}
          </div>
        </div>
        <label className="admin-field">Username
          <input required maxLength={100} autoComplete="username" value={form.username} disabled={busy} onChange={e => setForm({ ...form, username: e.target.value })} />
        </label>
        <label className="admin-field">Bio
          <textarea rows={4} maxLength={1000} value={form.bio} disabled={busy} placeholder="A little about you..." onChange={e => setForm({ ...form, bio: e.target.value })} />
        </label>
        <div className="admin-editor-actions">
          <button className="admin-save" disabled={busy}>{saving ? 'Saving...' : 'Save changes'}</button>
          <Link to={'/u/' + encodeURIComponent(profile.username)}>View profile</Link>
        </div>
      </form>
    </section>
  )
}
