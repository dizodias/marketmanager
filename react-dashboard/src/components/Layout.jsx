import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Sidebar from './Sidebar'
import PageTransition from './PageTransition'
import BackendEngine from './BackendEngine'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'
import UserMenu from './UserMenu'
import { ShellProvider, useShell } from '../context/ShellContext'

function LayoutInner() {
  const { t } = useTranslation()
  const { collapsed, mobileOpen, closeMobile, toggleMobile } = useShell()

  return (
    <>
      <div className="bg-layer" aria-hidden>
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      <div
        className={`app-shell${collapsed ? ' sidebar-collapsed' : ''}${mobileOpen ? ' sidebar-mobile-open' : ''}`}
      >
        {mobileOpen && (
          <button
            type="button"
            className="sidebar-backdrop"
            onClick={closeMobile}
            aria-label={t('nav.closeMenu')}
          />
        )}

        <Sidebar />

        <div className="app-main">
          <header className="topbar topbar-panel">
            <div className="topbar-start">
              <button
                type="button"
                className="sidebar-mobile-toggle"
                onClick={toggleMobile}
                aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
                aria-expanded={mobileOpen}
              >
                <Menu size={20} />
              </button>
              <BackendEngine />
            </div>
            <div className="topbar-actions">
              <LanguageSwitcher />
              <ThemeToggle />
              <UserMenu />
            </div>
          </header>

          <div className="app-content">
            <PageTransition />
          </div>
        </div>
      </div>
    </>
  )
}

export default function Layout() {
  return (
    <ShellProvider>
      <LayoutInner />
    </ShellProvider>
  )
}
