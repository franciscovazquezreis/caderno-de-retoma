import { HTMLAttributes, forwardRef } from 'react';
import { cn } from './Button';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-zinc-200 bg-white/50 backdrop-blur-xl shadow-sm transition-all duration-300',
        'dark:border-zinc-800/50 dark:bg-zinc-900/50',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';
