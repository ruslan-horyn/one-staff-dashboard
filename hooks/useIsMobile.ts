import { useEffect, useState } from 'react';

import { getWindow } from '@/utils';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
	const win = getWindow();
	const [isMobile, setIsMobile] = useState<boolean>(
		win ? win.innerWidth < MOBILE_BREAKPOINT : false
	);

	useEffect(() => {
		const currentWindow = getWindow();
		if (!currentWindow) return;

		const mql = currentWindow.matchMedia(
			`(max-width: ${MOBILE_BREAKPOINT - 1}px)`
		);
		const onChange = () => {
			setIsMobile(currentWindow.innerWidth < MOBILE_BREAKPOINT);
		};
		mql.addEventListener('change', onChange);
		setIsMobile(currentWindow.innerWidth < MOBILE_BREAKPOINT);
		return () => mql.removeEventListener('change', onChange);
	}, []);

	return !!isMobile;
}
