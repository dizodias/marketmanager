import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Edit3, Plus, Trash2 } from 'lucide-react'
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from '../../api/categories'
import { categoryLabel, translateCatalogDescription } from '../../utils/catalogLabels'

const EMPTY = { name: '', description: '', color: '#3B82F6', active: true }

export default function CategoriesPage() {
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
      setItems(await fetchCategories())
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
    setForm({
      name: item.name,
      description: item.description ?? '',
      color: item.color ?? '#3B82F6',
      active: item.active,
    })
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
        color: form.color || null,
        active: form.active,
      }
      if (editingId) {
        await updateCategory(editingId, payload)
      } else {
        await createCategory(payload)
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
    if (!window.confirm(t('admin.categories.confirmDelete'))) return
    try {
      await deleteCategory(id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="page">
      <header className="glass page-header">
        <div>
          <h1 className="header-title">{t('admin.categories.title')}</h1>
          <p className="header-subtitle">{t('admin.categories.subtitle')}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={startCreate}>
          <Plus size={14} />
          <span>{t('admin.categories.create')}</span>
        </button>
      </header>

      {error && <div className="form-error banner-error">{error}</div>}

      <div className="admin-layout">
        <form className="glass product-form" onSubmit={handleSubmit}>
          <h2 className="form-title">
            {editingId ? t('admin.categories.edit') : t('admin.categories.create')}
          </h2>
          <div className="form-grid single">
            <label className="form-field">
              <span className="field-label">{t('admin.categories.name')}</span>
              <input
                className="field-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label className="form-field">
              <span className="field-label">{t('admin.categories.description')}</span>
              <textarea
                className="field-input"
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span className="field-label">{t('admin.categories.color')}</span>
              <input
                className="field-input color"
                type="color"
                value={form.color || '#3B82F6'}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
            </label>
            <label className="toggle-field">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              <span>{t('admin.categories.active')}</span>
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {t('admin.categories.save')}
            </button>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={startCreate}>
                {t('admin.categories.cancel')}
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
                  <th>{t('admin.categories.name')}</th>
                  <th>{t('admin.categories.description')}</th>
                  <th>{t('admin.categories.color')}</th>
                  <th>{t('admin.categories.active')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{categoryLabel(t, item)}</strong></td>
                    <td className="muted">
                      {translateCatalogDescription(t, 'categories', item.code, item.description) || '—'}
                    </td>
                    <td>
                      <span
                        className="color-swatch"
                        style={{ background: item.color || 'transparent' }}
                      />
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
