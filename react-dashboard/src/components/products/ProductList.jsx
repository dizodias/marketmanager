import { Edit3, PackageX, Workflow } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { categoryLabel, productTypeLabel } from '../../utils/catalogLabels'

function formatLabel(value) {
  return value?.replace(/_/g, ' ') ?? ''
}

function formatMoney(value) {
  return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export default function ProductList({ products, onEdit, onDelete, onMove }) {
  const { t } = useTranslation()

  if (products.length === 0) {
    return (
      <div className="glass empty-state">
        <PackageX size={36} className="empty-icon" />
        <p className="empty-title">{t('products.emptyList')}</p>
      </div>
    )
  }

  return (
    <div className="product-list">
      {products.map((product) => (
        <article key={product.id} className="glass product-card">
          <div className="product-card-header">
            <div>
              <h3 className="product-name">{product.name}</h3>
              <span className="product-sku">{product.sku}</span>
            </div>
            <div className="product-badges">
              {product.categoryName && (
                <span
                  className="badge badge-category"
                  style={product.categoryColor ? { color: product.categoryColor, borderColor: product.categoryColor } : undefined}
                >
                  {categoryLabel(t, { code: product.categoryCode, name: product.categoryName })}
                </span>
              )}
              {product.lowStock && <span className="badge badge-warning">{t('products.lowStock')}</span>}
              {product.nearExpiration && <span className="badge badge-danger">{t('products.nearExpiration')}</span>}
            </div>
          </div>

          <div className="product-meta">
            <MetaItem
              label={t('products.form.productType')}
              value={productTypeLabel(t, { code: product.productTypeCode, name: product.productTypeName })}
            />
            <MetaItem label={t('products.form.quantity')} value={`${product.quantity} ${formatLabel(product.unitOfMeasure)}`} />
            <MetaItem label={t('products.form.unitPrice')} value={formatMoney(product.unitPrice)} />
            <MetaItem label="Total" value={formatMoney(product.totalValue)} />
            <MetaItem label={t('products.form.entryDate')} value={product.entryDate} />
            <MetaItem label={t('products.form.expirationDate')} value={product.expirationDate ?? '—'} />
            <MetaItem label={t('products.form.supplier')} value={product.supplier ?? '—'} />
            <MetaItem label={t('products.form.aisleLocation')} value={product.aisleLocation ?? '—'} />
          </div>

          <div className="product-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => onMove(product)}>
              <Workflow size={14} />
              <span>{t('products.moveButton')}</span>
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit(product)}>
              <Edit3 size={14} />
              <span>{t('products.editButton')}</span>
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(product.id)}>
              <PackageX size={14} />
              <span>{t('products.deleteButton')}</span>
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

function MetaItem({ label, value }) {
  return (
    <div className="meta-item">
      <span className="meta-label">{label}</span>
      <span className="meta-value">{value}</span>
    </div>
  )
}
