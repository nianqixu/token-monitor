# English

## What's changed

<!-- app-update-notes:en:start -->
### Added
- **Settings list search:** Adds search fields for filtering the tracked tools and AI Tool Limits providers. (#590)

### Fixed
- **Cursor usage:** Fixes Cursor usage fetch failures caused by an upstream connection change. (#596)
- **Cursor status (Windows):** Fixes Cursor being incorrectly reported as undetected when its cache is stored in the user's home directory. (#563)
- **DeepSeek Harness and Command Code usage:** Corrects DeepSeek Harness summary counts and Command Code v3 usage and cost totals. (#596)
- **Hidden UI:** Fixes hidden panels, notices, and controls remaining visible or reserving space. (#593)
- **Muse models:** Fixes Muse models using a fallback color instead of Meta's color in the Models breakdown.
<!-- app-update-notes:en:end -->

## Download

- **macOS Apple Silicon** — [Token-Monitor-0.53.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-0.53.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.53.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-0.53.0-x64.dmg)
- **Windows Installer** — [Token-Monitor-Setup-0.53.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-Setup-0.53.0.exe) (recommended)
- **Windows Portable** — [Token-Monitor-0.53.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-0.53.0.exe) (no install required)
- **Linux x64** — [Token-Monitor-0.53.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-0.53.0.AppImage)

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
- **设置列表搜索：** 新增搜索栏，可筛选“工具”列表中的已追踪工具，以及“AI 工具额度”列表中的提供方。（#590）

### 修复
- **Cursor 用量：** 修复 Cursor 用量获取失败的问题。（#596）
- **Cursor 状态（Windows）：** 修复 Cursor 缓存位于用户主目录时被错误识别为未检测到的问题。（#563）
- **DeepSeek Harness 与 Command Code 用量：** 修正 DeepSeek Harness 摘要计数，以及 Command Code v3 的用量和成本统计。（#596）
- **隐藏内容：** 修复部分已隐藏的面板、提示和控件仍会显示或占用空间的问题。（#593）
- **Muse 模型：** 修复“模型”明细中的 Muse 模型未使用 Meta 配色的问题。
<!-- app-update-notes:zh:end -->

## 下载

- **macOS Apple Silicon** — [Token-Monitor-0.53.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-0.53.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.53.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-0.53.0-x64.dmg)
- **Windows 安装版** — [Token-Monitor-Setup-0.53.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-Setup-0.53.0.exe)（推荐）
- **Windows 便携版** — [Token-Monitor-0.53.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-0.53.0.exe)（免安装）
- **Linux x64** — [Token-Monitor-0.53.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-0.53.0.AppImage)

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
<summary><strong>Full Changelog:</strong> <a href="https://github.com/Javis603/token-monitor/compare/v0.52.0...v0.53.0">v0.52.0...v0.53.0</a></summary>

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
- **設定列表搜尋：** 新增搜尋欄，可篩選「工具」列表中的已追蹤工具，以及「AI 工具額度」列表中的供應商。（#590）

### 修復
- **Cursor 用量：** 修復 Cursor 用量取得失敗的問題。（#596）
- **Cursor 狀態（Windows）：** 修復 Cursor 快取位於使用者主目錄時，被錯誤判定為未偵測到的問題。（#563）
- **DeepSeek Harness 與 Command Code 用量：** 修正 DeepSeek Harness 摘要計數，以及 Command Code v3 的用量與成本統計。（#596）
- **隱藏內容：** 修復部分已隱藏的面板、提示與控制項仍會顯示或佔用空間的問題。（#593）
- **Muse 模型：** 修復「模型」明細中的 Muse 模型未使用 Meta 配色的問題。
<!-- app-update-notes:zh-TW:end -->

## 下載

- **macOS Apple Silicon** — [Token-Monitor-0.53.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-0.53.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.53.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-0.53.0-x64.dmg)
- **Windows 安裝版** — [Token-Monitor-Setup-0.53.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-Setup-0.53.0.exe)（推薦）
- **Windows 便攜版** — [Token-Monitor-0.53.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-0.53.0.exe)（免安裝）
- **Linux x64** — [Token-Monitor-0.53.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-0.53.0.AppImage)

</details>

<details>
<summary><strong>한국어</strong></summary>

## 한국어

## 업데이트 내용

<!-- app-update-notes:ko:start -->
### 추가
- **설정 목록 검색:** 추적 도구와 AI 도구 한도 제공자 목록을 검색하는 필드를 추가했습니다. (#590)

### 수정
- **Cursor 사용량:** 업스트림 연결 변경으로 Cursor 사용량을 가져오지 못하던 문제를 수정했습니다. (#596)
- **Cursor 상태(Windows):** 사용자 홈 디렉터리에 Cursor 캐시가 있을 때 Windows에서 Cursor가 감지되지 않은 것으로 잘못 표시되던 문제를 수정했습니다. (#563)
- **DeepSeek Harness 및 Command Code 사용량:** DeepSeek Harness 요약 횟수와 Command Code v3 사용량 및 비용 집계를 수정했습니다. (#596)
- **숨겨진 요소:** 숨긴 패널, 안내문, 컨트롤이 여전히 표시되거나 공간을 차지하던 문제를 수정했습니다. (#593)
- **Muse 모델:** 모델 상세 내역에서 Muse 모델이 Meta 색상 대신 대체 색상을 사용하던 문제를 수정했습니다.
<!-- app-update-notes:ko:end -->

## 다운로드

- **macOS Apple Silicon** — [Token-Monitor-0.53.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-0.53.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.53.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-0.53.0-x64.dmg)
- **Windows 설치 버전** — [Token-Monitor-Setup-0.53.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-Setup-0.53.0.exe) (권장)
- **Windows 포터블 버전** — [Token-Monitor-0.53.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-0.53.0.exe) (설치 필요 없음)
- **Linux x64** — [Token-Monitor-0.53.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-0.53.0.AppImage)

</details>

<details>
<summary><strong>日本語</strong></summary>

## 日本語

## 更新内容

<!-- app-update-notes:ja:start -->
### 追加
- **設定リスト検索：** 追跡ツールとAIツール制限のプロバイダーを検索する欄を追加しました。（#590）

### 修正
- **Cursorの使用量：** アップストリーム接続の変更によりCursorの使用量を取得できなくなっていた問題を修正しました。（#596）
- **Cursorの状態（Windows）：** Cursorのキャッシュがユーザーのホームディレクトリにある場合に、Cursorが未検出と誤って表示される問題を修正しました。（#563）
- **DeepSeek HarnessとCommand Codeの使用量：** DeepSeek Harnessの要約回数とCommand Code v3の使用量・コスト集計を修正しました。（#596）
- **非表示要素：** 非表示にしたパネル、通知、コントロールが表示されたままになったり、空間を占有したりする問題を修正しました。（#593）
- **Museモデル：** 「モデル」の内訳でMuseモデルがMetaの色ではなくフォールバック色を使用していた問題を修正しました。
<!-- app-update-notes:ja:end -->

## ダウンロード

- **macOS Apple Silicon** — [Token-Monitor-0.53.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-0.53.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.53.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-0.53.0-x64.dmg)
- **Windows インストーラー** — [Token-Monitor-Setup-0.53.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-Setup-0.53.0.exe)（推奨）
- **Windows ポータブル版** — [Token-Monitor-0.53.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-0.53.0.exe)（インストール不要）
- **Linux x64** — [Token-Monitor-0.53.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.53.0/Token-Monitor-0.53.0.AppImage)

</details>

</details>
