# 星海艺术团官网 · Next.js 新栈

> 阶段：**脚手架 + 数据迁移管道 + 报名/后台已就绪**。
> 旧栈（Flask + SQLite，PythonAnywhere 托管）仍在仓库 `main` 分支运行，
> **本目录位于 `next/scaffold` 分支，互不干扰**。
> 仍不含最终视觉设计与真实内容；正式上线前需完成数据导入与设计阶段。
>
> 📋 **全功能迁移路线图见 [`docs/迁移总方案-2026-09-05.md`](docs/迁移总方案-2026-09-05.md)**
> （旧站 14 项功能与内容资产全量盘点 + 9 个阶段的迁移计划）。

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

要求 Node.js ≥ 20（推荐 22；仓库使用 Node 24 开发验证）。

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
npm run migrate    # 旧栈数据迁移（见下文「数据迁移」）
npm run fixtures   # 生成假旧库夹具（仅用于验证迁移管道）
```

> Windows 首次安装注意：better-sqlite3 是原生模块。npm 11 若提示
> `allow-scripts` 拦截，执行 `npm approve-scripts better-sqlite3` 后
> `npm rebuild better-sqlite3` 即可；即便该模块不可用，站点也会自动
> 降级为「内存存储」（报名不落盘、成员页为空），只是数据不持久。

## 页面与接口

| 路由 | 说明 |
| --- | --- |
| `/` | 首页（Hero + 内容入口卡片，占位） |
| `/about` | 社团介绍（占位） |
| `/recruit` | 招新报名：字段与旧栈表单一致，提交入库 + 防重复 |
| `/performances` | 演出/作品展示（占位卡片，旧栈无对应数据表） |
| `/members` | 成员/校友名单（读库；只展示姓名/届别/部门/职务/特长，**不公开联系方式**） |
| `/contact` | 联系我们（占位） |
| `/admin` | 后台看板：报名统计/搜索/筛选 + 归档/删除/录取 + 申请审核 + CSV 导出（需口令） |
| `POST /api/register` | 报名提交（字段校验 + 手机号/邮箱防重复，重复返回 409） |
| `POST /api/admin/login` / `logout` | 后台口令登录 / 退出 |
| `POST /api/admin/registrations/action` | 报名写操作：archive/restore/delete/admit |
| `POST /api/admin/applies/action` | 申请审核：approve/reject/pending |
| `GET /api/admin/registrations/export` | 报名导出 CSV（UTF-8 BOM，Excel 直接打开不乱码） |

### 报名接口示例

```bash
# 成功（200）
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"target":"声乐方向","name":"张三","gender":"女","campus":"浦东","college":"音乐学院","major":"音表2501","phone":"13800000000","email":"zhangsan@example.com","adjust":true}'
# => {"success":true,"message":"报名信息已收到……","data":{"id":"…"}}

# 重复提交（409，同一手机号或邮箱）
# => {"success":false,"message":"该手机号已提交过报名，请勿重复提交"}

# 校验失败（400）
# => {"success":false,"message":"字段校验未通过","errors":{"phone":"手机号格式不正确（11 位大陆手机号）"}}
```

> 旧栈报名接口为 `/api/signup`，新栈统一为 `/api/register`（迁移后旧链接由后续上线阶段做跳转）。

## 数据迁移（旧栈 → 新栈）

**现状**：仓库根目录的 `*.db` 是运行期自动重建的**空库**；真实数据在
PythonAnywhere 线上。迁移管道已建好并验证（幂等、只读旧库、UTF-8 全程正确）。

**上线前操作**：

1. 在 PythonAnywhere 上导出三个库：`registrations.db`、`apply.db`、`members.db`；
2. 放到仓库根目录（或设 `LEGACY_DIR` 指向所在目录）；
3. 运行 `npm run migrate`。

迁移细节（`scripts/migrate-legacy.ts`）：

- 只读打开旧库（`readonly`），绝不修改线上数据；
- 迁移行使用确定性 id（`lg-<旧表>-<旧rowid>`）+ `INSERT OR IGNORE`，
  **重复运行安全**；已导入的行不会被覆盖（需强制刷新时删除 `data/xinghai.db` 重跑，注意会连同新栈新增数据一起清掉）；
- 映射关系：`registrations`+`archive_regs` → `registrations`（带 `source` 来源标记）、
  `applies` → `applies`（**pwd 列仅保留在库内，任何接口/页面永不返回**）、
  `members`/`alumni` → `members`/`alumni`；
- 可用 `npm run fixtures && LEGACY_DIR=.fixtures npm run migrate` 在本地无真实数据时验证管道。

## 后台 /admin

- 在 `xinghai-next/.env`（参考 `.env.example`）配置 `ADMIN_TOKEN=足够长的随机口令`
  后重启，访问 `/admin` 输入口令登录（未配置 = 后台整体关闭）；
- 能力：
  - 报名总数/今日新增统计、按意向方向统计；
  - 报名列表：姓名/手机号/方向/院系模糊搜索 + 状态筛选签（全部/未处理/已归档/已录取）；
  - 行内写操作：**归档**（清理队列但保留数据）、**恢复**、**录取**（一键转成员：
    部门=意向方向、届别=当前年份，报名标记已录取）、**删除**（垃圾/测试数据，不可恢复）；
  - **导出 CSV**：全量报名导出，带 BOM，Excel 直接打开中文不乱码；
  - 招新申请审核：通过/驳回/恢复待审；
- 会话为 HttpOnly + SameSite=Strict 的 Cookie（8 小时），值为口令摘要而非明文；
- 所有写接口都校验会话，未登录返回 401。

## SEO

- `app/sitemap.ts` → `/sitemap.xml`（全部公开页），`app/robots.ts` → `/robots.txt`
  （`/admin`、`/api` 禁止收录）；
- 全站 OG/Twitter 分享元信息在 `layout.tsx`（`og:title/description/locale/type`）；
- 链接基于 `NEXT_PUBLIC_SITE_URL`（见 `.env.example`），上线时设置成正式域名即可；
- OG 图片（分享卡片配图）涉及中文字体嵌入与品牌视觉，留给设计阶段。

## 数据层说明（★ 核心设计）

所有数据操作收敛在 `src/lib/`：页面与接口只依赖
`src/lib/db.ts` 导出的语义化函数与 `src/lib/types.ts` 的类型，
不直接接触数据库驱动；建表 DDL 单一来源 `src/lib/schema.ts`
（运行时与迁移脚本共用，结构不漂移）。

- **当前实现（方案 A）**：better-sqlite3 写入 `data/xinghai.db`（路径可用环境变量
  `XINGHAI_DB_PATH` 覆盖）；原生模块加载失败时自动降级为内存存储并打警告。
- **未来切方案 B（Supabase Postgres + Vercel）**：新写一个实现 `DataStore`
  接口的 Postgres 版本，在 `db.ts` 的 `getStore()` 里替换即可，页面与接口零改动。
- 旧栈各库与新栈表已对齐（本次已接入 3 库 5 表）：

| 旧库 | 表 | 新栈去向 | 状态 |
| --- | --- | --- | --- |
| registrations.db | registrations / archive_regs | `registrations`（source 标记） | ✅ 已接入（迁移+表单+后台） |
| apply.db | applies | `applies`（只读展示，pwd 不外泄） | ✅ 已接入 |
| members.db | members / alumni | `members` / `alumni` | ✅ 已接入（成员页展示） |
| assets.db | assets, borrows, procurements | 物资管理（后台向） | ⏳ 待后续迭代 |
| bulletins.db | bul | 公告 | ⏳ 待后续迭代 |
| reimburse.db | rei | 报销（后台向） | ⏳ 待后续迭代 |
| reserve.db | resv | 预约（后台向） | ⏳ 待后续迭代 |
| users.db | users | 后台账号（新栈暂用 ADMIN_TOKEN） | ⏳ 待后续迭代 |
| site.db | site_audit, site_guard | 站点内容编辑（新子系统） | ⏳ 待后续迭代 |

## 部署（已配置，未上线）

### 方案 A：Render（蓝图已就绪）

1. 把 `next/scaffold` 分支推送到 GitHub；
2. Render 控制台 → New → Blueprint → 选本仓库，目录指向 `xinghai-next`；
3. 环境变量里配置 `ADMIN_TOKEN`；按默认免费档创建即可通过 `render.yaml` 自动配置。
   ⚠ 免费档无持久磁盘，重新部署后 SQLite 数据清空；需要保留数据请启用
   `render.yaml` 中注释的 disk 配置（付费实例），或切方案 B。

### 方案 A：Railway

1. New Project → Deploy from GitHub → 选本仓库；
2. Settings 里把 Root Directory 设为 `xinghai-next`；
3. Railway 会自动识别 Next.js（build: `npm run build`，start: `npm run start`）；
4. 配置环境变量 `ADMIN_TOKEN`；需要持久化时：Volumes 挂载到 `/var/data`，
   并添加 `XINGHAI_DB_PATH=/var/data/xinghai.db`。

### 方案 B（预留）：Supabase + Vercel

生产库切 Supabase（Postgres 免费档），按上文「数据层说明」替换 store 实现后，
可直接部署到 Vercel（无服务器环境不能跑 SQLite 文件）。

## 后续待办清单

- [x] ~~数据迁移管道~~（已验证；真实数据已于 2026-09-05 导入：2 条报名）
- [x] ~~后台写操作~~（归档/删除/录取/申请审核/CSV 导出）
- [ ] **设计阶段**：配色/字体/汉堡图标/动效（含 OG 分享卡片图）、内容填充（首页文案/社团介绍/演出作品）
- [ ] **报名体验**：意向方向改为后台可配置选项、提交后确认页、（可选）通知
- [ ] **成员维护**：成员信息编辑页（目前录取后如需修正需直接改库）
- [ ] **正式上线**：平台选型确认后绑定域名、设置 `NEXT_PUBLIC_SITE_URL`、HTTPS 与监控、旧链接 301
- [ ] **测试加固**：报名提交端到端测试、后台登录限速、（上线后）自动备份 SQLite

## Git 约定

- 新栈工作在 `next/scaffold` 分支；旧栈 `main` 分支与 PythonAnywhere 线上站不受影响。
- 合入时机：待数据导入、设计阶段与写操作后台完成后，再评估是否将 `xinghai-next/` 并入主线并切换部署。
