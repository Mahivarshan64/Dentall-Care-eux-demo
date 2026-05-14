document.addEventListener('DOMContentLoaded', () => {

  // 1. NAV SCROLL BEHAVIOR
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 8. MOBILE MENU
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu-overlay');
  
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      const lines = hamburger.querySelectorAll('span');
      if (mobileMenu.classList.contains('active')) {
        lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        lines[1].style.opacity = '0';
        lines[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        lines[0].style.transform = 'none';
        lines[1].style.opacity = '1';
        lines[2].style.transform = 'none';
      }
    });
  }

  // 2. CLIP-UP HEADLINE WIPE
  const clipUpElements = document.querySelectorAll('.clip-up');
  setTimeout(() => {
    clipUpElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('revealed');
      }, index * 150); // Stagger 0.15s
    });
  }, 100);

  // 3. SCROLL REVEALS (IntersectionObserver)
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in-up, .teal-divider').forEach(el => {
    if (el.classList.contains('teal-divider')) {
      // Special handling for divider draw
      const divObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('draw');
          }
        });
      }, observerOptions);
      divObserver.observe(el);
    } else {
      revealObserver.observe(el);
    }
  });

  // 4. STATS COUNTER
  const statsSection = document.querySelector('.stats-section');
  const statNumbers = document.querySelectorAll('.stat-number');
  let hasCounted = false;

  function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  }

  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasCounted) {
        hasCounted = true;
        statNumbers.forEach(stat => {
          const targetStr = stat.innerText;
          const targetVal = parseFloat(targetStr);
          const suffix = targetStr.replace(/[0-9.]/g, ''); // Extract non-numeric parts like '+', '★'
          
          let start = null;
          const duration = 2000;
          
          function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min(progress / duration, 1);
            const ease = easeOutExpo(percentage);
            
            let current = targetVal * ease;
            
            if (targetStr.includes('.')) {
              stat.innerText = current.toFixed(1) + suffix;
            } else {
              stat.innerText = Math.floor(current) + suffix;
            }
            
            if (progress < duration) {
              window.requestAnimationFrame(step);
            } else {
              stat.innerText = targetStr;
            }
          }
          window.requestAnimationFrame(step);
        });
      }
    }, { threshold: 0.5 });
    statsObserver.observe(statsSection);
  }

  // 5. HORIZONTAL ACCORDION
  const accordionPanels = document.querySelectorAll('.accordion-panel');
  if (accordionPanels.length > 0) {
    accordionPanels.forEach(panel => {
      panel.addEventListener('mouseenter', () => {
        accordionPanels.forEach(p => p.classList.remove('expanded'));
        panel.classList.add('expanded');
      });
    });

    const accordionContainer = document.querySelector('.horizontal-accordion');
    accordionContainer.addEventListener('mouseleave', () => {
      accordionPanels.forEach((p, i) => {
        p.classList.remove('expanded');
        if(i === 0) p.classList.add('expanded'); // Keep first expanded by default on leave
      });
    });
  }

  // 7. PARALLAX
  const parallaxImages = document.querySelectorAll('.hero-image-wrapper img, .doctor-image-wrapper img');
  if (parallaxImages.length > 0) {
    window.addEventListener('scroll', () => {
      window.requestAnimationFrame(() => {
        parallaxImages.forEach(img => {
          const rect = img.parentElement.getBoundingClientRect();
          // Only animate if in viewport
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const yPos = -(rect.top * 0.1);
            img.style.transform = `translateY(${yPos}px)`;
          }
        });
      });
    });
  }

  // 9. FLOATING BADGE ENTRANCE
  setTimeout(() => {
    document.querySelectorAll('.floating-badge').forEach(badge => {
      badge.style.opacity = '1';
      badge.style.transform = 'translateY(0)';
    });
  }, 500);

  // 10. FORM INTERACTION
  const formControls = document.querySelectorAll('.form-control');
  formControls.forEach(control => {
    control.addEventListener('focus', () => {
      control.parentElement.classList.add('focused');
    });
    control.addEventListener('blur', () => {
      if (control.value === '') {
        control.parentElement.classList.remove('focused');
      }
    });
  });

});

  // 11. MOUSE FOLLOWER
  const follower = document.querySelector('.mouse-follower');
  if (follower) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;
    
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateFollower() {
      followerX += (mouseX - followerX) * 0.08;
      followerY += (mouseY - followerY) * 0.08;
      follower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateFollower);
    }
    
    animateFollower();
  }
