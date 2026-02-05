import * as React from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';
import { Input } from './input';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

// Re-export form components for convenience
export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage };

// Reusable form input component
interface FormInputProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  placeholder?: string;
  type?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function FormInput<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  description,
  disabled,
  className,
}: FormInputProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input type={type} placeholder={placeholder} disabled={disabled} {...field} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Reusable form textarea component
interface FormTextareaProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export function FormTextarea<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  disabled,
  rows = 3,
  className,
}: FormTextareaProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Textarea placeholder={placeholder} disabled={disabled} rows={rows} {...field} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Reusable form select component
interface FormSelectProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  options: Array<{ value: string; label: string }>;
  className?: string;
}

export function FormSelect<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  placeholder = 'Select an option',
  description,
  disabled,
  options,
  className,
}: FormSelectProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Reusable form number input component
interface FormNumberInputProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function FormNumberInput<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  disabled,
  min,
  max,
  step = 1,
  className,
}: FormNumberInputProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input
              type="number"
              placeholder={placeholder}
              disabled={disabled}
              min={min}
              max={max}
              step={step}
              {...field}
              value={field.value ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                // Convert to number, or set to undefined if empty
                field.onChange(value === '' ? undefined : Number(value));
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
