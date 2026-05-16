import { createContext, useContext, useEffect, useState } from 'react'

const ShellContext = createContext(null)

export function ShellProvider({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!mobileOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  function closeMobile() {
    setMobileOpen(false)
  }

  function toggleMobile() {
    setMobileOpen((v) => !v)
  }

  function toggleCollapsed() {
    setCollapsed((v) => !v)
  }

  return (
    <ShellContext.Provider
      value={{
        collapsed,
        setCollapsed,
        toggleCollapsed,
        mobileOpen,
        setMobileOpen,
        closeMobile,
        toggleMobile,
      }}
    >
      {children}
    </ShellContext.Provider>
  )
}

export function useShell() {
  const ctx = useContext(ShellContext)
  if (!ctx) throw new Error('useShell must be used within ShellProvider')
  return ctx
}
