const CheckIcon = () => (
	<svg
		aria-hidden="true"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
	>
		<polyline points="20 6 9 17 4 12" />
	</svg>
);

export const PricingSection = () => {
	return (
		<section className="pricing" id="pricing">
			<div className="container">
				<div className="section-header">
					<span className="section-label">Simple Pricing</span>
					<h2>Affordable for Every Agency</h2>
					<p>
						No hidden fees. No per-user charges. Just one simple price based on
						your agency size.
					</p>
				</div>
				<div className="pricing-cards">
					<div className="pricing-card">
						<div className="pricing-header">
							<h3>Starter</h3>
							<p>For small agencies</p>
						</div>
						<div className="pricing-price">
							<span className="price-amount">50</span>
							<span className="price-currency">PLN</span>
							<span className="price-period">/month</span>
						</div>
						<ul className="pricing-features">
							<li>
								<CheckIcon />
								Up to 50 workers
							</li>
							<li>
								<CheckIcon />2 coordinators
							</li>
							<li>
								<CheckIcon />
								Scheduling board
							</li>
							<li>
								<CheckIcon />
								CSV/Excel export
							</li>
						</ul>
						<a href="/#" className="btn btn-secondary">
							Start Free Trial
						</a>
					</div>
					<div className="pricing-card popular">
						<div className="pricing-badge">Most Popular</div>
						<div className="pricing-header">
							<h3>Professional</h3>
							<p>For growing agencies</p>
						</div>
						<div className="pricing-price">
							<span className="price-amount">100</span>
							<span className="price-currency">PLN</span>
							<span className="price-period">/month</span>
						</div>
						<ul className="pricing-features">
							<li>
								<CheckIcon />
								Up to 150 workers
							</li>
							<li>
								<CheckIcon />
								Unlimited coordinators
							</li>
							<li>
								<CheckIcon />
								Full audit log
							</li>
							<li>
								<CheckIcon />
								Priority support
							</li>
						</ul>
						<a href="/#" className="btn btn-primary">
							Start Free Trial
						</a>
					</div>
					<div className="pricing-card">
						<div className="pricing-header">
							<h3>Enterprise</h3>
							<p>For large agencies</p>
						</div>
						<div className="pricing-price">
							<span className="price-amount">200</span>
							<span className="price-currency">PLN</span>
							<span className="price-period">/month</span>
						</div>
						<ul className="pricing-features">
							<li>
								<CheckIcon />
								Unlimited workers
							</li>
							<li>
								<CheckIcon />
								Unlimited coordinators
							</li>
							<li>
								<CheckIcon />
								API access
							</li>
							<li>
								<CheckIcon />
								Dedicated support
							</li>
						</ul>
						<a href="/#" className="btn btn-secondary">
							Contact Sales
						</a>
					</div>
				</div>
			</div>
		</section>
	);
};
