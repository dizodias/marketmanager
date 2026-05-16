import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Activity, Boxes, ServerOff } from 'lucide-react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useBackend } from '../context/BackendContext'
import { useAuth } from '../context/AuthContext'
import { fetchMovements } from '../api/movements'
import { describeHttpRequest, describeInventoryEvent } from '../utils/monitorFriendly'
import BackendEngine from './BackendEngine'

const WS_URL = `${window.location.origin}/ws`
const MAX_ITEMS = 150
const INITIAL_STATS = { total: 0, success: 0, clientError: 0, serverError: 0 }

function getMethodClass(method) {
  const map = { GET: 'method-GET', POST: 'method-POST', PUT: 'method-PUT', DELETE: 'method-DELETE', PATCH: 'method-PATCH' }
  return map[method] ?? 'method-other'
}

function getStatusClass(status) {
  if (status >= 500) return 'status-5xx'
  if (status >= 400) return 'status-4xx'
  if (status >= 300) return 'status-3xx'
  return 'status-2xx'
}

function formatTime(isoString) {
  try {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return ''
  }
}

function actionClass(action) {
  const map = {
    CREATED: 'action-created',
    UPDATED: 'action-updated',
    DELETED: 'action-deleted',
    STOCK_RECEIVED: 'action-stock',
    STOCK_ADJUSTED: 'action-stock',
    SALE: 'action-stock',
    LOSS: 'action-deleted',
    EXPIRED: 'action-deleted',
    PURCHASE: 'action-created',
    ADJUSTMENT: 'action-stock',
    TRANSFER: 'action-updated',
  }
  return map[action] ?? 'action-updated'
}

function StatCard({ label, value, variant }) {
  return (
    <div className={`glass stat-card ${variant}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  )
}

function ViewModeToggle({ viewMode, onChange, t }) {
  return (
    <div className="monitor-view-toggle" role="group" aria-label={t('dashboard.viewMode')}>
      <button
        type="button"
        className={`monitor-view-btn${viewMode === 'basic' ? ' active' : ''}`}
        onClick={() => onChange('basic')}
      >
        {t('dashboard.viewBasic')}
      </button>
      <button
        type="button"
        className={`monitor-view-btn${viewMode === 'advanced' ? ' active' : ''}`}
        onClick={() => onChange('advanced')}
      >
        {t('dashboard.viewAdvanced')}
      </button>
    </div>
  )
}

function RequestRow({ item }) {
  return (
    <div className="request-item">
      <span className={`method-badge ${getMethodClass(item.method)}`}>{item.method}</span>
      <span className="request-uri" title={item.uri}>{item.uri}</span>
      <span className={`status-badge ${getStatusClass(item.status)}`}>{item.status}</span>
      <span className="request-time">{formatTime(item.timestamp)}</span>
    </div>
  )
}

function InventoryEventRow({ item }) {
  return (
    <div className="request-item inventory-event">
      <span className={`history-action ${actionClass(item.action)}`}>{item.action}</span>
      <div className="event-body">
        <span className="event-product">{item.productName} <span className="event-sku">— {item.productSku}</span></span>
        <span className="event-desc">{item.description}</span>
      </div>
      <span className="request-time">{formatTime(item.timestamp || item.occurredAt)}</span>
    </div>
  )
}

function BasicRequestRow({ item, t }) {
  const { message, outcome, tone } = describeHttpRequest(t, item)
  return (
    <div className="monitor-basic-item">
      <span className={`monitor-tone-dot tone-${tone}`} aria-hidden />
      <div className="monitor-basic-body">
        <p className="monitor-basic-title">{message}</p>
        <p className="monitor-basic-meta">{outcome}</p>
      </div>
      <span className="request-time">{formatTime(item.timestamp)}</span>
    </div>
  )
}

function BasicInventoryRow({ item, t }) {
  const { message, detail, tone } = describeInventoryEvent(t, item)
  return (
    <div className="monitor-basic-item">
      <span className={`monitor-tone-dot tone-${tone}`} aria-hidden />
      <div className="monitor-basic-body">
        <p className="monitor-basic-title">{message}</p>
        {detail && <p className="monitor-basic-meta">{detail}</p>}
      </div>
      <span className="request-time">{formatTime(item.timestamp || item.occurredAt)}</span>
    </div>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
  const { online } = useBackend()
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('api')
  const [viewMode, setViewMode] = useState('basic')
  const [requests, setRequests] = useState([])
  const [inventoryEvents, setInventoryEvents] = useState([])
  const [connected, setConnected] = useState(false)
  const [stats, setStats] = useState(INITIAL_STATS)
  const clientRef = useRef(null)

  const statsLabels =
    viewMode === 'basic'
      ? {
          total: t('dashboard.basic.stats.total'),
          success: t('dashboard.basic.stats.success'),
          clientError: t('dashboard.basic.stats.clientErrors'),
          serverError: t('dashboard.basic.stats.serverErrors'),
        }
      : {
          total: t('dashboard.totalRequests'),
          success: t('dashboard.success'),
          clientError: t('dashboard.clientErrors'),
          serverError: t('dashboard.serverErrors'),
        }

  useEffect(() => {
    if (!online || !isAuthenticated) {
      return
    }
    let cancelled = false
    fetchMovements(30)
      .then((movements) => {
        if (cancelled || !movements?.length) return
        const mapped = movements.map((mov) => ({
          _id: `seed-${mov.id}`,
          action: mov.type,
          productName: mov.productName,
          productSku: mov.productSku,
          previousQuantity: mov.previousQuantity,
          newQuantity: mov.newQuantity,
          description: `${mov.previousQuantity} → ${mov.newQuantity}${mov.reason ? ` · ${mov.reason}` : ''}`,
          timestamp: mov.occurredAt,
        }))
        setInventoryEvents(mapped.slice(0, MAX_ITEMS))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [online, isAuthenticated])

  useEffect(() => {
    if (!online) {
      setConnected(false)
      clientRef.current?.deactivate()
      clientRef.current = null
      return undefined
    }

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected(true)
        stompClient.subscribe('/topic/requests', (message) => {
          const payload = JSON.parse(message.body)
          setRequests((prev) => [{ ...payload, _id: crypto.randomUUID() }, ...prev].slice(0, MAX_ITEMS))
          setStats((prev) => ({
            total: prev.total + 1,
            success: payload.status >= 200 && payload.status < 300 ? prev.success + 1 : prev.success,
            clientError: payload.status >= 400 && payload.status < 500 ? prev.clientError + 1 : prev.clientError,
            serverError: payload.status >= 500 ? prev.serverError + 1 : prev.serverError,
          }))
        })
        stompClient.subscribe('/topic/product-events', (message) => {
          const payload = JSON.parse(message.body)
          setInventoryEvents((prev) => [{ ...payload, _id: crypto.randomUUID() }, ...prev].slice(0, MAX_ITEMS))
        })
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
      onWebSocketError: () => setConnected(false),
    })

    stompClient.activate()
    clientRef.current = stompClient

    return () => {
      stompClient.deactivate()
      clientRef.current = null
    }
  }, [online])

  const feedItems = activeTab === 'api' ? requests : inventoryEvents
  const feedEmpty = feedItems.length === 0
  const emptyHint =
    viewMode === 'basic'
      ? activeTab === 'api'
        ? t('dashboard.basic.emptyHttp')
        : t('dashboard.basic.emptyInventory')
      : activeTab === 'api'
        ? t('dashboard.emptyHttp')
        : t('dashboard.emptyInventory')

  return (
    <main className="page">
      <header className="glass page-header">
        <div>
          <h1 className="header-title">{t('dashboard.title')}</h1>
          <p className="header-subtitle">
            {viewMode === 'basic' ? t('dashboard.basic.subtitle') : t('dashboard.subtitle')}
          </p>
        </div>
        <div className={`connection-badge ${connected ? 'connected' : 'disconnected'}`}>
          <span className="live-dot" />
          {!online ? t('dashboard.backendOffline') : connected ? t('dashboard.live') : t('dashboard.connecting')}
        </div>
      </header>

      {!online && (
        <section className="glass backend-offline-banner">
          <div className="offline-content">
            <ServerOff size={28} className="offline-icon" />
            <p className="offline-subtitle">{t('dashboard.offlineHint')}</p>
          </div>
          <BackendEngine />
        </section>
      )}

      <section className="stats-grid">
        <StatCard label={statsLabels.total} value={stats.total} variant="total" />
        <StatCard label={statsLabels.success} value={stats.success} variant="success" />
        <StatCard label={statsLabels.clientError} value={stats.clientError} variant="warning" />
        <StatCard label={statsLabels.serverError} value={stats.serverError} variant="danger" />
      </section>

      <section className="glass feed-container">
        <div className="feed-header">
          <div className="feed-tabs">
            <button
              type="button"
              className={`feed-tab ${activeTab === 'api' ? 'active' : ''}`}
              onClick={() => setActiveTab('api')}
            >
              <Activity size={14} />
              <span>
                {viewMode === 'basic' ? t('dashboard.basic.tabHttp') : t('dashboard.tabHttp')} ({requests.length})
              </span>
            </button>
            <button
              type="button"
              className={`feed-tab ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              <Boxes size={14} />
              <span>
                {viewMode === 'basic' ? t('dashboard.basic.tabInventory') : t('dashboard.tabInventory')} ({inventoryEvents.length})
              </span>
            </button>
          </div>
          <ViewModeToggle viewMode={viewMode} onChange={setViewMode} t={t} />
        </div>

        <div className={`feed-list${viewMode === 'basic' ? ' feed-list-basic' : ''}`}>
          {feedEmpty ? (
            <div className="empty-state">
              <Activity size={28} className="empty-icon" />
              <p className="empty-title">{online ? t('dashboard.empty') : t('dashboard.backendOffline')}</p>
              <p className="empty-subtitle">{!online ? t('dashboard.offlineHint') : emptyHint}</p>
            </div>
          ) : activeTab === 'api' ? (
            requests.map((item) =>
              viewMode === 'basic' ? (
                <BasicRequestRow key={item._id} item={item} t={t} />
              ) : (
                <RequestRow key={item._id} item={item} />
              ),
            )
          ) : (
            inventoryEvents.map((item) =>
              viewMode === 'basic' ? (
                <BasicInventoryRow key={item._id} item={item} t={t} />
              ) : (
                <InventoryEventRow key={item._id} item={item} />
              ),
            )
          )}
        </div>
      </section>
    </main>
  )
}
