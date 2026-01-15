import type * as React from 'react';

import { cn } from '@/lib/utils/cn';

interface EmptyStateProps {
	icon?: React.ReactNode;
	title: string;
	description?: string;
	action?: React.ReactNode;
	className?: string;
}

function EmptyState({
	icon,
	title,
	description,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			data-slot="empty-state"
			className={cn(
				'flex flex-col items-center justify-center py-12 text-center',
				className
			)}
		>
			{icon && (
				<div
					data-slot="empty-state-icon"
					className="mb-4 text-muted-foreground [&>svg]:size-12"
				>
					{icon}
				</div>
			)}
			<h3
				data-slot="empty-state-title"
				className="font-semibold text-foreground text-lg"
			>
				{title}
			</h3>
			{description && (
				<p
					data-slot="empty-state-description"
					className="mt-1 max-w-sm text-muted-foreground text-sm"
				>
					{description}
				</p>
			)}
			{action && (
				<div data-slot="empty-state-action" className="mt-4">
					{action}
				</div>
			)}
		</div>
	);
}

export { EmptyState };
export type { EmptyStateProps };
