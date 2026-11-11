import { useRef, useState } from 'react'
import PWABadge from './PWABadge.jsx'
import './App.css'

const BODYLESS_METHODS = new Set(['GET', 'DELETE'])

function App() {
  const [method, setMethod] = useState('GET')
  const [endpoint, setEndpoint] = useState('')
  const [urlParams, setUrlParams] = useState([{ id: 0, key: '', value: '' }])
  const [headersText, setHeadersText] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [status, setStatus] = useState('-')
  const [time, setTime] = useState('-')
  const [responseHeaders, setResponseHeaders] = useState('')
  const [response, setResponse] = useState('')
  const [isSending, setIsSending] = useState(false)
  const nextParamId = useRef(1)

  function updateUrlParam(id, field, value) {
    setUrlParams((params) =>
      params.map((param) =>
        param.id === id ? { ...param, [field]: value } : param,
      ),
    )
  }

  function addUrlParam() {
    const id = nextParamId.current
    nextParamId.current += 1
    setUrlParams((params) => [...params, { id, key: '', value: '' }])
  }

  function removeUrlParam(id) {
    setUrlParams((params) => params.filter((param) => param.id !== id))
  }

  async function sendRequest(event) {
    event.preventDefault()

    setStatus('')
    setTime('')
    setResponseHeaders('')
    setResponse('')

    const normalizedEndpoint = endpoint.trim().startsWith('/')
      ? endpoint.trim()
      : `/${endpoint.trim()}`
    const requestUrl = new URL(
      `/api-proxy${normalizedEndpoint}`,
      window.location.origin,
    )
    const searchParams = new URLSearchParams(requestUrl.search)
    urlParams.forEach(({ key, value }) => {
      if (key.trim()) {
        searchParams.append(key.trim(), value)
      }
    })
    requestUrl.search = searchParams.toString()

    let headers = { 'Content-Type': 'application/json' }

    try {
      if (headersText.trim()) {
        const parsedHeaders = JSON.parse(headersText)
        if (
          parsedHeaders === null ||
          Array.isArray(parsedHeaders) ||
          typeof parsedHeaders !== 'object'
        ) {
          throw new Error('Headers devem ser um objeto JSON.')
        }
        headers = { ...headers, ...parsedHeaders }
      }
    } catch (error) {
      setStatus('Erro nos headers')
      setResponse(error.message)
      return
    }

    let requestBody

    try {
      if (!BODYLESS_METHODS.has(method) && bodyText.trim()) {
        requestBody = JSON.stringify(JSON.parse(bodyText))
      }
    } catch (error) {
      setStatus('Erro no body')
      setResponse(error.message)
      return
    }

    setIsSending(true)

    try {
      const start = performance.now()
      const result = await fetch(requestUrl, {
        method,
        headers,
        body: requestBody,
      })
      const elapsed = Math.round(performance.now() - start)

      setStatus(`${result.status} ${result.statusText}`)
      setTime(`${elapsed} ms`)

      const responseHeadersObject = {}
      result.headers.forEach((value, key) => {
        responseHeadersObject[key] = value
      })
      setResponseHeaders(JSON.stringify(responseHeadersObject, null, 2))

      const contentType = result.headers.get('content-type')
      const output = contentType?.includes('application/json')
        ? JSON.stringify(await result.json(), null, 2)
        : await result.text()
      setResponse(output)
    } catch (error) {
      setStatus('Erro')
      setResponse(error.message)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="request-card" aria-labelledby="page-title">
        <header className="app-header">
          <div className="brand-mark" aria-hidden="true">H</div>
          <div>
            <p className="eyebrow">HTTP CLIENT</p>
            <h1 id="page-title">Hephaistos Requests</h1>
            <p className="subtitle">Faça requisições e inspecione as respostas.</p>
          </div>
        </header>

        <form onSubmit={sendRequest}>
          <div className="form-group">
            <label htmlFor="method">Método</label>
            <select
              id="method"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="proxy-notice">
            Destino configurado no ambiente local de desenvolvimento.
          </div>

          <div className="form-group">
            <label htmlFor="endpoint">Endpoint</label>
            <input
              id="endpoint"
              value={endpoint}
              onChange={(event) => setEndpoint(event.target.value)}
              placeholder="/api/teste"
            />
          </div>

          <div className="form-group">
            <label htmlFor="headers">Headers <span>(JSON)</span></label>
            <textarea
              id="headers"
              rows="6"
              value={headersText}
              onChange={(event) => setHeadersText(event.target.value)}
              placeholder={'{\n  "Authorization": "******",\n  "X-API-Key": "123"\n}'}
              spellCheck="false"
            />
          </div>

          {!BODYLESS_METHODS.has(method) && (
            <div className="form-group">
              <label htmlFor="body">Body <span>(JSON)</span></label>
              <textarea
                id="body"
                rows="8"
                value={bodyText}
                onChange={(event) => setBodyText(event.target.value)}
                placeholder={'{\n  "nome": "Vitor"\n}'}
                spellCheck="false"
              />
            </div>
          )}

          <button className="send-button" type="submit" disabled={isSending}>
            {isSending ? 'Enviando...' : 'Enviar requisição'}
            {!isSending && <span aria-hidden="true">→</span>}
          </button>
        </form>

        <section className="results" aria-label="Resultado da requisição" aria-live="polite">
          <div className="result-summary">
            <div>
              <p className="result-label">STATUS</p>
              <p className={`result-value ${status.startsWith('Erro') || status === 'Erro' ? 'error' : ''}`}>
                {status}
              </p>
            </div>
            <div>
              <p className="result-label">TEMPO</p>
              <p className="result-value">{time}</p>
            </div>
          </div>

          <h2>Response Headers</h2>
          <pre>{responseHeaders || '-'}</pre>

          <h2>Response</h2>
          <pre>{response || '-'}</pre>
        </section>
      </section>
      <PWABadge />
    </main>
  )
}

export default App
