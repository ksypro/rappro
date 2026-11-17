# Flow Gym v0.9.0

在原有 RAP FLOW COACH 加入 iPhone 優先的個人訓練模式。原有節拍器與 LocalStorage 紀錄保持可用。

## 啟動

執行 `npm start`，開啟 http://localhost:4189/gym.html 。啟動只需 Node.js；`npm install` 安裝自動測試工具。手機需要將網頁資產部署到 HTTPS（例如原有 GitHub Pages）；電腦 localhost 並非 iPhone 網址，普通區域網絡 HTTP 無法提供手機收音。

## 使用

選課程及 40–240 BPM，聽一輪示範、一 Bar 預備後跟練 16 Bars。三課為八分音符、每四 Bars 切換八分／三連音、三 Bars 有聲一 Bar 靜音。每四 Bars 可回聽並自行標記穩定或需重練。可原速或減五 BPM 重練，無自動評分或辨識。

錄音預設開啟，包含示範、預備、手機咪聲及合成參考拍聲；咪聲不回送喇叭。建議戴耳機，避免喇叭拍聲再次進入咪。無收音權限或不支援錄音時可純跟練。格式在執行時偵測。

## 資料與中斷

新紀錄及音訊存在此網站的 IndexedDB `rap-flow-gym`，與原有紀錄分開。可匯出音訊、JSON 自評紀錄及刪除。JSON 是備份供閱讀，第一版未提供匯入還原。清除網站資料會刪除全部本機資料，請匯出重要錄音。

儲存失敗時會標記未保存，保留於記憶體供下載及重試。切換 App、鎖屏或音訊暫停會嘗試結束並保存片段，唔會計成完成。iOS 強制終止頁面未必容許最後寫入，不能保證保存未完成錄音。

四 Bars 定位以錄音起點和音訊時鐘計算，適合回聽，不代表毫秒級踩拍測量；裝置延遲及編碼延遲仍需實機驗證。

## 驗證

`npm test`：課程時序、BPM 邊界、細分切換及靜音規則。

`npx playwright test`：手機尺寸流程、錄音保存／回放、自評重載、離線、權限拒絕、配額失敗、中斷及舊紀錄保留。

本機 Chromium 驗證不等同 iPhone Safari。實體 iPhone 尚須驗收 Safari 與主畫面 PWA、耳機／手機收音、音訊匯出、鎖屏及來電中斷。未實測前不可宣稱 iPhone 完整通過。

## 部署

發佈目標為原有 `ksypro/rappro` GitHub Pages，訓練入口為 `gym.html`。保持原有網站 origin/path 部署才能繼續存取該來源的舊資料。發布須包含所有 JS、CSS、HTML、manifest 及 icons，更新 SW 版本以更新離線資產。無後端、帳戶或第三方音訊 API。
