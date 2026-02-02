import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <div className="w-full">
                <input
                    ref={ref}
                    className={cn(
                        'input-primary w-full',
                        error && 'ring-2 ring-red-500',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-red-400 text-sm mt-1">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';