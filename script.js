/* ═══════════════════════════════
   CURSOR
═══════════════════════════════ */
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
  ring.style.left = mx + 'px'; ring.style.top = my + 'px';
});
document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => { ring.style.width = '56px'; ring.style.height = '56px'; ring.style.opacity = '0.2'; });
  el.addEventListener('mouseleave', () => { ring.style.width = '36px'; ring.style.height = '36px'; ring.style.opacity = '0.4'; });
});

/* ═══════════════════════════════
   SPLASH (Otomatis / Tanpa Klik)
═══════════════════════════════ */
(function initSplash() {
  const splash = document.getElementById('splash');
  const inner = document.getElementById('splash-magnet-inner');

  // Build splash magnet grid
  const ROWS = 11, COLS = 15;
  inner.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
  inner.style.gridTemplateRows = `repeat(${ROWS}, 1fr)`;
  inner.style.width = '100vw'; inner.style.height = '100vh';

  const lines = [];
  for (let i = 0; i < ROWS * COLS; i++) {
    const el = document.createElement('div');
    el.style.cssText = 'width:2px;height:28px;background:#F7F5F0;border-radius:100px;display:block;';
    inner.appendChild(el);
    lines.push({ el, angle: 0 });
  }

  let animRunning = true;
  function updateSplashMagnet(e) {
    if (!animRunning) return;
    lines.forEach(({ el }) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2; const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
      el.style.transform = `rotate(${angle}deg)`;
    });
  }
  window.addEventListener('mousemove', updateSplashMagnet);

  // Splash otomatis berjalan dan hilang setelah 1.8 detik
  requestAnimationFrame(() => {
    splash.classList.add('ready');
    
    setTimeout(() => {
      animRunning = false;
      window.removeEventListener('mousemove', updateSplashMagnet);
      splash.classList.add('exit');
      setTimeout(() => { splash.style.display = 'none'; }, 1200);
    }, 1800);
  });
})();

/* ═══════════════════════════════
   HERO MAGNET LINES (Canvas)
═══════════════════════════════ */
(function initHeroMagnet() {
  const canvas = document.getElementById('magnet-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const ROWS = 8, COLS = 8;
  const cw = W / COLS, ch = H / ROWS;
  let mx = W/2, my = H/2;

  const lines = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) { lines.push({ x: (c + 0.5) * cw, y: (r + 0.5) * ch, angle: 0 }); }
  }

  document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left; my = e.clientY - rect.top;
  });

  let targets = lines.map(() => 0);
  function draw() {
    ctx.clearRect(0, 0, W, H);
    lines.forEach((l, i) => {
      const target = Math.atan2(my - l.y, mx - l.x);
      targets[i] += (target - targets[i]) * 0.12;
      ctx.save();
      ctx.translate(l.x, l.y); ctx.rotate(targets[i]);
      ctx.fillStyle = '#C8A96E'; ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.roundRect(-1, -16, 2, 32, 2); ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ═══════════════════════════════
   VELOCITY SCROLL
═══════════════════════════════ */
(function initVelocity() {
  const items1 = 'Andrew Anstendyk Takalamingan ✦ Python ✦ HTML ✦ JavaScript ✦ Java ✦ C++ ✦ MongoDB ✦ GitHub ✦ Figma ✦ Machine Learning ✦ UI/UX ✦ REST API ✦ ';
  const items2 = 'Universitas Tarumanagara ✦ Neural Networks ✦ Front-end ✦ Back-end ✦ Software Engineering ✦ Open Source ✦ Design Systems ✦ ';

  function fillTrack(id, text, direction) {
    const track = document.getElementById(id);
    let html = '';
    for (let i = 0; i < 4; i++) { html += `<span class="velocity-item">${text}</span>`; }
    track.innerHTML = html;

    let pos = 0; const speed = direction > 0 ? 0.5 : -0.5; const totalW = track.scrollWidth / 2;
    let lastScroll = window.scrollY; let scrollBoost = 0;
    
    window.addEventListener('scroll', () => {
      scrollBoost = (window.scrollY - lastScroll) * direction * 0.3;
      lastScroll = window.scrollY;
    });

    function tick() {
      pos += speed + scrollBoost * 0.05; scrollBoost *= 0.92;
      if (pos > totalW) pos -= totalW; if (pos < 0) pos += totalW;
      track.style.transform = `translateX(${-pos}px)`;
      requestAnimationFrame(tick);
    }
    tick();
  }
  fillTrack('vel-track-1', items1, 1);
  fillTrack('vel-track-2', items2, -1);
})();

/* ═══════════════════════════════
   GITHUB CALENDAR
═══════════════════════════════ */
(async function initGithub() {
  const container = document.getElementById('github-calendar');
  const countEl = document.getElementById('gh-count');
  const tooltip = document.getElementById('cal-tooltip');

  try {
    const res = await fetch('https://github-contributions-api.deno.dev/DRoDREW.json');
    const data = await res.json();
    countEl.textContent = `• ${data.totalContributions} contributions`;

    const weeks = data.contributions || [];
    let html = '<div class="calendar-grid">';
    weeks.forEach((week, wi) => {
      html += '<div class="cal-week">';
      week.forEach((day, di) => {
        const lvl = day.contributionLevel;
        let cls = 'cal-l0';
        if (lvl === 'FIRST_QUARTILE') cls = 'cal-l1';
        else if (lvl === 'SECOND_QUARTILE') cls = 'cal-l2';
        else if (lvl === 'THIRD_QUARTILE') cls = 'cal-l3';
        else if (lvl === 'FOURTH_QUARTILE') cls = 'cal-l4';
        const delay = (wi * 0.008 + di * 0.008).toFixed(3);
        html += `<div class="cal-cell ${cls}" style="opacity:0;animation:fadeIn 0.4s ease ${delay}s forwards;" data-date="${day.date}" data-count="${day.contributionCount}"></div>`;
      });
      html += '</div>';
    });
    html += '</div>';

    if (!document.getElementById('cal-anim')) {
      const s = document.createElement('style'); s.id = 'cal-anim'; s.textContent = '@keyframes fadeIn { to { opacity:1; } }'; document.head.appendChild(s);
    }
    container.innerHTML = html;

    container.querySelectorAll('.cal-cell').forEach(cell => {
      cell.addEventListener('mouseenter', e => {
        const d = cell.dataset.date, c = cell.dataset.count;
        tooltip.textContent = `${c} contributions on ${d}`; tooltip.classList.add('visible');
      });
      cell.addEventListener('mousemove', e => { tooltip.style.left = e.clientX + 12 + 'px'; tooltip.style.top = e.clientY - 36 + 'px'; });
      cell.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
    });
  } catch(e) {
    container.innerHTML = '<p style="color:#aaa;font-size:0.8rem;">Gagal memuat GitHub contributions.</p>';
  }
})();

/* ═══════════════════════════════
   SCROLL CARDS (GRID KIRI-KANAN FIT)
═══════════════════════════════ */
(function initCards() {
  const projects = [
    {
      title: "Self-Driving Car NN",
      src: "assets/self_driving.png",
      link: "https://github.com/DRoDREW/self-driving-car-nn-java",
      tags: ["Java", "Machine Learning"],
      desc: "Simulasi mobil otonom menggunakan neural network yang dibangun dari nol di Java. Mobil belajar menghindari rintangan melalui backpropagation tanpa library ML eksternal."
    },
    {
      title: "Early Stroke Detection ML",
      src: "assets/stroke_detection.png",
      link: "https://github.com/DRoDREW/EARLY-STROKE-DETECTION-ML",
      tags: ["Python", "Machine Learning", "Healthcare"],
      desc: "Model machine learning untuk deteksi dini risiko stroke berdasarkan data klinis pasien. Mengimplementasikan beberapa algoritma klasifikasi dan perbandingan akurasi antar model."
    },
    {
      title: "VaultBank",
      src: "assets/vaultbank.jpeg",
      link: "https://github.com/ToastF/VaultBank",
      tags: ["Fintech", "App"],
      desc: "Aplikasi perbankan digital dengan fitur manajemen saldo, transfer, dan histori transaksi. Dibangun sebagai proyek kolaborasi dengan fokus pada keamanan data pengguna."
    },
    {
      title: "Mie Yamin Untar (Web)",
      src: "assets/mie_yamin.jpeg",
      link: "https://github.com/RustyRustacle/MieYaminUntar",
      tags: ["Web Dev", "HTML/JS"],
      desc: "Website pemesanan makanan untuk kantin kampus Untar. Menampilkan menu interaktif, sistem pemesanan online, dan integrasi pembayaran dasar menggunakan HTML, CSS, dan JavaScript."
    },
    {
      title: "Mie Yamin Untar (UI/UX)",
      src: "assets/mie_yamin_design.png",
      link: "https://www.figma.com/design/JyyEfamfr66kZsC0EOXkUM",
      tags: ["Figma", "Design"],
      desc: "Desain UI/UX lengkap untuk aplikasi pemesanan Mie Yamin Untar. Mencakup user flow, wireframe, hingga high-fidelity prototype dengan pendekatan mobile-first di Figma."
    },
    {
      title: "Mobile Banking Design",
      src: "assets/baking_design.png",
      link: "https://www.figma.com/design/taznVCJePipeTIS5HWTZND/mobile-banking?node-id=0-1",
      tags: ["Figma", "Mobile", "UI/UX"],
      desc: "Desain antarmuka aplikasi mobile banking yang modern dan intuitif. Mencakup halaman login, dashboard, transfer, dan histori transaksi dengan sistem desain yang konsisten."
    },
    {
      title: "Central Creative Hub",
      src: "assets/creative_hub.jpeg",
      link: "https://www.figma.com/design/AyH292zpzWZME6ijQt3snY",
      tags: ["UI/UX", "Platform"],
      desc: "Platform digital untuk komunitas kreatif di kampus. Desain kolaboratif kelompok mencakup sistem manajemen event, portofolio anggota, dan forum diskusi."
    },
    {
      title: "WAYANTARA",
      src: "assets/front_end_uts.png",
      link: "https://uts-front-end-kelompok10-1.vercel.app/",
      tags: ["Front-end", "CSS"],
      desc: "Proyek UTS mata kuliah Front-end Development secara kelompok. Membangun website responsif dengan layout CSS Grid/Flexbox, animasi CSS, dan komponen interaktif tanpa framework."
    },
    {
      title: "WEB UNTAR",
      src: "assets/backend.jpeg",
      link: "https://github.com/DRoDREW/UAS-BACKEND",
      tags: ["Back-end", "API"],
      desc: "REST API untuk proyek UAS Back-end Development. Mengimplementasikan autentikasi JWT, CRUD operations, dan integrasi database MongoDB dengan arsitektur MVC yang bersih."
    },
  ];

  const ROTATIONS = [-1.4, 1.0, -0.8, 1.6, -1.1, 0.5, -0.3, 1.2, -1.0, 0.7];
  const container = document.getElementById('cards-container');
  container.innerHTML = ''; 

  const colLeft = document.createElement('div');
  colLeft.className = 'card-col';
  const colRight = document.createElement('div');
  colRight.className = 'card-col col-right-stagger';

  projects.forEach((p, i) => {
    // 1. Bungkus dengan .reveal agar animasinya 100% SAMA seperti teks/elemen lain
    const revealWrapper = document.createElement('div');
    revealWrapper.className = 'reveal'; 
    
    // 2. Card dengan rotasinya diletakkan DI DALAM wrapper tersebut
    const card = document.createElement('div');
    card.className = 'project-card'; 
    card.style.transform = `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)`;

    card.innerHTML = `
      <div class="card-inner-padding">
        <img class="card-img" src="${p.src}" alt="${p.title}" draggable="false"/>
      </div>
      <p class="card-desc">${p.desc}</p>
      <div class="card-body">
        <div class="card-info">
          <h3>${p.title}</h3>
          <div class="card-tags">${p.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}</div>
        </div>
        <a href="${p.link}" target="_blank" rel="noopener" class="card-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
        </a>
      </div>`;
      
    revealWrapper.appendChild(card);
    
    if (i % 2 === 0) colLeft.appendChild(revealWrapper);
    else colRight.appendChild(revealWrapper);
  });

  container.appendChild(colLeft);
  container.appendChild(colRight);
})();

/* ═══════════════════════════════
   SCROLL REVEAL UMUM
═══════════════════════════════ */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
})();

/* ═══════════════════════════════
   HEADER SHRINK ON SCROLL
═══════════════════════════════ */
window.addEventListener('scroll', () => {
  const h = document.querySelector('header');
  if (window.scrollY > 60) h.style.padding = '14px 48px';
  else h.style.padding = '20px 48px';
}, { passive: true });