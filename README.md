# RAP FLOW COACH

## Flow Gym v0.9.0

新增三個 16 Bars 課程、錄音回顧、四 Bars 自評、原速／減速重練及離線保存。執行 `npm start` 後開啟 http://localhost:4189/gym.html 。完整操作、資料限制及驗收說明見 [FLOW-GYM.md](FLOW-GYM.md)。原有自由節拍器入口為 `index.html`。

專業節拍器應用程式，專為說唱練習設計。

## 功能特色

- 🎵 精準節拍器引擎
- 🎯 BPM 範圍：40-240
- 📊 訓練日曆與統計
- 🎨 現代化冰藍色 UI
- 📱 響應式設計，支援行動裝置
- 💾 離線可用（PWA）

## 技術架構

- 純 HTML/CSS/JavaScript
- Web Audio API
- Canvas API
- LocalStorage
- Service Worker (PWA)

## 部署說明

### GitHub Pages 部署

1. 在 GitHub 建立新 repository
2. 將所有檔案上傳到 repository
3. 前往 Settings > Pages
4. 選擇 Source: Deploy from a branch
5. 選擇 Branch: main (或 master)
6. 選擇 Folder: / (root)
7. 點擊 Save
8. 等待幾分鐘後，您的網站將在 `https://[您的用戶名].github.io/[repository名稱]` 上運行

### 本地測試

直接在瀏覽器中開啟 `index.html` 即可運行。

## 版本

v0.8.5
