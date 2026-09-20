# English

## What's changed

<!-- app-update-notes:en:start -->
### Added
- **Edge Dock:** Adds an opt-in rail at the screen edge for limits and usage, with auto-hide or always-visible modes and hover cards for account limits, recent sessions, and token usage. Configure items under **Settings → Window → Floating & Tray**, or toggle it from the menu bar or system tray. macOS and Windows. (#720)

### Improved
- **macOS tray menu:** Shows ⌘Q beside **Quit Token Monitor**. (#704)
- **Kimi account:** Leads with the Kimi Code API key; the optional Kimi Web access token only fills quota windows the Code API does not return. (#700)

### Fixed
- **Kimi quota:** An API key on its own now shows the Monthly quota with its Kimi/Code breakdown, instead of only 5-hour and Weekly. (#700)
- **ZCode quota:** Restores Coding Plan and Start/Weekend quota on ZCode 3.12.3 installs. (#719)
- **ZCode usage:** No longer keeps rescanning in the background on an idle install. (#709)
- **Antigravity quota:** Reads the daily quota service the Antigravity CLI uses for the 5-hour and Weekly windows, and no longer falls back to an older per-model breakdown when local data is missing or stale. (#706)
- **Cursor usage:** No longer counts legacy sessions twice, and the 30D view no longer reads high from outdated prices. (#683)
<!-- app-update-notes:en:end -->
## Download

- **macOS Apple Silicon** — [Token-Monitor-0.59.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-0.59.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.59.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-0.59.0-x64.dmg)
- **Windows Installer** — [Token-Monitor-Setup-0.59.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-Setup-0.59.0.exe) (recommended)
- **Windows Portable** — [Token-Monitor-0.59.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-0.59.0.exe) (no install required)
- **Linux x64** — [Token-Monitor-0.59.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-0.59.0.AppImage)

<details>
<summary><strong>First launch and other notes</strong></summary>

### First launch

**macOS:** the app is Developer ID-signed and notarized by Apple. Open the `.dmg`, then drag Token Monitor to Applications.

**Windows:** both executables are signed ([how to verify](https://github.com/Javis603/token-monitor/blob/main/docs/code-signing.md#verify-a-download)).

**Linux:** mark the AppImage executable, then run it:

```bash
chmod +x "Token Monitor"*.AppImage
./"Token Monitor"*.AppImage
```

### Other notes

Other platforms are not pre-built — run from source per the [README](https://github.com/Javis603/token-monitor#readme). The macOS `.zip` is the same app repackaged; ignore it unless you specifically need it.

### tokscale dependency

Tokscale is bundled with this app. See **Settings → Tokscale** for the exact version
and the option to download a newer version directly from npm. Tokscale is MIT,
open-source: https://github.com/junhoyeo/tokscale

</details>

---

# 中文

## 更新内容

<!-- app-update-notes:zh:start -->
### 新增
- **侧边栏（默认关闭）：** 额度与用量常驻屏幕边缘，支持自动隐藏或始终显示，悬停可查看账号额度、最近会话与 Token 用量。可在 **设置 → 窗口 → 浮窗与系统托盘** 中配置项目，也可从菜单栏或系统托盘开关。支持 macOS 与 Windows。（#720）

### 改进
- **macOS 托盘菜单：** 在“退出 Token Monitor”旁显示 ⌘Q。（#704）
- **Kimi 账号：** 改以 Kimi Code API 密钥为主，选填的 Kimi Web access token 只用于补齐 Code API 未返回的额度窗口。（#700）

### 修复
- **Kimi 额度：** 只填 API 密钥时也会显示 Monthly 额度及其 Kimi/Code 明细，不再只有 5-hour 与 Weekly 窗口。（#700）
- **ZCode 额度：** 恢复 ZCode 3.12.3 上的 Coding Plan 与 Start/Weekend 额度。（#719）
- **ZCode 用量：** 闲置时不再反复在后台重扫。（#709）
- **Antigravity 额度：** 5-hour 与 Weekly 窗口改用 Antigravity CLI 所用的每日额度服务，本地数据缺失或过时时也不再退回旧版按模型划分的显示。（#706）
- **Cursor 用量：** 不再重复统计旧版会话，30D 也不会因价格过时而偏高。（#683）
<!-- app-update-notes:zh:end -->

## 下载

- **macOS Apple Silicon** — [Token-Monitor-0.59.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-0.59.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.59.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-0.59.0-x64.dmg)
- **Windows 安装版** — [Token-Monitor-Setup-0.59.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-Setup-0.59.0.exe)（推荐）
- **Windows 便携版** — [Token-Monitor-0.59.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-0.59.0.exe)（免安装）
- **Linux x64** — [Token-Monitor-0.59.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-0.59.0.AppImage)

<details>
<summary><strong>首次启动与其他说明</strong></summary>

### 首次启动

**macOS：** 应用已使用 Developer ID 签名并通过 Apple 公证。打开 `.dmg`，然后把 Token Monitor 拖到 Applications。

**Windows：** 两个可执行文件均已签名（[查看验证方法](https://github.com/Javis603/token-monitor/blob/main/docs/code-signing.md#verify-a-download)）。

**Linux：** 先给 AppImage 执行权限，然后运行：

```bash
chmod +x "Token Monitor"*.AppImage
./"Token Monitor"*.AppImage
```

### 其他说明

其他平台暂不提供预构建版本，请参考 [README](https://github.com/Javis603/token-monitor#readme) 从源码运行。macOS 的 `.zip` 只是同一个 app 的重新打包版本，除非你明确需要，否则可以忽略。

### tokscale 依赖

Tokscale 已随应用内置。你可以在 **设置 → Tokscale** 查看确切版本，
也可以直接从 npm 下载更新版本。Tokscale 是 MIT 开源项目：
https://github.com/junhoyeo/tokscale

</details>

---

<details>
<summary><strong>Full Changelog:</strong> <a href="https://github.com/Javis603/token-monitor/compare/v0.58.0...v0.59.0">v0.58.0...v0.59.0</a></summary>

<!-- github-generated-release-notes -->

</details>

<details>
<summary>繁體中文 · 한국어 · 日本語</summary>

<details>
<summary><strong>繁體中文</strong></summary>

## 繁體中文

## 更新內容

<!-- app-update-notes:zh-TW:start -->
### 新增
- **側邊欄（預設關閉）：** 額度與用量常駐螢幕邊緣，支援自動隱藏或永遠顯示，游標移入可查看帳號額度、最近會話與 Token 用量。可在 **設定 → 視窗 → 浮窗與系統列** 中設定項目，也可從選單列或系統匣開關。支援 macOS 與 Windows。（#720）

### 改進
- **macOS 系統匣選單：** 在「結束 Token Monitor」旁顯示 ⌘Q。（#704）
- **Kimi 帳號：** 改以 Kimi Code API 金鑰為主，選填的 Kimi Web access token 只用於補齊 Code API 未回傳的額度窗口。（#700）

### 修復
- **Kimi 額度：** 只填 API 金鑰時也會顯示 Monthly 額度及其 Kimi/Code 明細，不再只有 5-hour 與 Weekly 窗口。（#700）
- **ZCode 額度：** 恢復 ZCode 3.12.3 上的 Coding Plan 與 Start/Weekend 額度。（#719）
- **ZCode 用量：** 閒置時不再反覆在背景重掃。（#709）
- **Antigravity 額度：** 5-hour 與 Weekly 窗口改用 Antigravity CLI 所用的每日額度服務，本機資料缺失或過期時也不再退回舊版按模型劃分的顯示。（#706）
- **Cursor 用量：** 不再重複計入舊版會話，30D 也不會因價格過期而偏高。（#683）
<!-- app-update-notes:zh-TW:end -->

## 下載

- **macOS Apple Silicon** — [Token-Monitor-0.59.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-0.59.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.59.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-0.59.0-x64.dmg)
- **Windows 安裝版** — [Token-Monitor-Setup-0.59.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-Setup-0.59.0.exe)（推薦）
- **Windows 便攜版** — [Token-Monitor-0.59.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-0.59.0.exe)（免安裝）
- **Linux x64** — [Token-Monitor-0.59.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-0.59.0.AppImage)

</details>

<details>
<summary><strong>한국어</strong></summary>

## 한국어

## 업데이트 내용

<!-- app-update-notes:ko:start -->
### 추가
- **가장자리 도크(기본 꺼짐):** 화면 가장자리에 한도와 사용량을 표시하는 레일을 추가합니다. 자동 숨김 또는 항상 표시를 고를 수 있고, 계정 한도·최근 세션·토큰 사용량을 보여 주는 카드도 표시됩니다. **설정 → 창 → 플로팅 및 트레이**에서 구성하거나 메뉴 막대나 시스템 트레이에서 켤 수 있습니다. macOS와 Windows. (#720)

### 개선
- **macOS 트레이 메뉴:** **Token Monitor 종료** 옆에 ⌘Q를 표시합니다. (#704)
- **Kimi 계정:** Kimi Code API 키를 기준으로 하며, 선택 사항인 Kimi Web access token은 Code API가 반환하지 않는 할당량 창만 채웁니다. (#700)

### 수정
- **Kimi 할당량:** API 키만 있어도 Monthly 할당량과 Kimi/Code 내역이 표시됩니다. 이전에는 5-hour와 Weekly만 표시되었습니다. (#700)
- **ZCode 할당량:** ZCode 3.12.3 환경에서 Coding Plan과 Start/Weekend 할당량이 다시 표시됩니다. (#719)
- **ZCode 사용량:** 유휴 상태에서도 백그라운드 재스캔이 반복되던 문제를 수정했습니다. (#709)
- **Antigravity 할당량:** 5-hour 및 Weekly 창이 Antigravity CLI가 사용하는 일일 할당량 서비스를 읽으며, 로컬 데이터가 없거나 오래되어도 이전 방식의 모델별 표시로 되돌아가지 않습니다. (#706)
- **Cursor 사용량:** 레거시 세션을 두 번 집계하지 않으며, 30D도 오래된 가격 때문에 높게 표시되지 않습니다. (#683)
<!-- app-update-notes:ko:end -->

## 다운로드

- **macOS Apple Silicon** — [Token-Monitor-0.59.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-0.59.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.59.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-0.59.0-x64.dmg)
- **Windows 설치 버전** — [Token-Monitor-Setup-0.59.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-Setup-0.59.0.exe) (권장)
- **Windows 포터블 버전** — [Token-Monitor-0.59.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-0.59.0.exe) (설치 필요 없음)
- **Linux x64** — [Token-Monitor-0.59.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-0.59.0.AppImage)

</details>

<details>
<summary><strong>日本語</strong></summary>

## 日本語

## 更新内容

<!-- app-update-notes:ja:start -->
### 追加
- **エッジドック（既定ではオフ）：** 画面の端に上限と使用量を表示するレールを追加します。自動的に隠す／常に表示を選べ、アカウント上限・最近のセッション・トークン使用量を示すカードも表示されます。**設定 → ウィンドウ → フローティング＆トレイ**で構成するか、メニューバーやシステムトレイから切り替えられます。macOS と Windows に対応。（#720）

### 改善
- **macOS のトレイメニュー：** 「Token Monitorを終了」の横に ⌘Q を表示します。（#704）
- **Kimi アカウント：** Kimi Code API キーを主とし、任意の Kimi Web access token は Code API が返さないクォータ枠を補う場合にのみ使われます。（#700）

### 修正
- **Kimi のクォータ：** API キーだけでも Monthly クォータと Kimi/Code の内訳が表示されます。以前は 5-hour と Weekly のみでした。（#700）
- **ZCode のクォータ：** ZCode 3.12.3 の環境で Coding Plan と Start/Weekend のクォータが再び表示されます。（#719）
- **ZCode の使用量：** アイドル状態でもバックグラウンドの再スキャンが繰り返される問題を修正しました。（#709）
- **Antigravity のクォータ：** 5-hour と Weekly の枠が Antigravity CLI と同じ日次クォータサービスを参照するようになり、ローカルデータがない場合や古い場合でも以前のモデル別表示に戻りません。（#706）
- **Cursor の使用量：** 旧形式のセッションを二重に集計せず、30D も古い価格によって高く表示されません。（#683）
<!-- app-update-notes:ja:end -->

## ダウンロード

- **macOS Apple Silicon** — [Token-Monitor-0.59.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-0.59.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.59.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-0.59.0-x64.dmg)
- **Windows インストーラー** — [Token-Monitor-Setup-0.59.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-Setup-0.59.0.exe)（推奨）
- **Windows ポータブル版** — [Token-Monitor-0.59.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-0.59.0.exe)（インストール不要）
- **Linux x64** — [Token-Monitor-0.59.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.59.0/Token-Monitor-0.59.0.AppImage)

</details>

</details>

