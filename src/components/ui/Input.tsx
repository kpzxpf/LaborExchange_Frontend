import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className, required, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-foreground/70 mb-1">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <input
                    ref={ref}
                    required={required}
                    className={cn(
                        'w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60',
                        'transition-colors duration-200',
                        'placeholder:text-foreground/40',
                        error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
