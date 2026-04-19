// One Staff Dashboard - Style 050 v4: Rounded Symmetrical
// Interactive functionality with smooth animations

document.addEventListener('DOMContentLoaded', () => {
	initNavigation();
	initScrollAnimations();
	initDashboardAnimations();
	initTabSwitching();
});

// ========================================
// NAVIGATION
// ========================================
function initNavigation() {
	const hamburger = document.querySelector('.nav-hamburger');
	const menu = document.querySelector('.nav-menu');
	const overlay = document.querySelector('.nav-overlay');
	const menuLinks = document.querySelectorAll('.nav-menu-links a');

	function toggleMenu() {
		hamburger.classList.toggle('active');
		menu.classList.toggle('active');
		overlay.classList.toggle('active');
		document.body.style.overflow = menu.classList.contains('active')
			? 'hidden'
			: '';
	}

	function closeMenu() {
		hamburger.classList.remove('active');
		menu.classList.remove('active');
		overlay.classList.remove('active');
		document.body.style.overflow = '';
	}

	if (hamburger) {
		hamburger.addEventListener('click', toggleMenu);
	}

	if (overlay) {
		overlay.addEventListener('click', closeMenu);
	}

	menuLinks.forEach((link) => {
		link.addEventListener('click', closeMenu);
	});

	// Close on escape key
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && menu && menu.classList.contains('active')) {
			closeMenu();
		}
	});

	// Navbar scroll effect
	const nav = document.querySelector('.nav');

	window.addEventListener('scroll', () => {
		const currentScroll = window.scrollY;

		if (nav) {
			if (currentScroll > 100) {
				nav.style.background = 'rgba(250, 250, 250, 0.98)';
				nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
			} else {
				nav.style.background = 'rgba(250, 250, 250, 0.9)';
				nav.style.boxShadow = 'none';
			}
		}
	});
}

// ========================================
// SCROLL ANIMATIONS
// ========================================
function initScrollAnimations() {
	const observerOptions = {
		root: null,
		rootMargin: '0px',
		threshold: 0.1,
	};

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('visible');
			}
		});
	}, observerOptions);

	// Observe sections
	const sections = document.querySelectorAll('section');
	sections.forEach((section) => {
		section.classList.add('animate-on-scroll');
		observer.observe(section);
	});

	// Observe cards with staggered delay
	const cards = document.querySelectorAll(
		'.pain-card, .feature-small, .step-card, .testimonial-card, .pricing-card'
	);
	cards.forEach((card, index) => {
		card.classList.add('animate-on-scroll');
		card.style.transitionDelay = `${(index % 4) * 0.1}s`;
		observer.observe(card);
	});
}

// ========================================
// DASHBOARD ANIMATIONS
// ========================================
function initDashboardAnimations() {
	const workerRows = document.querySelectorAll('.worker-row');

	// Simulate status changes
	setInterval(() => {
		const randomRow = workerRows[Math.floor(Math.random() * workerRows.length)];
		const status = randomRow.querySelector('.worker-status');

		if (status) {
			// Toggle status visually
			status.style.transform = 'scale(1.1)';
			setTimeout(() => {
				status.style.transform = 'scale(1)';
			}, 200);
		}
	}, 3000);

	// Animate mini stats on scroll
	const miniStats = document.querySelectorAll('.mini-stat-number');

	const statsObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					animateValue(entry.target);
					statsObserver.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.5 }
	);

	miniStats.forEach((stat) => statsObserver.observe(stat));
}

function animateValue(element) {
	const target = parseInt(element.textContent, 10);
	let current = 0;
	const increment = target / 30;
	const duration = 1000;
	const stepTime = duration / 30;

	const timer = setInterval(() => {
		current += increment;
		if (current >= target) {
			current = target;
			clearInterval(timer);
		}
		element.textContent = Math.floor(current);
	}, stepTime);
}

// ========================================
// TAB SWITCHING
// ========================================
function initTabSwitching() {
	const tabs = document.querySelectorAll('.dashboard-tabs .tab');

	tabs.forEach((tab) => {
		tab.addEventListener('click', () => {
			tabs.forEach((t) => t.classList.remove('active'));
			tab.classList.add('active');

			// Add visual feedback
			tab.style.transform = 'scale(0.95)';
			setTimeout(() => {
				tab.style.transform = 'scale(1)';
			}, 100);
		});
	});

	// Mockup filters
	const filters = document.querySelectorAll('.mockup-filters .filter');

	filters.forEach((filter) => {
		filter.addEventListener('click', () => {
			filters.forEach((f) => f.classList.remove('active'));
			filter.classList.add('active');
		});
	});
}

// ========================================
// SMOOTH SCROLL
// ========================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
	anchor.addEventListener('click', function (e) {
		e.preventDefault();
		const target = document.querySelector(this.getAttribute('href'));

		if (target) {
			const offsetTop = target.offsetTop - 100;

			window.scrollTo({
				top: offsetTop,
				behavior: 'smooth',
			});
		}
	});
});

// ========================================
// BUTTON RIPPLE EFFECT
// ========================================
document.querySelectorAll('.btn').forEach((button) => {
	button.addEventListener('click', function (e) {
		const rect = this.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const ripple = document.createElement('span');
		ripple.style.cssText = `
            position: absolute;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            left: ${x}px;
            top: ${y}px;
            width: 100px;
            height: 100px;
            margin-left: -50px;
            margin-top: -50px;
        `;

		this.style.position = 'relative';
		this.style.overflow = 'hidden';
		this.appendChild(ripple);

		setTimeout(() => ripple.remove(), 600);
	});
});

// Add ripple animation to stylesheet
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ========================================
// PRICING CARD HOVER
// ========================================
document.querySelectorAll('.pricing-card').forEach((card) => {
	card.addEventListener('mouseenter', function () {
		if (!this.classList.contains('popular')) {
			this.style.borderColor = 'var(--brand-primary)';
		}
	});

	card.addEventListener('mouseleave', function () {
		if (!this.classList.contains('popular')) {
			this.style.borderColor = 'transparent';
		}
	});
});

// ========================================
// PARALLAX ON HERO
// ========================================
window.addEventListener('scroll', () => {
	const scrolled = window.scrollY;
	const heroVisual = document.querySelector('.hero-visual');

	if (heroVisual && scrolled < window.innerHeight) {
		heroVisual.style.transform = `translateY(${scrolled * 0.05}px)`;
	}
});

// ========================================
// FEATURE CARD INTERACTIONS
// ========================================
document.querySelectorAll('.feature-small, .pain-card').forEach((card) => {
	card.addEventListener('mouseenter', function () {
		const icon = this.querySelector('.feature-number, .pain-icon');
		if (icon) {
			icon.style.transform = 'scale(1.1)';
			icon.style.transition = 'transform 0.3s ease';
		}
	});

	card.addEventListener('mouseleave', function () {
		const icon = this.querySelector('.feature-number, .pain-icon');
		if (icon) {
			icon.style.transform = 'scale(1)';
		}
	});
});
