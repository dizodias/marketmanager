import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { fetchBackendLog, fetchBackendStatus, startBackend, waitForBackend } from '../api/backend'

const STATUS = {
  CHECKING: 'checking',
  ONLINE: 'online',
  OFFLINE: 'offline',
  STARTING: 'starting',
  ERROR: 'error',
}

const BackendContext = createContext(null)

export function BackendProvider({ children }) {
  const [status, setStatus] = useState(STATUS.CHECKING)
  const [messageKey, setMessageKey] = useState(null)
  const startingRef = useRef(false)

  const online = status === STATUS.ONLINE

  const checkStatus = useCallback(async () => {
    try {
      const data = await fetchBackendStatus()
      if (data.online) {
        startingRef.current = false
        setStatus(STATUS.ONLINE)
        setMessageKey(null)
      } else if (data.starting || startingRef.current) {
        setStatus(STATUS.STARTING)
      } else if (status !== STATUS.ERROR) {
        setStatus(STATUS.OFFLINE)
      }
    } catch {
      if (!startingRef.current && status !== STATUS.ERROR) {
        setStatus(STATUS.OFFLINE)
      }
    }
  }, [status])

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [checkStatus])

  const handleStart = useCallback(async () => {
    startingRef.current = true
    setStatus(STATUS.STARTING)
    setMessageKey('engine.starting_message')
    try {
      await startBackend()
      const ready = await waitForBackend(60, 2000)
      startingRef.current = false
      if (ready) {
        setStatus(STATUS.ONLINE)
        setMessageKey(null)
      } else {
        setStatus(STATUS.ERROR)
        const logHint = await fetchBackendLog().catch(() => [])
        const mysqlHint = logHint.some((line) =>
          /mysql|communications link|access denied|connection refused/i.test(line)
        )
        setMessageKey(mysqlHint ? 'engine.error_mysql' : 'engine.error_generic')
      }
    } catch {
      startingRef.current = false
      setStatus(STATUS.ERROR)
      setMessageKey('engine.error_failed')
    }
    await checkStatus()
  }, [checkStatus])

  const value = useMemo(
    () => ({ online, status, messageKey, start: handleStart }),
    [online, status, messageKey, handleStart]
  )

  return <BackendContext.Provider value={value}>{children}</BackendContext.Provider>
}

export function useBackend() {
  const context = useContext(BackendContext)
  if (!context) {
    throw new Error('useBackend must be used within BackendProvider')
  }
  return context
}

export { STATUS as BackendStatus }
