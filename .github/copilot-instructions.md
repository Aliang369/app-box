# AI Coding Instructions

## Code Style & Linting Rule

- 在 `packages/admin` 下开发时，必须优先遵循 Prettier 的默认格式化规则，避免出现换行风格、单行/多行写法不统一的报错。
- 在编写 Element Plus 组件属性较长时，可以按 Prettier 默认规则合理换行；但建议优先保持组件在同一行，除非属性确实过多导致可读性下降。
- 如果不确定 Prettier 偏好，优先参考项目现有已通过 lint 的页面风格，不要随意引入新的多行排版习惯。

## Mobile Page Header Rule

在 `packages/mobile` 下开发二级页面时，顶部必须遵循统一头部规范：

- 必须优先复用 `@/components/PageHeader.vue`，禁止在页面里重复拼装新的顶部结构。
- 顶部安全区必须使用 `padding-top: calc(var(--status-bar-height, 0px) + 16px)`，禁止使用 `pt-24`、`pt-20`、`pt-12`、`top-14` 等硬编码方式制造顶部留白。
- 头部结构固定为：左侧返回按钮，中间标题，右侧可选操作位。标题必须保持视觉居中。
- 头部视觉固定为：`bg-white px-6 pb-5 border-b border-gray-100`。
- 返回按钮点击区固定为 `w-10 h-10 rounded-full bg-gray-50`，图标使用 `lucide` 细线图标。
- 标题固定使用单行中文标题，不要再添加英文副标题；标题样式为 `text-[18px] font-black text-gray-900 tracking-tight`。
- 页面需要从外链或直达入口打开时，必须给 `PageHeader` 传 `fallback-url`，保证返回有兜底页面。
- `pages.json` 中使用这套头部的页面，必须设置 `"navigationStyle": "custom"`，不要混用原生导航栏标题和自定义头部。

## Affected Pages

以下页面已经采用该规范，后续新增相似页面必须对齐：

- `pages/my/gifts`
- `pages/my/favorites`
- `pages/my/footprints`
- `pages/detail/index`

## Mobile Auth Rule

在 `packages/mobile` 和 `packages/server` 下开发账号体系相关功能时，必须遵循以下规则：

- 登录与注册必须分离，禁止再实现“账号不存在则自动注册”的隐式逻辑。
- 注册页必须提供独立入口，并要求用户勾选《用户协议》《隐私政策》后才能提交。
- 登录页必须提供协议勾选框，协议标题必须可点击跳转到独立协议页面。
- 登录页的协议确认区默认放在主登录按钮下方，不要塞在密码输入框下面；当用户主动点击登录但尚未勾选时，可以自动补勾选后继续登录流程。
- 用户信息必须区分 `username` 和 `nickname`：`username` 作为唯一登录账号，`nickname` 作为展示名称。
- `username` 一经创建后视为唯一账号标识，后台管理仅允许查看和搜索，不允许编辑修改。
- 新用户注册时，服务端可以自动生成初始昵称；登录后允许用户在个人资料中修改昵称。
- 个人资料页至少包含：账号信息展示、昵称修改、密码修改。
- 密码修改必须校验原密码，并要求输入新密码和确认新密码。
- 前端保存 `user_info` 时，必须同时持久化最新的 `nickname`、`username`、`avatar`、`token`。
- 认证体系必须包含 `access token + refresh token` 两层凭证；access token 过期时优先尝试 refresh，refresh 失败后才统一清空登录态并跳转登录页。
- 用户体系必须支持 `正常 / 冻结` 状态；被冻结账号必须禁止登录，已登录用户在后续鉴权或刷新 token 时也必须被拦截并强制回到登录页。
- 后台 `用户管理` 必须提供冻结/解冻能力，并记录冻结日志，日志至少包含：状态动作、备注原因、操作人、操作时间。
- 协议体系必须包含版本号；当 `用户协议` 或 `隐私政策` 版本升级后，登录后应能识别并要求用户重新确认。
- 后台管理的 `用户管理` 页面必须至少展示：`username`、`nickname`、账号状态，并支持管理员修改昵称、直接修改密码、查看冻结日志。
- 后台管理的 `用户管理` 必须提供“重置密码为随机初始密码并自动复制到剪贴板”的操作按钮；重置密码时使用 8 位随机密码（大小写字母+数字），并立即增加用户的 `refresh_token_version` 强制当前登录态失效。
- 需要自定义顶部的登录页、注册页、协议页、个人资料页，必须继续复用 `PageHeader.vue` 与统一顶部安全区规范。
