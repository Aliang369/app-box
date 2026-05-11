# AI Coding Instructions

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
