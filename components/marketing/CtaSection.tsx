import { WaitlistForm } from './WaitlistForm';

export const CtaSection = () => {
	return (
		<section className="final-cta">
			<div className="container">
				<div className="cta-content">
					<h2>Ready to Ditch the Spreadsheets?</h2>
					<p>
						Join hundreds of temp staffing coordinators who save hours every
						week with One Staff Dashboard.
					</p>
					<WaitlistForm source="cta_bottom" />
					<p className="cta-note">
						No credit card required. Import your Excel in 5 minutes.
					</p>
				</div>
			</div>
		</section>
	);
};
