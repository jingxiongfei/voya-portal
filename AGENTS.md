# Voya Portal Agent 工作规范

本文件是本仓库内所有人类开发者、AI 编码代理、自动化脚本和评审代理必须遵守的项目级规则。它适用于仓库根目录及其全部子目录；若子目录存在更具体的 `AGENTS.md`，子目录规则只能补充本文件，不得放宽本文件中的“必须”“禁止”和验收门槛。

<!-- antd-cli setup start -->
## Ant Design CLI Skill

Use the shared Ant Design skill at `.agents/skills/antd/SKILL.md` before working on Ant Design code in this repository.

The skill teaches agents when and how to call `@ant-design/cli` commands such as `antd info`, `antd doc`, `antd demo`, `antd token`, `antd semantic`, and `antd changelog`.

<!-- antd-cli setup end -->

## 1. 项目身份与范围

- 产品名称：**Voya Portal**。
- 所属公司：**Voya Explore**。
- 产品类型：覆盖 Voya Explore 全部业务域的 Web 后台管理系统产品方案与全部前端页面。
- 本仓库职责：信息架构、交互方案、视觉实现、前端业务逻辑、接口契约、Mock、自动化测试与可部署的 Web 产物。
- 本仓库不是业务后端。除非任务明确要求，不得在 `cloudflare-worker/` 或其他位置擅自实现生产后端、数据库、支付、鉴权服务或基础设施。
- 在业务范围、角色、字段、状态流转、权限或数据口径不明确时，不得凭常识把猜测固化为产品事实。先复用已有需求与契约；仍不明确且会影响结果时，记录假设并请求确认。

## 2. 指令优先级与决策原则

执行任务时按以下顺序处理冲突：

1. 用户在当前任务中明确提出的要求。
2. 本文件中的项目硬约束。
3. 已确认的产品文档、接口契约、设计稿和验收标准。
4. 仓库现有架构、测试和编码惯例。
5. Ant Design 官方文档与官方示例。

任何偏离本文件硬约束的实现，必须在改动说明中写明原因、影响范围和替代方案，并获得明确授权；“实现更快”“个人偏好”或“AI 默认生成”均不是例外理由。

## 3. 不可协商的产品约束

### 3.1 语言

- 系统只支持 `zh-CN` 与 `en-US` 两种界面语言。
- 默认语言必须是 `zh-CN`，且不得被浏览器语言自动覆盖。
- 用户可在界面中切换到 `en-US`；选择结果应按现有 Umi 国际化机制持久化。
- 所有用户可见文本必须同时提供中文和英文翻译，包括页面标题、菜单、按钮、表单标签、占位符、校验消息、空状态、错误提示、通知、表格列名、导出字段、图表标签与无障碍名称。
- 禁止在页面组件、路由配置或业务逻辑中新增硬编码的用户可见中文或英文；统一使用 `useIntl`、`getIntl` 或 `FormattedMessage`。
- 翻译键必须语义化、稳定并按业务域分组；禁止使用整句中文、随机编号或视觉位置作为 key。
- 中文是产品语义基准，英文应准确表达同一业务含义，不得使用机器直译占位文本。
- 日期、时间、数字、货币、百分比和时区必须按当前语言与明确的业务时区格式化；禁止用字符串拼接模拟本地化。

### 3.2 设计系统与组件

- Ant Design 是唯一基础设计系统，Ant Design Pro / ProComponents 是后台页面和高级业务组件的首选实现。
- 页面细节、表单、导航、反馈、数据展示、弹层、布局和交互控件必须优先使用 `antd` 或 `@ant-design/pro-components` 的现成组件。
- 编写或修改 Ant Design 组件代码前，必须先执行 `npx antd info <Component>` 核对当前已安装版本的 API；需要范例时执行 `npx antd demo <Component> [name]`。
- 禁止凭记忆猜测组件属性，禁止复制旧版 antd API，禁止使用已废弃属性。
- 只有确认 `antd` 与 ProComponents 均无合适组件时，才可创建自定义组件。自定义组件必须复用 Design Token、遵守现有交互/键盘/状态语义、提供清晰类型，并在提交说明中记录未采用官方组件的原因。
- 禁止引入第二套通用 UI 组件库，禁止用原生 HTML 重造 Button、Input、Select、Modal、Drawer、Table、Tabs、Tooltip、Message 等 antd 已提供的控件。
- 禁止通过大面积 CSS 覆盖破坏 antd 组件的状态、语义结构或主题能力。

### 3.3 图标与视觉保真

- 所有功能图标必须采用线框（outlined）风格并输出为清晰的矢量或高分辨率资源。
- 首选 `@ant-design/icons` 中的 `*Outlined` 图标；禁止使用 `*Filled`、`*TwoTone`、彩色 emoji 或混搭其他图标库。
- 同一操作在全站必须使用同一图标与同一语义；图标不得替代必要的文字标签。
- 纯图标按钮必须有本地化的 `aria-label`，并在语义不明确时提供 `Tooltip`。
- 仅当官方图标库确实不存在所需图标时，才可新增自定义 SVG。自定义 SVG 必须使用线框、`currentColor`、一致的 viewBox/描边/圆角规则，并接受浅色、深色、缩放和高 DPI 检查。
- 交付页面必须是可运行的高保真实现，不接受仅有占位框、ASCII 草图、伪组件或低保真临时代码作为完成状态。

### 3.4 AI 交互

- `@ant-design/x` 是 AI 界面的首选组件库；流式 Markdown 使用 `@ant-design/x-markdown`，对话数据流优先使用 `@ant-design/x-sdk`。
- Ant Design X 仅用于 AI 助手、智能问答、生成式表单、Agent 状态或其他明确的 AI 交互，不得为了展示技术而改造普通 CRUD 页面。
- AI 页面仍必须服从本文件的双语、权限、错误处理、可访问性、Design Token 和线框图标要求。
- AI 输出必须明确区分用户输入、模型生成、系统状态与工具结果；流式、停止、重试、复制、引用、错误与空响应状态必须可见且可操作。
- 未配置真实 AI 服务时使用明确标识的 Mock/适配层，禁止在前端写入 API Key、访问令牌或供应商秘密。

## 4. 技术基线

项目基于官方 Ant Design Pro v6 全量模板：

- Node.js `>=22`；以 `package.json#engines` 为准。
- 包管理器 npm；唯一锁文件为 `package-lock.json`。
- React 19、TypeScript 严格模式、Umi Max 4。
- Ant Design 6、ProComponents 3、Ant Design Icons 6。
- Ant Design X 2、X Markdown 2、X SDK 2。
- 服务端状态使用 TanStack React Query；简单页面请求可使用 Umi `request` 与 ProTable `request`。
- 样式使用 Ant Design Token、antd-style、CSS Modules、Tailwind CSS 4。
- 日期使用 dayjs。
- 质量工具使用 Biome、TypeScript、Vitest、Testing Library、Ant Design CLI。
- 构建使用 Umi Max 默认构建链；部署目标为 Vercel。

版本号以 `package.json` 与 `package-lock.json` 为唯一事实来源。本文件不授权随意升级主版本。新增或升级依赖前必须说明必要性、兼容性和包体积/安全影响，并同步锁文件。

禁止：

- 混用 yarn、pnpm、bun 或生成其他锁文件；
- 重新引入 ESLint、Prettier、Moment.js、Lodash 或另一套状态管理/UI 框架，除非任务明确批准；
- 编辑 `node_modules/`、`.umi/`、`.umi-production/`、`dist/` 等生成目录；
- 直接编辑 `src/services/ant-design-pro/` 中由 OpenAPI 生成的文件，应修改契约并运行 `npm run openapi`；
- 在没有完整备份和明确授权时执行不可逆的 `npm run simple`。

## 5. 仓库结构与归属

- `config/config.ts`：Umi 插件、国际化、主题、构建与运行配置。
- `config/routes.ts`：主路由、菜单层级、访问控制与页面入口。
- `config/defaultSettings.ts`：ProLayout 默认外观和产品标识。
- `src/app.tsx`：运行时布局、初始用户、全局导航与请求启动流程。
- `src/access.ts`：前端权限映射；它只控制前端可见性，不能替代服务端鉴权。
- `src/locales/zh-CN*`、`src/locales/en-US*`：唯一允许的界面语言资源。
- `src/pages/<domain>/`：按业务域组织页面；页面专用组件、类型、service 与 Mock 就近放置。
- `src/components/`：跨两个及以上页面复用的通用组件；不得把单页组件过早提升为全局抽象。
- `src/services/`：接口客户端和类型；自动生成区与手写区必须清晰分离。
- `mock/` 与 `src/pages/**/_mock.ts`：本地开发数据，不得被当作生产事实来源。
- `tests/` 与同目录 `*.test.ts(x)`：测试与测试环境。
- `public/`：经批准的静态资源；资源名必须稳定、可追溯，不放临时导出文件。
- `cloudflare-worker/`：上游模板的独立后端示例，默认不属于 Voya Portal 前端任务范围。

## 6. 页面与信息架构规则

- 每个新业务域必须先明确业务目标、目标角色、入口、核心对象、主任务、状态流转、异常路径、权限与成功指标。
- 路由层级应反映用户心智与业务边界，而不是后端表名或临时研发分工。
- Route `name` 使用稳定语义名称，并在两种 locale 中提供 `menu.<name>` 翻译。
- 菜单、面包屑、页签、页面标题和浏览器标题必须语义一致。
- 列表页默认评估查询、筛选、排序、分页、批量操作、列设置、刷新、导入/导出权限、空状态、加载态和失败态；只实现需求明确需要的能力。
- 详情页必须区分只读信息、可编辑信息、操作记录和危险操作，不得把全部内容堆入一个无层次 Card。
- 表单必须包含清晰标签、必填标识、约束说明、校验时机、提交中/成功/失败反馈、离开未保存提醒（适用时）与服务端错误映射。
- 危险或不可逆操作必须使用明确措辞和二次确认；不得用模糊的“确定吗？”替代后果说明。
- 加载、空数据、无权限、离线、404、500 和接口失败必须各自有正确状态，不得用同一个空白页代替。
- 默认以 1440px 桌面后台作为高保真基准；1280px 不得出现非业务必要的横向滚动，1024px 保持主要任务可完成。移动端范围由具体需求决定，但不得因窄屏导致关键操作不可达。

## 7. 组件、样式与主题

实现优先级：现有项目组件 → Ant Design → ProComponents → Ant Design X（仅 AI）→ 基于 Token 的最小自定义组件。

样式优先级：组件原生 props/语义样式 API → Design Token → `antd-style` → CSS Modules → Tailwind 简单布局。

- 颜色、字号、行高、圆角、阴影、间距、动效不得散落为无依据的 magic number。
- 使用 Token 表达品牌色、功能色和状态；不得直接覆盖 `.ant-*` 内部类，除非官方 API 无法满足且有回归测试。
- 页面支持主题能力时，不得写死只在浅色背景可读的颜色。
- 动效服务于状态变化和空间关系，禁止干扰任务的装饰性长动画。
- 自定义响应式断点必须集中管理并与现有布局一致。

## 8. 数据、状态与接口

- 所有接口输入、输出和错误必须有 TypeScript 类型；禁止用 `any` 绕过未知数据，使用 `unknown` 并在边界校验。
- API 字段与视图模型分离。响应兼容、格式化和默认值在 service/adapter 层处理，不在 JSX 中重复散落。
- 服务器数据由请求层/React Query 管理；局部 UI 状态留在组件，跨页稳定状态才进入 model。
- Query key、缓存时间、失效策略、重试和乐观更新必须符合业务语义；写操作成功后只失效必要数据。
- 列表分页、筛选与排序参数必须可预测，适合时同步 URL，确保刷新与分享后可恢复。
- Mock 必须覆盖正常、空数据、加载、权限不足、校验失败和服务异常等必要场景，并与接口类型一致。
- 禁止静默吞错。向用户显示可执行的本地化提示并保留开发诊断信息；不得泄露堆栈、令牌或敏感响应。

## 9. 权限、安全与隐私

- 每个菜单、页面、按钮和数据范围权限必须有明确来源；前端隐藏不能替代 API 服务端鉴权。
- 未授权页面使用统一 403；未登录按现有登录重定向机制处理并安全保留目标地址。
- 不在源码、Mock、测试快照、日志、URL 或 Vercel 配置中提交密钥、Token、真实个人信息或生产数据。
- 环境变量按开发、预览、生产分层；只有明确允许公开的变量可进入浏览器 bundle。
- 外链、富文本、Markdown、上传文件和用户输入必须考虑 XSS、开放重定向、类型/大小和内容注入风险。
- 日志与分析事件不得记录密码、完整证件号、支付信息、会话令牌或无必要的个人信息。
- 删除、退款、发布、权限提升等高风险操作必须具备权限检查、确认、幂等/防重复提交与结果反馈。

## 10. 可访问性与可用性

- 优先使用 antd 语义与键盘行为，不得用可点击 `div` 替代 Button/Link。
- 所有交互必须可用键盘完成并有清晰焦点状态；Modal/Drawer 的焦点管理必须正确。
- 表单控件必须有关联 label、错误描述和必要提示；不能只靠颜色表达状态。
- 文本对比度、点击目标、禁用态和状态反馈应满足 WCAG 2.1 AA 的适用要求。
- 表格、图表和可视化应提供标题、单位、图例、Tooltip；关键结论不能只通过颜色编码。
- 中英文长度变化不得导致关键文本截断、按钮不可用或布局溢出；必要省略时提供完整内容访问方式。

## 11. 性能与工程质量

- 路由级页面保持懒加载；避免在入口同步引入大体积、低频依赖。
- 避免重复请求、重复渲染和全量大列表渲染；按实际规模使用分页或虚拟化。
- 图片必须有正确尺寸、格式和替代文本；不得提交未经优化的超大图片或大体积 base64。
- 不为未经证实的问题提前引入复杂缓存；性能优化应有测量依据并保持正确性。
- 不得用禁用规则、`@ts-ignore`、扩大 `any` 或删除测试掩盖 TypeScript、lint 或测试问题。

## 12. 工作流程与验证

开始编码前：

1. 阅读本文件及目标目录下更具体的规则。
2. 检查 `git status`，不得覆盖用户已有改动。
3. 阅读相关页面、路由、locale、service、类型和测试，确认真实调用链。
4. 把需求转为可验证完成条件；涉及业务歧义时记录假设。
5. 涉及 antd 组件时用 CLI 核对 API；涉及新依赖时先证明必要性。

实现时：

- 保持改动聚焦，不顺手重构无关代码。
- 优先扩展现有模式，避免一次性抽象和过度配置。
- 新功能同时补齐中英文、权限、加载/空/错误状态与必要测试。
- 页面组件与页面共置；确认至少两个页面复用后再提升到 `src/components/`。
- 不编辑生成产物，不手工篡改锁文件。

完成前按改动范围运行：

```bash
npm run lint
npx antd lint ./src
npm run test
npm run build
```

- 只改文档时可不跑构建，但必须检查链接、命令和事实准确性。
- 修复缺陷必须添加或更新能复现该缺陷的测试。
- 新增核心业务流至少覆盖适用的成功、失败、权限与边界场景。
- UI 改动必须人工检查中文、英文、加载、空、错误、禁用、窄屏和键盘交互；高风险流程做端到端验证。
- 若检查因环境原因无法运行，交付说明必须写明未验证内容、原因与风险，不得宣称“全部通过”。

## 13. Git 与提交

- 使用 Conventional Commits，例如 `feat(orders): add refund review page`。
- 一次提交只承载一个可说明目的，不混入无关格式化、生成物或本机配置。
- 禁止提交 `.env*`（示例除外）、`.vercel/`、`node_modules/`、`dist/`、覆盖率、日志、截图和编辑器配置。
- 未经明确要求，不得重写历史、强推、删除分支、打生产标签或发布生产版本。

## 14. Vercel 约束

- Vercel 项目展示名称为 **Voya-Portal**；若平台要求小写技术标识，则使用 `voya-portal`，不得改用其他业务名称。
- 本仓库是单前端项目，使用根目录 `.vercel/project.json` 本地关联；`.vercel/` 必须在 `.gitignore` 中。
- Build Command：`npm run build`；Output Directory：`dist`；Install Command：`npm ci`（平台环境允许时）。
- Preview 用于功能与视觉验收；Production 部署必须获得明确授权。
- 环境变量通过 Vercel 设置或 CLI 安全管理，不得写入仓库或命令历史。
- 部署前至少保证 lint、测试和构建通过；部署后验证首页、登录、静态资源、路由刷新、中文默认和英文切换。

## 15. 完成定义（Definition of Done）

- 需求与已确认业务规则一致，没有把未确认假设伪装成事实。
- 使用正确的 antd / ProComponents / Ant Design X 组件与当前版本 API。
- 中文为默认语言，新增用户文本具有完整、准确的中英文翻译。
- 图标统一为线框风格，页面达到可评审的高保真质量。
- 权限、加载、空、错误、禁用、成功和危险操作反馈完整。
- 关键交互可用键盘完成，响应式与中英文长度已检查。
- 类型、接口、Mock 与测试同步，未引入敏感信息和明显安全风险。
- 所需 lint、antd lint、测试和生产构建通过。
- 交付说明准确列出改动、验证结果、已知限制和后续依赖。

## 16. 官方依据

- Ant Design Pro v6 发布说明：<https://github.com/ant-design/ant-design-pro/issues/11734>
- Ant Design Pro 源码：<https://github.com/ant-design/ant-design-pro>
- Ant Design React：<https://ant.design/docs/react/introduce-cn>
- Ant Design CLI：<https://ant.design/docs/react/cli-cn>
- Ant Design X：<https://x.ant.design/docs/react/introduce-cn>
- ProComponents：<https://procomponents.ant.design/>
- Umi Max：<https://umijs.org/docs/max/introduce>
- Vercel CLI：<https://vercel.com/docs/cli>
