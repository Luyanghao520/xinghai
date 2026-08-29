/* ============================================================
   全站固定背景 —— 与官网首页 FixedBackground 完全同款
   （同视频文件 / 同构图参数 / 同 A-B 交叉淡化逻辑，参数勿改）
   用法：页面 <head> 引 bg.css，任意位置引 bg.js（defer）即可。
   首页 React 版仍是唯一调参源；本文件是它的静态页镜像，
   两边参数必须保持一致（stage: 185% 顶部锚定 + 亮度滤镜 + 蓝雾）。
   ============================================================ */
(function () {
  'use strict';
  if (document.getElementById('xh-bg-host')) return;

  var CROSSFADE_S = 1.1;      // 与首页一致
  var PINGPONG_SPEED = 0.78;  // 与首页一致

  /* 方案解析与首页同规则：?bg=star|stage > sessionStorage('xh-bg') > stage */
  var key = 'stage';
  try {
    var q = new URLSearchParams(window.location.search).get('bg');
    if (q === 'star' || q === 'stage') key = q;
    else if (sessionStorage.getItem('xh-bg') === 'star') key = 'star';
    sessionStorage.setItem('xh-bg', key);
  } catch (e) { /* ignore */ }
  var SRC = key === 'star' ? '/static/uploads/bg-starfield.mp4' : '/static/uploads/bg-stage.mp4';

  /* 宿主层：z-index:-1 压在全部内容之后、theme 星空图之上
     （视频就绪前透出 theme 星空作为海报兜底，失败也兜底） */
  var host = document.createElement('div');
  host.id = 'xh-bg-host';
  host.className = 'bg-host';
  host.setAttribute('data-bg', key);
  host.setAttribute('aria-hidden', 'true');

  var inner = document.createElement('div');
  inner.className = 'bg-inner';
  host.appendChild(inner);

  if (key === 'stage') {
    /* 与首页同构：B 垫底，A 在前带 .on；交叉窗时互换 */
    inner.innerHTML =
      '<video id="bg-b" class="bg-video" src="' + SRC + '" autoplay muted playsinline preload="auto"></video>' +
      '<video id="bg-a" class="bg-video on" src="' + SRC + '" autoplay muted playsinline preload="auto"></video>';
  } else {
    inner.innerHTML =
      '<video id="bg-a" class="bg-video on" src="' + SRC + '" autoplay muted playsinline preload="auto"></video>';
  }

  function mount() {
    document.body.appendChild(host);
    /* 蓝色星云辉光 + 顶/底渐变纱（与首页同款） */
    ['bg-nebula bg-nebula-1', 'bg-nebula bg-nebula-2', 'bg-nebula bg-nebula-3'].forEach(function (cls) {
      var d = document.createElement('div');
      d.className = cls;
      host.appendChild(d);
    });
    var st = document.createElement('div');
    st.className = 'bg-scrim bg-scrim-top';
    var sb = document.createElement('div');
    sb.className = 'bg-scrim bg-scrim-bottom';
    host.appendChild(st); host.appendChild(sb);
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);

  /* 内容可读纱：轻压视频亮度保正文对比度（见 bg.css 注释） */
  function mountVeil() {
    var v = document.createElement('div');
    v.className = 'bg-veil';
    (document.body || document.documentElement).appendChild(v);
  }
  if (document.body) mountVeil(); else document.addEventListener('DOMContentLoaded', mountVeil);

  var a = null, b = null;
  function init() {
    a = document.getElementById('bg-a');
    b = document.getElementById('bg-b');
    if (!a) return;
    var raf = 0;
    if (key === 'stage') {
      /* A/B 交叉淡化：A 近尾 → B(垫底)已在播，A 淡出后归位（逻辑与首页逐行对应） */
      var active = true, swapping = false;
      /* 看门狗：活动视频画面无推进 → 自动恢复播放；仍卡死 → 重载解码器 */
      var lastT = -1, lastAdvance = performance.now(), reloads = 0;
      var tick = function () {
        raf = window.requestAnimationFrame(tick);
        var cur = active ? a : b;
        if (!swapping && !document.hidden && cur.paused) {
          var rp = cur.play(); if (rp && rp.catch) rp.catch(function () {});
        }
        if (!swapping && !document.hidden && cur.readyState >= 2 && !cur.paused) {
          var t = cur.currentTime;
          if (Math.abs(t - lastT) > 0.02) {
            lastT = t; lastAdvance = performance.now(); reloads = 0;
          } else if (performance.now() - lastAdvance > 2200) {
            if (reloads === 0) {
              var rp2 = cur.play(); if (rp2 && rp2.catch) rp2.catch(function () {});
            } else {
              cur.load();
              var rp3 = cur.play(); if (rp3 && rp3.catch) rp3.catch(function () {});
            }
            reloads++; lastAdvance = performance.now();
          }
        }
        if (!b || swapping) return;
        var nxt = active ? b : a;
        var dur = cur.duration;
        if (!Number.isFinite(dur) || dur <= 0) return;
        var win = Math.min(CROSSFADE_S, dur * 0.25);
        if (cur.currentTime < dur - win) return;
        swapping = true;
        try { nxt.currentTime = 0; } catch (e) { }
        var p = nxt.play(); if (p && p.catch) p.catch(function () { });
        nxt.classList.add('on');
        cur.classList.remove('on');
        window.setTimeout(function () {
          cur.pause();
          try { cur.currentTime = 0; } catch (e) { }
          active = !active;
          swapping = false;
        }, win * 1000);
      };
      raf = window.requestAnimationFrame(tick);
    } else {
      /* ping-pong 往返（star 方案，逻辑与首页逐行对应） */
      var dir = 1, last = performance.now();
      var tick2 = function (now) {
        raf = window.requestAnimationFrame(tick2);
        var dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        if (a.seeking || a.paused || a.readyState < 2) return;
        var d = a.duration;
        if (!Number.isFinite(d) || d <= 0) return;
        var t = a.currentTime + dir * dt * PINGPONG_SPEED;
        if (t >= d - 0.04) { t = d - 0.04; dir = -1; }
        else if (t <= 0.04 && dir < 0) { t = 0.04; dir = 1; }
        try { a.currentTime = t; } catch (e) { }
      };
      raf = window.requestAnimationFrame(tick2);
    }

    /* 标签页隐藏时整体暂停；回来续播（与首页一致） */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        a.pause(); if (b) b.pause();
      } else {
        var p = a.play(); if (p && p.catch) p.catch(function () { });
        if (key === 'stage' && b) {
          var act = a.classList.contains('on') ? b : a;
          var p2 = act.play(); if (p2 && p2.catch) p2.catch(function () { });
        }
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
