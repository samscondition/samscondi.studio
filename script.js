const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const pad = value => String(value).padStart(2, '0');
function updateClock() {
  const now = new Date();
  qs('#ctime').textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  qs('#cdate').textContent = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}
updateClock();
setInterval(updateClock, 30000);
qs('#year').textContent = new Date().getFullYear();

qsa('[data-scroll]').forEach(button => {
  button.addEventListener('click', () => {
    const target = qs(`#${button.dataset.scroll}`);
    closeNav();
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const nav = qs('#nav');
const menuOpen = qs('#menuOpen');
function openNav() {
  nav.classList.add('open');
  nav.setAttribute('aria-hidden', 'false');
  menuOpen.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}
function closeNav() {
  nav.classList.remove('open');
  nav.setAttribute('aria-hidden', 'true');
  menuOpen.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}
menuOpen.addEventListener('click', openNav);
qs('#menuClose').addEventListener('click', closeNav);

const modal = qs('#modal');
let previousFocus = null;
function openModal() {
  previousFocus = document.activeElement;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  qs('input', modal)?.focus();
}
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  previousFocus?.focus();
}
qsa('[data-modal-open]').forEach(button => button.addEventListener('click', openModal));
qsa('[data-modal-close]').forEach(button => button.addEventListener('click', closeModal));
qs('#projectForm').addEventListener('submit', event => {
  event.preventDefault();
  const submit = qs('button[type="submit"]', event.currentTarget);
  submit.textContent = 'Inquiry ready';
  setTimeout(closeModal, 700);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (modal.classList.contains('open')) closeModal();
    if (nav.classList.contains('open')) closeNav();
  }
});

const scroller = qs('#workScroller');
qs('#workNext').addEventListener('click', () => scroller.scrollBy({ left: 400, behavior: 'smooth' }));
qs('#workPrev').addEventListener('click', () => scroller.scrollBy({ left: -400, behavior: 'smooth' }));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
qsa('.rv').forEach((element, index) => {
  element.style.setProperty('--d', `${Math.min(index % 4, 3) * 80}ms`);
  revealObserver.observe(element);
});

const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const output = qs('b', entry.target);
    const target = Number(output.dataset.count);
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / 900, 1);
      output.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    countObserver.unobserve(entry.target);
  });
}, { threshold: 0.7 });
qsa('.st').forEach(element => countObserver.observe(element));

const canvas = qs('#lrc');
const context = canvas.getContext('2d');
let pointerX = 0;
let pointerY = 0;
function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = canvas.clientWidth * ratio;
  canvas.height = canvas.clientHeight * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('pointermove', event => {
  pointerX = (event.clientX / window.innerWidth - 0.5) * 30;
  pointerY = (event.clientY / window.innerHeight - 0.5) * 20;
});
resizeCanvas();

function drawHero(time) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  context.clearRect(0, 0, width, height);
  const base = context.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, '#d8d8d6');
  base.addColorStop(0.55, '#b8b8b6');
  base.addColorStop(1, '#efefed');
  context.fillStyle = base;
  context.fillRect(0, 0, width, height);

  context.save();
  context.translate(width * 0.68 + pointerX, height * 0.47 + pointerY);
  context.rotate(-0.22);
  const radius = Math.min(width, height) * 0.19;
  const gradient = context.createRadialGradient(-radius * 0.35, -radius * 0.45, radius * 0.1, 0, 0, radius);
  gradient.addColorStop(0, '#fafafa');
  gradient.addColorStop(0.25, '#dededb');
  gradient.addColorStop(0.65, '#777875');
  gradient.addColorStop(1, '#171817');
  context.fillStyle = gradient;
  context.beginPath();
  context.ellipse(0, 0, radius * 1.15, radius * 0.72, Math.sin(time * 0.00025) * 0.08, 0, Math.PI * 2);
  context.fill();
  context.restore();

  context.globalAlpha = 0.12;
  context.strokeStyle = '#111';
  context.lineWidth = 1;
  for (let y = -20; y < height + 40; y += 36) {
    context.beginPath();
    context.moveTo(0, y);
    context.bezierCurveTo(width * 0.25, y + 24, width * 0.65, y - 18, width, y + 12);
    context.stroke();
  }
  context.globalAlpha = 1;
  requestAnimationFrame(drawHero);
}
requestAnimationFrame(drawHero);
