/* ============================================================
   星海艺术团 · UI 帮助函数 v3「深空玻璃」
   依赖：无（原生 JS）。配合 static/css/ui.css 使用。
   提供：XH.toast(msg, type)  /  XH.modal.open(id) / close(id)
   约定：弹窗结构
     <div class="xh-modal" id="xxx">
       <div class="xh-modal-mask" data-close></div>
       <div class="xh-modal-card">…</div>
     </div>
   ============================================================ */
(function () {
  'use strict';

  /* ---------- toast ---------- */
  function host() {
    var h = document.getElementById('xh-toast-host');
    if (!h) {
      h = document.createElement('div');
      h.id = 'xh-toast-host';
      document.body.appendChild(h);
    }
    return h;
  }
  function toast(msg, type, ms) {
    var el = document.createElement('div');
    el.className = 'xh-toast' + (type ? ' ' + type : '');
    el.textContent = msg;
    host().appendChild(el);
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { el.remove(); }, 320);
    }, ms || 2600);
  }

  /* ---------- modal ---------- */
  var lastFocus = null;
  function open(id) {
    var m = document.getElementById(id);
    if (!m || !m.classList.contains('xh-modal')) return;
    lastFocus = document.activeElement;
    m.classList.add('open');
    document.body.style.overflow = 'hidden';
    var f = m.querySelector('input,select,textarea,button:not(.xh-modal-close),a[href]');
    if (f) setTimeout(function () { try { f.focus(); } catch (e) {} }, 60);
  }
  function close(id) {
    var m = typeof id === 'string' ? document.getElementById(id) : id;
    if (!m) return;
    m.classList.remove('open');
    if (!document.querySelector('.xh-modal.open')) document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} lastFocus = null; }
  }
  function closeTop() {
    var list = document.querySelectorAll('.xh-modal.open');
    if (list.length) close(list[list.length - 1]);
  }

  /* 点遮罩 / [data-close] 关闭 */
  document.addEventListener('click', function (e) {
    var c = e.target.closest ? e.target.closest('[data-close]') : null;
    if (c) {
      var m = c.closest('.xh-modal');
      if (m) { close(m); return; }
    }
    if (e.target.classList && e.target.classList.contains('xh-modal-mask')) {
      close(e.target.parentElement);
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeTop();
  });

  /* ---------- 数字滚动（统计卡等） ---------- */
  function countUp(el, to, ms, suffix) {
    var start = null;
    var dur = ms || 900;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * eased) + (suffix || '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- 图标（Lucide）----------
     页面引入 static/js/vendor/lucide.min.js 后，<i data-lucide="users"> 会被
     替换为内联 SVG。动态插入带图标的 HTML 后调用 XH.icons() 重新扫描。 */
  function icons() {
    if (window.lucide && window.lucide.createIcons) {
      try {
        window.lucide.createIcons({ attrs: { width: 15, height: 15, 'stroke-width': 1.75 } });
      } catch (e) { /* ignore */ }
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', icons);
  } else {
    icons();
  }

  /* ---------- 顶栏滚动抬升（navbar-12 同语义） ---------- */
  function topbarScroll() {
    var tb = document.querySelector('.xh-topbar');
    if (!tb) return;
    var upd = function () {
      tb.classList.toggle('scrolled', (window.scrollY || 0) > 8);
    };
    window.addEventListener('scroll', upd, { passive: true });
    upd();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', topbarScroll);
  } else {
    topbarScroll();
  }

  window.XH = { toast: toast, modal: { open: open, close: close, closeTop: closeTop }, countUp: countUp, icons: icons };
})();
