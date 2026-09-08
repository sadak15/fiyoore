import { useId, useState } from 'react'
import toast from 'react-hot-toast'
import { FiUpload } from 'react-icons/fi'
import { supabase } from '../../lib/supabaseClient'
import ProductImage from '../products/ProductImage'

export default function ImageUploadField({ value, onChange, onBusyChange, folder, disabled = false, banner = false }) {
  const id = useId()
  const [uploading, setUploading] = useState(false)
  const [mode, setMode] = useState('upload')

  async function upload(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }
    if (!extensions[file.type] || file.size > 5 * 1024 * 1024) {
      return toast.error('Choose a JPEG, PNG, WebP or GIF image up to 5 MB.')
    }
    setUploading(true)
    onBusyChange(true)
    try {
      const path = folder + '/' + crypto.randomUUID() + '.' + extensions[file.type]
      const { error } = await supabase.storage.from('product-images').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      onChange(data.publicUrl)
      toast.success('Image uploaded. Save to apply your changes.')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setUploading(false)
      onBusyChange(false)
    }
  }

  return (
    <div className="image-upload-field">
      <div className="image-upload-tabs">
        <button type="button" disabled={disabled || uploading} aria-pressed={mode === 'upload'} onClick={() => setMode('upload')}>Upload from PC</button>
        <button type="button" disabled={disabled || uploading} aria-pressed={mode === 'url'} onClick={() => setMode('url')}>Image URL</button>
      </div>
      {mode === 'upload' ? (
        <label className="image-upload-drop" htmlFor={id}>
          <FiUpload />
          <span>{uploading ? 'Uploading...' : 'Choose an image from your computer'}</span>
          <input id={id} type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={disabled || uploading} onChange={upload} />
        </label>
      ) : (
        <label className="admin-field">Image URL
          <input type="url" value={value || ''} disabled={disabled || uploading} placeholder="https://..." onChange={event => onChange(event.target.value)} />
        </label>
      )}
      <p className="upload-help">{banner ? 'Recommended banner size: 1680 × 700 px. ' : ''}JPEG, PNG, WebP or GIF, up to 5 MB.</p>
      <ProductImage src={value} alt="Image preview" className={banner ? 'upload-preview banner-preview' : 'upload-preview'} />
      {value && <button className="upload-remove" type="button" disabled={disabled || uploading} onClick={() => onChange('')}>Remove image</button>}
    </div>
  )
}
