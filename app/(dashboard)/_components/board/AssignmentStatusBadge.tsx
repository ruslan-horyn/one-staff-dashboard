'use client';

import { Badge } from '@/components/ui/badge';
import type { AssignmentStatus } from '@/types/common';

interface AssignmentStatusBadgeProps {
	status: AssignmentStatus;
}

const STATUS_CONFIG: Record<
	AssignmentStatus,
	{
		label: string;
		className: string;
		variant: 'default' | 'secondary' | 'destructive' | 'outline';
	}
> = {
	scheduled: {
		label: 'Scheduled',
		variant: 'outline',
		className: 'border-yellow-400 text-yellow-700 dark:text-yellow-400',
	},
	active: {
		label: 'Active',
		variant: 'default',
		className: '',
	},
	completed: {
		label: 'Completed',
		variant: 'outline',
		className: 'border-green-500 text-green-700 dark:text-green-400',
	},
	cancelled: {
		label: 'Cancelled',
		variant: 'secondary',
		className: '',
	},
};

export const AssignmentStatusBadge = ({
	status,
}: AssignmentStatusBadgeProps) => {
	const config = STATUS_CONFIG[status];

	return (
		<Badge variant={config.variant} className={config.className}>
			{config.label}
		</Badge>
	);
};
