'use client';

import { XIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PositionFormInlineProps {
	initialValue?: string;
	onSave: (name: string) => Promise<void>;
	onCancel: () => void;
	isPending?: boolean;
	placeholder?: string;
}

export const PositionFormInline = ({
	initialValue = '',
	onSave,
	onCancel,
	isPending = false,
	placeholder = 'Position name',
}: PositionFormInlineProps) => {
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
		if (initialValue && inputRef.current) {
			inputRef.current.setSelectionRange(
				initialValue.length,
				initialValue.length
			);
		}
	}, [initialValue]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const name = inputRef.current?.value.trim() ?? '';
		if (name) {
			await onSave(name);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Escape') {
			onCancel();
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex gap-2">
			<Input
				ref={inputRef}
				type="text"
				defaultValue={initialValue}
				placeholder={placeholder}
				disabled={isPending}
				onKeyDown={handleKeyDown}
				className="flex-1"
				autoComplete="off"
			/>
			<Button type="submit" disabled={isPending} size="sm">
				{isPending ? 'Saving...' : 'Save'}
			</Button>
			<Button
				type="button"
				variant="outline"
				size="icon-sm"
				onClick={onCancel}
				disabled={isPending}
				aria-label="Cancel"
			>
				<XIcon className="size-4" aria-hidden="true" />
			</Button>
		</form>
	);
};
