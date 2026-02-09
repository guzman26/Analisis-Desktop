import React, { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, Loader2, RotateCw } from 'lucide-react';

import { useDebouncedUpdate } from '@/hooks/useDebouncedUpdate';
import { cn } from '@/lib/utils';
import { Input } from './input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

export type EditableCellType = 'text' | 'email' | 'tel' | 'select';

export interface EditableCellProps {
  value: string;
  onUpdate: (newValue: string) => Promise<void>;
  type?: EditableCellType;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  validate?: (value: string) => string | null;
  className?: string;
  disabled?: boolean;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value: initialValue,
  onUpdate,
  type = 'text',
  options,
  placeholder,
  validate,
  className,
  disabled = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(initialValue || '');

  const inputRef = useRef<HTMLInputElement>(null);
  const selectTriggerRef = useRef<HTMLButtonElement>(null);

  const { value, setValue, state, error, retry } = useDebouncedUpdate(
    initialValue,
    {
      delay: 500,
      onUpdate: async (newValue) => {
        if (validate) {
          const validationError = validate(newValue);
          if (validationError) {
            throw new Error(validationError);
          }
        }
        await onUpdate(newValue);
      },
      onError: (updateError) => {
        console.error('Error updating cell:', updateError);
      },
    }
  );

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  useEffect(() => {
    if (!isEditing && initialValue !== value) {
      setLocalValue(initialValue || '');
    }
  }, [initialValue, isEditing, value]);

  useEffect(() => {
    if (!isEditing) return;

    if (type === 'select') {
      const timeoutId = setTimeout(() => {
        selectTriggerRef.current?.focus();
      }, 0);
      return () => clearTimeout(timeoutId);
    }

    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isEditing, type]);

  const getInputType = () => {
    switch (type) {
      case 'email':
        return 'email';
      case 'tel':
        return 'tel';
      default:
        return 'text';
    }
  };

  const startEditing = () => {
    if (disabled) return;
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setLocalValue(value || '');
    setIsEditing(false);
  };

  const commitEditing = () => {
    setIsEditing(false);
    if (localValue !== value) {
      setValue(localValue);
      return;
    }
    if (state === 'error') {
      setLocalValue(value || '');
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitEditing();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditing();
    }
  };

  const handleSelectKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditing();
    }
  };

  const handleSelectChange = (newValue: string) => {
    setLocalValue(newValue);
    setValue(newValue);
    setIsEditing(false);
  };

  const selectedOptionLabel =
    type === 'select' && options
      ? options.find((option) => option.value === value)?.label || value
      : value;

  const renderStatusIndicator = () => {
    if (state === 'pending' || state === 'saving') {
      return (
        <Loader2
          className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground"
          aria-label="Guardando"
        />
      );
    }

    if (state === 'saved') {
      return (
        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-label="Guardado" />
      );
    }

    if (state === 'error') {
      return (
        <div className="flex items-center gap-1">
          <AlertCircle
            className="h-3.5 w-3.5 shrink-0 text-destructive"
            aria-label={error?.message || 'Error'}
          />
          <button
            type="button"
            className="rounded-sm p-0.5 text-destructive transition-colors hover:bg-destructive/10"
            onClick={(event) => {
              event.stopPropagation();
              retry();
            }}
            title="Reintentar"
            aria-label="Reintentar"
          >
            <RotateCw className="h-3 w-3" />
          </button>
        </div>
      );
    }

    return null;
  };

  const stateClasses = cn({
    'border-primary/40 bg-primary/5': state === 'pending' || state === 'saving',
    'border-emerald-300 bg-emerald-50/60': state === 'saved',
    'border-destructive/40 bg-destructive/5': state === 'error',
  });

  if (disabled) {
    return (
      <div
        className={cn(
          'flex min-h-8 items-center rounded-md border border-transparent px-2 py-1 text-sm text-muted-foreground opacity-70',
          className
        )}
      >
        {selectedOptionLabel || placeholder || '-'}
      </div>
    );
  }

  if (isEditing && type === 'select' && options) {
    return (
      <div
        className={cn(
          'flex min-h-8 items-center gap-2 rounded-md border bg-background px-2 py-1',
          stateClasses,
          className
        )}
      >
        <Select
          value={localValue}
          onValueChange={handleSelectChange}
          onOpenChange={(open) => {
            if (!open) {
              setIsEditing(false);
            }
          }}
        >
          <SelectTrigger
            ref={selectTriggerRef}
            className="h-7 w-full border-0 px-0 py-0 text-sm shadow-none focus:ring-0 focus:ring-offset-0"
            onKeyDown={handleSelectKeyDown}
          >
            <SelectValue placeholder={placeholder || '-'} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {renderStatusIndicator()}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div
        className={cn(
          'flex min-h-8 items-center gap-2 rounded-md border bg-background px-2 py-1 shadow-sm',
          stateClasses,
          className
        )}
      >
        <Input
          ref={inputRef}
          type={getInputType()}
          value={localValue}
          onChange={(event) => setLocalValue(event.target.value)}
          onBlur={commitEditing}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          className="h-7 border-0 px-0 py-0 text-sm shadow-none focus-visible:ring-0"
        />
        {renderStatusIndicator()}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group flex min-h-8 cursor-pointer items-center gap-2 rounded-md border border-transparent px-2 py-1 transition-colors hover:border-border hover:bg-muted/40',
        stateClasses,
        className
      )}
      onClick={startEditing}
      title={error?.message || 'Click para editar'}
    >
      <span className="min-w-0 flex-1 truncate text-sm">
        {selectedOptionLabel || (
          <span className="text-muted-foreground italic">{placeholder || '-'}</span>
        )}
      </span>
      {renderStatusIndicator()}
    </div>
  );
};

export default EditableCell;
