import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'secondary';
}

export const Badge: React.FC<BadgeProps> = ({
  className = '',
  variant = 'default',
  children,
  ...props
}) => {
  const variantClasses = {
    default: "bg-purple-600 text-white hover:bg-purple-700",
    outline: "border border-zinc-700 text-zinc-300 hover:border-zinc-600",
    secondary: "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
  };
  
  return (
    <div
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};