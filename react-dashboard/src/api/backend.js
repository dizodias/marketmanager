export async function fetchBackendStatus() {
  const response = await fetch('/dev/backend/status')
  if (!response.ok) throw new Error('Dev server unavailable')
  return response.json()
}

export async function startBackend() {
  const response = await fetch('/dev/backend/start', { method: 'POST' })
  if (!response.ok) throw new Error('Failed to start backend')
  return response.json()
}

export async function fetchBackendLog() {
  const response = await fetch('/dev/backend/log')
  if (!response.ok) return []
  const data = await response.json()
  return data.lines ?? []
}

export async function waitForBackend(maxAttempts = 60, intervalMs = 2000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await fetchBackendStatus()
    if (status.online) return true
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
  return false
}
