// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Theme toggle
const root = document.documentElement;
const buttons = document.querySelectorAll('[data-theme-btn]');

const stored = (() => {
  try { return localStorage.getItem('theme'); } catch (e) { return null; }
})();
const initial = stored || 'dark';
applyTheme(initial);

buttons.forEach((b) => {
  b.addEventListener('click', () => applyTheme(b.dataset.themeBtn));
});

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  buttons.forEach((b) => b.classList.toggle('active', b.dataset.themeBtn === theme));
  try { localStorage.setItem('theme', theme); } catch (e) {}
}

// Projects pagination (home page only)
const projectSection = document.getElementById('projects');
if (projectSection) {
  const pages = [...projectSection.querySelectorAll('[data-project-page]')];
  const pagination = projectSection.querySelector('.project-pagination');
  const pageButtons = [...(pagination?.querySelectorAll('[data-project-target]') || [])];
  const status = pagination?.querySelector('[data-project-status]');

  if (pages.length && pagination && status && pageButtons.length === pages.length) {
    let currentPage = 0;

    function showProjectPage(pageIndex) {
      if (pageIndex < 0 || pageIndex >= pages.length) return;

      currentPage = pageIndex;
      pages.forEach((page, index) => { page.hidden = index !== currentPage; });
      pageButtons.forEach((button) => {
        if (Number(button.dataset.projectTarget) === currentPage + 1) {
          button.setAttribute('aria-current', 'page');
        } else {
          button.removeAttribute('aria-current');
        }
      });
      status.textContent = `Page ${currentPage + 1} of ${pages.length}`;
    }

    pageButtons.forEach((button) => {
      button.addEventListener('click', () => showProjectPage(Number(button.dataset.projectTarget) - 1));
    });
    showProjectPage(0);
    pagination.hidden = false;
  }
}

// Events slider (home page only)
const slides = document.querySelectorAll('.event-item');
const dotsWrap = document.querySelector('.events-dots');

if (slides.length && dotsWrap) {
  let current = 0;
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Event ${i + 1}`);
    dot.classList.toggle('active', i === 0);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(n) {
    slides[current].classList.remove('active');
    dotsWrap.children[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsWrap.children[current].classList.add('active');
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 8000);
  }

  resetTimer();
}

  const COUNT_URL = "https://4jtfdk57utklnkgd3aj6dg4dgi0pchyg.lambda-url.ap-southeast-1.on.aws/";
  const el = document.getElementById("visitor-count");

  if (el) {
    if (localStorage.getItem("counted")) {
      // Returning visitor — don't increment, just show last known total
      el.textContent = localStorage.getItem("lastCount") || "—";
    } else {
      // New visitor — increment once, then remember it
      fetch(COUNT_URL)
        .then(r => r.json())
        .then(d => {
          el.textContent = d.count;
          localStorage.setItem("counted", "1");
          localStorage.setItem("lastCount", d.count);
        })
        .catch(() => { el.textContent = "—"; });
    }
  }
