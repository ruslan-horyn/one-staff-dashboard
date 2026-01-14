interface PageHeaderProps {
	title: string;
	description?: string;
	actions?: React.ReactNode;
}

export const PageHeader = ({
	title,
	description,
	actions,
}: PageHeaderProps) => {
	return (
		<div className="flex flex-col gap-2 pb-4 md:flex-row md:items-center md:justify-between md:pb-6">
			<div className="space-y-1">
				<h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
				{description && (
					<p className="text-muted-foreground text-sm">{description}</p>
				)}
			</div>
			{actions && <div className="flex items-center gap-2">{actions}</div>}
		</div>
	);
};
