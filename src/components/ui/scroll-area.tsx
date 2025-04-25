import * as React from "react"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: string;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({ 
  children,
  className = '',
  maxHeight = "400px",
  ...props
}) => {
  return (
    <div
      className={`relative overflow-auto ${className}`}
      style={{ maxHeight }}
      {...props}
    >
      {children}
    </div>
  )
}