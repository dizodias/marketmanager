import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Edit3, Plus, Trash2 } from 'lucide-react'
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from '../../api/users'

const EMPTY = {
  name: '',
  email: '',
  password: '',
  role: 'USER',
  active: true,
  language: 'pt',
  theme: 'dark',
}

export default function UsersPage() {
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
      setItems(await fetchUsers())
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
      email: item.email,
      password: '',
      role: item.role,
      active: item.active,
      language: item.language ?? 'pt',
      theme: item.theme ?? 'dark',
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
        email: form.email,
        role: form.role,
        active: form.active,
        language: form.language,
        theme: form.theme,
      }
      if (form.password) payload.password = form.password
      if (editingId) {
        await updateUser(editingId, payload)
      } else {
        await createUser(payload)
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
    if (!window.confirm(t('admin.users.confirmDelete'))) return
    try {
      await deleteUser(id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="page">
      <header className="glass page-header">
        <div>
          <h1 className="header-title">{t('admin.users.title')}</h1>
          <p className="header-subtitle">{t('admin.users.subtitle')}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={startCreate}>
          <Plus size={14} />
          <span>{t('admin.users.create')}</span>
        </button>
      </header>

      {error && <div className="form-error banner-error">{error}</div>}

      <div className="admin-layout">
        <form className="glass product-form" onSubmit={handleSubmit}>
          <h2 className="form-title">
            {editingId ? t('admin.users.edit') : t('admin.users.create')}
          </h2>
          <div className="form-grid single">
            <label className="form-field">
              <span className="field-label">{t('admin.users.name')}</span>
              <input
                className="field-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label className="form-field">
              <span className="field-label">{t('admin.users.email')}</span>
              <input
                className="field-input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label className="form-field">
              <span className="field-label">
                {t('admin.users.password')}
                <small className="field-hint">
                  {editingId ? ` (${t('admin.users.passwordOptional')})` : ` (${t('admin.users.passwordHint')})`}
                </small>
              </span>
              <input
                className="field-input"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
                minLength={editingId ? 0 : 6}
              />
            </label>
            <label className="form-field">
              <span className="field-label">{t('admin.users.role')}</span>
              <select
                className="field-input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="USER">{t('auth.user')}</option>
                <option value="ADMIN">{t('auth.admin')}</option>
              </select>
            </label>
            <label className="toggle-field">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              <span>{t('admin.users.active')}</span>
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {t('admin.users.save')}
            </button>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={startCreate}>
                {t('admin.users.cancel')}
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
                  <th>{t('admin.users.name')}</th>
                  <th>{t('admin.users.email')}</th>
                  <th>{t('admin.users.role')}</th>
                  <th>{t('admin.users.active')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td className="muted">{item.email}</td>
                    <td>
                      <span className={`history-action ${item.role === 'ADMIN' ? 'action-stock' : 'action-updated'}`}>
                        {item.role === 'ADMIN' ? t('auth.admin') : t('auth.user')}
                      </span>
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
