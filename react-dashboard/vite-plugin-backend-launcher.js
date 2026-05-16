import { spawn } from 'child_process'
import fs from 'fs'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const HEALTH_URL = 'http://localhost:8080/actuator/health'
const LOG_FILE = path.join(PROJECT_ROOT, 'backend-dev.log')

let backendProcess = null
let isStarting = false
let lastError = ''

function checkBackendHealth() {
  return new Promise((resolve) => {
    const request = http.get(HEALTH_URL, (response) => {
      resolve(response.statusCode === 200)
    })
    request.on('error', () => resolve(false))
    request.setTimeout(2500, () => {
      request.destroy()
      resolve(false)
    })
  })
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (chunk) => { data += chunk })
    req.on('end', () => resolve(data))
  })
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function readLogTail(maxLines = 30) {
  try {
    if (!fs.existsSync(LOG_FILE)) return []
    const content = fs.readFileSync(LOG_FILE, 'utf-8')
    return content.split('\n').filter(Boolean).slice(-maxLines)
  } catch {
    return []
  }
}

function startBackendProcess() {
  const isWindows = process.platform === 'win32'
  const wrapperName = isWindows ? 'mvnw.cmd' : 'mvnw'
  const wrapperPath = path.join(PROJECT_ROOT, wrapperName)

  if (!fs.existsSync(wrapperPath)) {
    lastError = `Maven wrapper not found at ${wrapperPath}`
    return false
  }

  try {
    fs.appendFileSync(LOG_FILE, `\n--- Backend start ${new Date().toISOString()} ---\n`)
  } catch {}

  try {
    const command = isWindows
      ? `start "spring-boot" /MIN cmd.exe /c ""${wrapperPath}" spring-boot:run >> "${LOG_FILE}" 2>&1"`
      : `nohup "${wrapperPath}" spring-boot:run >> "${LOG_FILE}" 2>&1 &`

    backendProcess = spawn(command, [], {
      cwd: PROJECT_ROOT,
      shell: true,
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
      env: { ...process.env },
    })

    backendProcess.on('error', (err) => {
      lastError = err.message
      isStarting = false
      console.error('[backend-launcher]', err.message)
    })

    backendProcess.unref()
    return true
  } catch (err) {
    lastError = err.message
    return false
  }
}

export function backendLauncherPlugin() {
  return {
    name: 'backend-launcher',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/dev/backend')) {
          return next()
        }

        try {
          if (req.url === '/dev/backend/status' && req.method === 'GET') {
            const online = await checkBackendHealth()
            if (online) isStarting = false
            return sendJson(res, 200, { online, starting: isStarting, lastError })
          }

          if (req.url === '/dev/backend/log' && req.method === 'GET') {
            return sendJson(res, 200, { lines: readLogTail() })
          }

          if (req.url === '/dev/backend/start' && req.method === 'POST') {
            await readBody(req)
            const online = await checkBackendHealth()
            if (online) {
              return sendJson(res, 200, { status: 'already_running', online: true })
            }
            if (isStarting) {
              return sendJson(res, 200, { status: 'starting', online: false })
            }

            isStarting = true
            lastError = ''
            const started = startBackendProcess()

            if (!started) {
              isStarting = false
              return sendJson(res, 500, { status: 'failed', online: false, lastError })
            }

            console.log('[backend-launcher] Spring Boot starting… (log: backend-dev.log)')
            setTimeout(() => { isStarting = false }, 120000)
            return sendJson(res, 200, { status: 'started', online: false })
          }

          return sendJson(res, 404, { error: 'Not found' })
        } catch (err) {
          console.error('[backend-launcher] middleware error:', err.message)
          lastError = err.message
          return sendJson(res, 500, { error: 'Launcher error', message: err.message })
        }
      })

      process.on('uncaughtException', (err) => {
        if (err && /spawn/i.test(String(err))) {
          console.error('[backend-launcher] caught spawn error:', err.message)
          lastError = err.message
          isStarting = false
          return
        }
        throw err
      })
    },
  }
}
