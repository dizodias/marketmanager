import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  Boxes,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  FolderTree,
  Layers,
  Settings,
  ShoppingBasket,
  Users,
  Workflow,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useShell } from '../context/ShellContext'

function navClass({ isActive }) {
  return `sidebar-link ${isActive ? 'active' : ''}`
}

export default function Sidebar() {
  const { t } = useTranslation()
  const { isAdmin } = useAuth()
  const { collapsed, toggleCollapsed, closeMobile, mobileOpen } = useShell()
  const [adminOpen, setAdminOpen] = useState(true)

  function handleNavClick() {
    closeMobile()
  }

  return (
    <aside className={`sidebar glass${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <ShoppingBasket size={20} />
          {!collapsed && <span>{t('brand.name')}</span>}
        </div>
        {mobileOpen && (
          <button
            type="button"
            className="sidebar-mobile-close"
            onClick={closeMobile}
            aria-label={t('nav.closeMenu')}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={navClass} onClick={handleNavClick}>
          <Activity size={18} />
          <span>{t('nav.dashboard')}</span>
        </NavLink>
        <NavLink to="/products" className={navClass} onClick={handleNavClick}>
          <Boxes size={18} />
          <span>{t('nav.products')}</span>
        </NavLink>
        <NavLink to="/movements" className={navClass} onClick={handleNavClick}>
          <Workflow size={18} />
          <span>{t('nav.movements')}</span>
        </NavLink>
        <NavLink to="/settings" className={navClass} onClick={handleNavClick}>
          <Settings size={18} />
          <span>{t('nav.settings')}</span>
        </NavLink>

        {isAdmin && (
          <div className={`sidebar-admin${adminOpen ? ' open' : ''}`}>
            <button
              type="button"
              className="sidebar-admin-trigger"
              onClick={() => setAdminOpen((v) => !v)}
              aria-expanded={adminOpen}
            >
              {!collapsed && <span className="sidebar-section">{t('nav.admin')}</span>}
              <ChevronDown size={16} className="sidebar-admin-chevron" aria-hidden />
            </button>
            <div className="sidebar-admin-body" data-open={adminOpen ? 'true' : 'false'}>
              <div className="sidebar-admin-inner">
                <NavLink to="/admin/categories" className={navClass} onClick={handleNavClick}>
                  <FolderTree size={18} />
                  <span>{t('nav.categories')}</span>
                </NavLink>
                <NavLink to="/admin/types" className={navClass} onClick={handleNavClick}>
                  <Layers size={18} />
                  <span>{t('nav.types')}</span>
                </NavLink>
                <NavLink to="/admin/users" className={navClass} onClick={handleNavClick}>
                  <Users size={18} />
                  <span>{t('nav.users')}</span>
                </NavLink>
              </div>
            </div>
          </div>
        )}
      </nav>

      <button
        type="button"
        className="sidebar-collapse"
        onClick={toggleCollapsed}
        aria-label={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
      >
        {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
      </button>
    </aside>
  )
}
