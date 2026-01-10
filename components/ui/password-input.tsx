'use client';

import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PasswordInputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
	({ className, ...props }, ref) => {
		const [showPassword, setShowPassword] = useState(false);

		return (
			<div className="relative">
				<Input
					type={showPassword ? 'text' : 'password'}
					className={cn('pr-10', className)}
					ref={ref}
					{...props}
				/>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
					onClick={() => setShowPassword((prev) => !prev)}
					aria-label={showPassword ? 'Hide password' : 'Show password'}
				>
					{showPassword ? (
						<EyeOff
							className="h-4 w-4 text-muted-foreground"
							aria-hidden="true"
						/>
					) : (
						<Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
					)}
				</Button>
			</div>
		);
	}
);

PasswordInput.displayName = 'PasswordInput';
