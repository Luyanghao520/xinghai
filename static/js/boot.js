// ===== 生成星空粒子（前景闪烁星，CSS 层）=====
(function createStars(){
  const stars = document.getElementById('boot-stars');
  if (!stars) return;
  for (let i = 0; i < 60; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 3 + 1;
    s.style.cssText = [
      'left:' + Math.random() * 100 + '%',
      'top:' + Math.random() * 100 + '%',
      'width:' + size + 'px',
      'height:' + size + 'px',
      '--dur:' + (Math.random() * 2 + 1.2) + 's',
      '--del:' + Math.random() * 3 + 's'
    ].join(';');
    stars.appendChild(s);
  }
})();

// ===== Canvas 星海层（视差星 + 流星 + 星轨 + 星座）=====
(function bootCanvas(){
  const cv = document.getElementById('boot-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, raf = 0, frame = 0;
  let stars = [], meteors = [];
  const orbit = { a: 0, b: 0 };
  // 星座（左上方，避开居中 logo）
  const constellation = [
    {x:0.10,y:0.16},{x:0.16,y:0.24},{x:0.15,y:0.32},
    {x:0.22,y:0.30},{x:0.28,y:0.20},{x:0.24,y:0.13}
  ];

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function init(){
    stars = [];
    const n = Math.round(W * H / 8000);   // 密度随屏幕大小
    for (let i = 0; i < n; i++){
      const depth = Math.random();        // 0 远 ~ 1 近
      stars.push({
        x: Math.random()*W, y: Math.random()*H,
        r: depth*1.5 + 0.3,
        a: Math.random()*0.6 + 0.3,
        tw: Math.random()*0.04 + 0.005,    // 闪烁速度
        ph: Math.random()*Math.PI*2,
        vy: (1-depth)*0.04 + 0.02,         // 近星慢飘
        gold: Math.random() < 0.7          // 金色/蓝色
      });
    }
  }
  function spawnMeteor(){
    meteors.push({
      x: Math.random()*W*0.7 + W*0.15,
      y: -20,
      len: Math.random()*120 + 80,
      sp: Math.random()*3 + 5,
      ang: Math.PI*0.26 + Math.random()*0.08
    });
  }
  function drawOrbit(cx, cy, r, rot, color){
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(rot);
    ctx.strokeStyle = color; ctx.lineWidth = 1;
    ctx.setLineDash([2, 12]);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
    for (let k = 0; k < 8; k++){
      const ang = k/8*Math.PI*2;
      ctx.beginPath(); ctx.arc(Math.cos(ang)*r, Math.sin(ang)*r, 1.5, 0, Math.PI*2);
      ctx.fillStyle = color.replace(/[\d.]+\)$/,'1)'); ctx.fill();
    }
    ctx.restore();
  }
  function draw(){
    frame++;
    ctx.clearRect(0, 0, W, H);

    // 1) 视差星星
    for (const s of stars){
      s.ph += s.tw;
      const a = s.a * (0.5 + 0.5*Math.sin(s.ph));
      s.y += s.vy; if (s.y > H){ s.y = 0; s.x = Math.random()*W; }
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = s.gold ? 'rgba(255,225,160,'+a+')' : 'rgba(180,205,255,'+a+')';
      ctx.shadowBlur = s.r*3;
      ctx.shadowColor = s.gold ? 'rgba(212,162,78,.8)' : 'rgba(120,160,255,.7)';
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // 2) 缓慢旋转的双层星轨
    orbit.a += 0.0016; orbit.b -= 0.0021;
    const cx = W/2, cy = H*0.42, R = Math.min(W, H);
    drawOrbit(cx, cy, R*0.36, orbit.a, 'rgba(212,162,78,.12)');
    drawOrbit(cx, cy, R*0.28, orbit.b, 'rgba(120,160,255,.10)');

    // 3) 星座连线 + 呼吸亮星
    ctx.save();
    ctx.strokeStyle = 'rgba(212,162,78,.22)'; ctx.lineWidth = 1;
    ctx.beginPath();
    constellation.forEach((p, i) => {
      const x = p.x*W, y = p.y*H;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.stroke();
    const tw = 0.6 + 0.4*Math.sin(frame*0.03);
    ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(212,162,78,.9)';
    constellation.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x*W, p.y*H, 2.4, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,235,180,'+tw+')'; ctx.fill();
    });
    ctx.shadowBlur = 0; ctx.restore();

    // 4) 流星
    if (Math.random() < 0.012 && meteors.length < 3) spawnMeteor();
    for (let i = meteors.length - 1; i >= 0; i--){
      const m = meteors[i];
      m.x += Math.cos(m.ang)*m.sp; m.y += Math.sin(m.ang)*m.sp;
      const tx = m.x - Math.cos(m.ang)*m.len, ty = m.y - Math.sin(m.ang)*m.len;
      const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
      g.addColorStop(0, 'rgba(255,240,200,.9)'); g.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();
      if (m.x > W + 60 || m.y > H + 60) meteors.splice(i, 1);
    }

    raf = requestAnimationFrame(draw);
  }

  resize(); init();
  window.addEventListener('resize', () => { resize(); init(); });
  draw();

  // 开屏结束（约 4.2s 后）停止动画，省 CPU
  window.__stopBootCanvas = function(){ cancelAnimationFrame(raf); };
})();

// ===== 开场后主页淡入 =====
window.addEventListener('load', function(){
  setTimeout(function(){
    document.body.classList.add('boot-done');
    setTimeout(initReveal, 500);
    setTimeout(function(){ if (window.__stopBootCanvas) window.__stopBootCanvas(); }, 4200);
  }, 100);
});

// ===== 滚动入场（丝滑）=====
function initReveal(){
  const targets = document.querySelectorAll('section, .mod, .sc-cap');
  targets.forEach((el, i) => {
    if (el.closest('#boot-screen')) return;
    el.classList.add('reveal');
    if (i % 4 === 1) el.classList.add('d2');
    if (i % 4 === 2) el.classList.add('d3');
    if (i % 4 === 3) el.classList.add('d4');
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}
