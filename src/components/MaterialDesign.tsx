import { ReactNode } from 'react';

interface MaterialSurfaceProps {
  children: ReactNode;
  elevation?: 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16 | 24;
  className?: string;
  variant?: 'primary' | 'secondary' | 'surface' | 'surface-variant';
  onClick?: () => void;
}

export function MaterialSurface({ 
  children, 
  elevation = 1, 
  className = '', 
  variant = 'surface',
  onClick 
}: MaterialSurfaceProps) {
  const elevationClass = `elevation-${elevation}`;
  const variantClass = variant === 'surface' ? 'surface' : variant === 'surface-variant' ? 'surface-variant' : '';
  
  return (
    <div 
      className={`
        ${elevationClass} 
        ${variantClass}
        transition-elevation 
        ${onClick ? 'cursor-pointer hover:elevation-4' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface MaterialCardProps {
  children: ReactNode;
  className?: string;
  outlined?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export function MaterialCard({ 
  children, 
  className = '', 
  outlined = false, 
  clickable = false,
  onClick 
}: MaterialCardProps) {
  return (
    <MaterialSurface
      elevation={outlined ? 0 : clickable ? 2 : 1}
      className={`
        rounded-lg p-4
        ${outlined ? 'border border-divider' : ''}
        ${clickable ? 'hover:elevation-4 cursor-pointer transition-material' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </MaterialSurface>
  );
}

interface MaterialButtonProps {
  children: ReactNode;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function MaterialButton({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  onClick,
  type = 'button'
}: MaterialButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded transition-material focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };
  
  const variantClasses = {
    contained: {
      primary: 'bg-primary text-on-primary elevation-2 hover:elevation-4 focus:ring-primary',
      secondary: 'bg-secondary text-on-secondary elevation-2 hover:elevation-4 focus:ring-secondary',
      error: 'bg-error text-on-error elevation-2 hover:elevation-4 focus:ring-error'
    },
    outlined: {
      primary: 'border border-primary text-primary hover:bg-primary/10 focus:ring-primary',
      secondary: 'border border-secondary text-secondary hover:bg-secondary/10 focus:ring-secondary',
      error: 'border border-error text-error hover:bg-error/10 focus:ring-error'
    },
    text: {
      primary: 'text-primary hover:bg-primary/10 focus:ring-primary',
      secondary: 'text-secondary hover:bg-secondary/10 focus:ring-secondary',
      error: 'text-error hover:bg-error/10 focus:ring-error'
    }
  };
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : '';

  return (
    <button
      type={type}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant][color]}
        ${disabledClasses}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

interface MaterialFabProps {
  children: ReactNode;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary';
  className?: string;
  onClick?: () => void;
}

export function MaterialFab({
  children,
  size = 'medium',
  color = 'primary',
  className = '',
  onClick
}: MaterialFabProps) {
  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-14 h-14',
    large: 'w-16 h-16'
  };
  
  const colorClasses = {
    primary: 'bg-primary text-on-primary hover:bg-primary-variant',
    secondary: 'bg-secondary text-on-secondary hover:bg-secondary-variant'
  };

  return (
    <button
      className={`
        ${sizeClasses[size]}
        ${colorClasses[color]}
        rounded-full
        elevation-6
        hover:elevation-8
        transition-material
        inline-flex items-center justify-center
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

interface MaterialTextFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  variant?: 'filled' | 'outlined';
  className?: string;
  type?: string;
}

export function MaterialTextField({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  variant = 'outlined',
  className = '',
  type = 'text'
}: MaterialTextFieldProps) {
  const inputClasses = variant === 'outlined'
    ? 'border border-border rounded focus:border-primary focus:ring-1 focus:ring-primary bg-transparent'
    : 'bg-muted border-0 border-b-2 border-border focus:border-primary rounded-t';

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-on-surface">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-3 py-2
          ${inputClasses}
          transition-material
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-error focus:border-error focus:ring-error' : ''}
        `}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
}

interface MaterialAppBarProps {
  children: ReactNode;
  position?: 'fixed' | 'sticky' | 'static';
  color?: 'primary' | 'secondary' | 'surface';
  className?: string;
}

export function MaterialAppBar({
  children,
  position = 'static',
  color = 'primary',
  className = ''
}: MaterialAppBarProps) {
  const positionClasses = {
    fixed: 'fixed top-0 left-0 right-0 z-50',
    sticky: 'sticky top-0 z-40',
    static: 'relative'
  };
  
  const colorClasses = {
    primary: 'bg-primary text-on-primary',
    secondary: 'bg-secondary text-on-secondary',
    surface: 'bg-surface text-on-surface'
  };

  return (
    <header
      className={`
        ${positionClasses[position]}
        ${colorClasses[color]}
        elevation-4
        ${className}
      `}
    >
      <div className="container mx-auto px-4 h-16 flex items-center">
        {children}
      </div>
    </header>
  );
}