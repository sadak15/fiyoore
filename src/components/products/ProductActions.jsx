import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiMoreVertical, FiEdit2, FiTrash2 } from 'react-icons/fi'

export default function ProductActions({ name, open, onToggle, onClose, onEdit, onDelete }) {
  const trigger = useRef(null)
  const menu = useRef(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!open) return
    const rect = trigger.current.getBoundingClientRect()
    const height = menu.current.offsetHeight
    const width = menu.current.offsetWidth
    setPosition({
      left: Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8)),
      top: Math.max(8, rect.bottom + height + 8 <= window.innerHeight
        ? rect.bottom + 4 : rect.top - height - 4),
    })
    menu.current.querySelector('button')?.focus()

    function outside(event) {
      if (!menu.current?.contains(event.target) && !trigger.current?.contains(event.target)) onClose()
    }
    function escape(event) {
      if (event.key === 'Escape') { onClose(); trigger.current?.focus() }
    }
    function scroll(event) {
      if (!menu.current?.contains(event.target)) onClose()
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    window.addEventListener('scroll', scroll, true)
    window.addEventListener('resize', onClose)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
      window.removeEventListener('scroll', scroll, true)
      window.removeEventListener('resize', onClose)
    }
  }, [open, onClose])

  return <>
    <button ref={trigger} type="button" onClick={onToggle}
      aria-label={'Actions for ' + name} aria-expanded={open}
      className="rounded-full p-1.5 text-plum-400 hover:bg-plum-50 hover:text-plum-800">
      <FiMoreVertical />
    </button>
    {open && createPortal(
      <div ref={menu} style={position}
        className="fixed z-40 w-36 overflow-hidden rounded-lg border border-plum-100 bg-white shadow-lg"
        onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget) && event.relatedTarget !== trigger.current) onClose()
        }}>
        <button type="button" onClick={onEdit}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-plum-800 hover:bg-blush-50">
          <FiEdit2 size={14} /> Edit
        </button>
        <button type="button" onClick={() => { onClose(); onDelete() }}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-coral-600 hover:bg-blush-50">
          <FiTrash2 size={14} /> Delete
        </button>
      </div>, document.body
    )}
  </>
}
