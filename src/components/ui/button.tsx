import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'default', 
  size = 'default', 
  className = '',
  children,
  ...props 
}) => {
  const baseStyles = "font-medium rounded-md focus:outline-none transition-colors"
  const variantStyles = {
    default: "bg-purple-600 hover:bg-purple-700 text-white",
    outline: "bg-transparent border border-current hover:bg-zinc-100 dark:hover:bg-zinc-800 text-current",
    ghost: "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-current",
  }
  const sizeStyles = {
    default: "py-2 px-4 text-sm",
    sm: "py-1 px-3 text-xs",
    lg: "py-3 px-6 text-base",
  }
  
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`
  
  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  )
}