import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Edit3, Plus, Trash2 } from 'lucide-react'
import {
  createProductType,
  deleteProductType,
  fetchProductTypes,
  updateProductType,
} from '../../api/productTypes'
import { productTypeLabel, translateCatalogDescription } from '../../utils/catalogLabels'

const EMPTY = { name: '', description: '', active: true }

export default function TypesPage() {
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await fetchProductTypes())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function startEdit(item) {
    setEditingId(item.id)
    setForm({ name: item.name, description: item.description ?? '', active: item.active })
  }

  function startCreate() {
    setEditingId(null)
    setForm(EMPTY)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        active: form.active,
      }
      if (editingId) {
        await updateProductType(editingId, payload)
      } else {
        await createProductType(payload)
      }
      setForm(EMPTY)
      setEditingId(null)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t('admin.types.confirmDelete'))) return
    try {
      await deleteProductType(id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="page">
      <header className="glass page-header">
        <div>
          <h1 className="header-title">{t('admin.types.title')}</h1>
          <p className="header-subtitle">{t('admin.types.subtitle')}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={startCreate}>
          <Plus size={14} />
          <span>{t('admin.types.create')}</span>
        </button>
      </header>

      {error && <div className="form-error banner-error">{error}</div>}

      <div className="admin-layout">
        <form className="glass product-form" onSubmit={handleSubmit}>
          <h2 className="form-title">
            {editingId ? t('admin.types.edit') : t('admin.types.create')}
          </h2>
          <div className="form-grid single">
            <label className="form-field">
              <span className="field-label">{t('admin.types.name')}</span>
              <input
                className="field-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label className="form-field">
              <span className="field-label">{t('admin.types.description')}</span>
              <textarea
                className="field-input"
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label className="toggle-field">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              <span>{t('admin.types.active')}</span>
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {t('admin.types.save')}
            </button>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={startCreate}>
                {t('admin.types.cancel')}
              </button>
            )}
          </div>
        </form>

        <section className="glass table-card">
          {loading ? (
            <p className="loading-text">{t('common.loading')}</p>
          ) : items.length === 0 ? (
            <div className="empty-state compact">
              <p className="empty-title">{t('common.empty')}</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('admin.types.name')}</th>
                  <th>{t('admin.types.description')}</th>
                  <th>{t('admin.types.active')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{productTypeLabel(t, item)}</strong></td>
                    <td className="muted">
                      {translateCatalogDescription(t, 'productTypes', item.code, item.description) || '—'}
                    </td>
                    <td>{item.active ? t('common.active') : t('common.inactive')}</td>
                    <td className="row-actions">
                      <button type="button" className="icon-button" onClick={() => startEdit(item)}>
                        <Edit3 size={14} />
                      </button>
                      <button type="button" className="icon-button danger" onClick={() => handleDelete(item.id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  )
}
