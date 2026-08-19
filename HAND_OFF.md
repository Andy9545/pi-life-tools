# 你需要親手處理的事項

程式端 v1 已就緒(typecheck / lint / 62 tests 全過,`docs/` 已有 build)。以下項目**無法由本機 agent 代勞**,需你本人完成。

---

## A. 立刻做(約 5 分鐘)— 開啟公開網址

目前 `https://andy9545.github.io/pi-life-tools/` 回 **404**,代表 GitHub Pages 尚未啟用。

1. 開啟:https://github.com/Andy9545/pi-life-tools/settings/pages
2. **Source** 選 `Deploy from a branch`
3. **Branch** 選 `main` · **Folder** 選 `/docs`
4. 按 Save,等 1–3 分鐘
5. 瀏覽器開 `https://andy9545.github.io/pi-life-tools/` 確認首頁出現
6. 若 repo 是 **Private**,Pages 可能要付費或改 Public 才能給 Pioneer 測

完成後把正式 URL 記下來,上架與測試都用這個。

---

## B. 本機/手機自測(約 15 分鐘)

1. 一般瀏覽器開公開 URL,走一遍:
   - 首頁 8 工具圖示
   - 任一工具計算 → 生成數據卡 → 儲存 / 下載 PNG
   - 語言切換(至少 中↔英)
   - Settings
2. **Pi Browser** 內再開一次(必測):
   - SDK 是否初始化成功(無白屏)
   - 登入(若有按鈕/流程)
   - Share 是否跳出 Pi 分享
3. 有 bug 截圖,回報後再改程式

---

## C. 邀 Pioneer 實測(上架關鍵)

依 `PIONEER_TEST_CHECKLIST.md` 發給至少 2–3 位不同裝置的 Pioneer:

- 一人 Android + Pi Browser
- 一人 iPhone + Pi Browser(若有)
- 一人非你母語語言(驗證 i18n)

收集回覆欄位:裝置、Pi Browser 版本、各任務結果、主觀三問、截圖。  
(上架指南要求真實使用者測試;補助價格也參考此。)

---

## D. Pi App Studio 上架(需你帳號)

1. 用你的 Pi Developer 帳號登入 **Pi App Studio / Developer Portal**
2. 建立 App,欄位可直接抄 `STORE_LISTING.md`:
   - Name:`Pi Life Tools`
   - 短/長 Description
   - Category:優先 **Utilities**(或介面實際選項)
   - Contact:`wayen168@gmail.com`
   - App URL:Pages 啟用後的 HTTPS 網址
3. 上傳視覺:
   - Logo:`public/logo-1024.png`(或 `docs/logo-1024.png`)
   - Screenshots:`previews/` 裡 01、11、10、02 等
4. 看當下介面的**費用 / 補助 / 審核**提示並完成付款或申請(agent 無法代付)
5. 提交審核,等官方回覆

---

## E. 正式環境 sandbox 決策(上架前確認)

| 階段 | 設定 |
|------|------|
| 測試 / testnet | 預設即可(sandbox on) |
| 正式 mainnet | build 前:`VITE_PI_SANDBOX=false npm run build`,再覆蓋 `docs/` 並 push |

是否一定要 mainnet 以 App Studio 當下要求為準。

---

## F. 之後若改程式的部署流程(可再叫 agent)

```bash
source ~/.nvm/nvm.sh
npm run typecheck && npm run lint && npm test
npm run build
rm -rf docs && cp -r dist docs
# 再 git add / commit / push(需你明確要求才會 commit)
```

---

## 已完成(無需你再做)

- [x] 8 工具 + Dashboard + 數據卡 + 6 語系
- [x] Pi SDK 隔離層(無 payment)
- [x] 單元/元件測試 62 通過
- [x] typecheck / lint 通過
- [x] `docs/` 靜態 build 已進 repo
- [x] logo-1024 + 12 張 previews
- [x] 上架文案與 Pioneer 清單
- [x] 聯絡信箱已填 `wayen168@gmail.com`

---

## 建議你今天完成的最小路徑

1. **A** 開 GitHub Pages  
2. **B** 自己用 Pi Browser 點一遍  
3. **C** 丟 checklist 給 1 位 Pioneer  
4. **D** 進 App Studio 建草稿(URL + 圖 + 文案)

卡在任一步把錯誤畫面/訊息貼回來即可。
