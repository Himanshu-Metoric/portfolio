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
   Sessionize speaker integration
   Fetches: https://sessionize.com/api/speaker/json/wmcraxy4nq
   Renders speaker, sessions, and links client-side.
   ------------------------------ */

async function loadSessionizeSpeaker() {
  const apiUrl = 'https://sessionize.com/api/speaker/json/wmcraxy4nq';
  const loadingEl = document.getElementById('speaker-loading');
  const cardEl = document.getElementById('speaker-card');

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
    const data = await res.json();

    // Sessionize sometimes returns an array or an object - handle both.
    const speaker = Array.isArray(data) ? data[0] : data;
    if (!speaker) throw new Error('No speaker data returned');

    // Resolve common field names used by Sessionize JSONs
    const name = speaker.name || `${speaker.firstName || ''} ${speaker.lastName || ''}`.trim() || speaker.fullName || 'Speaker';
    const title = speaker.title || speaker.company || speaker.tagLine || '';
    const bio = speaker.bio || speaker.biography || speaker.description || speaker.content || '';
    // photo can be at speaker.photo, speaker.profilePicture, speaker.image, speaker.photoUrl
    const photo =
      speaker.photo ||
      speaker.profilePicture ||
      speaker.image ||
      speaker.photoUrl ||
      (speaker.links && Array.isArray(speaker.links) && (speaker.links.find(l => /photo|image/i.test(l.rel || l.title || l.href))?.href)) ||
      '';

    const links = speaker.links || speaker.socials || speaker.contact || [];
    const sessions = speaker.sessions || speaker.talks || [];

    // Inject into DOM
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
        // s may be string or object — try common fields
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

    // Build links (robust handling for different shapes)
    const linksContainer = document.getElementById('speaker-links');
    linksContainer.innerHTML = '';
    const normalizedLinks = Array.isArray(links) ? links : Object.values(links || {});
    normalizedLinks.forEach(l => {
      // l may be string (URL) or object {title, href, url, rel}
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

    // Show card, hide loading
    if (loadingEl) loadingEl.hidden = true;
    if (cardEl) cardEl.hidden = false;
  } catch (err) {
    console.error('Error loading Sessionize speaker:', err);
    if (loadingEl) loadingEl.textContent = 'Unable to load speaker.';
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
