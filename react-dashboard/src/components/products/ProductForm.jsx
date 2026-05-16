import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'
import { categoryLabel, productTypeLabel } from '../../utils/catalogLabels'
import { suggestSkuFromProductName } from '../../utils/skuSuggestion'

const EMPTY = {
  name: '',
  sku: '',
  productTypeId: '',
  categoryId: '',
  unitOfMeasure: 'UNIT',
  quantity: '',
  unitPrice: '',
  entryDate: new Date().toISOString().split('T')[0],
  expirationDate: '',
  supplier: '',
  aisleLocation: '',
  minimumStock: '5',
}

function formatLabel(value) {
  return value?.replace(/_/g, ' ') ?? ''
}

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}

export default function ProductForm({
  editing,
  onSubmit,
  onCancel,
  metadata,
  existingSkus = [],
  enabled = true,
  embedded = false,
}) {
  const { t } = useTranslation()
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [skuManual, setSkuManual] = useState(false)
  const [skuSuggested, setSkuSuggested] = useState(false)
  const debouncedName = useDebouncedValue(form.name, 350)
  const skuManualRef = useRef(false)

  const categories = metadata?.categories ?? []
  const productTypes = metadata?.productTypes ?? []
  const units = metadata?.unitsOfMeasure ?? []
  const labels = t('products.form', { returnObjects: true })

  const selectedCategory = useMemo(
    () => categories.find((cat) => String(cat.id) === form.categoryId),
    [categories, form.categoryId],
  )

  const reservedSkus = useMemo(
    () => existingSkus.filter((sku) => sku && sku !== editing?.sku),
    [existingSkus, editing?.sku],
  )

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        sku: editing.sku,
        productTypeId: editing.productTypeId ? String(editing.productTypeId) : '',
        categoryId: editing.categoryId ? String(editing.categoryId) : '',
        unitOfMeasure: editing.unitOfMeasure,
        quantity: String(editing.quantity),
        unitPrice: String(editing.unitPrice),
        entryDate: editing.entryDate,
        expirationDate: editing.expirationDate ?? '',
        supplier: editing.supplier ?? '',
        aisleLocation: editing.aisleLocation ?? '',
        minimumStock: String(editing.minimumStock),
      })
      setSkuManual(true)
      skuManualRef.current = true
    } else {
      setForm(EMPTY)
      setSkuManual(false)
      skuManualRef.current = false
    }
    setSkuSuggested(false)
    setError('')
  }, [editing])

  useEffect(() => {
    if (editing || skuManualRef.current) return
    const name = debouncedName.trim()
    if (name.length < 2) {
      setSkuSuggested(false)
      return
    }

    const suggestion = suggestSkuFromProductName(name, {
      categoryCode: selectedCategory?.code,
      existingSkus: reservedSkus,
    })

    if (!suggestion) return

    setForm((prev) => ({ ...prev, sku: suggestion }))
    setSkuSuggested(true)
  }, [debouncedName, selectedCategory?.code, reservedSkus, editing])

  function applySkuSuggestion() {
    const suggestion = suggestSkuFromProductName(form.name, {
      categoryCode: selectedCategory?.code,
      existingSkus: reservedSkus,
      excludeSku: editing?.sku,
    })
    if (!suggestion) return
    setForm((prev) => ({ ...prev, sku: suggestion }))
    setSkuManual(false)
    skuManualRef.current = false
    setSkuSuggested(true)
  }

  function handleChange(event) {
    const { name, value } = event.target
    if (name === 'sku') {
      setSkuManual(true)
      skuManualRef.current = true
      setSkuSuggested(false)
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      productTypeId: Number(form.productTypeId),
      categoryId: Number(form.categoryId),
      unitOfMeasure: form.unitOfMeasure,
      quantity: parseInt(form.quantity, 10),
      unitPrice: parseFloat(form.unitPrice),
      entryDate: form.entryDate,
      expirationDate: form.expirationDate || null,
      supplier: form.supplier || null,
      aisleLocation: form.aisleLocation || null,
      minimumStock: parseInt(form.minimumStock, 10) || 5,
    }
    try {
      await onSubmit(payload)
      if (!editing) {
        setForm(EMPTY)
        setSkuManual(false)
        skuManualRef.current = false
        setSkuSuggested(false)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const showSkuHint = form.name.trim().length >= 2
  const skuHintText = skuManual ? labels.skuManualHint : labels.skuAutoHint

  return (
    <form
      className={`product-form${embedded ? ' product-form-embedded' : ' glass'}`}
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      {!embedded && (
        <h2 className="form-title">{editing ? labels.editTitle : labels.createTitle}</h2>
      )}

      {error && <div className="form-error">{error}</div>}

      <div className="form-grid">
        <Field label={labels.name} name="name" value={form.name} onChange={handleChange} required disabled={!enabled} />
        <SkuField
          label={labels.sku}
          name="sku"
          value={form.sku}
          onChange={handleChange}
          required
          disabled={!enabled}
          hint={showSkuHint ? skuHintText : ''}
          suggested={skuSuggested && !skuManual}
          onApplySuggestion={applySkuSuggestion}
          applyLabel={labels.applySkuSuggestion}
          showApply={skuManual && form.name.trim().length >= 2}
        />

        <label className="form-field">
          <span className="field-label">{labels.productType}</span>
          <select
            className="field-input"
            name="productTypeId"
            value={form.productTypeId}
            onChange={handleChange}
            required
            disabled={!enabled}
          >
            <option value="">{labels.select}</option>
            {productTypes.map((type) => (
              <option key={type.id} value={type.id}>{productTypeLabel(t, type)}</option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span className="field-label">{labels.category}</span>
          <select
            className="field-input"
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            required
            disabled={!enabled}
          >
            <option value="">{labels.select}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{categoryLabel(t, cat)}</option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span className="field-label">{labels.unitOfMeasure}</span>
          <select
            className="field-input"
            name="unitOfMeasure"
            value={form.unitOfMeasure}
            onChange={handleChange}
            required
            disabled={!enabled}
          >
            {units.map((unit) => (
              <option key={unit} value={unit}>{formatLabel(unit)}</option>
            ))}
          </select>
        </label>

        <Field label={labels.quantity} name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} required disabled={!enabled} />
        <Field label={labels.unitPrice} name="unitPrice" type="number" min="0.01" step="0.01" value={form.unitPrice} onChange={handleChange} required disabled={!enabled} />
        <Field label={labels.minimumStock} name="minimumStock" type="number" min="0" value={form.minimumStock} onChange={handleChange} disabled={!enabled} />
        <Field label={labels.entryDate} name="entryDate" type="date" value={form.entryDate} onChange={handleChange} required disabled={!enabled} />
        <Field label={labels.expirationDate} name="expirationDate" type="date" value={form.expirationDate} onChange={handleChange} disabled={!enabled} />
        <Field label={labels.supplier} name="supplier" value={form.supplier} onChange={handleChange} disabled={!enabled} />
        <Field label={labels.aisleLocation} name="aisleLocation" value={form.aisleLocation} onChange={handleChange} disabled={!enabled} />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting || !enabled}>
          {submitting ? labels.saving : labels.save}
        </button>
        {(editing || embedded) && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {labels.cancel}
          </button>
        )}
      </div>
    </form>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="form-field">
      <span className="field-label">{label}</span>
      <input className="field-input" {...props} />
    </label>
  )
}

function SkuField({
  label,
  hint,
  suggested,
  onApplySuggestion,
  applyLabel,
  showApply,
  ...props
}) {
  return (
    <label className={`form-field sku-field${suggested ? ' sku-field-suggested' : ''}`}>
      <span className="field-label">{label}</span>
      <input className="field-input" {...props} />
      {hint && (
        <span className="sku-field-hint">
          {suggested && <Sparkles size={12} aria-hidden />}
          {hint}
        </span>
      )}
      {showApply && (
        <button type="button" className="btn btn-ghost btn-sm sku-apply-btn" onClick={onApplySuggestion}>
          <Sparkles size={12} />
          <span>{applyLabel}</span>
        </button>
      )}
    </label>
  )
}
