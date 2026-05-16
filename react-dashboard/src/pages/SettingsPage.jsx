import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Palette, User2, Languages } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { SUPPORTED_LANGUAGES } from '../i18n'

const TABS = [
  { id: 'profile', icon: User2 },
  { id: 'appearance', icon: Palette },
  { id: 'language', icon: Languages },
]

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { user, updateProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const [tab, setTab] = useState('profile')

  return (
    <main className="page">
      <header className="glass page-header">
        <div>
          <h1 className="header-title">{t('settings.title')}</h1>
          <p className="header-subtitle">{t('settings.subtitle')}</p>
        </div>
      </header>

      <section className="settings-shell">
        <nav className="settings-tabs glass">
          {TABS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`settings-tab ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={16} />
              <span>{t(`settings.${id}`)}</span>
            </button>
          ))}
        </nav>

        <div className="settings-panel glass">
          <div key={tab} className="settings-panel-body">
            {tab === 'profile' && <ProfileTab user={user} updateProfile={updateProfile} t={t} />}
            {tab === 'appearance' && <AppearanceTab theme={theme} setTheme={setTheme} t={t} />}
            {tab === 'language' && <LanguageTab i18n={i18n} t={t} />}
          </div>
        </div>
      </section>
    </main>
  )
}

function ProfileTab({ user, updateProfile, t }) {
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setStatus(null)
    try {
      await updateProfile({
        name,
        email,
        language: user?.language,
        theme: user?.theme,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      })
      setStatus(t('settings.saved'))
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <h2>{t('settings.profile')}</h2>
      <label className="form-field">
        <span className="field-label">{t('settings.name')}</span>
        <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label className="form-field">
        <span className="field-label">{t('settings.email')}</span>
        <input className="field-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label className="form-field">
        <span className="field-label">{t('settings.currentPassword')}</span>
        <input
          className="field-input"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
      </label>
      <label className="form-field">
        <span className="field-label">{t('settings.newPassword')}</span>
        <input
          className="field-input"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
      </label>

      {status && <p className="form-success">{status}</p>}
      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? t('settings.saving') : t('settings.save')}
      </button>
    </form>
  )
}

function AppearanceTab({ theme, setTheme, t }) {
  return (
    <div className="settings-form">
      <h2>{t('settings.appearance')}</h2>
      <p className="settings-help">{t('settings.theme')}</p>
      <div className="theme-options">
        <button
          type="button"
          className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
          onClick={() => setTheme('dark')}
        >
          <span className="theme-swatch dark" />
          <span>{t('settings.themeDark')}</span>
        </button>
        <button
          type="button"
          className={`theme-option ${theme === 'light' ? 'active' : ''}`}
          onClick={() => setTheme('light')}
        >
          <span className="theme-swatch light" />
          <span>{t('settings.themeLight')}</span>
        </button>
      </div>
    </div>
  )
}

function LanguageTab({ i18n, t }) {
  const current = i18n.language?.split('-')[0] || 'pt'
  return (
    <div className="settings-form">
      <h2>{t('settings.language')}</h2>
      <p className="settings-help">{t('settings.languageDescription')}</p>
      <div className="language-options">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            className={`language-option ${current === lang.code ? 'active' : ''}`}
            onClick={() => i18n.changeLanguage(lang.code)}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  )
}
