const STOP_WORDS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'e', 'em', 'com', 'para', 'por', 'a', 'o', 'as', 'os',
  'the', 'and', 'or', 'of', 'for', 'with', 'el', 'la', 'los', 'las', 'y', 'en',
])

function stripAccents(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function tokenizeName(name) {
  return stripAccents(name)
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((word) => {
      if (!word) return false
      if (/^\d+$/.test(word)) return true
      if (word.length < 2) return false
      return !STOP_WORDS.has(word.toLowerCase())
    })
}

function tokenPart(word, maxLen) {
  const clean = word.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  if (!clean) return ''
  return clean.slice(0, maxLen)
}

function categoryPrefix(categoryCode) {
  if (!categoryCode) return ''
  const code = categoryCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  if (code.length <= 4) return code
  return code.slice(0, 4)
}

function buildBaseSku(name, categoryCode) {
  const words = tokenizeName(name)
  const parts = []

  const cat = categoryPrefix(categoryCode)
  if (cat) parts.push(cat)

  if (words.length === 0) {
    return parts.join('-') || ''
  }

  if (words.length === 1) {
    parts.push(tokenPart(words[0], 16))
  } else {
    words.slice(0, 4).forEach((word) => {
      const part = tokenPart(word, word.length <= 4 ? 4 : 3)
      if (part) parts.push(part)
    })
  }

  let sku = parts.filter(Boolean).join('-')
  if (sku.length < 3) {
    sku = words.join('').toUpperCase().slice(0, 20)
  }
  return sku.slice(0, 42)
}

function ensureUnique(base, existingSkus, excludeSku) {
  const normalized = base.toUpperCase()
  const taken = new Set(
    existingSkus
      .map((s) => (s ?? '').trim().toUpperCase())
      .filter((s) => s && s !== (excludeSku ?? '').trim().toUpperCase()),
  )

  if (normalized.length >= 3 && !taken.has(normalized)) {
    return normalized
  }

  for (let i = 1; i <= 99; i += 1) {
    const suffix = String(i).padStart(2, '0')
    const candidate = `${normalized.slice(0, 47 - suffix.length - 1)}-${suffix}`
    if (candidate.length >= 3 && candidate.length <= 50 && !taken.has(candidate)) {
      return candidate
    }
  }

  const fallback = `${normalized.slice(0, 40)}-${Date.now().toString(36).slice(-4).toUpperCase()}`
  return fallback.slice(0, 50)
}

export function suggestSkuFromProductName(name, options = {}) {
  const { categoryCode = '', existingSkus = [], excludeSku = '' } = options
  const trimmed = (name ?? '').trim()
  if (trimmed.length < 2) return ''

  const base = buildBaseSku(trimmed, categoryCode)
  if (!base || base.length < 3) return ''

  return ensureUnique(base, existingSkus, excludeSku)
}

export function isValidSkuFormat(sku) {
  const value = (sku ?? '').trim()
  return value.length >= 3 && value.length <= 50 && /^[A-Z0-9][A-Z0-9-]*$/.test(value.toUpperCase())
}
