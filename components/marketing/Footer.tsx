import Link from 'next/link';

export const Footer = () => {
	return (
		<footer className="footer">
			<div className="container">
				<div className="footer-grid">
					<div className="footer-brand">
						<div className="footer-logo">
							<div className="footer-logo-icon">
								<svg
									aria-hidden="true"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
									<circle cx="9" cy="7" r="4" />
									<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
									<path d="M16 3.13a4 4 0 0 1 0 7.75" />
								</svg>
							</div>
							<span className="footer-logo-text">One Staff</span>
						</div>
						<p>
							Centralized temp staffing management. Built for coordinators, not
							enterprise HR. Simple, affordable, Polish.
						</p>
						<p>
							<a href="mailto:contact@example.com">contact@example.com</a>
						</p>
					</div>
					<div className="footer-column">
						<h4>Product</h4>
						<ul className="footer-links">
							<li>
								<a href="#features">Features</a>
							</li>
							<li>
								<a href="#pricing">Pricing</a>
							</li>
							<li>
								<a href="/#">Integrations</a>
							</li>
							<li>
								<a href="/#">Changelog</a>
							</li>
						</ul>
					</div>
					<div className="footer-column">
						<h4>Company</h4>
						<ul className="footer-links">
							<li>
								<a href="/#">About</a>
							</li>
							<li>
								<a href="/#">Blog</a>
							</li>
							<li>
								<a href="mailto:contact@example.com">Contact</a>
							</li>
						</ul>
					</div>
					<div className="footer-column">
						<h4>Resources</h4>
						<ul className="footer-links">
							<li>
								<a href="/#">Help Center</a>
							</li>
							<li>
								<a href="/#">Documentation</a>
							</li>
							<li>
								<Link href="/privacy">Privacy Policy</Link>
							</li>
							<li>
								<a href="/#">Terms of Service</a>
							</li>
						</ul>
					</div>
				</div>
				<div className="footer-bottom">
					<p>&copy; 2026 One Staff Dashboard. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
};
