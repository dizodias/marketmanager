import { useTranslation } from 'react-i18next'
import { Power, Zap } from 'lucide-react'
import { useBackend, BackendStatus } from '../context/BackendContext'

export default function BackendEngine() {
  const { t } = useTranslation()
  const { online, status, messageKey, start } = useBackend()

  if (online) {
    return (
      <div className="engine-badge engine-online">
        <span className="engine-dot" />
        <Power size={14} strokeWidth={2.5} />
        <span>{t('engine.online')}</span>
      </div>
    )
  }

  const isStarting = status === BackendStatus.STARTING
  const isChecking = status === BackendStatus.CHECKING

  return (
    <div className="engine-control">
      <button
        type="button"
        className={`btn btn-engine ${isStarting ? 'starting' : ''}`}
        onClick={start}
        disabled={isStarting || isChecking}
      >
        {isStarting ? (
          <>
            <span className="engine-spinner" />
            <span>{t('engine.starting')}</span>
          </>
        ) : (
          <>
            <Zap size={14} strokeWidth={2.5} />
            <span>{t('engine.start')}</span>
          </>
        )}
      </button>
      {messageKey && <span className="engine-message">{t(messageKey)}</span>}
    </div>
  )
}
