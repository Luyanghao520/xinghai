# 星海艺术团官方网站（大系统）

上海立信会计金融学院 **星海艺术团** 官方网站与内部管理「大系统」。
官网面向学生与访客（公开），招新与各类后台面向成员 / 干部（需登录）。
所有子系统**数据完全分离、独立存储**，互不混库。

## ✨ 功能模块

| 模块 | 路径 | 说明 | 数据 |
|---|---|---|---|
| 官网首页 | `/` | Hero + 精彩活动轮播 + 关于/架构/风采/荣誉/新闻/招新 | — |
| 招新系统 | `/recruit` | 线上报名、AI 答疑、报名数据管理 | `registrations.db` |
| 工作端总览 | `/work` | 登录后各子系统入口 | — |
| 成员信息 | `/work/members` | 员工式录入（学号主键、检索/编辑/导入/导出） | `members.db` |
| 报销申请 | `/work/reimburse` | 提交 / 审批（待审→已通过/已驳回） | `reimburse.db` |
| 预约排期 | `/work/reserve` | 排练厅/器材/服装预约 | `reserve.db` |
| 活动通报 | `/work/bulletin` | 发布通知，支持置顶与重要级别 | `bulletins.db` |
| 统一登录 | `/login` | 学号/工号 + 密码，按角色鉴权 | `users.db` |
| 招新后台 | `/admin?key=...` | 报名数据查看/检索/导出/删除 | `registrations.db` |
| 内容管理 | `/cms` | 官网与招新文案、群码配置 | `content.json` |

> 工作交接 / 资料库 / 任务日程 / 资产管理 / 通讯录 为「建设中」模块，下一阶段接入（同样独立库）。

## 🚀 本地运行

```bash
# 1. 安装依赖（Python 3.9+）
pip install -r requirements.txt

# 2. 启动（默认 8000 端口）
python app.py
# 或：flask 方式
# flask --app app run --port 8000

# 3. 浏览器打开
#    http://127.0.0.1:8000
```

首次启动 `app.py` 会自动创建 6 个独立数据库与所需数据表（空库），无需手动建表。

## 👤 默认账号

登录入口 `/login`，使用「学号/工号 + 密码」：

| 姓名 | 学号/工号 | 初始密码 | 角色 |
|---|---|---|---|
| 系统管理员 | `000000000` | `xinghai2026` | 主席 |
| 陈嘉豪 | `251400143` | `400143` | 副主席（浦东） |
| 郝博雅 | `251400255` | `400255` | 副主席（松江） |

> 初始密码为各自学号后 6 位，建议首次登录后修改。
> 招新后台与内容管理密码见下方「配置项」。

## 🔐 权限说明

- **公开（免登录）**：官网首页、招新系统、AI 答疑。
- **需登录**：`/work` 及其下所有子系统；未登录访问 API 返回 `401`，访问页面自动跳转 `/login`。
- **审批权**：仅 `主席` / `副主席` 可审批报销/预约、删除任意记录；普通成员仅可删除本人提交。

## 🗂️ 目录结构

```
.
├── app.py                 # Flask 后端（单文件，含全部路由与初始化）
├── requirements.txt       # Python 依赖
├── content.json          # 官网/招新 文案与群码配置（CMS 编辑）
├── index.html           # 官网首页
├── recruit.html        # 招新系统页
├── login.html          # 登录页
├── work.html           # 工作端总览
├── members.html        # 成员信息（员工式）
├── reimburse.html      # 报销申请
├── reserve.html        # 预约排期
├── bulletin.html       # 活动通报
├── cms.html            # 内容管理后台
├── static/
│   └── uploads/
│       ├── logo.png          # 星海艺术团 Logo
│       ├── showcase/        # 首页轮播演出照（sc01~sc23.jpg）
│       └── u2026...png    # 招新咨询群二维码
└── reference/          # 项目参考文档（招新方案、建设方案等，非运行所需）
```

## ⚙️ 配置项（`app.py` 顶部）

```python
ADMIN_KEY = "xinghai2026"          # 招新后台 / CMS 密码
SECRET     = "xinghai-art-troupe-2026"  # Flask session 密钥 + 密码加盐哈希
```

> 上线前请修改为强口令，并避免硬编码在公开仓库（可改为读取环境变量）。

## 🗄️ 数据分离

| 子系统 | 数据库文件 | 主键/结构 |
|---|---|---|
| 招新 | `registrations.db` | 报名记录 |
| 成员 | `members.db` | 学号（唯一主键） |
| 统一账号 | `users.db` | 学号/工号（唯一主键） |
| 报销 | `reimburse.db` | 自增 id |
| 预约 | `reserve.db` | 自增 id |
| 活动通报 | `bulletins.db` | 自增 id |

各库彼此独立，仅通过后端接口交互，前端无法跨库直读。

## 📦 部署提示

- 纯 Flask + SQLite，零外部服务依赖，适合轻量云主机 / 校内服务器。
- 生产环境建议在 `app.py` 前加 Gunicorn/Nginx，并将 `registrations.db` 等做定期备份。
- 静态资源经 `/static` 暴露；演出照、Logo 直接放 `static/uploads/` 即可。
