/* ============================================================
   TECH FEST 2026 — SRM MCET | Main JavaScript
   ============================================================ */

'use strict';

// ─── Scroll Progress ─────────────────────────────────────
(function () {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    bar.style.width = pct + '%';
  }, { passive: true });
})();

// ─── Navbar Scroll Effect ─────────────────────────────────
(function () {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
})();

// ─── Mobile Menu ─────────────────────────────────────────
(function () {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });

  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    }
  });
})();

// ─── Scroll Reveal (Intersection Observer) ───────────────
(function () {
  const selectors = ['.scroll-reveal', '.scroll-reveal-left', '.scroll-reveal-right', '.scroll-scale'];
  const elements = document.querySelectorAll(selectors.join(','));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  elements.forEach(el => observer.observe(el));
})();

// ─── Animated Counters ────────────────────────────────────
(function () {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const easeOutQuad = (t) => t * (2 - t);

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.counter, 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 2000;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(easeOutQuad(progress) * target);
      el.textContent = prefix + value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = prefix + target.toLocaleString() + suffix;
    };

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

// ─── Parallax Hero ───────────────────────────────────────
(function () {
  const hero = document.querySelector('.hero-parallax');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    hero.style.transform = `translateY(${scrollY * 0.4}px)`;
    hero.style.opacity = 1 - scrollY / (window.innerHeight * 0.9);
  }, { passive: true });
})();

// ─── Floating Shapes Mouse Tracking ──────────────────────
(function () {
  const shapes = document.querySelectorAll('.float-shape');
  if (!shapes.length) return;

  window.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    shapes.forEach((shape, i) => {
      const depth = (i % 3 + 1) * 8;
      shape.style.transform = `translate(${dx * depth}px, ${dy * depth}px) ${shape.dataset.baseTransform || ''}`;
    });
  });
})();

// ─── Magnetic Card Effect ─────────────────────────────────
(function () {
  const magnets = document.querySelectorAll('.magnetic-card');
  if (!magnets.length) return;

  magnets.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      el.style.transform = `perspective(600px) rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg) translateY(-8px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
})();

// ─── Particle Burst on Button Click ──────────────────────
(function () {
  function createParticle(x, y, color) {
    const particle = document.createElement('div');
    particle.className = 'cursor-particle';
    particle.style.cssText = `
      left: ${x}px;
      top: ${y}px;
      background: ${color};
      box-shadow: 0 0 6px ${color};
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1500);
  }

  const colors = ['#00d4ff', '#a855f7', '#ff006e', '#10b981', '#f59e0b'];

  document.addEventListener('click', (e) => {
    if (e.target.closest('.btn, .nav-links a, .event-card')) {
      const count = 8;
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const offsetX = (Math.random() - 0.5) * 60;
          const offsetY = (Math.random() - 0.5) * 60;
          createParticle(
            e.clientX + offsetX,
            e.clientY + offsetY,
            colors[Math.floor(Math.random() * colors.length)]
          );
        }, i * 30);
      }
    }
  });
})();

// ─── Particle Canvas Background ──────────────────────────
(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles;

  const resize = () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  };

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = -Math.random() * 0.8 - 0.2;
      this.radius = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.2;
      this.color = ['#00d4ff', '#a855f7', '#ff006e'][Math.floor(Math.random() * 3)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= 0.001;
      if (this.y < -10 || this.alpha <= 0) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
    }
  }

  const init = () => {
    resize();
    particles = Array.from({ length: 80 }, () => new Particle());
  };

  const loop = () => {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  };

  window.addEventListener('resize', resize, { passive: true });
  init();
  loop();
})();

// ─── Typewriter Effect ────────────────────────────────────
function typewriter(el, text, speed = 60) {
  el.textContent = '';
  let i = 0;
  const write = () => {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(write, speed);
    }
  };
  write();
}

// ─── Text Letter Appear Animation ────────────────────────
(function () {
  const titles = document.querySelectorAll('[data-letter-anim]');
  titles.forEach(el => {
    const text = el.textContent;
    el.innerHTML = text.split('').map((c, i) =>
      `<span style="opacity:0;animation:fadeUp 0.5s ${i * 40}ms forwards">${c === ' ' ? '&nbsp;' : c}</span>`
    ).join('');
  });

  if (!document.querySelector('[data-letter-anim]')) return;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(20px); }
      to   { opacity:1; transform:translateY(0); }
    }
  `;
  document.head.appendChild(style);
})();

// ─── Active nav link highlight ────────────────────────────
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    if (link.getAttribute('href') === page || (page === '' && link.getAttribute('href') === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

// ─── Event Card Anti-Gravity (Events Page) ───────────────
(function () {
  const cards = document.querySelectorAll('.event-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.classList.add('levitate');
    });
    card.addEventListener('mouseleave', () => {
      card.classList.remove('levitate');
    });

    // Particle burst on hover
    card.addEventListener('mouseenter', function bursts() {
      const rect = card.getBoundingClientRect();
      for (let i = 0; i < 6; i++) {
        const p = document.createElement('div');
        p.style.cssText = `
          position: fixed;
          left: ${rect.left + Math.random() * rect.width}px;
          top: ${rect.top + Math.random() * rect.height}px;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: ${['#00d4ff','#a855f7','#ff006e'][i % 3]};
          pointer-events: none;
          z-index: 9999;
          animation: particleRise 1s ease forwards;
        `;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1000);
      }
    });
  });
})();

// ─── Filter Events ────────────────────────────────────────
(function () {
  const filterBtns = document.querySelectorAll('[data-filter]');
  const sortSelect = document.getElementById('sort-events');
  const searchInput = document.getElementById('search-events');
  const cards = document.querySelectorAll('.event-card');

  if (!filterBtns.length) return;

  let currentFilter = 'all';
  let currentSearch = '';

  const applyFilters = () => {
    const search = currentSearch.toLowerCase();
    cards.forEach(card => {
      const type = card.dataset.type || '';
      const name = (card.querySelector('.event-name')?.textContent || '').toLowerCase();
      const matchFilter = currentFilter === 'all' || type.includes(currentFilter);
      const matchSearch = !search || name.includes(search);
      card.style.display = (matchFilter && matchSearch) ? '' : 'none';
      card.style.opacity = (matchFilter && matchSearch) ? '1' : '0';
    });
  };

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentSearch = searchInput.value;
      applyFilters();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const container = document.querySelector('.events-grid');
      if (!container) return;
      const items = [...container.querySelectorAll('.event-card')];
      items.sort((a, b) => {
        const key = sortSelect.value;
        const aVal = parseInt(a.dataset[key] || 0, 10);
        const bVal = parseInt(b.dataset[key] || 0, 10);
        return bVal - aVal;
      });
      items.forEach(el => container.appendChild(el));
    });
  }
})();

// ─── Countdown Timer ─────────────────────────────────────
(function () {
  const el = document.getElementById('countdown');
  if (!el) return;

  const target = new Date('2026-03-20T09:00:00+05:30').getTime();

  const update = () => {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      el.innerHTML = '<span class="neon-text">EVENT IS LIVE! 🚀</span>';
      return;
    }

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    el.querySelectorAll('[data-unit]').forEach(unit => {
      const key = unit.dataset.unit;
      const map = { days, hours, minutes, seconds };
      unit.textContent = String(map[key]).padStart(2, '0');
    });
  };

  update();
  setInterval(update, 1000);
})();
