function normalizeUri(uri) {
  return (uri ?? '').split('?')[0].toLowerCase()
}

function resourceSegment(uri) {
  const path = normalizeUri(uri).replace(/\/+$/, '')
  const parts = path.split('/').filter(Boolean)
  const apiIdx = parts.indexOf('api')
  const segments = apiIdx >= 0 ? parts.slice(apiIdx + 2) : parts
  return segments[0] ?? ''
}

function isNumeric(value) {
  return /^\d+$/.test(value)
}

function statusTone(status) {
  if (status >= 500) return 'danger'
  if (status >= 400) return 'warning'
  if (status >= 200 && status < 300) return 'success'
  return 'neutral'
}

export function httpStatusTone(status) {
  return statusTone(status)
}

export function inventoryActionTone(action) {
  const map = {
    CREATED: 'success',
    STOCK_RECEIVED: 'success',
    SALE: 'success',
    UPDATED: 'neutral',
    STOCK_ADJUSTED: 'neutral',
    TRANSFER: 'neutral',
    PURCHASE: 'success',
    ADJUSTMENT: 'neutral',
    DELETED: 'danger',
    LOSS: 'danger',
    EXPIRED: 'danger',
  }
  return map[action] ?? 'neutral'
}

export function describeHttpRequest(t, item) {
  const method = (item.method ?? 'GET').toUpperCase()
  const uri = normalizeUri(item.uri)
  const status = item.status ?? 0
  const resource = resourceSegment(uri)
  const hasId = uri.split('/').some(isNumeric)

  let key = 'generic'
  if (uri.includes('/auth/login')) key = 'login'
  else if (uri.includes('/auth/me') || uri.includes('/users/me')) key = 'profile'
  else if (resource === 'products' && uri.includes('/movements')) key = hasId ? 'productMovement' : 'movements'
  else if (resource === 'products') key = hasId ? 'productOne' : 'products'
  else if (resource === 'categories') key = hasId ? 'categoryOne' : 'categories'
  else if (resource === 'product-types') key = hasId ? 'typeOne' : 'types'
  else if (resource === 'movements') key = 'movements'
  else if (resource === 'users') key = hasId ? 'userOne' : 'users'

  const actionKey = `${method.toLowerCase()}_${key}`
  const message = t(`dashboard.basic.http.${actionKey}`, {
    defaultValue: t('dashboard.basic.http.generic', { method, resource: resource || 'sistema' }),
  })

  const outcomeKey = status >= 500 ? 'failed' : status >= 400 ? 'blocked' : 'ok'
  const outcome = t(`dashboard.basic.http.outcome.${outcomeKey}`)

  return { message, outcome, tone: statusTone(status) }
}

export function describeInventoryEvent(t, item) {
  const action = item.action ?? 'UPDATED'
  const product = item.productName ?? t('dashboard.basic.inventory.unknownProduct')
  const fromQty = item.previousQuantity
  const toQty = item.newQuantity

  let detail = ''
  if (fromQty != null && toQty != null) {
    detail = t('dashboard.basic.inventory.qtyChange', { from: fromQty, to: toQty })
  } else if (item.description) {
    detail = item.description.replace(/→/g, '→').replace(/·/g, ' — ')
  }

  const message = t(`dashboard.basic.inventory.${action}`, {
    product,
    defaultValue: t('dashboard.basic.inventory.generic', { product, action }),
  })

  return { message, detail, tone: inventoryActionTone(action) }
}
