import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Workflow } from 'lucide-react'
import { useBackend } from '../context/BackendContext'
import { useAuth } from '../context/AuthContext'
import { fetchMovements } from '../api/movements'

const MOVEMENT_TYPES = ['PURCHASE', 'SALE', 'LOSS', 'EXPIRED', 'ADJUSTMENT', 'TRANSFER']

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

function typeClass(type) {
  const map = {
    PURCHASE: 'action-created',
    SALE: 'action-stock',
    LOSS: 'action-deleted',
    EXPIRED: 'action-deleted',
    ADJUSTMENT: 'action-updated',
    TRANSFER: 'action-updated',
  }
  return map[type] ?? 'action-updated'
}

export default function MovementsPage() {
  const { t } = useTranslation()
  const { online } = useBackend()
  const { isAuthenticated } = useAuth()
  const [movements, setMovements] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!online || !isAuthenticated) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMovements(200)
      setMovements(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [online, isAuthenticated])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(
    () => (filter === 'ALL' ? movements : movements.filter((m) => m.type === filter)),
    [filter, movements]
  )

  return (
    <main className="page">
      <header className="glass page-header">
        <div>
          <h1 className="header-title">{t('movements.title')}</h1>
          <p className="header-subtitle">{t('movements.subtitle')}</p>
        </div>
        <div className="filter-pills">
          <button
            type="button"
            className={`filter-pill ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            {t('movements.filterAll')}
          </button>
          {MOVEMENT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={`filter-pill ${filter === type ? 'active' : ''}`}
              onClick={() => setFilter(type)}
            >
              {t(`movements.types.${type}`)}
            </button>
          ))}
        </div>
      </header>

      {error && <div className="form-error banner-error">{error}</div>}

      <section className="glass table-card">
        {loading ? (
          <p className="loading-text">{t('common.loading')}</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Workflow size={32} className="empty-icon" />
            <p className="empty-title">{t('movements.empty')}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('movements.occurredAt')}</th>
                <th>{t('movements.type')}</th>
                <th>{t('products.form.name')}</th>
                <th>{t('products.form.sku')}</th>
                <th className="num">{t('movements.previous')}</th>
                <th className="num">{t('movements.quantity')}</th>
                <th className="num">{t('movements.current')}</th>
                <th>{t('movements.performedBy')}</th>
                <th>{t('movements.reason')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((movement) => (
                <tr key={movement.id}>
                  <td>{formatTime(movement.occurredAt)}</td>
                  <td>
                    <span className={`history-action ${typeClass(movement.type)}`}>
                      {t(`movements.types.${movement.type}`)}
                    </span>
                  </td>
                  <td>{movement.productName}</td>
                  <td className="mono">{movement.productSku}</td>
                  <td className="num">{movement.previousQuantity}</td>
                  <td className={`num ${movement.quantityDelta < 0 ? 'negative' : 'positive'}`}>
                    {movement.quantityDelta > 0 ? '+' : ''}{movement.quantityDelta}
                  </td>
                  <td className="num">{movement.newQuantity}</td>
                  <td>{movement.performedBy ?? '—'}</td>
                  <td>{movement.reason ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}
