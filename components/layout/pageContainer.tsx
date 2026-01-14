import { cn } from '@/lib/utils/cn';

interface PageContainerProps {
	children: React.ReactNode;
	className?: string;
}

export const PageContainer = ({ children, className }: PageContainerProps) => {
	return <div className={cn('p-4 md:p-6', className)}>{children}</div>;
};
