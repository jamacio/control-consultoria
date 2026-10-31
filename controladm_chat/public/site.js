// Efeitos do site (entra em toda página pelo partials/footer.html): menu do celular, header ao rolar,
// barra de progresso, cursor, partículas, animação de entrada (data-anim), contadores, efeito 3D (data-tilt)
// e esferas com parallax. As classes usadas aqui entram no site.css (o theme.css lê este arquivo).
const semMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const temMouse = matchMedia('(hover: hover) and (pointer: fine)').matches;

function initNav() {
  const header = document.querySelector('[data-header]');
  const botao = document.querySelector('[data-menu-toggle]');
  if (!header) return;

  const aoRolar = () => header.toggleAttribute('data-scrolled', scrollY > 50);
  addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  const abrir = (aberto) => {
    header.toggleAttribute('data-open', aberto);
    botao?.setAttribute('aria-expanded', String(aberto));
    botao?.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('overflow-hidden', aberto);
  };
  botao?.addEventListener('click', () => abrir(!header.hasAttribute('data-open')));
  header.querySelectorAll('nav a').forEach((a) => a.addEventListener('click', () => abrir(false)));
  addEventListener('keydown', (e) => e.key === 'Escape' && abrir(false));
}

function initScrollProgress() {
  const barra = document.querySelector('[data-scroll-progress]');
  if (!barra) return;
  addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - innerHeight;
    barra.style.width = `${total > 0 ? (scrollY / total) * 100 : 0}%`;
  }, { passive: true });
}

function initCursor() {
  const cursor = document.querySelector('[data-cursor]');
  if (!cursor || !temMouse || semMovimento) return;
  cursor.classList.remove('hidden');

  let mouseX = -100, mouseY = -100, x = -100, y = -100;
  addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
  document.querySelectorAll('a, button, input, textarea, select, [data-tilt]').forEach((el) => {
    el.addEventListener('mouseenter', () => { cursor.classList.replace('size-10', 'size-15'); cursor.classList.add('bg-accent/10'); });
    el.addEventListener('mouseleave', () => { cursor.classList.replace('size-15', 'size-10'); cursor.classList.remove('bg-accent/10'); });
  });
  (function mover() {
    x += (mouseX - x) * 0.1;
    y += (mouseY - y) * 0.1;
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
    requestAnimationFrame(mover);
  })();
}

function initParticles() {
  if (semMovimento) return;
  document.querySelectorAll('[data-particles]').forEach((caixa) => {
    const total = Math.min(30, Math.floor(innerWidth / 40));
    for (let i = 0; i < total; i++) {
      const p = document.createElement('span');
      const tamanho = `${Math.random() * 4 + 2}px`;
      p.className = 'absolute bottom-0 rounded-full bg-accent opacity-0 animate-particle';
      Object.assign(p.style, {
        left: `${Math.random() * 100}%`,
        width: tamanho,
        height: tamanho,
        animationDuration: `${Math.random() * 15 + 10}s`,
        animationDelay: `${Math.random() * 10}s`,
      });
      caixa.append(p);
    }
  });
}

// Entra quando aparece na tela e sai quando some, para animar de novo ao voltar
function initReveal() {
  const itens = document.querySelectorAll('[data-anim]');
  if (!itens.length) return;
  const timers = new WeakMap();
  const observer = new IntersectionObserver((entradas) => {
    for (const { target: el, isIntersecting } of entradas) {
      clearTimeout(timers.get(el));
      if (isIntersecting) timers.set(el, setTimeout(() => el.setAttribute('data-visible', ''), Number(el.dataset.delay) || 0));
      else el.removeAttribute('data-visible');
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  itens.forEach((el) => observer.observe(el));
}

// O número final é o próprio texto do elemento (o chat pode trocá-lo); a contagem parte do zero
function initCounters() {
  const observer = new IntersectionObserver((entradas) => {
    for (const { target: el, isIntersecting } of entradas) {
      if (!isIntersecting) continue;
      observer.unobserve(el);
      const alvo = parseInt(el.textContent.replace(/\D/g, ''), 10);
      if (!alvo || semMovimento) continue;
      const passos = 60;
      let passo = 0;
      el.textContent = '0';
      const timer = setInterval(() => {
        passo++;
        el.textContent = passo >= passos ? String(alvo) : String(Math.floor((alvo / passos) * passo));
        if (passo >= passos) clearInterval(timer);
      }, 2000 / passos);
    }
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-counter]').forEach((el) => observer.observe(el));
}

function initTilt() {
  if (!temMouse || semMovimento) return;
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -6;
      const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 6;
      el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

// Esferas de luz que andam mais devagar que a página (data-parallax-speed)
function initParallax() {
  const orbs = document.querySelectorAll('[data-parallax-speed]');
  if (!orbs.length || semMovimento) return;
  const mover = () => orbs.forEach((orb) => {
    const r = orb.parentElement.getBoundingClientRect();
    const offset = (r.top + r.height / 2 - innerHeight / 2) * (parseFloat(orb.dataset.parallaxSpeed) || 0.1);
    orb.style.transform = `translateY(${-offset}px)`;
  });
  addEventListener('scroll', mover, { passive: true });
  mover();
}

// Perguntas frequentes: abre e fecha a resposta
function initFaq() {
  document.querySelectorAll('[data-faq] button').forEach((botao) => {
    botao.addEventListener('click', () => {
      const item = botao.closest('[data-faq]');
      const aberto = !item.hasAttribute('data-open');
      item.toggleAttribute('data-open', aberto);
      botao.setAttribute('aria-expanded', String(aberto));
    });
  });
}

// Formulário de contato: monta a mensagem e abre o WhatsApp
function initContactForm() {
  const form = document.querySelector('[data-whatsapp-form]');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = form.elements;
    const assunto = f.subject.selectedIndex > 0 ? f.subject.options[f.subject.selectedIndex].text : 'Sem assunto';
    const texto = ['Olá! Vim pelo site.', '', `Nome: ${f.name.value.trim()}`, `E-mail: ${f.email.value.trim()}`,
      ...(f.phone.value.trim() ? [`Telefone: ${f.phone.value.trim()}`] : []), `Assunto: ${assunto}`, '',
      'Mensagem:', f.message.value.trim()].join('\n');
    window.open(`${form.dataset.whatsappForm}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
  });
}

document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
initNav();
initScrollProgress();
initCursor();
initParticles();
initReveal();
initCounters();
initTilt();
initParallax();
initFaq();
initContactForm();
