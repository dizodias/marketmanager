import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function CollapsiblePanel({
  title,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
  className = '',
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const panelId = useId()
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen

  function toggle() {
    const next = !isOpen
    if (onOpenChange) onOpenChange(next)
    else setInternalOpen(next)
  }

  return (
    <section className={`collapsible-panel glass ${isOpen ? 'open' : ''} ${className}`.trim()}>
      <button
        type="button"
        className="collapsible-trigger"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span className="collapsible-title">{title}</span>
        <ChevronDown size={18} className="collapsible-chevron" aria-hidden />
      </button>
      <div id={panelId} className="collapsible-body" data-open={isOpen ? 'true' : 'false'}>
        <div className="collapsible-inner">{children}</div>
      </div>
    </section>
  )
}
