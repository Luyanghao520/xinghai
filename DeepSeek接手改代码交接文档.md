# 星海艺术团官网 · DeepSeek 接手改代码交接文档

> 整理日期：2026-08-25｜给新的代码维护 AI（DeepSeek）的交接说明书
> 配套：`README.md`（功能/运行）、`AI_CONTEXT.md`（项目记忆）、`部署平台对比_PA_vs_Railway.md`（选型）

---

## 0. 给 DeepSeek 的一段话

你是本项目新的代码维护 AI。本文档解决三件事：**① PythonAnywhere 的 CPU 配额是多少；② 源代码在哪；③ 你接手改代码要怎么做**。当前最大的坑是：**GitHub 推送被沙箱网络阻断**（详见 §8），改代码不受影响，但"上线"必须走外部通道。

---

## 1. 项目一句话

上海立信会计金融学院 **星海艺术团** 官网 + 内部管理「大系统」。Flask 单文件 `app.py` + 6 个独立 SQLite 库；前端原生 HTML/CSS/JS，移动优先。线上：**`https://Luyanghao.pythonanywhere.com`**（PythonAnywhere 免费版）。

---

## 2. PythonAnywhere 配额（官方 2026 数据）

**免费版（Beginner）**：
| 项 | 配额 |
|---|---|
| **CPU** | **100 CPU 秒 / 天**（按日滚动；招新季高访问可能触顶变慢） |
| Web 应用 | 1 个，域名 `用户名.pythonanywhere.com` |
| 控制台 | 2 个 |
| SSH | ❌ 无 |
| 定时任务 / Always-on | ❌ 无 |
| 出站网络 | 仅白名单站点、HTTP(S)（**针对服务端代码请求**；不影响访客浏览器加载 CDN） |
| 磁盘 | 512MB |

**付费 Developer（$10/月）**：5000 CPU 秒/天（控制台/定时任务/always-on）、自定义域名、SSH、5GB 磁盘、约 15 万次/日访问能力。

- 参考：`https://www.pythonanywhere.com/pricing/`（CPU 细则见 tarpit 页）
- ⚠️ 更正：早期文档写"约 500 秒/天"是旧数据，**2024 年起免费版已改为 100 秒/天**。

---

## 3. 源代码在哪里（4 个位置，版本有差异！）

| # | 位置 | 版本 | 说明 |
|---|---|---|---|
| ① | PythonAnywhere `~/mysite`（线上） | **旧版（无 FX）** | git pull + Reload 后可更新 |
| ② | GitHub `github.com/Luyanghao520/xinghai` | 旧版、**历史上传不全** | 需完整推送后才算权威 |
| ③ | 沙箱主副本 `/root/mysite` | **最新（含 FX）** | 21 个提交未推送 |
| ④ | 工作区导出 `/workspace/index.html`、`/workspace/app.py` | **最新（含 FX）** | DeepSeek 从这里直接取 |

- 备份：仓库根目录 `星海艺术团官网源码.zip`（约 2.6MB）
- **版本顺序：④ = ③（最新）> ① = ②（旧）**。改代码以 ③/④ 为准，改完同步回 ③，最后推到 ②。

---

## 4. 本地运行（沙箱里验证用）

```bash
cd /root/mysite
pip install -r requirements.txt   # Flask>=3.0,<4.0；python-docx
python app.py                     # 默认 8000 端口 → http://127.0.0.1:8000
```
首次启动自动创建 6 个空库与表。默认账号见 §9。

---

## 5. 关键文件（改代码必看）

- `app.py`：全部后端路由 / 建表 / 鉴权；`ADMIN_KEY`、`SECRET` 在**顶部明文**（⚠️ 见 §8）
- `index.html`：首页（含最近加的 FX）
- `content.json`：官网 / 招新文案与群码（CMS 在线编辑）
- `kb.json`：吉祥物"小星"问答库
- `static/uploads/`：`logo.png`、`showcase/sc01~23.jpg`（轮播照）、咨询群二维码
- 各页面：`recruit / login / work / members / reimburse / reserve / bulletin / cms / approval / assets / register .html`
- `wsgi.py`：PythonAnywhere WSGI（用户名占位需改）；`Procfile`：Railway/Render 备用

---

## 6. 最近一次改动：首页 FX（含回退方案）

- 提交 `006e023`，改动**全在 `index.html`**：
  - 卡片镜面高光（纯 CSS，`.spec-fx` + 跟随鼠标径向高光 + 常驻微光）
  - 标题 + 正文逐字动画（GSAP SplitText 移植，递归拆字保留 `<b>`/`<br>`）
- **回退方式（随时可整体/分块还原）**：
  1. 改 `index.html` 中 `window.XINGHAI_FX = { specularCards, splitHeadings, splitBody }`，对应项设 `false`；
  2. 或删掉 `<style>` 内 `/* XINGHAI FX START … END */` 与 `</body>` 前 `<!-- XINGHAI FX START … END -->` 两块。
- `app.py` 里多出的 `/preview`、`/preview2` 是实验预览路由（对应 `index_preview*.html`），**可留可删**，不影响首页 FX。

---

## 7. 部署流程（改完怎么上线）

1. 改代码 → `git add/commit`（在 `/root/mysite`）。
2. 推 GitHub：**当前沙箱被网络阻断推不出去**（§8），需从可达环境（owner 本机 / 其他通道）推送。
3. PythonAnywhere：`Consoles → Bash` 里 `cd ~/mysite && git pull` → **Web 标签点 Reload** 生效。
4. 备选 Railway：仓库已带 `Procfile`，连 GitHub 自动部署；但 **SQLite 需挂 Volume** 否则数据会丢（详见对比文档）。

---

## 8. 当前已知问题（DeepSeek 务必注意）

- **GitHub 推送阻断**：`github.com` 被沙箱 DNS 解析到黑洞 `198.18.0.17`，TLS 握手失败（`gnutls_handshake() failed`）；已重试 40 次均失败。**从沙箱推不了 GitHub**，只能走外部通道。
- **历史上传不全**：GitHub 仓库曾因网页拖拽上传漏文件而变空（缺 `app.py`），接手后务必做一次**完整推送**。
- **密钥硬编码**：`ADMIN_KEY` / `SECRET` 明文在 `app.py` 顶部 + `config.json`，公开仓库建议改环境变量。
- **免费版限制**：CPU 100 秒/天、磁盘 512MB、无 SSH/定时任务——注意流量峰值与图片体积。
- **数据库无自动备份**：定期 `cd ~/mysite && tar czf ~/backup-$(date +%Y%m%d).tar.gz *.db`。
- **移动端适配**：已做 480–768 双断点，改样式别破坏。
- **特效依赖**：GSAP 由**访客浏览器**从 jsdelivr CDN 加载（服务端不依赖外网）；访客无外网时逐字动画自动跳过、文本正常显示，不影响功能。

---

## 9. 账号与密钥（测试 / 排查用）

| 角色 | 学号/工号 | 初始密码 | 角色 |
|---|---|---|---|
| 系统管理员 | `000000000` | `xinghai2026` | 主席 |
| 陈嘉豪 | `251400143` | `400143` | 副主席（浦东） |
| 郝博雅 | `251400255` | `400255` | 副主席（松江） |

- 招新后台 / CMS：`/admin?key=xinghai2026`、`/cms`（`ADMIN_KEY`）
- Flask 密钥：`SECRET = xinghai-art-troupe-2026`
- PythonAnywhere 平台登录：用户名 `Luyanghao`（**平台密码不在仓库**，需 owner 提供）
- 新部署空库时，用 `AI_CONTEXT.md` §2 的 Python 命令重建账号（密码哈希 `sha256(SECRET+学号)`）

---

## 10. 首次接手检查清单

- [ ] 从 `/workspace`（或 `/root/mysite`）拿到含 FX 的最新代码
- [ ] `python app.py` 本地跑通（127.0.0.1:8000）
- [ ] 通读 `README.md`、`AI_CONTEXT.md`、`部署平台对比_PA_vs_Railway.md`
- [ ] 确认 `window.XINGHAI_FX` 三个开关当前为 `true`
- [ ] 改代码前先 `git status` / `git log` 看清未推送提交
- [ ] 改完 commit；网络恢复或走外部通道后推 GitHub
- [ ] 部署后 PythonAnywhere 上 `git pull` + Reload 验证

---

*本文件由维护会话整理；随项目推进请同步更新。*
