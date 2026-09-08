import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabaseClient'
import ImageUploadField from '../../components/admin/ImageUploadField'
import ProductImage from '../../components/products/ProductImage'

const empty = { title: '', image_url: '', sort_order: 0, is_active: true }

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const busy = saving || uploading

  async function load() {
    const { data, error } = await supabase.from('advertising_banners').select('*').order('sort_order').order('created_at')
    setBanners(data || [])
    setError(error ? 'Could not load advertisements. Ensure the advertising SQL update has been run. ' + error.message : '')
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function reset() { setForm(empty); setEditing(null) }

  async function save(event) {
    event.preventDefault()
    if (!form.title.trim() || !form.image_url.trim()) return toast.error('Add a title and upload an advertising image.')
    setSaving(true)
    try {
      const payload = { ...form, title: form.title.trim(), image_url: form.image_url.trim(), sort_order: Number(form.sort_order) }
      const { error } = editing
        ? await supabase.from('advertising_banners').update(payload).eq('id', editing)
        : await supabase.from('advertising_banners').insert(payload)
      if (error) throw error
      toast.success('Advertisement saved')
      reset()
      await load()
    } catch (error) { toast.error(error.message) }
    finally { setSaving(false) }
  }

  async function remove(banner) {
    if (!confirm('Delete "' + banner.title + '" from the advertising carousel?')) return
    setSaving(true)
    try {
      const { error } = await supabase.from('advertising_banners').delete().eq('id', banner.id)
      if (error) throw error
      if (editing === banner.id) reset()
      await load()
      toast.success('Advertisement deleted')
    } catch (error) { toast.error(error.message) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <h1 className="font-display text-2xl">Advertising banners</h1>
      <p className="mt-2 text-sm text-plum-400">Upload your designs. Active images slide across the home page every five seconds.</p>
      <form onSubmit={save} className="admin-editor">
        <h2>{editing ? 'Edit advertisement' : 'Add advertisement'}</h2>
        <div className="admin-field-grid">
          <label className="admin-field">Title<input required maxLength={160} disabled={busy} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Summer gift collection" /></label>
          <label className="admin-field">Display order<input type="number" step="1" required disabled={busy} value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} /></label>
        </div>
        <ImageUploadField key={editing || 'new'} folder="advertisements" banner value={form.image_url} disabled={saving} onBusyChange={setUploading} onChange={image_url => setForm(current => ({ ...current, image_url }))} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} disabled={busy} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Show on home page</label>
        <div className="admin-editor-actions">
          <button type="submit" disabled={busy} className="admin-save">{saving ? 'Saving...' : 'Save advertisement'}</button>
          {editing && <button type="button" disabled={busy} onClick={reset}>Cancel</button>}
        </div>
      </form>
      {error && <p role="alert" className="mt-4 text-sm text-coral-600">{error}</p>}
      <div className="admin-banner-list">
        {banners.map(banner => (
          <article key={banner.id} className="admin-banner-card">
            <ProductImage src={banner.image_url} alt={banner.title} />
            <div><h2>{banner.title}</h2><p>Order: {banner.sort_order} · {banner.is_active ? 'Active' : 'Hidden'}</p>
              <div className="admin-editor-actions">
                <button disabled={busy} onClick={() => { setEditing(banner.id); setForm({ title: banner.title, image_url: banner.image_url, sort_order: banner.sort_order, is_active: banner.is_active }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Edit</button>
                <button disabled={busy} className="text-coral-600" onClick={() => remove(banner)}>Delete</button>
              </div>
            </div>
          </article>
        ))}
        {!banners.length && !error && <p className="empty-state">{loading ? 'Loading advertisements...' : 'No advertisements yet. Upload your first banner above.'}</p>}
      </div>
    </div>
  )
}
