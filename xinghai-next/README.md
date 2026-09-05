# 星海艺术团官网 · Next.js 新栈脚手架（毛坯房）

> 状态：**空脚手架** —— 结构、路由、数据层接口、部署配置已就绪；
> 不含真实内容、不做最终视觉设计。旧栈（Flask + SQLite，PythonAnywhere 托管）
> 仍在仓库 `main` 分支运行，**本目录位于 `next/scaffold` 分支，互不干扰**。

## 技术栈

| 项目 | 选型 |
| --- | --- |
| 框架 | Next.js 16（App Router，Turbopack） |
| 语言 | TypeScript（strict） |
| UI | React 19 + Tailwind CSS v4（CSS-first 配置） |
| 数据 | 本地 SQLite（better-sqlite3，含内存降级兜底） |
| 部署 | 方案 A：Render / Railway（已配蓝图，**未正式上线**）；方案 B：Supabase + Vercel（预留） |

> 为什么没有 `tailwind.config.ts`：Tailwind v4 改用 CSS-first 配置，
> 主题变量集中在 [`src/styles/globals.css`](src/styles/globals.css) 的 `@theme` 中，
> 改主题色/字体只动这一个文件。

## 本地运行

要求 Node.js ≥ 20（推荐 22）。

```bash
cd xinghai-next
npm install
npm run dev        # 开发模式，默认 http://localhost:3000
```

其它命令：

```bash
npm run build      # 生产构建（含类型检查）
npm run start      # 运行生产构建（需先 build）
npm run lint       # ESLint 检查
```

> Windows 首次安装注意：better-sqlite3 是原生模块。npm 11 若提示
> `allow-scripts` 拦截，执行 `npm approve-scripts better-sqlite3` 后
> `npm rebuild better-sqlite3` 即可；即便该模块不可用，站点也会自动
> 降级为「内存存储」，只是数据不落盘。

## 目录结构

```
xinghai-next/
├── src/
│   ├── app/                        # 路由（App Router）
│   │   ├── layout.tsx              # 全局外壳：导航栏 + 页脚（对应旧栈 base.html）
│   │   ├── page.tsx                # 首页（占位）
│   │   ├── about/page.tsx          # 社团介绍（占位）
│   │   ├── recruit/page.tsx        # 招新/报名（含可运行表单占位）
│   │   ├── performances/page.tsx   # 演出/作品展示（占位）
│   │   ├── members/page.tsx        # 成员（占位）
│   │   ├── contact/page.tsx        # 联系我们（占位）
│   │   └── api/register/route.ts   # 报名提交接口（POST，含校验）
│   ├── components/
│   │   ├── Navbar.tsx              # 顶部导航（含移动端折叠菜单）
│   │   ├── Footer.tsx              # 页脚
│   │   ├── RegisterForm.tsx        # 报名表单占位组件
│   │   └── ui/                     # Button / Card 通用组件
│   ├── lib/
│   │   └── db.ts                   # ★ 数据访问抽象层（可替换实现）
│   └── styles/
│       └── globals.css             # ★ 全站主题变量（设计系统入口）
├── public/                         # 静态资源（暂空）
├── render.yaml                     # Render 部署蓝图（方案 A）
├── .env.example                    # 环境变量样例
└── README.md
```

## 页面与接口

| 路由 | 说明 |
| --- | --- |
| `/` | 首页（Hero + 内容入口卡片，占位） |
| `/about` | 社团介绍（占位） |
| `/recruit` | 招新报名：说明占位 + 在线报名表单（可提交） |
| `/performances` | 演出/作品展示（占位卡片） |
| `/members` | 成员（占位卡片） |
| `/contact` | 联系我们（占位） |
| `POST /api/register` | 报名提交接口 |

### 接口示例

```bash
# 成功（200）
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"张三","email":"zhangsan@example.com","phone":"13800000000","message":"想加入街舞队"}'
# => {"success":true,"message":"报名信息已收到……","data":{"id":"…"}}

# 校验失败（400）
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" -d '{"name":"","email":"bad-email"}'
# => {"success":false,"message":"字段校验未通过","errors":{"name":"…","email":"…"}}
```

## 数据层说明（★ 核心设计）

所有数据操作收敛在 `src/lib/db.ts`：页面与接口只依赖
`createRegistration()` / `listRegistrations()` 等语义化函数和 TypeScript 类型，
不直接接触数据库驱动。

- **当前实现（方案 A）**：better-sqlite3 写入 `data/xinghai.db`（路径可用环境变量
  `XINGHAI_DB_PATH` 覆盖）；原生模块加载失败时自动降级为内存存储并打警告。
- **未来切方案 B（Supabase Postgres + Vercel）**：新写一个实现同一
  `RegistrationStore` 接口的 Postgres 版本，在 `initStore()` 里替换返回值即可，
  页面与接口零改动。
- 旧栈 8 个库（现为 9 个，新增了站点内容子系统）的表结构迁移后，
  按同样模式在本文件扩展更多实体接口即可：

| 旧库 | 表 | 对应业务 |
| --- | --- | --- |
| registrations.db | registrations, archive_regs | 在线报名（新栈首个接入对象） |
| apply.db | applies | 招新申请 |
| members.db | members, alumni | 成员/校友 |
| assets.db | assets, borrows, procurements | 物资管理 |
| bulletins.db | bul | 公告 |
| reimburse.db | rei | 报销 |
| reserve.db | resv | 预约 |
| users.db | users | 后台账号 |
| site.db | site_audit, site_guard | 站点内容编辑（新子系统） |

## 部署（已配置，未上线）

### 方案 A：Render（蓝图已就绪）

1. 把 `next/scaffold` 分支推送到 GitHub；
2. Render 控制台 → New → Blueprint → 选本仓库，目录指向 `xinghai-next`；
3. 按默认免费档创建即可通过 `render.yaml` 自动配置构建与启动。
   ⚠ 免费档无持久磁盘，重新部署后 SQLite 数据清空；需要保留数据请启用
   `render.yaml` 中注释的 disk 配置（付费实例），或切方案 B。

### 方案 A：Railway

1. New Project → Deploy from GitHub → 选本仓库；
2. Settings 里把 Root Directory 设为 `xinghai-next`；
3. Railway 会自动识别 Next.js（build: `npm run build`，start: `npm run start`）；
4. 需要持久化时：Volumes 挂载到 `/var/data`，并添加环境变量
   `XINGHAI_DB_PATH=/var/data/xinghai.db`。

### 方案 B（预留）：Supabase + Vercel

生产库切 Supabase（Postgres 免费档），按上文「数据层说明」替换 store 实现后，
可直接部署到 Vercel（无服务器环境不能跑 SQLite 文件）。

## 后续待办清单

- [ ] **数据迁移**：按上表把旧库数据导入新栈（先做 registrations/applies/members）
- [ ] **真实报名流程**：招新正式字段（年级/专业/意向组别）、防重复提交、确认通知
- [ ] **后台查询页**：基于 `listRegistrations()` 做报名管理（对齐旧栈 admin.html 能力）
- [ ] **内容填充**：首页文案、社团介绍、演出/成员数据、联系方式
- [ ] **视觉设计**：替换占位色板与字体、汉堡图标、动效；引入 shadcn/ui（可选）
- [ ] **SEO/分享**：sitemap、robots、OG 图（旧栈首页三件套经验可平移）
- [ ] **正式上线**：选型确认后绑定域名、配置 HTTPS 与监控
- [ ] **测试**：关键路径的端到端测试（报名提交、后台查询）

## Git 约定

- 新栈工作在 `next/scaffold` 分支；旧栈 `main` 分支与 PythonAnywhere 线上站不受影响。
- 合入时机：待数据迁移与视觉设计完成后，再评估是否将 `xinghai-next/` 并入主线并切换部署。
