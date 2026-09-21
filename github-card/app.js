// ============================================================
//  GitHub 名片 —— 一个用公开 API 练手的项目
//
//  整个流程只有三步：
//    1. 拿到用户名
//    2. 向 GitHub 要数据（两个接口：用户信息 + 仓库列表）
//    3. 把数据填到页面上
//
//  想改哪儿，看下面带 ★ 的注释。
// ============================================================

const API = 'https://api.github.com';

// ------------------------------------------------------------
// 元素引用：一开始就把要用的 DOM 找出来，避免每次都查一遍
// ------------------------------------------------------------
const form       = document.getElementById('search-form');
const input      = document.getElementById('username');
const statusBox  = document.getElementById('status');
const card       = document.getElementById('card');

const elAvatar    = document.getElementById('avatar');
const elName      = document.getElementById('name');
const elLogin     = document.getElementById('login');
const elBio       = document.getElementById('bio');
const elMeta      = document.getElementById('meta');
const elRepos     = document.getElementById('repos');
const elStarsNote = document.getElementById('stars-note');

const elStat = {
  repos:     document.getElementById('stat-repos'),
  stars:     document.getElementById('stat-stars'),
  followers: document.getElementById('stat-followers'),
  following: document.getElementById('stat-following'),
};

// ------------------------------------------------------------
// 语言小圆点的配色表
// ★ 想加新语言，照着格式加一行就行
// ------------------------------------------------------------
const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python:     '#3572A5',
  HTML:       '#e34c26', CSS:        '#563d7c', Java:       '#b07219',
  Go:         '#00ADD8', Rust:       '#dea584', C:          '#555555',
  'C++':      '#f34b7d', 'C#':       '#178600', Shell:      '#89e051',
  Vue:        '#41b883', Ruby:       '#701516', PHP:        '#4F5D95',
  Swift:      '#F05138', Kotlin:     '#A97BFF', Dart:       '#00B4AB',
  Jupyter:    '#DA5B0B', Svelte:     '#ff3e00',
};

// ------------------------------------------------------------
// 小工具
// ------------------------------------------------------------

/** 把 12345 显示成 1.2万，数字太长的看着累 */
function formatNumber(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  if (n >= 1000)  return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

/** 2026-09-21T... → 2026年9月21日 */
function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/**
 * 用户可能输入很多东西，这里统一清理：
 *   "torvalds"                            → torvalds
 *   "@torvalds"                           → torvalds
 *   "https://github.com/torvalds"         → torvalds
 *   "github.com/torvalds/ linux"          → torvalds
 */
function normalizeUsername(raw) {
  return raw
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '') // 去掉网址前缀
    .replace(/^@/, '')                                  // 去掉 @
    .split(/[/?#\s]/)[0]                                // 只取第一段
    .trim();
}

/** 统一处理请求，把 HTTP 状态码翻译成人话 */
async function fetchJSON(url) {
  const res = await fetch(url);

  if (res.ok) return res.json();

  if (res.status === 404) throw new Error('NOT_FOUND');
  if (res.status === 403) throw new Error('RATE_LIMIT');
  throw new Error('HTTP_' + res.status);
}

/** 把一个错误对象变成给用户看的一句话 */
function explainError(err) {
  switch (err.message) {
    case 'NOT_FOUND':
      return '找不到这个用户，检查一下拼写？';
    case 'RATE_LIMIT':
      return 'GitHub 免费接口每小时限 60 次，已用完。等一小时再试，或者登录 GitHub 后提高额度。';
    case 'EMPTY':
      return '请先输入一个用户名。';
    default:
      return '请求失败了（' + err.message + '）。检查网络，或稍后再试。';
  }
}

// ------------------------------------------------------------
// 渲染：把数据填进页面
//
// 注意这里全程用 textContent 而不是 innerHTML。
// 因为这些文字来自外部（别人的 GitHub 简介），
// 用 innerHTML 拼接等于给 XSS 攻击开门。
// ------------------------------------------------------------

function renderProfile(user) {
  elAvatar.src = user.avatar_url;
  elAvatar.alt = user.login + ' 的头像';

  // name 可能是空的，那就退回用登录名
  elName.textContent = user.name || user.login;

  elLogin.textContent = '@' + user.login;
  elLogin.href = user.html_url;

  // bio 为空时整段删掉，不留空行
  if (user.bio) {
    elBio.textContent = user.bio;
    elBio.hidden = false;
  } else {
    elBio.hidden = true;
  }

  // 公司 / 位置 / 博客 / 加入时间，有哪个显示哪个
  elMeta.textContent = '';
  const rows = [];

  if (user.company)   rows.push({ text: '🏢 ' + user.company });
  if (user.location)  rows.push({ text: '📍 ' + user.location });
  if (user.blog) {
    // blog 字段可能没写协议，补一个再当链接用
    const href = /^https?:\/\//.test(user.blog) ? user.blog : 'https://' + user.blog;
    rows.push({ text: '🔗 ' + user.blog.replace(/^https?:\/\//, ''), href });
  }
  if (user.created_at) rows.push({ text: '🗓 ' + formatDate(user.created_at) + ' 加入' });

  for (const row of rows) {
    const li = document.createElement('li');
    if (row.href) {
      const a = document.createElement('a');
      a.textContent = row.text;
      a.href = row.href;
      a.target = '_blank';
      a.rel = 'noopener';
      li.appendChild(a);
    } else {
      li.textContent = row.text;
    }
    elMeta.appendChild(li);
  }
}

function renderStats(user, repos) {
  // 总 star：把拿到的仓库的 star 数加起来
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);

  elStat.repos.textContent     = formatNumber(user.public_repos);
  elStat.stars.textContent     = formatNumber(totalStars);
  elStat.followers.textContent = formatNumber(user.followers);
  elStat.following.textContent = formatNumber(user.following);

  // 一次最多只能拿 100 个仓库，超了就如实说明，别假装是全部
  if (user.public_repos > repos.length) {
    elStarsNote.textContent =
      `注：star 总数基于最近更新的 ${repos.length} 个仓库统计，该用户共有 ${user.public_repos} 个公开仓库。`;
    elStarsNote.hidden = false;
  } else {
    elStarsNote.hidden = true;
  }
}

function renderRepos(repos) {
  elRepos.textContent = '';

  // 按 star 数从高到低排，取前 6 个
  // ★ 想改成看最近更新的，把 stargazers_count 换成 pushed_at
  const top = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6);

  if (top.length === 0) {
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = '这个人还没有公开仓库。';
    elRepos.appendChild(p);
    return;
  }

  for (const repo of top) {
    const a = document.createElement('a');
    a.className = 'repo';
    a.href = repo.html_url;
    a.target = '_blank';
    a.rel = 'noopener';

    const name = document.createElement('h4');
    name.className = 'repo-name';
    name.textContent = repo.name;

    const desc = document.createElement('p');
    desc.className = 'repo-desc';
    desc.textContent = repo.description || '这个项目没有写简介。';

    const foot = document.createElement('div');
    foot.className = 'repo-foot';

    if (repo.language) {
      const lang = document.createElement('span');
      const dot = document.createElement('span');
      dot.className = 'lang-dot';
      dot.style.background = LANGUAGE_COLORS[repo.language] || 'var(--muted)';
      lang.appendChild(dot);
      lang.appendChild(document.createTextNode(repo.language));
      foot.appendChild(lang);
    }

    const stars = document.createElement('span');
    stars.textContent = '★ ' + formatNumber(repo.stargazers_count);
    foot.appendChild(stars);

    if (repo.forks_count > 0) {
      const forks = document.createElement('span');
      forks.textContent = '⑂ ' + formatNumber(repo.forks_count);
      foot.appendChild(forks);
    }

    a.append(name, desc, foot);
    elRepos.appendChild(a);
  }
}

// ------------------------------------------------------------
// 主流程
// ------------------------------------------------------------

function setStatus(text, type) {
  statusBox.className = 'status' + (type ? ' ' + type : '');
  statusBox.textContent = '';

  if (type === 'loading') {
    const sp = document.createElement('span');
    sp.className = 'spinner';
    statusBox.appendChild(sp);
  }
  statusBox.appendChild(document.createTextNode(text));
}

async function loadUser(rawUsername) {
  const username = normalizeUsername(rawUsername);

  if (!username) {
    setStatus(explainError(new Error('EMPTY')), 'error');
    card.hidden = true;
    return;
  }

  setStatus('正在查询 ' + username + ' …', 'loading');
  card.hidden = true;
  form.querySelector('button').disabled = true;

  try {
    // 两个请求可以同时发，不用等第一个回来再发第二个
    const [user, repos] = await Promise.all([
      fetchJSON(`${API}/users/${encodeURIComponent(username)}`),
      fetchJSON(`${API}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`),
    ]);

    renderProfile(user);
    renderStats(user, repos);
    renderRepos(repos);

    card.hidden = false;
    setStatus('');

    // 把结果写进网址，这样链接可以直接分享给别人
    // ★ 不想要这个功能，删掉这一行即可
    history.replaceState(null, '', '?user=' + encodeURIComponent(user.login));

  } catch (err) {
    setStatus(explainError(err), 'error');
    card.hidden = true;
  } finally {
    // finally 表示「不管成功还是失败都要执行」
    form.querySelector('button').disabled = false;
  }
}

// ------------------------------------------------------------
// 事件绑定和初始化
// ------------------------------------------------------------

form.addEventListener('submit', (e) => {
  e.preventDefault();          // 阻止表单默认的刷新页面行为
  loadUser(input.value);
});

// 打开页面时如果网址里带 ?user=xxx，就自动查一次
const preset = new URLSearchParams(location.search).get('user');
if (preset) {
  input.value = preset;
  loadUser(preset);
}

// ------------------------------------------------------------
// 主题切换 —— 用的是和主页同一个 localStorage key，
// 所以在主页选过深色，这里也会是深色
// ------------------------------------------------------------
(function initTheme() {
  const KEY = 'homepage-theme';
  const root = document.documentElement;
  const saved = localStorage.getItem(KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  root.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem(KEY, next);
  });
})();
