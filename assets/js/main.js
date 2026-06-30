document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCursor();
  initParticles('heroParticles');
  initAnimations();
  initCounters();
  initTilt();
  initParallaxOrbs();
  initScrollProgress();
  initForm();
});

function initNav() {
  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');
  const links = navLinks?.querySelectorAll('a');

  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 50);
  });

  navToggle?.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks?.classList.toggle('open');
    document.body.style.overflow = navLinks?.classList.contains('open') ? 'hidden' : '';
  });

  links?.forEach(link => {
    link.addEventListener('click', () => {
      navToggle?.classList.remove('active');
      navLinks?.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

function initCursor() {
  const cursor = document.getElementById('cursorFollower');
  if (!cursor) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.querySelectorAll('a, button, input, textarea, select, [data-tilt]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '60px';
      cursor.style.height = '60px';
      cursor.style.background = 'rgba(135, 213, 103, 0.08)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '40px';
      cursor.style.height = '40px';
      cursor.style.background = 'transparent';
    });
  });

  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.1;
    cursorY += (mouseY - cursorY) * 0.1;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
}

function initParticles(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const count = Math.min(30, Math.floor(window.innerWidth / 40));
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.width = Math.random() * 4 + 2 + 'px';
    particle.style.height = particle.style.width;
    particle.style.animationDuration = Math.random() * 15 + 10 + 's';
    particle.style.animationDelay = Math.random() * 10 + 's';
    particle.style.opacity = '0';
    container.appendChild(particle);
  }
}

function initAnimations() {
  const animElements = document.querySelectorAll('[data-anim]');
  if (!animElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      const anim = el.dataset.anim;
      const delay = parseInt(el.dataset.delay) || 0;

      if (entry.isIntersecting) {
        setTimeout(() => {
          el.classList.add('anim-' + anim);
          el.classList.add('anim-visible');
        }, delay);
      } else {
        el.classList.remove('anim-' + anim);
        el.classList.remove('anim-visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  animElements.forEach(el => observer.observe(el));
}

function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        animateCounter(counter, parseInt(counter.dataset.target));
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
  const duration = 2000;
  const steps = 60;
  const increment = target / steps;
  let current = 0;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    current = Math.min(current + increment, target);
    element.textContent = Math.floor(current);
    if (step >= steps) {
      element.textContent = target;
      clearInterval(timer);
    }
  }, duration / steps);
}

function initTilt() {
  const tiltElements = document.querySelectorAll('[data-tilt]');
  if (!tiltElements.length) return;

  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

function initParallaxOrbs() {
  const orbs = document.querySelectorAll('.parallax-orb');
  if (!orbs.length) return;

  function onScroll() {
    orbs.forEach(orb => {
      const speed = parseFloat(orb.dataset.parallaxSpeed) || 0.1;
      const rect = orb.parentElement.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const offset = (elementCenter - viewportCenter) * speed;
      orb.style.transform = 'translateY(' + (offset * -1) + 'px)';
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (scrollTop / docHeight) * 100 + '%';
  });
}

function initForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const submitBtn = form.querySelector('button[type="submit"]');
  if (!submitBtn) return;

  form.addEventListener('submit', () => {
    submitBtn.innerHTML = 'Enviando... <i class="fas fa-spinner fa-spin"></i>';
    submitBtn.disabled = true;
  });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
