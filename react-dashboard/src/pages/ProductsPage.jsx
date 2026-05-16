import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, ServerOff } from 'lucide-react'
import { useBackend } from '../context/BackendContext'
import { useAuth } from '../context/AuthContext'
import ProductForm from '../components/products/ProductForm'
import ProductList from '../components/products/ProductList'
import ProductHistoryPanel from '../components/products/ProductHistoryPanel'
import StockMovementModal from '../components/products/StockMovementModal'
import CollapsiblePanel from '../components/CollapsiblePanel'
import BackendEngine from '../components/BackendEngine'
import {
  createProduct,
  deleteProduct,
  fetchHistory,
  fetchMetadata,
  fetchProducts,
  updateProduct,
} from '../api/products'

export default function ProductsPage() {
  const { t } = useTranslation()
  const { online } = useBackend()
  const { isAuthenticated } = useAuth()
  const [products, setProducts] = useState([])
  const [history, setHistory] = useState([])
  const [metadata, setMetadata] = useState({ categories: [], productTypes: [], unitsOfMeasure: [] })
  const [editing, setEditing] = useState(null)
  const [movingProduct, setMovingProduct] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    if (!online || !isAuthenticated) return
    setLoading(true)
    setError('')
    try {
      const [productsData, historyData, metadataData] = await Promise.all([
        fetchProducts(),
        fetchHistory(50),
        fetchMetadata(),
      ])
      setProducts(productsData)
      setHistory(historyData)
      setMetadata(metadataData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [online, isAuthenticated])

  useEffect(() => {
    void loadData()
  }, [loadData])

  async function handleSubmit(payload) {
    if (editing) {
      await updateProduct(editing.id, payload)
      setEditing(null)
    } else {
      await createProduct(payload)
    }
    setShowForm(false)
    await loadData()
  }

  async function handleDelete(id) {
    if (!window.confirm(t('products.confirmDelete'))) return
    try {
      await deleteProduct(id)
      if (editing?.id === id) {
        setEditing(null)
        setShowForm(false)
      }
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  function startEdit(product) {
    setEditing(product)
    setShowForm(true)
  }

  function startCreate() {
    setEditing(null)
    setShowForm(true)
  }

  function handleFormOpenChange(open) {
    setShowForm(open)
    if (!open) setEditing(null)
  }

  const lowStock = products.filter((p) => p.lowStock).length
  const expiring = products.filter((p) => p.nearExpiration).length
  const formTitle = editing ? t('products.form.editTitle') : t('products.form.createTitle')

  return (
    <main className="page">
      <header className="glass page-header">
        <div>
          <h1 className="header-title">{t('products.title')}</h1>
          <p className="header-subtitle">{t('products.subtitle')}</p>
        </div>
        <div className="page-header-actions">
          <div className="inventory-stats">
            <span className="inv-stat">{t('products.stats.total', { count: products.length })}</span>
            <span className="inv-stat warning">{t('products.stats.low', { count: lowStock })}</span>
            <span className="inv-stat danger">{t('products.stats.expiring', { count: expiring })}</span>
          </div>
          <button type="button" className="btn btn-primary" onClick={startCreate} disabled={!online}>
            <Plus size={14} />
            <span>{t('products.newButton')}</span>
          </button>
        </div>
      </header>

      {!online && (
        <section className="glass backend-offline-banner">
          <div className="offline-content">
            <ServerOff size={28} className="offline-icon" />
            <div>
              <h2 className="offline-title">{t('dashboard.backendOffline')}</h2>
              <p className="offline-subtitle">{t('dashboard.offlineHint')}</p>
            </div>
          </div>
          <BackendEngine />
        </section>
      )}

      {error && online && <div className="form-error banner-error">{error}</div>}

      {online && (
        <div className="products-layout">
          <div className="products-left">
            <CollapsiblePanel
              title={formTitle}
              open={showForm}
              onOpenChange={handleFormOpenChange}
              className="product-form-panel"
            >
              <ProductForm
                editing={editing}
                metadata={metadata}
                existingSkus={products.map((p) => p.sku)}
                onSubmit={handleSubmit}
                onCancel={() => handleFormOpenChange(false)}
                enabled={online}
                embedded
              />
            </CollapsiblePanel>
            <ProductHistoryPanel history={history} />
          </div>
          <div className="products-right">
            {loading ? (
              <p className="loading-text">{t('common.loading')}</p>
            ) : (
              <ProductList
                products={products}
                onEdit={startEdit}
                onDelete={handleDelete}
                onMove={setMovingProduct}
              />
            )}
          </div>
        </div>
      )}

      <StockMovementModal
        product={movingProduct}
        onClose={() => setMovingProduct(null)}
        onCompleted={loadData}
      />
    </main>
  )
}
