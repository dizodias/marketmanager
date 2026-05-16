import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { registerMovement } from '../../api/movements'

const MOVEMENT_TYPES = ['PURCHASE', 'SALE', 'LOSS', 'EXPIRED', 'ADJUSTMENT', 'TRANSFER']

export default function StockMovementModal({ product, onClose, onCompleted }) {
  const { t } = useTranslation()
  const [type, setType] = useState('PURCHASE')
  const [quantity, setQuantity] = useState('1')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!product) return
    setType('PURCHASE')
    setQuantity('1')
    setReason('')
    setError(null)
  }, [product])

  if (!product) return null

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await registerMovement(product.id, {
        type,
        quantity: Number(quantity),
        reason: reason.trim() || null,
      })
      onCompleted?.()
      onClose?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card glass">
        <header className="modal-header">
          <div>
            <h2>{t('movements.modal.title')}</h2>
            <span className="modal-subtitle">{product.name} — {product.sku}</span>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label={t('common.close')}>
            <X size={16} />
          </button>
        </header>

        <p className="modal-meta">
          {t('movements.modal.currentStock', { value: product.quantity })}
        </p>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="field-label">{t('movements.modal.type')}</span>
            <select
              className="field-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              {MOVEMENT_TYPES.map((value) => (
                <option key={value} value={value}>
                  {t(`movements.types.${value}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span className="field-label">{t('movements.modal.quantity')}</span>
            <input
              className="field-input"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </label>

          <label className="form-field">
            <span className="field-label">{t('movements.modal.reason')}</span>
            <textarea
              className="field-input"
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength="300"
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? t('movements.modal.submitting') : t('movements.modal.submit')}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {t('movements.modal.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
