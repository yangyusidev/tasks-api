# 待办手账

一个复古手账风格的任务管理应用。支持创建任务、切换任务状态、删除任务，以及使用 AI 将复杂任务拆解为 3～5 个可执行的子任务。

## 功能

- 创建、查看和删除任务
- 在「待办 → 进行中 → 已完成」之间循环切换状态
- 展示多层父子任务
- 使用 DeepSeek 兼容接口自动拆解任务
- 删除父任务时级联删除子任务
- 在手账装饰和简洁外观之间切换
- 提供任务 API 集成测试脚本

## 技术栈

- Next.js 15（App Router）
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- OpenAI Node SDK（调用 OpenAI 兼容的 DeepSeek 网关）
- Zod

## 本地运行

要求 Node.js 18.18 或更高版本，推荐使用 Node.js 20。

```bash
npm install
cp .env.local.example .env.local
```

编辑 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
SUPABASE_SERVICE_ROLE_KEY=你的服务端密钥

DEEPSEEK_API_KEY=你的API密钥
DEEPSEEK_MODEL=deepseek-v3
```

`SUPABASE_SERVICE_ROLE_KEY` 和 `DEEPSEEK_API_KEY` 仅供服务端使用，不要提交到 Git，也不要使用 `NEXT_PUBLIC_` 前缀。

然后启动开发服务器：

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。

## 初始化数据库

1. 在 Supabase 创建项目。
2. 打开项目的 SQL Editor。
3. 执行 [`supabase/schema.sql`](supabase/schema.sql)。

如果数据库是从旧版本升级，请按需执行：

- [`supabase/migration_parent_id.sql`](supabase/migration_parent_id.sql)：添加父子任务关系。
- [`supabase/migration_fix_status_check.sql`](supabase/migration_fix_status_check.sql)：更新三态任务约束。

服务端默认使用 `SUPABASE_SERVICE_ROLE_KEY`。如果改用 `NEXT_PUBLIC_SUPABASE_ANON_KEY`，需要自行启用 RLS 并配置相应策略。

## 环境变量

| 变量 | 必需 | 说明 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | 是 | Supabase 项目根地址，不要附加 `/rest/v1` |
| `SUPABASE_SERVICE_ROLE_KEY` | 推荐 | 服务端数据库密钥，可绕过 RLS |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 二选一 | 未使用 service role 时的备用密钥 |
| `DEEPSEEK_API_KEY` | 是 | AI 拆解任务使用的 API 密钥 |
| `DEEPSEEK_MODEL` | 推荐 | 当前网关可使用 `deepseek-v3` |

DeepSeek 兼容网关地址配置在 [`lib/openai/deepseek.ts`](lib/openai/deepseek.ts)。

## API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/tasks` | 获取全部任务 |
| `POST` | `/api/tasks` | 创建任务 |
| `PATCH` | `/api/tasks/:id` | 更新任务状态 |
| `DELETE` | `/api/tasks/:id` | 删除任务及其子任务 |
| `POST` | `/api/tasks/breakdown` | 使用 AI 拆解已有任务 |

创建任务：

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"准备产品发布","status":"pending"}'
```

拆解任务：

```bash
curl -X POST http://localhost:3000/api/tasks/breakdown \
  -H 'Content-Type: application/json' \
  -d '{"taskId":"任务 UUID"}'
```

任务状态可取：

- `pending`
- `in_progress`
- `completed`

## 测试与构建

先启动开发服务器，再运行 API 集成测试：

```bash
npm run test:api
```

测试会创建、拆解、更新并删除临时任务，因此应连接到允许写入的测试或开发数据库。

生产构建：

```bash
npm run build
npm start
```

## 项目结构

```text
app/                  页面与 API Route
components/todo/      待办界面组件
lib/openai/           AI 客户端配置
lib/supabase/         Supabase 服务端客户端
lib/tasks/            AI 任务拆解逻辑
lib/todo/             前端 API 调用与状态工具
supabase/             数据库结构与迁移脚本
scripts/              API 集成测试
```
