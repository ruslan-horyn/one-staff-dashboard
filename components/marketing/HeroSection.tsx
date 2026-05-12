import { WaitlistForm } from './WaitlistForm';

export const HeroSection = () => {
	return (
		<section className="hero">
			<div className="container">
				<div className="hero-content">
					<span className="hero-badge">
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
						Built for Temp Staffing
					</span>
					<h1 className="hero-title">
						Stop Managing
						<br />
						<span>150+ Workers</span>
						<br />
						in Excel
					</h1>
					<p className="hero-description">
						One Staff Dashboard is a single source of truth for worker data,
						clients, locations, and schedules. Built by someone who managed 150+
						temp workers in spreadsheets.
					</p>
					<WaitlistForm source="hero" />
				</div>
				<div className="hero-visual">
					<div className="hero-dashboard">
						<div className="dashboard-header">
							<div className="dashboard-dots">
								<span />
								<span />
								<span />
							</div>
							<span className="dashboard-title">Worker Overview</span>
							<div className="dashboard-tabs">
								<span className="tab active">All</span>
								<span className="tab">Available</span>
								<span className="tab">Assigned</span>
							</div>
						</div>
						<div className="dashboard-stats-row">
							<div className="mini-stat">
								<span className="mini-stat-number">147</span>
								<span className="mini-stat-label">Total Workers</span>
							</div>
							<div className="mini-stat">
								<span className="mini-stat-number">89</span>
								<span className="mini-stat-label">Assigned</span>
							</div>
							<div className="mini-stat highlight">
								<span className="mini-stat-number">58</span>
								<span className="mini-stat-label">Available</span>
							</div>
						</div>
						<div className="dashboard-workers">
							<div className="worker-row">
								<div className="worker-avatar">AK</div>
								<div className="worker-info">
									<div className="worker-name">Anna Kowalska</div>
									<div className="worker-role">Cleaning Staff</div>
								</div>
								<span className="worker-status available">Available</span>
							</div>
							<div className="worker-row">
								<div className="worker-avatar">MN</div>
								<div className="worker-info">
									<div className="worker-name">Marek Nowak</div>
									<div className="worker-role">Kitchen Assistant</div>
								</div>
								<span className="worker-status assigned">Assigned</span>
							</div>
							<div className="worker-row">
								<div className="worker-avatar">EW</div>
								<div className="worker-info">
									<div className="worker-name">Ewa Wisniewska</div>
									<div className="worker-role">Medical Support</div>
								</div>
								<span className="worker-status available">Available</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
