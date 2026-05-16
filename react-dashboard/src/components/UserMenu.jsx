import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogOut, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const POPOVER_WIDTH = 260

function initials(name) {
  if (!name) return '·'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export default function UserMenu() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [popoverStyle, setPopoverStyle] = useState(null)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setPopoverStyle(null)
      return undefined
    }

    function updatePosition() {
      const rect = triggerRef.current.getBoundingClientRect()
      const left = Math.min(
        Math.max(8, rect.right - POPOVER_WIDTH),
        window.innerWidth - POPOVER_WIDTH - 8,
      )
      setPopoverStyle({
        top: rect.bottom + 8,
        left,
        width: POPOVER_WIDTH,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [open])

  useEffect(() => {
    function handler(event) {
      const target = event.target
      if (rootRef.current?.contains(target)) return
      if (target instanceof Element && target.closest('.user-popover-portal')) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    function closeOnScroll() {
      setOpen(false)
    }
    window.addEventListener('scroll', closeOnScroll, true)
    return () => window.removeEventListener('scroll', closeOnScroll, true)
  }, [open])

  if (!user) return null

  const roleLabel = user.role === 'ADMIN' ? t('auth.admin') : t('auth.user')

  const popover =
    open && popoverStyle
      ? createPortal(
          <div
            className="user-popover user-popover-portal"
            role="menu"
            style={{
              position: 'fixed',
              top: popoverStyle.top,
              left: popoverStyle.left,
              width: popoverStyle.width,
            }}
          >
            <div className="user-popover-header">
              <span className="user-avatar lg">{initials(user.name)}</span>
              <div>
                <strong>{user.name}</strong>
                <span className="user-email">{user.email}</span>
              </div>
            </div>
            <button
              type="button"
              className="user-menu-item"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                navigate('/settings')
              }}
            >
              <Settings size={16} />
              <span>{t('nav.settings')}</span>
            </button>
            <button
              type="button"
              className="user-menu-item danger"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                logout()
                navigate('/login', { replace: true })
              }}
            >
              <LogOut size={16} />
              <span>{t('nav.logout')}</span>
            </button>
          </div>,
          document.body,
        )
      : null

  return (
    <div className="user-menu" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`user-trigger${open ? ' open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="user-avatar">{initials(user.name)}</span>
        <span className="user-info">
          <span className="user-name">{user.name}</span>
          <span className="user-role">{roleLabel}</span>
        </span>
      </button>
      {popover}
    </div>
  )
}
