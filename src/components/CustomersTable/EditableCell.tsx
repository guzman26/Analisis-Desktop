import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useDebouncedUpdate } from '@/hooks/useDebouncedUpdate';
import './EditableCell.css';

export type EditableCellType = 'text' | 'email' | 'tel' | 'select';

export interface EditableCellProps {
  value: string;
  onUpdate: (newValue: string) => Promise<void>;
  type?: EditableCellType;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  validate?: (value: string) => string | null; // Retorna mensaje de error o null si es válido
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
  className = '',
  disabled = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(initialValue || '');
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  const {
    value,
    setValue,
    state,
    error,
    retry,
  } = useDebouncedUpdate(initialValue, {
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
    onError: (err) => {
      console.error('Error updating cell:', err);
    },
  });

  // Sincronizar valor local cuando cambia el valor del hook
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  // Sincronizar cuando cambia el valor inicial externamente
  useEffect(() => {
    if (!isEditing && initialValue !== value) {
      setLocalValue(initialValue || '');
    }
  }, [initialValue, isEditing, value]);

  // Auto-focus cuando entra en modo edición
  useEffect(() => {
    if (isEditing && inputRef.current) {
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.focus();
        inputRef.current.select();
      } else if (inputRef.current instanceof HTMLSelectElement) {
        inputRef.current.focus();
      }
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!disabled) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Si el valor cambió, actualizarlo
    if (localValue !== value) {
      setValue(localValue);
    } else {
      // Si no cambió pero hay un error, resetear
      if (state === 'error') {
        setLocalValue(value);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setLocalValue(value); // Revertir cambios
      setIsEditing(false);
    }
  };

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    if (type === 'select') {
      // Para select, actualizar inmediatamente
      setValue(newValue);
    }
  };

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

  const getStateClass = () => {
    switch (state) {
      case 'pending':
        return 'editable-cell-pending';
      case 'saving':
        return 'editable-cell-saving';
      case 'saved':
        return 'editable-cell-saved';
      case 'error':
        return 'editable-cell-error';
      default:
        return '';
    }
  };

  const renderStateIndicator = () => {
    if (state === 'saving' || state === 'pending') {
      return (
        <span className="editable-cell-indicator saving" title="Guardando...">
          <span className="spinner"></span>
        </span>
      );
    }
    if (state === 'saved') {
      return (
        <span className="editable-cell-indicator saved" title="Guardado">
          ✓
        </span>
      );
    }
    if (state === 'error') {
      return (
        <span className="editable-cell-indicator error" title={error?.message || 'Error'}>
          ⚠
        </span>
      );
    }
    return null;
  };

  if (disabled) {
    return (
      <div className={`editable-cell disabled ${className}`}>
        <span>{value || placeholder || '-'}</span>
      </div>
    );
  }

  if (isEditing && type === 'select' && options) {
    return (
      <div className={`editable-cell editing ${getStateClass()} ${className}`}>
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="editable-cell-input"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {renderStateIndicator()}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className={`editable-cell editing ${getStateClass()} ${className}`}>
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={getInputType()}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="editable-cell-input"
        />
        {renderStateIndicator()}
        {state === 'error' && (
          <button
            className="editable-cell-retry"
            onClick={retry}
            title="Reintentar"
          >
            ↻
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`editable-cell ${getStateClass()} ${className}`}
      onClick={handleClick}
      title={error ? error.message : state === 'saved' ? 'Guardado' : 'Click para editar'}
    >
      <span className="editable-cell-value">
        {value || <span className="editable-cell-placeholder">{placeholder || '-'}</span>}
      </span>
      {renderStateIndicator()}
    </div>
  );
};

export default EditableCell;

