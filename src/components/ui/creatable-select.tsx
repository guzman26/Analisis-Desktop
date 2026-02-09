import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Input } from './input';
import { cn } from '@/lib/utils';

export interface CreatableSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  onCreate: (label: string) => Promise<void>;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export function CreatableSelect({
  options,
  value,
  onChange,
  onCreate,
  placeholder = 'Seleccionar...',
  isLoading = false,
  disabled = false,
}: CreatableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [creating, setCreating] = React.useState(false);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return options;
    const lower = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower));
  }, [options, search]);

  const exactMatch = React.useMemo(
    () =>
      options.some(
        (o) => o.label.toLowerCase() === search.trim().toLowerCase()
      ),
    [options, search]
  );

  const handleSelect = (label: string) => {
    onChange(label);
    setSearch('');
    setOpen(false);
  };

  const handleCreate = async () => {
    if (!search.trim() || creating) return;
    setCreating(true);
    try {
      await onCreate(search.trim());
      onChange(search.trim());
      setSearch('');
      setOpen(false);
    } catch (err) {
      console.error('Error creating option:', err);
    } finally {
      setCreating(false);
    }
  };

  const displayValue =
    value || '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            !value && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          <span className="truncate">
            {displayValue || placeholder}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-2 shrink-0 opacity-50"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <div className="p-2">
          <Input
            placeholder="Buscar o crear..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (filtered.length > 0) {
                  handleSelect(filtered[0].label);
                } else if (!exactMatch && search.trim()) {
                  void handleCreate();
                }
              }
            }}
            autoFocus
          />
        </div>

        <div className="max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Cargando...
            </div>
          ) : (
            <>
              {filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'flex w-full items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground',
                    option.label === value && 'bg-accent'
                  )}
                  onClick={() => handleSelect(option.label)}
                >
                  {option.label}
                </button>
              ))}

              {!exactMatch && search.trim() && (
                <button
                  type="button"
                  className="flex w-full items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground text-primary font-medium border-t"
                  onClick={() => void handleCreate()}
                  disabled={creating}
                >
                  {creating ? 'Creando...' : `+ Agregar "${search.trim()}"`}
                </button>
              )}

              {filtered.length === 0 && !search.trim() && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Sin opciones disponibles
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
