// ────────────────────────────────────────────────────────────────────────────
// config.example.js — 設定檔範本
// 複製此檔案並重新命名為 config.js，填入你的 API Key
// config.js 已加入 .gitignore，不會被提交到版本控制
// ────────────────────────────────────────────────────────────────────────────

const CONFIG = {

  // ── GitHub ────────────────────────────────────────────────────────────
  // 提升 API 速率限制：60 → 5000 req/hr（不需要任何 scope）
  // 申請：https://github.com/settings/tokens → Generate new token (classic)
  GITHUB_TOKEN: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',

  // ── 台股 (Fugle Market Data) ──────────────────────────────────────────
  // 台股即時報價，支援加權指數、個股、ETF
  // 申請：https://developer.fugle.tw/ → 免費方案即可
  FUGLE_API_KEY: 'your_fugle_api_key_here',

  // ── 美股 (Polygon.io) ─────────────────────────────────────────────────
  // 美股前日收盤、盤中報價、指數代理 ETF
  // 申請：https://polygon.io/dashboard/signup → Free tier
  POLYGON_API_KEY: 'your_polygon_api_key_here',

  // ── 財經新聞 (NewsAPI.org) ────────────────────────────────────────────
  // 全球財經新聞彙整，免費方案有24小時延遲
  // 申請：https://newsapi.org/register → Developer (free)
  NEWS_API_KEY: 'your_newsapi_key_here',

  // ── 自選股清單 ────────────────────────────────────────────────────────
  // 修改這裡即可自訂追蹤的股票，無需動 app.js
  WATCHLIST_US: ['AAPL', 'NVDA', 'MSFT', 'META', 'GOOGL', 'AMZN'],
  WATCHLIST_TW: ['2330', '2317', '2454', '2382', '2308', '3017'],

};
