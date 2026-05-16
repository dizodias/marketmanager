export function translateCatalogName(t, group, code, fallbackName) {
  if (!fallbackName && !code) return '—'
  if (!code) return fallbackName ?? '—'
  const key = `catalog.${group}.${code}.name`
  const translated = t(key, { defaultValue: '' })
  if (translated && translated !== key) return translated
  return fallbackName ?? code
}

export function translateCatalogDescription(t, group, code, fallbackDescription) {
  if (!code) return fallbackDescription ?? ''
  const key = `catalog.${group}.${code}.description`
  const translated = t(key, { defaultValue: '' })
  if (translated && translated !== key) return translated
  return fallbackDescription ?? ''
}

export function categoryLabel(t, category) {
  if (!category) return '—'
  return translateCatalogName(t, 'categories', category.code, category.name)
}

export function productTypeLabel(t, productType) {
  if (!productType) return '—'
  return translateCatalogName(t, 'productTypes', productType.code, productType.name)
}
