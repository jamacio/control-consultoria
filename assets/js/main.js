document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCursor();
  initParticles();
  initReveal();
  initCounters();
  initForm();
});

/* ============= NAVIGATION ============= */
function initNav() {
  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');
  const links = navLinks?.querySelectorAll('a');

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
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

/* ============= CURSOR FOLLOWER ============= */
function initCursor() {
  const cursor = document.getElementById('cursorFollower');
  if (!cursor) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.querySelectorAll('a, button, input, textarea, select').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '60px';
      cursor.style.height = '60px';
      cursor.style.background = 'rgba(212, 168, 83, 0.08)';
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

/* ============= PARTICLES ============= */
function initParticles() {
  const container = document.getElementById('heroParticles');
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

/* ============= SCROLL REVEAL ============= */
function initReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ============= COUNTER ANIMATION ============= */
function initCounters() {
  const counters = document.querySelectorAll('.counter');

  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.dataset.target);
        animateCounter(counter, target);
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

    if (target >= 1000) {
      element.textContent = Math.floor(current / 1000) + (current % 1000 >= 500 ? '.5' : '');
    } else {
      element.textContent = Math.floor(current);
    }

    if (step >= steps) {
      element.textContent = target >= 1000 ? (target / 1000) + 'mil' : target;
      clearInterval(timer);
    }
  }, duration / steps);
}

/* ============= FORM ============= */
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

/* ============= SMOOTH SCROLL FOR ANCHOR LINKS ============= */
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
