// Page switching
function switchPage(page) {
  document.getElementById('page-pointers').style.display = page === 'pointers' ? '' : 'none';
  document.getElementById('page-standards').style.display = page === 'standards' ? '' : 'none';
  document.querySelectorAll('.page-tab').forEach(t => t.classList.toggle('active', t.dataset.page === page));
  window.scrollTo(0, 0);
}

document.querySelectorAll('.page-tab').forEach(tab => {
  tab.addEventListener('click', () => switchPage(tab.dataset.page));
});

// Cross-page nav links
document.querySelectorAll('a[data-switch]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    switchPage(a.dataset.switch);
  });
});

// Active nav link highlight on scroll
const allNavLinks = document.querySelectorAll('nav a[href^="#"]');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      allNavLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + id);
      });
    }
  });
}, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));
