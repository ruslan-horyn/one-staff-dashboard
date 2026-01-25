import { CheckCircle2 } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';

interface SuccessAlertProps {
	message: string;
}

export const SuccessAlert = ({ message }: SuccessAlertProps) => {
	return (
		<Alert className="border-green-500 bg-green-50 text-green-900 dark:border-green-500 dark:bg-green-950 dark:text-green-100">
			<CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
			<AlertDescription>{message}</AlertDescription>
		</Alert>
	);
};
