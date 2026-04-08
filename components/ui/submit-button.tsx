'use client';

import type { VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import type { ComponentProps } from 'react';

import { Button, type buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ButtonProps = ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	};

interface SubmitButtonProps extends Omit<ButtonProps, 'type'> {
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
	variant,
	size,
	...props
}: SubmitButtonProps) => {
	return (
		<Button
			type="submit"
			data-testid="submit-button"
			variant={variant}
			size={size}
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
