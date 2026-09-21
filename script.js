// ============================================================
// 1. 主题切换（会记住你的选择，首次访问跟随系统）
// ============================================================
(function initTheme() {
  const KEY = 'homepage-theme';
  const root = document.documentElement;
  const saved = localStorage.getItem(KEY);

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));

  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem(KEY, next);
    });
  }
})();

// ============================================================
// 2. 移动端菜单
// ============================================================
(function initMenu() {
  const nav = document.getElementById('nav');
  const btn = document.getElementById('menu-toggle');
  if (!nav || !btn) return;

  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });

  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
})();

// ============================================================
// 3. 滚动时给顶栏加分隔线 + 高亮当前栏目
// ============================================================
(function initScrollSpy() {
  const header = document.getElementById('site-header');
  const links = Array.from(document.querySelectorAll('.nav a'));
  const sections = links
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);

    const line = window.scrollY + window.innerHeight * 0.3;
    let current = sections[0];
    for (const s of sections) {
      if (s.offsetTop <= line) current = s;
    }

    links.forEach((a) => {
      a.classList.toggle('active', current && a.getAttribute('href') === '#' + current.id);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ============================================================
// 4. 元素滚动进入视口时淡入
// ============================================================
(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        // 同一批元素依次出现，错开 70ms，看起来更自然
        entry.target.style.transitionDelay = `${i * 70}ms`;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  items.forEach((el) => io.observe(el));

  // 安全网：页面加载完后如果首屏元素还没被点亮，
  // 说明观察器没正常工作，这时直接把内容全部显示，宁可没动画也不能白屏。
  window.addEventListener('load', () => {
    setTimeout(() => {
      const stillHidden = Array.from(items).filter(
        (el) => !el.classList.contains('in') && el.getBoundingClientRect().top < window.innerHeight
      );

      if (stillHidden.length) {
        items.forEach((el) => {
          el.style.transitionDelay = '0ms';
          el.classList.add('in');
        });
      }
    }, 1200);
  });
})();

// ============================================================
// 5. 打字机效果
//    想改文案：编辑 index.html 里 <span id="typed" data-words="...">
//    多个词用 | 分隔
// ============================================================
(function initTyped() {
  const el = document.getElementById('typed');
  if (!el) return;

  const words = (el.dataset.words || el.textContent).split('|').map((w) => w.trim()).filter(Boolean);
  if (words.length < 2) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    el.textContent = words[0];
    return;
  }

  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const word = words[wordIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = word.slice(0, charIndex);
      if (charIndex === word.length) {
        deleting = true;
        return setTimeout(tick, 1600);          // 打完停顿
      }
      return setTimeout(tick, 110);              // 打字速度
    }

    charIndex--;
    el.textContent = word.slice(0, charIndex);
    if (charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      return setTimeout(tick, 320);
    }
    return setTimeout(tick, 55);                 // 删除速度
  }

  el.textContent = '';
  setTimeout(tick, 700);
})();

// ============================================================
// 6. 页脚年份 & 复制邮箱
// ============================================================
(function initMisc() {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const copyBtn = document.getElementById('copy-email');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    const email = copyBtn.dataset.email;
    const original = copyBtn.textContent;

    try {
      await navigator.clipboard.writeText(email);
      copyBtn.textContent = '已复制 ✓';
    } catch {
      // 部分浏览器在非 https 下不给用剪贴板，退回到手动选择
      window.prompt('复制下面的邮箱：', email);
      return;
    }

    setTimeout(() => { copyBtn.textContent = original; }, 1600);
  });
})();
