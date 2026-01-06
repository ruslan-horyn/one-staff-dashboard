'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubmitButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
	loadingText?: string;
	isPending?: boolean;
}

export const SubmitButton = ({
	children,
	loadingText = 'Loading...',
	isPending = false,
	className,
	disabled,
	...props
}: SubmitButtonProps) => {
	return (
		<Button
			type="submit"
			className={cn(className)}
			disabled={isPending || disabled}
			aria-busy={isPending}
			{...props}
		>
			{isPending ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
					{loadingText}
				</>
			) : (
				children
			)}
		</Button>
	);
};
