import { useEffect, useState } from 'react'
import { FiPause, FiPlay } from 'react-icons/fi'
import { supabase } from '../../lib/supabaseClient'
import ProductImage from '../products/ProductImage'

export default function AdvertisingCarousel() {
  const [banners, setBanners] = useState([])
  const [index, setIndex] = useState(0)
  const [resetting, setResetting] = useState(false)
  const [paused, setPaused] = useState(false)
  const [interacting, setInteracting] = useState(false)

  useEffect(() => {
    let active = true
    supabase.from('advertising_banners').select('id, title, image_url')
      .eq('is_active', true).order('sort_order').order('created_at')
      .then(({ data }) => { if (active) setBanners(data || []) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (banners.length < 2 || paused || interacting) return
    const timer = window.setInterval(() => setIndex(current => current + 1), 5000)
    return () => window.clearInterval(timer)
  }, [banners.length, paused, interacting])

  useEffect(() => {
    if (!resetting) return
    let secondFrame
    const firstFrame = requestAnimationFrame(() => { secondFrame = requestAnimationFrame(() => setResetting(false)) })
    return () => { cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame) }
  }, [resetting])

  const slides = banners.length ? banners : [{ id: 'placeholder', image_url: '', title: 'Fiyoore Gifts' }]
  const looping = banners.length > 1
  const position = index % slides.length
  const track = looping ? [...slides, slides[0]] : slides

  return (
    <section className="advertising-carousel" aria-label="Advertisements" aria-roledescription="carousel"
      onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
      onFocus={() => setInteracting(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false) }}>
      <div className="advertising-track"
        style={{ transform: 'translateX(-' + index * 100 + '%)', transition: resetting ? 'none' : undefined }}
        onTransitionEnd={event => { if (event.target === event.currentTarget && index === slides.length) { setResetting(true); setIndex(0) } }}>
        {track.map((banner, slideIndex) => (
          <div className="advertising-slide" key={banner.id + '-' + slideIndex} aria-hidden={slideIndex !== index}>
            <ProductImage src={banner.image_url} alt={banner.title} draggable="false" />
          </div>
        ))}
      </div>
      {looping && <div className="advertising-controls">
        <div className="advertising-dots">{slides.map((banner, slideIndex) => (
          <button key={banner.id} type="button" aria-label={'Show advertisement ' + (slideIndex + 1)} aria-current={position === slideIndex ? 'true' : undefined} onClick={() => setIndex(slideIndex)}><span /></button>
        ))}</div>
        <button type="button" className="advertising-pause" aria-label={paused ? 'Play advertisements' : 'Pause advertisements'} onClick={() => setPaused(value => !value)}>{paused ? <FiPlay /> : <FiPause />}</button>
      </div>}
    </section>
  )
}
