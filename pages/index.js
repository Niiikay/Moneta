import { useState, useRef } from 'react'
import Head from 'next/head'
import Papa from 'papaparse'
import styles from '../styles/Home.module.css'

const MOCK = [
  { date: '2024-04-01', description: 'Whole Foods Market', amount: -142.50 },
  { date: '2024-04-02', description: 'Uber Eats', amount: -38.90 },
  { date: '2024-04-03', description: 'Netflix', amount: -15.99 },
  { date: '2024-04-04', description: 'Metro Card', amount: -33.00 },
  { date: '2024-04-05', description: 'Zara', amount: -89.00 },
  { date: '2024-04-06', description: 'Shake Shack', amount: -24.60 },
  { date: '2024-04-06', description: 'Whole Foods Market', amount: -118.20 },
  { date: '2024-04-07', description: 'Spotify', amount: -9.99 },
  { date: '2024-04-08', description: 'CVS Pharmacy', amount: -47.30 },
  { date: '2024-04-09', description: 'Dominos Pizza', amount: -32.00 },
  { date: '2024-04-10', description: 'Con Edison', amount: -78.00 },
  { date: '2024-04-11', description: 'Lyft', amount: -18.40 },
  { date: '2024-04-12', description: 'Chipotle', amount: -14.80 },
  { date: '2024-04-13', description: 'H&M', amount: -65.00 },
  { date: '2024-04-13', description: 'Whole Foods Market', amount: -201.00 },
  { date: '2024-04-14', description: 'Uber Eats', amount: -44.20 },
  { date: '2024-04-15', description: 'Planet Fitness', amount: -24.99 },
  { date: '2024-04-16', description: 'AMC Theaters', amount: -36.00 },
  { date: '2024-04-17', description: 'Uber Eats', amount: -52.10 },
  { date: '2024-04-18', description: 'Starbucks', amount: -22.40 },
  { date: '2024-04-19', description: 'Shake Shack', amount: -28.90 },
  { date: '2024-04-20', description: 'Amazon', amount: -113.00 },
  { date: '2024-04-21', description: 'Uber Eats', amount: -39.50 },
  { date: '2024-04-22', description: 'Verizon', amount: -85.00 },
  { date: '2024-04-23', description: 'Sephora', amount: -72.00 },
  { date: '2024-04-24', description: 'Chipotle', amount: -16.20 },
  { date: '2024-04-25', description: 'Lyft', amount: -22.80 },
  { date: '2024-04-26', description: 'Uber Eats', amount: -48.30 },
  { date: '2024-04-27', description: 'AMC Theaters', amount: -28.00 },
]

const KEYWORDS = {
  Groceries: /whole foods|trader joe|grocery|kroger|safeway|aldi|costco/i,
  Dining: /uber eats|doordash|grubhub|dominos|pizza|chipotle|shake shack|starbucks|restaurant|cafe|diner/i,
  Transport: /uber|lyft|metro|transit|bus|train|parking|gas/i,
  Entertainment: /netflix|spotify|hulu|amc|theater|steam|disney|youtube/i,
  Shopping: /zara|h&m|amazon|sephora|shopping|fashion|target|walmart/i,
  Utilities: /con edison|verizon|at&t|utility|electric|water|internet|comcast/i,
  Health: /cvs|pharmacy|fitness|planet|health|doctor|dental|gym/i,
}

function categorize(desc) {
  for (const [cat, regex] of Object.entries(KEYWORDS)) {
    if (regex.test(desc)) return cat
  }
  return 'Other'
}

const CAT_COLORS = {
  Groceries: { accent: '#4ade80', dim: 'rgba(74,222,128,0.1)', bar: '#4ade80' },
  Dining: { accent: '#ff5c5c', dim: 'rgba(255,92,92,0.1)', bar: '#ff5c5c' },
  Transport: { accent: '#5c9fff', dim: 'rgba(92,159,255,0.1)', bar: '#5c9fff' },
  Entertainment: { accent: '#a78bfa', dim: 'rgba(167,139,250,0.1)', bar: '#a78bfa' },
  Shopping: { accent: '#f472b6', dim: 'rgba(244,114,182,0.1)', bar: '#f472b6' },
  Utilities: { accent: '#94a3b8', dim: 'rgba(148,163,184,0.1)', bar: '#94a3b8' },
  Health: { accent: '#34d399', dim: 'rgba(52,211,153,0.1)', bar: '#34d399' },
  Other: { accent: '#ffb347', dim: 'rgba(255,179,71,0.1)', bar: '#ffb347' },
}

const INSIGHT_COLORS = {
  red: { bg: 'rgba(255,92,92,0.08)', border: 'rgba(255,92,92,0.2)', accent: '#ff5c5c', tag: 'rgba(255,92,92,0.15)' },
  amber: { bg: 'rgba(255,179,71,0.08)', border: 'rgba(255,179,71,0.2)', accent: '#ffb347', tag: 'rgba(255,179,71,0.15)' },
  green: { bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)', accent: '#4ade80', tag: 'rgba(74,222,128,0.15)' },
  blue: { bg: 'rgba(92,159,255,0.08)', border: 'rgba(92,159,255,0.2)', accent: '#5c9fff', tag: 'rgba(92,159,255,0.15)' },
  purple: { bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', accent: '#a78bfa', tag: 'rgba(167,139,250,0.15)' },
}

export default function Home() {
  const [tab, setTab] = useState('upload')
  const [txns, setTxns] = useState([])
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const cats = txns.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
    return acc
  }, {})
  const total = Object.values(cats).reduce((a, b) => a + b, 0)
  const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1])
  const deliveries = txns.filter(t => /uber eats|doordash|grubhub/i.test(t.description))
  const deliveryTotal = deliveries.reduce((s, t) => s + Math.abs(t.amount), 0)
  const budget = 2500
  const burnPct = Math.min(Math.round((total / budget) * 100), 100)

  function processTransactions(raw) {
    const processed = raw.map(t => ({ ...t, category: categorize(t.description) }))
    setTxns(processed)
    setTab('dashboard')
    setInsights([])
  }

  function loadMock() {
    processTransactions(MOCK)
  }

  async function handleFile(file) {
  if (!file) return
  setError('')

  if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
    Papa.parse(file, {
      header: true,
      complete: ({ data }) => {
        const keys = Object.keys(data[0] || {})
        const parsed = data
          .map(row => ({
            date: row[keys[0]] || '',
            description: row[keys[1]] || '',
            amount: parseFloat(row[keys[2]]) || 0,
          }))
          .filter(r => r.amount < 0)
        if (parsed.length === 0) { setError('No valid transactions found. Try demo data.'); return }
        processTransactions(parsed)
      }
    })
    return
  }

  // PDF — render first page to image using canvas, then send as image
  if (file.type === 'application/pdf') {
    setLoading(true)
    try {
      const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js')
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 2 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
      const base64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1]
      await sendToGroq(base64, 'image/jpeg')
    } catch (e) {
      setError('Could not read PDF. Try uploading a JPG/PNG screenshot instead.')
      setLoading(false)
    }
    return
  }

  // Image
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    setError('Please upload a CSV, image (JPG/PNG/WEBP), or PDF file.')
    return
  }

  setLoading(true)
  const reader = new FileReader()
  reader.onload = async (ev) => {
    const base64 = ev.target.result.split(',')[1]
    await sendToGroq(base64, file.type)
  }
  reader.readAsDataURL(file)
}

async function sendToGroq(base64, mediaType) {
  try {
    const res = await fetch('/api/analyse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64, mediaType })
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    if (!data.transactions || data.transactions.length === 0) {
      throw new Error('No transactions found. Try a clearer image or use CSV.')
    }
    processTransactions(data.transactions)
  } catch (e) {
    setError(e.message)
  } finally {
    setLoading(false)
  }
}
  async function runAnalysis() {
    setLoading(true)
    setError('')
    const summary = `
Total spent: $${Math.round(total)}
Budget: $${budget}
Transactions: ${txns.length}
Categories: ${sorted.map(([k, v]) => `${k}: $${Math.round(v)}`).join(', ')}
Food deliveries: ${deliveries.length} orders totaling $${Math.round(deliveryTotal)}
Largest single transaction: $${Math.round(Math.max(...txns.map(t => Math.abs(t.amount))))}
Weekend transactions: ${txns.filter(t => [0,6].includes(new Date(t.date).getDay())).length}
    `.trim()

    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setInsights(data.insights)
      setTab('insights')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Moneta — AI Financial Coach</title>
        <meta name="description" content="Understand your money. Finally." />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>◈</text></svg>" />
      </Head>

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>◈</span>
            <span className={styles.logoText}>Moneta</span>
          </div>

          <nav className={styles.nav}>
            {['upload', 'dashboard', 'insights'].map(t => (
              <button
                key={t}
                className={`${styles.navItem} ${tab === t ? styles.navActive : ''}`}
                onClick={() => setTab(t)}
                disabled={t !== 'upload' && txns.length === 0}
              >
                <span className={styles.navIcon}>
                  {t === 'upload' ? '↑' : t === 'dashboard' ? '▦' : '◎'}
                </span>
                <span>{t === 'upload' ? 'Import' : t === 'dashboard' ? 'Overview' : 'AI Insights'}</span>
                {t === 'insights' && insights.length > 0 && (
                  <span className={styles.insightBadge}>{insights.length}</span>
                )}
              </button>
            ))}
          </nav>

          {txns.length > 0 && (
            <div className={styles.sidebarStats}>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Transactions</span>
                <span className={styles.statVal}>{txns.length}</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Total spent</span>
                <span className={styles.statVal}>${Math.round(total).toLocaleString()}</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Budget used</span>
                <span className={styles.statVal} style={{ color: burnPct > 80 ? 'var(--red)' : 'var(--accent)' }}>{burnPct}%</span>
              </div>
            </div>
          )}

          <div className={styles.sidebarBottom}>
            <span className={styles.poweredBy}>Powered by Groq</span>
          </div>
        </aside>

        {/* Main */}
        <main className={styles.main}>

          {/* UPLOAD TAB */}
          {tab === 'upload' && (
            <div className={styles.uploadPage}>
              <div className={styles.uploadHero}>
                <h1 className={`${styles.heroTitle} serif`}>
                  Where did your<br /><em>money go?</em>
                </h1>
                <p className={styles.heroSub}>Upload your bank CSV and get AI-powered behavioural insights — not just charts.</p>
              </div>

              <div
                className={`${styles.dropZone} ${dragOver ? styles.dropActive : ''}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
              >
                <input ref={fileRef} type="file" accept=".csv,image/jpeg,image/png,image/webp,application/pdf" onChange={e => handleFile(e.target.files[0])} />
                <div className={styles.dropIcon}>↑</div>
                <p className={styles.dropTitle}>Drop your statement here</p>
                <p className={styles.dropSub}>CSV, bank statement photo (JPG/PNG), or scanned PDF — or use demo data below</p>
              </div>

              {error && <p className={styles.errorMsg}>{error}</p>}

              <div className={styles.orDivider}><span>or</span></div>

              <button className={styles.demoBtn} onClick={loadMock}>
                Load demo transactions
                <span className={styles.demoBadge}>30 txns · April 2024</span>
              </button>

              <div className={styles.featureRow}>
                {[
                  { icon: '◎', title: 'Hidden patterns', desc: 'Weekend vs weekday, time-of-day spend spikes' },
                  { icon: '◈', title: 'Behaviour coaching', desc: 'Not what you spent — why, and what to do' },
                  { icon: '▲', title: 'Budget runway', desc: 'Predict when you\'ll exceed your monthly limit' },
                ].map(f => (
                  <div key={f.title} className={styles.featureCard}>
                    <span className={styles.featureIcon}>{f.icon}</span>
                    <strong className={styles.featureTitle}>{f.title}</strong>
                    <p className={styles.featureDesc}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DASHBOARD TAB */}
          {tab === 'dashboard' && txns.length > 0 && (
            <div className={styles.dashPage}>
              <div className={styles.pageHeader}>
                <div>
                  <h2 className={`${styles.pageTitle} serif`}>Overview</h2>
                  <p className={styles.pageSub}>{txns.length} transactions · April 2024</p>
                </div>
                <button className={styles.analyseBtn} onClick={runAnalysis} disabled={loading}>
                  {loading ? (
                    <span className={styles.spinner} />
                  ) : '◎ Analyse with AI'}
                </button>
              </div>

              {error && <p className={styles.errorMsg}>{error}</p>}

              {/* Metrics */}
              <div className={styles.metricsGrid}>
                {[
                  { label: 'Total spent', value: `$${Math.round(total).toLocaleString()}`, sub: 'This month', color: 'var(--text)' },
                  { label: 'Budget remaining', value: `$${Math.max(0, budget - Math.round(total)).toLocaleString()}`, sub: `of $${budget.toLocaleString()} budget`, color: burnPct > 80 ? 'var(--red)' : 'var(--accent)' },
                  { label: 'Food deliveries', value: deliveries.length, sub: `$${Math.round(deliveryTotal)} total`, color: 'var(--amber)' },
                  { label: 'Avg per day', value: `$${Math.round(total / 27)}`, sub: 'At current pace', color: 'var(--blue)' },
                ].map(m => (
                  <div key={m.label} className={styles.metricCard}>
                    <span className={styles.metricLabel}>{m.label}</span>
                    <span className={styles.metricValue} style={{ color: m.color }}>{m.value}</span>
                    <span className={styles.metricSub}>{m.sub}</span>
                  </div>
                ))}
              </div>

              {/* Burn bar */}
              <div className={styles.burnCard}>
                <div className={styles.burnHeader}>
                  <span className={styles.burnLabel}>Monthly budget burn</span>
                  <span className={styles.burnPct} style={{ color: burnPct > 80 ? 'var(--red)' : 'var(--accent)' }}>{burnPct}%</span>
                </div>
                <div className={styles.burnTrack}>
                  <div className={styles.burnFill} style={{ width: `${burnPct}%`, background: burnPct > 80 ? 'var(--red)' : 'var(--accent)' }} />
                </div>
                <div className={styles.burnFooter}>
                  <span>${Math.round(total).toLocaleString()} spent</span>
                  <span>${budget.toLocaleString()} budget</span>
                </div>
              </div>

              {/* Categories */}
              <div className={styles.catSection}>
                <h3 className={styles.sectionTitle}>Spending breakdown</h3>
                <div className={styles.catList}>
                  {sorted.map(([cat, amt]) => {
                    const pct = Math.round((amt / total) * 100)
                    const c = CAT_COLORS[cat] || CAT_COLORS.Other
                    return (
                      <div key={cat} className={styles.catRow}>
                        <div className={styles.catDot} style={{ background: c.accent }} />
                        <span className={styles.catName}>{cat}</span>
                        <div className={styles.catBarWrap}>
                          <div className={styles.catBar} style={{ width: `${pct}%`, background: c.accent }} />
                        </div>
                        <span className={styles.catAmt}>${Math.round(amt)}</span>
                        <span className={styles.catPct}>{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Transactions table */}
              <div className={styles.txSection}>
                <h3 className={styles.sectionTitle}>All transactions</h3>
                <div className={styles.txWrap}>
                  <table className={styles.txTable}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {txns.map((t, i) => {
                        const c = CAT_COLORS[t.category] || CAT_COLORS.Other
                        return (
                          <tr key={i}>
                            <td className="mono" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{t.date}</td>
                            <td>{t.description}</td>
                            <td>
                              <span className={styles.catPill} style={{ background: c.dim, color: c.accent }}>
                                {t.category}
                              </span>
                            </td>
                            <td className="mono" style={{ color: 'var(--text)', textAlign: 'right' }}>
                              ${Math.abs(t.amount).toFixed(2)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* INSIGHTS TAB */}
          {tab === 'insights' && (
            <div className={styles.insightsPage}>
              <div className={styles.pageHeader}>
                <div>
                  <h2 className={`${styles.pageTitle} serif`}>AI Insights</h2>
                  <p className={styles.pageSub}>Powered by Groq</p>
                </div>
                {txns.length > 0 && (
                  <button className={styles.analyseBtn} onClick={runAnalysis} disabled={loading}>
                    {loading ? <span className={styles.spinner} /> : '↺ Re-analyse'}
                  </button>
                )}
              </div>

              {loading && (
                <div className={styles.loadingState}>
                  <div className={styles.loadingDots}>
                    <span /><span /><span />
                  </div>
                  <p>Groq is reading your patterns…</p>
                </div>
              )}

              {!loading && insights.length === 0 && (
                <div className={styles.emptyInsights}>
                  {txns.length === 0 ? (
                    <>
                      <span className={styles.emptyIcon}>◎</span>
                      <p>Upload transactions first, then run the AI analysis.</p>
                      <button className={styles.ghostBtn} onClick={() => setTab('upload')}>Go to Import ↑</button>
                    </>
                  ) : (
                    <>
                      <span className={styles.emptyIcon}>◎</span>
                      <p>Your transactions are ready. Run the AI to get insights.</p>
                      <button className={styles.analyseBtn} onClick={runAnalysis}>◎ Analyse with AI</button>
                    </>
                  )}
                </div>
              )}

              {!loading && insights.length > 0 && (
                <div className={styles.insightsGrid}>
                  {insights.map((ins, i) => {
                    const c = INSIGHT_COLORS[ins.color] || INSIGHT_COLORS.blue
                    return (
                      <div key={i} className={styles.insightCard} style={{ background: c.bg, borderColor: c.border }}>
                        <div className={styles.insightHeader}>
                          <span className={styles.insightTag} style={{ background: c.tag, color: c.accent }}>
                            {ins.type}
                          </span>
                          <span className={styles.insightNum} style={{ color: c.accent }}>0{i + 1}</span>
                        </div>
                        <h3 className={`${styles.insightTitle} serif`}>{ins.title}</h3>
                        <p className={styles.insightBody}>{ins.insight}</p>
                        <div className={styles.insightAction}>
                          <span className={styles.actionDot} style={{ background: c.accent }} />
                          <span>{ins.action}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {error && <p className={styles.errorMsg}>{error}</p>}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
