# 星海艺术团官网 · 项目交接文档（接手方必读）

> 最后更新：2026-08（由维护会话整理，脱敏版，不含任何真实密钥/账号明文）
> 配套文档：`README.md`（功能/运行/部署）、`AI_CONTEXT.md`（AI 上下文记忆）

---

## 0. 一句话定位

上海立信会计金融学院 **星海艺术团** 官方网站 + 内部管理「大系统」。官网公开（招新 / 展示），工作端需登录（成员 / 干部）。**所有子系统数据完全分离、独立库**。纯 Flask + SQLite，零外部依赖。

## 1. 线上地址与当前状态（⚠️ 重点先看这里）

- 文档记载的线上主地址：`https://Luyanghao.pythonanywhere.com`（PythonAnywhere 免费版），**以你自己部署后台的实际情况为准**。
- 备选部署目标：Railway / Render（仓库已含 `Procfile: web: python app.py`，连 GitHub 即可自动部署）。
- **⚠️ 注意**：维护沙箱曾存在 21 个本地提交（含首页特效）未推送到 GitHub、线上仍是旧版的情况。接手后请先确认线上版本与仓库一致，把最新代码完整推送。

## 2. 技术栈与关键文件

- 后端：Flask 3.x，单文件 `app.py`（全部路由 + 初始化 + 8 个 SQLite 库自动建表）
- 前端：原生 HTML/CSS/JS，移动优先，无框架；全站暗色设计系统 v2「暗夜星海」（共享令牌 static/css/theme.css：背景 #0A0A0A / 面板 #141414 / 强调渐变 #89AACC→#4E85BF，显示字体 Instrument Serif + Noto Serif SC），改样式先读 theme.css 与 AI_CONTEXT.md 第 8 节
- 数据：SQLite，独立 `.db`（registrations / members / users / reimburse / reserve / bulletins / apply / assets）
- 配置：`config.json`（**含密钥，已被 .gitignore 排除，绝不提交**）、`config.example.json`（部署示例）、`content.json`（官网/招新文案与群码，CMS 编辑）、`kb.json`（小星知识库，运行时生成）
- 静态资源：`static/`（boot.css/boot.js）、`static/uploads/`（logo.png、showcase/sc01~sc23.jpg、咨询群二维码）
- 依赖：`requirements.txt` → `Flask>=3.0,<4.0`；`python-docx>=1.1,<2.0`

关键页面：`index.html`(首页) `recruit.html`(招新) `login.html` `work.html`(工作端) `members.html` `reimburse.html` `reserve.html` `bulletin.html` `cms.html` `approval.html` `assets.html` `register.html`

路由概览（`app.py`）：公开 `/`、`/recruit`、`/register`、`/login`、`/admin`、`/cms`；工作端 `/work*` 需登录；约 50 个 `/api/*` 接口（招新、成员、报销、预约、通报、资产、知识库、注册审批等）。完整列表见 `app.py` 内 `@app.route`。

## 3. 本地运行

```bash
pip install -r requirements.txt
python app.py            # 默认 8000 端口，支持环境变量 PORT
# 浏览器打开 http://127.0.0.1:8000
```

首次启动自动创建各库与数据表，无需手动建表。

## 4. 密钥配置（⚠️ 安全，重要）

密钥读取优先级：**环境变量 > config.json > 内置默认值**（`app.py` 顶部实现）。

- 环境变量：`XINGHAI_ADMIN_KEY`（招新后台 / CMS 密码，URL 参数 `?key=`）、`XINGHAI_SECRET`（Flask session 密钥 + 密码加盐哈希）
- 本地配置：复制 `config.example.json` 为 `config.json` 并填入强口令
- **交接提醒**：部署上线前务必改用强口令；默认账号首次登录后强制改密；`config.json` 绝不提交仓库。

## 5. 部署

- **PythonAnywhere（主，文档记载）**：详见 `README.md`「部署到 PythonAnywhere」；用仓库 `wsgi.py`（改用户名），静态文件映射 `/static/` → `~/mysite/static`。
- **Railway / Render**：连 GitHub 仓库 + `Procfile`，自动部署。
- **自备服务器**：`pip install -r requirements.txt && python app.py`，前置 Nginx 反代 8000。
- 生产建议：加 Gunicorn/Nginx；定期备份 `*.db` 与 `static/uploads/`；密钥迁环境变量。

## 6. 已知坑 / 注意事项

- SQLite 本地文件：部署平台若用临时文件系统会丢数据，需挂载持久卷或定期备份。
- 移动端已做双断点适配（480–768），改样式时注意别破坏。
- `reference/` 为参考文档（招新方案等），非运行所需。
- 首页特效依赖 `jsdelivr` CDN 加载 GSAP（如该版本已带）；部署环境无外网时逐字动画自动跳过，不影响其他功能。

## 7. 接手检查清单

- [ ] 确认线上真实地址并访问核对当前版本
- [ ] 确认仓库代码与线上一致（如有未推送提交请完整推送）
- [ ] 设置强密钥（环境变量或 config.json），默认账号改密
- [ ] 配置数据库 / 上传资源定期备份
- [ ] 通读 `README.md`、`AI_CONTEXT.md` 了解全貌

---

*本文件为维护会话整理（脱敏），随项目推进请同步更新。*
