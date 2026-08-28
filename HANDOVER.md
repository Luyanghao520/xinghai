# 星海艺术团官网 · 项目交接文档（接手方必读）

> 最后更新：2026-08-27｜脱敏版，不含任何真实密钥 / 平台密码明文
> 分工：本文件 = 权威交接（怎么接手、怎么改、怎么部署）；`README.md` = 功能 / 运行；`AI_CONTEXT.md` = 项目记忆（含测试账号、艺术团背景资料、设计规范）

---

## 0. 接手第一件事（照着走 30 秒定位）

1. 确认工作目录：`C:\Users\陆阳昊\Desktop\星海艺术团官网建设`（Windows，owner 本机，就是仓库根目录）。
2. 确认线上：`https://Luyanghao.pythonanywhere.com`（PythonAnywhere 免费版）；GitHub：`github.com/Luyanghao520/xinghai`（远端 main 已与本地同步）。
3. 本地跑通：`python app.py` → `http://127.0.0.1:8000`。
4. 通读 `README.md` 与 `AI_CONTEXT.md` 建立全貌。

---

## 1. 项目一句话

上海立信会计金融学院 **星海艺术团** 官方网站 + 内部管理「大系统」。官网公开（招新 / 展示），工作端需登录（成员 / 干部）。数据完全分离、独立库。

---

## 2. 技术栈（现状）

| 层 | 技术 | 说明 |
|---|---|---|
| 后端 | Flask 3.x，单文件 `app.py` | 全部路由 + 初始化 + 建表 + 鉴权 |
| 官网首页 | **React + Vite + TypeScript**（`portfolio-landing/`） | 构建产物落到 `portfolio-landing/landing/`，由 Flask 直接伺服 |
| 其余 11 个系统页面 | 原生 HTML/CSS/JS，移动优先 | recruit / login / work / members / reimburse / reserve / bulletin / cms / approval / assets / register |
| 数据 | SQLite，**8 个独立库** | registrations / members / users / reimburse / reserve / bulletins / apply / assets |
| 首页背景 | 本地视频双方案 | 见 §4 |

> 历史遗留：仓库根目录还有一个旧的 `index.html`（原生首页），**线上首页已不用它**，根路由 `/` 返回的是 React 构建产物。别误改旧文件。

---

## 3. 目录结构（只列关键项）

```
.
├── app.py                    # Flask 后端（全部逻辑）；密钥三级加载
├── wsgi.py                   # PythonAnywhere WSGI（含用户名占位，需改）
├── Procfile                  # web: python app.py（Render/Railway 备用）
├── requirements.txt          # Flask>=3.0,<4.0；python-docx
├── config.example.json       # 密钥模板（复制为 config.json 填真实值，config.json 已被 gitignore）
├── content.json / kb.json    # 官网文案与群码 / 小星问答库（CMS 编辑）
├── *.html                    # 11 个旧系统页面（原生）
├── static/
│   ├── css/theme.css         # 全站共享暗色设计令牌 + 旧页统一背景
│   └── uploads/              # logo、showcase/sc01~23.jpg、bg-stage.mp4、bg-starfield.mp4/.jpg、群码
├── portfolio-landing/
│   ├── src/                  # React 源码（首页各 Section + FixedBackground 背景组件）
│   ├── index.html / vite.config.ts / package.json
│   └── landing/              # ★ 构建产物，Flask 实际伺服的就是这个目录
├── reference/                # 参考文档（招新方案等，非运行所需）
├── HANDOVER.md               # 本文件
├── README.md                 # 功能 / 运行 / 部署
└── AI_CONTEXT.md             # 项目记忆（测试账号、背景资料、设计规范）
```

---

## 4. 首页改动（React）与背景视频

### 4.1 改首页的完整流程

首页源码在 `portfolio-landing/src/`，改完必须构建 + 同步产物：

```powershell
cd portfolio-landing
npm run build                    # 产物在 dist/
# 同步到 Flask 实际伺服目录（先清旧的，再复制新的）
Remove-Item -Force landing\assets\*
Copy-Item -Force dist\index.html landing\index.html
Copy-Item -Force dist\assets\* landing\assets\
```

> 构建会生成带 hash 的 bundle（如 `index-XXXX.js`）。**旧 bundle 不会被自动删掉**，长期堆积（目前 `landing/assets/` 已残留十几个历史文件）。养成清理习惯：只保留 `landing/index.html` 里当前引用的那对 js/css。

### 4.2 背景视频双方案（本次重点改动）

- 组件：`portfolio-landing/src/components/FixedBackground.tsx`
- 视频文件（已入库）：`static/uploads/bg-stage.mp4`（星云漩涡，**默认方案**）、`bg-starfield.mp4` + `bg-starfield.jpg`（星空山景 + 海报兜底）
- 切换：URL 参数 `?bg=stage` / `?bg=star`，选择记忆在 sessionStorage（键 `xh-bg`）
- 无缝循环策略：stage = A/B 双视频交叉淡化；star = 单视频 ping-pong 往返
- **关键坑**：React 受控 `<video>` 属性在部分环境会导致「满缓冲却不解码、画面冻结」。现在改为在 effect 里用原生标签注入（innerHTML），别改回 React 受控属性。
- 构图参数在 `portfolio-landing/src/index.css` 的 `.bg-video` / `[data-bg="stage"]` 规则里（放大 185% + brightness 滤镜 + 贴底蓝雾层）。源片底部有天然黑场，靠「顶部锚定取景 + 蓝雾提亮」消解，改构图时注意别重新引入底部黑缝。

---

## 5. 部署：PythonAnywhere

线上域名 `Luyanghao.pythonanywhere.com`，免费版（**无 SSH**，控制台 2 个，CPU 100 秒/天，磁盘 512MB）。

### 5.1 方式一 · 手动（稳定）

1. PA 控制台 `Consoles → Bash`：`cd ~/mysite && git pull`
2. `Web` 标签点绿色 **Reload**
3. 访问强刷验证

### 5.2 方式二 · API 自动化（需 token）

PA API token 已存在本机 **`C:\Users\陆阳昊\.dsh\pa-token.txt`**（敏感凭据：勿提交、勿写进任何会 push 的文档；可在 PA Account 页 revoke）。

token 能做的事（`Authorization: Token <token>`）：
- 文件 API：`https://www.pythonanywhere.com/api/v0/user/Luyanghao/files/path/...`（读/写/删）
- Web 应用 Reload：`POST /api/v0/user/Luyanghao/webapps/Luyanghao.pythonanywhere.com/reload/`

> 踩坑：API 新建的 bash 控制台必须先在浏览器加载一次 iframe 才会真正启动，token 无法代劳；**优先用文件 API 直接传构建产物 + reload**，比控制台可靠。

### 5.3 GitHub 推送（本机需代理）

```powershell
git -c http.proxy=http://127.0.0.1:26561 push origin main
```

### 5.4 WSGI 与依赖

- `wsgi.py` 里的 `你的用户名` 需改为 `Luyanghao`，`from app import app as application`
- 依赖按 `requirements.txt` 装；静态文件 `/static/` 映射到 `~/mysite/static`（README §部署 有完整逐步说明）

---

## 6. 密钥与账号（脱敏）

- 密钥读取优先级：**环境变量 `XINGHAI_ADMIN_KEY` / `XINGHAI_SECRET` > `config.json` > `app.py` 顶部内置默认**
- `config.json` 已被 .gitignore 排除，绝不提交；`config.example.json` 是模板
- 测试账号、默认密码、后台入口：见 `AI_CONTEXT.md` §2（含「空库重建账号」的 Python 命令）

---

## 7. 已知坑 / 注意事项

- **首页构建产物需提交进 git**（`portfolio-landing/landing/`），否则 PA `git pull` 后首页缺文件。但记得清理历史 bundle，别越积越多。
- **React 受控 video 解码冻结**：背景视频必须走原生标签注入（§4.2），是踩出来的硬约束。
- **8 个独立 SQLite 库**：`*.db` 全被 gitignore，线上数据只存在于 PA 磁盘；**定期备份** `cd ~/mysite && tar czf ~/backup-$(date +%Y%m%d).tar.gz *.db`。
- **免费版限制**：无 SSH、CPU 100 秒/天、磁盘 512MB；招新季高访问可能触顶变慢。
- **移动端**：旧系统页已做 480–768 双断点适配；改样式别破坏。
- **`.tools/` 已加入 gitignore**：本地调试产物（headless Chrome 截图/转储、ffmpeg、hls 片段）不要提交。
- **公开仓库**：任何密钥、token、真实密码都别写进会 push 的文档。

---

## 8. 接手检查清单

- [ ] 确认工作目录 / 线上地址 / GitHub 远端与本地同步（`git status` / `git log`）
- [ ] `python app.py` 本地跑通
- [ ] 通读 `README.md`、`AI_CONTEXT.md`
- [ ] 看清 `portfolio-landing/landing/` 是构建产物、`portfolio-landing/src/` 是源码
- [ ] 改首页后走完「构建 → 同步 landing → 提交 → 推送 → PA 更新」全流程
- [ ] 设置强密钥（环境变量或 config.json），部署后验证

---

*本文件为维护会话整理（脱敏），随项目推进请同步更新。*
