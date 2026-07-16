const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const navigation = document.querySelector('[data-navigation]');
const navLinks = navigation ? [...navigation.querySelectorAll('a')] : [];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const setMenu = (open) => {
  if (!menuToggle || !navigation) return;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
};

menuToggle?.addEventListener('click', () => {
  setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});

navLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 900) setMenu(false);
});

const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 32);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const revealItems = [...document.querySelectorAll('.reveal')];
if (reduceMotion.matches || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px' },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

const backToTop = document.querySelector('[data-back-to-top]');
backToTop?.addEventListener('click', (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
});

document.querySelector('[data-year]').textContent = String(new Date().getFullYear());

const form = document.querySelector('[data-journey-form]');
const dialog = document.querySelector('[data-brief-dialog]');
const briefOutput = document.querySelector('[data-brief-output]');
const copyStatus = document.querySelector('[data-copy-status]');
let currentBrief = '';

const clean = (value, fallback = 'Not specified') => {
  const text = String(value || '').trim();
  return text || fallback;
};

const buildBrief = (data) => {
  const styles = data.getAll('style');
  return [
    'TAILORED EUROPE — JOURNEY BRIEF',
    '================================',
    '',
    `Name: ${clean(data.get('name'))}`,
    `Email: ${clean(data.get('email'))}`,
    `Travelling as: ${clean(data.get('travellers'))}`,
    `Europe focus: ${clean(data.get('region'))}`,
    `Timing: ${clean(data.get('timing'))}`,
    `Trip length: ${clean(data.get('duration'))}`,
    `Desired feel: ${styles.length ? styles.join(', ') : 'Open to ideas'}`,
    '',
    'Additional notes:',
    clean(data.get('notes'), 'No additional notes yet.'),
    '',
    'This brief was prepared on the Tailored Europe concept website.',
  ].join('\n');
};

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  currentBrief = buildBrief(new FormData(form));
  briefOutput.textContent = currentBrief;
  copyStatus.textContent = '';
  if (typeof dialog.showModal === 'function') dialog.showModal();
});

document.querySelector('[data-dialog-close]')?.addEventListener('click', () => dialog?.close());

dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

const fallbackCopy = (text) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();
  const copied = document.execCommand('copy');
  textArea.remove();
  return copied;
};

document.querySelector('[data-copy-brief]')?.addEventListener('click', async () => {
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(currentBrief);
    else if (!fallbackCopy(currentBrief)) throw new Error('Copy unavailable');
    copyStatus.textContent = 'Brief copied to your clipboard.';
  } catch {
    copyStatus.textContent = 'Copy was unavailable. Select the brief above to copy it manually.';
  }
});

document.querySelector('[data-download-brief]')?.addEventListener('click', () => {
  const blob = new Blob([currentBrief], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'tailored-europe-journey-brief.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  copyStatus.textContent = 'Brief downloaded.';
});
