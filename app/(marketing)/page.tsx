import { CtaSection } from '@/components/marketing/CtaSection';
import { FeaturesSection } from '@/components/marketing/FeaturesSection';
import { Footer } from '@/components/marketing/Footer';
import { HeroSection } from '@/components/marketing/HeroSection';
import { PricingSection } from '@/components/marketing/PricingSection';

export default function LandingPage() {
	return (
		<main>
			<HeroSection />
			<FeaturesSection />
			<PricingSection />
			<CtaSection />
			<Footer />
		</main>
	);
}
