# Pi Life Tools — 上架資料準備

> 供 Pi App Studio Developer Portal 註冊時填寫。實際欄位名稱/選項以 App Studio 當下介面為準。

---

## 1. App 名稱

**Pi Life Tools**

---

## 2. App Description(上架簡介)

### 短版(若介面有字數限制,優先用此)

> Pi Life Tools 是 Pi 生態專用的人生工具 App。8 個工具一站式整合財務健康、複利、目標、人生時間、房貸、債務、決策與時間價值,並可生成個人化人生數據卡,在手機上隨時反思與追蹤自己的人生數據。

### 長版(若允許較長描述)

> Pi Life Tools 是一個為 Pi 生態系使用者打造的人生工具 App,把分散的人生計算整合到一個 My Life Dashboard。
>
> **8 個人生工具:**
> - 財務健康:儲蓄率、支出比、預備金覆蓋與健康分數
> - 複利計算:本金 + 月投入的長期成長預估
> - 人生目標:進度追蹤、預估完成時間、每月所需投入
> - 人生時間:已過與剩餘的年/月/週、人生進度
> - 房貸:每月還款、總利息、利息占比
> - 債務還款:還款時間、總利息、不足利息警告
> - 人生決策:8 因素結構化評分,輔助思考而非替你決定
> - 時間價值:時薪/分薪、商品換算工時
>
> **特色:**
> - 每個計算完成後可生成「人生數據卡」,可預覽、儲存、分享與下載圖片
> - My Life Dashboard 累積你的工具結果與近期數據卡
> - 支援 6 種語言(繁中、簡中、英文、日文、韓文、西班牙文),自動偵測並可手動切換
> - 所有資料保存在你的本機(Local Storage),不上傳伺服器
> - Mobile-first 設計,適合手機與 Pi Browser 使用
>
> 結果為估算,僅供個人反思與教育參考,不提供投資保證或專業諮詢。

---

## 3. Category(分類建議)

官方 docs 未列出固定 category 清單,以下依 App 性質排序建議。**進 App Studio 時請以介面下拉的實際選項為準**,優先選:

| 優先順序 | 建議 category | 理由 |
|---------|--------------|------|
| 1 | **Utilities** | 8 個計算工具本質是實用工具,最貼切 |
| 2 | **Finance** | 多數工具屬財務計算(房貸/債務/複利/財務健康) |
| 3 | **Productivity** | 人生規劃與追蹤屬生產力範疇 |
| 4 | **Lifestyle** | 人生反思工具可歸生活方式 |

若介面只允單選:選 **Utilities**(涵蓋性最廣,且 Dashboard 與數據卡非純財務)。
若允多選:Utilities + Finance。

---

## 4. 目標使用者

- Pi 生態系 Pioneer,想在手機上快速做人生相關計算與反思
- 關注個人財務健康、人生目標進度、時間價值的成年人
- 偏好本機保存資料、不願將個人財務資料上傳雲端的使用者

---

## 5. 聯絡方式(需你填入實際資訊)

> ⚠️ 以下為 placeholder,上架前請替換為你的真實聯絡管道。

- 電子郵件:`[你的 email]`
- Pi Browser 內聯絡:`[可選]`
- 回報錯誤:`[email 或 Fireside Forum 帳號]`

---

## 6. 視覺資產

- **logo**:`public/favicon.svg`(Pi 字樣紫色圓角)
- **預覽圖**:`previews/` 目錄(由 Playwright 截圖產生,見下節)

---

## 7. 部署資訊

- **型態**:靜態 Web App(純 client-side)
- **build 指令**:`npm run build` → 產出 `dist/`
- **託管需求**:任一靜態主機 + HTTPS(GitHub Pages / Netlify / Vercel / 其他)
- **Pi SDK sandbox**:testnet 用 `VITE_PI_SANDBOX=true`,mainnet 用 `VITE_PI_SANDBOX=false`
- **無 backend / 無 API key / 無 payment**:v1 不需要後端、API key 或 Pi payment 資格

---

## 8. 上架前檢查表對照

| 面向 | 狀態 |
|------|------|
| 功能 | ✓ 8 工具全流程實測 |
| 內容 | ✓ 名實相符 |
| 資料 | ✓ 無敏感資料 |
| 權利 | ✓ 純自製 + OSS |
| Pi 整合 | ✓ SDK 已測(待 Pi Browser 實測登入) |
| 後端 | ✓ 不依賴,Local Storage |
| 費用 | 待進 App Studio 看當下提示 |
| 發現性 | description ✓ / category ✓ / 預覽圖待產 / link 待部署 |
| 安全性 | ✓ 無賭博/估值/惡意 |
| 維運 | git 版控 ✓ / 聯絡方式待填 |
