// ── Mock Data ─────────────────────────────────────────────────────────────

const INDICES = [
  { name: 'S&P 500',  symbol: 'SPX',  price:  7165.80, change:  56.80, pct:  0.80 },
  { name: 'NASDAQ',   symbol: 'NDX',  price: 24837.00, change: 390.00, pct:  1.60 },
  { name: '道瓊指數', symbol: 'DJI',  price: 49231.00, change: -98.46, pct: -0.20 },
  { name: '台股加權', symbol: 'TWSE', price: 38933.87, change: 189.43, pct:  0.49 },
];

const COMMODITIES = [
  { name: '布蘭特原油', symbol: 'BRT',    price:  97.60,  unit: '$/桶', change:  1.12, pct:  1.16, icon: '🛢️' },
  { name: '黃金期貨',   symbol: 'GC',     price: 4745.00, unit: '$/oz', change: 16.80, pct:  0.36, icon: '🥇' },
  { name: 'VIX恐慌指數',symbol: 'VIX',    price:  18.71,  unit: '',     change: -0.60, pct: -3.11, icon: '📊' },
  { name: '美元/台幣',   symbol: 'USDTWD', price:  31.48,  unit: '',     change: -0.12, pct: -0.38, icon: '🇹🇼' },
];

const FED_DATA = {
  nextMeeting: { date: '4月28–29日', rateNow: '3.50–3.75%', rateExpected: '3.50–3.75%', cutProb: 11 },
  indicators: [
    { label: 'CPI 通膨率',  unit: '%',  current:  3.3,  prev:  2.4,  forecast:  3.1, forecastDate: '5月12日', better: 'down' },
    { label: '核心 CPI',    unit: '%',  current:  2.6,  prev:  2.5,  forecast:  2.5, forecastDate: '5月12日', better: 'down' },
    { label: 'PCE 通膨',    unit: '%',  current:  2.5,  prev:  2.3,  forecast:  2.7, forecastDate: '4月30日', better: 'down' },
    { label: '失業率',      unit: '%',  current:  4.3,  prev:  4.4,  forecast:  4.4, forecastDate: '5月2日',  better: 'down' },
    { label: 'GDP (QoQ)',   unit: '%',  current:  1.2,  prev:  2.3,  forecast:  1.8, forecastDate: '4月30日', better: 'up'   },
    { label: '非農就業',    unit: '萬', current: 17.8,  prev: 15.1,  forecast: 14.5, forecastDate: '5月2日',  better: 'up'   },
  ],
};

// FOMC 2026 會議行程（自動計算下次會議日期）
const FOMC_2026 = [
  { end: '2026-01-29', display: '1月28–29日' },
  { end: '2026-03-19', display: '3月18–19日' },
  { end: '2026-04-29', display: '4月28–29日' },
  { end: '2026-06-18', display: '6月17–18日' },
  { end: '2026-07-29', display: '7月28–29日' },
  { end: '2026-09-17', display: '9月16–17日' },
  { end: '2026-10-29', display: '10月28–29日' },
  { end: '2026-12-10', display: '12月9–10日' },
];
function nextFOMC() {
  const today = new Date().toISOString().slice(0, 10);
  return FOMC_2026.find(m => m.end >= today) ?? FOMC_2026[FOMC_2026.length - 1];
}

const WATCHLIST = [
  { name: 'Apple',    symbol: 'AAPL', price:  195.67, change:  1.23, pct:  0.63, market: 'US' },
  { name: 'NVIDIA',   symbol: 'NVDA', price:  892.34, change: 15.67, pct:  1.79, market: 'US' },
  { name: 'Microsoft',symbol: 'MSFT', price:  412.56, change: -2.34, pct: -0.56, market: 'US' },
  { name: 'Meta',     symbol: 'META', price:  628.90, change:  8.45, pct:  1.36, market: 'US' },
  { name: '台積電',   symbol: '2330', price:  892.00, change: 12.00, pct:  1.36, market: 'TW' },
  { name: '鴻海',     symbol: '2317', price:  215.00, change: -3.00, pct: -1.38, market: 'TW' },
  { name: '聯發科',   symbol: '2454', price: 1125.00, change: 25.00, pct:  2.27, market: 'TW' },
  { name: '廣達',     symbol: '2382', price:  278.50, change:  6.50, pct:  2.39, market: 'TW' },
];

const NEWS = [
  { tag: 'earnings', label: '財報', title: 'Meta Q1 2026：EPS $5.12 超預期，AI廣告收入年增 28%，盤後漲逾 5%', src: 'Meta Investor Relations', time: '2小時前' },
  { tag: 'ai',       label: 'AI', title: 'NVIDIA Blackwell Ultra (B300) 開始出貨，H100 價差持續收斂，台積電 CoWoS-L 佔有率提升', src: 'Reuters', time: '4小時前' },
  { tag: 'tw',       label: '台股', title: '台積電法說會：2026年全年資本支出維持 380-400億美元，AI 伺服器佔收入比超過 30%', src: '財訊', time: '5小時前' },
  { tag: 'macro',    label: '總經', title: '川普宣布對歐盟汽車加徵25%關稅暫緩至6月，市場情緒短暫回升', src: 'Bloomberg', time: '6小時前' },
  { tag: 'us',       label: '美股', title: 'Alphabet Q1財報優於預期，Cloud部門首度突破150億美元季收入，股價創新高', src: 'CNBC', time: '8小時前' },
  { tag: 'tw',       label: '台股', title: '聯發科 Dimensity 9500 導入AI代理框架，手機端AI本地推論效能提升 3倍', src: '電子時報', time: '昨天' },
  { tag: 'macro',    label: '總經', title: '日本央行維持利率不變，日圓承壓走貶至151附近，亞洲資金流向美元資產', src: 'FT', time: '昨天' },
];

const EARNINGS_CALENDAR = [
  { day: '28', mon: '四月', company: 'Apple (AAPL)',     detail: 'Q2 2026 盤後公告', est: '$1.58', estLabel: '預估EPS' },
  { day: '29', mon: '四月', company: 'Amazon (AMZN)',    detail: 'Q1 2026 盤後公告', est: '$1.29', estLabel: '預估EPS' },
  { day: '30', mon: '四月', company: 'Microsoft (MSFT)', detail: 'Q3 FY2026 盤後', est: '$3.21', estLabel: '預估EPS' },
  { day: '01', mon: '五月', company: '台積電 (2330)',    detail: '2026 Q1法說會',    est: 'NT$14.5', estLabel: '預估EPS' },
  { day: '05', mon: '五月', company: 'NVIDIA (NVDA)',    detail: 'Q1 FY2027 盤後',   est: '$5.81', estLabel: '預估EPS' },
];

// AI Rotation Phases
const AI_PHASES = [
  {
    status: 'done', num: '1', name: 'GPU算力基礎建設', period: '2022–2024',
    desc: 'AI訓練需求爆發，高端GPU供不應求，資料中心瘋狂擴建，台積電CoWoS封裝成為瓶頸。',
    us: 'NVIDIA (NVDA)、AMD、Super Micro (SMCI)',
    tw: '台積電(2330)、世芯-KY(3661)、廣達(2382)、緯穎(6669)',
  },
  {
    status: 'done', num: '2', name: 'HBM高頻寬記憶體', period: '2023–2025',
    desc: '大型語言模型需要海量高頻寬記憶體，HBM3/HBM3E成為AI晶片必備，供給嚴重吃緊。',
    us: 'Micron (MU)、SK Hynix (韓)、Samsung (韓)',
    tw: '南亞科(2408)、華邦電(2344)、創見(2451)、力成(6239)',
  },
  {
    status: 'done', num: '3', name: '光通訊/光模組', period: '2024–2025',
    desc: '資料中心內部頻寬爆炸，800G光模組取代銅纜，1.6T規格進入量產，光通訊概念股輪番大漲。',
    us: 'Coherent (COHR)、Lumentum (LITE)、Ciena (CIEN)、Fabrinet (FN)',
    tw: '光聖(6442)、亨泰光(6570)、上詮(3363)、台光電(2383)',
  },
  {
    status: 'current', num: '4', name: '推論晶片 / 邊緣AI', period: '2025–現在',
    desc: '訓練期轉型為大規模推論部署，低功耗高效率的NPU/推論晶片需求大增，AI功能整合到手機、PC、汽車與IoT。',
    us: 'Qualcomm (QCOM)、ARM Holdings (ARM)、Intel Gaudi、AMD MI350',
    tw: '聯發科(2454)、瑞昱(2379)、晶心科(6533)、創意電子(3443)',
  },
  {
    status: 'predicted', num: '5', name: '下一波題材 (預測)', period: '2026–2027？',
    desc: '三大方向競爭登場，觀察哪個最先引爆市場熱潮。',
    subThemes: [
      {
        icon: '⚡', name: 'AI電力基礎建設',
        desc: '資料中心用電量年增50%+，核能回歸、電力設備、散熱解決方案需求爆增',
        us: 'Constellation Energy (CEG)、Vistra (VST)、Vertiv (VRT)',
        tw: '台達電(2308)、奇鋐(3017)、雙鴻(3268)、士林電機(1503)',
      },
      {
        icon: '🤖', name: '機器人 / 實體AI',
        desc: 'Tesla Optimus量產倒數、Figure AI等人形機器人商業化，帶動零組件供應鏈',
        us: 'Tesla (TSLA)、Symbotic (SYM)、Intuitive Surgical (ISRG)',
        tw: '上銀(2049)、廣隆(1537)、台達電(2308)、鴻海機器人事業群',
      },
      {
        icon: '🧠', name: 'AI Agent / 應用軟體',
        desc: 'AI自動化工作流程成熟，企業SaaS大規模AI轉型，Agentic工具鏈落地',
        us: 'Salesforce (CRM)、ServiceNow (NOW)、Palantir (PLTR)',
        tw: '精誠(6214)、叡揚(6140)、中華電(2412)、iKala',
      },
    ],
  },
];

// Mock fallback dates use ISO timestamps relative to "now" so they always
// render as recent (天前 / 週前) rather than a fixed year-old date.
const _now = Date.now();
const _daysAgo = d => new Date(_now - d * 86400000).toISOString();
const AI_FRONTIER = [
  { logo: '🤖', brand: 'Anthropic / Claude', headline: 'Anthropic 發表 Claude Opus 4.7 與 Haiku 4.5，推理速度與工具使用能力大幅躍進', date: _daysAgo(2) },
  { logo: '🔮', brand: 'OpenAI', headline: 'OpenAI 推出 GPT-5 Turbo，context window 擴大至 2M token，多步驟代理任務表現領先', date: _daysAgo(4) },
  { logo: '♊', brand: 'Google DeepMind', headline: 'Gemini 3 發布：原生多模態推理大幅強化，影片理解與程式碼生成進入產業領先', date: _daysAgo(7) },
  { logo: '🦾', brand: 'Meta AI', headline: 'Llama 5 系列開源，MoE 架構搭配 128K context，企業端本地部署成本再降 40%', date: _daysAgo(10) },
  { logo: '🌐', brand: 'xAI / Grok', headline: 'Grok 4 整合即時搜索與深度研究模式，API 對開發者開放', date: _daysAgo(14) },
];

const GEO_NEWS = [
  { topic: 'trump', icon: '🇺🇸', label: '川普言論', headline: 'Trump announces 25% tariffs on all steel and aluminum imports, threatens secondary tariffs on nations not buying US energy', src: 'Reuters', date: '2026-04-23', impact: 'bear' },
  { topic: 'trump', icon: '🇺🇸', label: '川普言論', headline: 'Trump calls on Fed to cut rates "immediately by at least 1 point", renews attacks on Powell over inflation policy', src: 'Bloomberg', date: '2026-04-22', impact: 'bull' },
  { topic: 'iran',  icon: '⚔️',  label: '美伊局勢', headline: 'US-Iran nuclear talks in Geneva stall as Iran rejects uranium enrichment cap; US warns of consequences', src: 'AP', date: '2026-04-24', impact: 'bear' },
  { topic: 'iran',  icon: '⚔️',  label: '美伊局勢', headline: 'US deploys second carrier strike group to Strait of Hormuz; Iran Revolutionary Guard declares high alert', src: 'FT', date: '2026-04-21', impact: 'bear' },
  { topic: 'trump', icon: '🇺🇸', label: '川普言論', headline: 'Trump signs executive order accelerating critical minerals supply chain, targeting reduced China dependency', src: 'WSJ', date: '2026-04-20', impact: 'neutral' },
];

const TW_STOCKS_PE = [
  { rank: 1,  name: '台積電',  code: '2330', pe: 22.4, peLevel: 'mid', reason: '全球AI晶片製造龍頭，CoWoS持續擴產', sector: '半導體' },
  { rank: 2,  name: '聯發科',  code: '2454', pe: 16.8, peLevel: 'low', reason: '邊緣AI SoC市佔率提升，車用電子高成長', sector: 'IC設計' },
  { rank: 3,  name: '廣達',    code: '2382', pe: 13.2, peLevel: 'low', reason: 'AI伺服器出貨強勁，雲端大廠訂單能見度高', sector: 'ODM' },
  { rank: 4,  name: '鴻海',    code: '2317', pe: 11.5, peLevel: 'low', reason: '電動車轉型加速，AI伺服器佔比持續提升', sector: 'EMS' },
  { rank: 5,  name: '緯穎',    code: '6669', pe: 18.9, peLevel: 'mid', reason: 'CSP客戶AI基建採購爆量，液冷伺服器導入', sector: 'ODM' },
  { rank: 6,  name: '台達電',  code: '2308', pe: 21.3, peLevel: 'mid', reason: '電源管理/散熱雙引擎，資料中心電力成長', sector: '電源零件' },
  { rank: 7,  name: '奇鋐',    code: '3017', pe: 19.7, peLevel: 'mid', reason: 'AI伺服器散熱解決方案，液冷市場份額擴大', sector: '散熱' },
  { rank: 8,  name: '創意電子', code: '3443', pe: 24.1, peLevel: 'mid', reason: 'AI ASIC設計服務需求旺，台積電生態系受益', sector: 'IC設計服務' },
];

// ML Clock: 0=Recovery 1=Expansion 2=Slowdown 3=Contraction
// Current: between Recovery(0) and Expansion(1), angle ~45 degrees
const ML_CLOCK_POSITION = 0.75; // 0-3 clock position (0=12點=Recovery起點)

// ── Config Helpers ────────────────────────────────────────────────────────

// Tracks which data sources are currently live (vs mock)
const LIVE_SOURCES = { watchlist: false, fed: false, market: false, aiFrontier: false, geoNews: false, marketNews: false };

// Returns true only if the key exists in CONFIG and is not a placeholder
function cfg(key) {
  if (typeof CONFIG === 'undefined') return false;
  const v = CONFIG[key];
  return v && String(v).trim() !== '' && !v.includes('your_') && !v.includes('xxxxxxx');
}

// ── Live Data Fetch ───────────────────────────────────────────────────────

const US_NAMES = {
  AAPL:'Apple', NVDA:'NVIDIA', MSFT:'Microsoft', META:'Meta',
  GOOGL:'Alphabet', AMZN:'Amazon', TSLA:'Tesla', AMD:'AMD',
  QCOM:'Qualcomm', INTC:'Intel', ARM:'ARM Holdings',
};

// Short-circuit retries on endpoints that are known to be failing right now
// (free-tier 403 on indices, daily-quota 429 on GNews, broken proxies, etc.).
// Without this, every page-load + refresh re-runs the same doomed requests
// and pollutes the console.
function isFailedRecently(key) {
  try {
    const raw = localStorage.getItem('fail_' + key);
    if (!raw) return false;
    const { ts, ttl } = JSON.parse(raw);
    return ts && Date.now() - ts < ttl;
  } catch (_) { return false; }
}
function markFailed(key, ttlMs) {
  try { localStorage.setItem('fail_' + key, JSON.stringify({ ts: Date.now(), ttl: ttlMs })); } catch (_) {}
}
const FAIL_TTL_LONG  = 24 * 60 * 60 * 1000; // 24h — for plan/permission errors (403/401)
const FAIL_TTL_SHORT = 60 * 60 * 1000;      // 1h  — for transient quota errors (429)

// ── Twelve Data: US stocks + indices + FX in one batch call ──────────────
//
// Free tier: 800 credits/day, 8 credits/min. A batch of N symbols counts as
// N credits but is a single HTTP request. We cap watchlist to 8 symbols so
// the burst stays in budget.
//
// If a particular commodity symbol isn't available on the free tier (some
// futures require Pro), applyTwelveDataQuote() returns false and the slot
// keeps its mock value — no console errors thanks to the fail-cache.
const TD_INDEX_SYMBOLS = ['SPX', 'IXIC', 'DJI'];                         // INDICES[0..2]
const TD_COMMODITY_SYMBOLS = ['BRENT', 'XAU/USD', 'VIX', 'USD/TWD'];     // COMMODITIES[0..3]

async function fetchTwelveDataBatch(symbols) {
  if (!cfg('TWELVE_DATA_API_KEY') || !symbols.length) return {};
  const failKey = 'td_' + symbols.slice().sort().join(',').slice(0, 60);
  if (isFailedRecently(failKey)) return {};
  const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols.join(','))}&apikey=${CONFIG.TWELVE_DATA_API_KEY}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (res.status === 401 || res.status === 403) { markFailed(failKey, FAIL_TTL_LONG); return {}; }
    if (res.status === 429) { markFailed(failKey, FAIL_TTL_SHORT); return {}; }
    if (!res.ok) throw new Error(res.status);
    const j = await res.json();
    // Single-symbol response is flat; multi-symbol is keyed by symbol.
    if (symbols.length === 1) return j.symbol ? { [symbols[0]]: j } : {};
    return j || {};
  } catch (_) { return {}; }
}

function applyTwelveDataQuote(arr, idx, q) {
  if (!q || q.code) return false; // q.code presence = error envelope per symbol
  const close = parseFloat(q.close);
  if (!isFinite(close)) return false;
  arr[idx].price  = close;
  arr[idx].change = +(parseFloat(q.change || 0)).toFixed(2);
  arr[idx].pct    = +(parseFloat(q.percent_change || 0)).toFixed(2);
  return true;
}

// TWSE OpenAPI for TAIEX (加權指數) — official, free, no auth, but does NOT
// send CORS headers, so route through allorigins like FRED. Updates after
// market close (end-of-day data); intraday would need mis.twse.com.tw.
async function fetchTaiexFromTWSE() {
  if (isFailedRecently('twse_taiex')) return false;
  try {
    const target = 'https://openapi.twse.com.tw/v1/exchangeReport/MI_INDEX';
    const url = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(target);
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) { markFailed('twse_taiex', FAIL_TTL_SHORT); return false; }
    const arr = await res.json();
    const taiex = arr.find(r => r.Index === '發行量加權股價指數' || (r.Index || '').includes('加權股價'));
    if (!taiex) return false;
    const close = parseFloat(String(taiex.ClosingIndex).replace(/,/g, ''));
    const pts = parseFloat(String(taiex.ChangePoint).replace(/,/g, ''));
    const pct = parseFloat(taiex.ChangePercentage);
    const sign = taiex.Change === '▲' ? 1 : (taiex.Change === '▼' ? -1 : 0);
    if (!isFinite(close)) return false;
    INDICES[3].price  = close;
    INDICES[3].change = +(sign * pts).toFixed(2);
    INDICES[3].pct    = +(sign * pct).toFixed(2);
    return true;
  } catch (_) {
    markFailed('twse_taiex', FAIL_TTL_SHORT); // proxy/network failure — don't hammer
    return false;
  }
}

async function fetchFugleQuote(symbol) {
  const failKey = `fugle_${symbol}`;
  if (isFailedRecently(failKey)) return null;
  const res = await fetch(
    `https://api.fugle.tw/marketdata/v1.0/stock/intraday/quote/${symbol}`,
    { headers: { 'X-API-KEY': CONFIG.FUGLE_API_KEY }, signal: AbortSignal.timeout(8000) }
  );
  if (res.status === 404 || res.status === 403) {
    markFailed(failKey, FAIL_TTL_LONG);
    return null;
  }
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

// FRED API does not send CORS headers, so route browser requests through a
// public CORS proxy. allorigins.win is more reliable than corsproxy.io for
// unauthenticated traffic as of 2026.
const FRED_CORS_PROXY = 'https://api.allorigins.win/raw?url=';
async function fetchFredSingle(seriesId, extraParams = '') {
  if (isFailedRecently(`fred_${seriesId}`)) throw new Error('fred-fail-cached');
  const target = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&sort_order=desc&limit=2&file_type=json${extraParams}&api_key=${CONFIG.FRED_API_KEY}`;
  const url = FRED_CORS_PROXY + encodeURIComponent(target);
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) {
    // Cache failure so we don't hammer the proxy on every page-load
    markFailed(`fred_${seriesId}`, res.status === 403 || res.status === 401 ? FAIL_TTL_LONG : FAIL_TTL_SHORT);
    throw new Error(res.status);
  }
  const j = await res.json();
  return (j.observations || []).filter(o => o.value !== '.');
}

async function fetchFredData() {
  if (!cfg('FRED_API_KEY')) return;
  try {
    const [rateL, rateU, cpi, coreCpi, pce, unemp, gdp, nfp] = await Promise.all([
      fetchFredSingle('DFEDTARL'),
      fetchFredSingle('DFEDTARU'),
      fetchFredSingle('CPIAUCSL', '&units=pc1'),
      fetchFredSingle('CPILFESL', '&units=pc1'),
      fetchFredSingle('PCEPILFE', '&units=pc1'),
      fetchFredSingle('UNRATE'),
      fetchFredSingle('A191RL1Q225SBEA'),
      fetchFredSingle('PAYEMS', '&units=chg'),
    ]);

    if (rateL[0] && rateU[0]) {
      const lo = parseFloat(rateL[0].value), hi = parseFloat(rateU[0].value);
      FED_DATA.nextMeeting.rateNow = `${lo.toFixed(2)}–${hi.toFixed(2)}%`;
    }

    const series = [cpi, coreCpi, pce, unemp, gdp, nfp];
    const scales  = [  1,      1,   1,    1,   1, 0.1];
    series.forEach((obs, i) => {
      if (obs[0]) FED_DATA.indicators[i].current = +(parseFloat(obs[0].value) * scales[i]).toFixed(1);
      if (obs[1]) FED_DATA.indicators[i].prev    = +(parseFloat(obs[1].value) * scales[i]).toFixed(1);
    });

    LIVE_SOURCES.fed = true;
  } catch (_) {}
}

async function fetchLiveMarketData() {
  let hits = 0;
  // TAIEX 加權指數 via TWSE OpenAPI (no key needed)
  if (await fetchTaiexFromTWSE()) hits++;
  // S&P / NASDAQ / DJI / VIX / Brent / Gold / USD-TWD in one Twelve Data batch
  if (cfg('TWELVE_DATA_API_KEY')) {
    const allSyms = [...TD_INDEX_SYMBOLS, ...TD_COMMODITY_SYMBOLS];
    const quotes = await fetchTwelveDataBatch(allSyms);
    TD_INDEX_SYMBOLS.forEach((s, i) => { if (applyTwelveDataQuote(INDICES, i, quotes[s])) hits++; });
    TD_COMMODITY_SYMBOLS.forEach((s, i) => { if (applyTwelveDataQuote(COMMODITIES, i, quotes[s])) hits++; });
  }
  if (hits) LIVE_SOURCES.market = true;
}

function detectAIBrand(source, title) {
  const t = (source + ' ' + title).toLowerCase();
  // Require an AI-context word to avoid false positives (e.g. "llama" the animal)
  const aiCtx = /\b(ai|llm|model|chatbot|gpt|launch|release|announce|update)\b/.test(t);
  if (t.includes('anthropic') || /\bclaude\b/.test(t)) return { logo: '🤖', brand: 'Anthropic / Claude' };
  if (t.includes('openai') || /\bgpt-?\d/.test(t) || t.includes('chatgpt')) return { logo: '🔮', brand: 'OpenAI' };
  if (t.includes('deepmind') || t.includes('gemini') || t.includes('google ai')) return { logo: '♊', brand: 'Google DeepMind' };
  if ((t.includes('llama') && aiCtx) || t.includes('meta ai')) return { logo: '🦾', brand: 'Meta AI' };
  if ((/\bgrok\b/.test(t) && aiCtx) || t.includes(' xai') || t.includes('x.ai')) return { logo: '🌐', brand: 'xAI / Grok' };
  if (t.includes('mistral') && aiCtx) return { logo: '🌊', brand: 'Mistral' };
  return null;
}

function relativeDate(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
  if (h < 1) return '剛剛';
  if (h < 24) return `${h}小時前`;
  if (d < 7) return `${d}天前`;
  if (d < 30) return `${Math.floor(d / 7)}週前`;
  if (d < 365) return `${Math.floor(d / 30)}個月前`;
  return `${Math.floor(d / 365)}年前`;
}

// All three GNews calls share the same daily quota (free tier = 100/day).
// Once one returns 429, the others will too — share a single fail-cache key
// so a single 429 silences all GNews calls until the quota resets.
const GNEWS_QUOTA_FAIL_KEY = 'gnews_quota';

async function fetchAIFrontierNews() {
  if (!cfg('GNEWS_API_KEY')) return;
  if (isFailedRecently(GNEWS_QUOTA_FAIL_KEY)) return;

  try {
    const cached = localStorage.getItem(AI_NEWS_CACHE_KEY);
    if (cached) {
      const { items, ts } = JSON.parse(cached);
      if (Date.now() - ts < AI_NEWS_CACHE_TTL) {
        AI_FRONTIER.length = 0;
        AI_FRONTIER.push(...items);
        LIVE_SOURCES.aiFrontier = true;
        return;
      }
    }
  } catch (_) {}

  try {
    // Only pull articles from the last 30 days so we don't surface year-old results
    const fromIso = new Date(Date.now() - 30 * 86400000).toISOString();
    const q = encodeURIComponent('Anthropic OR OpenAI OR ChatGPT OR "Google DeepMind" OR Gemini OR Claude OR "Meta AI" OR Llama OR xAI OR Grok OR Mistral');
    const url = `https://gnews.io/api/v4/search?q=${q}&lang=en&sortby=publishedAt&from=${encodeURIComponent(fromIso)}&max=30&apikey=${CONFIG.GNEWS_API_KEY}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (res.status === 429) { markFailed(GNEWS_QUOTA_FAIL_KEY, FAIL_TTL_SHORT); return; }
    if (!res.ok) throw new Error(res.status);
    const j = await res.json();
    // Defensive: drop any articles older than 60 days even if API returned them
    const cutoff = Date.now() - 60 * 86400000;
    const articles = (j.articles || []).filter(a => a.title && a.url && a.publishedAt && new Date(a.publishedAt).getTime() > cutoff);

    const seen = new Set();
    const items = [];
    for (const a of articles) {
      const brand = detectAIBrand(a.source?.name || '', a.title);
      if (!brand) continue;
      if (seen.has(brand.brand)) continue;
      seen.add(brand.brand);
      items.push({ logo: brand.logo, brand: brand.brand, headline: a.title, date: a.publishedAt, url: a.url });
      if (items.length >= 5) break;
    }

    if (items.length) {
      try { localStorage.setItem(AI_NEWS_CACHE_KEY, JSON.stringify({ items, ts: Date.now() })); } catch (_) {}
      AI_FRONTIER.length = 0;
      AI_FRONTIER.push(...items);
      LIVE_SOURCES.aiFrontier = true;
    }
  } catch (_) {
    // CORS-blocked 429s land here without a visible status — assume quota
    markFailed(GNEWS_QUOTA_FAIL_KEY, FAIL_TTL_SHORT);
  }
}

const GEO_NEWS_CACHE_KEY = 'geo_news_v3';
const GEO_NEWS_CACHE_TTL = 20 * 60 * 1000; // 20 min

function detectGeoTopic(title) {
  const t = title.toLowerCase();
  if (t.includes('trump') || t.includes('donald')) return { topic: 'trump', icon: '🇺🇸', label: '川普言論' };
  if (t.includes('iran') || t.includes('hormuz') || t.includes('tehran') || t.includes('nuclear deal') || t.includes('middle east')) return { topic: 'iran', icon: '⚔️', label: '美伊局勢' };
  return null;
}

// Heuristic: classify a geopolitical/Trump headline as bullish / bearish for
// risk assets. Bear signals (escalation / tariffs / rate hikes) take priority
// over bull signals when both are present.
function detectImpact(title) {
  const t = title.toLowerCase();
  const bearPats = [
    /tariff/, /sanction/, /\bwar\b/, /conflict/, /escalat/, /threat/, /\battack/,
    /\bstrike\b/, /deploy.*(troop|carrier|missile|forces)/, /\bban\b/, /restrict/,
    /crisis/, /recession/, /rate hike/, /raises rate/, /hike rates/, /invasion/,
    /retaliat/, /cyber.*attack/, /shut down/, /reject/, /stall/, /collapse/,
    /high alert/, /military/,
  ];
  const bullPats = [
    /rate cut/, /cuts? rates?/, /\bease\b/, /easing/, /\bdeal\b/, /agreement/,
    /ceasefire/, /\bpeace\b/, /\bsettle/, /lift sanction/, /recovery/,
    /talks resume/, /deescalat/, /de-escalat/, /\btruce\b/, /breakthrough/,
    /accord/, /resumes? trade/,
  ];
  if (bearPats.some(p => p.test(t))) return 'bear';
  if (bullPats.some(p => p.test(t))) return 'bull';
  return 'neutral';
}

const IMPACT_LABEL = { bull: '利多', bear: '利空', neutral: '中性' };

async function fetchGeoNews() {
  if (!cfg('GNEWS_API_KEY')) return;
  if (isFailedRecently(GNEWS_QUOTA_FAIL_KEY)) return;

  try {
    const cached = localStorage.getItem(GEO_NEWS_CACHE_KEY);
    if (cached) {
      const { items, ts } = JSON.parse(cached);
      if (Date.now() - ts < GEO_NEWS_CACHE_TTL) {
        GEO_NEWS.length = 0;
        GEO_NEWS.push(...items);
        LIVE_SOURCES.geoNews = true;
        return;
      }
    }
  } catch (_) {}

  try {
    const fromIso = new Date(Date.now() - 14 * 86400000).toISOString();
    const q = encodeURIComponent('Trump OR Iran OR "Middle East" OR "US Iran"');
    const url = `https://gnews.io/api/v4/search?q=${q}&lang=en&sortby=publishedAt&from=${encodeURIComponent(fromIso)}&max=20&apikey=${CONFIG.GNEWS_API_KEY}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (res.status === 429) { markFailed(GNEWS_QUOTA_FAIL_KEY, FAIL_TTL_SHORT); return; }
    if (!res.ok) throw new Error(res.status);
    const j = await res.json();

    const items = [];
    for (const a of (j.articles || [])) {
      if (!a.title || !a.url || !a.publishedAt) continue;
      const cat = detectGeoTopic(a.title);
      if (!cat) continue;
      items.push({ topic: cat.topic, icon: cat.icon, label: cat.label, headline: a.title, src: a.source?.name || '', date: a.publishedAt, url: a.url, impact: detectImpact(a.title) });
      if (items.length >= 5) break;
    }

    if (items.length) {
      try { localStorage.setItem(GEO_NEWS_CACHE_KEY, JSON.stringify({ items, ts: Date.now() })); } catch (_) {}
      GEO_NEWS.length = 0;
      GEO_NEWS.push(...items);
      LIVE_SOURCES.geoNews = true;
    }
  } catch (_) {
    markFailed(GNEWS_QUOTA_FAIL_KEY, FAIL_TTL_SHORT);
  }
}

const MARKET_NEWS_CACHE_KEY = 'market_news_v1';
const MARKET_NEWS_CACHE_TTL = 20 * 60 * 1000; // 20 min

function categorizeMarketNews(title, source) {
  const t = (title + ' ' + source).toLowerCase();
  if (t.includes('earnings') || t.includes('eps') || t.includes('quarterly') || /q[1-4]\b/.test(t)) return { tag: 'earnings', label: '財報' };
  if (t.includes('chatgpt') || t.includes('openai') || t.includes('anthropic') || t.includes('nvidia') || t.includes('artificial intel') || t.includes(' llm') || t.includes(' ai ')) return { tag: 'ai', label: 'AI' };
  if (t.includes('taiwan') || t.includes('tsmc') || t.includes('mediatek') || t.includes('foxconn') || t.includes('台積') || t.includes('台股')) return { tag: 'tw', label: '台股' };
  if (t.includes('fed') || t.includes('inflation') || t.includes('cpi') || t.includes('powell') || t.includes('rate cut') || t.includes('treasury') || t.includes('jobs report')) return { tag: 'macro', label: '總經' };
  return { tag: 'us', label: '美股' };
}

async function fetchMarketNews() {
  if (!cfg('GNEWS_API_KEY')) return;
  if (isFailedRecently(GNEWS_QUOTA_FAIL_KEY)) return;

  try {
    const cached = localStorage.getItem(MARKET_NEWS_CACHE_KEY);
    if (cached) {
      const { items, ts } = JSON.parse(cached);
      if (Date.now() - ts < MARKET_NEWS_CACHE_TTL) {
        NEWS.length = 0;
        NEWS.push(...items);
        LIVE_SOURCES.marketNews = true;
        return;
      }
    }
  } catch (_) {}

  try {
    const q = encodeURIComponent('"stock market" OR earnings OR "Wall Street" OR Nasdaq OR "S&P 500" OR TSMC OR "Federal Reserve"');
    const url = `https://gnews.io/api/v4/search?q=${q}&lang=en&sortby=publishedAt&max=10&apikey=${CONFIG.GNEWS_API_KEY}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (res.status === 429) { markFailed(GNEWS_QUOTA_FAIL_KEY, FAIL_TTL_SHORT); return; }
    if (!res.ok) throw new Error(res.status);
    const j = await res.json();

    const items = [];
    for (const a of (j.articles || [])) {
      if (!a.title || !a.url) continue;
      const cat = categorizeMarketNews(a.title, a.source?.name || '');
      items.push({ tag: cat.tag, label: cat.label, title: a.title, src: a.source?.name || '', time: relativeDate(a.publishedAt), url: a.url });
      if (items.length >= 5) break;
    }

    if (items.length) {
      try { localStorage.setItem(MARKET_NEWS_CACHE_KEY, JSON.stringify({ items, ts: Date.now() })); } catch (_) {}
      NEWS.length = 0;
      NEWS.push(...items);
      LIVE_SOURCES.marketNews = true;
    }
  } catch (_) {
    markFailed(GNEWS_QUOTA_FAIL_KEY, FAIL_TTL_SHORT);
  }
}

async function fetchAndUpdateLiveData() {
  const tasks = [];

  if (cfg('TWELVE_DATA_API_KEY')) {
    // Twelve Data free tier: 8 credits/min — cap watchlist to 8 symbols and
    // fetch them all in a single batch HTTP call. Dedupe to handle config
    // typos like duplicate VRT.
    const rawSyms = CONFIG.WATCHLIST_US ?? ['AAPL', 'NVDA', 'MSFT', 'META'];
    const syms = [...new Set(rawSyms)].slice(0, 8);
    tasks.push(
      fetchTwelveDataBatch(syms).then(quotes => {
        const live = syms.map(s => {
          const q = quotes[s];
          if (!q || q.code) return null;
          const close = parseFloat(q.close);
          if (!isFinite(close)) return null;
          return {
            name: US_NAMES[s] || q.name || s,
            symbol: s,
            price: close,
            change: +(parseFloat(q.change || 0)).toFixed(2),
            pct:    +(parseFloat(q.percent_change || 0)).toFixed(2),
            market: 'US',
          };
        }).filter(Boolean);
        if (live.length) {
          const twOnly = WATCHLIST.filter(w => w.market === 'TW');
          WATCHLIST.length = 0;
          WATCHLIST.push(...live, ...twOnly);
          LIVE_SOURCES.watchlist = true;
        }
      })
    );
  }

  if (cfg('FUGLE_API_KEY')) {
    const rawSyms = CONFIG.WATCHLIST_TW ?? ['2330', '2317', '2454', '2382'];
    const syms = [...new Set(rawSyms)].slice(0, 8);
    tasks.push(
      Promise.allSettled(syms.map(s => fetchFugleQuote(s))).then(results => {
        const live = results.map((r, i) => {
          if (r.status !== 'fulfilled' || !r.value) return null;
          const d = r.value;
          return { name: d.name || syms[i], symbol: syms[i], price: d.closePrice ?? d.lastPrice ?? 0, change: d.change ?? 0, pct: d.changePercent ?? 0, market: 'TW' };
        }).filter(Boolean);
        if (live.length) {
          const usOnly = WATCHLIST.filter(w => w.market === 'US');
          WATCHLIST.length = 0;
          WATCHLIST.push(...usOnly, ...live);
          LIVE_SOURCES.watchlist = true;
        }
      })
    );
  }

  tasks.push(fetchFredData());
  tasks.push(fetchLiveMarketData());
  tasks.push(fetchAIFrontierNews());
  tasks.push(fetchGeoNews());
  tasks.push(fetchMarketNews());
  await Promise.allSettled(tasks);
}

const RETAIL_DATA = {
  margin: { val: '3,842億', raw: 72, label: '融資餘額', note: '近3個月高點' },
  short:  { val: '1,234億', raw: 45, label: '融券餘額', note: '空頭部位偏低' },
  vol:    { val: '+38%',    raw: 68, label: '成交量 vs 均量', note: '高於90日均量' },
  account:{ val: '12,800', raw: 55, label: '本週新開戶數', note: '相對高但非極端' },
};

// ── Utilities ──────────────────────────────────────────────────────────────

function fmtChange(pct, v) {
  const sign = v >= 0 ? '+' : '';
  const cls = v >= 0 ? 'up' : 'down';
  return `<span class="${cls}">${sign}${pct.toFixed(2)}%</span>`;
}

function fmtPrice(n) {
  if (n >= 1000) return n.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toFixed(2);
}

function now() {
  return new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
}

// ── Render: Overview ──────────────────────────────────────────────────────

function renderOverview() {
  const indices = INDICES.map(d => `
    <div class="price-cell">
      <div class="label">${d.name}</div>
      <div class="value">${fmtPrice(d.price)}</div>
      <div class="change">${fmtChange(d.pct, d.change)}</div>
    </div>`).join('');

  const commodities = COMMODITIES.map(d => `
    <div class="commodity-row">
      <div class="commodity-left">
        <div class="commodity-icon">${d.icon}</div>
        <div>
          <div class="commodity-name">${d.name}</div>
          ${d.unit ? `<div class="commodity-unit">${d.unit}</div>` : ''}
        </div>
      </div>
      <div class="commodity-right">
        <div class="commodity-price ${d.change >= 0 ? 'up' : 'down'}">${fmtPrice(d.price)}</div>
        <div class="commodity-change ${d.change >= 0 ? 'up' : 'down'}">${d.change >= 0 ? '+' : ''}${d.pct.toFixed(2)}%</div>
      </div>
    </div>`).join('');

  const geoSlice = GEO_NEWS.slice(0, 5);
  const geoRows = geoSlice.map((g, i) => {
    const tag = g.url ? 'a' : 'div';
    const href = g.url ? ` href="${g.url}" target="_blank" rel="noopener"` : '';
    const style = i >= 3 ? ' style="display:none"' : '';
    const displayDate = /^\d{4}-\d{2}-\d{2}/.test(g.date) ? relativeDate(g.date) : g.date;
    const impact = g.impact || 'neutral';
    const impactBadge = `<span class="impact-badge impact-${impact}">${IMPACT_LABEL[impact]}</span>`;
    return `<${tag} class="news-item"${href}${style}>
      <div><span class="news-tag tag-${g.topic}">${g.icon} ${g.label}</span>${impactBadge}</div>
      <div class="news-headline">${g.headline}</div>
      <div class="news-meta">${g.src} · ${displayDate}</div>
    </${tag}>`;
  }).join('');
  const geoBtn = geoSlice.length > 3 ? `<button class="expand-btn" onclick="toggleExpand(this, ${geoSlice.length})">展開全部 ${geoSlice.length} 筆 ▼</button>` : '';

  const newsSlice = NEWS.slice(0, 5);
  const topNews = newsSlice.map((n, i) => {
    const tag = n.url ? 'a' : 'div';
    const href = n.url ? ` href="${n.url}" target="_blank" rel="noopener"` : '';
    const style = i >= 3 ? ' style="display:none"' : '';
    return `<${tag} class="news-item"${href}${style}>
      <div><span class="news-tag tag-${n.tag}">${n.label}</span></div>
      <div class="news-headline">${n.title}</div>
      <div class="news-meta">${n.src} · ${n.time}</div>
    </${tag}>`;
  }).join('');
  const newsBtn = newsSlice.length > 3 ? `<button class="expand-btn" onclick="toggleExpand(this, ${newsSlice.length})">展開全部 ${newsSlice.length} 筆 ▼</button>` : '';

  const fedMtg = FED_DATA.nextMeeting;
  const cutProbColor = fedMtg.cutProb >= 50
    ? (fedMtg.cutProb >= 70 ? 'var(--green)' : 'var(--yellow)')
    : (fedMtg.cutProb <= 20 ? 'var(--text-muted)' : 'var(--yellow)');
  const fedRateBox = `
    <div class="fed-rate-box">
      <div class="fed-rate-col">
        <div class="fed-rate-label">當前利率</div>
        <div class="fed-rate-val">${fedMtg.rateNow}</div>
      </div>
      <div class="fed-rate-divider"></div>
      <div class="fed-rate-col">
        <div class="fed-rate-label">下次 FOMC</div>
        <div class="fed-rate-val fed-rate-val-sm">${nextFOMC().display}</div>
        <div class="fed-rate-sub">預期 ${fedMtg.rateExpected}</div>
      </div>
      <div class="fed-rate-divider"></div>
      <div class="fed-rate-col">
        <div class="fed-rate-label">${fedMtg.cutProb >= 50 ? '降息機率' : '維持機率'}</div>
        <div class="fed-rate-val" style="color:${cutProbColor}">${fedMtg.cutProb >= 50 ? fedMtg.cutProb : 100 - fedMtg.cutProb}%</div>
        <div class="fed-rate-sub" style="color:${cutProbColor}">CME FedWatch</div>
      </div>
    </div>`;
  const fedIndRows = FED_DATA.indicators.map(ind => {
    const prevDiff = ind.current - ind.prev;
    const prevArrow = prevDiff > 0 ? '▲' : prevDiff < 0 ? '▼' : '—';
    const prevGood = (ind.better === 'down' && prevDiff <= 0) || (ind.better === 'up' && prevDiff >= 0);
    const prevCls = prevGood ? 'up' : 'down';
    const fcstDiff = ind.forecast - ind.current;
    const fcstArrow = fcstDiff > 0 ? '▲' : fcstDiff < 0 ? '▼' : '—';
    const fcstGood = (ind.better === 'down' && fcstDiff <= 0) || (ind.better === 'up' && fcstDiff >= 0);
    const fcstCls = fcstGood ? 'up' : 'down';
    const fmtAbs = v => v.toFixed(1) + ind.unit;
    return `
      <div class="fed-ind-row">
        <div class="fed-ind-main">
          <div class="fed-ind-name">${ind.label}</div>
          <div class="fed-ind-current">${fmtAbs(ind.current)}</div>
        </div>
        <div class="fed-ind-sub">
          <span class="${prevCls}">${prevArrow} 前值 ${fmtAbs(ind.prev)}</span>
          <span class="fed-ind-sep">·</span>
          <span class="${fcstCls}">預測 ${fcstArrow} ${fmtAbs(ind.forecast)}</span>
          <span class="fed-ind-date">${ind.forecastDate}</span>
        </div>
      </div>`;
  }).join('');

  const liveItems = [
    LIVE_SOURCES.watchlist  && '自選股（Twelve Data / Fugle）',
    LIVE_SOURCES.market     && '指數 & 原物料（Twelve Data + TWSE）',
    LIVE_SOURCES.fed        && '總經指標（FRED）',
    LIVE_SOURCES.aiFrontier && 'AI前沿消息（GNews）',
    LIVE_SOURCES.geoNews    && '地緣政治（GNews）',
    LIVE_SOURCES.marketNews && '市場新聞（GNews）',
  ].filter(Boolean);
  const liveBanner = liveItems.length
    ? `<div class="info-banner" style="background:var(--green-bg);border-color:rgba(63,185,80,.3);color:var(--green)">✅ 即時資料：${liveItems.join('、')}</div>`
    : `<div class="info-banner">📡 模擬資料 — 在 <strong>config.js</strong> 填入 API Key 可取得即時報價與總經數據</div>`;

  return `
    ${liveBanner}
    <div class="card">
      <div class="card-title"><span class="dot"></span>主要指數</div>
      <div class="price-grid">${indices}</div>
    </div>
    <div class="card">
      <div class="card-title"><span class="dot" style="background:var(--blue)"></span>聯準會 & 總經指標</div>
      ${fedRateBox}
      ${fedIndRows}
    </div>
    <div class="card">
      <div class="card-title"><span class="dot" style="background:var(--yellow)"></span>原物料 & 避險指標</div>
      ${commodities}
    </div>
    <div class="card">
      <div class="card-title"><span class="dot" style="background:var(--red)"></span>地緣政治 & 川普言論</div>
      <div class="expandable">${geoRows}</div>
      ${geoBtn}
    </div>
    <div class="card">
      <div class="card-title"><span class="dot" style="background:var(--green)"></span>今日快訊</div>
      <div class="expandable">${topNews}</div>
      ${newsBtn}
    </div>`;
}

// ── Render: News ──────────────────────────────────────────────────────────

function renderNews() {
  const allSlice = NEWS.slice(0, 5);
  const allNews = allSlice.map((n, i) => {
    const tag = n.url ? 'a' : 'div';
    const href = n.url ? ` href="${n.url}" target="_blank" rel="noopener"` : '';
    const style = i >= 3 ? ' style="display:none"' : '';
    return `<${tag} class="news-item"${href}${style}>
      <div><span class="news-tag tag-${n.tag}">${n.label}</span></div>
      <div class="news-headline">${n.title}</div>
      <div class="news-meta">${n.src} · ${n.time}</div>
    </${tag}>`;
  }).join('');
  const allNewsBtn = allSlice.length > 3 ? `<button class="expand-btn" onclick="toggleExpand(this, ${allSlice.length})">展開全部 ${allSlice.length} 筆 ▼</button>` : '';

  const watchItems = WATCHLIST.map(s => `
    <div class="price-cell">
      <div class="label"><span class="news-tag tag-${s.market === 'US' ? 'us' : 'tw'}" style="margin-bottom:0">${s.symbol}</span> ${s.name}</div>
      <div class="value">${fmtPrice(s.price)}</div>
      <div class="change">${fmtChange(s.pct, s.change)}</div>
    </div>`).join('');

  const earnings = EARNINGS_CALENDAR.map(e => `
    <div class="earnings-item">
      <div class="earnings-date">
        <div class="e-day">${e.day}</div>
        <div class="e-mon">${e.mon}</div>
      </div>
      <div class="earnings-info">
        <div class="earnings-company">${e.company}</div>
        <div class="earnings-detail">${e.detail}</div>
      </div>
      <div class="earnings-est">
        <div class="est-label">${e.estLabel}</div>
        <div class="est-val">${e.est}</div>
      </div>
    </div>`).join('');

  return `
    <div class="card">
      <div class="card-title"><span class="dot" style="background:var(--purple)"></span>自選股動態</div>
      <div class="price-grid">${watchItems}</div>
    </div>
    <div class="card">
      <div class="card-title"><span class="dot" style="background:var(--orange)"></span>財報行事曆</div>
      ${earnings}
    </div>
    <div class="card">
      <div class="card-title"><span class="dot" style="background:var(--green)"></span>市場要聞</div>
      <div class="expandable">${allNews}</div>
      ${allNewsBtn}
    </div>`;
}

// ── Render: Cycle ─────────────────────────────────────────────────────────

function renderCycle() {
  // ML Clock SVG
  const cx = 110, cy = 110, r = 90;
  const phases = [
    { label: '復甦', color: '#3fb950', assets: '股票↑' },
    { label: '擴張', color: '#f0883e', assets: '原物料↑' },
    { label: '過熱', color: '#f85149', assets: '債券↑' },
    { label: '衰退', color: '#8b949e', assets: '現金↑' },
  ];
  // Draw 4 arcs (quadrants): 12→3, 3→6, 6→9, 9→12 = -90→0→90→180→270
  const phaseArcs = phases.map((p, i) => {
    const startDeg = -90 + i * 90;
    const endDeg   = startDeg + 90;
    const s = startDeg * Math.PI / 180;
    const e = endDeg * Math.PI / 180;
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    const lx = cx + (r * 0.62) * Math.cos((s + e) / 2);
    const ly = cy + (r * 0.62) * Math.sin((s + e) / 2);
    const lx2 = cx + (r * 0.72) * Math.cos((s + e) / 2);
    const ly2 = cy + (r * 0.76) * Math.sin((s + e) / 2);
    return `
      <path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z"
            fill="${p.color}" fill-opacity="0.15" stroke="${p.color}" stroke-opacity="0.4" stroke-width="1"/>
      <text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle"
            font-size="12" font-weight="800" fill="${p.color}">${p.label}</text>
      <text x="${lx2}" y="${ly2 + 14}" text-anchor="middle" dominant-baseline="middle"
            font-size="9" fill="${p.color}" opacity="0.8">${p.assets}</text>`;
  }).join('');

  // Clock hand (needle) — current position ~45° from recovery start (between recovery and expansion)
  const needleDeg = (-90 + ML_CLOCK_POSITION * 90) * Math.PI / 180;
  const nx = cx + (r * 0.75) * Math.cos(needleDeg);
  const ny = cy + (r * 0.75) * Math.sin(needleDeg);

  // Clock ticks
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (-90 + i * 30) * Math.PI / 180;
    const r1 = 86, r2 = 92;
    return `<line x1="${cx + r1 * Math.cos(a)}" y1="${cy + r1 * Math.sin(a)}"
                  x2="${cx + r2 * Math.cos(a)}" y2="${cy + r2 * Math.sin(a)}"
                  stroke="#30363d" stroke-width="2"/>`;
  }).join('');

  const clockSvg = `
    <svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
      ${phaseArcs}
      ${ticks}
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#30363d" stroke-width="1.5"/>
      <circle cx="${cx}" cy="${cy}" r="6" fill="#8b949e"/>
      <line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}"
            stroke="#58a6ff" stroke-width="3" stroke-linecap="round"/>
      <circle cx="${nx}" cy="${ny}" r="4" fill="#58a6ff"/>
    </svg>`;

  const mlLegend = phases.map(p => `
    <div class="ml-legend-item">
      <div class="ml-dot" style="background:${p.color}"></div>
      <div>
        <div class="phase-name" style="color:${p.color}">${p.label}</div>
        <div class="phase-assets">${p.assets} 表現最佳</div>
      </div>
    </div>`).join('');

  // Heat gauge SVG (semi-circle)
  const heatScore = 58; // 0-100, current moderate-warm
  const heatColor = heatScore > 75 ? '#f85149' : heatScore > 50 ? '#d29922' : '#3fb950';
  const heatLabel = heatScore > 75 ? '偏熱' : heatScore > 50 ? '中性偏暖' : '正常';
  // Semi-circle: from 180° to 0° (left to right) = -180 to 0
  const heatAngle = -180 + (heatScore / 100) * 180;
  const ha = heatAngle * Math.PI / 180;
  const gx = 100, gy = 95, gr = 75;
  const nsx = gx + gr * Math.cos(ha);
  const nsy = gy + gr * Math.sin(ha);

  const gaugeSvg = `
    <svg viewBox="0 0 200 105" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#3fb950"/>
          <stop offset="50%"  stop-color="#d29922"/>
          <stop offset="100%" stop-color="#f85149"/>
        </linearGradient>
      </defs>
      <path d="M ${gx - gr} ${gy} A ${gr} ${gr} 0 0 1 ${gx + gr} ${gy}" fill="none" stroke="#30363d" stroke-width="12" stroke-linecap="round"/>
      <path d="M ${gx - gr} ${gy} A ${gr} ${gr} 0 0 1 ${gx + gr} ${gy}" fill="none" stroke="url(#gaugeGrad)" stroke-width="12" stroke-linecap="round" opacity="0.7"/>
      <line x1="${gx}" y1="${gy}" x2="${nsx}" y2="${nsy}" stroke="${heatColor}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="${gx}" cy="${gy}" r="5" fill="${heatColor}"/>
    </svg>`;

  const retailRows = Object.values(RETAIL_DATA).map(d => `
    <div class="retail-cell">
      <div class="r-label">${d.label}</div>
      <div class="r-value">${d.val}</div>
      <div class="r-bar-wrap"><div class="r-bar" style="width:${d.raw}%;background:${d.raw > 70 ? 'var(--red)' : d.raw > 50 ? 'var(--yellow)' : 'var(--green)'}"></div></div>
      <div style="font-size:.65rem;color:var(--text-muted);margin-top:2px">${d.note}</div>
    </div>`).join('');

  const cycleAnalysis = [
    { icon: '🇺🇸', label: '美股週期位置', desc: '聯準會降息週期尾聲，GDP成長趨緩但就業穩健，企業獲利AI題材支撐，S&P500 本益比約22x — 偏貴但尚未泡沫化。位於擴張期後段。' },
    { icon: '🇹🇼', label: '台股週期位置', desc: '受關稅戰影響後逐步回穩，外資持續回補半導體產業，台積電法說確認AI需求不墜。本益比約17x，相對合理偏便宜。位於復甦進入擴張期。' },
    { icon: '📈', label: '週期預測', desc: '未來6–12個月關注：聯準會政策轉向信號、美中/美歐貿易協商進展、AI資本支出是否持續。若VIX持續低於20且成交量縮，要留意過熱修正風險。' },
  ];

  const cycleRows = cycleAnalysis.map(c => `
    <div class="cycle-row">
      <div class="cycle-icon">${c.icon}</div>
      <div>
        <div class="cycle-label">${c.label}</div>
        <div class="cycle-desc">${c.desc}</div>
      </div>
    </div>`).join('');

  return `
    <div class="card">
      <div class="card-title"><span class="dot" style="background:var(--orange)"></span>美林投資時鐘</div>
      <div class="ml-clock-wrap">
        <div class="ml-clock-svg-wrap">${clockSvg}</div>
        <div class="ml-current-label">📍 目前位置：<strong>復甦 → 擴張過渡期</strong>（股票 & 原物料輪動）</div>
        <div class="ml-legend">${mlLegend}</div>
      </div>
    </div>
    <div class="card">
      <div class="card-title"><span class="dot" style="background:var(--red)"></span>市場熱度計</div>
      <div class="gauge-wrap">
        <div class="gauge-svg-wrap">${gaugeSvg}</div>
        <div class="gauge-labels"><span>冷</span><span>正常</span><span>過熱</span></div>
        <div class="gauge-value-label" style="color:${heatColor}">${heatScore} / 100</div>
        <div class="gauge-sublabel">${heatLabel} — 台美股合成熱度指數</div>
      </div>
    </div>
    <div class="card">
      <div class="card-title"><span class="dot" style="background:var(--blue)"></span>台股散戶指標</div>
      <div class="warn-banner">⚠️ 融資餘額偏高 + 成交量放大，需留意散戶過度樂觀風險</div>
      <div class="retail-grid">${retailRows}</div>
    </div>
    <div class="card">
      <div class="card-title"><span class="dot" style="background:var(--purple)"></span>台美股週期分析</div>
      <div class="cycle-info">${cycleRows}</div>
    </div>`;
}

// ── Render: AI Trends ─────────────────────────────────────────────────────

function renderAI() {
  const phases = AI_PHASES.map((p, i) => {
    const isLast = i === AI_PHASES.length - 1;
    const dotClass = p.status === 'done' ? 'phase-done' : p.status === 'current' ? 'phase-current' : 'phase-predicted';
    const lineClass = p.status === 'done' ? 'done' : '';
    const dotIcon = p.status === 'done' ? '✓' : p.status === 'current' ? '▶' : '?';

    let stocksHtml = '';
    if (p.subThemes) {
      stocksHtml = `<div class="next-sub">${p.subThemes.map(st => `
        <div class="next-sub-card">
          <div class="next-sub-name">${st.icon} ${st.name}</div>
          <div class="next-sub-desc">${st.desc}</div>
          <div class="ai-stocks-row"><span class="ai-market-badge badge-us">美股</span><span class="ai-stocks-list">${st.us}</span></div>
          <div class="ai-stocks-row mt-4"><span class="ai-market-badge badge-tw">台股</span><span class="ai-stocks-list">${st.tw}</span></div>
        </div>`).join('')}</div>`;
    } else {
      stocksHtml = `
        <div class="ai-stocks">
          <div class="ai-stocks-row"><span class="ai-market-badge badge-us">美股</span><span class="ai-stocks-list">${p.us}</span></div>
          <div class="ai-stocks-row mt-4"><span class="ai-market-badge badge-tw">台股</span><span class="ai-stocks-list">${p.tw}</span></div>
        </div>`;
    }

    return `
      <div class="ai-phase">
        <div class="ai-phase-left">
          <div class="ai-phase-dot ${dotClass}">${dotIcon}</div>
          ${!isLast ? `<div class="ai-phase-line ${lineClass}"></div>` : ''}
        </div>
        <div class="ai-phase-right">
          <div class="ai-phase-header">
            <span class="ai-phase-num">Phase ${p.num}</span>
            <span class="ai-phase-name">${p.name}</span>
            <span class="ai-phase-period">${p.period}</span>
          </div>
          <div class="ai-phase-desc">${p.desc}</div>
          ${stocksHtml}
        </div>
      </div>`;
  }).join('');

  const frontierSlice = AI_FRONTIER.slice(0, 5);
  const frontier = frontierSlice.map((f, i) => {
    const tag = f.url ? 'a' : 'div';
    const href = f.url ? ` href="${f.url}" target="_blank" rel="noopener"` : '';
    const style = i >= 3 ? ' style="display:none"' : '';
    const displayDate = /^\d{4}-\d{2}-\d{2}/.test(f.date) ? relativeDate(f.date) : f.date;
    return `<${tag} class="frontier-item"${href}${style}>
      <div class="frontier-logo">${f.logo}</div>
      <div class="frontier-content">
        <div class="frontier-brand">${f.brand}</div>
        <div class="frontier-headline">${f.headline}</div>
        <div class="frontier-date">${displayDate}</div>
      </div>
    </${tag}>`;
  }).join('');
  const frontierBtn = frontierSlice.length > 3 ? `<button class="expand-btn" onclick="toggleExpand(this, ${frontierSlice.length})">展開全部 ${frontierSlice.length} 筆 ▼</button>` : '';

  const aiBanner = LIVE_SOURCES.aiFrontier
    ? `<div class="info-banner" style="background:var(--green-bg);border-color:rgba(63,185,80,.3);color:var(--green)">✅ 即時新聞（GNews）· 每30分鐘更新</div>`
    : '';

  return `
    <div class="card">
      <div class="card-title"><span class="dot" style="background:var(--purple)"></span>AI產業輪動時間軸</div>
      <div class="ai-timeline">${phases}</div>
    </div>
    <div class="card">
      <div class="card-title"><span class="dot" style="background:var(--blue)"></span>AI前沿消息</div>
      ${aiBanner}
      <div class="expandable">${frontier}</div>
      ${frontierBtn}
    </div>`;
}

// ── Render: Discover (Taiwan Stocks + GitHub) ─────────────────────────────

function renderDiscover() {
  const twStocks = TW_STOCKS_PE.map(s => `
    <div class="tw-stock-item">
      <div class="tw-rank">${s.rank}</div>
      <div class="tw-stock-info">
        <div class="tw-stock-name">${s.name} <span class="ai-market-badge badge-tw" style="font-size:.6rem">${s.sector}</span></div>
        <div class="tw-stock-code">${s.code}</div>
        <div class="tw-reason">${s.reason}</div>
      </div>
      <div class="tw-stock-right">
        <div class="tw-pe">本益比 <strong>${s.pe}x</strong></div>
        <div class="mt-4"><span class="pe-badge pe-${s.peLevel}">${s.peLevel === 'low' ? '低估' : s.peLevel === 'mid' ? '合理' : '偏貴'}</span></div>
      </div>
    </div>`).join('');

  return `
    <div class="card">
      <div class="card-title"><span class="dot" style="background:var(--green)"></span>台股本益比 & 成長潛力</div>
      <div class="info-banner">📊 以AI/科技供應鏈為主軸，本益比資料為模擬值，請以實際財報為準</div>
      ${twStocks}
    </div>
    <div class="card" id="github-card">
      <div class="card-title"><span class="dot" style="background:var(--purple)"></span>GitHub 本週熱門 Top 10</div>
      <div id="github-list"><div class="gh-loading">⏳ 載入中...</div></div>
    </div>`;
}

// ── GitHub API ────────────────────────────────────────────────────────────

const GH_CACHE_KEY = 'gh_trending_v1';
const GH_CACHE_TTL = 30 * 60 * 1000; // 30 min

const AI_NEWS_CACHE_KEY = 'ai_news_v4';
const AI_NEWS_CACHE_TTL = 30 * 60 * 1000; // 30 min

async function loadGitHub() {
  const el = document.getElementById('github-list');
  if (!el) return;

  // Check cache
  try {
    const raw = localStorage.getItem(GH_CACHE_KEY);
    if (raw) {
      const { items, ts } = JSON.parse(raw);
      if (Date.now() - ts < GH_CACHE_TTL) {
        renderGitHubItems(items);
        return;
      }
    }
  } catch (_) {}

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const url = `https://api.github.com/search/repositories?q=created:%3E${weekAgo}+stars:%3E20&sort=stars&order=desc&per_page=10`;

  try {
    const ghHeaders = { Accept: 'application/vnd.github.v3+json' };
    if (cfg('GITHUB_TOKEN')) ghHeaders['Authorization'] = `Bearer ${CONFIG.GITHUB_TOKEN}`;
    const res = await fetch(url, { headers: ghHeaders });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    const items = data.items || [];
    try { localStorage.setItem(GH_CACHE_KEY, JSON.stringify({ items, ts: Date.now() })); } catch (_) {}
    renderGitHubItems(items);
  } catch (err) {
    if (el) el.innerHTML = `<div class="gh-loading" style="color:var(--red)">⚠️ GitHub API 載入失敗（可能觸發速率限制），請稍後再試。</div>`;
  }
}

function renderGitHubItems(items) {
  const el = document.getElementById('github-list');
  if (!el) return;
  if (!items.length) {
    el.innerHTML = '<div class="gh-loading">沒有找到資料</div>';
    return;
  }
  el.innerHTML = items.map((r, i) => `
    <a class="gh-item" href="${r.html_url}" target="_blank" rel="noopener">
      <div class="gh-rank">${i + 1}</div>
      <div class="gh-info">
        <div class="gh-repo-name">${r.full_name}</div>
        <div class="gh-desc">${r.description || '（無描述）'}</div>
        <div class="gh-meta">
          <span class="gh-stars">⭐ ${r.stargazers_count.toLocaleString()}</span>
          ${r.language ? `<span class="gh-lang">${r.language}</span>` : ''}
        </div>
      </div>
    </a>`).join('');
}

// ── Tab system ────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview', label: '總覽',  icon: '📊', render: renderOverview },
  { id: 'news',     label: '新聞',  icon: '📰', render: renderNews },
  { id: 'cycle',    label: '週期',  icon: '🔄', render: renderCycle },
  { id: 'ai',       label: 'AI趨勢',icon: '🤖', render: renderAI },
  { id: 'discover', label: '精選',  icon: '🔍', render: renderDiscover },
];

let activeTab = 'overview';

function switchTab(id) {
  activeTab = id;
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById(`tab-${id}`);
  const tab = TABS.find(t => t.id === id);
  if (panel && tab) {
    panel.innerHTML = tab.render();
    panel.classList.add('active');
  }
  document.querySelector(`[data-tab="${id}"]`)?.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (id === 'discover') loadGitHub();
}

async function refresh() {
  const btn = document.getElementById('refresh-btn');
  btn.classList.add('spinning');
  // Clear all caches so a manual refresh always pulls fresh data
  localStorage.removeItem(GH_CACHE_KEY);
  localStorage.removeItem(AI_NEWS_CACHE_KEY);
  localStorage.removeItem(GEO_NEWS_CACHE_KEY);
  localStorage.removeItem(MARKET_NEWS_CACHE_KEY);
  await fetchAndUpdateLiveData();
  switchTab(activeTab);
  btn.classList.remove('spinning');
  const anyLive = Object.values(LIVE_SOURCES).some(Boolean);
  document.getElementById('last-updated').textContent = `${anyLive ? '即時' : '更新'}: ${now()}`;
}

function toggleExpand(btn, total) {
  const wrap = btn.previousElementSibling;
  if (!wrap) return;
  const expanded = wrap.classList.toggle('expanded');
  Array.from(wrap.children).forEach((el, i) => {
    if (i >= 3) el.style.display = expanded ? '' : 'none';
  });
  btn.textContent = expanded ? '收合 ▲' : `展開全部 ${total} 筆 ▼`;
}

// ── Bootstrap ─────────────────────────────────────────────────────────────

function buildNav() {
  const nav = document.getElementById('bottom-nav');
  nav.innerHTML = TABS.map(t => `
    <button class="nav-btn${t.id === activeTab ? ' active' : ''}" data-tab="${t.id}" onclick="switchTab('${t.id}')">
      <span class="nav-icon">${t.icon}</span>
      <span>${t.label}</span>
    </button>`).join('');
}

function buildContent() {
  const content = document.getElementById('tab-content');
  content.innerHTML = TABS.map(t => `<div class="tab-panel${t.id === activeTab ? ' active' : ''}" id="tab-${t.id}"></div>`).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  buildNav();
  buildContent();
  switchTab(activeTab);  // 先用 mock 資料渲染，讓畫面立即出現
  document.getElementById('last-updated').textContent = `更新: ${now()}`;
  document.getElementById('refresh-btn').addEventListener('click', refresh);

  // Build version (injected by GitHub Action at deploy time)
  const versionEl = document.getElementById('build-version');
  if (versionEl) {
    const v = (typeof CONFIG !== 'undefined' && CONFIG.BUILD_VERSION) ? CONFIG.BUILD_VERSION : '';
    versionEl.textContent = v ? `v${v}` : 'dev';
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // 背景取得即時資料，完成後重繪當前分頁
  await fetchAndUpdateLiveData();
  if (Object.values(LIVE_SOURCES).some(Boolean)) {
    switchTab(activeTab);
    document.getElementById('last-updated').textContent = `即時: ${now()}`;
  }
});
