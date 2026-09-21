# 个人主页

纯 HTML / CSS / JavaScript 写的静态个人主页，零依赖、零构建。

## 怎么看效果

直接双击 `index.html`，浏览器就会打开。

## 改哪些地方

大部分内容都在 `index.html` 里，中文注释标了位置：

| 想改的东西 | 位置 |
| --- | --- |
| 浏览器标签页标题 | `<title>` 和 `<meta name="description">` |
| 名字 | 导航栏 `.brand`、首屏 `.hero-title`、页脚 |
| 轮播的身份词 | `<span id="typed" data-words="前端开发\|独立开发者">`，多个用 `\|` 分隔 |
| 自我介绍 | `.hero-desc` 和「关于我」那一节 |
| 右侧资料卡 | `.facts` 里的四行 |
| 技能 | `#skills` 里的三个 `.card` |
| 作品 | `#projects` 里的三个 `.card`，多退少补 |
| 邮箱 | 搜 `you@example.com` 全部替换（有 4 处） |
| 社交链接 | `.socials` 里的 `<li>`，不用的整行删掉 |
| 头像 | 把 `.avatar` 的 `src` 换成 `avatar.jpg`，图片放进同一目录 |

配色在 `styles.css` 顶部的 `:root` 和 `html[data-theme="dark"]` 里，
改 `--accent` 和 `--accent-2` 两个值就能换整站主色。

## 怎么发布上线

**GitHub Pages**（免费，最简单）

1. 新建一个仓库，把这三个文件传上去
2. 仓库 Settings → Pages → Source 选 `main` 分支、`/ (root)`
3. 等一分钟，访问 `https://你的用户名.github.io/仓库名/`

如果仓库名就叫 `你的用户名.github.io`，那访问地址就是 `https://你的用户名.github.io/`。

**其他选择**：Vercel、Netlify、Cloudflare Pages，都是拖文件夹进去就完事。

## 文件说明

- `index.html` —— 页面结构和所有文字内容
- `styles.css` —— 样式，顶部变量区控制配色
- `script.js` —— 主题切换、移动端菜单、滚动动画、打字机效果
