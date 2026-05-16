import { useTranslation } from 'react-i18next'
import { History } from 'lucide-react'

function formatLabel(value) {
  return value?.replace(/_/g, ' ') ?? ''
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString([], {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function actionClass(action) {
  const map = {
    CREATED: 'action-created',
    UPDATED: 'action-updated',
    DELETED: 'action-deleted',
    STOCK_RECEIVED: 'action-stock',
    STOCK_ADJUSTED: 'action-stock',
    SALE: 'action-stock',
    LOSS: 'action-deleted',
    EXPIRED: 'action-deleted',
    TRANSFER: 'action-updated',
  }
  return map[action] ?? 'action-updated'
}

export default function ProductHistoryPanel({ history }) {
  const { t } = useTranslation()

  return (
    <section className="glass history-panel">
      <div className="feed-header">
        <span className="feed-title">{t('products.history')}</span>
        <span className="feed-count">{history.length}</span>
      </div>

      <div className="history-list">
        {history.length === 0 ? (
          <div className="empty-state compact">
            <History size={28} className="empty-icon" />
            <p className="empty-title">{t('common.empty')}</p>
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="history-item">
              <span className={`history-action ${actionClass(item.action)}`}>
                {formatLabel(item.action)}
              </span>
              <div className="history-body">
                <span className="history-product">{item.productName}</span>
                <span className="history-desc">{item.description}</span>
              </div>
              <span className="history-time">{formatTime(item.recordedAt)}</span>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
