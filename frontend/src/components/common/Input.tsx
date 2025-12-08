import React, { forwardRef, InputHTMLAttributes, useId } from 'react';
import { AlertCircle } from 'lucide-react';

// ==========================================
// TIPOS
// ==========================================

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

interface TextAreaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  rows?: number;
}

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string | number; label: string }>;
}

// ==========================================
// INPUT COMPONENT
// ==========================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = '', id: providedId, ...props }, ref) => {
    // Gera ID único para acessibilidade
    const generatedId = useId();
    const inputId = providedId || generatedId;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1" aria-label="obrigatório">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? errorId : hint ? hintId : undefined
            }
            className={`
              w-full px-4 py-2.5 border rounded-lg transition-all
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon || error ? 'pr-10' : ''}
              ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
              ${className}
            `}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && !error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true">
              {rightIcon}
            </div>
          )}

          {/* Error Icon */}
          {error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" aria-hidden="true">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Hint */}
        {hint && !error && (
          <p id={hintId} className="text-xs text-gray-500 mt-1.5">
            {hint}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p id={errorId} className="text-xs text-red-600 mt-1.5 flex items-center space-x-1" role="alert">
            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ==========================================
// TEXTAREA COMPONENT
// ==========================================

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, hint, rows = 4, className = '', id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = providedId || generatedId;
    const hintId = `${textareaId}-hint`;
    const errorId = `${textareaId}-error`;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1" aria-label="obrigatório">*</span>}
          </label>
        )}

        {/* TextArea */}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? errorId : hint ? hintId : undefined
          }
          className={`
            w-full px-4 py-2.5 border rounded-lg transition-all
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
            disabled:bg-gray-100 disabled:cursor-not-allowed
            resize-none
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        />

        {/* Hint */}
        {hint && !error && (
          <p id={hintId} className="text-xs text-gray-500 mt-1.5">
            {hint}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p id={errorId} className="text-xs text-red-600 mt-1.5 flex items-center space-x-1" role="alert">
            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

// ==========================================
// SELECT COMPONENT
// ==========================================

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, className = '', id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const selectId = providedId || generatedId;
    const hintId = `${selectId}-hint`;
    const errorId = `${selectId}-error`;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label 
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1" aria-label="obrigatório">*</span>}
          </label>
        )}

        {/* Select */}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? errorId : hint ? hintId : undefined
          }
          className={`
            w-full px-4 py-2.5 border rounded-lg transition-all
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Hint */}
        {hint && !error && (
          <p id={hintId} className="text-xs text-gray-500 mt-1.5">
            {hint}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p id={errorId} className="text-xs text-red-600 mt-1.5 flex items-center space-x-1" role="alert">
            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// ==========================================
// INPUT COM MÁSCARA DE PREÇO
// ==========================================

interface PriceInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value: number | string;
  onChange: (value: number) => void;
}

export const PriceInput = forwardRef<HTMLInputElement, PriceInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const numbers = e.target.value.replace(/\D/g, '');
      const numValue = parseInt(numbers || '0') / 100;
      onChange(numValue);
    };

    const displayValue = typeof value === 'number' 
      ? value.toFixed(2).replace('.', ',')
      : '0,00';

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={`R$ ${displayValue}`}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

PriceInput.displayName = 'PriceInput';

// ==========================================
// INPUT COM MÁSCARA DE DOCUMENTO
// ==========================================

interface DocumentInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export const DocumentInput = forwardRef<HTMLInputElement, DocumentInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const numbers = e.target.value.replace(/\D/g, '');
      onChange(numbers);
    };

    const formatDocument = (doc: string): string => {
      const numbers = doc.replace(/\D/g, '');
      
      if (numbers.length <= 11) {
        return numbers
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      } else {
        return numbers
          .replace(/(\d{2})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1/$2')
          .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
      }
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={formatDocument(value)}
        onChange={handleChange}
        maxLength={18}
        placeholder="CPF ou CNPJ"
        {...props}
      />
    );
  }
);

DocumentInput.displayName = 'DocumentInput';