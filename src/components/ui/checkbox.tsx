'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, defaultChecked, onChange, onCheckedChange, id, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(
      defaultChecked ?? false
    );
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalChecked(e.target.checked);
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <div className="relative inline-flex items-center">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          className="sr-only"
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            'flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-primary shadow transition-colors',
            'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            isChecked
              ? 'bg-primary text-primary-foreground'
              : 'bg-background hover:bg-accent',
            props.disabled && 'cursor-not-allowed opacity-50',
            className
          )}
          aria-hidden="true"
        >
          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
        </label>
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
