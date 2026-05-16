import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const { t } = useTranslation()
  const isLight = theme === 'light'
  const label = isLight ? t('settings.themeLight') : t('settings.themeDark')

  return (
    <button
      type="button"
      onClick={toggle}
      className="icon-button"
      aria-label={label}
      title={label}
    >
      {isLight ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
