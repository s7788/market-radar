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

  // ── 美股 / 指數 / FX (Twelve Data) ─────────────────────────────────────
  // 同一個 key 取股票 + 指數 (SPX/IXIC/DJI/VIX) + FX (USD/TWD/XAU/Brent)
  // 免費版：800 credits/day, 8 credits/min, batch 一次拿多檔
  // 申請：https://twelvedata.com/pricing → Free tier
  TWELVE_DATA_API_KEY: 'your_twelvedata_api_key_here',

  // ── 自選股清單 ────────────────────────────────────────────────────────
  // 修改這裡即可自訂追蹤的股票，無需動 app.js
  // FRED (Federal Reserve Economic Data) - 自動更新總經指標
  // 申請：https://fred.stlouisfed.org/docs/api/api_key.html → 免費，不需信用卡
  FRED_API_KEY: 'your_fred_api_key_here',

  WATCHLIST_US: ['AAPL', 'NVDA', 'MSFT', 'META', 'GOOGL', 'AMZN'],
  WATCHLIST_TW: ['2330', '2317', '2454', '2382', '2308', '3017'],

  // ── CORS Proxy ────────────────────────────────────────────────────────────
  // FRED 和 GNews 在 deployed origin 上不提供 CORS，需透過 proxy 轉發。
  // 預設為 corsproxy.io（免設定）。若有自架 proxy 或其他端點，在此覆寫。
  // CORS_PROXY: 'https://corsproxy.io/?url=',

  // ── 部署版本（CI 自動覆寫，本地開發用 'dev'）────────────────────────────
  BUILD_VERSION: 'dev',

};
