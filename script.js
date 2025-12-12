// Smooth scrolling for navigation links
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navSocial = document.querySelector('.nav-social');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    navSocial.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        navSocial.classList.remove('active');
    });
});

// Project cards interaction
const projectCards = document.querySelectorAll('.project-card');
const projectIcons = document.querySelectorAll('.project-icon');

projectCards.forEach((card, index) => {
    card.addEventListener('click', () => {
        // Remove active class from all cards and icons
        projectCards.forEach(c => c.classList.remove('active'));
        projectIcons.forEach(icon => icon.classList.remove('active'));
        
        // Add active class to clicked card and corresponding icon
        card.classList.add('active');
        projectIcons[index].classList.add('active');
    });
});

// Credentials tabs functionality
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll(
        '.hero-content, .about-text, .project-card, .skill-category, .credential-card, .education-item, .experience-item'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Form submission handling (basic demo handler to avoid leaving an open listener)
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : 'Send';
        
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
        }
        
        // Demo: simulate send and reset form. Replace with your real endpoint or integration.
        setTimeout(() => {
            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
            contactForm.reset();
            const success = document.createElement('div');
            success.className = 'form-success';
            success.textContent = 'Message sent successfully (demo).';
            contactForm.appendChild(success);
            setTimeout(() => success.remove(), 4000);
        }, 1200);
    });
}

/* ------------------------------
   Sessionize speaker integration with Vercel proxy fallback
   Tries direct fetch first, then /api/sessionize if direct fails (CORS).
   ------------------------------ */

async function tryFetchJson(url, opts = {}) {
  try {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const text = await res.text();
    try { return JSON.parse(text); } catch (e) { return text; }
  } catch (err) {
    throw err;
  }
}

async function loadSessionizeSpeaker() {
  const directApi = 'https://sessionize.com/api/speaker/json/wmcraxy4nq';
  const vercelProxy = '/api/sessionize';

  const loadingEl = document.getElementById('speaker-loading');
  const cardEl = document.getElementById('speaker-card');

  function showError(msg) {
    console.error(msg);
    if (loadingEl) loadingEl.textContent = 'Unable to load speaker.';
  }

  try {
    let data;
    // 1) Try direct fetch first
    try {
      data = await tryFetchJson(directApi);
      console.info('Sessionize: loaded via direct fetch');
    } catch (errDirect) {
      console.warn('Direct fetch failed (likely CORS). Trying Vercel proxy...', errDirect);
      // 2) Try Vercel function
      try {
        data = await tryFetchJson(vercelProxy);
        console.info('Sessionize: loaded via Vercel proxy');
      } catch (errVercel) {
        console.warn('Vercel proxy failed.', errVercel);
        throw errVercel; // bubble up
      }
    }

    // normalize returned payload (Sessionize usually returns array or object)
    const speaker = Array.isArray(data) ? data[0] : data;
    if (!speaker) throw new Error('No speaker data returned');

    // --- same rendering code as before (keeps defensive parsing) ---
    const name = speaker.name || `${speaker.firstName || ''} ${speaker.lastName || ''}`.trim() || speaker.fullName || 'Speaker';
    const title = speaker.title || speaker.company || speaker.tagLine || '';
    const bio = speaker.bio || speaker.biography || speaker.description || speaker.content || '';
    const photo =
      speaker.photo ||
      speaker.profilePicture ||
      speaker.image ||
      speaker.photoUrl ||
      (speaker.links && Array.isArray(speaker.links) && (speaker.links.find(l => /photo|image/i.test(l.rel || l.title || l.href))?.href)) ||
      '';

    const links = speaker.links || speaker.socials || speaker.contact || [];
    const sessions = speaker.sessions || speaker.talks || [];

    if (photo) {
      const img = document.getElementById('speaker-photo');
      img.src = photo;
      img.alt = name;
      img.style.display = '';
    } else {
      const img = document.getElementById('speaker-photo');
      img.style.display = 'none';
    }

    document.getElementById('speaker-name').textContent = name;
    document.getElementById('speaker-title').textContent = title;
    document.getElementById('speaker-bio').innerHTML = bio ? sanitizeHtml(bio) : '';

    // Sessions (if any)
    const sessionsContainer = document.getElementById('speaker-sessions');
    sessionsContainer.innerHTML = '';
    if (Array.isArray(sessions) && sessions.length) {
      const titleEl = document.createElement('h3');
      titleEl.textContent = 'Sessions';
      titleEl.className = 'speaker-sessions-title';
      sessionsContainer.appendChild(titleEl);

      const ul = document.createElement('ul');
      ul.className = 'speaker-sessions-list';
      sessions.forEach(s => {
        let sessionTitle = '';
        let sessionDesc = '';
        if (typeof s === 'string') sessionTitle = s;
        else if (typeof s === 'object' && s !== null) {
          sessionTitle = s.title || s.name || s.sessionTitle || '';
          sessionDesc = s.description || s.abstract || s.summary || '';
        }
        const li = document.createElement('li');
        li.className = 'speaker-session-item';
        const st = document.createElement('strong');
        st.textContent = sessionTitle || 'Session';
        li.appendChild(st);
        if (sessionDesc) {
          const p = document.createElement('p');
          p.innerHTML = sanitizeHtml(sessionDesc);
          li.appendChild(p);
        }
        ul.appendChild(li);
      });
      sessionsContainer.appendChild(ul);
    }

    // Links
    const linksContainer = document.getElementById('speaker-links');
    linksContainer.innerHTML = '';
    const normalizedLinks = Array.isArray(links) ? links : Object.values(links || {});
    normalizedLinks.forEach(l => {
      let href = '';
      let label = '';
      if (typeof l === 'string') {
        href = l;
        label = l.replace(/^https?:\/\//, '').replace(/\/$/, '');
      } else if (typeof l === 'object' && l !== null) {
        href = l.href || l.url || l.link || l.uri || '';
        label = l.title || l.name || (href ? href.replace(/^https?:\/\//, '').replace(/\/$/, '') : '');
      }
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = label || href;
        a.className = 'speaker-link';
        linksContainer.appendChild(a);
      }
    });

    if (loadingEl) loadingEl.hidden = true;
    if (cardEl) cardEl.hidden = false;
  } catch (err) {
    showError(err);
  }
}

// Minimal HTML sanitizer for simple markup (keeps basic tags like <p>, <strong>, <em>, <br>, <a>)
function sanitizeHtml(input) {
  if (!input) return '';
  const template = document.createElement('template');
  template.innerHTML = input;
  const allowed = ['P', 'BR', 'STRONG', 'EM', 'B', 'I', 'A', 'UL', 'OL', 'LI'];
  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) return;
    const children = Array.from(node.childNodes);
    children.forEach(child => walk(child));
    if (node.nodeType === Node.ELEMENT_NODE && !allowed.includes(node.tagName)) {
      const parent = node.parentNode;
      while (node.firstChild) parent.insertBefore(node.firstChild, node);
      parent.removeChild(node);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'A') {
      const href = node.getAttribute('href') || '';
      if (!/^https?:\/\//.test(href)) {
        node.removeAttribute('href');
      } else {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
      }
    }
  }
  walk(template.content);
  return template.innerHTML;
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSessionizeSpeaker);
} else {
  loadSessionizeSpeaker();
}
