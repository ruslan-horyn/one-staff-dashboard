export const FeaturesSection = () => {
	return (
		<>
			{/* Stats Bar */}
			<section className="stats-bar">
				<div className="container">
					<div className="stats-grid">
						<div className="stat-item">
							<div className="stat-number">50-200</div>
							<div className="stat-label">PLN/month</div>
						</div>
						<div className="stat-divider" />
						<div className="stat-item">
							<div className="stat-number">10x</div>
							<div className="stat-label">Faster than Excel</div>
						</div>
						<div className="stat-divider" />
						<div className="stat-item">
							<div className="stat-number">150+</div>
							<div className="stat-label">Workers Managed</div>
						</div>
						<div className="stat-divider" />
						<div className="stat-item">
							<div className="stat-number">1-2</div>
							<div className="stat-label">Coordinators</div>
						</div>
					</div>
				</div>
			</section>

			{/* Problem-Solution Section */}
			<section className="problem-solution">
				<div className="container">
					<div className="section-header">
						<span className="section-label">The Problem</span>
						<h2>Excel Is Killing Your Productivity</h2>
						<p>
							Managing temp workers in spreadsheets means errors, missed shifts,
							and hours wasted on manual data entry.
						</p>
					</div>
					<div className="pain-points-grid">
						<div className="pain-card">
							<div className="pain-icon">
								<svg
									aria-hidden="true"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<circle cx="12" cy="12" r="10" />
									<line x1="15" y1="9" x2="9" y2="15" />
									<line x1="9" y1="9" x2="15" y2="15" />
								</svg>
							</div>
							<h3>Double Bookings</h3>
							<p>
								Same worker scheduled at two locations because of outdated
								spreadsheets.
							</p>
						</div>
						<div className="pain-card">
							<div className="pain-icon">
								<svg
									aria-hidden="true"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<circle cx="12" cy="12" r="10" />
									<polyline points="12 6 12 12 16 14" />
								</svg>
							</div>
							<h3>Hours Lost</h3>
							<p>
								Coordinators spend 4+ hours daily on manual schedule updates.
							</p>
						</div>
						<div className="pain-card">
							<div className="pain-icon">
								<svg
									aria-hidden="true"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
									<polyline points="14 2 14 8 20 8" />
									<line x1="9" y1="15" x2="15" y2="15" />
								</svg>
							</div>
							<h3>No Audit Trail</h3>
							<p>Changes disappear. No history of who edited what and when.</p>
						</div>
						<div className="pain-card">
							<div className="pain-icon">
								<svg
									aria-hidden="true"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
									<circle cx="12" cy="7" r="4" />
									<line x1="12" y1="11" x2="12" y2="17" />
									<line x1="9" y1="14" x2="15" y2="14" />
								</svg>
							</div>
							<h3>Data Scattered</h3>
							<p>
								Worker info in emails, files, and sticky notes. Nothing
								centralized.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Solution Features Section */}
			<section className="features" id="features">
				<div className="container">
					<div className="section-header light">
						<span className="section-label">The Solution</span>
						<h2>Everything in One Place</h2>
						<p>
							One Staff Dashboard replaces your spreadsheets with purpose-built
							tools for temp staffing coordinators.
						</p>
					</div>
					<div className="features-showcase">
						<div className="feature-large">
							<div className="feature-large-content">
								<div className="feature-number">01</div>
								<h3>Worker Database</h3>
								<p>
									Track status (available/assigned), contact info, skills, and
									certifications. Filter and search instantly.
								</p>
								<ul className="feature-checklist">
									<li>
										<svg
											aria-hidden="true"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										>
											<polyline points="20 6 9 17 4 12" />
										</svg>
										Status tracking in real-time
									</li>
									<li>
										<svg
											aria-hidden="true"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										>
											<polyline points="20 6 9 17 4 12" />
										</svg>
										Skills and certifications
									</li>
									<li>
										<svg
											aria-hidden="true"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										>
											<polyline points="20 6 9 17 4 12" />
										</svg>
										Document storage
									</li>
								</ul>
							</div>
							<div className="feature-large-visual">
								<div className="feature-mockup">
									<div className="mockup-search">
										<svg
											aria-hidden="true"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										>
											<circle cx="11" cy="11" r="8" />
											<path d="m21 21-4.3-4.3" />
										</svg>
										<span>Search workers...</span>
									</div>
									<div className="mockup-filters">
										<span className="filter active">All (147)</span>
										<span className="filter">Available (58)</span>
										<span className="filter">Assigned (89)</span>
									</div>
									<div className="mockup-list">
										<div className="mockup-worker">
											<div className="mw-avatar">AK</div>
											<div className="mw-details">
												<span className="mw-name">Anna Kowalska</span>
												<span className="mw-meta">Cleaning | Warsaw</span>
											</div>
											<span className="mw-badge available">Available</span>
										</div>
										<div className="mockup-worker">
											<div className="mw-avatar">MN</div>
											<div className="mw-details">
												<span className="mw-name">Marek Nowak</span>
												<span className="mw-meta">Kitchen | Krakow</span>
											</div>
											<span className="mw-badge assigned">Assigned</span>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="feature-grid-small">
							<div className="feature-small">
								<div className="feature-number">02</div>
								<h3>Scheduling Board</h3>
								<p>
									Visual calendar with drag-and-drop assignments. Filter by
									location, client, or worker.
								</p>
							</div>
							<div className="feature-small">
								<div className="feature-number">03</div>
								<h3>Client Management</h3>
								<p>
									Track clients, their locations, and staffing requirements.
									Link workers to assignments.
								</p>
							</div>
							<div className="feature-small">
								<div className="feature-number">04</div>
								<h3>Hours Reporting</h3>
								<p>
									Export hours worked to CSV/Excel for payroll. Automatic
									calculations, zero errors.
								</p>
							</div>
							<div className="feature-small">
								<div className="feature-number">05</div>
								<h3>Audit Log</h3>
								<p>
									Every action tracked. Know who changed what and when. Full
									accountability.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className="how-it-works" id="how-it-works">
				<div className="container">
					<div className="section-header">
						<span className="section-label">Simple Setup</span>
						<h2>Get Started in Minutes</h2>
						<p>
							No complex setup. No IT team needed. Just sign up and start
							organizing.
						</p>
					</div>
					<div className="steps-horizontal">
						<div className="step-card">
							<div className="step-number">1</div>
							<div className="step-icon">
								<svg
									aria-hidden="true"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
									<circle cx="8.5" cy="7" r="4" />
									<line x1="20" y1="8" x2="20" y2="14" />
									<line x1="23" y1="11" x2="17" y2="11" />
								</svg>
							</div>
							<h3>Import Workers</h3>
							<p>
								Upload your Excel file or add workers manually. We&apos;ll
								organize everything for you.
							</p>
						</div>
						<div className="step-connector">
							<svg
								aria-hidden="true"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<line x1="5" y1="12" x2="19" y2="12" />
								<polyline points="12 5 19 12 12 19" />
							</svg>
						</div>
						<div className="step-card">
							<div className="step-number">2</div>
							<div className="step-icon">
								<svg
									aria-hidden="true"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
									<line x1="16" y1="2" x2="16" y2="6" />
									<line x1="8" y1="2" x2="8" y2="6" />
									<line x1="3" y1="10" x2="21" y2="10" />
								</svg>
							</div>
							<h3>Create Schedules</h3>
							<p>
								Assign workers to clients and locations. The system prevents
								double-bookings automatically.
							</p>
						</div>
						<div className="step-connector">
							<svg
								aria-hidden="true"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<line x1="5" y1="12" x2="19" y2="12" />
								<polyline points="12 5 19 12 12 19" />
							</svg>
						</div>
						<div className="step-card">
							<div className="step-number">3</div>
							<div className="step-icon">
								<svg
									aria-hidden="true"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<line x1="18" y1="20" x2="18" y2="10" />
									<line x1="12" y1="20" x2="12" y2="4" />
									<line x1="6" y1="20" x2="6" y2="14" />
								</svg>
							</div>
							<h3>Track &amp; Export</h3>
							<p>
								Monitor assignments, track hours, and export reports for payroll
								with one click.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className="testimonials" id="testimonials">
				<div className="container">
					<div className="section-header light">
						<span className="section-label">Trusted by Agencies</span>
						<h2>What Coordinators Say</h2>
					</div>
					<div className="testimonials-grid">
						<div className="testimonial-card featured">
							<div className="testimonial-quote">&quot;</div>
							<p className="testimonial-text">
								I was managing 120 cleaning staff in Excel. Finding who&apos;s
								available for a last-minute shift took 30 minutes. Now it takes
								30 seconds.
							</p>
							<div className="testimonial-author">
								<div className="testimonial-avatar">JK</div>
								<div className="testimonial-info">
									<h4>Joanna Kaminska</h4>
									<span>Coordinator, CleanPro Agency</span>
								</div>
							</div>
						</div>
						<div className="testimonial-card">
							<p className="testimonial-text">
								The audit log saved us during a client dispute. We could prove
								exactly when the schedule was created and who approved it.
							</p>
							<div className="testimonial-author">
								<div className="testimonial-avatar">TM</div>
								<div className="testimonial-info">
									<h4>Tomasz Mazur</h4>
									<span>Owner, MedStaff Solutions</span>
								</div>
							</div>
						</div>
						<div className="testimonial-card">
							<p className="testimonial-text">
								Finally, software that doesn&apos;t cost $200/month. We pay 100
								PLN and get everything we need. No enterprise bloat.
							</p>
							<div className="testimonial-author">
								<div className="testimonial-avatar">AW</div>
								<div className="testimonial-info">
									<h4>Adam Wisniewski</h4>
									<span>Manager, GastroTeam</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
};
