# 星海艺术团官网 · 项目记忆文档（AI 上下文）

> **给未来会话的"交接说明书"。** 新会话只要说"读 `AI_CONTEXT.md`"，即可无缝接手本项目。
> 最后更新：2026-07-19｜状态：已上线 PythonAnywhere，运行正常。

---

## 0. 一句话定位

上海立信会计金融学院 **星海艺术团** 官方网站 + 内部管理「大系统」。官网公开（招新/展示），工作端需登录（成员/干部）。**所有子系统数据完全分离、独立库**。纯 Flask + SQLite，零外部依赖。

- 线上地址：**https://Luyanghao.pythonanywhere.com**
- GitHub：**https://github.com/Luyanghao520/xinghai**（⚠️ 历史原因曾上传不全，需重新推送完整代码）

---

## 1. 技术架构

### 1.1 技术栈
- **后端**：Flask 3.1.x（单文件 `app.py`，含全部路由 + 初始化）
- **前端**：原生 HTML/CSS/JS，移动优先，无框架
- **数据库**：SQLite（6 个独立 `.db` 文件）
- **部署**：PythonAnywhere（免费版，Manual configuration + WSGI）

### 1.2 文件结构（/workspace 或 ~/mysite）
```
app.py              # Flask 后端（全部逻辑）
wsgi.py             # PythonAnywhere WSGI 配置（含用户名占位，需改）
Procfile            # web: python app.py（供 Render/Railway 等备用）
requirements.txt    # Flask>=3.0,<4.0
README.md           # 项目说明
AI_CONTEXT.md       # 本文件
.gitignore          # 排除 *.db / __pycache__ / registrations.csv
content.json        # 官网/招新 文案与群码配置（CMS 编辑）
index.html          # 官网首页（Hero+轮播+关于/架构/风采/荣誉/新闻/招新）
recruit.html        # 招新系统页
login.html          # 登录页
work.html           # 工作端总览（模块卡片入口）
members.html        # 成员信息（员工式 CRUD）
reimburse.html      # 报销申请
reserve.html        # 预约排期
bulletin.html       # 活动通报
cms.html            # 内容管理后台
static/uploads/
  logo.png          # 星海艺术团 Logo（孔雀圆形）
  u2026...png       # 招新咨询群二维码
  showcase/sc01~23.jpg  # 首页轮播演出照（8 张入轮播）
reference/          # 参考文档（非运行所需）：招新方案/建设方案/旧招新页
```

### 1.3 六个独立数据库（数据不混库）
| 子系统 | 文件 | 主键/关键字段 |
|---|---|---|
| 招新 | `registrations.db` | 报名记录 |
| 成员 | `members.db` | 学号（唯一主键） |
| 统一账号 | `users.db` | 学号/工号（唯一主键），含 role/campus |
| 报销 | `reimburse.db` | 自增 id，status: 待审/已通过/已驳回 |
| 预约 | `reserve.db` | 自增 id，status: 待确认/已通过/已驳回 |
| 活动通报 | `bulletins.db` | 自增 id，pinned/level |

> 各库仅通过后端接口交互，前端无法跨库直读。`app.py` 启动时自动建表；`users.db` 空表时仅自动播种管理员（`000000000`）。

### 1.4 路由总览
- 公开：`/`（首页）、`/recruit`（招新）、`/login`（登录页）、`/admin?key=`（招新后台）、`/cms`（内容管理）、`/api/content`
- 工作端（均 `@login_required`，未登录 API 返 401 / 页面跳 `/login`）：
  - `/work`（总览）、`/work/members`
  - `/work/reimburse` + `/api/reimburse`（GET/POST/DELETE/`<id>`/status）
  - `/work/reserve` + `/api/reserve`（同上）
  - `/work/bulletin` + `/api/bulletin`（GET/POST/DELETE）
- 权限：仅 `主席`/`副主席` 可审批报销/预约、删除任意记录；普通成员仅可删本人提交。
- 密码哈希：`hx(s)=sha256(SECRET+s)`，`SECRET="xinghai-art-troupe-2026"`（见 `app.py` 顶部）。

---

## 2. 账号与密码（重要）

### 工作端登录（学号/工号 + 密码）
| 姓名 | 学号/工号 | 初始密码 | 角色 |
|---|---|---|---|
| 系统管理员 | `000000000` | `xinghai2026` | 主席 |
| 陈嘉豪 | `251400143` | `400143`（学号后6位） | 副主席（浦东）|
| 郝博雅 | `251400255` | `400255`（学号后6位） | 副主席（松江）|

### 后台密码
- 招新后台 `/admin?key=xinghai2026` → `ADMIN_KEY = "xinghai2026"`
- CMS `/cms` → 同上（同一 `ADMIN_KEY`）
- `SECRET`（session 密钥）= `"xinghai-art-troupe-2026"`

> ⚠️ 以上硬编码在 `app.py` 顶部，公开仓库建议改读环境变量。
> ⚠️ **新部署的数据库是空的**——必须用下方命令重建账号（否则登录报"密码错误"）：
```bash
cd ~/mysite && python3 -c "
import sqlite3, hashlib
SECRET='xinghai-art-troupe-2026'
hx=lambda s: hashlib.sha256((SECRET+str(s)).encode()).hexdigest()
c=sqlite3.connect('users.db')
c.execute('CREATE TABLE IF NOT EXISTS users(xh TEXT PRIMARY KEY, name TEXT, role TEXT, pwd TEXT, campus TEXT, status TEXT)')
seed=[('000000000','系统管理员','主席',hx('xinghai2026'),'', '在团'),('251400143','陈嘉豪','副主席',hx('400143'),'浦东','在团'),('251400255','郝博雅','副主席',hx('400255'),'松江','在团')]
for r in seed: c.execute('INSERT OR REPLACE INTO users VALUES (?,?,?,?,?,?)', r)
c.commit(); print('ok')
"
```

---

## 3. 部署：PythonAnywhere（已验证步骤 + 踩坑）

### 3.1 正确步骤
1. 注册 pythonanywhere.com（免费版），记用户名（例：`Luyanghao`）。
2. **Consoles → Bash**：`git clone <仓库> ~/mysite`（或 Files 页面逐个上传）。
3. `cd ~/mysite && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt`（若无 requirements.txt 则 `pip install flask`）。
4. **Web → Add a new web app → Manual configuration → Python 3.10+**。
5. 编辑 **WSGI configuration file**，内容替换为 `wsgi.py`（把 `你的用户名` 改成真实用户名）。
6. **Static files** 加：`/static/` → `/home/用户名/mysite/static`。
7. **Reload**，访问 `https://用户名.pythonanywhere.com`。

### 3.2 踩过的坑（务必避开）
- ❌ **GitHub Pages 不行**：它只托管静态文件，跑不了 Flask（会 404）。
- ❌ WSGI 文件必须 `from app import app as application`，且 `app.py` 的 `app.run()` 已在 `if __name__=="__main__":` 内（已处理，导入时不触发服务）。
- ❌ 上传文件**必须放进正确子目录**：图片/Logo 要在 `static/uploads/`，演出照在 `static/uploads/showcase/`，否则页面图裂。一键整理命令见 1.2 结构。
- ❌ 通过 GitHub 网页拖拽上传**容易漏文件**（本项目的 GitHub 仓库曾因此变空，导致 clone 后 `No module named 'app'`）。**最稳：用终端 `curl` 从可访问的 URL 下载 zip 解压，或逐个确认关键文件到位。**
- ✅ 改完任何代码/上传文件后，**必须回 Web 标签点 Reload** 才生效。
- ✅ 免费版有月度 CPU 配额，日常社团官网够用。

---

## 4. 艺术团背景资料（完整）

### 4.1 基本介绍
- 全称：上海立信会计金融学院 **星海艺术团**
- 性质：**校级学生艺术团体**，由**校团委**指导
- 校区：**浦东校区 + 松江校区**，双校区协同运作、同步招新与活动
- 定位：以艺术实践为载体的**美育平台**，培养有审美、有担当、有舞台的青年
- 特色：近 21 年累计 **304 项**各级奖项，**51 个一等奖/特等奖**，连续**七届**全国艺术展演获奖

### 4.2 组织架构（主席团 + 7 表演团队 + 4 行政部门）
- **主席团**：主席、副主席
  - 副主席 **陈嘉豪**（浦东，招新负责）、**郝博雅**（松江，招新负责）
- **7 支表演团队**：
  1. 合唱团 — 天籁和声，屡获金奖，分声部系统训练
  2. 交响乐团 — 管弦齐鸣，面向有器乐基础同学
  3. 民乐团 — 国风雅韵，民族乐器爱好者的主场
  4. 舞蹈团 — 翩若惊鸿，街舞/民族/现代多舞种
  5. 话剧团 — 声台形表，年度大戏
  6. 主持团 — 妙语连珠，校级晚会/赛事主持
  7. 礼仪队 — 端庄优雅，大型活动接待颁奖
- **4 个行政部门**：
  1. 办公室 — 统筹排期、会议记录、文书归档
  2. 资产管理部 — 器材服装道具登记维护调度
  3. 外联部 — 对外接洽赞助、联动兄弟社团
  4. 企宣部 — 公众号推文、海报视频、拍摄品牌包装

### 4.3 指导老师 / 干部
- **魏启旦**：校团委艺术教育中心副主任、副教授，华东师大音乐学硕士，近五年带队拿 40+ 国家级/市级奖项
- **戴旭彤**：协助处理日常事务
- **陈嘉豪**（副主席，浦东）、**郝博雅**（副主席，松江）：招新统筹

### 4.4 招新信息
- **线下正式招新**：**2026 年 9 月 6 日（周六）8:00–17:00**，浦东 + 松江两校区同步
- **线上报名**：通道已开放（首页「立即招新」→ `/recruit` 填表）
- 报名方式：①线上填表 ②线下摊位填表 + 简短面试
- 门槛友好：表演团队可零基础（有培养路径）；行政部门看责任心与执行力
- 咨询：页面底部「联系我们」放招新咨询群二维码

### 4.5 获奖荣誉（真实数据，来自 2004-2025 获奖汇总.xlsx）
- **总量**：304 项（2004–2025）
- **等级分布**：一等奖/金奖/特等奖 51 项、二等奖 79、三等奖 82、特等奖 2、金奖 1
- **近年亮点**：
  - 2024 **第七届全国大学生艺术展演**：舞蹈《莲叶翩翩》**国家级一等奖**；声乐/戏剧/书法多项市级一等奖
  - 2023 校园短剧展演 **《为人民而歌》特等奖**（全市最高等级）
  - 2025 第十届"汇创青春"：中国舞《莲叶翩翩》一等奖、优秀组织奖
  - 历年覆盖合唱、舞蹈、戏剧、器乐、书法等全门类

### 4.6 首页轮播已用的 8 张演出照（对应真实作品）
旗袍群舞《扇韵》、青春群舞、舞蹈《莲叶翩翩》(全国一等奖)、古风双人舞、创意群舞《书页之光》、拉丁专场、敦煌风《千手观音》、K-pop 街舞。

---

## 5. 日常维护（给非技术 owner）

| 需求 | 操作 |
|---|---|
| 改官网文案 / 换咨询群二维码 | 登录后 `/cms` 在线编辑 |
| 看/导出招新报名 | `/admin?key=xinghai2026` |
| 录成员、报销、预约、发通报 | 右上角登录 → `/work` |
| 加新成员账号 | 工作端 → 成员信息 → 新建 |
| 换演出照/Logo | PythonAnywhere **Files** 标签上传到 `static/uploads/` |
| 改样式/功能 | **Files** 编辑对应 `.html` → **Save** → Web 标签 **Reload** |
| 备份数据库 | `cd ~/mysite && tar czf ~/backup-$(date +%Y%m%d).tar.gz *.db` |

---

## 6. 待办 / 未完成项

- [ ] **GitHub 仓库需重新推送完整代码**（历史上传不全，clone 会缺 `app.py`）
- [ ] 换真实**招新咨询群二维码**到 `content.json`（目前是占位图）
- [ ] 把 `ADMIN_KEY` / `SECRET` 改为读环境变量（公开仓库安全）
- [ ] 建设中的模块未实现：工作交接、资料库、任务日程、资产管理、通讯录
- [ ] 首页轮播目前硬编码 8 张，新增照片需同步改 `index.html` 的 `SC` 数组（后续可接 CMS）
- [ ] 参考文档（`reference/`）里的草坪音乐会策划案、松江舞专主持稿尚未用到，建议后续归入"资料库"模块

## 7. 关键代码点（改之前看）
- 轮播数据：`index.html` 底部 `<script>` 里的 `const SC=[...]`（图片路径 + 文案）
- 获奖数据：写死在 `index.html` 的 `#honor` 区块（如需动态化接 `content.json`）
- 首页登录按钮：`index.html` 导航里的 `openLogin()`
- 配置项：`app.py` 顶部 `ADMIN_KEY` / `SECRET`
- 初始化建表：`app.py` 的 `init_reg/mem/usr/rei/res/bul()`
