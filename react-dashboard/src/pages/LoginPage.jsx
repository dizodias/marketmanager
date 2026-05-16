import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogIn, ShoppingBasket } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useBackend } from '../context/BackendContext'
import BackendEngine from '../components/BackendEngine'
import LanguageSwitcher from '../components/LanguageSwitcher'
import ThemeToggle from '../components/ThemeToggle'

export default function LoginPage() {
  const { t } = useTranslation()
  const { isAuthenticated, login } = useAuth()
  const { online } = useBackend()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={location.state?.from || '/'} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate(location.state?.from || '/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      <div className="login-topbar">
        <span className="brand-mark">
          <ShoppingBasket size={18} />
          MarketManager
        </span>
        <div className="login-topbar-actions">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <main className="login-container">
        <section className="glass login-card">
          <header className="login-header">
            <h1>{t('auth.loginTitle')}</h1>
            <p>{t('auth.loginSubtitle')}</p>
          </header>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span className="field-label">{t('auth.email')}</span>
              <input
                className="field-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </label>
            <label className="form-field">
              <span className="field-label">{t('auth.password')}</span>
              <input
                className="field-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="btn btn-primary login-submit"
              disabled={submitting || !online}
            >
              {submitting ? (
                t('auth.submitting')
              ) : (
                <>
                  <LogIn size={16} />
                  <span>{t('auth.submit')}</span>
                </>
              )}
            </button>
          </form>

          <p className="login-hint">{t('auth.defaultHint')}</p>

          {!online && (
            <div className="login-engine">
              <BackendEngine />
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
