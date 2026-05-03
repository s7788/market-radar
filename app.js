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

// FRED 提供 current/prev 真實值，但不提供 consensus forecast；forecast 欄位移除。
// nextMeeting.date 由 nextFOMC() 動態計算，cutProb/rateExpected 為估計（CME FedWatch 需訂閱）
// 每個 indicator 自帶 FRED series id / params / scale，避免平行陣列 index 對齊。
// 新增指標只要在這裡加一筆，fetchFredData 與 calcMLClockPosition 自動配合。
const FED_DATA = {
  nextMeeting: { rateNow: '3.50–3.75%', rateExpected: '3.50–3.75%', cutProb: 11 },
  indicators: [
    { id: 'cpi',     label: 'CPI 通膨率', unit: '%',  current:  3.3, prev:  2.4, better: 'down', series: 'CPIAUCSL',         params: '&units=pc1', scale: 1   },
    { id: 'coreCpi', label: '核心 CPI',   unit: '%',  current:  2.6, prev:  2.5, better: 'down', series: 'CPILFESL',         params: '&units=pc1', scale: 1   },
    { id: 'pce',     label: 'PCE 通膨',   unit: '%',  current:  2.5, prev:  2.3, better: 'down', series: 'PCEPILFE',         params: '&units=pc1', scale: 1   },
    { id: 'unemp',   label: '失業率',     unit: '%',  current:  4.3, prev:  4.4, better: 'down', series: 'UNRATE',           params: '',           scale: 1   },
    { id: 'gdp',     label: 'GDP (QoQ)',  unit: '%',  current:  1.2, prev:  2.3, better: 'up',   series: 'A191RL1Q225SBEA',  params: '',           scale: 1   },
    { id: 'nfp',     label: '非農就業',   unit: '萬', current: 17.8, prev: 15.1, better: 'up',   series: 'PAYEMS',           params: '&units=chg', scale: 0.1 },
  ],
};
const _fedById = id => FED_DATA.indicators.find(i => i.id === id);

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
  // FOMC.end dates are NY-time. Use NY today (not UTC) so we don't roll over to
  // the next meeting prematurely during the UTC-vs-NY date gap (worst case 5h).
  // 'en-CA' yields YYYY-MM-DD for direct string comparison with .end.
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
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

// Mock fallback uses ISO timestamps relative to "now" so render always shows recent times.
const _now = Date.now();
const _hoursAgo = h => new Date(_now - h * 3600000).toISOString();
const _daysAgo  = d => new Date(_now - d * 86400000).toISOString();
const NEWS = [
  { tag: 'macro',    label: '總經', title: 'FOMC 會議今晚登場：市場預期維持利率不變，Powell 記者會措辭成關鍵，降息預期推至9月', src: 'Bloomberg', date: _hoursAgo(1) },
  { tag: 'earnings', label: '財報', title: 'Alphabet Q1 2026 EPS $2.81 超預期 11%，Google Cloud 季收入達 127億美元創新高，盤後漲 6.2%', src: 'CNBC', date: _hoursAgo(3) },
  { tag: 'earnings', label: '財報', title: 'Microsoft Q3 FY2026 盤後：Azure 成長加速至 35%，Copilot 企業訂閱數突破 5000 萬，EPS $3.46 勝預期', src: 'WSJ', date: _hoursAgo(5) },
  { tag: 'ai',       label: 'AI', title: 'NVIDIA GB300 NVL72 伺服器機櫃開始交貨，台積電 CoWoS-L 產能全數搶訂，AI算力需求再創新高', src: 'Reuters', date: _hoursAgo(7) },
  { tag: 'tw',       label: '台股', title: '台積電 Q1 2026 法說：EPS NT$16.4 優於預期，全年資本支出上修至 400–420 億美元，AI CoWoS 佔比 35%', src: '財訊', date: _hoursAgo(20) },
  { tag: 'us',       label: '美股', title: 'S&P 500 本週財報季衝刺：Apple、Amazon 明日盤後公布，選擇權隱含波動率急升', src: 'Barron\'s', date: _hoursAgo(24) },
  { tag: 'macro',    label: '總經', title: 'PCE 通膨數據周三公布在即：市場預估年增 2.7%，若超預期將壓縮年內降息空間', src: 'FT', date: _hoursAgo(30) },
];

// 使用 ISO 日期，render 時自動過濾過期項目並轉中文顯示（避免「上月財報」殘留）
const EARNINGS_CALENDAR = [
  { date: '2026-04-28', company: 'Apple (AAPL)',     detail: 'Q2 2026 盤後公告',  est: '$1.58',   estLabel: '預估EPS' },
  { date: '2026-04-29', company: 'Amazon (AMZN)',    detail: 'Q1 2026 盤後公告',  est: '$1.29',   estLabel: '預估EPS' },
  { date: '2026-04-30', company: 'Microsoft (MSFT)', detail: 'Q3 FY2026 盤後',    est: '$3.21',   estLabel: '預估EPS' },
  { date: '2026-05-01', company: '台積電 (2330)',    detail: '2026 Q1法說會',     est: 'NT$14.5', estLabel: '預估EPS' },
  { date: '2026-05-05', company: 'NVIDIA (NVDA)',    detail: 'Q1 FY2027 盤後',    est: '$5.81',   estLabel: '預估EPS' },
];
const ZH_MONTHS = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];

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

const AI_FRONTIER = [
  { logo: '🤖', brand: 'Anthropic / Claude', headline: 'Anthropic 發表 Claude Opus 4.7 與 Haiku 4.5，推理速度與工具使用能力大幅躍進', date: _daysAgo(2) },
  { logo: '🔮', brand: 'OpenAI', headline: 'OpenAI 推出 GPT-5 Turbo，context window 擴大至 2M token，多步驟代理任務表現領先', date: _daysAgo(4) },
  { logo: '♊', brand: 'Google DeepMind', headline: 'Gemini 3 發布：原生多模態推理大幅強化，影片理解與程式碼生成進入產業領先', date: _daysAgo(7) },
  { logo: '🦾', brand: 'Meta AI', headline: 'Llama 5 系列開源，MoE 架構搭配 128K context，企業端本地部署成本再降 40%', date: _daysAgo(10) },
  { logo: '🌐', brand: 'xAI / Grok', headline: 'Grok 4 整合即時搜索與深度研究模式，API 對開發者開放', date: _daysAgo(14) },
];

const GEO_NEWS = [
  { topic: 'trump',  icon: '🇺🇸', label: '川普言論', headline: 'Trump threatens additional 50% tariffs on Chinese goods unless Beijing resumes trade talks by May 9 deadline', src: 'Reuters',   date: _hoursAgo(8)  },
  { topic: 'trump',  icon: '🇺🇸', label: '川普言論', headline: 'Trump demands Fed cut rates by 75bp before July, posts on Truth Social: "Powell is killing the economy with stubbornness"', src: 'Bloomberg', date: _hoursAgo(10) },
  { topic: 'china',  icon: '🇨🇳', label: '中美局勢', headline: 'China suspends Boeing aircraft deliveries, restricts rare earth exports in tit-for-tat response to US chip controls', src: 'FT',        date: _hoursAgo(28) },
  { topic: 'china',  icon: '🇨🇳', label: '中美局勢', headline: 'TSMC restricted from supplying advanced 2nm chips to Huawei-linked firms; US expands Entity List to 47 new Chinese entities', src: 'WSJ',       date: _hoursAgo(34) },
  { topic: 'iran',   icon: '🌍',  label: '中東局勢', headline: 'US-Iran nuclear negotiations break down; White House signals military options "back on the table" as Hormuz tensions escalate', src: 'AP',        date: _hoursAgo(50) },
  { topic: 'russia', icon: '🛡️', label: '俄烏局勢', headline: 'Ukraine drone strike hits Russian oil terminal near Novorossiysk; Brent crude spikes 2.4% on supply disruption fears', src: 'Reuters',   date: _hoursAgo(58) },
  { topic: 'trump',  icon: '🇺🇸', label: '川普言論', headline: 'Trump signs executive order to fast-track domestic critical minerals permits, targeting 90% reduction in China rare earth dependency by 2028', src: 'WSJ',       date: _hoursAgo(72) },
];

const TW_STOCKS_PE = [
  { rank: 1, name: '台積電',   code: '2330', pe: 22.4, peLevel: 'mid', reason: '全球AI晶片製造龍頭，CoWoS持續擴產，2nm良率領先業界', sector: '半導體',    dividendYield: null, pbRatio: null },
  { rank: 2, name: '聯發科',   code: '2454', pe: 16.8, peLevel: 'low', reason: '邊緣AI SoC市佔率提升，車用電子高成長，天璣9400導入旗艦機', sector: 'IC設計',    dividendYield: null, pbRatio: null },
  { rank: 3, name: '廣達',     code: '2382', pe: 13.2, peLevel: 'low', reason: 'AI伺服器出貨強勁，雲端大廠訂單能見度高至2027年', sector: 'ODM',       dividendYield: null, pbRatio: null },
  { rank: 4, name: '鴻海',     code: '2317', pe: 11.5, peLevel: 'low', reason: '電動車轉型加速，AI伺服器佔比持續提升，GB200 NVL72 主要組裝商', sector: 'EMS',       dividendYield: null, pbRatio: null },
  { rank: 5, name: '緯穎',     code: '6669', pe: 18.9, peLevel: 'mid', reason: 'CSP客戶AI基建採購爆量，液冷伺服器導入中', sector: 'ODM',       dividendYield: null, pbRatio: null },
  { rank: 6, name: '台達電',   code: '2308', pe: 21.3, peLevel: 'mid', reason: '電源管理/散熱雙引擎，資料中心電力需求高成長', sector: '電源零件',  dividendYield: null, pbRatio: null },
  { rank: 7, name: '奇鋐',     code: '3017', pe: 19.7, peLevel: 'mid', reason: 'AI伺服器散熱解決方案領先，液冷市場份額持續擴大', sector: '散熱',      dividendYield: null, pbRatio: null },
  { rank: 8, name: '創意電子', code: '3443', pe: 24.1, peLevel: 'mid', reason: 'AI ASIC設計服務需求旺，台積電生態系深度受益', sector: 'IC設計服務', dividendYield: null, pbRatio: null },
];

// 各產業本益比合理區間（依台灣市場歷史均值設定）
const PE_THRESHOLDS = {
  '半導體':    { low: 20, high: 30 },
  'IC設計':    { low: 15, high: 25 },
  'ODM':       { low: 12, high: 20 },
  'EMS':       { low: 10, high: 18 },
  '電源零件':  { low: 16, high: 26 },
  '散熱':      { low: 15, high: 25 },
  'IC設計服務':{ low: 18, high: 28 },
};

// ── ML Clock 動態計算 ────────────────────────────────────────────────────
// 位置 0-4：0=12 點=復甦起點、1=3 點=擴張起點、2=6 點=過熱起點、3=9 點=衰退起點
// 邏輯：CPI ↓ + GDP ↑ = 復甦；CPI ↑ + GDP ↑ = 擴張；CPI ↑ + GDP ↓ = 過熱；CPI ↓ + GDP ↓ = 衰退
function calcMLClockPosition() {
  const cpi = _fedById('cpi');
  const gdp = _fedById('gdp');
  if (!cpi || !gdp || cpi.current == null || cpi.prev == null || gdp.current == null || gdp.prev == null) return 0.75;

  const cpiUp = cpi.current > cpi.prev;
  const gdpUp = gdp.current > gdp.prev;

  let quadrant;
  if (!cpiUp && gdpUp)      quadrant = 0; // 復甦
  else if (cpiUp && gdpUp)  quadrant = 1; // 擴張
  else if (cpiUp && !gdpUp) quadrant = 2; // 過熱
  else                      quadrant = 3; // 衰退

  // Position within quadrant 0-1 based on combined magnitude of moves
  const cpiMag = Math.min(1, Math.abs(cpi.current - cpi.prev) / 1.0);
  const gdpMag = Math.min(1, Math.abs(gdp.current - gdp.prev) / 1.5);
  return quadrant + (cpiMag + gdpMag) / 2;
}

const CYCLE_PHASE_NAMES = ['復甦', '擴張', '過熱', '衰退'];
function getCyclePhaseLabel() {
  const pos = calcMLClockPosition();
  const cur = CYCLE_PHASE_NAMES[Math.floor(pos) % 4];
  const next = CYCLE_PHASE_NAMES[(Math.floor(pos) + 1) % 4];
  const intra = pos - Math.floor(pos);
  if (intra < 0.33) return `${cur}初期`;
  if (intra < 0.66) return `${cur}中段`;
  return `${cur} → ${next} 過渡期`;
}

// ── 市場熱度合成指數（0-100，整合 INDICES + VIX + 散戶指標） ──────────────
function calcHeatScore() {
  let score = 50;
  // 主要指數動能：總漲跌幅 × 4，clamp ±15
  const totalPct = INDICES.reduce((s, i) => s + (i.pct || 0), 0);
  score += Math.max(-15, Math.min(15, totalPct * 4));
  // VIX 反向：低恐慌 = 熱
  const vix = COMMODITIES.find(c => c.symbol === 'VIX')?.price ?? 18;
  if (vix < 15)      score += 10;
  else if (vix < 20) score += 5;
  else if (vix > 30) score -= 10;
  else if (vix > 25) score -= 5;
  // 散戶融資水位（越高越熱）
  const m = RETAIL_DATA?.margin?.raw ?? 50;
  if (m > 70)      score += 10;
  else if (m > 50) score += 5;
  else if (m < 35) score -= 5;
  // 成交量（放大=熱）
  const v = RETAIL_DATA?.vol?.raw ?? 50;
  if (v > 70)      score += 5;
  else if (v < 35) score -= 5;
  return Math.max(5, Math.min(95, Math.round(score)));
}

// ── Config Helpers ────────────────────────────────────────────────────────

// Tracks which data sources are currently live (vs mock). String = source label, false = mock.
const LIVE_SOURCES = { watchlist: false, fed: false, market: false, aiFrontier: false, geoNews: false, marketNews: false, retail: false, twPE: false };

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

// Single in-flight abort scope for the whole live-data refresh round. When the
// user hits refresh again before the previous round finished, we abort all
// pending fetches instead of letting them race the new round to overwrite data.
let _liveAbort = null;
function _withAbort(timeoutMs) {
  const t = AbortSignal.timeout(timeoutMs);
  return _liveAbort ? AbortSignal.any([_liveAbort.signal, t]) : t;
}

// Polygon free tier is 5 req/min — cache aggressively per-symbol so a refresh
// burst of ~30 symbols doesn't blow the budget. Free-tier prev-day data is
// 15+ min delayed anyway, so a 5-min cache costs us nothing.
const POLYGON_CACHE_TTL = 5 * 60 * 1000;
function readPolygonCache(symbol) {
  try {
    const raw = localStorage.getItem(`pgn_${symbol}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) { return null; }
}
// In-flight de-dup: if 多處同時呼叫同一個 symbol（e.g. watchlist + indices fallback），
// 只發一個實際請求。對 5 req/min 限制特別重要。
const _polygonInflight = new Map();
async function fetchPolygonPrev(symbol) {
  const cached = readPolygonCache(symbol);
  if (cached && Date.now() - cached.ts < POLYGON_CACHE_TTL) return cached.data;
  if (_polygonInflight.has(symbol)) return _polygonInflight.get(symbol);
  const p = (async () => {
    try {
      const res = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${CONFIG.POLYGON_API_KEY}`,
        { signal: _withAbort(8000) }
      );
      if (res.status === 429) return cached?.data ?? null; // rate-limited: serve cached
      if (!res.ok) throw new Error(res.status);
      const j = await res.json();
      const data = Array.isArray(j.results) && j.results.length ? j.results[0] : null;
      if (data) {
        try { localStorage.setItem(`pgn_${symbol}`, JSON.stringify({ data, ts: Date.now() })); } catch (_) {}
      }
      return data;
    } catch (_) {
      return cached?.data ?? null;
    }
  })();
  _polygonInflight.set(symbol, p);
  try { return await p; } finally { _polygonInflight.delete(symbol); }
}

async function fetchFugleQuote(symbol) {
  const res = await fetch(
    `https://api.fugle.tw/marketdata/v1.0/stock/intraday/quote/${symbol}`,
    { headers: { 'X-API-KEY': CONFIG.FUGLE_API_KEY }, signal: _withAbort(8000) }
  );
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

// FRED and RSS feeds do not grant CORS from deployed (non-localhost) origins,
// so these calls are routed through a proxy.
// Proxies are tried in order; the first one that returns a non-403 response wins.
// Override via CONFIG.CORS_PROXY to use a single custom proxy exclusively.
const _CORS_PROXIES = [
  'https://corsproxy.io/?url=',
  'https://api.allorigins.win/raw?url=',
  'https://thingproxy.freeboard.io/fetch/',
];

async function proxyFetch(targetUrl, options = {}) {
  const proxies = (typeof CONFIG !== 'undefined' && CONFIG.CORS_PROXY)
    ? [CONFIG.CORS_PROXY]
    : _CORS_PROXIES;
  let lastErr;
  for (const proxy of proxies) {
    try {
      const res = await fetch(proxy + encodeURIComponent(targetUrl), options);
      if (res.status === 429 || res.ok) return res; // 429 rate-limit: let caller handle
      lastErr = new Error(res.status);
    } catch (e) { lastErr = e; }
  }
  throw lastErr ?? new Error('All CORS proxies failed');
}

async function fetchFredSingle(seriesId, extraParams = '') {
  const target = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&sort_order=desc&limit=2&file_type=json${extraParams}&api_key=${CONFIG.FRED_API_KEY}`;
  // FRED supports CORS natively from any browser origin — call directly,
  // bypassing the proxy (Cloudflare datacenter IPs are often blocked by FRED).
  const res = await fetch(target, { signal: _withAbort(12000) });
  if (!res.ok) throw new Error(res.status);
  const j = await res.json();
  return (j.observations || []).filter(o => o.value !== '.');
}

async function fetchFredData() {
  if (!cfg('FRED_API_KEY')) return;
  try {
    // 拉 Fed funds target range（不在 indicators 內，分開處理）+ 各 indicator
    const [rateL, rateU, ...obs] = await Promise.all([
      fetchFredSingle('DFEDTARL'),
      fetchFredSingle('DFEDTARU'),
      ...FED_DATA.indicators.map(ind => fetchFredSingle(ind.series, ind.params)),
    ]);

    if (rateL[0] && rateU[0]) {
      const lo = parseFloat(rateL[0].value), hi = parseFloat(rateU[0].value);
      FED_DATA.nextMeeting.rateNow = `${lo.toFixed(2)}–${hi.toFixed(2)}%`;
    }

    FED_DATA.indicators.forEach((ind, i) => {
      const o = obs[i];
      if (o[0]) ind.current = +(parseFloat(o[0].value) * ind.scale).toFixed(1);
      if (o[1]) ind.prev    = +(parseFloat(o[1].value) * ind.scale).toFixed(1);
    });

    LIVE_SOURCES.fed = true;
  } catch (_) {}
}

// Apply a quote (close/open + optional precomputed pct) to a slot. Returns true
// if data was applied. Used by both Twelve Data (close/open/percent_change keys)
// and Polygon prev-day (c/o keys).
function applyQuote(arr, idx, close, open, pctRaw) {
  if (!close || !arr[idx]) return false;
  const pct = pctRaw != null ? parseFloat(pctRaw) : (open > 0 ? ((close - open) / open) * 100 : 0);
  arr[idx].price  = close;
  arr[idx].change = +(close - open).toFixed(2);
  arr[idx].pct    = +pct.toFixed(2);
  return true;
}

async function fetchLiveMarketData() {
  const hits = [];
  const applyTD = (d, arr, idx) =>
    (d && !d.code) ? applyQuote(arr, idx, +d.close, +(d.open ?? d.close), d.percent_change) : false;
  const applyPGN = (arr, idx, d) =>
    d ? applyQuote(arr, idx, d.c, d.o, null) : false;

  await Promise.allSettled([

    // ── Twelve Data batch: all indices + commodities in one call ───────────
    // Free tier: 800 credits/day, 8/min; this batch costs 7 credits per call
    // Symbols: SPX / NDX / DJI = US indices; VIX = volatility;
    //          XAU/USD = gold; USD/TWD = FX; XBR/USD = Brent crude
    cfg('TWELVE_DATA_API_KEY') && (async () => {
      try {
        const syms = 'SPX,NDX,DJI,VIX,XAU/USD,USD/TWD,XBR/USD';
        const res = await fetch(
          `https://api.twelvedata.com/quote?symbol=${syms}&dp=2&apikey=${CONFIG.TWELVE_DATA_API_KEY}`,
          { signal: _withAbort(10000) }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (applyTD(data['SPX'],     INDICES,     0)) hits.push(1);
        if (applyTD(data['NDX'],     INDICES,     1)) hits.push(1);
        if (applyTD(data['DJI'],     INDICES,     2)) hits.push(1);
        if (applyTD(data['XBR/USD'], COMMODITIES, 0)) hits.push(1);
        if (applyTD(data['XAU/USD'], COMMODITIES, 1)) hits.push(1);
        if (applyTD(data['VIX'],     COMMODITIES, 2)) hits.push(1);
        if (applyTD(data['USD/TWD'], COMMODITIES, 3)) hits.push(1);
      } catch (_) {}
    })(),

    // ── Polygon fallback: indices + gold + VIX + FX (if Twelve Data fails) ─
    cfg('POLYGON_API_KEY') && (async () => {
      if (hits.length >= 4) return; // Twelve Data already succeeded
      await Promise.allSettled([
        fetchPolygonPrev('I:SPX'   ).then(d => { if (applyPGN(INDICES,     0, d)) hits.push(1); }).catch(() => {}),
        fetchPolygonPrev('I:NDX'   ).then(d => { if (applyPGN(INDICES,     1, d)) hits.push(1); }).catch(() => {}),
        fetchPolygonPrev('I:DJI'   ).then(d => { if (applyPGN(INDICES,     2, d)) hits.push(1); }).catch(() => {}),
        fetchPolygonPrev('C:XAUUSD').then(d => { if (applyPGN(COMMODITIES, 1, d)) hits.push(1); }).catch(() => {}),
        fetchPolygonPrev('I:VIX'   ).then(d => { if (applyPGN(COMMODITIES, 2, d)) hits.push(1); }).catch(() => {}),
        fetchPolygonPrev('C:USDTWD').then(d => { if (applyPGN(COMMODITIES, 3, d)) hits.push(1); }).catch(() => {}),
      ]);
    })(),

    // ── Fugle: 台股加權指數 ────────────────────────────────────────────────
    cfg('FUGLE_API_KEY') && (async () => {
      await fetchFugleQuote('IX0001').then(d => {
        if (!d) return;
        INDICES[3].price  = d.closePrice ?? d.lastPrice ?? INDICES[3].price;
        INDICES[3].change = d.change ?? INDICES[3].change;
        INDICES[3].pct    = d.changePercent ?? INDICES[3].pct;
        hits.push(1);
      }).catch(() => {});
    })(),

  ]);

  if (hits.length) LIVE_SOURCES.market = true;
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

// ── AI Frontier RSS feeds (no API key, no quota) ─────────────────────────
const AI_RSS_FEEDS = [
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', src: 'TechCrunch' },
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', src: 'The Verge' },
  { url: 'https://venturebeat.com/category/ai/feed/', src: 'VentureBeat' },
];

async function fetchAIFrontierNews() {
  // Serve from cache first
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

  // Fetch from AI-focused RSS feeds — free, no API key, no quota
  const cutoff = Date.now() - 30 * 86400000; // drop articles older than 30 days
  const seen = new Set();
  const items = [];

  for (const feed of AI_RSS_FEEDS) {
    try {
      const articles = await fetchRSSItems(feed.url, feed.src);
      for (const a of articles) {
        if (new Date(a.pubDate).getTime() < cutoff) continue;
        const brand = detectAIBrand(feed.src, a.title);
        if (!brand) continue;
        if (seen.has(brand.brand)) continue;
        seen.add(brand.brand);
        items.push({
          logo: brand.logo, brand: brand.brand,
          headline: a.title,
          date: new Date(a.pubDate).toISOString(),
          url: a.link,
        });
        if (items.length >= 5) break;
      }
    } catch (_) {}
    if (items.length >= 5) break;
  }

  if (items.length) {
    try { localStorage.setItem(AI_NEWS_CACHE_KEY, JSON.stringify({ items, ts: Date.now() })); } catch (_) {}
    AI_FRONTIER.length = 0;
    AI_FRONTIER.push(...items);
    LIVE_SOURCES.aiFrontier = true;
  }
}

// ── RSS Fetcher (free, no API key; uses allorigins.win proxy for CORS) ────
async function fetchRSSItems(rssUrl, sourceName) {
  const res = await proxyFetch(rssUrl, { signal: _withAbort(10000) });
  if (!res.ok) throw new Error(res.status);
  const xml = await res.text();
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  return [...doc.querySelectorAll('item')].map(item => {
    // <link> in RSS is sometimes a text node sibling, not a child text node
    const linkEl = item.querySelector('link');
    const rawLink = linkEl?.textContent?.trim() || linkEl?.nextSibling?.textContent?.trim() || '';
    return {
      title: item.querySelector('title')?.textContent?.trim() || '',
      link: safeURL(rawLink),
      pubDate: item.querySelector('pubDate')?.textContent?.trim() || '',
      source: sourceName,
    };
  }).filter(i => i.title && i.link && i.pubDate);
}

const GEO_RSS_FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml',            src: 'BBC' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', src: 'NYT' },
];

const MARKET_RSS_FEEDS = [
  { url: 'https://feeds.marketwatch.com/marketwatch/topstories/', src: 'MarketWatch' },
  { url: 'https://finance.yahoo.com/rss/topfinstories',           src: 'Yahoo Finance' },
];

async function fetchGeoNewsFromRSS() {
  const items = [];
  for (const feed of GEO_RSS_FEEDS) {
    try {
      const articles = await fetchRSSItems(feed.url, feed.src);
      for (const a of articles) {
        const cat = detectGeoTopic(a.title);
        if (!cat) continue;
        if (items.some(i => i.headline === a.title)) continue;
        items.push({
          topic: cat.topic, icon: cat.icon, label: cat.label,
          headline: a.title, src: a.source,
          date: new Date(a.pubDate).toISOString(),
          url: a.link,
        });
        if (items.length >= 10) break;
      }
    } catch (_) {}
    if (items.length >= 10) break;
  }
  return items;
}

async function fetchMarketNewsFromPolygon() {
  if (!cfg('POLYGON_API_KEY')) return [];
  const from = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
  const url = `https://api.polygon.io/v2/reference/news?limit=20&published_utc.gte=${from}&order=desc&sort=published_utc&apiKey=${CONFIG.POLYGON_API_KEY}`;
  const res = await fetch(url, { signal: _withAbort(10000) });
  if (!res.ok) throw new Error(res.status);
  const j = await res.json();
  const items = [];
  for (const a of (j.results || [])) {
    const link = safeURL(a.article_url);
    if (!a.title || !link) continue;
    const cat = categorizeMarketNews(a.title, a.publisher?.name || '');
    items.push({ tag: cat.tag, label: cat.label, title: a.title, src: a.publisher?.name || '', time: relativeDate(a.published_utc), url: link });
    if (items.length >= 7) break;
  }
  return items;
}

async function fetchMarketNewsFromRSS() {
  const items = [];
  for (const feed of MARKET_RSS_FEEDS) {
    try {
      const articles = await fetchRSSItems(feed.url, feed.src);
      for (const a of articles) {
        const cat = categorizeMarketNews(a.title, a.source);
        if (items.some(i => i.title === a.title)) continue;
        items.push({ tag: cat.tag, label: cat.label, title: a.title, src: a.source, time: relativeDate(new Date(a.pubDate).toISOString()), url: a.link });
        if (items.length >= 7) break;
      }
    } catch (_) {}
    if (items.length >= 7) break;
  }
  return items;
}

const GEO_NEWS_CACHE_KEY = 'geo_news_v3';
const GEO_NEWS_CACHE_TTL = 20 * 60 * 1000; // 20 min

function detectGeoTopic(title) {
  const t = title.toLowerCase();
  // Check specific geographic entities first to avoid tariff/trade-war misclassification
  if (t.includes('china') || t.includes('beijing') || t.includes('xi jinping') || t.includes('taiwan strait') || t.includes('huawei') || t.includes('prc') || (t.includes('chinese') && (t.includes('trade') || t.includes('tariff') || t.includes('military') || t.includes('chip'))))
    return { topic: 'china', icon: '🇨🇳', label: '中美局勢' };
  if (t.includes('russia') || t.includes('ukraine') || t.includes('putin') || t.includes('kremlin') || t.includes('kyiv') || t.includes('moscow') || t.includes('zelensky'))
    return { topic: 'russia', icon: '🛡️', label: '俄烏局勢' };
  if (t.includes('iran') || t.includes('hormuz') || t.includes('tehran') || t.includes('middle east') || t.includes('israel') || t.includes('hamas') || t.includes('hezbollah') || t.includes('red sea') || t.includes('houthi') || t.includes('yemen') || t.includes('nuclear deal'))
    return { topic: 'iran', icon: '🌍', label: '中東局勢' };
  if (t.includes('trump') || t.includes('donald') || /\btariff(s)?\b/.test(t) || t.includes('trade war') || t.includes('white house') || t.includes('executive order') || t.includes('mar-a-lago'))
    return { topic: 'trump', icon: '🇺🇸', label: '川普言論' };
  return null;
}

async function fetchGeoNews() {
  // Serve from cache first
  try {
    const cached = localStorage.getItem(GEO_NEWS_CACHE_KEY);
    if (cached) {
      const { items, ts, src } = JSON.parse(cached);
      if (Date.now() - ts < GEO_NEWS_CACHE_TTL) {
        GEO_NEWS.length = 0;
        GEO_NEWS.push(...items);
        LIVE_SOURCES.geoNews = src || 'RSS';
        return;
      }
    }
  } catch (_) {}


  let items = [];

  // RSS primary (BBC World + NYT World) — free, no API key, no quota
  try {
    const rssItems = await fetchGeoNewsFromRSS();
    for (const r of rssItems) {
      if (!items.some(i => i.headline === r.headline)) items.push(r);
      if (items.length >= 10) break;
    }
  } catch (_) {}

  if (items.length) {
    try { localStorage.setItem(GEO_NEWS_CACHE_KEY, JSON.stringify({ items, ts: Date.now(), src: 'RSS' })); } catch (_) {}
    GEO_NEWS.length = 0;
    GEO_NEWS.push(...items);
    LIVE_SOURCES.geoNews = 'RSS';
  }
}

const MARKET_NEWS_CACHE_KEY = 'market_news_v2';
const MARKET_NEWS_CACHE_TTL = 20 * 60 * 1000; // 20 min

function categorizeMarketNews(title, source) {
  const t = (title + ' ' + source).toLowerCase();
  if (t.includes('earnings') || t.includes('eps') || t.includes('quarterly') || /q[1-4]\s*(20\d\d|fy)/.test(t) || t.includes('revenue beat') || t.includes('profit')) return { tag: 'earnings', label: '財報' };
  if (t.includes('chatgpt') || t.includes('openai') || t.includes('anthropic') || t.includes('nvidia') || t.includes('artificial intel') || t.includes(' llm') || /\bai\b/.test(t)) return { tag: 'ai', label: 'AI' };
  if (t.includes('taiwan') || t.includes('tsmc') || t.includes('mediatek') || t.includes('foxconn') || t.includes('台積') || t.includes('台股')) return { tag: 'tw', label: '台股' };
  if (t.includes('fed') || t.includes('inflation') || t.includes('cpi') || t.includes('powell') || t.includes('rate cut') || t.includes('fomc') || t.includes('treasury') || t.includes('jobs report') || t.includes('gdp') || t.includes('recession')) return { tag: 'macro', label: '總經' };
  return { tag: 'us', label: '美股' };
}

async function fetchMarketNews() {
  // Serve from cache first
  try {
    const cached = localStorage.getItem(MARKET_NEWS_CACHE_KEY);
    if (cached) {
      const { items, ts, src } = JSON.parse(cached);
      if (Date.now() - ts < MARKET_NEWS_CACHE_TTL) {
        NEWS.length = 0;
        NEWS.push(...items);
        LIVE_SOURCES.marketNews = src || 'Polygon';
        return;
      }
    }
  } catch (_) {}


  let items = [];
  let liveSource = '';

  // 1) Polygon.io news (already-configured key, no quota overhead on news endpoint)
  if (cfg('POLYGON_API_KEY')) {
    try {
      items = await fetchMarketNewsFromPolygon();
      if (items.length) liveSource = 'Polygon';
    } catch (_) {}
  }

  // 2) RSS (MarketWatch + Yahoo Finance) — free, no API key, no quota
  if (items.length < 3) {
    try {
      const rssItems = await fetchMarketNewsFromRSS();
      for (const r of rssItems) {
        if (!items.some(i => i.title === r.title)) items.push(r);
        if (items.length >= 7) break;
      }
      if (items.length) liveSource = liveSource || 'RSS';
    } catch (_) {}
  }

  if (items.length) {
    try { localStorage.setItem(MARKET_NEWS_CACHE_KEY, JSON.stringify({ items, ts: Date.now(), src: liveSource })); } catch (_) {}
    NEWS.length = 0;
    NEWS.push(...items);
    LIVE_SOURCES.marketNews = liveSource;
  }
}

// ── TWSE 本益比 / 殖利率 / 股價淨值比 (BWIBBU) ───────────────────────────
// 來源：www.twse.com.tw/rwd/zh/afterTrading/BWIBBU（同 BFI82U 路徑模式）
// 回傳格式：{ stat:'OK', fields:[...], data:[[col0,col1,...], ...] }
// 需帶 date=YYYYMMDD&selectType=ALL；今日資料收盤後才發布，同時嘗試今天與昨天。
// 快取 4 小時：本益比日內不變，命中率高。
const TW_PE_CACHE_KEY = 'tw_pe_v2';
const TW_PE_CACHE_TTL = 4 * 60 * 60 * 1000;

function _parseBWIBBU(j) {
  if (!j || j.stat !== 'OK' || !Array.isArray(j.data) || !j.data.length) return null;
  const fields = Array.isArray(j.fields) ? j.fields : [];
  const fi = kw => fields.findIndex(f => String(f).includes(kw));
  const codeI = fi('代號'), peI = fi('本益比'), dyI = fi('殖利率'), pbI = fi('淨值比');
  if (codeI < 0 || peI < 0) return null;
  const map = {};
  for (const row of j.data) {
    const code = String(row[codeI] ?? '').trim();
    if (!code) continue;
    const pe = parseFloat(row[peI]);
    const dy = dyI >= 0 ? parseFloat(row[dyI]) : NaN;
    const pb = pbI >= 0 ? parseFloat(row[pbI]) : NaN;
    map[code] = {
      pe: isNaN(pe) || pe <= 0 ? null : +pe.toFixed(1),
      dy: isNaN(dy) || dy < 0  ? null : +dy.toFixed(2),
      pb: isNaN(pb) || pb <= 0 ? null : +pb.toFixed(2),
    };
  }
  return Object.keys(map).length ? map : null;
}

async function fetchTWStocksPE() {
  try {
    const cached = localStorage.getItem(TW_PE_CACHE_KEY);
    if (cached) {
      const { peMap, ts } = JSON.parse(cached);
      if (Date.now() - ts < TW_PE_CACHE_TTL) { applyTWPEData(peMap); return; }
    }
  } catch (_) {}

  const fmtDate = d => d.toISOString().slice(0, 10).replace(/-/g, '');
  const fetchDay = async date => {
    const url = `https://www.twse.com.tw/rwd/zh/afterTrading/BWIBBU?response=json&date=${date}&selectType=ALL`;
    const j = await proxyFetch(url, { signal: _withAbort(12000) })
      .then(r => r.ok ? r.json() : null).catch(() => null);
    return _parseBWIBBU(j);
  };

  // 今日和昨日同時發出請求（今日收盤前資料未發布，昨日作為保底）
  const now = new Date();
  const [todayMap, yestMap] = await Promise.allSettled([
    fetchDay(fmtDate(now)),
    fetchDay(fmtDate(new Date(+now - 86400000))),
  ]);
  const peMap = (todayMap.status === 'fulfilled' && todayMap.value)
             || (yestMap.status  === 'fulfilled' && yestMap.value)
             || null;

  if (peMap) {
    try { localStorage.setItem(TW_PE_CACHE_KEY, JSON.stringify({ peMap, ts: Date.now() })); } catch (_) {}
    applyTWPEData(peMap);
  }
}

function applyTWPEData(peMap) {
  let updated = false;
  for (const s of TW_STOCKS_PE) {
    const d = peMap[s.code];
    if (!d) continue;
    if (d.pe !== null) {
      s.pe = d.pe;
      const t = PE_THRESHOLDS[s.sector] ?? { low: 15, high: 25 };
      s.peLevel = s.pe < t.low ? 'low' : s.pe > t.high ? 'high' : 'mid';
    }
    s.dividendYield = d.dy;
    s.pbRatio       = d.pb;
    updated = true;
  }
  if (updated) LIVE_SOURCES.twPE = true;
}

// Replace all rows of a single market (US or TW) without disturbing the other.
// All callers run their .then synchronously after the await — JS single-threaded
// guarantees no interleaving — so this is safe even when US/TW resolve in any order.
function _setMarketWatchlist(market, live) {
  if (!live.length) return;
  const others = WATCHLIST.filter(w => w.market !== market);
  WATCHLIST.length = 0;
  if (market === 'US') WATCHLIST.push(...live, ...others);
  else WATCHLIST.push(...others, ...live);
  LIVE_SOURCES.watchlist = true;
}

async function _fetchUSWatchlistTwelveData(syms) {
  const res = await fetch(
    `https://api.twelvedata.com/quote?symbol=${syms.join(',')}&dp=2&apikey=${CONFIG.TWELVE_DATA_API_KEY}`,
    { signal: _withAbort(10000) }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return syms.map(sym => {
    const d = syms.length === 1 ? data : data[sym];
    if (!d || d.code || !d.close) return null;
    const close = +d.close, open = +(d.open ?? d.close);
    return { name: d.name || US_NAMES[sym] || sym, symbol: sym, price: close, change: +(close - open).toFixed(2), pct: +parseFloat(d.percent_change ?? 0).toFixed(2), market: 'US' };
  }).filter(Boolean);
}

async function _fetchUSWatchlistPolygon(syms) {
  const results = await Promise.allSettled(syms.map(s => fetchPolygonPrev(s)));
  return results.map((r, i) => {
    if (r.status !== 'fulfilled' || !r.value) return null;
    const d = r.value;
    const pct = d.o > 0 ? ((d.c - d.o) / d.o) * 100 : 0;
    return { name: US_NAMES[syms[i]] || syms[i], symbol: syms[i], price: d.c, change: +(d.c - d.o).toFixed(2), pct: +pct.toFixed(2), market: 'US' };
  }).filter(Boolean);
}

async function fetchAndUpdateLiveData() {
  // Cancel any still-running previous round before starting a new one.
  // Prevents zombie fetches from overwriting fresher data on rapid refreshes.
  _liveAbort?.abort();
  _liveAbort = new AbortController();
  const tasks = [];

  // US watchlist: prefer Twelve Data (1 batch call) over Polygon (N calls).
  // Polygon free tier is 5 req/min — calling it for 6 watchlist symbols + indices
  // fallback (6 more) easily 429s. Twelve Data batch is 1 call regardless of size.
  const hasTD = cfg('TWELVE_DATA_API_KEY');
  const hasPGN = cfg('POLYGON_API_KEY');
  if (hasTD || hasPGN) {
    const syms = CONFIG.WATCHLIST_US ?? ['AAPL', 'NVDA', 'MSFT', 'META'];
    tasks.push((async () => {
      let live = [];
      if (hasTD) {
        try { live = await _fetchUSWatchlistTwelveData(syms); } catch (_) {}
      }
      if (!live.length && hasPGN) {
        try { live = await _fetchUSWatchlistPolygon(syms); } catch (_) {}
      }
      _setMarketWatchlist('US', live);
    })());
  }

  if (cfg('FUGLE_API_KEY')) {
    const syms = CONFIG.WATCHLIST_TW ?? ['2330', '2317', '2454', '2382'];
    tasks.push(
      Promise.allSettled(syms.map(s => fetchFugleQuote(s))).then(results => {
        const live = results.map((r, i) => {
          if (r.status !== 'fulfilled' || !r.value) return null;
          const d = r.value;
          return { name: d.name || syms[i], symbol: syms[i], price: d.closePrice ?? d.lastPrice ?? 0, change: d.change ?? 0, pct: d.changePercent ?? 0, market: 'TW' };
        }).filter(Boolean);
        _setMarketWatchlist('TW', live);
      })
    );
  }

  tasks.push(fetchFredData());
  tasks.push(fetchLiveMarketData());
  tasks.push(fetchAIFrontierNews());
  tasks.push(fetchGeoNews());
  tasks.push(fetchMarketNews());
  tasks.push(fetchTWSERetailData());
  tasks.push(fetchTWStocksPE());
  await Promise.allSettled(tasks);
}

const RETAIL_DATA = {
  margin:  { val: '—', raw: 50, label: '融資餘額',    note: '載入中…' },
  short:   { val: '—', raw: 50, label: '融券餘額',    note: '載入中…' },
  vol:     { val: '—', raw: 50, label: '成交量 vs 均量', note: '載入中…' },
  foreign: { val: '—', raw: 50, label: '外資買賣超',  note: '載入中…' },
};

// ── TWSE Retail Indicators ────────────────────────────────────────────────
// openapi.twse.com.tw returns 200 OK but omits Access-Control-Allow-Origin,
// so browser-side CORS is blocked. All calls are routed through proxyFetch.
// Response format is an array of objects with Chinese named keys.
async function fetchTWSERetailData() {
  const toNum = s => +(String(s ?? '').replace(/,/g, ''));

  await Promise.allSettled([

    // ── 融資 / 融券 (MI_MARGN) — sum ALL stocks for market-wide total ─────
    (async () => {
      const j = await proxyFetch('https://openapi.twse.com.tw/v1/exchangeReport/MI_MARGN', { signal: _withAbort(15000) })
        .then(r => r.ok ? r.json() : null).catch(() => null);
      if (!Array.isArray(j) || !j.length) return;

      const keys = Object.keys(j[0]);
      // Exact field names from TWSE: 融資今日餘額 (千元), 融券今日餘額 (張)
      const marginKey = keys.find(k => k.includes('融資今日餘額')) ?? keys.find(k => /融資.*餘額/.test(k) && !/前日/.test(k));
      const shortKey  = keys.find(k => k.includes('融券今日餘額')) ?? keys.find(k => /融券.*餘額/.test(k) && !/前日/.test(k));

      if (marginKey) {
        const total = j.reduce((s, r) => s + toNum(r[marginKey]), 0); // 千元
        const bil = Math.round(total / 100000); // → 億元
        if (bil > 500) {
          RETAIL_DATA.margin.val  = `${bil.toLocaleString()}億`;
          RETAIL_DATA.margin.raw  = Math.min(100, Math.round(bil / 60));
          RETAIL_DATA.margin.note = bil > 4200 ? '融資水位偏高' : bil > 2800 ? '融資水位適中' : '融資水位偏低';
          LIVE_SOURCES.retail = true;
        }
      }

      if (shortKey) {
        const total = j.reduce((s, r) => s + toNum(r[shortKey]), 0); // 張
        const wanLots = Math.round(total / 10000); // → 萬張
        if (wanLots > 0) {
          RETAIL_DATA.short.val  = `${wanLots.toLocaleString()}萬張`;
          RETAIL_DATA.short.raw  = Math.min(100, Math.round(wanLots / 1.5));
          RETAIL_DATA.short.note = wanLots > 105 ? '融券偏高，空方活躍' : wanLots > 70 ? '融券中等水位' : '融券偏低，多方偏強';
          LIVE_SOURCES.retail = true;
        }
      }
    })(),

    // ── 成交量 vs 月均量 (FMTQIK) ────────────────────────────────────────
    // FMTQIK returns current-month daily rows; 成交金額 is in 元
    (async () => {
      const j = await proxyFetch('https://openapi.twse.com.tw/v1/exchangeReport/FMTQIK', { signal: _withAbort(12000) })
        .then(r => r.ok ? r.json() : null).catch(() => null);
      if (!Array.isArray(j) || !j.length) return;

      const bils = j.map(r => Math.round(toNum(r['成交金額']) / 1e8)).filter(v => v > 100);
      if (!bils.length) return;
      const bil = bils[bils.length - 1]; // today (last row)
      const avg = Math.round(bils.reduce((s, v) => s + v, 0) / bils.length); // this month's avg

      const pct = Math.round((bil / avg - 1) * 100);
      RETAIL_DATA.vol.val  = (pct >= 0 ? `+${pct}` : `${pct}`) + '%';
      RETAIL_DATA.vol.raw  = Math.min(100, Math.max(5, Math.round(bil / avg * 50)));
      RETAIL_DATA.vol.note = `今日${bil.toLocaleString()}億，月均${avg.toLocaleString()}億`;
      LIVE_SOURCES.retail  = true;
    })(),

    // ── 外資買賣超 (BFI82U via www.twse.com.tw) ──────────────────────────
    // Response: { stat:'OK', data:[['單位名稱','買進金額','賣出金額','買賣差額'], ...] }
    // Amounts are in 元; divide by 1e8 to get 億元
    (async () => {
      const j = await proxyFetch('https://www.twse.com.tw/rwd/zh/fund/BFI82U?response=json', { signal: _withAbort(12000) })
        .then(r => r.ok ? r.json() : null).catch(() => null);
      if (!j || j.stat !== 'OK' || !Array.isArray(j.data)) return;

      // data row: [單位名稱, 買進金額, 賣出金額, 買賣差額]
      const row = j.data.find(r => /外資及陸資/.test(String(r[0] ?? '')) && !/自營商/.test(String(r[0] ?? '')));
      if (!row || row.length < 4) return;

      const net = toNum(row[3]); // 元
      const bil = Math.round(net / 1e8); // → 億元
      RETAIL_DATA.foreign.val  = (bil >= 0 ? `+${bil.toLocaleString()}` : `${bil.toLocaleString()}`) + '億';
      RETAIL_DATA.foreign.raw  = Math.min(100, Math.max(0, 50 + Math.round(bil / 4)));
      RETAIL_DATA.foreign.note = bil > 30 ? '外資今日淨買超，法人偏多' : bil < -30 ? '外資今日淨賣超，法人偏空' : '外資今日買賣持平';
      LIVE_SOURCES.retail = true;
    })()
  ]);
}

// ── Utilities ──────────────────────────────────────────────────────────────

// HTML escape — used on every untrusted string before insertion into innerHTML.
// RSS feeds, GitHub repo descriptions, Polygon news titles can all contain HTML.
const _ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => _ESC[c]);
}

// URL whitelist — only allow http(s) URLs so a malicious feed can't inject
// `javascript:` or `data:` hrefs. Returns '' for invalid input (caller should
// fall back to non-anchor markup).
function safeURL(u) {
  if (!u) return '';
  try {
    const url = new URL(u, 'https://x/');
    return /^https?:$/.test(url.protocol) ? url.toString() : '';
  } catch (_) { return ''; }
}

function fmtChange(pct, v) {
  if (pct == null || isNaN(pct)) return '<span class="muted">—</span>';
  const sign = v >= 0 ? '+' : '';
  const cls = v >= 0 ? 'up' : 'down';
  const absStr = (v != null && !isNaN(v)) ? `<span class="chg-abs ${cls}" style="opacity:.65;font-size:.7rem;margin-left:4px">${sign}${v.toFixed(2)}</span>` : '';
  return `<span class="${cls}">${sign}${pct.toFixed(2)}%</span>${absStr}`;
}

function fmtPrice(n) {
  if (n >= 1000) return n.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toFixed(2);
}

function now() {
  return new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
}

// ── Visual helpers (Pulse design) ─────────────────────────────────────────

// Deterministic sparkline path so each symbol has stable but varied micro-chart.
// Real OHLC data isn't fetched yet; this is decorative until we add it.
function synthSparkline(symbol, isUp) {
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) seed = (seed * 31 + symbol.charCodeAt(i)) % 233280;
  const pts = [];
  let v = 14;
  for (let i = 0; i <= 7; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const r = (seed / 233280 - 0.5) * 6;
    v = Math.max(2, Math.min(20, v + r + (isUp ? -0.9 : 0.9)));
    pts.push(`${i * 8.5},${v.toFixed(1)}`);
  }
  const stroke = isUp ? '#34d399' : '#fb7185';
  return `<svg class="sparkline" viewBox="0 0 60 22" aria-hidden="true">
    <path d="M${pts.join(' L')}" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

const COMMODITY_ICON_CLASS = { BRT: 'oil', GC: 'gold', VIX: 'vix', USDTWD: 'fx' };

function calcSentiment() {
  const ups = INDICES.filter(i => i.pct > 0).length;
  const totalPct = INDICES.reduce((s, i) => s + (i.pct || 0), 0);
  const score = 50 + ups * 5 + totalPct * 4;
  return Math.max(5, Math.min(95, Math.round(score)));
}

function renderHero() {
  const ups = INDICES.filter(i => i.pct > 0).length;
  const downs = INDICES.filter(i => i.pct < 0).length;
  const score = calcSentiment();

  let moodClass, moodLabel, moodText, headlineEm, headlineEmClass = '';
  if (score >= 65) {
    moodClass = ''; moodLabel = 'RISK ON · 偏多';
    headlineEm = ups === INDICES.length ? '四大指數齊揚' : `${ups} / ${INDICES.length} 指數上漲`;
    moodText = '資金延續流入風險資產，留意 FOMC 與通膨數據';
  } else if (score >= 40) {
    moodClass = 'warn'; moodLabel = 'NEUTRAL · 中性';
    headlineEm = `${ups} 漲 / ${downs} 跌`;
    moodText = '指數震盪整理，等待明確方向訊號';
  } else {
    moodClass = 'down'; moodLabel = 'RISK OFF · 偏空';
    headlineEm = `${downs} 指數承壓`; headlineEmClass = ' down';
    moodText = '避險情緒升溫，留意風險控管與波動';
  }

  const d = new Date();
  const time = `${String(d.getMonth()+1).padStart(2,'0')} / ${String(d.getDate()).padStart(2,'0')} · ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;

  const cells = INDICES.map(i => {
    const cls = i.pct >= 0 ? 'up' : 'down';
    const sign = i.pct >= 0 ? '+' : '';
    const shortName = ({ 'S&P 500': 'S&P', 'NASDAQ': 'NDX', '道瓊指數': 'DJI', '台股加權': 'TWSE' })[i.name] || i.symbol;
    return `<div class="hero-cell">
      <div class="lbl">${shortName}</div>
      <div class="val">${fmtPrice(i.price)}</div>
      <div class="chg ${cls}">${sign}${i.pct.toFixed(2)}%</div>
    </div>`;
  }).join('');

  return `<div class="hero">
    <div class="hero-head">
      <div class="hero-eyebrow">市場脈搏</div>
      <div class="hero-time">${time} TWN</div>
    </div>
    <div class="hero-headline">市況一覽，<em class="${headlineEmClass.trim()}">${headlineEm}</em></div>
    <div class="hero-sub">綜合台美股動能、原物料與避險指標，估算當前市場情緒</div>
    <div class="hero-mood">
      <div class="mood-orb ${moodClass}"></div>
      <div class="mood-info">
        <div class="mood-label">${moodLabel}</div>
        <div class="mood-text">${moodText}</div>
      </div>
      <div class="mood-score ${moodClass}">
        <div class="mood-score-num">${score}</div>
        <div class="mood-score-lbl">SENTIMENT</div>
      </div>
    </div>
    <div class="hero-grid">${cells}</div>
  </div>`;
}

// ── Render: Overview ──────────────────────────────────────────────────────

function renderOverview() {
  const indices = INDICES.map(d => {
    const cls = d.pct >= 0 ? 'up' : 'down';
    const sign = d.pct >= 0 ? '+' : '';
    const arrow = d.pct >= 0
      ? `<svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M6 2L11 8H1Z"/></svg>`
      : `<svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M6 10L1 4H11Z"/></svg>`;
    return `
    <div class="index-tile ${cls}">
      <div class="index-row">
        <div>
          <div class="index-name">${d.name}</div>
          <div class="index-sym">${d.symbol}</div>
        </div>
        ${synthSparkline(d.symbol, d.pct >= 0)}
      </div>
      <div class="index-val">${fmtPrice(d.price)}</div>
      <div class="index-chg-row">
        <span class="chg-pill ${cls}">${arrow} ${sign}${d.pct.toFixed(2)}%</span>
        <span class="chg-abs">${sign}${d.change.toFixed(2)}</span>
      </div>
    </div>`;
  }).join('');

  const commodities = COMMODITIES.map(d => {
    const iconCls = COMMODITY_ICON_CLASS[d.symbol] || '';
    const cls = d.change >= 0 ? 'up' : 'down';
    const sign = d.change >= 0 ? '+' : '';
    return `
    <div class="commodity-row">
      <div class="commodity-left">
        <div class="commodity-icon ${iconCls}">${d.icon}</div>
        <div>
          <div class="commodity-name">${d.name}</div>
          ${d.unit ? `<div class="commodity-unit">${d.unit} · ${d.symbol}</div>` : `<div class="commodity-unit">${d.symbol}</div>`}
        </div>
      </div>
      <div class="commodity-right">
        <div class="commodity-price ${cls}">${fmtPrice(d.price)}</div>
        <span class="chg-pill ${cls}">${sign}${d.pct.toFixed(2)}%</span>
      </div>
    </div>`;
  }).join('');

  const geoSlice = GEO_NEWS.slice(0, 5);
  const geoRows = geoSlice.map(g => {
    const url = safeURL(g.url);
    const tag = url ? 'a' : 'div';
    const href = url ? ` href="${esc(url)}" target="_blank" rel="noopener"` : '';
    const displayDate = /^\d{4}-\d{2}-\d{2}/.test(g.date) ? relativeDate(g.date) : esc(g.date);
    return `<${tag} class="news-item"${href}>
      <div><span class="news-tag tag-${esc(g.topic)}">${esc(g.icon)} ${esc(g.label)}</span></div>
      <div class="news-headline">${esc(g.headline)}</div>
      <div class="news-meta">${esc(g.src)} · ${displayDate}</div>
    </${tag}>`;
  }).join('');
  const geoBtn = geoSlice.length > 3 ? `<button class="expand-btn" onclick="toggleExpand(this)">展開全部 ${geoSlice.length} 筆 ▼</button>` : '';

  const newsSlice = NEWS.slice(0, 5);
  const topNews = newsSlice.map(n => {
    const url = safeURL(n.url);
    const tag = url ? 'a' : 'div';
    const href = url ? ` href="${esc(url)}" target="_blank" rel="noopener"` : '';
    const meta = n.time ?? (n.date ? relativeDate(n.date) : '');
    return `<${tag} class="news-item"${href}>
      <div><span class="news-tag tag-${esc(n.tag)}">${esc(n.label)}</span></div>
      <div class="news-headline">${esc(n.title)}</div>
      <div class="news-meta">${esc(n.src)} · ${esc(meta)}</div>
    </${tag}>`;
  }).join('');
  const newsBtn = newsSlice.length > 3 ? `<button class="expand-btn" onclick="toggleExpand(this)">展開全部 ${newsSlice.length} 筆 ▼</button>` : '';

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
    const diffPct = ind.prev !== 0 ? ((ind.current - ind.prev) / Math.abs(ind.prev) * 100) : 0;
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
          <span class="${prevCls}">變動 ${prevDiff >= 0 ? '+' : ''}${prevDiff.toFixed(1)}${ind.unit}（${diffPct >= 0 ? '+' : ''}${diffPct.toFixed(1)}%）</span>
        </div>
      </div>`;
  }).join('');

  const liveItems = [
    LIVE_SOURCES.watchlist  && '自選股',
    LIVE_SOURCES.market     && '指數 & 原物料',
    LIVE_SOURCES.fed        && '總經指標',
    LIVE_SOURCES.aiFrontier && 'AI 前沿',
    LIVE_SOURCES.geoNews    && '地緣政治',
    LIVE_SOURCES.marketNews && '市場新聞',
    LIVE_SOURCES.retail     && '散戶指標',
    LIVE_SOURCES.twPE       && '台股本益比',
  ].filter(Boolean);
  const checkSvg = `<svg class="banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>`;
  const radioSvg = `<svg class="banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12a10 10 0 0 1 4-8M22 12a10 10 0 0 0-4-8M5 12a7 7 0 0 1 3-5.7M19 12a7 7 0 0 0-3-5.7"/><circle cx="12" cy="12" r="2"/></svg>`;
  const liveBanner = liveItems.length
    ? `<div class="banner live">${checkSvg}<span><b>即時資料</b> · ${liveItems.join('、')}</span></div>`
    : `<div class="banner">${radioSvg}<span><b>模擬資料</b> · 在 config.js 填入 API Key 可取得即時報價與總經數據</span></div>`;

  return `
    ${renderHero()}
    ${liveBanner}
    <div class="section">
      <div class="sec-head">
        <div class="sec-title">主要指數</div>
        <div class="sec-meta">收盤後延遲 15 分鐘</div>
      </div>
      <div class="card">
        <div class="price-grid">${indices}</div>
      </div>
    </div>
    <div class="section">
      <div class="sec-head">
        <div class="sec-title">聯準會 &amp; 總經指標</div>
        <div class="sec-meta">FRED · CME FedWatch</div>
      </div>
      <div class="card">
        ${fedRateBox}
        ${fedIndRows}
      </div>
    </div>
    <div class="section">
      <div class="sec-head">
        <div class="sec-title">原物料 &amp; 避險指標</div>
        <div class="sec-meta">USD denominated</div>
      </div>
      <div class="card">
        ${commodities}
      </div>
    </div>
    <div class="section">
      <div class="sec-head">
        <div class="sec-title">地緣政治 &amp; 川普言論</div>
        <div class="sec-meta">${LIVE_SOURCES.geoNews ? `${LIVE_SOURCES.geoNews} · 即時` : '模擬'}</div>
      </div>
      <div class="card">
        <div class="expandable">${geoRows}</div>
        ${geoBtn}
      </div>
    </div>
    <div class="section">
      <div class="sec-head">
        <div class="sec-title">今日快訊</div>
        <div class="sec-meta">${LIVE_SOURCES.marketNews ? `${LIVE_SOURCES.marketNews} · 即時` : '模擬'}</div>
      </div>
      <div class="card">
        <div class="expandable">${topNews}</div>
        ${newsBtn}
      </div>
    </div>`;
}

// ── Render: News ──────────────────────────────────────────────────────────

function renderNews() {
  const allSlice = NEWS.slice(0, 5);
  const allNews = allSlice.map(n => {
    const url = safeURL(n.url);
    const tag = url ? 'a' : 'div';
    const href = url ? ` href="${esc(url)}" target="_blank" rel="noopener"` : '';
    const meta = n.time ?? (n.date ? relativeDate(n.date) : '');
    return `<${tag} class="news-item"${href}>
      <div><span class="news-tag tag-${esc(n.tag)}">${esc(n.label)}</span></div>
      <div class="news-headline">${esc(n.title)}</div>
      <div class="news-meta">${esc(n.src)} · ${esc(meta)}</div>
    </${tag}>`;
  }).join('');
  const allNewsBtn = allSlice.length > 3 ? `<button class="expand-btn" onclick="toggleExpand(this)">展開全部 ${allSlice.length} 筆 ▼</button>` : '';

  const watchItems = WATCHLIST.map(s => `
    <div class="price-cell">
      <div class="label"><span class="news-tag tag-${s.market === 'US' ? 'us' : 'tw'}" style="margin-bottom:0">${s.symbol}</span> ${s.name}</div>
      <div class="value">${fmtPrice(s.price)}</div>
      <div class="change">${fmtChange(s.pct, s.change)}</div>
    </div>`).join('');

  // 過濾過期項目（含今天）— 避免顯示已公布財報
  const todayISO = new Date().toISOString().slice(0, 10);
  const upcomingEarnings = EARNINGS_CALENDAR.filter(e => e.date >= todayISO);
  const earnings = upcomingEarnings.length
    ? upcomingEarnings.map(e => {
        const d = new Date(e.date);
        return `
    <div class="earnings-item">
      <div class="earnings-date">
        <div class="e-day">${String(d.getDate()).padStart(2, '0')}</div>
        <div class="e-mon">${ZH_MONTHS[d.getMonth()]}</div>
      </div>
      <div class="earnings-info">
        <div class="earnings-company">${e.company}</div>
        <div class="earnings-detail">${e.detail}</div>
      </div>
      <div class="earnings-est">
        <div class="est-label">${e.estLabel}</div>
        <div class="est-val">${e.est}</div>
      </div>
    </div>`;
      }).join('')
    : `<div class="info-banner" style="margin:0">📅 暫無待公布財報；行事曆需手動更新於 app.js（EARNINGS_CALENDAR）</div>`;

  return `
    <div class="section">
      <div class="sec-head">
        <div class="sec-title">自選股動態</div>
        <div class="sec-meta">${LIVE_SOURCES.watchlist ? '即時' : '模擬'}</div>
      </div>
      <div class="card">
        <div class="price-grid">${watchItems}</div>
      </div>
    </div>
    <div class="section">
      <div class="sec-head">
        <div class="sec-title">財報行事曆</div>
        <div class="sec-meta">本週 / 下週</div>
      </div>
      <div class="card">
        ${earnings}
      </div>
    </div>
    <div class="section">
      <div class="sec-head">
        <div class="sec-title">市場要聞</div>
        <div class="sec-meta">${LIVE_SOURCES.marketNews ? `${LIVE_SOURCES.marketNews} · 即時` : '模擬'}</div>
      </div>
      <div class="card">
        <div class="expandable">${allNews}</div>
        ${allNewsBtn}
      </div>
    </div>`;
}

// ── Render: Cycle ─────────────────────────────────────────────────────────

function renderCycle() {
  // ML Clock SVG (Pulse design: gradient quadrants + glass hub)
  const cx = 115, cy = 115, r = 100;
  const phases = [
    { label: '復甦', color: '#34d399', assets: '股票↑', gradId: 'qg1' },
    { label: '擴張', color: '#fb923c', assets: '原物料↑', gradId: 'qg2' },
    { label: '過熱', color: '#fb7185', assets: '債券↑', gradId: 'qg3' },
    { label: '衰退', color: '#7e88a3', assets: '現金↑', gradId: 'qg4' },
  ];
  const defs = `<defs>
    ${phases.map(p => `<linearGradient id="${p.gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="${p.color}" stop-opacity=".22"/>
      <stop offset="100%" stop-color="${p.color}" stop-opacity=".05"/>
    </linearGradient>`).join('')}
    <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#6c8bff"/>
    </radialGradient>
  </defs>`;
  const phaseArcs = phases.map((p, i) => {
    const startDeg = -90 + i * 90;
    const endDeg   = startDeg + 90;
    const s = startDeg * Math.PI / 180;
    const e = endDeg * Math.PI / 180;
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    const lx = cx + (r * 0.62) * Math.cos((s + e) / 2);
    const ly = cy + (r * 0.62) * Math.sin((s + e) / 2);
    return `
      <path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z"
            fill="url(#${p.gradId})" stroke="${p.color}" stroke-opacity="0.45" stroke-width="1"/>
      <text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle"
            font-size="13" font-weight="800" fill="${p.color}">${p.label}</text>
      <text x="${lx}" y="${ly + 16}" text-anchor="middle" dominant-baseline="middle"
            font-size="9" fill="${p.color}" opacity="0.75">${p.assets}</text>`;
  }).join('');

  const mlPosition = calcMLClockPosition();
  const needleDeg = (-90 + mlPosition * 90) * Math.PI / 180;
  const nx = cx + (r * 0.75) * Math.cos(needleDeg);
  const ny = cy + (r * 0.75) * Math.sin(needleDeg);

  const ticks = [0, 90, 180, 270].map(deg => {
    const a = (deg - 90) * Math.PI / 180;
    const r1 = r - 8, r2 = r + 2;
    return `<line x1="${cx + r1 * Math.cos(a)}" y1="${cy + r1 * Math.sin(a)}"
                  x2="${cx + r2 * Math.cos(a)}" y2="${cy + r2 * Math.sin(a)}"
                  stroke="#4b556e" stroke-width="2"/>`;
  }).join('');

  const clockSvg = `
    <svg viewBox="0 0 230 230" xmlns="http://www.w3.org/2000/svg">
      ${defs}
      ${phaseArcs}
      ${ticks}
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="1.5"/>
      <line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}"
            stroke="url(#hubGrad)" stroke-width="3" stroke-linecap="round"/>
      <circle cx="${nx}" cy="${ny}" r="5" fill="#22d3ee"/>
      <circle cx="${nx}" cy="${ny}" r="9" fill="#22d3ee" opacity="0.25"/>
      <circle cx="${cx}" cy="${cy}" r="8" fill="url(#hubGrad)"/>
      <circle cx="${cx}" cy="${cy}" r="3" fill="#06080f"/>
    </svg>`;

  const mlLegend = phases.map(p => `
    <div class="ml-legend-item">
      <div class="ml-dot" style="background:${p.color};color:${p.color}"></div>
      <div>
        <div class="phase-name" style="color:${p.color}">${p.label}</div>
        <div class="phase-assets">${p.assets} 表現最佳</div>
      </div>
    </div>`).join('');

  // Heat gauge SVG (Pulse design: gradient stroke + colored needle)
  const heatScore = calcHeatScore();
  const heatColor = heatScore > 75 ? '#fb7185' : heatScore > 50 ? '#fbbf24' : '#34d399';
  const heatGrad  = heatScore > 75 ? 'linear-gradient(135deg,#fb7185,#f97316)'
                  : heatScore > 50 ? 'linear-gradient(135deg,#fbbf24,#fb923c)'
                  : 'linear-gradient(135deg,#34d399,#06b6d4)';
  const heatLabel = heatScore > 75 ? '偏熱 — 留意散戶情緒過熱風險' : heatScore > 50 ? '中性偏暖 — 多空均衡略偏多' : '正常 — 風險溢酬合理';
  // Needle angle in degrees (relative to vertical), from -90 (left) to 90 (right)
  const needleRotateDeg = -90 + (heatScore / 100) * 180;
  const gx = 110, gy = 100, gr = 85;

  const gaugeSvg = `
    <svg viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#34d399"/>
          <stop offset="50%"  stop-color="#fbbf24"/>
          <stop offset="100%" stop-color="#fb7185"/>
        </linearGradient>
        <linearGradient id="needleGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%"   stop-color="${heatColor}" stop-opacity=".4"/>
          <stop offset="100%" stop-color="${heatColor}"/>
        </linearGradient>
      </defs>
      <path d="M ${gx - gr} ${gy} A ${gr} ${gr} 0 0 1 ${gx + gr} ${gy}" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="14" stroke-linecap="round"/>
      <path d="M ${gx - gr} ${gy} A ${gr} ${gr} 0 0 1 ${gx + gr} ${gy}" fill="none" stroke="url(#gaugeGrad)" stroke-width="14" stroke-linecap="round" opacity="0.85"/>
      <g transform="rotate(${needleRotateDeg.toFixed(1)}, ${gx}, ${gy})">
        <line x1="${gx}" y1="${gy}" x2="${gx}" y2="${gy - gr + 8}" stroke="url(#needleGrad)" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="${gx}" cy="${gy - gr + 8}" r="5" fill="${heatColor}"/>
      </g>
      <circle cx="${gx}" cy="${gy}" r="9" fill="#0f1424" stroke="${heatColor}" stroke-width="2.5"/>
    </svg>`;

  const retailRows = Object.values(RETAIL_DATA).map(d => `
    <div class="retail-cell">
      <div class="r-label">${d.label}</div>
      <div class="r-value">${d.val}</div>
      <div class="r-bar-wrap"><div class="r-bar" style="width:${d.raw}%;background:${d.raw > 70 ? 'var(--red)' : d.raw > 50 ? 'var(--yellow)' : 'var(--green)'}"></div></div>
      <div style="font-size:.65rem;color:var(--text-muted);margin-top:2px">${d.note}</div>
    </div>`).join('');

  // 動態週期分析：依 ML clock 位置 + 實際數據組合描述
  const cpi = _fedById('cpi')?.current ?? '—', gdp = _fedById('gdp')?.current ?? '—';
  const vix = COMMODITIES.find(c => c.symbol === 'VIX')?.price ?? 18;
  const usIdx = INDICES.find(i => i.symbol === 'SPX'),  twIdx = INDICES.find(i => i.symbol === 'TWSE');
  const phaseLabel = getCyclePhaseLabel();
  const usTone = usIdx?.pct >= 0 ? '上漲' : '回檔';
  const twTone = twIdx?.pct >= 0 ? '上漲' : '回檔';
  const heatTone = heatScore > 75 ? '已偏熱' : heatScore > 55 ? '中性偏暖' : heatScore > 35 ? '正常' : '偏冷';
  const cycleAnalysis = [
    { icon: '🇺🇸', label: '美股週期位置',
      desc: `S&P 500 ${fmtPrice(usIdx?.price ?? 0)}（${(usIdx?.pct ?? 0).toFixed(2)}%${usTone}）；CPI ${cpi}%、GDP ${gdp}% (QoQ)，VIX ${vix.toFixed(1)}。當前位於${phaseLabel}。` },
    { icon: '🇹🇼', label: '台股週期位置',
      desc: `加權指數 ${fmtPrice(twIdx?.price ?? 0)}（${(twIdx?.pct ?? 0).toFixed(2)}%${twTone}）；散戶融資 ${RETAIL_DATA.margin.val}、成交量 ${RETAIL_DATA.vol.val}、外資 ${RETAIL_DATA.foreign.val}。情緒${heatTone}。` },
    { icon: '📈', label: '週期觀察',
      desc: heatScore > 75
        ? '熱度偏高：留意散戶過度樂觀，FOMO 風險上升，建議檢視部位與停利點。'
        : heatScore > 55
          ? '熱度中性偏暖：多空均衡略偏多，關注 VIX 是否破 20、融資水位變化。'
          : heatScore > 35
            ? '熱度正常：風險溢酬合理，可逢低布局基本面強勢標的。'
            : '熱度偏冷：避險情緒升溫，可留意超跌反彈機會與防禦型資產。' },
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
    <div class="section">
      <div class="sec-head">
        <div class="sec-title">美林投資時鐘</div>
        <div class="sec-meta">資產輪動定位</div>
      </div>
      <div class="card">
        <div class="ml-clock-wrap">
          <div class="ml-clock-svg-wrap">${clockSvg}</div>
          <div class="ml-current-label">📍 目前位置：<strong>${phaseLabel}</strong></div>
          <div class="ml-legend">${mlLegend}</div>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="sec-head">
        <div class="sec-title">市場熱度計</div>
        <div class="sec-meta">台美股合成指數</div>
      </div>
      <div class="card">
        <div class="gauge-wrap">
          <div class="gauge-svg-wrap">${gaugeSvg}</div>
          <div class="gauge-labels"><span>冷</span><span>正常</span><span>過熱</span></div>
          <div class="gauge-value-label" style="background:${heatGrad};-webkit-background-clip:text;background-clip:text;color:transparent">${heatScore}</div>
          <div class="gauge-sublabel">${heatLabel}</div>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="sec-head">
        <div class="sec-title">台股散戶指標</div>
        <div class="sec-meta">${LIVE_SOURCES.retail ? 'TWSE · 即時' : '模擬'}</div>
      </div>
      <div class="card">
        <div class="warn-banner">${(() => {
          const m = RETAIL_DATA.margin.raw, s = RETAIL_DATA.short.raw, v = RETAIL_DATA.vol.raw;
          if (m > 70 && v > 65) return '⚠️ 融資偏高 + 成交量放大，需留意散戶過度樂觀風險';
          if (m > 70) return '⚠️ 融資水位偏高，追高需謹慎';
          if (s > 70) return '⚠️ 融券比例偏高，空方壓力較大';
          if (v > 70) return '⚠️ 成交量明顯放大，短線留意波動';
          if (m < 35 && s < 35) return '✅ 融資融券偏低，籌碼相對健康';
          return '📊 融資融券水位適中，市場情緒正常';
        })()}</div>
        <div class="retail-grid">${retailRows}</div>
      </div>
    </div>
    <div class="section">
      <div class="sec-head">
        <div class="sec-title">台美股週期分析</div>
        <div class="sec-meta">未來 6–12 個月觀察</div>
      </div>
      <div class="card">
        <div class="cycle-info">${cycleRows}</div>
      </div>
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
  const frontier = frontierSlice.map(f => {
    const url = safeURL(f.url);
    const tag = url ? 'a' : 'div';
    const href = url ? ` href="${esc(url)}" target="_blank" rel="noopener"` : '';
    const displayDate = /^\d{4}-\d{2}-\d{2}/.test(f.date) ? relativeDate(f.date) : esc(f.date);
    return `<${tag} class="frontier-item"${href}>
      <div class="frontier-logo">${esc(f.logo)}</div>
      <div class="frontier-content">
        <div class="frontier-brand">${esc(f.brand)}</div>
        <div class="frontier-headline">${esc(f.headline)}</div>
        <div class="frontier-date">${displayDate}</div>
      </div>
    </${tag}>`;
  }).join('');
  const frontierBtn = frontierSlice.length > 3 ? `<button class="expand-btn" onclick="toggleExpand(this)">展開全部 ${frontierSlice.length} 筆 ▼</button>` : '';

  return `
    <div class="section">
      <div class="sec-head">
        <div class="sec-title">AI 產業輪動</div>
        <div class="sec-meta">2022 → 現在</div>
      </div>
      <div class="card">
        <div class="ai-timeline">${phases}</div>
      </div>
    </div>
    <div class="section">
      <div class="sec-head">
        <div class="sec-title">AI 前沿消息</div>
        <div class="sec-meta">${LIVE_SOURCES.aiFrontier ? 'RSS · 每 30 分鐘更新' : '模擬'}</div>
      </div>
      <div class="card">
        <div class="expandable">${frontier}</div>
        ${frontierBtn}
      </div>
    </div>`;
}

// ── Render: Discover (Taiwan Stocks + GitHub) ─────────────────────────────

function renderDiscover() {
  const peLevelLabel = { low: '低估', mid: '合理', high: '偏貴' };
  const twStocks = TW_STOCKS_PE.map(s => {
    const subMetrics = [
      s.dividendYield != null ? `殖利率 ${s.dividendYield.toFixed(2)}%` : null,
      s.pbRatio       != null ? `PBR ${s.pbRatio.toFixed(2)}x`         : null,
    ].filter(Boolean).join(' · ');
    return `
    <div class="tw-stock-item">
      <div class="tw-rank">${s.rank}</div>
      <div class="tw-stock-info">
        <div class="tw-stock-name">${s.name} <span class="ai-market-badge badge-tw" style="font-size:.6rem">${s.sector}</span></div>
        <div class="tw-stock-code">${s.code}</div>
        <div class="tw-reason">${s.reason}</div>
      </div>
      <div class="tw-stock-right">
        <div class="tw-pe">本益比 <strong>${s.pe != null ? s.pe + 'x' : '—'}</strong></div>
        ${subMetrics ? `<div style="font-size:.65rem;color:var(--text-muted);margin-top:2px;line-height:1.4">${subMetrics}</div>` : ''}
        <div class="mt-4"><span class="pe-badge pe-${s.peLevel}">${peLevelLabel[s.peLevel] ?? s.peLevel}</span></div>
      </div>
    </div>`;
  }).join('');

  const checkSvg = `<svg class="banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>`;
  const peBanner = LIVE_SOURCES.twPE
    ? `<div class="banner live">${checkSvg}<span><b>即時資料</b> · TWSE 本益比、殖利率、股價淨值比（依產業均值分級）</span></div>`
    : `<div class="info-banner">📊 以 AI / 科技供應鏈為主軸，本益比為模擬值；無需 API Key，資料載入後自動更新</div>`;

  return `
    <div class="section">
      <div class="sec-head">
        <div class="sec-title">台股本益比 &amp; 成長潛力</div>
        <div class="sec-meta">${LIVE_SOURCES.twPE ? 'TWSE · 每日更新' : 'AI / 科技供應鏈'}</div>
      </div>
      <div class="card">
        ${peBanner}
        ${twStocks}
      </div>
    </div>
    <div class="section">
      <div class="sec-head">
        <div class="sec-title">GitHub 本週熱門 Top 10</div>
        <div class="sec-meta">過去 7 天 stars</div>
      </div>
      <div class="card" id="github-card">
        <div id="github-list"><div class="gh-loading">⏳ 載入中...</div></div>
      </div>
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
  el.innerHTML = items.map((r, i) => {
    const href = safeURL(r.html_url);
    const stars = (r.stargazers_count ?? 0).toLocaleString();
    return `
    <a class="gh-item" href="${esc(href)}" target="_blank" rel="noopener">
      <div class="gh-rank">${i + 1}</div>
      <div class="gh-info">
        <div class="gh-repo-name">${esc(r.full_name)}</div>
        <div class="gh-desc">${esc(r.description || '（無描述）')}</div>
        <div class="gh-meta">
          <span class="gh-stars">⭐ ${stars}</span>
          ${r.language ? `<span class="gh-lang">${esc(r.language)}</span>` : ''}
        </div>
      </div>
    </a>`;
  }).join('');
}

// ── Tab system ────────────────────────────────────────────────────────────

const NAV_ICONS = {
  overview: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>`,
  news:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v16a2 2 0 0 1-2 2 2 2 0 0 1-2-2V11h4"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>`,
  cycle:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>`,
  ai:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v1H7a3 3 0 0 0-3 3v1H3a3 3 0 0 0 0 6h1v1a3 3 0 0 0 3 3h2v1a3 3 0 0 0 6 0v-1h2a3 3 0 0 0 3-3v-1h1a3 3 0 0 0 0-6h-1V9a3 3 0 0 0-3-3h-2V5a3 3 0 0 0-3-3z"/><circle cx="9" cy="10" r=".5" fill="currentColor"/><circle cx="15" cy="10" r=".5" fill="currentColor"/><path d="M9 14h6"/></svg>`,
  discover: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>`,
};

const TABS = [
  { id: 'overview', label: '總覽',   render: renderOverview },
  { id: 'news',     label: '新聞',   render: renderNews },
  { id: 'cycle',    label: '週期',   render: renderCycle },
  { id: 'ai',       label: 'AI 趨勢', render: renderAI },
  { id: 'discover', label: '精選',   render: renderDiscover },
];

let activeTab = 'overview';

function switchTab(id) {
  const sameTab = id === activeTab;
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
  // Only scroll on real tab switches — refresh() also calls this to re-render the
  // active tab and the scroll-jump is jarring (and loses user's scroll position).
  if (!sameTab) window.scrollTo({ top: 0, behavior: 'smooth' });
  if (id === 'discover') loadGitHub();
}

function updateLiveStatus() {
  const anyLive = Object.values(LIVE_SOURCES).some(Boolean);
  const pill = document.getElementById('live-pill');
  if (pill) pill.hidden = !anyLive;
  const stamp = document.getElementById('last-updated');
  if (stamp) stamp.textContent = now();
}

async function refresh() {
  const btn = document.getElementById('refresh-btn');
  btn.classList.add('spinning');
  // Clear all caches so a manual refresh always pulls fresh data
  localStorage.removeItem(GH_CACHE_KEY);
  localStorage.removeItem(AI_NEWS_CACHE_KEY);
  localStorage.removeItem(GEO_NEWS_CACHE_KEY);
  localStorage.removeItem(MARKET_NEWS_CACHE_KEY);
  // Reset live status — otherwise a previously-live source that fails this round
  // will keep its 'LIVE' label, misleading the user.
  for (const k of Object.keys(LIVE_SOURCES)) LIVE_SOURCES[k] = false;
  await fetchAndUpdateLiveData();
  switchTab(activeTab);
  btn.classList.remove('spinning');
  updateLiveStatus();
}

function toggleExpand(btn) {
  const wrap = btn.previousElementSibling;
  if (!wrap) return;
  // Visibility is driven by CSS (.expandable.expanded > :nth-child(n+4)).
  const expanded = wrap.classList.toggle('expanded');
  btn.textContent = expanded ? '收合 ▲' : `展開全部 ${wrap.children.length} 筆 ▼`;
}

// ── Bootstrap ─────────────────────────────────────────────────────────────

function buildNav() {
  const nav = document.getElementById('bottom-nav');
  nav.innerHTML = TABS.map(t => `
    <button class="nav-btn${t.id === activeTab ? ' active' : ''}" data-tab="${t.id}" onclick="switchTab('${t.id}')" aria-label="${t.label}">
      <span class="nav-icon">${NAV_ICONS[t.id] || ''}</span>
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
  updateLiveStatus();
  document.getElementById('refresh-btn').addEventListener('click', refresh);

  // Build version (injected by GitHub Action at deploy time)
  const versionEl = document.getElementById('build-version');
  if (versionEl) {
    const v = (typeof CONFIG !== 'undefined' && CONFIG.BUILD_VERSION) ? CONFIG.BUILD_VERSION : '';
    versionEl.textContent = v ? `v${v}` : 'DEV';
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // 背景取得即時資料，完成後重繪當前分頁
  await fetchAndUpdateLiveData();
  if (Object.values(LIVE_SOURCES).some(Boolean)) {
    switchTab(activeTab);
    updateLiveStatus();
  }
});
